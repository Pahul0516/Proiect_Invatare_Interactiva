// Web Audio API sound effects - no external files needed
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
}

export function playCorrectSound() {
    getAudioCtx();
    playTone(523, 0.15, "sine", 0.25);
    setTimeout(() => playTone(659, 0.3, "sine", 0.25), 100);
}

export function playWrongSound() {
    getAudioCtx();
    playTone(300, 0.15, "square", 0.15);
    setTimeout(() => playTone(200, 0.3, "square", 0.15), 120);
}

export function playStreakSound() {
    getAudioCtx();
    playTone(523, 0.1, "sine", 0.2);
    setTimeout(() => playTone(659, 0.1, "sine", 0.2), 80);
    setTimeout(() => playTone(784, 0.1, "sine", 0.2), 160);
    setTimeout(() => playTone(1047, 0.25, "sine", 0.25), 240);
}

export function playTimerTickSound() {
    getAudioCtx();
    playTone(880, 0.05, "sine", 0.1);
}

export function playTimeoutSound() {
    getAudioCtx();
    playTone(150, 0.4, "sawtooth", 0.12);
}

export function playHintSound() {
    getAudioCtx();
    playTone(1200, 0.08, "sine", 0.15);
    setTimeout(() => playTone(1500, 0.08, "sine", 0.15), 60);
    setTimeout(() => playTone(1800, 0.12, "sine", 0.15), 120);
}

export function playVictorySound() {
    getAudioCtx();
    const notes = [523, 523, 523, 659, 784, 784, 659, 784, 1047];
    const times = [0, 100, 200, 350, 500, 600, 750, 900, 1050];
    const durs = [0.08, 0.08, 0.12, 0.12, 0.08, 0.12, 0.12, 0.12, 0.4];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, durs[i], "sine", 0.2), times[i]);
    });
}

export function playButtonSound() {
    getAudioCtx();
    playTone(600, 0.06, "sine", 0.1);
}

// ─── NEW GAME SOUNDS ─────────────────────────────────────────

export function playCoinSound() {
    getAudioCtx();
    playTone(1320, 0.06, "sine", 0.2);
    setTimeout(() => playTone(1760, 0.1, "sine", 0.2), 50);
    setTimeout(() => playTone(2640, 0.15, "sine", 0.15), 100);
}

export function playAchievementSound() {
    getAudioCtx();
    // Epic ascending fanfare
    const notes = [523, 659, 784, 1047, 1319, 1568];
    const times = [0, 80, 160, 280, 400, 520];
    const durs = [0.1, 0.1, 0.12, 0.12, 0.12, 0.4];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, durs[i], "sine", 0.18), times[i]);
    });
}

export function playLevelUpSound() {
    getAudioCtx();
    // Dramatic rising + resolution
    const notes = [262, 330, 392, 523, 659, 784, 1047];
    const times = [0, 100, 200, 350, 500, 650, 850];
    const durs = [0.08, 0.08, 0.1, 0.1, 0.12, 0.12, 0.5];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, durs[i], "sine", 0.2), times[i]);
    });
    // Add sparkle harmonics
    setTimeout(() => playTone(2093, 0.3, "sine", 0.08), 900);
    setTimeout(() => playTone(2637, 0.3, "sine", 0.06), 1000);
}

export function playLifeLostSound() {
    getAudioCtx();
    playTone(440, 0.15, "sawtooth", 0.12);
    setTimeout(() => playTone(350, 0.15, "sawtooth", 0.12), 120);
    setTimeout(() => playTone(260, 0.3, "sawtooth", 0.1), 240);
}

export function playPurchaseSound() {
    getAudioCtx();
    // Cash register ching
    playTone(800, 0.05, "sine", 0.15);
    setTimeout(() => playTone(1200, 0.05, "sine", 0.15), 40);
    setTimeout(() => playTone(1600, 0.08, "sine", 0.2), 80);
    setTimeout(() => playTone(2400, 0.15, "sine", 0.15), 120);
}

export function playShieldSound() {
    getAudioCtx();
    // Deep protective resonance
    playTone(200, 0.3, "sine", 0.15);
    playTone(400, 0.3, "sine", 0.1);
    setTimeout(() => playTone(600, 0.2, "sine", 0.12), 150);
}

export function playFreezeSound() {
    getAudioCtx();
    // Crystalline freeze
    playTone(2000, 0.15, "sine", 0.1);
    setTimeout(() => playTone(1800, 0.15, "sine", 0.1), 50);
    setTimeout(() => playTone(1600, 0.15, "sine", 0.1), 100);
    setTimeout(() => playTone(1400, 0.2, "sine", 0.08), 150);
}

export function playDailySound() {
    getAudioCtx();
    // Notification chime
    playTone(880, 0.1, "sine", 0.15);
    setTimeout(() => playTone(1100, 0.1, "sine", 0.15), 80);
    setTimeout(() => playTone(1320, 0.15, "sine", 0.18), 160);
    setTimeout(() => playTone(1760, 0.2, "sine", 0.12), 260);
}

export function playStarSound() {
    getAudioCtx();
    playTone(880, 0.08, "sine", 0.2);
    setTimeout(() => playTone(1320, 0.12, "sine", 0.2), 70);
}

export function playGameStartSound() {
    getAudioCtx();
    // Epic game start
    playTone(262, 0.12, "sine", 0.2);
    setTimeout(() => playTone(330, 0.12, "sine", 0.2), 100);
    setTimeout(() => playTone(392, 0.12, "sine", 0.2), 200);
    setTimeout(() => playTone(523, 0.3, "sine", 0.25), 350);
    setTimeout(() => {
        playTone(523, 0.06, "sine", 0.12);
        playTone(659, 0.06, "sine", 0.12);
        playTone(784, 0.06, "sine", 0.12);
    }, 550);
}
