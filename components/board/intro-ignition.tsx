"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { playPowerOn, playTick } from "@/lib/sound";

const HOLD_MS = 700;

/** One gauge: an arc, ticks, and a needle that sweeps on ignition. */
function Gauge({ label, unit, max, value, sweep, reduce }: { label: string; unit: string; max: number; value: number; sweep: boolean; reduce: boolean }) {
  const start = -135;
  const span = 270;
  const angle = start + (value / max) * span;
  const ticks = Array.from({ length: 9 }, (_, i) => start + (i * span) / 8);
  return (
    <svg viewBox="-110 -110 220 220" className="h-auto w-full" aria-hidden>
      <circle r="104" fill="#0b0d10" stroke="#2a2f36" strokeWidth="3" />
      <path d="M -73.5 73.5 A 104 104 0 1 1 73.5 73.5" fill="none" stroke="#1d232a" strokeWidth="8" transform="scale(0.86)" />
      {ticks.map((a, i) => {
        const r = (a * Math.PI) / 180;
        return (
          <g key={i}>
            <line x1={Math.sin(r) * 72} y1={-Math.cos(r) * 72} x2={Math.sin(r) * 86} y2={-Math.cos(r) * 86} stroke={i >= 7 ? "#ef4444" : "#c9d1d9"} strokeWidth="3" />
            <text x={Math.sin(r) * 58} y={-Math.cos(r) * 58 + 4} textAnchor="middle" fontSize="11" fill="#8b949e" fontFamily="monospace">
              {Math.round((i * max) / 8)}
            </text>
          </g>
        );
      })}
      <motion.g
        initial={false}
        animate={{ rotate: sweep && !reduce ? [start, start + span, angle] : angle }}
        transition={{ duration: sweep && !reduce ? 1.5 : 0.3, times: [0, 0.5, 1], ease: "easeInOut" }}
      >
        {/* symmetric invisible disc so the needle rotates about the gauge centre */}
        <circle r="90" fill="transparent" />
        <line x1="0" y1="10" x2="0" y2="-84" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
      </motion.g>
      <circle r="9" fill="#1d232a" stroke="#3a414b" />
      <text y="46" textAnchor="middle" fontSize="12" fill="#c9d1d9" fontFamily="monospace">{label}</text>
      <text y="62" textAnchor="middle" fontSize="10" fill="#6e7681" fontFamily="monospace">{unit}</text>
    </svg>
  );
}

const TELLTALES = ["BATT", "BRAKE", "ABS", "EPS", "BELT", "CAN"];

/**
 * Option C: EV ignition. Press and hold START; the cluster runs its self-test,
 * needles sweep, warning lamps check and clear, and the car reports READY.
 */
export function IntroIgnition({ onPowered }: { onPowered: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const [holding, setHolding] = useState(false);
  const [on, setOn] = useState(false);
  const [lampsOff, setLampsOff] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ignite = useCallback(() => {
    if (on) return;
    setOn(true);
    setHolding(false);
    playTick();
    setTimeout(playPowerOn, 200);
  }, [on]);

  useEffect(() => {
    if (!on) return;
    if (reduce) {
      setLampsOff(TELLTALES.length);
      const t = setTimeout(onPowered, 500);
      return () => clearTimeout(t);
    }
    if (lampsOff < TELLTALES.length) {
      const t = setTimeout(() => setLampsOff((n) => n + 1), lampsOff === 0 ? 700 : 160);
      return () => clearTimeout(t);
    }
    const t = setTimeout(onPowered, 900);
    return () => clearTimeout(t);
  }, [on, lampsOff, onPowered, reduce]);

  const beginHold = () => {
    if (on) return;
    setHolding(true);
    holdTimer.current = setTimeout(ignite, reduce ? 0 : HOLD_MS);
  };
  const endHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (!on) setHolding(false);
  };

  const ready = on && lampsOff >= TELLTALES.length;

  return (
    <div className="w-full max-w-4xl select-none">
      <div className="rounded-[2rem] border border-[#2a2f36] bg-[linear-gradient(180deg,#1a1d22,#0e1013)] p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] sm:p-6">
        <div className="grid items-center gap-3 sm:grid-cols-[1fr_1.1fr_1fr] sm:gap-5">
          <Gauge label="SPEED" unit="km/h" max={160} value={0} sweep={on} reduce={reduce} />

          {/* centre display */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full rounded-xl border border-[#2a2f36] bg-[#07090b] p-3 text-center">
              <div className="grid grid-cols-6 gap-1.5">
                {TELLTALES.map((t, i) => {
                  const lit = on && i >= lampsOff;
                  return (
                    <span
                      key={t}
                      className="rounded px-1 py-0.5 font-mono text-[0.55rem] font-bold transition-colors duration-150"
                      style={{ background: lit ? (i < 2 ? "#ef4444" : "#f59e0b") : "#15191e", color: lit ? "#0b0d10" : "#3a414b" }}
                    >
                      {t}
                    </span>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-center gap-3 font-mono">
                {["P", "R", "N", "D"].map((g) => (
                  <span key={g} className="text-lg font-bold" style={{ color: g === "P" && on ? "var(--accent)" : "#3a414b" }}>
                    {g}
                  </span>
                ))}
              </div>
              <p className="mt-2 font-mono text-sm font-bold tracking-[0.3em]" style={{ color: ready ? "#22c55e" : on ? "#f59e0b" : "#3a414b" }}>
                {ready ? "READY" : on ? "SELF TEST" : "OFF"}
              </p>
            </div>

            {/* start / stop */}
            <button
              type="button"
              onPointerDown={beginHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), ignite())}
              aria-label="Press and hold to start"
              className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#0b0d10] bg-[radial-gradient(circle_at_40%_35%,#4a525c,#1b1f24)] shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_2px_2px_rgba(255,255,255,0.15)] active:scale-[0.97]"
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                <circle cx="50" cy="50" r="46" fill="none" stroke="#1d232a" strokeWidth="4" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={on ? "#22c55e" : "var(--accent)"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  initial={false}
                  animate={{ strokeDashoffset: on ? 0 : holding ? 0 : 1 }}
                  transition={{ duration: on ? 0.2 : holding ? HOLD_MS / 1000 : 0.25, ease: "linear" }}
                />
              </svg>
              <span className="relative text-center font-mono text-[0.7rem] leading-tight font-bold tracking-widest text-[#e6edf3]">
                <span className="block" style={{ color: on ? "#22c55e" : "#e6edf3" }}>●</span>
                START
                <br />
                STOP
              </span>
            </button>
          </div>

          <Gauge label="POWER" unit="kW" max={200} value={0} sweep={on} reduce={reduce} />
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-2">{ready ? "All systems go." : on ? "Running self test..." : "Press and hold START."}</p>
    </div>
  );
}
