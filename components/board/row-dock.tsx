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
      <div className="mb-1 flex items-end justify-between px-1">
        <h2 className="eyebrow flex items-center gap-3">
          <span className="text-ink">{title}</span>
          <span className="opacity-50">{String(ids.length).padStart(2, "0")}</span>
        </h2>
        <div className="hidden gap-1.5 sm:flex">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => scroll(d as 1 | -1)}
              aria-label={d < 0 ? "Scroll row left" : "Scroll row right"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-rule-strong bg-[color-mix(in_srgb,var(--ground)_50%,transparent)] text-ink backdrop-blur transition-colors duration-300 hover:border-ink"
            >
              {d < 0 ? <CaretLeft size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={track}
        data-lenis-prevent
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible px-1 pt-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              animate={{ opacity: 1, y: isHover && !reduce ? -4 : 0 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : isHover ? 0 : 0.25 + i * 0.05, ease: EASE }}
              className="group relative w-[10.5rem] shrink-0 snap-start text-left outline-none focus-visible:ring-2 sm:w-[13rem]"
            >
              <span
                className="relative block aspect-video overflow-hidden border bg-[var(--surface)] shadow-[0_24px_50px_-28px_rgba(0,0,0,0.95)] transition-[border-color] duration-500"
                style={{ borderColor: isHover ? `color-mix(in srgb, ${accent} 70%, transparent)` : "var(--rule)" }}
              >
                <span className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]">
                  <CardThumb thumb={card.thumb} playing={isHover && !reduce} accent={accent} />
                </span>
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                {card.badges[0] && (
                  <span className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[0.52rem] tracking-[0.16em] text-white uppercase backdrop-blur-sm">
                    <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
                    {card.badges[0]}
                  </span>
                )}
                {p !== undefined && p > 0 && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white/15" aria-label={`${Math.round(p * 100)}% seen`}>
                    <span className="block h-full" style={{ width: `${Math.max(8, p * 100)}%`, background: accent }} />
                  </span>
                )}
              </span>
              <span className="block px-0.5 pt-2.5">
                <span className="line-clamp-1 block text-[0.82rem] font-medium tracking-tight text-ink">{card.title}</span>
                <span className="mt-0.5 line-clamp-1 block font-mono text-[0.6rem] tracking-wide text-ink-2">{card.meta}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
