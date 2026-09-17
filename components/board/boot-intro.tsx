"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react/dist/ssr";
import * as THREE from "three";
import { modes, type Mode, type ModeId } from "@/lib/modes";
import { playImpact, playRiser, playSelect, playTick, playWhoosh, setSoundEnabled, soundEnabled, unlockAudio } from "@/lib/sound";
import { ParticleCinema, type Cue } from "./particle-cinema";
import { RobotModel } from "./robot-model";

const EASE = [0.16, 1, 0.3, 1] as const;
const INTRO_ACCENT = "#3fa9ff";

const SCENES = [
  { n: "01", title: "Embedded systems", line: "Firmware, CAN bus and real-time control" },
  { n: "02", title: "Robotics", line: "An assistive knee actuator, from sketch to patent" },
  { n: "03", title: "Autonomy", line: "A mobile robot I built, then trained with reinforcement learning" },
];

// milliseconds after Enter
const TIMELINE: { at: number; cue: Cue; scene: number; sound: () => void }[] = [
  { at: 0, cue: "core", scene: -1, sound: () => playRiser(0.75) },
  { at: 780, cue: "chip", scene: 0, sound: () => playImpact(0.55) },
  { at: 2700, cue: "arm", scene: 1, sound: () => playWhoosh() },
  { at: 4500, cue: "car", scene: 2, sound: () => playWhoosh() },
  { at: 6300, cue: "name", scene: -1, sound: () => playWhoosh(0.9) },
];
const NAME_AT = 7400;
const DUST_AT = 9500;
const SELECT_AT = 10000;

function SpinningRobot({ mode, active, reduce }: { mode: Mode; active: boolean; reduce: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!g.current || reduce) return;
    g.current.rotation.y += delta * (active ? 2.4 : 0.5);
    g.current.position.y = active ? Math.abs(Math.sin(clock.getElapsedTime() * 6)) * 0.08 : 0;
  });
  return (
    <group ref={g} rotation={[0, reduce ? 0.6 : 0, 0]}>
      <RobotModel plate={mode.accent} accessory={mode.accessory} showCone={false} />
    </group>
  );
}

function Avatar({ mode, active, reduce }: { mode: Mode; active: boolean; reduce: boolean }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [1.6, 1.25, 1.9], fov: 32 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <pointLight position={[-2, 1, 2]} intensity={6} color={mode.accent} />
      <group position={[0, -0.25, 0]}>
        <SpinningRobot mode={mode} active={active} reduce={reduce} />
      </group>
      <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 40]} />
        <meshBasicMaterial color={mode.accent} transparent opacity={active ? 0.35 : 0.12} toneMapped={false} />
      </mesh>
    </Canvas>
  );
}

/** Text that slides up from behind a mask. */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-1 ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        exit={{ y: "-110%", transition: { duration: 0.35, ease: EASE } }}
        transition={{ duration: 0.8, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function ChicagoClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now}</span>;
}

type Props = {
  /** "gate" plays the intro from the Enter button; "select" goes straight to operators */
  start: "gate" | "select";
  current?: ModeId | null;
  accents?: Record<ModeId, string>;
  onSelect: (mode: ModeId) => void;
  onDismiss?: () => void;
};

