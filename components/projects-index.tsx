"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/lib/content";
import { ProjectVisual } from "./project-visual";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The index of work as large editorial rows. On a desktop the cover floats
 * beside the cursor; the other rows step back while one is in focus.
 */
export function ProjectsIndex({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 160, damping: 22, mass: 0.6 });

  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        x.set(e.clientX);
        y.set(e.clientY);
      }}
    >
      <ul className="flex flex-col gap-2.5">
        {projects.map((p, i) => (
          <motion.li
            key={p.slug}
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.04 * (i % 3), ease: EASE }}
            className="overflow-hidden rounded-xl border border-rule bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] transition-[border-color,background-color,transform] duration-500 hover:-translate-y-0.5 hover:border-rule-strong hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)]"
          >
            <Link
              href={`/projects/${p.slug}`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="group grid grid-cols-12 items-start gap-x-4 gap-y-3 px-5 py-5 no-underline transition-opacity duration-500 sm:px-7 sm:py-6"
              style={{ opacity: hover !== null && hover !== i ? 0.55 : 1 }}
            >
              <span className="eyebrow col-span-2 pt-1 sm:col-span-1 sm:pt-1.5" style={{ color: "color-mix(in srgb, var(--accent) 80%, transparent)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="col-span-10 sm:col-span-7">
                <span className="block text-[clamp(1.1rem,1.5vw,1.3rem)] font-medium tracking-[-0.02em] text-ink transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                  {p.title}
                </span>
                <span className="mt-1.5 line-clamp-2 block max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-2">{p.problem}</span>
                <span className="mt-3 block font-mono text-[0.66rem] tracking-wide text-ink-2">{p.stack.join("  ·  ")}</span>
                <span className="mt-5 block aspect-[16/10] overflow-hidden border border-rule lg:hidden">
                  <ProjectVisual project={p} sizes="100vw" />
                </span>
              </span>

              <span className="col-span-12 flex items-start justify-between gap-4 sm:col-span-4 sm:flex-col sm:items-end sm:pt-2">
                <span className="eyebrow sm:text-right">
                  {p.date}
                  <span className="mx-2 opacity-40">/</span>
                  {p.context}
                </span>
                {p.status && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] px-3 py-1 font-mono text-[0.62rem] tracking-[0.2em] text-accent uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
                    {p.status}
                  </span>
                )}
                <span className="hidden h-9 w-9 items-center justify-center rounded-full border border-rule-strong text-ink transition-all duration-500 group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-ground sm:flex">
                  <ArrowUpRight size={14} weight="bold" aria-hidden />
                </span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      {/* the floating cover */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-30 hidden w-[20rem] lg:block"
          style={{ x: sx, y: sy, translateX: "18%", translateY: "-50%" }}
        >
          <AnimatePresence>
            {hover !== null && (
              <motion.div
                key="frame"
                className="relative aspect-[4/3] overflow-hidden border border-rule-strong bg-[var(--surface)] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]"
                initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.85, rotate: 3 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {projects.map((p, i) => (
                  <motion.div
                    key={p.slug}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: hover === i ? 1 : 0, scale: hover === i ? 1 : 1.12 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <ProjectVisual project={p} sizes="368px" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
