"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** A sticky table of contents that follows the section you are reading. */
export function SectionIndex({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => Boolean(e));
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page">
      <p className="eyebrow">On this page</p>
      <ol className="mt-5 space-y-1 border-l border-rule">
        {sections.map((s, i) => {
          const on = s.id === active;
          return (
            <li key={s.id} className="relative">
              {on && <motion.span layoutId="section-active" className="absolute top-0 -left-px h-full w-px bg-ink" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />}
              <a
                href={`#${s.id}`}
                className={`flex gap-3 py-1.5 pl-4 text-sm no-underline transition-colors duration-300 ${on ? "text-ink" : "text-ink-2 hover:text-ink"}`}
              >
                <span className="font-mono text-[0.68rem] leading-5 opacity-60">{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
