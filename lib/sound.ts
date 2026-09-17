/**
 * Intro sound design, synthesized so there is no audio file to load. The palette
 * is an electric car waking up: an inverter whine rising, soft air moving past,
 * and a warm chord with glass bells when the name arrives, all in a shared room reverb.
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
type Rig = { ctx: AudioContext; dry: AudioNode; wet: AudioNode };
let rig: Rig | null = null;

function makeImpulse(ctx: AudioContext, secs: number, decay: number) {
  const len = Math.floor(ctx.sampleRate * secs);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function audio(): Rig | null {
  if (typeof window === "undefined" || !soundEnabled()) return null;
  if (!rig) {
    const AC: Ctor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 3;
    const master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(comp).connect(ctx.destination);

    const verb = ctx.createConvolver();
    verb.buffer = makeImpulse(ctx, 3.2, 3.4);
    const verbGain = ctx.createGain();
    verbGain.gain.value = 0.55;
    verb.connect(verbGain).connect(master);

    rig = { ctx, dry: master, wet: verb };
  }
  if (rig.ctx.state === "suspended") rig.ctx.resume().catch(() => {});
  return rig;
}

/** Call from a click so browsers allow the sounds that follow. */
export function unlockAudio() {
  audio();
}

/** Route a voice to the room: some dry, some into the reverb, optionally panned. */
function send(r: Rig, node: AudioNode, wet: number, pan = 0) {
  let out: AudioNode = node;
  if (pan !== 0) {
    const p = r.ctx.createStereoPanner();
    p.pan.value = pan;
    node.connect(p);
    out = p;
  }
  out.connect(r.dry);
  const g = r.ctx.createGain();
  g.gain.value = wet;
  out.connect(g).connect(r.wet);
}

function env(ctx: AudioContext, t: number, peak: number, attack: number, release: number) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  return g;
}

function noise(ctx: AudioContext, secs: number) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * secs), ctx.sampleRate);
  const d = buf.getChannelData(0);
  // pinkish: soften the top end so air sounds like air, not hiss
  let b = 0;
  for (let i = 0; i < d.length; i++) {
    b = 0.97 * b + 0.03 * (Math.random() * 2 - 1);
    d[i] = b * 6;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

/** The inverter: two clean partials gliding together, like a motor spinning up. */
function whine(r: Rig, t: number, from: number, to: number, dur: number, peak: number, pan = 0) {
  const { ctx } = r;
  const g = env(ctx, t, peak, dur * 0.7, dur * 0.5);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3200;
  [1, 2.01, 3.02].forEach((mult, i) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(from * mult, t);
    o.frequency.exponentialRampToValueAtTime(to * mult, t + dur);
    const og = ctx.createGain();
    og.gain.value = [1, 0.35, 0.12][i];
    o.connect(og).connect(lp);
    o.start(t);
    o.stop(t + dur * 1.3);
  });
  lp.connect(g);
  send(r, g, 0.35, pan);
}

function air(r: Rig, t: number, dur: number, fromHz: number, toHz: number, peak: number, panFrom = 0, panTo = 0) {
  const { ctx } = r;
  const n = noise(ctx, dur + 0.2);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(fromHz, t);
  bp.frequency.exponentialRampToValueAtTime(toHz, t + dur);
  const g = env(ctx, t, peak, dur * 0.45, dur * 0.55);
  const p = ctx.createStereoPanner();
  p.pan.setValueAtTime(panFrom, t);
  p.pan.linearRampToValueAtTime(panTo, t + dur);
  n.connect(bp).connect(g).connect(p);
  send(r, p, 0.4);
  n.start(t);
  n.stop(t + dur + 0.2);
}

