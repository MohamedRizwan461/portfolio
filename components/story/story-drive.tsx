"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lightning, Play } from "@phosphor-icons/react/dist/ssr";
import { beats } from "@/lib/story";
import { useAccent } from "./lab";

const EASE = [0.16, 1, 0.3, 1] as const;
const H = 600;
const ROAD = 468;
const CP0 = 1000;
const GAP = 1600;
const cpX = (k: number) => CP0 + k * GAP;
const END = cpX(beats.length - 1) + 900;
const MAX_V = 560;

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/* ------------------------------------------------------------------ scenery */

/** Far skyline that runs the whole length, drawn once. */
function Skyline({ color }: { color: string }) {
  const rects = useMemo(() => {
    const r = rng(5);
    const out: { x: number; w: number; h: number }[] = [];
    for (let x = -200; x < END * 0.3 + 1600; x += 30 + r() * 50) out.push({ x, w: 26 + r() * 46, h: 40 + r() * 120 });
    return out;
  }, []);
  return (
    <g fill={color}>
      {rects.map((b, i) => (
        <rect key={i} x={b.x} y={ROAD - 70 - b.h} width={b.w} height={b.h + 70} />
      ))}
    </g>
  );
}

/** One landmark per chapter, so every stop has a place. */
function Landmark({ k, accent, shift }: { k: number; accent: string; shift: number }) {
  const x = cpX(k) * 0.6 + shift;
  const base = ROAD - 8;
  const body = "#141a24";
  const edge = "#232c3a";
  const lit = accent;
  switch (beats[k].id) {
    case "biology": {
      // a helix sculpture on a plinth
      const pts = Array.from({ length: 40 }, (_, i) => i);
      return (
        <g transform={`translate(${x} 0)`}>
          <rect x={-40} y={base - 20} width={80} height={20} fill={edge} />
          {[0, Math.PI].map((ph) => (
            <polyline
              key={ph}
              fill="none"
              stroke={ph ? "#9fb3c8" : lit}
              strokeWidth={4}
              strokeLinecap="round"
              points={pts.map((i) => `${Math.sin(i * 0.32 + ph) * 34},${base - 26 - i * 6.5}`).join(" ")}
            />
          ))}
          {pts.filter((i) => i % 3 === 0).map((i) => (
            <line key={i} x1={Math.sin(i * 0.32) * 34} x2={Math.sin(i * 0.32 + Math.PI) * 34} y1={base - 26 - i * 6.5} y2={base - 26 - i * 6.5} stroke="#3a4656" strokeWidth={2} />
          ))}
        </g>
      );
    }
    case "electronics":
      // a gopuram and a college block
      return (
        <g transform={`translate(${x} 0)`}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={-70 + i * 9} y={base - 40 - i * 34} width={140 - i * 18} height={36} fill={i % 2 ? edge : body} />
          ))}
          <path d={`M -22 ${base - 240} L 0 ${base - 275} L 22 ${base - 240} Z`} fill={edge} />
          <rect x={110} y={base - 150} width={260} height={150} fill={body} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={126 + (i % 6) * 40} y={base - 130 + Math.floor(i / 6) * 50} width={22} height={28} fill={i % 4 === 1 ? lit : "#1f2835"} opacity={i % 4 === 1 ? 0.8 : 1} />
          ))}
          <text x={240} y={base - 160} textAnchor="middle" fontSize={16} fontFamily="monospace" fill="#8a96a6">
            KCG COLLEGE · CHENNAI
          </text>
        </g>
      );
    case "assistive":
      // a lab with a knee exoskeleton on the billboard
      return (
        <g transform={`translate(${x} 0)`}>
          <rect x={-60} y={base - 170} width={300} height={170} fill={body} />
          <rect x={70} y={base - 150} width={40} height={40} fill={lit} opacity={0.85} />
          <rect x={85} y={base - 145} width={10} height={30} fill={body} />
          <rect x={75} y={base - 135} width={30} height={10} fill={body} />
          <rect x={-40} y={base - 330} width={170} height={130} fill="#0e131b" stroke={edge} strokeWidth={4} />
          <line x1={-40 + 70} y1={base - 310} x2={-40 + 86} y2={base - 265} stroke="#c9d4e0" strokeWidth={10} strokeLinecap="round" />
          <line x1={-40 + 86} y1={base - 265} x2={-40 + 74} y2={base - 215} stroke="#c9d4e0" strokeWidth={8} strokeLinecap="round" />
          <line x1={-40 + 104} y1={base - 300} x2={-40 + 112} y2={base - 240} stroke={lit} strokeWidth={5} strokeLinecap="round" />
          <circle cx={-40 + 86} cy={base - 265} r={8} fill={lit} />
          <line x1={-15} y1={base - 200} x2={-15} y2={base - 170} stroke={edge} strokeWidth={6} />
          <line x1={105} y1={base - 200} x2={105} y2={base - 170} stroke={edge} strokeWidth={6} />
        </g>
      );
    case "recognition":
      // the pyramids: the Grand Finale was in Egypt
      return (
        <g transform={`translate(${x} 0)`}>
          <circle cx={220} cy={base - 300} r={46} fill={lit} opacity={0.25} />
          <path d={`M -120 ${base} L 40 ${base - 220} L 200 ${base} Z`} fill={body} />
          <path d={`M 40 ${base - 220} L 200 ${base} L 120 ${base} Z`} fill={edge} />
          <path d={`M 150 ${base} L 270 ${base - 150} L 390 ${base} Z`} fill={body} />
          <path d={`M 270 ${base - 150} L 390 ${base} L 330 ${base} Z`} fill={edge} />
        </g>
      );
    case "pivot":
      // over the ocean to the US
      return (
        <g transform={`translate(${x} 0)`}>
          <path d={`M -200 ${base - 10} Q 150 ${base - 40} 500 ${base - 10}`} fill="none" stroke="#1b2636" strokeWidth={30} />
          <g transform={`translate(160 ${base - 300}) rotate(-8)`}>
            <path d="M -70 0 L 60 -6 Q 80 -4 80 4 Q 80 10 60 10 L -70 8 Z" fill="#c9d4e0" />
            <path d="M -10 2 L -40 44 L -24 44 L 20 4 Z" fill="#9fb3c8" />
            <path d="M -10 0 L -34 -34 L -22 -34 L 16 -2 Z" fill="#9fb3c8" />
            <path d="M -66 2 L -80 -24 L -70 -24 L -52 2 Z" fill={lit} />
          </g>
          <path d={`M -300 ${base - 250} Q 0 ${base - 360} 160 ${base - 300}`} fill="none" stroke={lit} strokeWidth={2} strokeDasharray="6 10" opacity={0.6} />
        </g>
      );
    case "vehicles":
      // Chicago: the tall tower with two antennas
      return (
        <g transform={`translate(${x} 0)`}>
          <rect x={0} y={base - 360} width={70} height={360} fill={body} />
          <rect x={10} y={base - 400} width={50} height={40} fill={body} />
          <rect x={18} y={base - 450} width={4} height={50} fill={edge} />
          <rect x={48} y={base - 440} width={4} height={40} fill={edge} />
          <rect x={90} y={base - 250} width={90} height={250} fill={edge} />
          <rect x={200} y={base - 300} width={60} height={300} fill={body} />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={8 + (i % 3) * 20} y={base - 340 + Math.floor(i / 3) * 30} width={10} height={12} fill={i % 7 === 0 ? lit : "#1f2835"} />
          ))}
          <rect x={-120} y={base - 120} width={420} height={16} fill={edge} />
          <rect x={20} y={base - 150} width={140} height={34} fill="#0f5a31" />
          <text x={90} y={base - 127} textAnchor="middle" fontSize={16} fontFamily="monospace" fill="#e9f5ee">
            CHICAGO
          </text>
        </g>
      );
    default:
      // sunrise ahead
      return (
        <g transform={`translate(${x} 0)`}>
          <circle cx={200} cy={base - 20} r={140} fill={lit} opacity={0.22} />
          <circle cx={200} cy={base - 20} r={80} fill={lit} opacity={0.35} />
          <rect x={-20} y={base - 190} width={260} height={90} fill="#0e131b" stroke={edge} strokeWidth={4} />
          <text x={110} y={base - 150} textAnchor="middle" fontSize={17} fill="#dfe7ef" fontFamily="sans-serif">
            Let&apos;s build something
          </text>
          <text x={110} y={base - 124} textAnchor="middle" fontSize={17} fill={lit} fontFamily="sans-serif">
            that moves.
          </text>
          <line x1={40} y1={base - 100} x2={40} y2={base} stroke={edge} strokeWidth={6} />
          <line x1={180} y1={base - 100} x2={180} y2={base} stroke={edge} strokeWidth={6} />
        </g>
      );
  }
}

