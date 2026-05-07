import React, { useState, useCallback, useEffect, useRef } from "react";
import { IonButton, IonProgressBar } from "@ionic/react";
import { useAppContext } from "../context/AppContext";
import {
    playCorrectSound, playWrongSound, playStreakSound,
    playTimerTickSound, playTimeoutSound, playHintSound,
    playVictorySound, playButtonSound, playCoinSound,
    playShieldSound, playFreezeSound
} from "../services/soundService";
import AvatarDisplay from "./AvatarDisplay";
import "./QuizPanel.css";

const TIMER_SECONDS = 20;

const QuizPanel: React.FC = () => {
    const {
        quizQuestions,
        currentCounty,
        setQuizScore,
        setCountyColor,
        setCountyStars,
        setPhase,
        addXp,
        addCoins,
        loseLife,
        avatarMode,
        setAvatarEmotion,
        powerUps,
        usePowerUp,
        updateBestStreak,
        addQuestionsAnswered,
        markUsedShield,
        markUsedFreeze,
        triggerAchievementCheck,
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

    // Power-up state
    const [shieldActive, setShieldActive] = useState(false);
    const [shieldUsedThisQ, setShieldUsedThisQ] = useState(false);
    const [timerFrozen, setTimerFrozen] = useState(false);
    const [comboMultiplier, setComboMultiplier] = useState(1);
    const [coinsEarned, setCoinsEarned] = useState(0);
    const [allTimerAbove10, setAllTimerAbove10] = useState(true);

    const question = quizQuestions[currentQ];
    const isLast = currentQ === quizQuestions.length - 1;

    // Timer countdown
    useEffect(() => {
        if (answered || timerFrozen) return;
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
    }, [currentQ, answered, timerFrozen]);

    // Handle time running out
    useEffect(() => {
        if (timeLeft === 0 && !answered) {
            handleAnswer(-1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, answered]);

    const showFloating = (text: string) => {
        setFloatingText(text);
        setTimeout(() => setFloatingText(null), 1200);
    };

    // ─── Power-up handlers ────────────────────────────────────
    const handleUseShield = () => {
        if (answered || shieldUsedThisQ) return;
        const success = usePowerUp("shield");
        if (success) {
            setShieldActive(true);
            setShieldUsedThisQ(true);
            playShieldSound();
            markUsedShield();
            showFloating("🛡️ Scut activat!");
        }
    };

    const handleUseFreeze = () => {
        if (answered) return;
        const success = usePowerUp("timeFreeze");
        if (success) {
            setTimerFrozen(true);
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeLeft((prev) => Math.min(TIMER_SECONDS, prev + 10));
            playFreezeSound();
            markUsedFreeze();
            showFloating("❄️ +10 secunde!");
            // Unfreeze after a brief moment
            setTimeout(() => {
                setTimerFrozen(false);
            }, 500);
        }
    };

    const handleUseSkip = () => {
        if (answered) return;
        const success = usePowerUp("skipQuestion");
        if (success) {
            playButtonSound();
            showFloating("🔮 Întrebare sărită!");
            setScore((s) => s + 1); // Count as correct
            setAnswered(true);
            setFeedbackText("Ai sărit peste această întrebare cu power-up!");
            setAvatarEmotion("happy");
        }
    };

    const handleUseExtraHint = () => {
        if (answered) return;
        const success = usePowerUp("extraHint");
        if (success) {
            // Perform 50/50
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
            showFloating("💡 Indiciu Extra activat!");
        }
    };

    const handleAnswer = useCallback(
        (optionIndex: number) => {
            if (answered) return;
            if (timerRef.current) clearInterval(timerRef.current);
            setSelectedOption(optionIndex);

            const isCorrect = optionIndex === question.correctIndex;
            const isTimeout = optionIndex === -1;

            // Track timer for speed achievement
            if (isCorrect && timeLeft <= 10) {
                setAllTimerAbove10(false);
            }

            if (isCorrect) {
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > bestStreak) setBestStreak(newStreak);
                setScore((s) => s + 1);
                setAvatarEmotion("happy");

                // Combo multiplier
                const newCombo = newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : 1;
                setComboMultiplier(newCombo);

                // Earn coins per correct answer
                const earnedCoins = 5 * newCombo;
                setCoinsEarned((prev) => prev + earnedCoins);
                addCoins(earnedCoins);

                if (newStreak >= 3) {
                    playStreakSound();
                } else {
                    playCorrectSound();
                }

                if (newStreak >= 10) {
                    showFloating(`🔥💥 COMBO x3! +${earnedCoins}💰`);
                    setFeedbackText(
                        avatarMode === "child"
                            ? `INCREDIBIL! ${newStreak} la rând! COMBO x3! +${earnedCoins} monede! 🔥🔥🔥`
                            : `Excepțional. Serie de ${newStreak}. Multiplicator x3. +${earnedCoins} monede.`
                    );
                } else if (newStreak >= 5) {
                    showFloating(`⚡ COMBO x2! +${earnedCoins}💰`);
                    setFeedbackText(
                        avatarMode === "child"
                            ? `Super! ${newStreak} la rând! COMBO x2! +${earnedCoins} monede! ⚡`
                            : `Excelent. ${newStreak} consecutive. Multiplicator x2. +${earnedCoins} monede.`
                    );
                } else if (newStreak >= 3) {
                    showFloating(`🔥 Streak x${newStreak}! +${earnedCoins}💰`);
                    setFeedbackText(
                        avatarMode === "child"
                            ? `Bravo! ${newStreak} la rând! +${earnedCoins} monede! 🔥`
                            : `Bine. ${newStreak} consecutive. +${earnedCoins} monede.`
                    );
                } else {
                    showFloating(`✅ +${earnedCoins}💰`);
                    setFeedbackText(
                        avatarMode === "child"
                            ? `Bravo! Ai răspuns corect! +${earnedCoins} monede! 🎉`
                            : `Corect. +${earnedCoins} monede.`
                    );
                }

                setAnswered(true);
            } else {
                // Shield protection
                if (shieldActive && !isTimeout) {
                    setShieldActive(false);
                    playShieldSound();
                    showFloating("🛡️ Scut-ul te-a protejat!");
                    setFeedbackText(
                        avatarMode === "child"
                            ? "Fiuu! Scutul te-a salvat! Alege din nou! 🛡️"
                            : "Scutul a absorbit impactul. Mai ai o șansă."
                    );
                    setAvatarEmotion("thinking");
                    // Don't mark as answered — let them try again
                    setSelectedOption(null);
                    return;
                }

                setStreak(0);
                setComboMultiplier(1);
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

                setAnswered(true);
            }
        },
        [answered, question, streak, bestStreak, avatarMode, setAvatarEmotion,
            shieldActive, timeLeft, addCoins]
    );

    const handleHint = useCallback(() => {
        if (hintsLeft <= 0 || answered) return;
        setHintsLeft((h) => h - 1);

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
            updateBestStreak(bestStreak);
            addQuestionsAnswered(score, quizQuestions.length);

            // Determine color and stars
            let color: "red" | "yellow" | "green";
            let stars: number;
            if (score === 20) {
                color = "green";
                stars = 3;
                addXp(3);
                addCoins(50); // Bonus for perfect
                playCoinSound();
            } else if (score >= 15) {
                color = "yellow";
                stars = 2;
                addXp(1);
                addCoins(20);
            } else if (score >= 10) {
                color = "red";
                stars = 1;
                addCoins(10);
            } else {
                color = "red";
                stars = 0;
                loseLife(); // Bad score costs a life
            }

            if (currentCounty) {
                setCountyColor(currentCounty, color);
                setCountyStars(currentCounty, stars);
            }
            setPhase("result");
            setAvatarEmotion("hello");
            triggerAchievementCheck();
        } else {
            setCurrentQ((prev) => prev + 1);
            setSelectedOption(null);
            setAnswered(false);
            setFeedbackText("");
            setHiddenOptions(new Set());
            setShieldActive(false);
            setShieldUsedThisQ(false);
            setTimerFrozen(false);
            setAvatarEmotion("thinking");
        }
    }, [isLast, score, currentCounty, bestStreak, quizQuestions.length,
        setQuizScore, setCountyColor, setCountyStars, setPhase,
        addXp, addCoins, loseLife, setAvatarEmotion,
        updateBestStreak, addQuestionsAnswered, triggerAchievementCheck]);

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

            {/* Header with score, streak and combo */}
            <div className="quiz-header">
                <span className="quiz-counter">
                    {currentQ + 1} / {quizQuestions.length}
                </span>
                {streak >= 2 && (
                    <span className="streak-badge">
                        🔥 x{streak}
                    </span>
                )}
                {comboMultiplier > 1 && (
                    <span className="combo-badge">
                        ⚡ x{comboMultiplier}
                    </span>
                )}
                <span className="quiz-coins-earned">💰 {coinsEarned}</span>
                <span className="quiz-score">⭐ {score}</span>
            </div>

            {/* Progress bar */}
            <IonProgressBar value={progress} color="primary" className="quiz-progress" />

            {/* Timer bar */}
            <div className={`timer-bar-container ${timerUrgent ? "urgent" : ""} ${timerFrozen ? "frozen" : ""}`}>
                <div
                    className="timer-bar-fill"
                    style={{ width: `${timerPercent * 100}%` }}
                />
                <span className="timer-text">
                    {answered ? "—" : timerFrozen ? `❄️ ${timeLeft}s` : `⏱ ${timeLeft}s`}
                </span>
            </div>

            {/* Question */}
            <div className={`quiz-question ${shakeQuestion ? "shake" : ""}`}>
                {question.question}
            </div>

            {/* Power-up buttons */}
            {!answered && (
                <div className="quiz-powerups">
                    {powerUps.shield > 0 && !shieldUsedThisQ && (
                        <button className={`powerup-btn ${shieldActive ? "active" : ""}`} onClick={handleUseShield}>
                            🛡️ {powerUps.shield}
                        </button>
                    )}
                    {powerUps.timeFreeze > 0 && (
                        <button className="powerup-btn" onClick={handleUseFreeze}>
                            ❄️ {powerUps.timeFreeze}
                        </button>
                    )}
                    {powerUps.extraHint > 0 && (
                        <button className="powerup-btn" onClick={handleUseExtraHint}>
                            💡 {powerUps.extraHint}
                        </button>
                    )}
                    {powerUps.skipQuestion > 0 && (
                        <button className="powerup-btn" onClick={handleUseSkip}>
                            🔮 {powerUps.skipQuestion}
                        </button>
                    )}
                </div>
            )}

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
