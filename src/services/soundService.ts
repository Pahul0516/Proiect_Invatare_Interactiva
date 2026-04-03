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
    // Happy ascending two-note chime
    playTone(523, 0.15, "sine", 0.25); // C5
    setTimeout(() => playTone(659, 0.3, "sine", 0.25), 100); // E5
}

export function playWrongSound() {
    getAudioCtx();
    // Low descending buzz
    playTone(300, 0.15, "square", 0.15);
    setTimeout(() => playTone(200, 0.3, "square", 0.15), 120);
}

export function playStreakSound() {
    getAudioCtx();
    // Ascending arpeggio
    playTone(523, 0.1, "sine", 0.2);  // C5
    setTimeout(() => playTone(659, 0.1, "sine", 0.2), 80);  // E5
    setTimeout(() => playTone(784, 0.1, "sine", 0.2), 160); // G5
    setTimeout(() => playTone(1047, 0.25, "sine", 0.25), 240); // C6
}

export function playTimerTickSound() {
    getAudioCtx();
    playTone(880, 0.05, "sine", 0.1); // short tick
}

export function playTimeoutSound() {
    getAudioCtx();
    // Low warning buzz
    playTone(150, 0.4, "sawtooth", 0.12);
}

export function playHintSound() {
    getAudioCtx();
    // Sparkle
    playTone(1200, 0.08, "sine", 0.15);
    setTimeout(() => playTone(1500, 0.08, "sine", 0.15), 60);
    setTimeout(() => playTone(1800, 0.12, "sine", 0.15), 120);
}

export function playVictorySound() {
    getAudioCtx();
    // Full victory fanfare
    const notes = [523, 523, 523, 659, 784, 784, 659, 784, 1047];
    const times = [0, 100, 200, 350, 500, 600, 750, 900, 1050];
    const durs  = [0.08, 0.08, 0.12, 0.12, 0.08, 0.12, 0.12, 0.12, 0.4];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, durs[i], "sine", 0.2), times[i]);
    });
}

export function playButtonSound() {
    getAudioCtx();
    playTone(600, 0.06, "sine", 0.1);
}
