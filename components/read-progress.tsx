"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** A hairline that fills as the case study is read. */
export function ReadProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-accent"
      style={{ scaleX: width }}
    />
  );
}
