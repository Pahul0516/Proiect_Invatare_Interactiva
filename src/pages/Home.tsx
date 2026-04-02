import React from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
} from "@ionic/react";
import Map from "../components/Map";

const Home: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Romania Map</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen  scrollY={false}>
                <Map />
            </IonContent>
        </IonPage>
    );
};

export default Home;