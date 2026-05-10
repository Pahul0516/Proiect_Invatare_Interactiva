import { AvatarMode, QuizQuestion } from "../context/AppContext";
import { getWeatherForCounty, WeatherInfo, getCapitalName } from "./weatherService";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const OPENAI_MODEL = "gpt-4o-mini";

function hasApiKey(): boolean {
    return !!OPENAI_API_KEY && OPENAI_API_KEY !== "your_openai_api_key_here";
}

async function callOpenAI(messages: { role: string; content: string }[], temperature = 0.7): Promise<string> {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages,
            temperature,
            max_tokens: 2048,
        }),
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`OpenAI API error ${resp.status}: ${err}`);
    }
    const data = await resp.json();
    return data.choices[0].message.content;
}

function buildStoryPrompt(county: string, mode: AvatarMode, weather: WeatherInfo | null): { role: string; content: string }[] {
    const weatherCtx = weather
        ? `\nVremea curentă în ${weather.cityName}: ${weather.temp}°C, ${weather.description}.`
        : "";

    const systemMsg = mode === "child"
        ? `Ești "Ghiță Ghidul", un ghid virtual vesel și prietenos pentru copii (7-12 ani). Vorbești simplu, cu entuziasm. Menționezi repere locale și un fun fact. Incluzi și informația despre vreme dacă este disponibilă. Răspunzi DOAR în română. NU FOLOSI EMOJI-URI!!!`
        : `Ești un consilier virtual educațional pentru adulți. Prezinți informații structurate, precise, cu ton profesional dar accesibil. Menționezi repere geografice notabile, date istorice și un fun fact. Incluzi și informația despre vreme dacă este disponibilă. Răspunzi DOAR în română. NU FOLOSI EMOJI-URI!!!`;

    const userMsg = `Generează o poveste educativă despre județul ${county} din România.${weatherCtx}

Cerințe:
- Între 150-250 de cuvinte
- Include: istorie, geografie, tradiții, un fun fact surprinzător
- Menționează cel puțin 3 repere locale specifice (monumente, locuri naturale, clădiri)
- Dacă ai date meteo, integrează-le natural la început
- La final, listează 3-5 repere locale de vizitat
NU FOLOSI EMOJI-URI!!!`;

    return [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
    ];
}

// ─── Quiz generation ─────────────────────────────────────────
function buildQuizPrompt(county: string, storyText: string): { role: string; content: string }[] {
    const systemMsg = `Ești un generator de quiz-uri educaționale despre județele României. Generezi EXACT 10 întrebări cu răspunsuri multiple (4 opțiuni fiecare), bazate pe informații reale despre județul specificat. Răspunzi DOAR cu un JSON valid, fără text suplimentar, fără markdown, fără backticks.`;

    const userMsg = `Generează 10 întrebări despre județul ${county} din România.

Context din povestea anterioară: "${storyText.slice(0, 500)}"

NU FOLOSI EMOJI-URI!!!

Returnează un JSON array cu exact 10 de obiecte, fiecare având:
- "question": întrebarea în română
- "options": array cu exact 4 variante de răspuns
- "correctIndex": indexul (0-3) al răspunsului corect

Cerințe:
- Întrebările să fie variate: istorie, geografie, cultură, personalități, natură, tradiții
- Să fie factual corecte
- Dificultate medie
- DOAR JSON array, nimic altceva

Exemplu format:
[{"question":"...","options":["A","B","C","D"],"correctIndex":1}]`;

    return [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
    ];
}

function parseQuizJSON(raw: string): QuizQuestion[] | null {
    try {
        // Strip markdown fences if present
        let cleaned = raw.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed) || parsed.length === 0) return null;
        // Validate structure
        for (const q of parsed) {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctIndex !== "number") {
                return null;
            }
        }
        return parsed as QuizQuestion[];
    } catch {
        return null;
    }
}

