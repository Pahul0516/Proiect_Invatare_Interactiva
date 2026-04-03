// Text-to-Speech service using the Web Speech API
import { AvatarMode } from "../context/AppContext";

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isTTSSupported(): boolean {
    return "speechSynthesis" in window;
}

export function speakText(
    text: string,
    mode: AvatarMode,
    onEnd?: () => void
): void {
    if (!isTTSSupported()) {
        onEnd?.();
        return;
    }

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    // Try to find a Romanian voice
    const voices = window.speechSynthesis.getVoices();
    const roVoice = voices.find((v) => v.lang.startsWith("ro"));
    if (roVoice) {
        utterance.voice = roVoice;
    }
    utterance.lang = "ro-RO";

    // Adjust pitch and rate based on avatar mode
    if (mode === "child") {
        utterance.pitch = 1.3;  // higher, more enthusiastic
        utterance.rate = 0.95;
    } else {
        utterance.pitch = 0.9;  // lower, more authoritative
        utterance.rate = 1.0;
    }

    utterance.volume = 0.9;

    utterance.onend = () => {
        currentUtterance = null;
        onEnd?.();
    };

    utterance.onerror = () => {
        currentUtterance = null;
        onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
}

export function isSpeaking(): boolean {
    return window.speechSynthesis?.speaking ?? false;
}
