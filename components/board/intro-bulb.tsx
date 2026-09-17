"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState, type PointerEvent } from "react";
import { playPowerOn, playTick } from "@/lib/sound";

const W = 560;
const H = 300;
const TERMINAL = { x: 412, y: 150 };
const START = { x: 300, y: 250 };

/**
 * Option B: a real bulb. A copper lead hangs loose from an Edison bulb; touch it
 * to the 9V battery and the filament warms from red to white.
 */
export function IntroBulb({ onPowered }: { onPowered: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const svg = useRef<SVGSVGElement>(null);
  const [tip, setTip] = useState(START);
  const [drag, setDrag] = useState(false);
  const [lit, setLit] = useState(false);

  const light = useCallback(() => {
    if (lit) return;
    setTip(TERMINAL);
    setDrag(false);
    setLit(true);
    playTick();
    setTimeout(playPowerOn, 120);
    setTimeout(onPowered, reduce ? 200 : 1700);
  }, [lit, onPowered, reduce]);

  const move = (e: PointerEvent) => {
    if (!drag || lit) return;
    const r = svg.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    setTip({ x: Math.max(40, Math.min(W - 20, x)), y: Math.max(40, Math.min(H - 20, y)) });
    if (Math.hypot(x - TERMINAL.x, y - TERMINAL.y) < 30) light();
  };

  // twisted copper pair from the bulb base to the loose tip
  const lead = `M170 214 C 190 290, ${tip.x - 90} ${tip.y + 60}, ${tip.x} ${tip.y}`;
  const back = "M150 214 C 150 300, 470 300, 470 200";

  return (
    <div className="w-full max-w-2xl select-none">
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" onPointerMove={move} onPointerUp={() => setDrag(false)} onPointerLeave={() => setDrag(false)} role="group" aria-label="An Edison bulb and a 9 volt battery with a loose copper wire">
        <defs>
          <radialGradient id="glass" cx="45%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#cfd8e3" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#9fb0c4" stopOpacity="0.25" />
          </radialGradient>
          <radialGradient id="warm" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fff4d6" stopOpacity="1" />
            <stop offset="35%" stopColor="#ffc46b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff8a1f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="brass" x1="0" x2="1">
            <stop offset="0%" stopColor="#7a5a24" />
            <stop offset="45%" stopColor="#e7c77a" />
            <stop offset="100%" stopColor="#6b4c1b" />
          </linearGradient>
          <linearGradient id="copper" x1="0" x2="1">
            <stop offset="0%" stopColor="#8a4a22" />
            <stop offset="50%" stopColor="#f0a36a" />
            <stop offset="100%" stopColor="#8a4a22" />
          </linearGradient>
        </defs>

        {/* warm light filling the scene */}
        <motion.circle cx="160" cy="112" r="200" fill="url(#warm)" initial={false} animate={{ opacity: lit ? 0.85 : 0 }} transition={{ duration: reduce ? 0 : 1.2 }} />

        {/* wires: the return lead is already on the battery */}
        <path d={back} fill="none" stroke="#1d1d1f" strokeWidth="9" strokeLinecap="round" />
        <path d={back} fill="none" stroke="#3a3a3c" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 6" />
        <path d={lead} fill="none" stroke="#b3261e" strokeWidth="9" strokeLinecap="round" />
        <path d={lead} fill="none" stroke="#e0463d" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 7" />

        {/* bulb */}
        <g>
          <path d="M160 20 C 100 20, 70 70, 90 120 C 104 154, 128 168, 132 190 L 188 190 C 192 168, 216 154, 230 120 C 250 70, 220 20, 160 20 Z" fill="url(#glass)" stroke="#dfe7f0" strokeOpacity="0.55" strokeWidth="2" />
          {/* filament */}
          <path d="M146 188 L140 120 M174 188 L180 120" stroke="#8d8d8d" strokeWidth="2" />
          <motion.path
            d="M140 120 q5 -14 10 0 q5 -14 10 0 q5 -14 10 0 q5 -14 10 0"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            initial={false}
            animate={lit ? { stroke: reduce ? "#fff4d6" : ["#5a1a0a", "#e0461a", "#ffb347", "#fff4d6"] } : { stroke: "#4a4a4a" }}
            transition={{ duration: reduce ? 0 : 1.1, times: [0, 0.3, 0.65, 1] }}
          />
          {lit && <motion.path d="M140 120 q5 -14 10 0 q5 -14 10 0 q5 -14 10 0 q5 -14 10 0" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.35" style={{ filter: "blur(4px)" }} initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: reduce ? 0 : 0.8 }} />}
          {/* screw base */}
          <rect x="130" y="190" width="60" height="30" rx="4" fill="url(#brass)" />
          {[196, 204, 212].map((y) => <line key={y} x1="130" y1={y} x2="190" y2={y} stroke="#5a3f14" strokeWidth="1.5" opacity="0.7" />)}
          <path d="M142 220 H178 L170 232 H150 Z" fill="#2a2a2a" />
        </g>

        {/* 9V battery */}
        <g transform="translate(380 150)">
          <rect x="0" y="0" width="120" height="120" rx="8" fill="#161616" />
          <rect x="0" y="54" width="120" height="66" rx="0" fill="#e0822a" />
          <rect x="0" y="112" width="120" height="8" rx="4" fill="#e0822a" />
          <text x="60" y="36" textAnchor="middle" fontSize="26" fontWeight="800" fill="#f2f2f2">9V</text>
          <text x="60" y="94" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1d1d1f" letterSpacing="2">ALKALINE</text>
          {/* terminals */}
          <circle cx="32" cy="0" r="12" fill="url(#brass)" stroke="#5a3f14" />
          <g transform="translate(90 -2)">
            <polygon points="-13,-6 -6,-13 6,-13 13,-6 13,6 6,13 -6,13 -13,6" fill="url(#brass)" stroke="#5a3f14" />
          </g>
        </g>
        {!lit && !reduce && <circle cx={TERMINAL.x} cy={TERMINAL.y} r="16" fill="none" stroke="var(--accent)" strokeWidth="2" className="pc-ping pointer-events-none" />}

        {/* the loose copper tip */}
        <g
          transform={`translate(${tip.x} ${tip.y})`}
          role="button"
          tabIndex={lit ? -1 : 0}
          aria-label="Touch the wire to the battery"
          onPointerDown={(e) => {
            if (lit) return;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setDrag(true);
          }}
          onClick={() => !drag && light()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), light())}
          className={lit ? "outline-none" : "cursor-grab outline-none"}
          style={{ transition: drag || reduce ? "none" : "transform 280ms cubic-bezier(0.2,1.4,0.4,1)" }}
        >
          <circle r="28" fill="transparent" />
          <path d="M-14 -4 h14 v8 h-14 z" fill="#b3261e" />
          <path d="M0 -3 q6 -2 12 0 q-6 2 -12 3 q6 1 12 3" fill="none" stroke="url(#copper)" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* spark on contact */}
        {lit && !reduce && (
          <g transform={`translate(${TERMINAL.x} ${TERMINAL.y})`}>
            {Array.from({ length: 12 }, (_, i) => (
              <motion.line key={i} x1="0" y1="0" stroke={i % 2 ? "#fff3b0" : "#ffb347"} strokeWidth="2.5" strokeLinecap="round"
                initial={{ x2: 0, y2: 0, opacity: 1 }}
                animate={{ x2: Math.cos(i * 0.52) * 30, y2: Math.sin(i * 0.52) * 30, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }} />
            ))}
          </g>
        )}
      </svg>
      <p className="mt-2 text-sm text-ink">{lit ? "There's light." : "Drag the red wire onto the battery terminal."}</p>
    </div>
  );
}
