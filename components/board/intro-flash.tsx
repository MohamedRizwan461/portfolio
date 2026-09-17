"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Lightning } from "@phosphor-icons/react/dist/ssr";
import { playPowerOn, playTick } from "@/lib/sound";

type Line = { t: string; tone?: "dim" | "ok" | "accent" | "plain" };

const SCRIPT: { at: number; line: Line }[] = [
  { at: 0, line: { t: "$ openocd -f interface/stlink.cfg -f target/stm32f4x.cfg -c \"program riz.elf verify reset\"", tone: "plain" } },
  { at: 380, line: { t: "Info : STLINK V3 (API v3) VID:PID 0483:374F", tone: "dim" } },
  { at: 620, line: { t: "Info : Target voltage: 3.294 V", tone: "dim" } },
  { at: 860, line: { t: "Info : stm32f4x.cpu: Cortex-M4 r0p1 processor detected", tone: "dim" } },
  { at: 1100, line: { t: "** Programming Started **", tone: "plain" } },
  { at: 2700, line: { t: "** Programming Finished **", tone: "ok" } },
  { at: 2950, line: { t: "** Verified OK ** 48 316 bytes", tone: "ok" } },
  { at: 3200, line: { t: "** Resetting Target **", tone: "plain" } },
  { at: 3600, line: { t: "[uart1 115200] RIZ firmware v2026.1 · FreeRTOS 10.6 · CAN up", tone: "accent" } },
  { at: 3900, line: { t: "[uart1 115200] Hello. I'm Mohamed Rizwan Ameer John.", tone: "accent" } },
];

/**
 * Option B: flash the firmware. A debug probe on the board, a terminal beside it;
 * programming, verify, reset, and the board boots and introduces itself.
 */
