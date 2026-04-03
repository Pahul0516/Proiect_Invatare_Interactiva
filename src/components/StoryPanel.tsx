import React, { useState, useEffect } from "react";
import { IonButton, IonSpinner } from "@ionic/react";
import { useAppContext } from "../context/AppContext";
import { getQuizForCounty } from "../services/llmService";
import { speakText, stopSpeaking, isSpeaking, isTTSSupported } from "../services/ttsService";
import { playButtonSound } from "../services/soundService";
import AvatarDisplay from "./AvatarDisplay";
import "./StoryPanel.css";

const StoryPanel: React.FC = () => {
    const {
        storyText,
        currentCounty,
        isLoading,
        setPhase,
        setQuizQuestions,
        setAvatarEmotion,
        setIsLoading,
        avatarMode,
        weatherInfo,
    } = useAppContext();

    const [displayedText, setDisplayedText] = useState("");
    const [typingDone, setTypingDone] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    // Typewriter effect
    useEffect(() => {
        if (!storyText) return;
        setDisplayedText("");
        setTypingDone(false);
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayedText(storyText.slice(0, i));
            if (i >= storyText.length) {
                clearInterval(interval);
                setTypingDone(true);
            }
        }, 20);
        return () => clearInterval(interval);
    }, [storyText]);

    // Stop TTS on unmount
    useEffect(() => {
        return () => stopSpeaking();
    }, []);

    const handleToggleTTS = () => {
        if (isSpeaking()) {
            stopSpeaking();
            setSpeaking(false);
        } else {
            setSpeaking(true);
            setAvatarEmotion("happy");
            speakText(storyText, avatarMode, () => {
                setSpeaking(false);
            });
        }
    };

    const handleStartQuiz = async () => {
        if (!currentCounty) return;
        stopSpeaking();
        setSpeaking(false);
        playButtonSound();
        setIsLoading(true);
        setAvatarEmotion("thinking");
        const questions = await getQuizForCounty(currentCounty);
        setQuizQuestions(questions);
        setIsLoading(false);
        setPhase("quiz");
    };

    if (isLoading) {
        return (
            <div className="story-panel loading">
                <IonSpinner name="crescent" />
                <p>Se generează povestea...</p>
            </div>
        );
    }

    return (
        <div className="story-panel">
            <h2 className="story-title">📖 {currentCounty}</h2>
            <div className="story-avatar-area">
                <AvatarDisplay size={90} />
            </div>

            {/* Weather badge */}
            {weatherInfo && (
                <div className="weather-badge">
                    <span className="weather-icon">{weatherInfo.icon}</span>
                    <div className="weather-details">
                        <span className="weather-temp">{weatherInfo.temp}°C</span>
                        <span className="weather-desc">{weatherInfo.description}</span>
                        <span className="weather-city">{weatherInfo.cityName}</span>
                    </div>
                </div>
            )}

            {/* TTS button */}
            {isTTSSupported() && typingDone && (
                <button
                    className={`tts-button ${speaking ? "speaking" : ""}`}
                    onClick={handleToggleTTS}
                >
                    {speaking ? "🔊 Oprește nararea" : "🔈 Ascultă povestea"}
                </button>
            )}

            <div className="story-text-area">
                <p>{displayedText}</p>
            </div>
            {typingDone && (
                <IonButton
                    expand="block"
                    onClick={handleStartQuiz}
                    className="story-quiz-btn"
                >
                    Începe Quiz-ul! 📝
                </IonButton>
            )}
        </div>
    );
};

export default StoryPanel;