// ─── Fallback mock data ──────────────────────────────────────
function getFallbackStory(county: string, mode: AvatarMode): string {
    if (mode === "child") {
        return `Salut, prietene! Hai să descoperim județul ${county}! E un loc minunat din România, cu munți, câmpii sau dealuri frumoase. Oamenii de aici sunt foarte prietenoși și au obiceiuri interesante. Aici poți găsi castele vechi, biserici frumoase și locuri magice din natură! Știai că în fiecare județ din România poți găsi ceva special? Hai să aflăm mai multe!`;
    }
    return `${county} este un județ fascinant din România, cu o istorie bogată și tradiții unice. Așezat într-o zonă geografică diversă, acest județ a jucat un rol important în istoria țării. Zona este cunoscută pentru peisajele sale naturale spectaculoase, tradițiile locale bine păstrate și ospitalitatea oamenilor. Fun fact: Fiecare județ din România are cel puțin un obiectiv turistic de importanță națională!`;
}

function getFallbackQuiz(county: string): QuizQuestion[] {
    return [
        { question: `În ce țară se află județul ${county}?`, options: ["Ungaria", "Bulgaria", "România", "Moldova"], correctIndex: 2 },
        { question: "Câte județe are România?", options: ["39", "41", "42", "40"], correctIndex: 1 },
        { question: "Care este capitala României?", options: ["Cluj-Napoca", "Iași", "București", "Timișoara"], correctIndex: 2 },
        { question: "Ce formă de relief NU există în România?", options: ["Munți", "Câmpii", "Deșerturi", "Dealuri"], correctIndex: 2 },
        { question: "Ce lanț muntos traversează România?", options: ["Alpii", "Carpații", "Pirineii", "Uralii"], correctIndex: 1 },
        { question: "Ce mare se află la granița de est a României?", options: ["Marea Mediterană", "Marea Neagră", "Marea Baltică", "Marea Adriatică"], correctIndex: 1 },
        { question: "Ce râu important curge prin sudul României?", options: ["Rinul", "Volga", "Dunărea", "Tamisa"], correctIndex: 2 },
        { question: "Care este cel mai înalt vârf din România?", options: ["Vf. Omu", "Vf. Moldoveanu", "Vf. Negoiu", "Vf. Parângu"], correctIndex: 1 },
        { question: "Ce animal sălbatic este simbolul pădurilor românești?", options: ["Leul", "Ursul", "Tigrul", "Elefantul"], correctIndex: 1 },
        { question: "Ce regiune NU face parte din România?", options: ["Transilvania", "Moldova", "Muntenia", "Catalonia"], correctIndex: 3 },
    ];
}

// ─── Exported API ────────────────────────────────────────────

// Cache generated stories so quiz prompt can reference the story
let lastStoryText = "";

export async function getStoryForCounty(
    countyName: string,
    mode: AvatarMode
): Promise<{ story: string; weather: WeatherInfo | null }> {
    // Always fetch weather
    const weather = await getWeatherForCounty(countyName);

    if (hasApiKey()) {
        try {
            const messages = buildStoryPrompt(countyName, mode, weather);
            const story = await callOpenAI(messages, 0.8);
            lastStoryText = story;
            return { story, weather };
        } catch (err) {
            console.warn("OpenAI story generation failed, using fallback:", err);
        }
    }

    // Fallback: build story from static text + weather
    let fallback = "";
    if (weather) {
        const city = getCapitalName(countyName);
        if (mode === "child") {
            fallback += `${weather.icon} Acum în ${city} sunt ${weather.temp}°C și este ${weather.description}! `;
        } else {
            fallback += `Condițiile meteo curente în ${city}: ${weather.temp}°C, ${weather.description}. `;
        }
    }
    fallback += getFallbackStory(countyName, mode);
    lastStoryText = fallback;
    return { story: fallback, weather };
}

export async function getQuizForCounty(countyName: string): Promise<QuizQuestion[]> {
    if (hasApiKey()) {
        try {
            const messages = buildQuizPrompt(countyName, lastStoryText);
            const raw = await callOpenAI(messages, 0.5);
            const quiz = parseQuizJSON(raw);
            if (quiz && quiz.length >= 5) {
                // Ensure exactly 10 questions, pad with fallback if needed
                if (quiz.length < 10) {
                    const fallback = getFallbackQuiz(countyName);
                    return [...quiz, ...fallback.slice(0, 10 - quiz.length)];
                }
                return quiz.slice(0, 10);
            }
            console.warn("OpenAI returned invalid quiz format, using fallback");
        } catch (err) {
            console.warn("OpenAI quiz generation failed, using fallback:", err);
        }
    }

    return getFallbackQuiz(countyName);
}
