import React from "react";
import { useAppContext } from "../context/AppContext";
import "./AvatarDisplay.css";

const emotionToImage: Record<string, string> = {
    happy: "/HappyAvatar.png",
    sad: "/SadAvatar.png",
    thinking: "/ThinkingAvatar.png",
    hello: "/HelloAvatar.png",
};

interface AvatarDisplayProps {
    speechText?: string;
    size?: number;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ speechText, size = 120 }) => {
    const { avatarEmotion, avatarName, avatarMode } = useAppContext();

    const imgSrc = emotionToImage[avatarEmotion] || emotionToImage.hello;
    const modeClass = avatarMode === "child" ? "avatar-child" : "avatar-adult";

    return (
        <div className={`avatar-container ${modeClass}`}>
            <div className="avatar-image-wrapper" style={{ width: size, height: size }}>
                <img
                    src={imgSrc}
                    alt={avatarName}
                    className="avatar-image"
                    style={{ width: size, height: size }}
                />
            </div>
            <div className="avatar-name">{avatarName}</div>
            {speechText && (
                <div className="speech-bubble">
                    <p>{speechText}</p>
                </div>
            )}
        </div>
    );
};

export default AvatarDisplay;
