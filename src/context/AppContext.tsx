import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { WeatherInfo } from "../services/weatherService";
import { getLevelFromXp, getXpProgress, checkAchievements, ACHIEVEMENTS, CheckContext } from "../services/achievementService";

export type AvatarMode = "adult" | "child";
export type CountyColor = "red" | "yellow" | "green" | null;
export type AppPhase = "title" | "idle" | "story" | "quiz" | "result" | "shop" | "achievements" | "daily";

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

export interface RankInfo {
    title: string;
    minGreen: number;
}

export interface PowerUpInventory {
    shield: number;
    timeFreeze: number;
    extraHint: number;
    extraLife: number;
    skipQuestion: number;
}

export interface DailyChallenge {
    county: string;
    date: string; // YYYY-MM-DD
    completed: boolean;
}

const RANKS: RankInfo[] = [
    { title: "Explorator Începător", minGreen: 0 },
    { title: "Călător Curios", minGreen: 3 },
    { title: "Cunoscător al României", minGreen: 5 },
    { title: "Maestru al Județelor", minGreen: 10 },
    { title: "Legendă a României", minGreen: 20 },
];

const STORAGE_KEY = "romania_game_state";
const MAX_LIVES = 5;
const LIFE_REGEN_MS = 10 * 60 * 1000; // 10 minutes

// All 41 Romanian counties
const ALL_COUNTIES = [
    "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud",
    "Botoșani", "Brăila", "Brașov", "București", "Buzău", "Călărași",
    "Caraș-Severin", "Cluj", "Constanța", "Covasna", "Dâmbovița",
    "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara",
    "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș",
    "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare", "Sibiu",
    "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui", "Vrancea"
];

interface SavedState {
    playerName: string;
    avatarMode: AvatarMode;
    xp: number;
    coins: number;
    lives: number;
    lastLifeLostTime: number | null;
    countyColors: Record<string, CountyColor>;
    countyStars: Record<string, number>;
    visitedCounties: string[];
    unlockedAchievements: string[];
    dailyStreak: number;
    lastDailyDate: string | null;
    dailyChallengesCompleted: number;
    totalQuestionsAnswered: number;
    totalCorrect: number;
    bestStreakEver: number;
    totalPowerUpsBought: number;
    usedShield: boolean;
    usedFreeze: boolean;
    totalCoinsEarned: number;
    powerUps: PowerUpInventory;
}

function getDefaultState(): SavedState {
    return {
        playerName: "Explorator",
        avatarMode: "child",
        xp: 0,
        coins: 100, // Start with some coins
        lives: MAX_LIVES,
        lastLifeLostTime: null,
        countyColors: {},
        countyStars: {},
        visitedCounties: [],
        unlockedAchievements: [],
        dailyStreak: 0,
        lastDailyDate: null,
        dailyChallengesCompleted: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        bestStreakEver: 0,
        totalPowerUpsBought: 0,
        usedShield: false,
        usedFreeze: false,
        totalCoinsEarned: 100,
        powerUps: { shield: 0, timeFreeze: 0, extraHint: 0, extraLife: 0, skipQuestion: 0 },
    };
}

function loadState(): SavedState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...getDefaultState(), ...parsed };
        }
    } catch { /* ignore */ }
    return getDefaultState();
}

function saveState(state: SavedState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
}

function getTodayStr(): string {
    return new Date().toISOString().split("T")[0];
}

function getDailyCounty(dateStr: string): string {
    // Deterministic hash of date → county index
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % ALL_COUNTIES.length;
    return ALL_COUNTIES[idx];
}

export interface AppState {
    // Player Info
    playerName: string;
    setPlayerName: (name: string) => void;
    avatarMode: AvatarMode;
    setAvatarMode: (mode: AvatarMode) => void;
    avatarName: string;

    // Game Economy
    xp: number;
    addXp: (amount: number) => void;
    coins: number;
    addCoins: (amount: number) => void;
    spendCoins: (amount: number) => boolean;
    level: number;
    xpProgress: { current: number; needed: number; percent: number };
    lives: number;
    loseLife: () => void;
    addLife: () => void;
    maxLives: number;
    lifeRegenTimer: number | null; // ms until next life

    // Rankings
    rank: RankInfo;

    // County State
    countyColors: Record<string, CountyColor>;
    setCountyColor: (county: string, color: CountyColor) => void;
    countyStars: Record<string, number>;
    setCountyStars: (county: string, stars: number) => void;
    currentCounty: string | null;
    setCurrentCounty: (county: string | null) => void;

    // App State
    phase: AppPhase;
    setPhase: (phase: AppPhase) => void;
    storyText: string;
    setStoryText: (text: string) => void;
    quizQuestions: QuizQuestion[];
    setQuizQuestions: (questions: QuizQuestion[]) => void;
    quizScore: number;
    setQuizScore: (score: number) => void;

