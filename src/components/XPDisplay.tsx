import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import "./XPDisplay.css";

const XPDisplay: React.FC = () => {
    const { xp, rank, countyColors } = useAppContext();
    const [pulse, setPulse] = useState(false);
    const prevXp = useRef(xp);

    const totalCompleted = Object.values(countyColors).filter(Boolean).length;
    const greenCount = Object.values(countyColors).filter((c) => c === "green").length;
    const progressPercent = Math.round((totalCompleted / 41) * 100);

    useEffect(() => {
        if (xp > prevXp.current) {
            setPulse(true);
            setTimeout(() => setPulse(false), 800);
        }
        prevXp.current = xp;
    }, [xp]);

    return (
        <div className={`xp-display ${pulse ? "xp-pulse" : ""}`}>
            <div className="xp-badge">
                <span className="xp-icon">⭐</span>
                <span className="xp-value">{xp} XP</span>
            </div>
            <div className="rank-label">{rank.title}</div>
            {totalCompleted > 0 && (
                <div className="xp-progress-wrap">
                    <div className="xp-progress-bar">
                        <div
                            className="xp-progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="xp-progress-text">
                        {totalCompleted}/41 • {greenCount}🏆
                    </span>
                </div>
            )}
        </div>
    );
};

export default XPDisplay;
