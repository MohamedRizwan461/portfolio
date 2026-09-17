"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react/dist/ssr";
import * as THREE from "three";
import { modes, type Mode, type ModeId } from "@/lib/modes";
import { playTick, setSoundEnabled, soundEnabled } from "@/lib/sound";
import { RobotModel } from "./robot-model";
import { PowerCircuit } from "./power-circuit";
import { IntroBulb } from "./intro-bulb";
import { IntroKnife } from "./intro-knife";

const EASE = [0.16, 1, 0.3, 1] as const;
const NAME_LINES = ["MOHAMED RIZWAN", "AMEER JOHN"];
const NAME = NAME_LINES.join(" ");
const BOOT = ["power rail 3V3 ok", "CAN bus 0x18F00500 ok", "sensors ok", "coffee ok"];

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
        <meshBasicMaterial color={mode.accent} transparent opacity={active ? 0.35 : 0.14} toneMapped={false} />
      </mesh>
    </Canvas>
  );
}

type Props = {
  /** "gate" asks for the click that powers on (and allows sound); "select" goes straight to operators */
  start: "gate" | "select";
  current?: ModeId | null;
  accents?: Record<ModeId, string>;
  onSelect: (mode: ModeId) => void;
  onDismiss?: () => void;
};

export function BootIntro({ start, current, accents, onSelect, onDismiss }: Props) {
  const reduce = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<"gate" | "powering" | "select">(start);
  const [lit, setLit] = useState(0);
  const [bootLines, setBootLines] = useState(0);
  const [focus, setFocus] = useState(Math.max(0, modes.findIndex((m) => m.id === current)));
  const [sound, setSound] = useState(true);
  const [leaving, setLeaving] = useState(false);
  // three intro styles to compare; ?intro=a|b|c, and a chooser while trying them
  const [variant, setVariant] = useState<"a" | "b" | "c">("a");
  const [chooser, setChooser] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("intro");
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem("riz-intro");
    } catch {}
    const v = (q ?? saved) as "a" | "b" | "c" | null;
    if (v === "a" || v === "b" || v === "c") setVariant(v);
    setChooser(q !== null || window.location.hostname === "localhost");
  }, []);
  const pickVariant = (v: "a" | "b" | "c") => {
    setVariant(v);
    try {
      window.localStorage.setItem("riz-intro", v);
    } catch {}
  };

  useEffect(() => setSound(soundEnabled()), []);

  // the circuit plays the sound on the switch flip, which is the user's gesture
  const powerOn = useCallback(() => {
    setPhase((p) => (p === "gate" ? "powering" : p));
  }, []);

  // the name lights up letter by letter, then the log, then the operators
  useEffect(() => {
    if (phase !== "powering") return;
    if (reduce) {
      setLit(NAME.length);
      setBootLines(BOOT.length);
      const t = setTimeout(() => setPhase("select"), 500);
      return () => clearTimeout(t);
    }
    if (lit < NAME.length) {
      const t = setTimeout(() => setLit((n) => n + 1), 38);
      return () => clearTimeout(t);
    }
    if (bootLines < BOOT.length) {
      const t = setTimeout(() => setBootLines((n) => n + 1), 170);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("select"), 650);
    return () => clearTimeout(t);
  }, [phase, lit, bootLines, reduce]);

  const choose = useCallback(
    (id: ModeId) => {
      if (leaving) return;
      setLeaving(true);
      setTimeout(() => onSelect(id), reduce ? 0 : 450);
    },
    [leaving, onSelect, reduce],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "gate") return;
      if (phase === "powering") {
        setPhase("select");
        return;
      }
      const byKey = modes.find((m) => m.key === e.key);
      if (byKey) return choose(byKey.id);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setFocus((f) => (f + 1) % modes.length);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setFocus((f) => (f - 1 + modes.length) % modes.length);
      if (e.key === "Enter") choose(modes[focus].id);
      if (e.key === "Escape" && onDismiss) onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, focus, choose, powerOn, onDismiss]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={phase === "select" ? "Who's operating?" : "Power on"}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[var(--ground)] px-4 py-10"
      initial={{ opacity: start === "select" ? 0 : 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
    >
      {/* soft light behind everything */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(77,141,255,0.16),transparent_70%)]"
      />

      <button
        type="button"
        onClick={() => {
          const next = !sound;
          setSound(next);
          setSoundEnabled(next);
        }}
        aria-label={sound ? "Mute sound" : "Turn sound on"}
        className="absolute top-4 right-4 flex items-center gap-2 border border-rule px-3 py-1.5 text-sm text-ink-2 hover:border-accent hover:text-ink"
      >
        {sound ? <SpeakerHigh size={16} aria-hidden /> : <SpeakerSlash size={16} aria-hidden />}
        {sound ? "Sound on" : "Muted"}
      </button>

      <AnimatePresence mode="wait">
        {phase !== "select" ? (
          <motion.div
            key="power"
            className="relative flex w-full max-w-4xl flex-col items-center text-center"
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <h1 className="font-mono text-[clamp(1.5rem,6.4vw,4rem)] leading-tight font-bold tracking-[0.12em]">
              {NAME_LINES.map((line, li) => {
                const offset = NAME_LINES.slice(0, li).join(" ").length + (li ? 1 : 0);
                return (
                  <span key={line} className="block whitespace-nowrap">
                    {line.split("").map((ch, i) => {
                      const on = phase === "powering" && offset + i < lit;
                      return (
                        <span
                          key={i}
                          className="transition-[color,text-shadow] duration-200"
                          style={{
                            color: on ? "var(--ink)" : "color-mix(in srgb, var(--ink) 16%, transparent)",
                            textShadow: on ? "0 0 18px color-mix(in srgb, var(--accent) 90%, transparent), 0 0 42px color-mix(in srgb, var(--accent) 40%, transparent)" : "none",
                            whiteSpace: "pre",
                          }}
                        >
                          {ch}
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </h1>
            <p className="mt-4 text-lg text-ink-2 sm:text-xl">Robotics and embedded systems engineer</p>

            {phase === "gate" ? (
              <div className="mt-6 flex w-full flex-col items-center">
                {variant === "a" && <PowerCircuit key="a" onPowered={powerOn} />}
                {variant === "b" && <IntroBulb key="b" onPowered={powerOn} />}
                {variant === "c" && <IntroKnife key="c" onPowered={powerOn} />}
                {chooser && (
                  <div className="mt-5 flex items-center gap-2 border border-rule p-1 text-xs" role="radiogroup" aria-label="Intro style">
                    <span className="px-2 text-ink-2">Intro style</span>
                    {([
                      ["a", "A · Circuit"],
                      ["b", "B · Real bulb"],
                      ["c", "C · Knife switch"],
                    ] as const).map(([v, label]) => (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={variant === v}
                        onClick={() => pickVariant(v)}
                        className="px-2.5 py-1 font-medium"
                        style={variant === v ? { background: "var(--accent)", color: "var(--accent-ink)" } : { color: "var(--ink-2)" }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-10 min-h-[6rem] font-mono text-sm text-ink-2 sm:text-base" aria-live="polite">
                {BOOT.slice(0, bootLines).map((l) => (
                  <p key={l}>
                    <span className="text-accent">&gt; </span>
                    {l.replace(/ ok$/, "")}
                    <span className="text-accent-2"> ok</span>
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="select"
            className="relative w-full max-w-5xl text-center"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-tight">Who&apos;s operating?</h1>
            <p className="mt-3 text-lg text-ink-2">Pick one. The board, the robot and what you see will change with it.</p>

            <ul className="mt-10 grid gap-5 sm:grid-cols-3" role="listbox" aria-label="Operators">
              {modes.map((base, i) => {
                const m = accents ? { ...base, accent: accents[base.id] } : base;
                const active = i === focus;
                return (
                  <li key={m.id} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onMouseEnter={() => {
                        if (focus !== i) playTick();
                        setFocus(i);
                      }}
                      onFocus={() => setFocus(i)}
                      onClick={() => choose(m.id)}
                      className="group flex w-full flex-row items-center gap-4 border-2 bg-[var(--surface)] p-3 text-left transition-all duration-300 sm:flex-col sm:p-5 sm:text-center"
                      style={{
                        borderColor: active ? m.accent : "var(--rule)",
                        boxShadow: active ? `0 0 0 1px ${m.accent}, 0 20px 60px -20px ${m.accent}88` : "none",
                        transform: active && !reduce ? "translateY(-6px)" : "none",
                      }}
                    >
                      <span className="block h-24 w-24 shrink-0 sm:h-44 sm:w-full">
                        <Avatar mode={m} active={active} reduce={reduce} />
                      </span>
                      <span className="block">
                        <span className="block text-xl font-semibold sm:text-2xl" style={{ color: active ? m.accent : undefined }}>
                          {m.label}
                        </span>
                        <span className="mt-1 block text-sm text-ink-2 sm:text-base">{m.line}</span>
                        <span className="mt-2 hidden font-mono text-xs text-ink-2 sm:block">press {m.key}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {onDismiss && (
              <button type="button" onClick={onDismiss} className="mt-8 text-sm text-ink-2 underline hover:text-ink">
                Keep current mode
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
