"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** The operator's accent as a real hex colour, for canvases that cannot read CSS variables. */
export function useAccent(fallback = "#3fa9ff") {
  const [accent, setAccent] = useState(fallback);
  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (v.startsWith("#")) setAccent(v);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
    return () => mo.disconnect();
  }, []);
  return accent;
}

const styles = [
  { href: "/story/film", key: "A", label: "Scroll film" },
  { href: "/story/drive", key: "B", label: "Drive game" },
  { href: "/story/chat", key: "C", label: "Chat" },
  { href: "/story/watch", key: "D", label: "Animated film" },
];

/** A small switcher so the story prototypes can be compared side by side. Temporary. */
export function LabSwitcher() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Story prototypes"
      className="glass fixed top-[5.25rem] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full p-1 text-[0.72rem] sm:top-[5.75rem]"
    >
      <span className="eyebrow hidden px-3 !text-[0.58rem] sm:inline">About prototypes</span>
      {styles.map((s) => {
        const on = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={on ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 no-underline transition-colors duration-300 ${on ? "bg-ink text-ground" : "text-ink-2 hover:text-ink"}`}
          >
            <span className="font-mono">{s.key}</span>
            <span className="hidden md:inline">{s.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
