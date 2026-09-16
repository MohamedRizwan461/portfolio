"use client";

import { motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { SignalDot } from "./motion-bits";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The spine the whole site hangs off: a trace that draws itself as you scroll,
 * with a signal running down it. Children are WireSection blocks.
 */
export function Wire({ children, className = "" }: { children: ReactNode; className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: container, offset: ["start 75%", "end 65%"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div ref={container} className={`relative pl-8 sm:pl-10 ${className}`}>
      <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-rule sm:left-[11px]">
        <motion.div
          className="absolute inset-x-0 top-0 h-full origin-top bg-accent"
          style={reduce ? { scaleY: 1 } : { scaleY: drawn }}
        />
        <SignalDot axis="y" duration={7} />
        <SignalDot axis="y" duration={7} delay={3.5} />
      </div>
      {children}
    </div>
  );
}

/** A section that hangs off the wire: node, heading, content. */
export function WireSection({
  title,
  id,
  meta,
  children,
  className = "",
}: {
  title: string;
  id?: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} id={id} aria-labelledby={id ? `${id}-head` : undefined} className={`relative scroll-mt-24 ${className}`}>
      <WireNode active={inView} />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-2 border-rule-strong pt-3">
          <h2
            id={id ? `${id}-head` : undefined}
            className="text-[0.8125rem] font-semibold tracking-[0.06em] uppercase"
          >
            {title}
          </h2>
          {meta && <p className="num font-mono text-xs text-ink-2">{meta}</p>}
        </div>
        {children}
      </motion.div>
    </section>
  );
}

/** The square that sits on the wire and fills when its section arrives. */
export function WireNode({ active, className = "" }: { active: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute top-1 -left-8 block h-3.5 w-3.5 border-2 transition-colors duration-500 sm:-left-10 sm:h-[15px] sm:w-[15px] ${
        active ? "border-accent bg-accent" : "border-rule-strong bg-ground"
      } ${className}`}
    />
  );
}

/** A branch off the wire: a short horizontal trace into a card or figure. */
export function Branch({
  children,
  index = 0,
  className = "",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
