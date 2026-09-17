/**
 * The power-on sound, synthesized so there is no audio file to load: a relay
 * click, a low hum swelling in, and a two-note rising chime as the board comes up.
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

export function playPowerOn() {
  if (typeof window === "undefined" || !soundEnabled()) return;
  const AC: Ctor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);

  // relay click: a very short burst of noise
  const click = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
  const data = click.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
  const clickSrc = ctx.createBufferSource();
  clickSrc.buffer = click;
  const clickGain = ctx.createGain();
  clickGain.gain.value = 0.9;
  clickSrc.connect(clickGain).connect(master);
  clickSrc.start(now);

  // low hum rising as the rails charge
  const hum = ctx.createOscillator();
  hum.type = "sawtooth";
  hum.frequency.setValueAtTime(55, now + 0.05);
  hum.frequency.exponentialRampToValueAtTime(110, now + 0.9);
  const humFilter = ctx.createBiquadFilter();
  humFilter.type = "lowpass";
  humFilter.frequency.value = 420;
  const humGain = ctx.createGain();
  humGain.gain.setValueAtTime(0.0001, now);
  humGain.gain.exponentialRampToValueAtTime(0.22, now + 0.5);
  humGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
  hum.connect(humFilter).connect(humGain).connect(master);
  hum.start(now + 0.05);
  hum.stop(now + 1.5);

  // two-note chime: ready
  [
    { f: 659.25, t: 0.95 },
    { f: 987.77, t: 1.15 },
  ].forEach(({ f, t }) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now + t);
    g.gain.exponentialRampToValueAtTime(0.35, now + t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.9);
    o.connect(g).connect(master);
    o.start(now + t);
    o.stop(now + t + 1);
  });

  setTimeout(() => ctx.close().catch(() => {}), 2600);
}

/** A tiny tick for hovering operator choices. */
export function playTick() {
  if (typeof window === "undefined" || !soundEnabled()) return;
  const AC: Ctor | undefined = window.AudioContext;
  if (!AC) return;
  const ctx = new AC();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = 1760;
  g.gain.setValueAtTime(0.03, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.06);
  setTimeout(() => ctx.close().catch(() => {}), 200);
}
