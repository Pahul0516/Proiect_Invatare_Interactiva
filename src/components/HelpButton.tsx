import React, { useState } from "react";
import {
    IonButton,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
} from "@ionic/react";
import { helpCircleOutline, closeOutline } from "ionicons/icons";
import "./HelpButton.css";

const HelpButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <IonButton
                className="help-button"
                fill="clear"
                onClick={() => setIsOpen(true)}
            >
                <IonIcon icon={helpCircleOutline} size="large" />
            </IonButton>

            <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Ajutor</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setIsOpen(false)}>
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="help-content">
                    <div className="help-sections">
                        <section className="help-section">
                            <h2>🗺️ Cum folosesc harta?</h2>
                            <p>
                                Harta afișează toate județele României. Aplicația detectează
                                automat locația ta și te poziționează pe județul corespunzător.
                                Poți da click pe orice județ pentru a-l selecta.
                            </p>
                        </section>

                        <section className="help-section">
                            <h2>▶️ Butonul Start</h2>
                            <p>
                                Apasă butonul <strong>Start</strong> de sub hartă pentru a
                                începe aventura! Harta va face zoom pe județul tău, iar
                                avatarul va povesti o istorie despre acel județ.
                            </p>
                        </section>

                        <section className="help-section">
                            <h2>📝 Quiz-ul</h2>
                            <p>
                                După poveste, vei primi un quiz cu 20 de întrebări. În funcție
                                de scor, județul se colorează:
                            </p>
                            <ul>
                                <li>
                                    <span className="color-dot red"></span> <strong>Roșu</strong>:
                                    sub 15 răspunsuri corecte
                                </li>
                                <li>
                                    <span className="color-dot yellow"></span>{" "}
                                    <strong>Galben</strong>: 15-19 răspunsuri corecte
                                </li>
                                <li>
                                    <span className="color-dot green"></span>{" "}
                                    <strong>Verde</strong>: toate 20 corecte (+1 XP)
                                </li>
                            </ul>
                        </section>

                        <section className="help-section">
                            <h2>👤 Avatarul</h2>
                            <p>
                                Din meniul din stânga sus poți alege între modul{" "}
                                <strong>Copii</strong> (Ghiță Ghidul - povestitor entuziast) și{" "}
                                <strong>Adulți</strong> (Consilierul Virtual - expert analitic).
                                Poveștile și tonul se adaptează automat.
                            </p>
                        </section>

                        <section className="help-section">
                            <h2>⭐ XP și Ranguri</h2>
                            <p>
                                Primești 1 XP pentru fiecare județ colorat în verde. Pe
                                măsură ce acumulezi XP, rangul tău crește:
                            </p>
                            <ul>
                                <li>Explorator Începător → Călător Curios → Cunoscător al României → Maestru al Județelor → Legendă a României</li>
                            </ul>
                        </section>

                        <section className="help-section">
                            <h2>🔔 Explorare</h2>
                            <p>
                                Când te deplasezi într-un județ nou, vei primi o notificare
                                că ai intrat pe un teren nou și ai deblocat un quiz nou!
                            </p>
                        </section>
                    </div>
                </IonContent>
            </IonModal>
        </>
    );
};

export default HelpButton;
