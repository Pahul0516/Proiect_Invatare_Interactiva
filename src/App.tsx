import React, { useEffect } from "react";
import {
    IonApp,
    IonPage,
    IonContent,
} from "@ionic/react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { ACHIEVEMENTS } from "./services/achievementService";
import { playAchievementSound, playLevelUpSound } from "./services/soundService";

import TitleScreen from "./components/TitleScreen";
import Map from "./components/Map";
import StoryPanel from "./components/StoryPanel";
import QuizPanel from "./components/QuizPanel";
import ResultPanel from "./components/ResultPanel";
import PowerUpShop from "./components/PowerUpShop";
import AchievementsPanel from "./components/AchievementsPanel";
import DailyChallenge from "./components/DailyChallenge";
import GameHUD from "./components/GameHUD";
import HelpButton from "./components/HelpButton";

const AppContent: React.FC = () => {
    const {
        phase,
        showNewCountyNotification,
        newAchievementToast, dismissAchievementToast,
        showLevelUp, dismissLevelUp,
    } = useAppContext();

    // Force dark by default for game aesthetic
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (!savedTheme) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    }, []);

    // Achievement sound
    useEffect(() => {
        if (newAchievementToast) {
            playAchievementSound();
            const timer = setTimeout(() => dismissAchievementToast(), 4000);
            return () => clearTimeout(timer);
        }
    }, [newAchievementToast, dismissAchievementToast]);

    // Level-up sound
    useEffect(() => {
        if (showLevelUp !== null) {
            playLevelUpSound();
            const timer = setTimeout(() => dismissLevelUp(), 3500);
            return () => clearTimeout(timer);
        }
    }, [showLevelUp, dismissLevelUp]);

    const achievementData = newAchievementToast
        ? ACHIEVEMENTS.find((a) => a.id === newAchievementToast)
        : null;

    // Determine if content should scroll
    const shouldScroll = phase !== "idle" && phase !== "title";

    const renderContent = () => {
        switch (phase) {
            case "title":
                return <TitleScreen />;
            case "story":
                return <StoryPanel />;
            case "quiz":
                return <QuizPanel />;
            case "result":
                return <ResultPanel />;
            case "shop":
                return <PowerUpShop />;
            case "achievements":
                return <AchievementsPanel />;
            case "daily":
                return <DailyChallenge />;
            default:
                return (
                    <div style={{ height: "100%", width: "100%", position: "relative" }}>
                        <Map />
                    </div>
                );
        }
    };

    return (
        <IonApp>
            <IonPage>
                <IonContent fullscreen scrollY={shouldScroll}>
                    {renderContent()}
                </IonContent>
            </IonPage>

            {/* Game HUD — hidden on title screen */}
            <GameHUD />

            {/* Help Button — hidden on title */}
            {phase !== "title" && <HelpButton />}

            {/* Achievement Toast */}
            {achievementData && (
                <div className="achievement-toast" onClick={dismissAchievementToast}>
                    <div className="achievement-toast-icon">{achievementData.icon}</div>
                    <div className="achievement-toast-info">
                        <div className="achievement-toast-title">🏆 Realizare Deblocată!</div>
                        <div className="achievement-toast-name">{achievementData.title}</div>
                        <div className="achievement-toast-rewards">
                            💰 +{achievementData.coinReward}
                            {achievementData.xpReward > 0 && ` • ⭐ +${achievementData.xpReward}`}
                        </div>
                    </div>
                </div>
            )}

            {/* Level Up Overlay */}
            {showLevelUp !== null && (
                <div className="level-up-overlay" onClick={dismissLevelUp}>
                    <div className="level-up-content">
                        <div className="level-up-stars">✨</div>
                        <div className="level-up-text">LEVEL UP!</div>
                        <div className="level-up-number">Nivel {showLevelUp}</div>
                        <div className="level-up-sub">Continuă să explorezi! 🚀</div>
                    </div>
                </div>
            )}

            {/* County Notification */}
            {showNewCountyNotification && (
                <div className="notification-toast">
                    🔔 Ai intrat în județul {showNewCountyNotification}!<br />
                    Ai deblocat un quiz nou!
                </div>
            )}
        </IonApp>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;