export function IntroFlash({ onPowered }: { onPowered: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const t0 = useRef(0);
  const finished = useRef(false);

  const flash = useCallback(() => {
    if (started) return;
    playTick();
    t0.current = performance.now();
    setStarted(true);
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (reduce) {
      setElapsed(5000);
    } else {
      let raf = 0;
      const tick = () => {
        const e = performance.now() - t0.current;
        setElapsed(e);
        if (e < 4300) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
  }, [started, reduce]);

  useEffect(() => {
    if (elapsed >= 3600 && !finished.current) {
      finished.current = true;
      playPowerOn();
      setTimeout(onPowered, reduce ? 300 : 1100);
    }
  }, [elapsed, onPowered, reduce]);

  const lines = started ? SCRIPT.filter((s) => elapsed >= s.at).map((s) => s.line) : [];
  const programming = started && elapsed >= 1100 && elapsed < 2700;
  const progress = !started ? 0 : Math.max(0, Math.min(100, ((elapsed - 1100) / 1600) * 100));
  const booted = elapsed >= 3600;
  const blink = Math.floor(elapsed / 120) % 2 === 0;

  const tone = (t?: Line["tone"]) =>
    t === "dim" ? "text-[#7d8894]" : t === "ok" ? "text-[#4ade80]" : t === "accent" ? "text-[var(--accent)]" : "text-[#e6edf3]";

  return (
    <div className="w-full max-w-4xl select-none text-left">
      <div className="grid overflow-hidden rounded-xl border border-[#2a2f36] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:grid-cols-[0.9fr_1.1fr]">
        {/* the board and the probe */}
        <div className="relative bg-[#0f1318] p-4">
          <svg viewBox="0 0 320 230" className="h-auto w-full" aria-label="A black circuit board with an STM32 microcontroller and a debug probe connected">
            <rect x="20" y="20" width="280" height="190" rx="10" fill="#15191f" stroke="#2c323b" strokeWidth="2" />
            {[[40, 40], [280, 40], [40, 190], [280, 190]].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="6" fill="none" stroke="#b39462" strokeWidth="2" />
            ))}
            {/* traces */}
            <g stroke="#b39462" strokeWidth="1.4" fill="none" opacity="0.7">
              <path d="M150 115 H90 V70 H60" />
              <path d="M170 115 H230 V160 H262" />
              <path d="M160 135 V178 H120" />
              <path d="M160 95 V60 H210" />
              <path d="M140 110 H110 V150 H70" />
            </g>
            {/* STM32 LQFP */}
            <g transform="translate(160 115)">
              <rect x="-34" y="-34" width="68" height="68" rx="3" fill="#0b0d10" stroke="#3a414b" />
              {Array.from({ length: 9 }, (_, i) => (
                <g key={i} fill="#9aa4ae">
                  <rect x={-28 + i * 7} y="-40" width="3" height="6" />
                  <rect x={-28 + i * 7} y="34" width="3" height="6" />
                  <rect x="-40" y={-28 + i * 7} width="6" height="3" />
                  <rect x="34" y={-28 + i * 7} width="6" height="3" />
                </g>
              ))}
              <circle cx="-24" cy="-24" r="2.5" fill="#2a3038" />
              <text x="0" y="-4" textAnchor="middle" fontSize="9" fontWeight="700" fill="#d7dde3" fontFamily="monospace">STM32</text>
              <text x="0" y="8" textAnchor="middle" fontSize="7" fill="#8c96a0" fontFamily="monospace">F446RET6</text>
            </g>
            {/* SWD header + probe cable */}
            <g transform="translate(46 100)">
              {Array.from({ length: 5 }, (_, i) => <rect key={i} x="0" y={i * 8} width="6" height="6" fill="#d7b43c" />)}
            </g>
            <path d="M48 110 C 10 110, 10 225, 0 230" stroke="#f5f5f5" strokeWidth="6" fill="none" opacity="0.15" />
            <path d="M48 108 C 12 108, 14 225, 4 232" stroke="#6b21a8" strokeWidth="5" fill="none" />
            <rect x="40" y="96" width="16" height="44" rx="3" fill="#1f2937" stroke="#4b5563" />
            {/* LEDs */}
            {[
              { x: 240, label: "PWR", on: true, color: "#ef4444" },
              { x: 262, label: "PROG", on: programming && blink, color: "#f59e0b" },
              { x: 284, label: "RUN", on: booted && (reduce || Math.floor(elapsed / 400) % 2 === 0), color: "#22c55e" },
            ].map((l) => (
              <g key={l.label} transform={`translate(${l.x - 30} 58)`}>
                {l.on && <circle r="9" fill={l.color} opacity="0.35" />}
                <rect x="-4" y="-3" width="8" height="6" rx="1" fill={l.on ? l.color : "#3a1a1a"} />
                <text y="16" textAnchor="middle" fontSize="6" fill="#8c96a0" fontFamily="monospace">{l.label}</text>
              </g>
            ))}
            {/* USB-C */}
            <rect x="286" y="104" width="18" height="22" rx="4" fill="#9aa4ae" />
            <text x="160" y="200" textAnchor="middle" fontSize="8" fill="#6f7a86" fontFamily="monospace">RIZ-CAN-NODE · REV B</text>
          </svg>
        </div>

        {/* the terminal */}
        <div className="flex min-h-[15rem] flex-col bg-[#0a0d11]">
          <div className="flex items-center gap-1.5 border-b border-[#1f2630] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            <span className="ml-2 font-mono text-[0.7rem] text-[#7d8894]">riz@bench: ~/can-gear-controller</span>
          </div>
          <div className="flex-1 space-y-0.5 overflow-hidden p-3 font-mono text-[0.7rem] leading-relaxed sm:text-[0.75rem]" aria-live="polite">
            {!started && <p className="text-[#7d8894]">Board connected. Firmware not loaded.</p>}
            {lines.map((l, i) => (
              <p key={i} className={`break-all ${tone(l.tone)}`}>
                {l.t}
              </p>
            ))}
            {started && elapsed >= 1100 && (
              <p className="text-[#e6edf3]">
                [{"█".repeat(Math.round(progress / 5)).padEnd(20, "·")}] {Math.round(progress)}%
              </p>
            )}
          </div>
          <div className="border-t border-[#1f2630] p-3">
            <button
              type="button"
              onClick={flash}
              disabled={started}
              className="relative flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            >
              {!started && !reduce && <span aria-hidden className="absolute inset-0 rounded-md ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[#0a0d11] motion-safe:animate-pulse" />}
              <Lightning size={16} weight="fill" />
              {booted ? "Booted" : started ? "Flashing..." : "Flash firmware"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
