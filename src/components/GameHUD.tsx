import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import "./GameHUD.css";

const GameHUD: React.FC = () => {
    const {
        lives, maxLives, lifeRegenTimer,
        coins, level, xpProgress, dailyStreak,
        phase
    } = useAppContext();

    const [coinPulse, setCoinPulse] = useState(false);
    const [lifePulse, setLifePulse] = useState(false);
    const prevCoins = useRef(coins);
    const prevLives = useRef(lives);

    useEffect(() => {
        if (coins > prevCoins.current) {
            setCoinPulse(true);
            setTimeout(() => setCoinPulse(false), 600);
        }
        prevCoins.current = coins;
    }, [coins]);

    useEffect(() => {
        if (lives < prevLives.current) {
            setLifePulse(true);
            setTimeout(() => setLifePulse(false), 600);
        }
        prevLives.current = lives;
    }, [lives]);

    // Don't show on title screen
    if (phase === "title") return null;

    const formatTimer = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="game-hud">
            {/* Lives */}
            <div className={`hud-item hud-lives ${lifePulse ? "pulse-red" : ""}`}>
                <span className="hud-icon">
                    {Array.from({ length: maxLives }, (_, i) => (
                        <span key={i} className={`heart ${i < lives ? "filled" : "empty"}`}>
                            {i < lives ? "❤️" : "🖤"}
                        </span>
                    ))}
                </span>
                {lifeRegenTimer !== null && lives < maxLives && (
                    <span className="life-timer">{formatTimer(lifeRegenTimer)}</span>
                )}
            </div>

            {/* Coins */}
            <div className={`hud-item hud-coins ${coinPulse ? "pulse-gold" : ""}`}>
                <span className="hud-icon">💰</span>
                <span className="hud-value">{coins}</span>
            </div>

            {/* Level + XP bar */}
            <div className="hud-item hud-level">
                <span className="hud-level-badge">Nv.{level}</span>
                <div className="hud-xp-bar">
                    <div
                        className="hud-xp-fill"
                        style={{ width: `${xpProgress.percent}%` }}
                    />
                </div>
            </div>

            {/* Daily Streak */}
            {dailyStreak > 0 && (
                <div className="hud-item hud-streak">
                    <span className="hud-icon">🔥</span>
                    <span className="hud-value">{dailyStreak}</span>
                </div>
            )}
        </div>
    );
};

export default GameHUD;
