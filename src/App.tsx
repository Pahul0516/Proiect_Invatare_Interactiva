import React, { useState } from "react";
import {
    IonApp,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
} from "@ionic/react";
import { moonOutline, sunnyOutline } from "ionicons/icons";
import { AppProvider, useAppContext, AvatarMode } from "./context/AppContext";
import Map from "./components/Map";
import StoryPanel from "./components/StoryPanel";
import QuizPanel from "./components/QuizPanel";
import ResultPanel from "./components/ResultPanel";
import XPDisplay from "./components/XPDisplay";
import HelpButton from "./components/HelpButton";

const AppContent: React.FC = () => {
    const { avatarMode, setAvatarMode, phase, showNewCountyNotification } = useAppContext();
    const [isDark, setIsDark] = useState(document.body.classList.contains("dark"));

    const toggleTheme = () => {
        const dark = document.body.classList.toggle("dark");
        setIsDark(dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
    };

    const handleModeChange = (e: CustomEvent) => {
        setAvatarMode(e.detail.value as AvatarMode);
    };

    const renderContent = () => {
        switch (phase) {
            case "story":
                return <StoryPanel />;
            case "quiz":
                return <QuizPanel />;
            case "result":
                return <ResultPanel />;
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
                <IonHeader>
                    <IonToolbar>
                        <div className="toolbar-left" slot="start">
                            <IonSelect
                                value={avatarMode}
                                onIonChange={handleModeChange}
                                interface="popover"
                                className="avatar-select"
                            >
                                <IonSelectOption value="child">
                                    Copii
                                </IonSelectOption>
                                <IonSelectOption value="adult">
                                    Adulți
                                </IonSelectOption>
                            </IonSelect>
                        </div>
                        <IonTitle>România Interactivă</IonTitle>
                        <IonButton
                            onClick={toggleTheme}
                            className="theme-toggle"
                            fill="clear"
                            slot="end"
                        >
                            <IonIcon icon={isDark ? sunnyOutline : moonOutline} />
                        </IonButton>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen scrollY={phase !== "idle"}>
                    {renderContent()}
                </IonContent>
            </IonPage>

            <XPDisplay />
            <HelpButton />

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