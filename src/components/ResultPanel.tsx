import React, { useEffect, useState, useMemo } from "react";
import { IonButton } from "@ionic/react";
import { useAppContext } from "../context/AppContext";
import { playStarSound, playButtonSound } from "../services/soundService";
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
    const {
        quizScore, currentCounty, countyColors, countyStars,
        setPhase, setCurrentCounty, avatarMode,
        xp, rank, coins, level, lives, dailyChallenge, completeDailyChallenge,
    } = useAppContext();

    const [animatedScore, setAnimatedScore] = useState(0);
    const [showStars, setShowStars] = useState(0);
    const [showCoinReward, setShowCoinReward] = useState(false);
    const color = currentCounty ? countyColors[currentCounty] : null;
    const stars = currentCounty ? (countyStars[currentCounty] || 0) : 0;

    const totalCompleted = Object.values(countyColors).filter(Boolean).length;
    const greenCount = Object.values(countyColors).filter((c) => c === "green").length;

    // Check if this was a daily challenge
    const isDailyCounty = currentCounty === dailyChallenge.county;

    // Complete daily if applicable
    useEffect(() => {
        if (isDailyCounty && !dailyChallenge.completed) {
            completeDailyChallenge();
        }
    }, [isDailyCounty, dailyChallenge.completed, completeDailyChallenge]);

    // Confetti particles for good results
    const particles = useMemo<Particle[]>(() => {
        if (color !== "green" && color !== "yellow") return [];
        const count = color === "green" ? 50 : 20;
        return Array.from({ length: count }, (_, i) => ({
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

    // Animate stars appearing
    useEffect(() => {
        if (stars <= 0) return;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= stars; i++) {
            timers.push(setTimeout(() => {
                setShowStars(i);
                playStarSound();
            }, 1200 + i * 400));
        }
        return () => timers.forEach(clearTimeout);
    }, [stars]);

    // Show coin reward after score animation
    useEffect(() => {
        setTimeout(() => setShowCoinReward(true), quizScore * 60 + 500);
    }, [quizScore]);

    const getCoinReward = () => {
        if (color === "green") return 50;
        if (color === "yellow") return 20;
        if (quizScore >= 10) return 10;
        return 0;
    };

    const getXpReward = () => {
        if (color === "green") return 3;
        if (color === "yellow") return 1;
        return 0;
    };

    const getResultEmoji = () => {
        if (color === "green") return "🏆";
        if (color === "yellow") return "👍";
        return "💪";
    };

    const getResultMessage = () => {
        if (avatarMode === "child") {
            if (color === "green")
                return `Extraordinar! Ai răspuns perfect la toate întrebările! Ești un adevărat expert al județului ${currentCounty}! 🌟`;
            if (color === "yellow")
                return `Foarte bine! Ai răspuns corect la ${quizScore} din 20 de întrebări! Mai încearcă pentru scor perfect! 😊`;
            return `Nu-i nimic! Ai răspuns corect la ${quizScore} din 20 de întrebări. Poți încerca din nou oricând! 💪`;
        } else {
            if (color === "green")
                return `Excelent. Scor perfect: ${quizScore}/20. Județul ${currentCounty} a fost marcat ca completat.`;
            if (color === "yellow")
                return `Rezultat bun: ${quizScore}/20. Județul ${currentCounty} necesită o re-vizitare pentru scor maxim.`;
            return `Scor: ${quizScore}/20. Se recomandă revizuirea materialului despre județul ${currentCounty}.`;
        }
    };

    const getColorLabel = () => {
        if (color === "green") return "PERFECT — 3 Stele!";
        if (color === "yellow") return "BINE — 2 Stele!";
        if (quizScore >= 10) return "OK — 1 Stea";
        return "MAI EXERSEAZĂ!";
    };

    const handleBackToMap = () => {
        playButtonSound();
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

            {/* Daily Challenge Banner */}
            {isDailyCounty && (
                <div className="daily-banner">
                    📅 Provocare Zilnică Completată! +Bonus
                </div>
            )}

            <div className={`result-score-card ${color}`}>
                <div className="result-score-number">{animatedScore}/20</div>
                <div className="result-color-label">{getColorLabel()}</div>
            </div>

            {/* Star Rating */}
            <div className="result-stars">
                {[1, 2, 3].map((i) => (
                    <span
                        key={i}
                        className={`result-star ${showStars >= i ? "filled" : "empty"}`}
                    >
                        {showStars >= i ? "⭐" : "☆"}
                    </span>
                ))}
            </div>

            {/* Rewards */}
            {showCoinReward && (
                <div className="result-rewards">
                    {getCoinReward() > 0 && (
                        <div className="reward-item coin-reward">
                            <span className="reward-icon">💰</span>
                            <span className="reward-value">+{getCoinReward()}</span>
                            <span className="reward-label">monede</span>
                        </div>
                    )}
                    {getXpReward() > 0 && (
                        <div className="reward-item xp-reward">
                            <span className="reward-icon">⭐</span>
                            <span className="reward-value">+{getXpReward()}</span>
                            <span className="reward-label">XP</span>
                        </div>
                    )}
                    {quizScore < 10 && (
                        <div className="reward-item life-lost">
                            <span className="reward-icon">💔</span>
                            <span className="reward-value">-1</span>
                            <span className="reward-label">viață</span>
                        </div>
                    )}
                </div>
            )}

            {/* Stats grid */}
            <div className="result-stats">
                <div className="stat-item">
                    <span className="stat-icon">⭐</span>
                    <span className="stat-value">{xp}</span>
                    <span className="stat-label">XP Total</span>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <span className="stat-value">Nv.{level}</span>
                    <span className="stat-label">Nivel</span>
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
                🗺️ Înapoi la hartă
            </IonButton>
        </div>
    );
};

export default ResultPanel;
