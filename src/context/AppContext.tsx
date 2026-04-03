import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { WeatherInfo } from "../services/weatherService";

export type AvatarMode = "adult" | "child";
export type CountyColor = "red" | "yellow" | "green" | null;
export type AppPhase = "idle" | "story" | "quiz" | "result";

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

export interface RankInfo {
    title: string;
    minGreen: number;
}

const RANKS: RankInfo[] = [
    { title: "Explorator Începător", minGreen: 0 },
    { title: "Călător Curios", minGreen: 3 },
    { title: "Cunoscător al României", minGreen: 5 },
    { title: "Maestru al Județelor", minGreen: 10 },
    { title: "Legendă a României", minGreen: 20 },
];

export interface AppState {
    avatarMode: AvatarMode;
    setAvatarMode: (mode: AvatarMode) => void;
    avatarName: string;
    xp: number;
    addXp: (amount: number) => void;
    rank: RankInfo;
    countyColors: Record<string, CountyColor>;
    setCountyColor: (county: string, color: CountyColor) => void;
    currentCounty: string | null;
    setCurrentCounty: (county: string | null) => void;
    phase: AppPhase;
    setPhase: (phase: AppPhase) => void;
    storyText: string;
    setStoryText: (text: string) => void;
    quizQuestions: QuizQuestion[];
    setQuizQuestions: (questions: QuizQuestion[]) => void;
    quizScore: number;
    setQuizScore: (score: number) => void;
    visitedCounties: Set<string>;
    markVisited: (county: string) => void;
    userCoords: { lat: number; lng: number } | null;
    setUserCoords: (coords: { lat: number; lng: number } | null) => void;
    detectedCounty: string | null;
    setDetectedCounty: (county: string | null) => void;
    showNewCountyNotification: string | null;
    setShowNewCountyNotification: (county: string | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    avatarEmotion: "happy" | "sad" | "thinking" | "hello";
    setAvatarEmotion: (emotion: "happy" | "sad" | "thinking" | "hello") => void;
    weatherInfo: WeatherInfo | null;
    setWeatherInfo: (info: WeatherInfo | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within AppProvider");
    return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [avatarMode, setAvatarMode] = useState<AvatarMode>("child");
    const [xp, setXp] = useState(0);
    const [countyColors, setCountyColors] = useState<Record<string, CountyColor>>({});
    const [currentCounty, setCurrentCounty] = useState<string | null>(null);
    const [phase, setPhase] = useState<AppPhase>("idle");
    const [storyText, setStoryText] = useState("");
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [quizScore, setQuizScore] = useState(0);
    const [visitedCounties, setVisitedCounties] = useState<Set<string>>(new Set());
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [detectedCounty, setDetectedCounty] = useState<string | null>(null);
    const [showNewCountyNotification, setShowNewCountyNotification] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarEmotion, setAvatarEmotion] = useState<"happy" | "sad" | "thinking" | "hello">("hello");
    const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);

    const avatarName = avatarMode === "child" ? "Ghiță Ghidul" : "Consilierul Virtual";

    const greenCount = Object.values(countyColors).filter((c) => c === "green").length;
    const rank = [...RANKS].reverse().find((r) => greenCount >= r.minGreen) || RANKS[0];

    const addXp = useCallback((amount: number) => {
        setXp((prev) => prev + amount);
    }, []);

    const setCountyColor = useCallback((county: string, color: CountyColor) => {
        setCountyColors((prev) => ({ ...prev, [county]: color }));
    }, []);

    const markVisited = useCallback((county: string) => {
        setVisitedCounties((prev) => {
            const next = new Set(prev);
            next.add(county);
            return next;
        });
    }, []);

    useEffect(() => {
        if (avatarMode === "child") {
            setAvatarEmotion("happy");
        } else {
            setAvatarEmotion("hello");
        }
    }, [avatarMode]);

    return (
        <AppContext.Provider
            value={{
                avatarMode,
                setAvatarMode,
                avatarName,
                xp,
                addXp,
                rank,
                countyColors,
                setCountyColor,
                currentCounty,
                setCurrentCounty,
                phase,
                setPhase,
                storyText,
                setStoryText,
                quizQuestions,
                setQuizQuestions,
                quizScore,
                setQuizScore,
                visitedCounties,
                markVisited,
                userCoords,
                setUserCoords,
                detectedCounty,
                setDetectedCounty,
                showNewCountyNotification,
                setShowNewCountyNotification,
                isLoading,
                setIsLoading,
                avatarEmotion,
                setAvatarEmotion,
                weatherInfo,
                setWeatherInfo,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