/** A glass bell: a sine carrier with a decaying inharmonic modulator. */
function bell(r: Rig, t: number, f: number, peak: number, pan = 0) {
  const { ctx } = r;
  const car = ctx.createOscillator();
  car.frequency.value = f;
  const mod = ctx.createOscillator();
  mod.frequency.value = f * 3.5;
  const idx = ctx.createGain();
  idx.gain.setValueAtTime(f * 1.6, t);
  idx.gain.exponentialRampToValueAtTime(1, t + 1.4);
  mod.connect(idx).connect(car.frequency);
  const g = env(ctx, t, peak, 0.004, 2.8);
  car.connect(g);
  send(r, g, 0.8, pan);
  car.start(t);
  mod.start(t);
  car.stop(t + 3);
  mod.stop(t + 3);
}

function sub(r: Rig, t: number, from: number, to: number, peak: number, release = 1.2) {
  const { ctx } = r;
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + 0.6);
  const g = env(ctx, t, peak, 0.02, release);
  o.connect(g).connect(r.dry);
  o.start(t);
  o.stop(t + release + 0.1);
}

/** Power up: the motor spins up while the air draws in. */
export function playRiser(dur = 0.75) {
  const r = audio();
  if (!r) return;
  const t = r.ctx.currentTime;
  whine(r, t, 110, 660, dur, 0.09);
  air(r, t, dur, 400, 3800, 0.22);
}

/** Between shapes: an electric car passing, left to right. */
export function playWhoosh(dur = 0.75) {
  const r = audio();
  if (!r) return;
  const t = r.ctx.currentTime;
  air(r, t, dur, 2200, 380, 0.26, -0.7, 0.7);
  whine(r, t, 520, 300, dur, 0.035, 0.2);
}

/**
 * Arrival. At full strength a warm E add9 chord blooms with bells over a soft
 * sub; lighter strengths are a thump with a single bell.
 */
export function playImpact(strength = 1) {
  const r = audio();
  if (!r) return;
  const { ctx } = r;
  const t = ctx.currentTime;
  sub(r, t, 90, 42, 0.55 * strength, strength < 0.8 ? 0.8 : 1.6);

  if (strength < 0.8) {
    air(r, t, 0.5, 900, 220, 0.12);
    bell(r, t + 0.02, 987.77, 0.05, 0.25);
    return;
  }

  // pad: detuned saws through a filter that opens, then settles
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 0.6;
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.exponentialRampToValueAtTime(3200, t + 0.9);
  lp.frequency.exponentialRampToValueAtTime(900, t + 4);
  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0.0001, t);
  padGain.gain.exponentialRampToValueAtTime(0.5, t + 0.35);
  padGain.gain.exponentialRampToValueAtTime(0.0001, t + 4.6);
  lp.connect(padGain);
  send(r, padGain, 0.6);
  [82.41, 164.81, 246.94, 369.99, 415.3, 493.88].forEach((f, i) => {
    for (const detune of [-8, 8]) {
      const o = ctx.createOscillator();
      o.type = i === 0 ? "sine" : "sawtooth";
      o.frequency.value = f;
      o.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.18 : 0.022;
      o.connect(g).connect(lp);
      o.start(t);
      o.stop(t + 4.8);
    }
  });

  // bells: a slow rising arpeggio across the stereo field
  [
    { f: 830.61, at: 0.06, pan: -0.45 },
    { f: 987.77, at: 0.26, pan: 0.1 },
    { f: 1318.51, at: 0.46, pan: 0.5 },
  ].forEach((b) => bell(r, t + b.at, b.f, 0.07, b.pan));
}

/** A soft glass tick for hovering choices. */
export function playTick() {
  const r = audio();
  if (!r) return;
  const { ctx } = r;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.value = 2350;
  const g = env(ctx, t, 0.035, 0.002, 0.08);
  o.connect(g);
  send(r, g, 0.25);
  o.start(t);
  o.stop(t + 0.12);
}

/** Confirming a choice: two quick bells, a fifth apart. */
export function playSelect() {
  const r = audio();
  if (!r) return;
  const t = r.ctx.currentTime;
  bell(r, t, 659.25, 0.05, -0.2);
  bell(r, t + 0.09, 987.77, 0.05, 0.2);
  sub(r, t, 70, 45, 0.25, 0.5);
}

/* ------------------------------------------------------------------ the drive */