    // Visited
    visitedCounties: Set<string>;
    markVisited: (county: string) => void;

    // Geolocation
    userCoords: { lat: number; lng: number } | null;
    setUserCoords: (coords: { lat: number; lng: number } | null) => void;
    detectedCounty: string | null;
    setDetectedCounty: (county: string | null) => void;
    showNewCountyNotification: string | null;
    setShowNewCountyNotification: (county: string | null) => void;

    // Loading
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    // Avatar
    avatarEmotion: "happy" | "sad" | "thinking" | "hello";
    setAvatarEmotion: (emotion: "happy" | "sad" | "thinking" | "hello") => void;

    // Weather
    weatherInfo: WeatherInfo | null;
    setWeatherInfo: (info: WeatherInfo | null) => void;

    // Power-ups
    powerUps: PowerUpInventory;
    buyPowerUp: (type: keyof PowerUpInventory, cost: number) => boolean;
    usePowerUp: (type: keyof PowerUpInventory) => boolean;

    // Achievements
    unlockedAchievements: string[];
    newAchievementToast: string | null;
    dismissAchievementToast: () => void;
    triggerAchievementCheck: () => void;

    // Daily
    dailyChallenge: DailyChallenge;
    dailyStreak: number;
    completeDailyChallenge: () => void;

    // Stats
    totalQuestionsAnswered: number;
    addQuestionsAnswered: (correct: number, total: number) => void;
    bestStreakEver: number;
    updateBestStreak: (streak: number) => void;
    totalPowerUpsBought: number;
    markUsedShield: () => void;
    markUsedFreeze: () => void;

    // Level-up animation
    showLevelUp: number | null;
    dismissLevelUp: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within AppProvider");
    return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const saved = useRef(loadState());

