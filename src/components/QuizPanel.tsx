import React, { useState, useCallback, useEffect, useRef } from "react";
import { IonButton, IonProgressBar } from "@ionic/react";
import { useAppContext } from "../context/AppContext";
import { playCorrectSound, playWrongSound, playStreakSound, playTimerTickSound, playTimeoutSound, playHintSound, playVictorySound, playButtonSound } from "../services/soundService";
import AvatarDisplay from "./AvatarDisplay";
import "./QuizPanel.css";

const TIMER_SECONDS = 20;

const QuizPanel: React.FC = () => {
    const {
        quizQuestions,
        currentCounty,
        setQuizScore,
        setCountyColor,
        setPhase,
        addXp,
        avatarMode,
        setAvatarEmotion,
    } = useAppContext();

    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");

    // Game mechanics state
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [hintsLeft, setHintsLeft] = useState(3);
    const [hiddenOptions, setHiddenOptions] = useState<Set<number>>(new Set());
    const [floatingText, setFloatingText] = useState<string | null>(null);
    const [shakeQuestion, setShakeQuestion] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const question = quizQuestions[currentQ];
    const isLast = currentQ === quizQuestions.length - 1;

    // Timer countdown
    useEffect(() => {
        if (answered) return;
        setTimeLeft(TIMER_SECONDS);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                if (prev <= 6) playTimerTickSound();
                return prev - 1;
            });
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentQ, answered]);

    // Handle time running out
    useEffect(() => {
        if (timeLeft === 0 && !answered) {
            handleAnswer(-1); // -1 means timeout
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, answered]);

    const showFloating = (text: string) => {
        setFloatingText(text);
        setTimeout(() => setFloatingText(null), 1200);
    };

    const handleAnswer = useCallback(
        (optionIndex: number) => {
            if (answered) return;
            if (timerRef.current) clearInterval(timerRef.current);
            setSelectedOption(optionIndex);
            setAnswered(true);

            const isCorrect = optionIndex === question.correctIndex;
            const isTimeout = optionIndex === -1;

            if (isCorrect) {
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > bestStreak) setBestStreak(newStreak);
                setScore((s) => s + 1);
                setAvatarEmotion("happy");

                if (newStreak >= 3) {
                    playStreakSound();
                } else {
                    playCorrectSound();
                }

                if (newStreak >= 5) {
                    showFloating(`🔥 STREAK x${newStreak}! INCREDIBIL!`);
                    setFeedbackText(
                        avatarMode === "child"
                            ? `UIMITOR! ${newStreak} corecte la rând! Ești de neoprit! 🔥🔥`
                            : `Impresionant. Serie de ${newStreak} răspunsuri corecte consecutive.`
                    );
                } else if (newStreak >= 3) {
                    showFloating(`⚡ STREAK x${newStreak}!`);
                    setFeedbackText(
                        avatarMode === "child"
                            ? `Super! ${newStreak} la rând! Continuă tot așa! ⚡`
                            : `Excelent. ${newStreak} răspunsuri corecte consecutiv.`
                    );
                } else {
                    showFloating("✅ +1");
                    setFeedbackText(
                        avatarMode === "child"
                            ? "Bravo! Ai răspuns corect! 🎉"
                            : "Corect. Foarte bine."
                    );
                }
            } else {
                setStreak(0);
                setAvatarEmotion("sad");
                setShakeQuestion(true);
                setTimeout(() => setShakeQuestion(false), 500);

                if (isTimeout) {
                    playTimeoutSound();
                    showFloating("⏰ Timpul a expirat!");
                    setFeedbackText(
                        avatarMode === "child"
                            ? `Ups, s-a terminat timpul! Răspunsul era: "${question.options[question.correctIndex]}" ⏰`
                            : `Timp expirat. Răspunsul corect: "${question.options[question.correctIndex]}".`
                    );
                } else {
                    playWrongSound();
                    showFloating("❌ Greșit!");
                    const correct = question.options[question.correctIndex];
                    setFeedbackText(
                        avatarMode === "child"
                            ? `Oops! Răspunsul corect era: "${correct}" 😢`
                            : `Incorect. Răspunsul corect: "${correct}".`
                    );
                }
            }
        },
        [answered, question, streak, bestStreak, avatarMode, setAvatarEmotion]
    );

    const handleHint = useCallback(() => {
        if (hintsLeft <= 0 || answered) return;
        setHintsLeft((h) => h - 1);

        // Hide 2 wrong options (50/50)
        const wrongIndices = question.options
            .map((_, i) => i)
            .filter((i) => i !== question.correctIndex && !hiddenOptions.has(i));

        const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
        setHiddenOptions((prev) => {
            const next = new Set(prev);
            toHide.forEach((i) => next.add(i));
            return next;
        });
        playHintSound();
        showFloating("💡 50/50 activat!");
    }, [hintsLeft, answered, question, hiddenOptions]);

    const handleNext = useCallback(() => {
        playButtonSound();
        if (isLast) {
            playVictorySound();
            setQuizScore(score);
            let color: "red" | "yellow" | "green";
            if (score === 20) {
                color = "green";
                addXp(1);
            } else if (score >= 15) {
                color = "yellow";
            } else {
                color = "red";
            }
            if (currentCounty) {
                setCountyColor(currentCounty, color);
            }
            setPhase("result");
            setAvatarEmotion("hello");
        } else {
            setCurrentQ((prev) => prev + 1);
            setSelectedOption(null);
            setAnswered(false);
            setFeedbackText("");
            setHiddenOptions(new Set());
            setAvatarEmotion("thinking");
        }
    }, [isLast, score, currentCounty, setQuizScore, setCountyColor, setPhase, addXp, setAvatarEmotion]);

    if (!question) return null;

    const progress = (currentQ + 1) / quizQuestions.length;
    const timerPercent = timeLeft / TIMER_SECONDS;
    const timerUrgent = timeLeft <= 5;

    return (
        <div className="quiz-panel">
            {/* Floating popup */}
            {floatingText && (
                <div className="floating-popup" key={floatingText}>
                    {floatingText}
                </div>
            )}

            {/* Header with score and streak */}
            <div className="quiz-header">
                <span className="quiz-counter">
                    {currentQ + 1} / {quizQuestions.length}
                </span>
                {streak >= 2 && (
                    <span className="streak-badge">
                        🔥 x{streak}
                    </span>
                )}
                <span className="quiz-score">⭐ {score}</span>
            </div>

            {/* Progress bar */}
            <IonProgressBar value={progress} color="primary" className="quiz-progress" />

            {/* Timer bar */}
            <div className={`timer-bar-container ${timerUrgent ? "urgent" : ""}`}>
                <div
                    className="timer-bar-fill"
                    style={{ width: `${timerPercent * 100}%` }}
                />
                <span className="timer-text">
                    {answered ? "—" : `⏱ ${timeLeft}s`}
                </span>
            </div>

            {/* Question */}
            <div className={`quiz-question ${shakeQuestion ? "shake" : ""}`}>
                {question.question}
            </div>

            {/* Options */}
            <div className="quiz-options">
                {question.options.map((opt, idx) => {
                    if (hiddenOptions.has(idx)) {
                        return (
                            <button key={idx} className="quiz-option-btn hidden-option" disabled>
                                <span className="option-letter">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span style={{ opacity: 0.3, fontStyle: "italic" }}>eliminat</span>
                            </button>
                        );
                    }
                    let btnClass = "quiz-option-btn";
                    if (answered) {
                        if (idx === question.correctIndex) btnClass += " correct";
                        else if (idx === selectedOption) btnClass += " wrong";
                    }
                    return (
                        <button
                            key={idx}
                            className={btnClass}
                            onClick={() => handleAnswer(idx)}
                            disabled={answered}
                        >
                            <span className="option-letter">
                                {String.fromCharCode(65 + idx)}
                            </span>
                            {opt}
                        </button>
                    );
                })}
            </div>

            {/* Hint button */}
            {!answered && hintsLeft > 0 && (
                <button className="hint-button" onClick={handleHint}>
                    💡 50/50 ({hintsLeft} rămase)
                </button>
            )}

            {/* Feedback */}
            {answered && (
                <div className="quiz-feedback-area">
                    <AvatarDisplay speechText={feedbackText} size={80} />
                    <IonButton
                        onClick={handleNext}
                        expand="block"
                        className="quiz-next-btn"
                    >
                        {isLast ? "🏆 Vezi rezultatul" : "➡️ Următoarea"}
                    </IonButton>
                </div>
            )}
        </div>
    );
};

export default QuizPanel;
