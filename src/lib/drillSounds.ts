// Lightweight WebAudio sound effects for drills. No external assets.
// Respects a "drill-sound" localStorage flag ("on" | "off"). Defaults to on.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    return ctx;
  } catch {
    return null;
  }
}

export function isSoundOn(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("drill-sound") !== "off";
}

export function setSoundOn(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("drill-sound", on ? "on" : "off");
}

function tone(freq: number, durationMs: number, type: OscillatorType = "sine", gain = 0.08, delayMs = 0) {
  const audio = getCtx();
  if (!audio) return;
  const start = audio.currentTime + delayMs / 1000;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(start);
  osc.stop(start + durationMs / 1000 + 0.02);
}

export const drillSfx = {
  correct() {
    if (!isSoundOn()) return;
    tone(660, 90, "triangle", 0.09);
    tone(880, 140, "triangle", 0.09, 80);
  },
  wrong() {
    if (!isSoundOn()) return;
    tone(220, 180, "sawtooth", 0.06);
    tone(160, 220, "sawtooth", 0.06, 100);
  },
  streak() {
    if (!isSoundOn()) return;
    tone(784, 80, "triangle", 0.09);
    tone(988, 80, "triangle", 0.09, 70);
    tone(1319, 160, "triangle", 0.09, 140);
  },
  loseLife() {
    if (!isSoundOn()) return;
    tone(300, 120, "square", 0.05);
    tone(180, 200, "square", 0.06, 110);
  },
  finish() {
    if (!isSoundOn()) return;
    tone(523, 120, "triangle", 0.09);
    tone(659, 120, "triangle", 0.09, 110);
    tone(784, 200, "triangle", 0.09, 220);
  },
  badge() {
    if (!isSoundOn()) return;
    tone(880, 90, "sine", 0.08);
    tone(1175, 90, "sine", 0.08, 80);
    tone(1568, 200, "sine", 0.09, 160);
  },
};
