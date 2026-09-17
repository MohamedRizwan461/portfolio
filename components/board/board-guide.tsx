"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowsOutCardinal, CursorClick, Keyboard, Question, X } from "@phosphor-icons/react/dist/ssr";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * How to work the board. It stays up until the visitor touches something, then
 * folds into a question mark they can open again.
 */
export function BoardGuide({ compact, accent, collapsed }: { compact: boolean; accent: string; collapsed: boolean }) {
  const reduce = useReducedMotion();
  // on a phone the hero owns the top of the screen, so the guide waits as a button
  const [open, setOpen] = useState(!compact);
  useEffect(() => setOpen(!compact), [compact]);
  const show = open && !collapsed;

  const rows = compact
    ? [
        { Icon: CursorClick, k: "Tap a chip", v: "opens that project" },
        { Icon: ArrowsOutCardinal, k: "Drag", v: "turn the board around" },
      ]
    : [
        { Icon: CursorClick, k: "Click a chip", v: "opens that project" },
        { Icon: ArrowsOutCardinal, k: "Drag", v: "turn the board around" },
        { Icon: Keyboard, k: "← →", v: "move between chips" },
      ];

  return (
    <div
      className={`absolute z-20 flex flex-col items-end ${compact ? "right-4 bottom-[13.5rem]" : "top-[4.6rem] right-4 sm:top-[5.4rem] sm:right-8"}`}
    >
      <AnimatePresence mode="wait">
        {show ? (
          <motion.div
            key="panel"
            className="glass w-[15.5rem] rounded-2xl p-3.5"
            initial={reduce ? false : { opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <p className="eyebrow !text-[0.58rem]" style={{ color: accent }}>
                How to use the board
              </p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Hide the guide" className="text-ink-2 transition-colors hover:text-ink">
                <X size={12} weight="bold" />
              </button>
            </div>
            <ul className="mt-3 space-y-2.5">
              {rows.map(({ Icon, k, v }) => (
                <li key={k} className="flex items-start gap-2.5 text-[0.8rem] leading-snug">
                  <Icon size={14} className="mt-0.5 shrink-0 text-ink-2" aria-hidden />
                  <span>
                    <span className="font-medium text-ink">{k}</span> <span className="text-ink-2">{v}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.button
            key="dot"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="How to use the board"
            className="glass flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition-colors hover:text-ink"
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <Question size={15} weight="bold" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
