"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Each page fades up on arrival. Opacity only, so fixed overlays inside keep their place. */
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}
