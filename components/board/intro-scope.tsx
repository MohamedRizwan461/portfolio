"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playPowerOn, playTick } from "@/lib/sound";

const NAME = "MOHAMED RIZWAN AMEER JOHN";
const SW = 640;
const SH = 250;

/** A CAN differential waveform built from real bits, so the picture is honest. */
function useWave() {
  return useMemo(() => {
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const bits: number[] = [];
    for (const ch of NAME) {
      const code = ch.charCodeAt(0);
      for (let b = 7; b >= 0; b--) bits.push((code >> b) & 1);
      bits.push(1, 1, rand() > 0.5 ? 0 : 1);
    }
    const bitW = 7;
    let high = "M0 118";
    let low = "M0 132";
    bits.forEach((bit, i) => {
      const x = i * bitW;
      // dominant (0): CANH up, CANL down. recessive (1): both at 2.5 V
      const yh = bit === 0 ? 70 : 118;
      const yl = bit === 0 ? 180 : 132;
      high += ` L${x} ${yh} L${x + bitW} ${yh}`;
      low += ` L${x} ${yl} L${x + bitW} ${yl}`;
    });
    return { high, low, width: bits.length * bitW };
  }, []);
}

/**
 * Option A: a bench oscilloscope on the CAN bus. Press RUN, the differential
 * signal streams in, and the protocol decoder spells out who you're meeting.
 */
export function IntroScope({ onPowered }: { onPowered: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const wave = useWave();
  const [running, setRunning] = useState(false);
  const [decoded, setDecoded] = useState(0);
  const done = useRef(false);

  const run = useCallback(() => {
    if (running) return;
    setRunning(true);
    playTick();
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (reduce) {
      setDecoded(NAME.length);
    } else if (decoded < NAME.length) {
      const t = setTimeout(() => setDecoded((n) => n + 1), 70);
      return () => clearTimeout(t);
    }
    if (!done.current) {
      done.current = true;
      const t1 = setTimeout(playPowerOn, 150);
      const t2 = setTimeout(onPowered, reduce ? 400 : 1300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [running, decoded, onPowered, reduce]);

  const hex = NAME.slice(0, decoded)
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"));
  const frames: string[][] = [];
  for (let i = 0; i < hex.length; i += 8) frames.push(hex.slice(i, i + 8));

  return (
    <div className="w-full max-w-3xl select-none">
      <div className="rounded-xl border border-[#2a2f36] bg-[linear-gradient(180deg,#23272e,#15181c)] p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] sm:p-4">
        <div className="mb-2 flex items-center justify-between px-1 font-mono text-[0.65rem] tracking-wider text-[#9aa4ae]">
          <span>RIZ-SCOPE 4 CH · 200 MHz · 2 GSa/s</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${running ? "bg-[#22c55e]" : "bg-[#ef4444]"}`} />
            {running ? "TRIG'D" : "STOP"}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_7.5rem]">
          {/* screen */}
          <div className="relative overflow-hidden rounded-md border border-black bg-[#050807]">
            <svg viewBox={`0 0 ${SW} ${SH}`} className="block h-auto w-full" aria-hidden>
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`v${i}`} x1={(i * SW) / 10} y1="0" x2={(i * SW) / 10} y2={SH - 44} stroke="#16302a" strokeWidth={i === 5 ? 1.2 : 0.6} />
              ))}
              {Array.from({ length: 7 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={(i * (SH - 44)) / 6} x2={SW} y2={(i * (SH - 44)) / 6} stroke="#16302a" strokeWidth={i === 3 ? 1.2 : 0.6} />
              ))}
              <text x="8" y="16" fontSize="10" fontFamily="monospace" fill="#ffd23f">CH1 CAN_H</text>
              <text x="88" y="16" fontSize="10" fontFamily="monospace" fill="#35d6ff">CH2 CAN_L</text>
              <text x={SW - 8} y="16" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#9aa4ae">
                500 kbit/s · 1 V/div
              </text>

              {running ? (
                <g className={reduce ? "" : "scope-scroll"} style={{ ["--scope-w" as string]: `${wave.width}px` }}>
                  {[0, wave.width].map((off) => (
                    <g key={off} transform={`translate(${off} 0)`}>
                      <path d={wave.high} fill="none" stroke="#ffd23f" strokeWidth="1.8" />
                      <path d={wave.low} fill="none" stroke="#35d6ff" strokeWidth="1.8" />
                    </g>
                  ))}
                </g>
              ) : (
                <>
                  <path d={`M0 118 ${Array.from({ length: 64 }, (_, i) => `L${i * 10} ${118 + ((i * 37) % 5) - 2}`).join(" ")}`} fill="none" stroke="#ffd23f" strokeWidth="1.2" opacity="0.6" />
                  <path d={`M0 132 ${Array.from({ length: 64 }, (_, i) => `L${i * 10} ${132 + ((i * 53) % 5) - 2}`).join(" ")}`} fill="none" stroke="#35d6ff" strokeWidth="1.2" opacity="0.6" />
                </>
              )}

              {/* protocol decode lane */}
              <rect x="0" y={SH - 44} width={SW} height="44" fill="#0b1210" />
              <text x="8" y={SH - 28} fontSize="9" fontFamily="monospace" fill="#6f7c86">DECODE CAN</text>
              {frames.map((f, i) => (
                <g key={i} transform={`translate(${78 + i * 140} ${SH - 38})`}>
                  <rect width="134" height="16" rx="3" fill="#123a2e" stroke="#2f7a60" />
                  <text x="6" y="11.5" fontSize="8.5" fontFamily="monospace" fill="#8ff0c8">
                    {f.join(" ")}
                  </text>
                </g>
              ))}
              <text x="8" y={SH - 9} fontSize="13" fontWeight="700" fontFamily="monospace" fill="#eef2f6" letterSpacing="1.5">
                ASCII: {NAME.slice(0, decoded)}
                {running && decoded < NAME.length ? "_" : ""}
              </text>
            </svg>
          </div>

          {/* controls */}
          <div className="flex items-center justify-between gap-3 sm:flex-col sm:justify-center">
            <div className="hidden grid-cols-2 gap-3 sm:grid">
              {["TRIG", "HORIZ", "VERT", "POS"].map((k) => (
                <div key={k} className="flex flex-col items-center gap-1">
                  <span className="block h-8 w-8 rounded-full border border-black bg-[radial-gradient(circle_at_35%_30%,#5b6470,#1b1e23)] shadow-[inset_0_-2px_3px_rgba(0,0,0,0.6)]" />
                  <span className="font-mono text-[0.55rem] text-[#9aa4ae]">{k}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={run}
              aria-label="Run the oscilloscope"
              className="relative flex h-12 w-full max-w-[7rem] items-center justify-center rounded-md border border-black font-mono text-sm font-bold tracking-widest text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.35)] transition-colors"
              style={{ background: running ? "#15803d" : "#b91c1c" }}
            >
              {!running && !reduce && <span aria-hidden className="absolute inset-0 rounded-md ring-2 ring-[var(--accent)] motion-safe:animate-pulse" />}
              RUN
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-2">
        {running ? "Decoding live CAN traffic..." : "Press RUN to capture the bus."}
      </p>
    </div>
  );
}
