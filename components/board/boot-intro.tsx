"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { modes, type ModeId } from "@/lib/modes";

const EASE = [0.16, 1, 0.3, 1] as const;

const BOOT_LINES = [
  { text: "RIZ BOOTLOADER", tone: "head" },
  { text: "power rail 3V3 ............ ok", tone: "ok" },
  { text: "RP2040 · BCM2711 · STM32F4 .. ok", tone: "ok" },
  { text: "CAN bus 0x18F00500 ......... ok", tone: "ok" },
  { text: "ultrasonic sensors ......... ok", tone: "ok" },
  { text: "coffee ..................... ok", tone: "ok" },
] as const;

const LED_COUNT = 8;

type Props = {
  /** "boot" plays the power-on first; "menu" goes straight to mode select */
  start: "boot" | "menu";
  current?: ModeId | null;
  onSelect: (mode: ModeId) => void;
  onDismiss?: () => void;
};

export function BootIntro({ start, current, onSelect, onDismiss }: Props) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"boot" | "menu">(start);
  const [lines, setLines] = useState(start === "menu" || reduce ? BOOT_LINES.length : 0);
  const [focus, setFocus] = useState(Math.max(0, modes.findIndex((m) => m.id === current)));
  const [leaving, setLeaving] = useState(false);

  // print the boot log one line at a time, then show the menu
  useEffect(() => {
    if (phase !== "boot") return;
    if (reduce) {
      setLines(BOOT_LINES.length);
      const t = setTimeout(() => setPhase("menu"), 300);
      return () => clearTimeout(t);
    }
    if (lines < BOOT_LINES.length) {
      const t = setTimeout(() => setLines((n) => n + 1), lines === 0 ? 350 : 230);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("menu"), 450);
    return () => clearTimeout(t);
  }, [phase, lines, reduce]);

  const choose = useCallback(
    (id: ModeId) => {
      if (leaving) return;
      setLeaving(true);
      setTimeout(() => onSelect(id), reduce ? 0 : 420);
    },
    [leaving, onSelect, reduce],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "boot") {
        // any key skips the log
        setLines(BOOT_LINES.length);
        setPhase("menu");
        return;
      }
      const byKey = modes.find((m) => m.key === e.key);
      if (byKey) return choose(byKey.id);
      if (e.key === "ArrowDown" || e.key === "ArrowRight") setFocus((f) => (f + 1) % modes.length);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") setFocus((f) => (f - 1 + modes.length) % modes.length);
      if (e.key === "Enter") choose(modes[focus].id);
      if (e.key === "Escape" && onDismiss) onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, focus, choose, onDismiss]);

  const lit = phase === "menu" ? LED_COUNT : Math.round((lines / BOOT_LINES.length) * LED_COUNT);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Select operator mode"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#030509]/95 px-4 backdrop-blur-sm"
      initial={{ opacity: start === "menu" ? 0 : 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
      onClick={() => {
        if (phase === "boot") {
          setLines(BOOT_LINES.length);
          setPhase("menu");
        }
      }}
    >
      {/* faint scan lines, like an old terminal on the bench */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_4px)]"
      />

      <div className="relative w-full max-w-xl font-mono">
        {/* status LEDs */}
        <div className="mb-6 flex items-center gap-2" aria-hidden>
          {Array.from({ length: LED_COUNT }).map((_, i) => {
            const on = i < lit;
            const color = i === LED_COUNT - 1 ? "#27e0c4" : "#4d8dff";
            return (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full transition-all duration-300"
                style={{
                  background: on ? color : "rgba(255,255,255,0.08)",
                  boxShadow: on ? `0 0 10px ${color}` : "none",
                }}
              />
            );
          })}
          <span className="ml-3 text-[0.65rem] tracking-[0.2em] text-ink-2">{phase === "boot" ? "POWERING ON" : "READY"}</span>
        </div>

        {/* boot log */}
        <div className="min-h-[9.5rem] text-[0.8rem] leading-6 sm:text-sm" aria-live="polite">
          {BOOT_LINES.slice(0, lines).map((l, i) => (
            <motion.p
              key={l.text}
              initial={reduce ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={i === 0 ? "mb-1 font-semibold tracking-[0.25em] text-ink" : "text-ink-2"}
            >
              {i === 0 ? (
                l.text
              ) : (
                <>
                  <span className="text-accent">&gt; </span>
                  {l.text.replace(/ ok$/, "")}
                  <span className="text-accent-2"> ok</span>
                </>
              )}
            </motion.p>
          ))}
        </div>

        {/* mode select */}
        <AnimatePresence>
          {phase === "menu" && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mt-4 border-t border-rule pt-5"
            >
              <p className="text-xs tracking-[0.25em] text-accent-2">SELECT OPERATOR MODE</p>
              <ul className="mt-4 space-y-2" role="listbox" aria-label="Operator modes">
                {modes.map((m, i) => {
                  const active = i === focus;
                  return (
                    <li key={m.id} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onMouseEnter={() => setFocus(i)}
                        onFocus={() => setFocus(i)}
                        onClick={(e) => {
                          e.stopPropagation();
                          choose(m.id);
                        }}
                        className={`group flex w-full items-center gap-4 border px-4 py-3 text-left transition-colors ${
                          active ? "border-accent bg-accent/10" : "border-rule hover:border-rule-strong"
                        }`}
                      >
                        <span className={`text-sm ${active ? "text-accent" : "text-ink-2"}`}>[{m.key}]</span>
                        <span className="flex-1">
                          <span className={`block font-sans text-base font-semibold tracking-tight ${active ? "text-ink" : "text-ink/85"}`}>
                            {m.label}
                          </span>
                          <span className="mt-0.5 block font-sans text-xs text-ink-2">{m.line}</span>
                        </span>
                        <span className={`text-sm transition-opacity ${active ? "text-accent opacity-100" : "opacity-0"}`}>
                          &larr;
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[0.65rem] tracking-wide text-ink-2">
                press 1, 2 or 3 · arrows and enter · you can switch later
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "boot" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLines(BOOT_LINES.length);
              setPhase("menu");
            }}
            className="absolute -top-2 right-0 border border-rule px-2.5 py-1 text-[0.65rem] tracking-wider text-ink-2 hover:border-accent hover:text-accent"
          >
            SKIP
          </button>
        )}
      </div>
    </motion.div>
  );
}