    const [playerName, setPlayerNameState] = useState(saved.current.playerName);
    const [avatarMode, setAvatarMode] = useState<AvatarMode>(saved.current.avatarMode);
    const [xp, setXp] = useState(saved.current.xp);
    const [coins, setCoins] = useState(saved.current.coins);
    const [lives, setLives] = useState(saved.current.lives);
    const [lastLifeLostTime, setLastLifeLostTime] = useState<number | null>(saved.current.lastLifeLostTime);
    const [countyColors, setCountyColors] = useState<Record<string, CountyColor>>(saved.current.countyColors);
    const [countyStars, setCountyStarsMap] = useState<Record<string, number>>(saved.current.countyStars);
    const [currentCounty, setCurrentCounty] = useState<string | null>(null);
    const [phase, setPhase] = useState<AppPhase>("title");
    const [storyText, setStoryText] = useState("");
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [quizScore, setQuizScore] = useState(0);
    const [visitedCounties, setVisitedCounties] = useState<Set<string>>(new Set(saved.current.visitedCounties));
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [detectedCounty, setDetectedCounty] = useState<string | null>(null);
    const [showNewCountyNotification, setShowNewCountyNotification] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarEmotion, setAvatarEmotion] = useState<"happy" | "sad" | "thinking" | "hello">("hello");
    const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
    const [powerUps, setPowerUps] = useState<PowerUpInventory>(saved.current.powerUps);
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(saved.current.unlockedAchievements);
    const [newAchievementToast, setNewAchievementToast] = useState<string | null>(null);
    const [dailyStreak, setDailyStreak] = useState(saved.current.dailyStreak);
    const [lastDailyDate, setLastDailyDate] = useState<string | null>(saved.current.lastDailyDate);
    const [dailyChallengesCompleted, setDailyChallengesCompleted] = useState(saved.current.dailyChallengesCompleted);
    const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(saved.current.totalQuestionsAnswered);
    const [totalCorrect, setTotalCorrect] = useState(saved.current.totalCorrect);
    const [bestStreakEver, setBestStreakEver] = useState(saved.current.bestStreakEver);
    const [totalPowerUpsBought, setTotalPowerUpsBought] = useState(saved.current.totalPowerUpsBought);
    const [usedShield, setUsedShield] = useState(saved.current.usedShield);
    const [usedFreeze, setUsedFreeze] = useState(saved.current.usedFreeze);
    const [totalCoinsEarned, setTotalCoinsEarned] = useState(saved.current.totalCoinsEarned);
    const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
    const [lifeRegenTimer, setLifeRegenTimer] = useState<number | null>(null);

    const avatarName = avatarMode === "child" ? "Ghiță Ghidul" : "Consilierul Virtual";

    const greenCount = Object.values(countyColors).filter((c) => c === "green").length;
    const totalCompleted = Object.values(countyColors).filter(Boolean).length;
    const rank = [...RANKS].reverse().find((r) => greenCount >= r.minGreen) || RANKS[0];
    const level = getLevelFromXp(xp);
    const xpProgressData = getXpProgress(xp, level);

    const today = getTodayStr();
    const dailyChallenge: DailyChallenge = {
        county: getDailyCounty(today),
        date: today,
        completed: lastDailyDate === today,
    };

    // ─── Persist to localStorage on changes ──────────────────────
    useEffect(() => {
        const state: SavedState = {
            playerName, avatarMode, xp, coins, lives, lastLifeLostTime,
            countyColors, countyStars, visitedCounties: Array.from(visitedCounties),
            unlockedAchievements, dailyStreak, lastDailyDate, dailyChallengesCompleted,
            totalQuestionsAnswered, totalCorrect, bestStreakEver, totalPowerUpsBought,
            usedShield, usedFreeze, totalCoinsEarned, powerUps,
        };
        saveState(state);
    }, [
        playerName, avatarMode, xp, coins, lives, lastLifeLostTime,
        countyColors, countyStars, visitedCounties, unlockedAchievements,
        dailyStreak, lastDailyDate, dailyChallengesCompleted,
        totalQuestionsAnswered, totalCorrect, bestStreakEver,
        totalPowerUpsBought, usedShield, usedFreeze, totalCoinsEarned, powerUps,
    ]);

    // ─── Life regeneration timer ─────────────────────────────────
    useEffect(() => {
        if (lives >= MAX_LIVES) {
            setLifeRegenTimer(null);
            return;
        }
        if (!lastLifeLostTime) {
            setLifeRegenTimer(null);
            return;
        }

        const tick = () => {
            const elapsed = Date.now() - lastLifeLostTime;
            const livesRegained = Math.floor(elapsed / LIFE_REGEN_MS);
            if (livesRegained > 0) {
                setLives((prev) => Math.min(MAX_LIVES, prev + livesRegained));
                if (lives + livesRegained >= MAX_LIVES) {
                    setLastLifeLostTime(null);
                    setLifeRegenTimer(null);
                } else {
                    setLastLifeLostTime(lastLifeLostTime + livesRegained * LIFE_REGEN_MS);
                    setLifeRegenTimer(LIFE_REGEN_MS - ((elapsed - livesRegained * LIFE_REGEN_MS)));
                }
            } else {
                setLifeRegenTimer(LIFE_REGEN_MS - elapsed);
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [lives, lastLifeLostTime]);

    // ─── Avatar mode effect ──────────────────────────────────────
    useEffect(() => {
        if (avatarMode === "child") {
            setAvatarEmotion("happy");
        } else {
            setAvatarEmotion("hello");
        }
    }, [avatarMode]);

    // ─── Callbacks ───────────────────────────────────────────────
    const setPlayerName = useCallback((name: string) => {
        setPlayerNameState(name || "Explorator");
    }, []);

    const addXp = useCallback((amount: number) => {
        setXp((prev) => {
            const newXp = prev + amount;
            const oldLevel = getLevelFromXp(prev);
            const newLevel = getLevelFromXp(newXp);
            if (newLevel > oldLevel) {
                setTimeout(() => setShowLevelUp(newLevel), 400);
            }
            return newXp;
        });
    }, []);

    const addCoins = useCallback((amount: number) => {
        setCoins((prev) => prev + amount);
        setTotalCoinsEarned((prev) => prev + amount);
    }, []);

    const spendCoins = useCallback((amount: number): boolean => {
        let success = false;
        setCoins((prev) => {
            if (prev >= amount) {
                success = true;
                return prev - amount;
            }
            return prev;
        });
        return success;
    }, []);

    const loseLife = useCallback(() => {
        setLives((prev) => Math.max(0, prev - 1));
        setLastLifeLostTime(Date.now());
    }, []);

    const addLife = useCallback(() => {
        setLives((prev) => Math.min(MAX_LIVES, prev + 1));
    }, []);

    const setCountyColor = useCallback((county: string, color: CountyColor) => {
        setCountyColors((prev) => ({ ...prev, [county]: color }));
    }, []);

    const setCountyStars = useCallback((county: string, stars: number) => {
        setCountyStarsMap((prev) => {
            const existing = prev[county] || 0;
            if (stars > existing) {
                return { ...prev, [county]: stars };
            }
            return prev;
        });
    }, []);

    const markVisited = useCallback((county: string) => {
        setVisitedCounties((prev) => {
            const next = new Set(prev);
            next.add(county);
            return next;
        });
    }, []);

    const buyPowerUp = useCallback((type: keyof PowerUpInventory, cost: number): boolean => {
        let success = false;
        setCoins((prev) => {
            if (prev >= cost) {
                success = true;
                setPowerUps((p) => ({ ...p, [type]: p[type] + 1 }));
                setTotalPowerUpsBought((p) => p + 1);
                return prev - cost;
            }
            return prev;
        });
        return success;
    }, []);

    const usePowerUp = useCallback((type: keyof PowerUpInventory): boolean => {
        let success = false;
        setPowerUps((prev) => {
            if (prev[type] > 0) {
                success = true;
                return { ...prev, [type]: prev[type] - 1 };
            }
            return prev;
        });
        return success;
    }, []);

    const dismissAchievementToast = useCallback(() => {
        setNewAchievementToast(null);
    }, []);

    const dismissLevelUp = useCallback(() => {
        setShowLevelUp(null);
    }, []);

    const triggerAchievementCheck = useCallback(() => {
        const ctx: CheckContext = {
            totalCompleted,
            greenCount,
            bestStreak: bestStreakEver,
            totalCoins: totalCoinsEarned,
            dailyStreak,
            dailyChallengesCompleted,
            totalPowerUpsBought,
            usedShield,
            usedFreeze,
            level,
            totalQuestionsAnswered,
            unlockedAchievements,
            currentHour: new Date().getHours(),
            allTimerAbove10: false, // This is set by quiz panel context
        };

        const newlyUnlocked = checkAchievements(ctx);
        if (newlyUnlocked.length > 0) {
            setUnlockedAchievements((prev) => [...prev, ...newlyUnlocked]);
            // Show first newly unlocked
            const achievement = ACHIEVEMENTS.find((a) => a.id === newlyUnlocked[0]);
            if (achievement) {
                setNewAchievementToast(achievement.id);
                addCoins(achievement.coinReward);
                if (achievement.xpReward > 0) {
                    addXp(achievement.xpReward);
                }
            }
            // Queue remaining
            newlyUnlocked.slice(1).forEach((id, i) => {
                const ach = ACHIEVEMENTS.find((a) => a.id === id);
                if (ach) {
                    setTimeout(() => {
                        setNewAchievementToast(id);
                        addCoins(ach.coinReward);
                        if (ach.xpReward > 0) addXp(ach.xpReward);
                    }, (i + 1) * 3000);
                }
            });
        }
    }, [totalCompleted, greenCount, bestStreakEver, totalCoinsEarned, dailyStreak,
        dailyChallengesCompleted, totalPowerUpsBought, usedShield, usedFreeze,
        level, totalQuestionsAnswered, unlockedAchievements, addCoins, addXp]);

    const completeDailyChallenge = useCallback(() => {
        const today = getTodayStr();
        if (lastDailyDate === today) return; // Already completed

        setLastDailyDate(today);
        setDailyChallengesCompleted((p) => p + 1);

        // Check streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastDailyDate === yesterdayStr) {
            setDailyStreak((p) => p + 1);
        } else {
            setDailyStreak(1);
        }
    }, [lastDailyDate]);

    const addQuestionsAnswered = useCallback((correct: number, total: number) => {
        setTotalQuestionsAnswered((p) => p + total);
        setTotalCorrect((p) => p + correct);
    }, []);

    const updateBestStreak = useCallback((streak: number) => {
        setBestStreakEver((prev) => Math.max(prev, streak));
    }, []);

    const markUsedShield = useCallback(() => setUsedShield(true), []);
    const markUsedFreeze = useCallback(() => setUsedFreeze(true), []);

    return (
        <AppContext.Provider
            value={{
                playerName, setPlayerName,
                avatarMode, setAvatarMode, avatarName,
                xp, addXp, coins, addCoins, spendCoins,
                level, xpProgress: xpProgressData,
                lives, loseLife, addLife, maxLives: MAX_LIVES, lifeRegenTimer,
                rank, countyColors, setCountyColor,
                countyStars, setCountyStars,
                currentCounty, setCurrentCounty,
                phase, setPhase, storyText, setStoryText,
                quizQuestions, setQuizQuestions,
                quizScore, setQuizScore,
                visitedCounties, markVisited,
                userCoords, setUserCoords,
                detectedCounty, setDetectedCounty,
                showNewCountyNotification, setShowNewCountyNotification,
                isLoading, setIsLoading,
                avatarEmotion, setAvatarEmotion,
                weatherInfo, setWeatherInfo,
                powerUps, buyPowerUp, usePowerUp,
                unlockedAchievements, newAchievementToast,
                dismissAchievementToast, triggerAchievementCheck,
                dailyChallenge, dailyStreak, completeDailyChallenge,
                totalQuestionsAnswered, addQuestionsAnswered,
                bestStreakEver, updateBestStreak,
                totalPowerUpsBought, markUsedShield, markUsedFreeze,
                showLevelUp, dismissLevelUp,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
