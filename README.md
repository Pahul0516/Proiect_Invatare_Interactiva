# România Interactivă - Aplicație Educațională de Geografie

**România Interactivă** este o aplicație web și mobilă interactivă dezvoltată în cadrul proiectului de învățare interactivă. Aplicația folosește tehnologii web moderne și inteligență artificială pentru a oferi utilizatorilor (atât copii, cât și adulți) o metodă interactivă și distractivă (gamificată) de a explora geografia, istoria și cultura județelor din România.

---

## 🚀 Caracteristici Cheie

1. **Hartă Vectorială Interactivă**: 
   * Construită folosind [react-simple-maps](https://www.react-simple-maps.com/) și date geografice din [src/data/romania-counties.json](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/data/romania-counties.json).
   * Permite selectarea vizuală a județelor și oferă zoom dinamic la intrarea în modul de aventură.

2. **Ghid Virtual Personalizat (Adaptiv)**:
   * **Modul Copii**: Ghidat de „Ghiță Ghidul”, un avatar prietenos care folosește un limbaj simplu, entuziast și amuzant.
   * **Modul Adulți**: Ghidat de „Consilierul Virtual”, oferind un ton formal, bine structurat și axat pe detalii istorice și geografice precise.

3. **Integrare Inteligență Artificială (LLM)**:
   * Conectare cu API-ul OpenAI (model `gpt-4o-mini`) prin intermediul [llmService.ts](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/services/llmService.ts).
   * Generează dinamic povești educative despre istoria, cultura și reperele fiecărui județ.
   * Generează quiz-uri unice de 10 întrebări, adaptate la textul poveștii deblocat anterior.
   * *Sistem de Fallback*: În absența unei chei API, sistemul trece automat pe date presetate pentru a asigura o funcționare continuă offline.

4. **Sistem Meteo în Timp Real**:
   * Interfațează cu API-ul gratuit și fără cheie [Open-Meteo](https://open-meteo.com/) în [weatherService.ts](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/services/weatherService.ts).
   * Afișează condițiile meteorologice curente din reședința de județ selectată și le integrează contextual în povestea generată de AI.

5. **Gamification (Sistem de XP și Ranks)**:
   * Utilizatorii primesc puncte de experiență (XP) pentru finalizarea quiz-urilor.
   * Avansare în ranguri (de la *Explorator Începător* la *Legendă a României*).
   * Feedback vizual pe hartă: județele sunt colorate pe baza succesului la quiz-uri (**Verde** pentru rezultate excelente, **Galben** pentru medii, **Roșu** pentru rezultate slabe).

6. **Efecte Audio și Voice Over (TTS)**:
   * **Text-to-Speech (TTS)**: Citirea poveștilor cu ajutorul Web Speech API ([ttsService.ts](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/services/ttsService.ts)), cu ajustări automate de viteză și tonalitate în funcție de profil (copil/adult).
   * **Sunete procedurale**: Syntheze audio directe prin Web Audio API ([soundService.ts](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/services/soundService.ts)), eliminând dependența de fișiere audio externe.

7. **Logică de Geolocație**:
   * Detectează automat județul în care se află fizic utilizatorul prin Geolocation API.
   * Trimite notificări tip toast la detectarea intrării într-un județ nou și deblochează quiz-uri speciale.

---

## 🛠️ Structura Proiectului

* 📁 [src/components/](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/components) — Componentele vizuale ale aplicației:
  * [Map.tsx](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/components/Map.tsx) — Harta României cu suport de zoom, selecție și markere.
  * [StoryPanel.tsx](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/components/StoryPanel.tsx) — Panoul ce afișează povestea generată și controlează redarea audio TTS.
  * [QuizPanel.tsx](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/components/QuizPanel.tsx) — Interfața interactivă de quiz cu cronometru și feedback.
  * [ResultPanel.tsx](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/components/ResultPanel.tsx) — Rezultatul testului, XP-ul primit și actualizarea stării județului.
  * [XPDisplay.tsx](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/components/XPDisplay.tsx) & [AvatarDisplay.tsx](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/components/AvatarDisplay.tsx) — Elemente de interfață pentru gamification.
* 📁 [src/services/](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/services) — Modulele de servicii și integrări API:
  * [llmService.ts](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/services/llmService.ts) — Managementul prompturilor și conexiunea cu OpenAI.
  * [weatherService.ts](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/services/weatherService.ts) — Preluarea datelor meteo și maparea capitalelor de județ.
  * [ttsService.ts](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/services/ttsService.ts) — Serviciu de sinteză vocală adaptivă.
  * [soundService.ts](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/services/soundService.ts) — Generator de efecte sonore prin Web Audio API.
* 📁 [src/context/](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/context) — Starea globală a aplicației:
  * [AppContext.tsx](file:///Users/esteradaria/PycharmProjects/Proiect_Invatare_Interactiva/src/context/AppContext.tsx) — Stochează XP-ul, rangul actual, istoricul de vizitare, stările și culorile județelor.

---

## ⚙️ Configurare și Rulare

### 1. Instalarea Dependențelor
Asigurați-vă că aveți [Node.js](https://nodejs.org/) instalat, apoi rulați:
```bash
npm install
```

### 2. Configurarea Variabilelor de Mediu
Creați un fișier `.env` în rădăcina proiectului și adăugați cheia dumneavoastră API OpenAI:
```env
VITE_OPENAI_API_KEY=cheia_ta_openai_aici
```

### 3. Pornirea Serverului de Development
Pentru a rula proiectul local cu reîncărcare rapidă în browser:
```bash
npm run dev
```

### 4. Rularea Testelor
Aplicația vine configurată cu două tipuri de teste:
* **Teste Unitare** (Vitest):
  ```bash
  npm run test.unit
  ```
* **Teste End-to-End (E2E)** (Cypress):
  ```bash
  npm run test.e2e
  ```

### 5. Compilarea Aplicației (Build)
Pentru a genera build-ul optimizat de producție:
```bash
npm run build
```
Pentru a distribui pe platforme mobile (Android/iOS) prin Capacitor, utilizați comenzile Capacitor specifice:
```bash
npx cap sync
npx cap open android
npx cap open ios
```

---

## 📚 Tehnologii Utilizate

* **Core**: React 18, TypeScript, Vite
* **UI**: Ionic React (componente web native de mobil)
* **Grafică / Hărți**: D3-geo, React Simple Maps, TopoJSON
* **Inteligență Artificială**: OpenAI API (GPT-4o-mini)
* **Date Externe**: Open-Meteo API
* **Web Native**: Web Audio API, Web Speech API (Sinteză Vocală), Geolocation API