export function BootIntro({ start, current, accents, onSelect, onDismiss }: Props) {
  const reduce = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<"gate" | "show" | "select">(start);
  const [cue, setCue] = useState<Cue>(start === "gate" ? "idle" : "dust");
  const [scene, setScene] = useState(-1);
  const [named, setNamed] = useState(false);
  const [flash, setFlash] = useState(0);
  const [pct, setPct] = useState(start === "gate" ? 0 : 100);
  const [focus, setFocus] = useState(Math.max(0, modes.findIndex((m) => m.id === current)));
  const [sound, setSound] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => setSound(soundEnabled()), []);

  // loading count while the particle shapes are prepared
  useEffect(() => {
    if (phase !== "gate") return;
    if (reduce) {
      setPct(100);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / 1700);
      setPct(Math.round((1 - Math.pow(1 - k, 3)) * 100));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, reduce]);

  const clearTimers = () => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const toSelect = useCallback(() => {
    clearTimers();
    setScene(-1);
    setNamed(false);
    setCue("dust");
    setPhase("select");
  }, []);

  const enter = useCallback(
    (withSound: boolean) => {
      setSound(withSound);
      setSoundEnabled(withSound);
      unlockAudio();
      if (reduce) return toSelect();
      setPhase("show");
      const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
      TIMELINE.forEach((s) =>
        at(s.at, () => {
          setCue(s.cue);
          setScene(s.scene);
          s.sound();
          if (s.cue === "chip") setFlash((f) => f + 1);
        }),
      );
      at(NAME_AT, () => {
        setNamed(true);
        playImpact(1);
      });
      at(DUST_AT, () => {
        setNamed(false);
        setCue("dust");
        playWhoosh(1);
      });
      at(SELECT_AT, () => setPhase("select"));
    },
    [reduce, toSelect],
  );

  const choose = useCallback(
    (id: ModeId) => {
      if (leaving) return;
      setLeaving(true);
      playSelect();
      setTimeout(() => onSelect(id), reduce ? 0 : 550);
    },
    [leaving, onSelect, reduce],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "gate") {
        if (e.key === "Enter" && pct >= 100) enter(soundEnabled());
        return;
      }
      if (phase === "show") return toSelect();
      const byKey = modes.find((m) => m.key === e.key);
      if (byKey) return choose(byKey.id);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setFocus((f) => (f + 1) % modes.length);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setFocus((f) => (f - 1 + modes.length) % modes.length);
      if (e.key === "Enter") choose(modes[focus].id);
      if (e.key === "Escape" && onDismiss) onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, pct, focus, enter, choose, toSelect, onDismiss]);

  const hud = "font-mono text-[0.62rem] tracking-[0.28em] uppercase sm:text-[0.68rem]";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={phase === "select" ? "Who's operating?" : "Intro"}
      className="fixed inset-0 z-[80] overflow-hidden bg-[#04060a] text-white"
      initial={{ opacity: start === "select" ? 0 : 1 }}
      animate={{ opacity: leaving ? 0 : 1, scale: leaving && !reduce ? 1.03 : 1 }}
      transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
    >
      <ParticleCinema cue={cue} reduce={reduce} accent={INTRO_ACCENT} />

      {/* the flash as the core bursts into the first shape */}
      {flash > 0 && (
        <motion.span
          key={flash}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(210,232,255,0.55),rgba(63,169,255,0.18)_35%,transparent_70%)]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      )}

      {/* viewfinder corners */}
      {!reduce &&
        ["top-4 left-4 border-t border-l", "top-4 right-4 border-t border-r", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((c) => (
          <span key={c} aria-hidden className={`pointer-events-none absolute h-4 w-4 border-white/30 sm:h-5 sm:w-5 ${c}`} />
        ))}

      {/* top line */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-8 pt-8 sm:px-10">
        <div className={hud}>
          <p className="text-white/70">Mohamed Rizwan Ameer John</p>
          <p className="mt-1.5 hidden text-white/35 sm:block">Robotics · Embedded · Autonomy</p>
        </div>
        <div className="flex items-center gap-5">
          {phase === "show" && (
            <button type="button" onClick={toSelect} className={`${hud} whitespace-nowrap text-white/55 transition-colors hover:text-white`}>
              Skip intro
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const next = !sound;
              setSound(next);
              setSoundEnabled(next);
            }}
            aria-label={sound ? "Mute sound" : "Turn sound on"}
            className={`${hud} flex items-center gap-2 text-white/55 transition-colors hover:text-white`}
          >
            {sound ? <SpeakerHigh size={14} aria-hidden /> : <SpeakerSlash size={14} aria-hidden />}
            <span className="hidden sm:inline">{sound ? "Sound on" : "Muted"}</span>
          </button>
        </div>
      </div>

      {/* bottom line */}
      {phase !== "select" && (
        <div className={`${hud} absolute right-8 bottom-8 hidden text-right text-white/35 sm:right-10 sm:block`}>
          <p>Chicago, IL</p>
          <p className="mt-1.5 text-white/55">
            <ChicagoClock />
          </p>
        </div>
      )}
      {phase === "show" && (
        <div className="absolute inset-x-8 bottom-5 h-px bg-white/10 sm:inset-x-10">
          <motion.span
            className="block h-full origin-left bg-white/60"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: SELECT_AT / 1000, ease: "linear" }}
          />
        </div>
      )}

      {/* the story, one line per shape */}
      <div className="pointer-events-none absolute bottom-12 left-8 max-w-[34rem] pr-8 sm:bottom-14 sm:left-10">
        <AnimatePresence mode="wait">
          {scene >= 0 && (
            <motion.div key={scene} exit={{ opacity: 1 }}>
              <Reveal className={`${hud} text-[#7cc4ff]`}>
                {SCENES[scene].n} <span className="text-white/35">/ 03</span>
              </Reveal>
              <Reveal delay={0.06} className="mt-2 text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] font-light tracking-tight">
                {SCENES[scene].title}
              </Reveal>
              <Reveal delay={0.14} className="mt-1 text-sm text-white/55 sm:text-base">
                {SCENES[scene].line}
              </Reveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* under the particle name */}
      <AnimatePresence>
        {named && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-[calc(50%+1.25rem)] flex flex-col items-center px-6 text-center"
            exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.5 } }}
          >
            <Reveal className="text-[clamp(1.1rem,2.4vw,1.75rem)] font-light tracking-tight text-white/90">Robotics &amp; Embedded Systems Engineer</Reveal>
            <Reveal delay={0.18} className={`${hud} mt-3 text-white/45`}>
              MS Computer Science · 3 patents filed
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* gate: loading count, then Enter */}
      <AnimatePresence>
        {phase === "gate" && (
          <motion.div
            key="gate"
            className="absolute inset-0 flex flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)", transition: { duration: 0.45, ease: EASE } }}
          >
            <AnimatePresence mode="wait">
              {pct < 100 ? (
                <motion.div key="load" className="text-center" exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}>
                  <p className={`${hud} text-white/40`}>Calibrating</p>
                  <p className="mt-2 font-mono text-5xl font-extralight tracking-tight text-white/85 tabular-nums">{String(pct).padStart(3, "0")}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="enter"
                  className="flex flex-col items-center"
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <button
                    type="button"
                    onClick={() => enter(true)}
                    aria-label="Enter with sound"
                    className="group relative grid h-36 w-36 place-items-center rounded-full sm:h-40 sm:w-40"
                  >
                    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full motion-safe:animate-[spin_18s_linear_infinite]" aria-hidden>
                      <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.5" strokeDasharray="0.6 2.2" />
                    </svg>
                    <span className="absolute inset-3 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-[2px] transition-all duration-500 group-hover:inset-1 group-hover:border-[#3fa9ff]/80 group-hover:bg-[#3fa9ff]/10 group-hover:shadow-[0_0_60px_-10px_#3fa9ff]" />
                    <span className="relative pl-[0.4em] text-sm font-medium tracking-[0.4em] uppercase">Enter</span>
                  </button>
                  <p className={`${hud} mt-7 text-white/40`}>Best experienced with sound</p>
                  <button type="button" onClick={() => enter(false)} className="mt-3 text-xs text-white/40 underline-offset-4 transition-colors hover:text-white/80 hover:underline">
                    Enter without sound
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* operators */}
      <AnimatePresence>
        {phase === "select" && (
          <motion.div
            key="select"
            className="absolute inset-0 flex items-center justify-center overflow-y-auto px-4 pt-24 pb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full max-w-5xl text-center">
              <Reveal className={`${hud} text-white/45`}>Choose your view</Reveal>
              <Reveal delay={0.08}>
                <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] font-light tracking-tight">Who&apos;s operating?</h1>
              </Reveal>
              <Reveal delay={0.16} className="mt-3 text-white/55">
                The board, the robot and the work you see change with it.
              </Reveal>

              <ul className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-5" role="listbox" aria-label="Operators">
                {modes.map((base, i) => {
                  const m = accents ? { ...base, accent: accents[base.id] } : base;
                  const active = i === focus;
                  return (
                    <motion.li
                      key={m.id}
                      role="option"
                      aria-selected={active}
                      initial={reduce ? false : { opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.25 + i * 0.09, ease: EASE }}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => {
                          if (focus !== i) playTick();
                          setFocus(i);
                        }}
                        onFocus={() => setFocus(i)}
                        onClick={() => choose(m.id)}
                        className="group relative flex w-full flex-row items-center gap-4 overflow-hidden border bg-white/[0.03] p-3 text-left backdrop-blur-md transition-all duration-500 sm:flex-col sm:p-6 sm:text-center"
                        style={{
                          borderColor: active ? m.accent : "rgba(255,255,255,0.1)",
                          boxShadow: active ? `0 30px 80px -30px ${m.accent}, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.04)",
                          transform: active && !reduce ? "translateY(-6px)" : "none",
                        }}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-aria-selected:opacity-100"
                          style={{ background: `radial-gradient(120% 80% at 50% 0%, ${m.accent}22, transparent 60%)`, opacity: active ? 1 : 0 }}
                        />
                        <span className={`${hud} absolute top-3 left-3 hidden text-white/35 sm:block`}>0{i + 1}</span>
                        <span className="relative block h-24 w-24 shrink-0 sm:h-44 sm:w-full">
                          <Avatar mode={m} active={active} reduce={reduce} />
                        </span>
                        <span className="relative block">
                          <span className="block text-xl font-medium tracking-tight sm:text-2xl" style={{ color: active ? m.accent : undefined }}>
                            {m.label}
                          </span>
                          <span className="mt-1 block text-sm text-white/55 sm:text-[0.95rem]">{m.line}</span>
                          <span className={`${hud} mt-3 hidden text-white/30 sm:block`}>Press {m.key}</span>
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
              {onDismiss && (
                <button type="button" onClick={onDismiss} className="mt-8 text-sm text-white/45 underline-offset-4 hover:text-white hover:underline">
                  Keep current mode
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
