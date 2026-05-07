import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { playGameStartSound } from "../services/soundService";
import "./TitleScreen.css";

const PARTICLE_COUNT = 50;

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
}

const COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#22c55e", "#3b82f6", "#ec4899", "#14b8a6"];

const TitleScreen: React.FC = () => {
    const { playerName, setPlayerName, setPhase, level, dailyStreak, xp, coins, lives } = useAppContext();
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(playerName);
    const [showContent, setShowContent] = useState(false);

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 6,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    useEffect(() => {
        setTimeout(() => setShowContent(true), 300);
    }, []);

    const handleStart = () => {
        playGameStartSound();
        setPhase("idle");
    };

    const handleNameSave = () => {
        setPlayerName(nameInput.trim() || "Explorator");
        setEditingName(false);
    };

    return (
        <div className="title-screen">
            {/* Animated particles */}
            <div className="title-particles">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="title-particle"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Romania silhouette glow */}
            <div className="title-map-glow" />

            {/* Content */}
            <div className={`title-content ${showContent ? "visible" : ""}`}>
                {/* Game Logo */}
                <div className="title-logo">
                    <span className="title-emoji">🗺️</span>
                    <h1 className="title-text">
                        <span className="title-romania">România</span>
                        <span className="title-interactiva">Interactivă</span>
                    </h1>
                    <div className="title-subtitle">Aventura Cunoașterii</div>
                </div>

                {/* Player Card */}
                <div className="title-player-card">
                    <div className="player-avatar-area">
                        <div className="player-level-badge">Nv. {level}</div>
                    </div>
                    <div className="player-info">
                        {editingName ? (
                            <div className="player-name-edit">
                                <input
                                    className="player-name-input"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                                    maxLength={20}
                                    autoFocus
                                />
                                <button className="name-save-btn" onClick={handleNameSave}>✓</button>
                            </div>
                        ) : (
                            <div className="player-name" onClick={() => { setEditingName(true); setNameInput(playerName); }}>
                                {playerName} ✏️
                            </div>
                        )}
                        <div className="player-stats-row">
                            <span>⭐ {xp} XP</span>
                            <span>💰 {coins}</span>
                            <span>❤️ {lives}</span>
                        </div>
                    </div>
                </div>

                {/* Daily Streak */}
                {dailyStreak > 0 && (
                    <div className="title-streak">
                        🔥 Serie Zilnică: {dailyStreak} {dailyStreak === 1 ? "zi" : "zile"}
                    </div>
                )}

                {/* Start Button */}
                <button className="title-start-btn" onClick={handleStart}>
                    <span className="start-btn-icon">▶</span>
                    <span className="start-btn-text">START AVENTURA</span>
                </button>

                {/* Version tag */}
                <div className="title-version">v2.0 — Ediția Gamificată</div>
            </div>
        </div>
    );
};

export default TitleScreen;
