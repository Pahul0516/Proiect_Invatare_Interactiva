import React, { useEffect, useState, useMemo } from "react";
import { IonButton } from "@ionic/react";
import { useAppContext } from "../context/AppContext";
import AvatarDisplay from "./AvatarDisplay";
import "./ResultPanel.css";

interface Particle {
    id: number;
    x: number;
    delay: number;
    color: string;
    size: number;
    duration: number;
}

const CONFETTI_COLORS = ["#22c55e", "#f59e0b", "#6366f1", "#ef4444", "#ec4899", "#3b82f6", "#14b8a6"];

const ResultPanel: React.FC = () => {
    const { quizScore, currentCounty, countyColors, setPhase, setCurrentCounty, avatarMode, xp, rank } =
        useAppContext();

    const [animatedScore, setAnimatedScore] = useState(0);
    const color = currentCounty ? countyColors[currentCounty] : null;

    const totalCompleted = Object.values(countyColors).filter(Boolean).length;
    const greenCount = Object.values(countyColors).filter((c) => c === "green").length;

    // Confetti particles for green result
    const particles = useMemo<Particle[]>(() => {
        if (color !== "green") return [];
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 1.5,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            size: 6 + Math.random() * 8,
            duration: 2 + Math.random() * 2,
        }));
    }, [color]);

    // Animate score counting up
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setAnimatedScore(i);
            if (i >= quizScore) clearInterval(interval);
        }, 60);
        return () => clearInterval(interval);
    }, [quizScore]);

    const getResultEmoji = () => {
        if (color === "green") return "🏆";
        if (color === "yellow") return "👍";
        return "💪";
    };

    const getResultMessage = () => {
        if (avatarMode === "child") {
            if (color === "green")
                return `Extraordinar! Ai răspuns perfect la toate întrebările! Ești un adevărat expert al județului ${currentCounty}! Ai primit 1 XP! 🌟`;
            if (color === "yellow")
                return `Foarte bine! Ai răspuns corect la ${quizScore} din 20 de întrebări! Mai încearcă pentru scor perfect! 😊`;
            return `Nu-i nimic! Ai răspuns corect la ${quizScore} din 20 de întrebări. Poți încerca din nou oricând! 💪`;
        } else {
            if (color === "green")
                return `Excelent. Scor perfect: ${quizScore}/20. Județul ${currentCounty} a fost marcat ca completat. +1 XP.`;
            if (color === "yellow")
                return `Rezultat bun: ${quizScore}/20. Județul ${currentCounty} necesită o re-vizitare pentru scor maxim.`;
            return `Scor: ${quizScore}/20. Se recomandă revizuirea materialului despre județul ${currentCounty}.`;
        }
    };

    const getColorLabel = () => {
        if (color === "green") return "VERDE — Perfect!";
        if (color === "yellow") return "GALBEN — Bine!";
        return "ROȘU — Mai exersează!";
    };

    const handleBackToMap = () => {
        setPhase("idle");
        setCurrentCounty(null);
    };

    return (
        <div className="result-panel">
            {/* Confetti */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="confetti-particle"
                    style={{
                        left: `${p.x}%`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        backgroundColor: p.color,
                        width: p.size,
                        height: p.size,
                    }}
                />
            ))}

            <div className="result-emoji">{getResultEmoji()}</div>
            <h2 className="result-title">Rezultatul Quiz-ului</h2>

            <div className={`result-score-card ${color}`}>
                <div className="result-score-number">{animatedScore}/20</div>
                <div className="result-color-label">{getColorLabel()}</div>
            </div>

            {/* Stats grid */}
            <div className="result-stats">
                <div className="stat-item">
                    <span className="stat-icon">⭐</span>
                    <span className="stat-value">{xp}</span>
                    <span className="stat-label">XP Total</span>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🗺️</span>
                    <span className="stat-value">{totalCompleted}/41</span>
                    <span className="stat-label">Județe</span>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🏆</span>
                    <span className="stat-value">{greenCount}</span>
                    <span className="stat-label">Perfecte</span>
                </div>
            </div>

            <div className="result-rank">
                Rang: <strong>{rank.title}</strong>
            </div>

            <AvatarDisplay speechText={getResultMessage()} size={90} />

            <IonButton expand="block" onClick={handleBackToMap} className="result-back-btn">
                Înapoi la hartă 🗺️
            </IonButton>
        </div>
    );
};

export default ResultPanel;
