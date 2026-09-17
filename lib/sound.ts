/**
 * Intro sound design, synthesized so there is no audio file to load:
 * a riser into the implosion, whooshes between shapes, and an impact under the name.
 */
export const SOUND_STORAGE_KEY = "riz-sound";

export function soundEnabled(): boolean {
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, on ? "on" : "off");
  } catch {}
}

type Ctor = typeof AudioContext;
let shared: { ctx: AudioContext; out: AudioNode } | null = null;

function audio() {
  if (typeof window === "undefined" || !soundEnabled()) return null;
  if (!shared) {
    const AC: Ctor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    const gain = ctx.createGain();
    gain.gain.value = 0.75;
    gain.connect(comp).connect(ctx.destination);
    shared = { ctx, out: gain };
  }
  if (shared.ctx.state === "suspended") shared.ctx.resume().catch(() => {});
  return shared;
}

/** Call from a click so browsers allow the sounds that follow. */
export function unlockAudio() {
  audio();
}

function noise(ctx: AudioContext, secs: number) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * secs), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function env(ctx: AudioContext, t: number, peak: number, attack: number, release: number) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  return g;
}

export function playRiser(dur = 0.75) {
  const a = audio();
  if (!a) return;
  const { ctx, out } = a;
  const t = ctx.currentTime;
  const n = noise(ctx, dur + 0.2);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 2.5;
  bp.frequency.setValueAtTime(300, t);
  bp.frequency.exponentialRampToValueAtTime(5200, t + dur);
  n.connect(bp).connect(env(ctx, t, 0.45, dur * 0.95, 0.1)).connect(out);
  n.start(t);
  n.stop(t + dur + 0.2);

  const o = ctx.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(70, t);
  o.frequency.exponentialRampToValueAtTime(280, t + dur);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(300, t);
  lp.frequency.exponentialRampToValueAtTime(2400, t + dur);
  o.connect(lp).connect(env(ctx, t, 0.16, dur * 0.9, 0.08)).connect(out);
  o.start(t);
  o.stop(t + dur + 0.2);
}

export function playWhoosh(dur = 0.75) {
  const a = audio();
  if (!a) return;
  const { ctx, out } = a;
  const t = ctx.currentTime;
  const n = noise(ctx, dur + 0.1);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.1;
  bp.frequency.setValueAtTime(2600, t);
  bp.frequency.exponentialRampToValueAtTime(320, t + dur);
  n.connect(bp).connect(env(ctx, t, 0.3, dur * 0.35, dur * 0.65)).connect(out);
  n.start(t);
  n.stop(t + dur + 0.1);
}

/** A sub drop and noise burst; at full strength a bright chord rings over it. */
export function playImpact(strength = 1) {
  const a = audio();
  if (!a) return;
  const { ctx, out } = a;
  const t = ctx.currentTime;

  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(120, t);
  sub.frequency.exponentialRampToValueAtTime(36, t + 0.9);
  sub.connect(env(ctx, t, 0.9 * strength, 0.01, 1.6)).connect(out);
  sub.start(t);
  sub.stop(t + 1.8);

  const n = noise(ctx, 0.7);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(2200, t);
  lp.frequency.exponentialRampToValueAtTime(180, t + 0.5);
  n.connect(lp).connect(env(ctx, t, 0.45 * strength, 0.005, 0.55)).connect(out);
  n.start(t);
  n.stop(t + 0.7);

  if (strength < 0.8) return;
  [329.63, 493.88, 659.25, 987.77].forEach((f, i) => {
    for (const detune of [-6, 6]) {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = detune;
      o.connect(env(ctx, t + 0.02, 0.05, 0.06, 2.8)).connect(out);
      o.start(t);
      o.stop(t + 3.1);
    }
  });
}

/** A tiny tick for hovering operator choices. */
export function playTick() {
  const a = audio();
  if (!a) return;
  const { ctx, out } = a;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "square";
  o.frequency.value = 1760;
  o.connect(env(ctx, t, 0.03, 0.002, 0.05)).connect(out);
  o.start(t);
  o.stop(t + 0.07);
}