/** A low electric car with a driver who looks familiar. */
function Car({ accent, wheelRef, lidarRef }: { accent: string; wheelRef: React.RefObject<SVGGElement[]>; lidarRef: React.RefObject<SVGCircleElement | null> }) {
  return (
    <g>
      <defs>
        <linearGradient id="beam" x1="0" x2="1">
          <stop offset="0" stopColor="#fff6d6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff6d6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#eef2f7" />
          <stop offset="1" stopColor="#a9b4c2" />
        </linearGradient>
        <clipPath id="window">
          <path d="M 18 -58 Q 40 -80 78 -80 L 104 -80 Q 124 -78 136 -58 Z" />
        </clipPath>
      </defs>
      <polygon points="158,-30 420,-70 420,20" fill="url(#beam)" />
      <path d="M -10 -24 Q -12 -46 12 -56 Q 40 -84 80 -84 L 106 -84 Q 130 -82 146 -58 Q 168 -54 172 -36 Q 174 -18 162 -14 L -2 -14 Q -12 -14 -10 -24 Z" fill="url(#paint)" />
      <path d="M 18 -58 Q 40 -80 78 -80 L 104 -80 Q 124 -78 136 -58 Z" fill="#0b1118" />
      <g clipPath="url(#window)">
        <image href="/images/riz/headshot-cut.png" x={52} y={-86} width={34} height={36} preserveAspectRatio="xMidYMid slice" />
      </g>
      <line x1={92} y1={-80} x2={92} y2={-58} stroke="#c9d4e0" strokeWidth={3} />
      <path d="M -6 -36 L 172 -36" stroke={accent} strokeWidth={2} opacity={0.9} />
      <rect x={160} y={-44} width={12} height={5} rx={2} fill="#fff6d6" />
      <rect x={-10} y={-40} width={8} height={5} rx={2} fill="#ff4d4f" />
      <rect x={82} y={-92} width={22} height={8} rx={3} fill="#1a1f27" />
      <circle ref={lidarRef} cx={93} cy={-92} r={10} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.6} />
      {[30, 132].map((cx, i) => (
        <g key={cx} transform={`translate(${cx} -12)`}>
          <circle r={19} fill="#0b0e13" />
          <circle r={11} fill="#2a313b" />
          <g
            ref={(el) => {
              if (el && wheelRef.current) wheelRef.current[i] = el;
            }}
          >
            {[0, 60, 120].map((a) => (
              <rect key={a} x={-1.5} y={-11} width={3} height={22} fill="#8793a3" transform={`rotate(${a})`} />
            ))}
          </g>
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ the game */

/**
 * Option B: drive through the story. Hold right to drive; the car stops at each
 * chapter, and the story plays as dialogue you read to continue.
 */
export function StoryDrive() {
  const reduce = useReducedMotion() ?? false;
  const accent = useAccent();
  const box = useRef<HTMLDivElement>(null);
  const [vbW, setVbW] = useState(1600);
  const [started, setStarted] = useState(false);
  const [auto, setAuto] = useState(false);
  const [talk, setTalk] = useState<{ k: number; line: number } | null>(null);
  const [typed, setTyped] = useState(0);
  const [visited, setVisited] = useState<number[]>([]);
  const [near, setNear] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const x = useRef(0);
  const v = useRef(0);
  const dir = useRef(0);
  const nextCp = useRef(0);
  const world = useRef<SVGGElement>(null);
  const far = useRef<SVGGElement>(null);
  const mid = useRef<SVGGElement>(null);
  const car = useRef<SVGGElement>(null);
  const wheels = useRef<SVGGElement[]>([]);
  const lidar = useRef<SVGCircleElement>(null);
  const talkRef = useRef(talk);
  talkRef.current = talk;
  const autoRef = useRef(auto);
  autoRef.current = auto;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVbW((el.clientWidth / el.clientHeight) * H));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = vbW < 800 ? 0.72 : 1;

  // the loop: physics, checkpoints, camera
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const talking = talkRef.current !== null;
      const want = talking || !started ? 0 : autoRef.current ? MAX_V * 0.75 : dir.current * MAX_V;
      v.current += (want - v.current) * (1 - Math.exp(-dt * (want === 0 ? 5 : 2.2)));
      x.current = Math.max(0, Math.min(END, x.current + v.current * dt));

      const k = nextCp.current;
      if (k < beats.length && x.current >= cpX(k) && v.current > 0) {
        x.current = cpX(k);
        v.current = 0;
        nextCp.current = k + 1;
        setTalk({ k, line: 0 });
        setTyped(0);
      }

      const screenX = vbW * 0.3;
      const cam = Math.max(0, x.current - screenX / scale);
      world.current?.setAttribute("transform", `translate(0 ${H * (1 - scale)}) scale(${scale}) translate(${-cam} 0)`);
      far.current?.setAttribute("transform", `translate(${-cam * 0.3 * scale} 0)`);
      mid.current?.setAttribute("transform", `translate(0 ${H * (1 - scale)}) scale(${scale}) translate(${-cam * 0.6} 0)`);
      car.current?.setAttribute("transform", `translate(${x.current} ${ROAD + 58})`);
      const spin = (x.current / 19) * (180 / Math.PI);
      wheels.current.forEach((w) => w?.setAttribute("transform", `rotate(${spin})`));
      if (lidar.current && !reduce) {
        const p = (now / 900) % 1;
        lidar.current.setAttribute("r", String(10 + p * 26));
        lidar.current.setAttribute("opacity", String(0.7 * (1 - p)));
      }

      const nearest = Math.max(0, Math.min(beats.length - 1, Math.round((x.current - CP0) / GAP)));
      setNear((n) => (n === nearest ? n : nearest));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, vbW, scale, reduce]);

  // typing the current line
  useEffect(() => {
    if (!talk) return;
    const text = beats[talk.k].lines[talk.line];
    if (reduce) {
      setTyped(text.length);
      return;
    }
    if (typed >= text.length) return;
    const id = setTimeout(() => setTyped((t) => Math.min(text.length, t + 2)), 16);
    return () => clearTimeout(id);
  }, [talk, typed, reduce]);

  const advance = useCallback(() => {
    const t = talkRef.current;
    if (!t) return;
    const text = beats[t.k].lines[t.line];
    if (typed < text.length) return setTyped(text.length);
    if (t.line + 1 < beats[t.k].lines.length) {
      setTalk({ k: t.k, line: t.line + 1 });
      setTyped(0);
      return;
    }
    setTalk(null);
    setVisited((vs) => (vs.includes(t.k) ? vs : [...vs, t.k]));
    const badge = beats[t.k].badge;
    if (badge) {
      setToast(badge);
      setTimeout(() => setToast(null), 2200);
    }
  }, [typed]);

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!started && (e.key === "Enter" || e.key === " ")) return setStarted(true);
      if (talkRef.current && (e.key === "Enter" || e.key === " " || e.key === "ArrowRight" || e.key === "d")) {
        e.preventDefault();
        return advance();
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") dir.current = 1;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") dir.current = -1;
    };
    const up = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowLeft", "d", "D", "a", "A"].includes(e.key)) dir.current = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [advance, started]);

  const finished = visited.length === beats.length;
  const beatNow = talk ? beats[talk.k] : beats[near];
  const lampXs = useMemo(() => Array.from({ length: Math.ceil(END / 420) }, (_, i) => 120 + i * 420), []);

  const hold = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      dir.current = d;
      if (!started) setStarted(true);
    },
    onPointerUp: () => (dir.current = 0),
    onPointerLeave: () => (dir.current = 0),
    onPointerCancel: () => (dir.current = 0),
  });

  return (
    <div ref={box} className="relative h-[100dvh] w-full touch-none overflow-hidden select-none" onClick={() => talk && advance()}>
      <svg viewBox={`0 0 ${vbW} ${H}`} preserveAspectRatio="xMinYMid meet" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#05070b" />
            <stop offset="0.75" stopColor="#0b1119" />
            <stop offset="1" stopColor="#141c27" />
          </linearGradient>
          <linearGradient id="pillar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={accent} stopOpacity="0" />
            <stop offset="1" stopColor={accent} stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="lamp" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ffe9b0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={vbW} height={H} fill="url(#sky)" />
        {/* stars */}
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={(i * 97) % vbW} cy={(i * 53) % 260} r={i % 5 === 0 ? 1.4 : 0.8} fill="#c9d4e0" opacity={0.25 + ((i * 13) % 10) / 20} />
        ))}
        <g ref={far}>
          <Skyline color="#0d121a" />
        </g>
        <g ref={mid}>
          {beats.map((_, k) => (
            <Landmark key={k} k={k} accent={accent} shift={(0.4 * vbW * 0.3 + 330) / scale} />
          ))}
        </g>
        <g ref={world}>
          <rect x={-400} y={ROAD} width={END + 2000} height={H - ROAD} fill="#0a0d12" />
          <rect x={-400} y={ROAD} width={END + 2000} height={3} fill="#232c3a" />
          <line x1={-400} x2={END + 2000} y1={ROAD + 70} y2={ROAD + 70} stroke="#3a4656" strokeWidth={3} strokeDasharray="40 36" />
          {lampXs.map((lx) => (
            <g key={lx}>
              <polygon points={`${lx},${ROAD - 150} ${lx - 70},${ROAD} ${lx + 70},${ROAD}`} fill="url(#lamp)" />
              <rect x={lx - 2} y={ROAD - 150} width={4} height={150} fill="#1d2430" />
              <rect x={lx - 12} y={ROAD - 154} width={24} height={6} rx={3} fill="#ffe9b0" opacity={0.8} />
            </g>
          ))}
          {beats.map((b, k) => {
            const done = visited.includes(k);
            return (
              <g key={b.id} transform={`translate(${cpX(k) + 170} 0)`}>
                <rect x={-6} y={ROAD - 260} width={12} height={260} fill="url(#pillar)" opacity={done ? 0.4 : 1} />
                <rect x={-78} y={ROAD - 320} width={156} height={50} rx={6} fill="#0e131b" stroke={done ? "#22c55e" : accent} strokeWidth={2} />
                <text x={0} y={ROAD - 300} textAnchor="middle" fontSize={13} fontFamily="monospace" fill={done ? "#22c55e" : accent}>
                  {done ? "✓ " : ""}
                  {b.n}
                </text>
                <text x={0} y={ROAD - 281} textAnchor="middle" fontSize={14} fill="#e6edf3" fontFamily="sans-serif">
                  {b.label}
                </text>
              </g>
            );
          })}
          <g ref={car}>
            <Car accent={accent} wheelRef={wheels} lidarRef={lidar} />
          </g>
        </g>
      </svg>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-[8.5rem] z-10 flex items-start justify-between px-5 sm:px-10">
        <div>
          <p className="eyebrow !text-white/55">
            <span style={{ color: accent }}>{beatNow.n}</span> <span className="mx-2 opacity-40">/</span> {beatNow.label}
          </p>
          <ol className="mt-3 flex gap-1.5">
            {beats.map((b, k) => (
              <li key={b.id} className="h-1 w-6 rounded-full sm:w-9" style={{ background: visited.includes(k) ? accent : k === near ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.15)" }} />
            ))}
          </ol>
        </div>
        <ul className="flex max-w-[50%] flex-wrap justify-end gap-1.5">
          {visited
            .map((k) => beats[k].badge)
            .filter(Boolean)
            .map((b) => (
              <li key={b} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.14em] text-white uppercase backdrop-blur">
                <Check size={10} weight="bold" style={{ color: accent }} /> {b}
              </li>
            ))}
        </ul>
      </div>

      {/* badge toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="pointer-events-none absolute top-[40%] left-1/2 z-20 -translate-x-1/2 rounded-full border px-5 py-2.5 font-mono text-sm tracking-[0.16em] text-white uppercase backdrop-blur"
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

      {/* dialogue */}
      <AnimatePresence>
        {talk && (
          <motion.div
            className="absolute inset-x-3 bottom-4 z-30 mx-auto max-w-3xl cursor-pointer sm:bottom-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="flex gap-4 rounded-2xl border border-white/15 bg-[rgba(8,11,16,0.86)] p-4 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/riz/headshot.jpg" alt="" className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14" style={{ boxShadow: `0 0 0 2px ${accent}` }} />
              <div className="min-w-0 flex-1">
                <p className="eyebrow !text-white/55">
                  Riz <span className="mx-2 opacity-40">/</span> {beats[talk.k].label} <span className="mx-2 opacity-40">/</span> {beats[talk.k].years}
                </p>
                <p className="mt-2 min-h-[3.4em] text-[1.05rem] leading-relaxed text-white sm:text-[1.2rem]">
                  {beats[talk.k].lines[talk.line].slice(0, typed)}
                  {typed < beats[talk.k].lines[talk.line].length && <span className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] animate-pulse bg-white/70" />}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="font-mono text-[0.62rem] tracking-[0.2em] text-white/40 uppercase">
                    {talk.line + 1} / {beats[talk.k].lines.length}
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.2em] uppercase" style={{ color: accent }}>
                    {talk.line + 1 < beats[talk.k].lines.length ? "Tap or Enter" : "Tap to keep driving"} <ArrowRight size={11} weight="bold" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* controls */}
      {started && !talk && (
        <div className="absolute inset-x-4 bottom-5 z-20 flex items-end justify-between sm:inset-x-10 sm:bottom-8">
          <p className="hidden font-mono text-[0.62rem] tracking-[0.22em] text-white/45 uppercase sm:block">
            {finished ? "Journey complete" : "Hold → or D to drive · ← to reverse"}
          </p>
          {finished ? (
            <Link href="/contact" className="pointer-events-auto flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black no-underline">
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

      {/* start card */}
      <AnimatePresence>
        {!started && (
          <motion.div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 px-6 backdrop-blur-sm" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <div className="max-w-lg text-center">
              <p className="eyebrow !text-white/60">About · the drive</p>
              <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)] text-white">Drive through my story.</h1>
              <p className="mt-4 text-white/65">Seven stops, from biology in Chennai to autonomous vehicles in Chicago. The car stops at each one; read to keep going.</p>
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
              <p className="mt-6 font-mono text-[0.62rem] tracking-[0.22em] text-white/40 uppercase">Keyboard: hold → · Enter to read on</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
