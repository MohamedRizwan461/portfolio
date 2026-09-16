"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { milestones } from "@/lib/journey";
import { SignalDot } from "./motion-bits";

const EASE = [0.16, 1, 0.3, 1] as const;

export function JourneyStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [inView, setInView] = useState(false);
  const draw = { duration: 1.4, ease: EASE };

  useEffect(() => {
    const t = requestAnimationFrame(() => setInView(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div ref={ref} className="mt-8">
      {/* phones: the wire runs down the left */}
      <ol className="relative space-y-6 pl-8 sm:hidden">
        <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-rule">
          <motion.div
            className="absolute inset-x-0 top-0 h-full origin-top bg-accent"
            initial={reduce ? false : { scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : undefined}
            transition={draw}
          />
          <SignalDot axis="y" duration={5} />
        </div>
        {milestones.map((m, i) => (
          <MilestoneItem key={m.id} milestone={m} index={i} inView={inView} vertical />
        ))}
      </ol>

      {/* wider screens: the wire runs across */}
      <ol className="relative hidden grid-cols-5 gap-4 pt-6 sm:grid">
        <div aria-hidden className="absolute top-[7px] right-[10%] left-[10%] h-px bg-rule">
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left bg-accent"
            initial={reduce ? false : { scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : undefined}
            transition={draw}
          />
          <SignalDot duration={4.5} delay={1.2} />
          <SignalDot duration={4.5} delay={3.4} />
        </div>
        {milestones.map((m, i) => (
          <MilestoneItem key={m.id} milestone={m} index={i} inView={inView} />
        ))}
      </ol>

      <p className="mt-8">
        <Link
          href="/about#biology"
          className="ease group inline-flex items-center gap-2 font-medium text-accent hover:text-ink"
        >
          Read the whole path
          <ArrowRight size={16} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </p>
    </div>
  );
}

function MilestoneItem({
  milestone,
  index,
  inView,
  vertical,
}: {
  milestone: (typeof milestones)[number];
  index: number;
  inView: boolean;
  vertical?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      className={vertical ? "relative" : "relative flex flex-col items-center text-center"}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: 0.25 + index * 0.12, ease: EASE }}
    >
      <motion.span
        aria-hidden
        className={`block h-3.5 w-3.5 border-2 border-accent bg-accent ${vertical ? "absolute top-1 -left-8" : "relative -mt-[7px]"}`}
        initial={reduce ? false : { scale: 0 }}
        animate={inView ? { scale: 1 } : undefined}
        transition={{ duration: 0.4, delay: 0.3 + index * 0.12, ease: EASE }}
      />
      {!vertical && (
        <motion.span
          aria-hidden
          className="mt-4 block h-14 w-20 border border-rule bg-white"
          initial={reduce ? false : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.45 + index * 0.12 }}
          style={{ visibility: milestone.thumb ? "visible" : "hidden" }}
        >
          {milestone.thumb && (
            <Image
              src={milestone.thumb.src}
              alt=""
              width={160}
              height={112}
              sizes="80px"
              className="h-full w-full object-cover"
            />
          )}
        </motion.span>
      )}
      <Link
        href={`/about#${milestone.id}`}
        className={`ease block no-underline hover:text-accent ${vertical ? "" : "mt-3"}`}
      >
        <span className="block font-medium">{milestone.label}</span>
        <span className="mt-1 block text-sm text-ink-2">{milestone.note}</span>
      </Link>
    </motion.li>
  );
}
