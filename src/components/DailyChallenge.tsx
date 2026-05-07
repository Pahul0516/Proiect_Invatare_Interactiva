import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { playDailySound, playButtonSound } from "../services/soundService";
import { getStoryForCounty } from "../services/llmService";
import "./DailyChallenge.css";

const DailyChallenge: React.FC = () => {
    const {
        dailyChallenge, dailyStreak, setPhase, setCurrentCounty,
        setStoryText, setWeatherInfo, setIsLoading, setAvatarEmotion,
        avatarMode, isLoading, coins
    } = useAppContext();

    const [countdown, setCountdown] = useState("");

    // Calculate countdown to next day
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${h}h ${m}m ${s}s`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleStartDaily = async () => {
        if (dailyChallenge.completed) return;
        playDailySound();
        setCurrentCounty(dailyChallenge.county);
        setIsLoading(true);
        setAvatarEmotion("thinking");
        setPhase("story");

        const result = await getStoryForCounty(dailyChallenge.county, avatarMode);
        setStoryText(result.story);
        setWeatherInfo(result.weather);
        setIsLoading(false);
        setAvatarEmotion("happy");
    };

    const streakBonusCoins = Math.min(dailyStreak * 10, 100);

    return (
        <div className="daily-panel">
            <div className="daily-header">
                <h2 className="daily-title">📅 Provocare Zilnică</h2>
                <div className="daily-countdown">
                    <span className="countdown-label">Următoarea provocare în:</span>
                    <span className="countdown-value">{countdown}</span>
                </div>
            </div>

            {/* Streak Display */}
            <div className="daily-streak-card">
                <div className="streak-flames">
                    {Array.from({ length: Math.min(dailyStreak, 7) }, (_, i) => (
                        <span key={i} className="streak-flame">🔥</span>
                    ))}
                    {dailyStreak === 0 && <span className="streak-empty">💤</span>}
                </div>
                <div className="streak-info">
                    <div className="streak-number">{dailyStreak}</div>
                    <div className="streak-label">{dailyStreak === 1 ? "zi" : "zile"} consecutive</div>
                </div>
                {dailyStreak > 0 && (
                    <div className="streak-bonus">
                        Bonus: +{streakBonusCoins} 💰
                    </div>
                )}
            </div>

            {/* Today's Challenge */}
            <div className={`daily-challenge-card ${dailyChallenge.completed ? "completed" : ""}`}>
                <div className="challenge-icon">
                    {dailyChallenge.completed ? "✅" : "🎯"}
                </div>
                <div className="challenge-info">
                    <div className="challenge-county">{dailyChallenge.county}</div>
                    <div className="challenge-subtitle">
                        {dailyChallenge.completed
                            ? "Provocare completată!"
                            : "Județul de azi"
                        }
                    </div>
                </div>
                <div className="challenge-rewards">
                    <span>💰 50+{streakBonusCoins}</span>
                    <span>⭐ 3 XP</span>
                </div>
            </div>

            {!dailyChallenge.completed ? (
                <button className="daily-start-btn" onClick={handleStartDaily} disabled={isLoading}>
                    {isLoading ? "Se încarcă..." : "🎯 Începe Provocarea"}
                </button>
            ) : (
                <div className="daily-completed-msg">
                    ✨ Revino mâine pentru o nouă provocare!
                </div>
            )}

            <button className="daily-back-btn" onClick={() => { playButtonSound(); setPhase("idle"); }}>
                ← Înapoi la hartă
            </button>
        </div>
    );
};

export default DailyChallenge;
