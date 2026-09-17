"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";

const EASE = [0.16, 1, 0.3, 1] as const;

export type Slide = { id: string; label: string; content: ReactNode };

/**
 * One screen at a time. Advance by clicking Next, pressing an arrow key or
 * swiping. No long scroll: each slide is its own view, and only a slide taller
 * than the viewport scrolls inside itself.
 */
export function Deck({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (next: number) => {
      setIndex((current) => {
        const clamped = Math.max(0, Math.min(slides.length - 1, next));
        setDirection(clamped >= current ? 1 : -1);
        if (clamped !== current && typeof window !== "undefined") {
          window.history.replaceState(null, "", `#${slides[clamped].id}`);
        }
        return clamped;
      });
    },
    [slides],
  );

  // Deep links and back/forward: #path opens that slide.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      const found = slides.findIndex((s) => s.id === id);
      if (found >= 0) setIndex(found);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [slides]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "Home") {
        go(0);
      } else if (e.key === "End") {
        go(slides.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, slides.length]);

  const slide = slides[index];
  const last = index === slides.length - 1;

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col"
      onTouchStart={(e) => {
        const t = e.changedTouches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        if (!start) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      {/* chapter rail */}
      <nav aria-label="Sections" className="fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 lg:block">
        <ol className="flex flex-col items-end gap-3">
          {slides.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === index ? "true" : undefined}
                className="group flex items-center gap-3 text-right"
              >
                <span
                  className={`text-xs tracking-wide transition-all duration-300 ${
                    i === index ? "font-mono text-[0.62rem] tracking-[0.2em] uppercase text-ink opacity-100" : "font-mono text-[0.62rem] tracking-[0.2em] uppercase text-ink-2 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className={`block h-px transition-all duration-300 ${
                    i === index ? "w-10 bg-ink" : "w-5 bg-rule-strong group-hover:w-8 group-hover:bg-ink-2"
                  }`}
                />
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={slide.id}
            aria-label={slide.label}
            initial={reduce ? false : { opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex min-h-[100dvh] flex-col justify-center px-4 pt-28 pb-32 sm:px-8 lg:px-16"
          >
            {slide.content}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="fixed inset-x-3 bottom-3 z-30 sm:inset-x-6 sm:bottom-5">
        <div className="glass relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 overflow-hidden rounded-full pr-2 pl-6">
          <p className="eyebrow">
            <span className="text-ink">{String(index + 1).padStart(2, "0")}</span>
            <span className="mx-1.5 opacity-50">/</span>
            {String(slides.length).padStart(2, "0")}
            <span className="ml-4 hidden text-ink sm:inline">{slide.label}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              aria-label="Previous section"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-rule-strong text-ink transition-colors duration-300 hover:border-ink disabled:opacity-30 disabled:hover:border-rule-strong"
            >
              <ArrowLeft size={16} weight="bold" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={last}
              aria-label="Next section"
              className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-ground transition-shadow duration-500 hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--ink)_12%,transparent)] disabled:opacity-30"
            >
              {last ? "End" : "Next"}
              <ArrowRight size={16} weight="bold" aria-hidden />
            </button>
          </div>
          <div className="absolute inset-x-10 bottom-0 h-px bg-rule">
            <motion.div
              className="h-px bg-ink"
              animate={{ width: `${((index + 1) / slides.length) * 100}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
