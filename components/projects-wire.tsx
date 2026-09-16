"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Wire, WireNode } from "./wire";
import type { Project } from "@/lib/content";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ProjectsWire({ projects }: { projects: Project[] }) {
  return (
    <Wire className="space-y-14 sm:space-y-16">
      {projects.map((project, i) => (
        <ProjectRow key={project.slug} project={project} index={i} />
      ))}
    </Wire>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <article ref={ref} className="relative">
      <WireNode active={inView} />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Link
          href={`/projects/${project.slug}`}
          className="group grid gap-5 border-t-2 border-rule-strong pt-4 no-underline transition-colors duration-300 hover:border-accent lg:grid-cols-12 lg:gap-8"
        >
          <div className="lg:col-span-7">
            <p className="num flex flex-wrap items-baseline gap-x-3 font-mono text-xs text-ink-2">
              <span>{project.date}</span>
              <span>{project.context}</span>
              {project.status && <span className="text-accent">{project.status}</span>}
            </p>
            <h2 className="mt-2 text-2xl leading-tight font-semibold tracking-[-0.02em] transition-colors duration-300 group-hover:text-accent sm:text-3xl">
              {project.title}
            </h2>
            <p className="mt-3 max-w-[62ch] text-ink-2">{project.problem}</p>
            {project.patent && <p className="mt-3 font-mono text-xs">{project.patent}</p>}
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.stack.map((t) => (
                <li key={t} className="border border-rule px-2 py-0.5 font-mono text-xs text-ink-2">
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-center gap-2 text-sm font-medium text-accent">
              Read case study
              <ArrowRight
                size={14}
                weight="bold"
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </p>
          </div>

          <div className="lg:col-span-5">
            {project.cover.src ? (
              <div className="aspect-[16/10] overflow-hidden border border-rule bg-white">
                <Image
                  src={project.cover.src}
                  width={project.cover.width}
                  height={project.cover.height}
                  alt={project.cover.alt}
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
                />
              </div>
            ) : (
              <dl className="border-t border-rule text-sm">
                {project.characteristics.slice(0, 4).map((c) => (
                  <div key={c.parameter} className="grid grid-cols-2 gap-4 border-b border-rule py-2">
                    <dt className="text-ink-2">{c.parameter}</dt>
                    <dd className="num font-mono text-[0.8125rem]">{c.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Link>
      </motion.div>
    </article>
  );
}