let engine: { osc: OscillatorNode[]; gain: GainNode; filter: BiquadFilterNode; road: AudioBufferSourceNode; roadGain: GainNode } | null = null;

/** Start the electric drivetrain: a quiet whine plus road noise, both tied to speed. */
export function startEngine() {
  const r = audio();
  if (!r || engine) return;
  const { ctx } = r;
  const t = ctx.currentTime;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 520;
  filter.Q.value = 0.4;
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  filter.connect(gain);
  send(r, gain, 0.12);

  // three sine partials, slightly detuned: a hum rather than a buzz
  const osc = [1, 2.005, 2.99].map((mult, i) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = 62 * mult;
    o.detune.value = [0, 5, -6][i];
    const g = ctx.createGain();
    g.gain.value = [0.6, 0.22, 0.1][i];
    o.connect(g).connect(filter);
    o.start(t);
    return o;
  });

  // tyre roar: looping noise under a lowpass
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b = 0;
  for (let i = 0; i < d.length; i++) {
    b = 0.985 * b + 0.015 * (Math.random() * 2 - 1);
    d[i] = b * 5;
  }
  const road = ctx.createBufferSource();
  road.buffer = buf;
  road.loop = true;
  const roadFilter = ctx.createBiquadFilter();
  roadFilter.type = "lowpass";
  roadFilter.frequency.value = 340;
  const roadGain = ctx.createGain();
  roadGain.gain.value = 0.0001;
  road.connect(roadFilter).connect(roadGain);
  send(r, roadGain, 0.15);
  road.start(t);

  engine = { osc, gain, filter, road, roadGain };
}

/** speed is 0 to 1 */
export function setEngineSpeed(speed: number) {
  if (!engine || !rig) return;
  const t = rig.ctx.currentTime;
  const s = Math.max(0, Math.min(1, speed));
  // gentle range, gentle slopes: it should sit under everything, never whine
  engine.osc.forEach((o, i) => o.frequency.setTargetAtTime((62 + s * 96) * [1, 2.005, 2.99][i], t, 0.6));
  engine.filter.frequency.setTargetAtTime(420 + s * 520, t, 0.7);
  engine.gain.gain.setTargetAtTime(0.0001 + s * 0.028, t, 0.6);
  engine.roadGain.gain.setTargetAtTime(0.0001 + s * 0.02, t, 0.7);
}

export function stopEngine() {
  if (!engine || !rig) return;
  const { ctx } = rig;
  const t = ctx.currentTime;
  engine.gain.gain.setTargetAtTime(0.0001, t, 0.2);
  engine.roadGain.gain.setTargetAtTime(0.0001, t, 0.2);
  const e = engine;
  engine = null;
  setTimeout(() => {
    e.osc.forEach((o) => {
      try {
        o.stop();
      } catch {}
    });
    try {
      e.road.stop();
    } catch {}
  }, 900);
}

/** Pulling over at a chapter: a soft double chime. */
export function playArrive() {
  const r = audio();
  if (!r) return;
  const t = r.ctx.currentTime;
  bell(r, t, 523.25, 0.045, -0.15);
  bell(r, t + 0.12, 783.99, 0.05, 0.15);
  sub(r, t, 90, 55, 0.2, 0.7);
}

/** One quiet blip while a line types out. */
export function playType() {
  const r = audio();
  if (!r) return;
  const { ctx } = r;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.value = 1400 + Math.random() * 260;
  const g = env(ctx, t, 0.012, 0.002, 0.04);
  o.connect(g);
  send(r, g, 0.15);
  o.start(t);
  o.stop(t + 0.07);
}

/** A badge unlocking: three bells climbing. */
export function playBadge() {
  const r = audio();
  if (!r) return;
  const t = r.ctx.currentTime;
  [659.25, 987.77, 1318.51].forEach((f, i) => bell(r, t + i * 0.09, f, 0.055, -0.3 + i * 0.3));
}

/** A short buzz on phones that support it; silent everywhere else. */
export function buzz(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !soundEnabled()) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}
