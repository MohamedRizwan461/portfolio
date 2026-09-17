"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cards, type Card } from "@/lib/cards";
import { chapters } from "@/lib/journey";
import { chaptersRead, stationsSeen } from "@/lib/progress";
import { CardThumb } from "./card-thumb";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Netflix-style row pinned to the bottom of the board: hover to preview, click to open. */
export function RowDock({
  title,
  ids,
  accent,
  seenTick,
  onOpen,
}: {
  title: string;
  ids: string[];
  accent: string;
  /** bumps when something new has been seen, so progress bars refresh */
  seenTick: number;
  onOpen: (card: Card) => void;
}) {
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const read = chaptersRead();
    const seen = stationsSeen();
    const next: Record<string, number> = {};
    for (const id of ids) {
      const c = cards[id];
      if (c.progress === "chapters") next[id] = read.size / chapters.length;
      else if (c.station && seen.has(c.station)) next[id] = 1;
    }
    setProgress(next);
  }, [ids, seenTick]);

  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });

  return (
    <motion.section
      aria-label={title}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
      className="pointer-events-auto relative"
    >
      <div className="mb-2 flex items-end justify-between px-1">
        <h2 className="text-sm font-semibold tracking-tight sm:text-base">{title}</h2>
        <div className="hidden gap-1.5 sm:flex">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => scroll(d as 1 | -1)}
              aria-label={d < 0 ? "Scroll row left" : "Scroll row right"}
              className="ease flex h-7 w-7 items-center justify-center border border-rule bg-[var(--surface)] text-ink backdrop-blur hover:border-accent"
            >
              {d < 0 ? <CaretLeft size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible px-1 pt-2 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ids.map((id, i) => {
          const card = cards[id];
          const p = progress[id];
          const isHover = hover === id;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => onOpen(card)}
              onMouseEnter={() => setHover(id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(id)}
              onBlur={() => setHover(null)}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, scale: isHover && !reduce ? 1.06 : 1 }}
              transition={{ duration: 0.35, delay: reduce ? 0 : 0.25 + i * 0.05, ease: EASE }}
              className="group relative w-[10rem] shrink-0 snap-start overflow-hidden border border-rule bg-[var(--surface)] text-left shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9)] outline-none focus-visible:ring-2 sm:w-[12rem]"
              style={{ zIndex: isHover ? 5 : 1, borderColor: isHover ? accent : undefined }}
            >
              <span className="relative block aspect-video overflow-hidden">
                <CardThumb thumb={card.thumb} playing={isHover && !reduce} accent={accent} />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />
                {card.badges[0] && (
                  <span
                    className="absolute top-1.5 left-1.5 px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold tracking-wide text-[var(--accent-ink)] uppercase"
                    style={{ background: accent }}
                  >
                    {card.badges[0]}
                  </span>
                )}
              </span>
              <span className="block px-2.5 pt-2 pb-2.5">
                <span className="line-clamp-1 block text-[0.78rem] font-semibold text-ink">{card.title}</span>
                <span className="mt-0.5 line-clamp-1 block text-[0.68rem] text-ink-2">{card.meta}</span>
              </span>
              {p !== undefined && p > 0 && (
                <span className="absolute inset-x-0 bottom-0 h-1 bg-[var(--rule-strong)]" aria-label={`${Math.round(p * 100)}% seen`}>
                  <span className="block h-full" style={{ width: `${Math.max(8, p * 100)}%`, background: accent }} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
