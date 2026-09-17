"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { beats, storyLines } from "@/lib/story";
import type { Cue } from "@/components/board/particle-cinema";
import { useAccent } from "./lab";

const ParticleCinema = dynamic(() => import("@/components/board/particle-cinema").then((m) => m.ParticleCinema), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;
const SCENE: Record<string, Cue> = {
  biology: "helix",
  electronics: "chip",
  assistive: "leg",
  recognition: "globe",
  pivot: "rover",
  vehicles: "car",
  next: "name",
};

function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const set = () => setWide(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return wide;
}

/**
 * Option A: the story as a scroll film. The page is a long track; the stage stays
 * pinned while particles become each chapter and one sentence at a time rises in.
 * You cannot get to the next scene without passing the words.
 */
export function StoryFilm() {
  const reduce = useReducedMotion() ?? false;
  const accent = useAccent();
  const wide = useWide();
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(storyLines.length - 1, Math.max(0, Math.floor(p * storyLines.length)));
    setI(next);
  });

  const line = storyLines[i];
  const beat = line.beat;
  const cue = SCENE[beat.id];
  const showMedia = beat.media && line.li >= Math.min(1, beat.lines.length - 1);
  // the name spells across the middle, so the words drop below it
  const centered = cue === "name";

  return (
    <div ref={track} style={{ height: `${storyLines.length * 70 + 100}vh` }} className="relative">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <ParticleCinema cue={cue} reduce={reduce} accent={accent} offset={wide && !centered ? 0.2 : 0} />
        {/* keep the words readable over the light */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            centered
              ? "bg-[linear-gradient(0deg,rgba(4,6,10,0.95)_0%,rgba(4,6,10,0.6)_35%,transparent_55%)]"
              : "bg-[linear-gradient(90deg,rgba(4,6,10,0.92)_0%,rgba(4,6,10,0.6)_40%,transparent_70%)] max-lg:bg-[linear-gradient(0deg,rgba(4,6,10,0.95)_0%,rgba(4,6,10,0.7)_45%,transparent_75%)]"
          }`}
        />

        {/* chapter rail */}
        <ol className="absolute top-1/2 right-6 z-10 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex">
          {beats.map((b, bi) => {
            const on = bi === line.bi;
            const done = bi < line.bi;
            return (
              <li key={b.id} className="flex items-center gap-3">
                <span className={`font-mono text-[0.6rem] tracking-[0.2em] uppercase transition-all duration-500 ${on ? "text-white opacity-100" : "text-white/40 opacity-0"}`}>{b.label}</span>
                <span className="block h-px transition-all duration-500" style={{ width: on ? 40 : 18, background: on ? accent : done ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)" }} />
              </li>
            );
          })}
        </ol>

        {/* the words */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 px-6 pb-14 sm:px-10 ${
            centered ? "lg:pb-[12vh] lg:pl-[max(2.5rem,calc((100vw-72rem)/2))]" : "lg:top-0 lg:bottom-0 lg:flex lg:w-[48%] lg:flex-col lg:justify-center lg:pl-[max(2.5rem,calc((100vw-72rem)/2))]"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={beat.id}
              className="eyebrow !text-white/60"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span style={{ color: accent }}>{beat.n}</span> <span className="mx-2 opacity-40">/</span> {beat.label}{" "}
              <span className="mx-2 opacity-40">/</span> {beat.years}
            </motion.p>
          </AnimatePresence>

          <div className="relative mt-5 min-h-[9.5rem] sm:min-h-[11rem]">
            <AnimatePresence mode="popLayout">
              {line.li > 0 && (
                <motion.p
                  key={`prev-${i}`}
                  className="mb-3 max-w-[34ch] text-[0.95rem] leading-relaxed font-light text-white/35"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {beat.lines[line.li - 1]}
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={i}
                className="max-w-[26ch] text-[clamp(1.45rem,2.6vw,2.3rem)] leading-[1.18] font-light tracking-[-0.025em] text-white"
                initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(6px)", transition: { duration: 0.3 } }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                {line.text}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="font-mono text-[0.65rem] tracking-[0.2em] text-white/40 tabular-nums">
              {String(i + 1).padStart(2, "0")} / {storyLines.length}
            </span>
            {i === 0 && (
              <span className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.24em] text-white/50 uppercase">
                <ArrowDown size={12} className="motion-safe:animate-bounce" aria-hidden /> Scroll to read
              </span>
            )}
            {line.last && beat.link && (
              <Link href={beat.link.href} className="group inline-flex items-center gap-2 text-sm text-white no-underline">
                <span className="link-u">{beat.link.label}</span>
                <ArrowRight size={13} className="transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
              </Link>
            )}
          </div>
        </div>

        {/* the evidence, when the words reach it */}
        <AnimatePresence>
          {showMedia && beat.media && (
            <motion.figure
              key={beat.id}
              className="absolute right-[6%] bottom-[9%] z-10 m-0 hidden overflow-hidden border border-white/15 bg-black shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] lg:block"
              style={{ aspectRatio: `${beat.media.w} / ${beat.media.h}`, width: `min(22vw, 20rem, calc(42vh * ${beat.media.w / beat.media.h}))` }}
              initial={reduce ? false : { opacity: 0, y: 30, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {beat.media.kind === "video" ? (
                <video
                  src={beat.media.src}
                  poster={beat.media.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label={beat.media.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={beat.media.position ? { objectPosition: beat.media.position } : undefined}
                />
              ) : beat.media.src.endsWith(".webp") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={beat.media.src} alt={beat.media.alt} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <Image src={beat.media.src} alt={beat.media.alt} fill sizes="320px" className="bg-white object-contain" />
              )}
            </motion.figure>
          )}
        </AnimatePresence>

        {/* scroll progress */}
        <motion.div className="absolute inset-x-0 bottom-0 z-10 h-px origin-left" style={{ scaleX: scrollYProgress, background: accent }} />
      </div>
    </div>
  );
}
