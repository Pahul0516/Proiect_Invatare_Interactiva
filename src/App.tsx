import React from "react";
import {IonApp, IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon} from "@ionic/react";
import Map from "./components/Map";
import {moonOutline, sunnyOutline} from "ionicons/icons";

const App: React.FC = () => {
    const toggleTheme = () => {
        const isDark = document.body.classList.toggle("dark");

        localStorage.setItem("theme", isDark ? "dark" : "light");
    };

    return (
        <IonApp>
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Romania Map</IonTitle>
                        <IonButton
                            onClick={toggleTheme}
                            className="theme-toggle"
                            fill="clear"
                        >
                            <IonIcon
                                icon={
                                    document.body.classList.contains("dark")
                                        ? sunnyOutline
                                        : moonOutline
                                }
                            />
                        </IonButton>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen scrollY={false}>
                    <div style={{ height: "100%", width: "100%", position: "relative" }}>
                        <Map />
                    </div>
                </IonContent>
            </IonPage>
        </IonApp>
    );
};

export default App;