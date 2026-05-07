import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { ACHIEVEMENTS } from "../services/achievementService";
import { playButtonSound } from "../services/soundService";
import "./AchievementsPanel.css";

const AchievementsPanel: React.FC = () => {
    const { unlockedAchievements, setPhase } = useAppContext();
    const [selectedAch, setSelectedAch] = useState<string | null>(null);

    const unlockedSet = new Set(unlockedAchievements);
    const totalUnlocked = unlockedAchievements.length;
    const totalAchievements = ACHIEVEMENTS.length;
    const progressPercent = Math.round((totalUnlocked / totalAchievements) * 100);

    const selected = selectedAch ? ACHIEVEMENTS.find((a) => a.id === selectedAch) : null;

    return (
        <div className="achievements-panel">
            <div className="ach-header">
                <h2 className="ach-title">🏆 Realizări</h2>
                <div className="ach-progress-info">
                    <span className="ach-count">{totalUnlocked}/{totalAchievements}</span>
                    <div className="ach-progress-bar">
                        <div className="ach-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
            </div>

            <div className="ach-grid">
                {ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = unlockedSet.has(ach.id);
                    const isHidden = ach.hidden && !isUnlocked;

                    return (
                        <div
                            key={ach.id}
                            className={`ach-card ${isUnlocked ? "unlocked" : "locked"} ${selectedAch === ach.id ? "selected" : ""}`}
                            onClick={() => setSelectedAch(ach.id === selectedAch ? null : ach.id)}
                        >
                            <div className="ach-card-icon">
                                {isHidden ? "❓" : ach.icon}
                            </div>
                            <div className="ach-card-name">
                                {isHidden ? "???" : ach.title}
                            </div>
                            {isUnlocked && <div className="ach-check">✅</div>}
                        </div>
                    );
                })}
            </div>

            {/* Detail popup */}
            {selected && (
                <div className="ach-detail" onClick={() => setSelectedAch(null)}>
                    <div className="ach-detail-card" onClick={(e) => e.stopPropagation()}>
                        <div className="ach-detail-icon">
                            {selected.hidden && !unlockedSet.has(selected.id) ? "❓" : selected.icon}
                        </div>
                        <h3 className="ach-detail-title">
                            {selected.hidden && !unlockedSet.has(selected.id) ? "Realizare Secretă" : selected.title}
                        </h3>
                        <p className="ach-detail-desc">
                            {selected.hidden && !unlockedSet.has(selected.id)
                                ? "Continuă să joci pentru a descoperi!"
                                : selected.description
                            }
                        </p>
                        <div className="ach-detail-rewards">
                            <span>💰 {selected.coinReward} monede</span>
                            {selected.xpReward > 0 && <span>⭐ {selected.xpReward} XP</span>}
                        </div>
                        <div className={`ach-detail-status ${unlockedSet.has(selected.id) ? "unlocked" : "locked"}`}>
                            {unlockedSet.has(selected.id) ? "✅ Deblocat!" : "🔒 Blocat"}
                        </div>
                        <button className="ach-detail-close" onClick={() => setSelectedAch(null)}>Închide</button>
                    </div>
                </div>
            )}

            <button className="ach-back-btn" onClick={() => { playButtonSound(); setPhase("idle"); }}>
                ← Înapoi la hartă
            </button>
        </div>
    );
};

export default AchievementsPanel;
