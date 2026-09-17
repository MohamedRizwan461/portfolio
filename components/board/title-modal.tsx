"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { ArrowRight, ArrowUpRight, DownloadSimple, X } from "@phosphor-icons/react/dist/ssr";
import type { Card } from "@/lib/cards";
import { GearSim } from "@/components/gear-sim";
import { CardThumb } from "./card-thumb";

const EASE = [0.16, 1, 0.3, 1] as const;

/** The Netflix title window: big media header, badges, the story, then "episodes". */
export function TitleModal({ card, accent, onClose }: { card: Card | null; accent: string; onClose: () => void }) {
  const reduce = useReducedMotion();
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!card) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, onClose]);

  const ctaClass =
    "inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[0.9rem] font-medium text-ground no-underline transition-shadow duration-500 hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--ink)_12%,transparent)]";

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key={card.id}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-xl sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          onClick={onClose}
        >
          <motion.article
            role="dialog"
            aria-modal="true"
            aria-label={card.title}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
            initial={reduce ? false : { opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.7, ease: EASE }}
            className={`relative max-h-[94dvh] w-full overflow-y-auto border border-rule ${card.interactive ? "max-w-[min(96vw,78rem)]" : "max-w-3xl"} bg-[var(--surface)] shadow-[0_60px_140px_-40px_rgba(0,0,0,0.95)]`}
          >
            <button
              ref={closeBtn}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-rule-strong bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] text-ink backdrop-blur transition-colors duration-300 hover:border-ink"
            >
              <X size={16} weight="bold" />
            </button>

            {card.interactive === "gearsim" ? (
              <div className="p-4 pt-12 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pr-12">
                  <h2 className="display text-2xl sm:text-3xl">
                    {card.id === "gearsim" ? card.title : `${card.title}: try it`}
                  </h2>
                  <Link href={card.cta.href.startsWith("/") ? card.cta.href : "/projects/can-gear-controller"} className="link-u text-sm text-ink">
                    Read the case study
                  </Link>
                </div>
                <div className="mt-3">
                  <GearSim />
                </div>
              </div>
            ) : (
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <CardThumb thumb={card.thumb} playing={!reduce} large accent={accent} />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[color-mix(in_srgb,var(--surface)_25%,transparent)] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <h2 className="display max-w-[22ch] text-2xl sm:text-4xl">{card.title}</h2>
                <div className="mt-6 flex flex-wrap gap-2">
                  {card.cta.external || card.cta.download ? (
                    <a
                      href={card.cta.href}
                      {...(card.cta.download ? { download: true } : { target: "_blank", rel: "noopener" })}
                      className={ctaClass}
                    >
                      {card.cta.download ? <DownloadSimple size={16} weight="bold" /> : <ArrowUpRight size={16} weight="bold" />}
                      {card.cta.label}
                    </a>
                  ) : (
                    <Link href={card.cta.href} className={ctaClass}>
                      {card.cta.label} <ArrowRight size={16} weight="bold" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            )}

            {!card.interactive && (
            <div className="grid gap-6 p-5 sm:grid-cols-[1fr_12rem] sm:p-7">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  {card.badges.map((b) => (
                    <span key={b} className="flex items-center gap-1.5 rounded-full border border-rule-strong px-2.5 py-0.5 font-mono text-[0.6rem] tracking-[0.18em] text-ink uppercase">
                      <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
                      {b}
                    </span>
                  ))}
                  <span className="font-mono text-[0.7rem] text-ink-2">{card.meta}</span>
                </p>
                <p className="mt-5 text-base leading-relaxed font-light text-ink sm:text-lg">{card.blurb}</p>
              </div>
              <div className="text-sm text-ink-2 sm:border-l sm:border-rule sm:pl-5">
                <p className="eyebrow">Riz</p>
                <p className="mt-1 text-ink">Robotics and embedded systems engineer</p>
              </div>
            </div>

            )}

            {card.episodes && !card.interactive && (
              <div className="border-t border-rule px-5 pt-5 pb-7 sm:px-7">
                <h3 className="eyebrow">Episodes</h3>
                <ol className="mt-3 divide-y divide-rule">
                  {card.episodes.map((ep, i) => (
                    <li key={ep.title} className="grid grid-cols-[3.25rem_1fr] gap-3 py-5">
                      <span className="display text-2xl text-ink-2 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <p className="font-medium text-ink">{ep.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-2">{ep.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
