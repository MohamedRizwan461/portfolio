"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lightning, Play } from "@phosphor-icons/react/dist/ssr";
import { beats } from "@/lib/story";
import type { Sim } from "./cruise-scene";
import { useAccent } from "./lab";

const CruiseScene = dynamic(() => import("./cruise-scene").then((m) => m.CruiseScene), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#05070b]" />,
});

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The drive, in 3D: Riz at the wheel of an open-top car, rolling through the
 * places of his story. The car eases into each stop, he turns to you and talks,
 * and you read on to keep driving.
 */
export function StoryCruise() {
  const reduce = useReducedMotion() ?? false;
  const accent = useAccent();
  const sim = useRef<Sim>({ s: 0, v: 0, dir: 0, auto: false, started: false, talking: false, speaking: false, next: 0, near: 0, reduce: false });
  const [started, setStarted] = useState(false);
  const [auto, setAuto] = useState(false);
  const [talk, setTalk] = useState<{ k: number; line: number } | null>(null);
  const [typed, setTyped] = useState(0);
  const [visited, setVisited] = useState<number[]>([]);
  const [near, setNear] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const talkRef = useRef(talk);
  talkRef.current = talk;

  useEffect(() => {
    sim.current.reduce = reduce;
  }, [reduce]);
  useEffect(() => {
    sim.current.started = started;
  }, [started]);
  useEffect(() => {
    sim.current.auto = auto;
  }, [auto]);
  useEffect(() => {
    sim.current.talking = talk !== null;
  }, [talk]);

  const onCheckpoint = useCallback((k: number) => {
    // let the camera settle on him before the first words appear
    setTimeout(() => {
      setTalk({ k, line: 0 });
      setTyped(0);
    }, 450);
    sim.current.talking = true;
  }, []);

  const text = talk ? beats[talk.k].lines[talk.line] : "";
  useEffect(() => {
    sim.current.speaking = talk !== null && typed < text.length;
    if (!talk) return;
    if (reduce) return setTyped(text.length);
    if (typed >= text.length) return;
    const id = setTimeout(() => setTyped((t) => Math.min(text.length, t + 2)), 18);
    return () => clearTimeout(id);
  }, [talk, typed, text, reduce]);

  const advance = useCallback(() => {
    const t = talkRef.current;
    if (!t) return;
    const line = beats[t.k].lines[t.line];
    if (typed < line.length) return setTyped(line.length);
    if (t.line + 1 < beats[t.k].lines.length) {
      setTalk({ k: t.k, line: t.line + 1 });
      setTyped(0);
      return;
    }
    setTalk(null);
    sim.current.talking = false;
    setVisited((vs) => (vs.includes(t.k) ? vs : [...vs, t.k]));
    const badge = beats[t.k].badge;
    if (badge) {
      setToast(badge);
      setTimeout(() => setToast(null), 2200);
    }
  }, [typed]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!started && (e.key === "Enter" || e.key === " ")) return setStarted(true);
      if (talkRef.current && ["Enter", " ", "ArrowRight", "d", "D"].includes(e.key)) {
        e.preventDefault();
        return advance();
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") sim.current.dir = 1;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") sim.current.dir = -1;
    };
    const up = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowLeft", "d", "D", "a", "A"].includes(e.key)) sim.current.dir = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [advance, started]);

  const hold = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      sim.current.dir = d;
      if (!started) setStarted(true);
    },
    onPointerUp: () => (sim.current.dir = 0),
    onPointerLeave: () => (sim.current.dir = 0),
    onPointerCancel: () => (sim.current.dir = 0),
  });

  const finished = visited.length === beats.length;
  const beatNow = talk ? beats[talk.k] : beats[near];

  return (
    <div className="relative h-[100dvh] w-full touch-none overflow-hidden bg-[#05070b] select-none" onClick={() => talk && advance()}>
      <div className="absolute inset-0">
        <CruiseScene sim={sim} accent={accent} visited={visited} onCheckpoint={onCheckpoint} onNear={setNear} />
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-[8.5rem] z-10 flex items-start justify-between px-5 sm:px-10">
        <div>
          <p className="eyebrow !text-white/60">
            <span style={{ color: accent }}>{beatNow.n}</span> <span className="mx-2 opacity-40">/</span> {beatNow.label}
            <span className="mx-2 opacity-40">/</span> {beatNow.years}
          </p>
          <ol className="mt-3 flex gap-1.5">
            {beats.map((b, k) => (
              <li
                key={b.id}
                className="h-[3px] w-7 rounded-full transition-colors duration-500 sm:w-10"
                style={{ background: visited.includes(k) ? accent : k === near ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.14)" }}
              />
            ))}
          </ol>
        </div>
        <ul className="flex max-w-[55%] flex-wrap justify-end gap-1.5">
          <AnimatePresence>
            {visited
              .map((k) => beats[k].badge)
              .filter(Boolean)
              .map((b) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.14em] text-white uppercase backdrop-blur"
                >
                  <Check size={10} weight="bold" style={{ color: accent }} /> {b}
                </motion.li>
              ))}
          </AnimatePresence>
        </ul>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="pointer-events-none absolute top-[38%] left-1/2 z-20 -translate-x-1/2 rounded-full border px-5 py-2.5 font-mono text-sm tracking-[0.16em] whitespace-nowrap text-white uppercase backdrop-blur"
            style={{ borderColor: accent, background: "rgba(5,7,11,0.7)", boxShadow: `0 0 40px -8px ${accent}` }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Lightning size={14} weight="fill" className="mr-2 inline" style={{ color: accent }} />
            Unlocked: {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* dialogue: he is turned toward you while this is open */}
      <AnimatePresence>
        {talk && (
          <motion.div
            className="absolute right-3 bottom-4 left-3 z-30 cursor-pointer sm:right-10 sm:bottom-10 sm:left-auto sm:w-[min(34rem,46vw)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="rounded-2xl border border-white/12 bg-[rgba(8,11,16,0.78)] p-5 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
              <p className="eyebrow !text-white/55">
                Riz <span className="mx-2 opacity-40">/</span> {beats[talk.k].label}
              </p>
              <p className="mt-3 min-h-[3.2em] text-[1.08rem] leading-relaxed font-light text-white sm:text-[1.2rem]">
                {text.slice(0, typed)}
                {typed < text.length && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse bg-white/80" />}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="flex gap-1">
                  {beats[talk.k].lines.map((_, i) => (
                    <span key={i} className="h-1 w-4 rounded-full" style={{ background: i <= talk.line ? accent : "rgba(255,255,255,0.15)" }} />
                  ))}
                </span>
                <span className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.2em] uppercase" style={{ color: accent }}>
                  {talk.line + 1 < beats[talk.k].lines.length ? "Tap or Enter" : "Tap to keep driving"} <ArrowRight size={11} weight="bold" />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* controls */}
      {started && !talk && (
        <div className="absolute inset-x-4 bottom-5 z-20 flex items-end justify-between sm:inset-x-10 sm:bottom-9">
          <p className="hidden font-mono text-[0.62rem] tracking-[0.22em] text-white/50 uppercase sm:block">
            {finished ? "Journey complete" : "Hold → or D to drive · ← to reverse"}
          </p>
          {finished ? (
            <Link href="/contact" className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black no-underline">
              Get in touch <ArrowRight size={15} weight="bold" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAuto((a) => !a);
                }}
                className="h-12 rounded-full border px-4 font-mono text-[0.65rem] tracking-[0.18em] text-white uppercase backdrop-blur"
                style={{ borderColor: auto ? accent : "rgba(255,255,255,0.2)", background: auto ? `${accent}33` : "rgba(0,0,0,0.3)" }}
              >
                Auto-drive {auto ? "on" : "off"}
              </button>
              <button type="button" aria-label="Reverse" {...hold(-1)} className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur active:scale-95">
                <ArrowLeft size={20} weight="bold" />
              </button>
              <button type="button" aria-label="Drive" {...hold(1)} className="flex h-16 w-16 items-center justify-center rounded-full text-black active:scale-95" style={{ background: accent, boxShadow: `0 0 40px -6px ${accent}` }}>
                <ArrowRight size={24} weight="bold" />
              </button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {!started && (
          <motion.div
            className="absolute inset-0 z-30 flex items-end justify-center bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pb-[12vh]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-lg text-center">
              <p className="eyebrow !text-white/60">About · take a drive</p>
              <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)] text-white">Ride along through my story.</h1>
              <p className="mt-4 text-white/70">Seven stops, from biology to autonomous vehicles. I pull over at each one and tell you what happened.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setStarted(true)} className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black">
                  <Play size={15} weight="fill" /> Start driving
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuto(true);
                    setStarted(true);
                  }}
                  className="flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-medium text-white"
                >
                  Auto-drive
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
