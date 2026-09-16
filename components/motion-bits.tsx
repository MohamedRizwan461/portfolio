"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade and lift into place once, the first time it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Counts up to a value when scrolled into view. Static under reduced motion. */
export function CountUp({ to, suffix = "", duration = 1.1 }: { to: number; suffix?: string; duration?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(reduce ? to : 0);
  const rounded = useTransform(count, (v) => Math.round(v).toString() + suffix);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(count, to, { duration, ease: EASE });
    return () => controls.stop();
  }, [inView, reduce, count, to, duration]);

  return (
    <span ref={ref} className="num tabular-nums">
      <motion.span>{rounded}</motion.span>
    </span>
  );
}

/** A dot that runs along a wire, the way a signal would. */
export function SignalDot({ className = "", delay = 0, duration = 3.2, axis = "x" }: { className?: string; delay?: number; duration?: number; axis?: "x" | "y" }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const travel = axis === "x" ? { left: ["0%", "100%"] } : { top: ["0%", "100%"] };
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute block h-1.5 w-1.5 rounded-full bg-accent ${className}`}
      style={axis === "x" ? { top: "50%", marginTop: -3 } : { left: "50%", marginLeft: -3 }}
      animate={{ ...travel, opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear", times: [0, 0.1, 0.85, 1] }}
    />
  );
}

/** Types a line out once, like a device printing its boot log. */
export function Typewriter({ text, speed = 28, className = "" }: { text: string; speed?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? text.length : 0);

  useEffect(() => {
    if (reduce) return;
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{text.slice(0, shown)}</span>
      <span aria-hidden className="ml-0.5 inline-block w-[0.55em] animate-pulse bg-current align-[-0.1em]">
        &nbsp;
      </span>
    </span>
  );
}
