"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState, type PointerEvent } from "react";
import { playPowerOn, playTick } from "@/lib/sound";

const W = 560;
const H = 300;
const HINGE = { x: 210, y: 176 };
const OPEN = -48; // degrees, blade raised
const CLOSED = 0;

/**
 * Option C: a lab knife switch on a wooden base. Pull the copper blade down into
 * the jaws, an arc jumps, and the bulb on the bench lights.
 */
export function IntroKnife({ onPowered }: { onPowered: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const svg = useRef<SVGSVGElement>(null);
  const [angle, setAngle] = useState(OPEN);
  const [drag, setDrag] = useState(false);
  const [closed, setClosed] = useState(false);

  const close = useCallback(() => {
    if (closed) return;
    setAngle(CLOSED);
    setDrag(false);
    setClosed(true);
    playTick();
    setTimeout(playPowerOn, 100);
    setTimeout(onPowered, reduce ? 200 : 1600);
  }, [closed, onPowered, reduce]);

  const move = (e: PointerEvent) => {
    if (!drag || closed) return;
    const r = svg.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    const deg = (Math.atan2(y - HINGE.y, x - HINGE.x) * 180) / Math.PI;
    const clamped = Math.max(OPEN, Math.min(CLOSED, deg));
    setAngle(clamped);
    if (clamped > -6) close();
  };

  const circuit = "M110 176 H150 M390 176 H430 V96 H470 M470 96 H500 V250 H60 V176 H110";

  return (
    <div className="w-full max-w-2xl select-none">
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" onPointerMove={move} onPointerUp={() => setDrag(false)} onPointerLeave={() => setDrag(false)} role="group" aria-label="A knife switch on a wooden base wired to a battery pack and a bulb">
        <defs>
          <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5a2b" />
            <stop offset="100%" stopColor="#5c3a1a" />
          </linearGradient>
          <linearGradient id="blade" x1="0" x2="1">
            <stop offset="0%" stopColor="#9c5a2c" />
            <stop offset="50%" stopColor="#f4b27a" />
            <stop offset="100%" stopColor="#9c5a2c" />
          </linearGradient>
          <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff2c4" />
            <stop offset="60%" stopColor="#ffb347" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff8a1f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* wiring */}
        <path d={circuit} fill="none" stroke="#1d1d1f" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        {closed && <path d={circuit} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" className={reduce ? "" : "pc-current"} />}

        {/* battery pack: two AA cells */}
        <g transform="translate(30 150)">
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(0 ${i * 30 - 14})`}>
              <rect x="0" y="0" width="80" height="24" rx="10" fill="#2a2a2a" />
              <rect x="44" y="0" width="36" height="24" rx="0" fill="#d7b43c" />
              <rect x="80" y="7" width="5" height="10" rx="2" fill="#bfc5cc" />
              <text x="22" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill="#f2f2f2">AA</text>
            </g>
          ))}
        </g>

        {/* wooden base and knife switch */}
        <rect x="140" y="150" width="260" height="60" rx="6" fill="url(#wood)" />
        {[172, 190].map((y) => <path key={y} d={`M150 ${y} q60 -6 120 0 t120 0`} fill="none" stroke="#4a2e14" strokeWidth="1" opacity="0.5" />)}
        {/* hinge post and jaws */}
        <rect x={HINGE.x - 12} y={HINGE.y - 24} width="24" height="30" rx="3" fill="#c98b4e" stroke="#7a4a20" />
        <g>
          <rect x="336" y="150" width="10" height="30" fill="#c98b4e" stroke="#7a4a20" />
          <rect x="360" y="150" width="10" height="30" fill="#c98b4e" stroke="#7a4a20" />
        </g>
        <circle cx={HINGE.x} cy={HINGE.y - 10} r="6" fill="#e7c77a" stroke="#7a4a20" />

        {/* the blade */}
        <g
          transform={`translate(${HINGE.x} ${HINGE.y - 10}) rotate(${angle})`}
          style={{ transition: drag || reduce ? "none" : "transform 260ms cubic-bezier(0.3,1.5,0.5,1)" }}
        >
          <rect x="0" y="-6" width="152" height="12" rx="3" fill="url(#blade)" stroke="#7a4a20" />
          <g
            role="button"
            tabIndex={closed ? -1 : 0}
            aria-label="Pull the switch down"
            onPointerDown={(e) => {
              if (closed) return;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              setDrag(true);
            }}
            onClick={() => !drag && close()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), close())}
            className={closed ? "outline-none" : "cursor-grab outline-none"}
          >
            <rect x="146" y="-4" width="18" height="8" fill="#1d1d1f" />
            <rect x="162" y="-13" width="30" height="26" rx="11" fill="#b3261e" />
            <rect x="110" y="-34" width="100" height="68" fill="transparent" />
          </g>
        </g>
        {!closed && !reduce && <circle cx="353" cy="150" r="14" fill="none" stroke="var(--accent)" strokeWidth="2" className="pc-ping pointer-events-none" />}

        {/* the arc as it closes */}
        {closed && !reduce && (
          <g transform="translate(353 158)">
            {Array.from({ length: 10 }, (_, i) => (
              <motion.path key={i} d={`M0 0 l${Math.cos(i * 0.63) * 10} ${Math.sin(i * 0.63) * 10} l${Math.cos(i * 0.63 + 0.6) * 12} ${Math.sin(i * 0.63 + 0.6) * 12}`}
                fill="none" stroke={i % 2 ? "#bfe8ff" : "#ffffff"} strokeWidth="2" initial={{ opacity: 1, scale: 0.4 }} animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.4, ease: "easeOut" }} />
            ))}
          </g>
        )}

        {/* bulb on a socket */}
        <g transform="translate(470 70)">
          <motion.circle r="70" fill="url(#glow2)" initial={false} animate={{ opacity: closed ? 0.9 : 0 }} transition={{ duration: reduce ? 0 : 0.9 }} />
          <path d="M0 -44 C -26 -44, -36 -18, -26 0 C -20 10, -14 14, -12 24 H12 C14 14, 20 10, 26 0 C 36 -18, 26 -44, 0 -44 Z"
            fill={closed ? "#fff1c1" : "rgba(220,230,240,0.18)"} stroke="#dfe7f0" strokeOpacity="0.6" strokeWidth="2" />
          <path d="M-8 20 L-6 -6 q3 -6 6 0 q3 -6 6 0 L8 20" fill="none" stroke={closed ? "#fff" : "#6b6b6b"} strokeWidth="2" />
          <rect x="-14" y="24" width="28" height="18" rx="3" fill="#bfa15a" />
        </g>
      </svg>
      <p className="mt-2 text-sm text-ink">{closed ? "Circuit closed." : "Grab the red handle and pull the switch down."}</p>
    </div>
  );
}
