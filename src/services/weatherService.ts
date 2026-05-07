// County capitals with approximate coordinates for weather lookup
const COUNTY_CAPITALS: Record<string, { name: string; lat: number; lon: number }> = {
    "Alba": { name: "Alba Iulia", lat: 46.07, lon: 23.58 },
    "Arad": { name: "Arad", lat: 46.18, lon: 21.31 },
    "Argeș": { name: "Pitești", lat: 44.86, lon: 24.87 },
    "Bacău": { name: "Bacău", lat: 46.57, lon: 26.91 },
    "Bihor": { name: "Oradea", lat: 47.07, lon: 21.92 },
    "Bistrița-Năsăud": { name: "Bistrița", lat: 47.13, lon: 24.50 },
    "Botoșani": { name: "Botoșani", lat: 47.75, lon: 26.67 },
    "Brașov": { name: "Brașov", lat: 45.65, lon: 25.61 },
    "Brăila": { name: "Brăila", lat: 45.27, lon: 27.97 },
    "București": { name: "București", lat: 44.43, lon: 26.10 },
    "Buzău": { name: "Buzău", lat: 45.15, lon: 26.82 },
    "Caraș-Severin": { name: "Reșița", lat: 45.30, lon: 21.89 },
    "Călărași": { name: "Călărași", lat: 44.20, lon: 26.99 },
    "Cluj": { name: "Cluj-Napoca", lat: 46.77, lon: 23.60 },
    "Constanța": { name: "Constanța", lat: 44.17, lon: 28.64 },
    "Covasna": { name: "Sfântu Gheorghe", lat: 45.87, lon: 25.79 },
    "Dâmbovița": { name: "Târgoviște", lat: 44.92, lon: 25.46 },
    "Dolj": { name: "Craiova", lat: 44.32, lon: 23.79 },
    "Galați": { name: "Galați", lat: 45.43, lon: 28.05 },
    "Giurgiu": { name: "Giurgiu", lat: 43.90, lon: 25.97 },
    "Gorj": { name: "Târgu Jiu", lat: 45.04, lon: 23.27 },
    "Harghita": { name: "Miercurea Ciuc", lat: 46.36, lon: 25.80 },
    "Hunedoara": { name: "Deva", lat: 45.88, lon: 22.90 },
    "Ialomița": { name: "Slobozia", lat: 44.56, lon: 27.37 },
    "Iași": { name: "Iași", lat: 47.16, lon: 27.58 },
    "Ilfov": { name: "Buftea", lat: 44.57, lon: 25.95 },
    "Maramureș": { name: "Baia Mare", lat: 47.66, lon: 23.58 },
    "Mehedinți": { name: "Drobeta-Turnu Severin", lat: 44.63, lon: 22.66 },
    "Mureș": { name: "Târgu Mureș", lat: 46.55, lon: 24.56 },
    "Neamț": { name: "Piatra Neamț", lat: 46.93, lon: 26.37 },
    "Olt": { name: "Slatina", lat: 44.43, lon: 24.36 },
    "Prahova": { name: "Ploiești", lat: 44.94, lon: 26.03 },
    "Satu Mare": { name: "Satu Mare", lat: 47.79, lon: 22.89 },
    "Sălaj": { name: "Zalău", lat: 47.19, lon: 23.06 },
    "Sibiu": { name: "Sibiu", lat: 45.80, lon: 24.15 },
    "Suceava": { name: "Suceava", lat: 47.65, lon: 26.26 },
    "Teleorman": { name: "Alexandria", lat: 43.98, lon: 25.33 },
    "Timiș": { name: "Timișoara", lat: 45.76, lon: 21.23 },
    "Tulcea": { name: "Tulcea", lat: 45.18, lon: 28.80 },
    "Vaslui": { name: "Vaslui", lat: 46.64, lon: 27.73 },
    "Vâlcea": { name: "Râmnicu Vâlcea", lat: 45.10, lon: 24.37 },
    "Vrancea": { name: "Focșani", lat: 45.70, lon: 27.19 },
};

export interface WeatherInfo {
    temp: number;
    description: string;
    icon: string;
    cityName: string;
}

function getWeatherEmoji(code: number): string {
    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "🌫️";
    if (code <= 57) return "🌦️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌧️";
    if (code <= 86) return "🌨️";
    if (code >= 95) return "⛈️";
    return "🌤️";
}

function getWeatherDescription(code: number): string {
    if (code === 0) return "cer senin";
    if (code <= 3) return "parțial înnorat";
    if (code <= 48) return "ceață";
    if (code <= 57) return "burniță";
    if (code <= 67) return "ploaie";
    if (code <= 77) return "ninsoare";
    if (code <= 82) return "averse de ploaie";
    if (code <= 86) return "averse de ninsoare";
    if (code >= 95) return "furtună";
    return "variabil";
}

// Simple in-memory cache to avoid excessive API calls
const weatherCache: Map<string, { data: WeatherInfo; timestamp: number }> = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function getWeatherForCounty(countyName: string): Promise<WeatherInfo | null> {
    const capital = COUNTY_CAPITALS[countyName];
    if (!capital) {
        console.warn(`[Weather] No capital found for county: ${countyName}`);
        return null;
    }

    // Check cache first
    const cached = weatherCache.get(countyName);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        // Using Open-Meteo free API (no key needed)
        // Use the "current" parameter (newer API format)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${capital.lat}&longitude=${capital.lon}&current=temperature_2m,weather_code&timezone=Europe%2FBucharest`;
        
        const resp = await fetch(url);
        if (!resp.ok) {
            console.warn(`[Weather] API returned ${resp.status} for ${countyName}`);
            // Fallback: try the older format
            return await getWeatherFallback(capital, countyName);
        }
        
        const data = await resp.json();
        
        let temp: number;
        let weatherCode: number;
        
        // Handle both new and old API response formats
        if (data.current) {
            temp = Math.round(data.current.temperature_2m);
            weatherCode = data.current.weather_code;
        } else if (data.current_weather) {
            temp = Math.round(data.current_weather.temperature);
            weatherCode = data.current_weather.weathercode;
        } else {
            console.warn(`[Weather] Unexpected API response format for ${countyName}`, data);
            return null;
        }
        
        const desc = getWeatherDescription(weatherCode);
        const result: WeatherInfo = {
            temp,
            description: desc,
            icon: getWeatherEmoji(weatherCode),
            cityName: capital.name,
        };
        
        // Cache the result
        weatherCache.set(countyName, { data: result, timestamp: Date.now() });
        
        return result;
    } catch (err) {
        console.warn(`[Weather] Failed for ${countyName}:`, err);
        return null;
    }
}

// Fallback using the older API format
async function getWeatherFallback(
    capital: { name: string; lat: number; lon: number },
    countyName: string
): Promise<WeatherInfo | null> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${capital.lat}&longitude=${capital.lon}&current_weather=true`;
        const resp = await fetch(url);
        if (!resp.ok) return null;
        
        const data = await resp.json();
        if (!data.current_weather) return null;
        
        const cw = data.current_weather;
        const desc = getWeatherDescription(cw.weathercode);
        const result: WeatherInfo = {
            temp: Math.round(cw.temperature),
            description: desc,
            icon: getWeatherEmoji(cw.weathercode),
            cityName: capital.name,
        };
        
        weatherCache.set(countyName, { data: result, timestamp: Date.now() });
        return result;
    } catch {
        return null;
    }
}

export function getCapitalName(countyName: string): string {
    return COUNTY_CAPITALS[countyName]?.name || countyName;
}
