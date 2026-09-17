"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/content";
import { Mask } from "./motion-bits";
import { ThemeToggle } from "./theme-toggle";

const EASE = [0.16, 1, 0.3, 1] as const;

const nav = [
  { href: "/tour", label: "Tour" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

/** A floating glass capsule that gathers itself once you scroll; a full-screen menu on phones. */
export function SiteHeader() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // the board on the home page draws its own chrome
  if (pathname === "/") return null;

  const solid = scrolled || open;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
        <div
          className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border pr-2 pl-5 transition-[background-color,border-color,box-shadow] duration-500 ${
            solid
              ? "border-rule bg-[color-mix(in_srgb,var(--ground)_70%,transparent)] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              : "border-transparent"
          }`}
        >
          <Link href="/" className="group flex items-center gap-3 no-underline">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
            </span>
            <span className="text-[0.92rem] font-medium tracking-tight text-ink">Mohamed Rizwan</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-0.5">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative block rounded-full px-4 py-2 text-[0.85rem] no-underline transition-colors duration-300 ${
                        active ? "text-ink" : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]"
                          transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                        />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle className="flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] hover:text-ink" />
            <a
              href={site.resumePdf}
              download
              className="hidden h-10 items-center gap-2 rounded-full bg-ink px-5 text-[0.85rem] font-medium text-ground no-underline transition-shadow duration-500 hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ink)_14%,transparent)] sm:inline-flex"
            >
              <DownloadSimple size={15} weight="bold" aria-hidden /> Resume
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            >
              <span className={`absolute h-px w-4 bg-ink transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
              <span className={`absolute h-px w-4 bg-ink transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-[color-mix(in_srgb,var(--ground)_94%,transparent)] px-6 pt-28 pb-10 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4 }}
          >
            <nav aria-label="Menu">
              <ul className="space-y-1">
                {nav.map((item, i) => (
                  <li key={item.href} className="border-b border-rule">
                    <Link href={item.href} className="flex items-baseline gap-4 py-4 no-underline">
                      <span className="eyebrow w-6">{String(i + 1).padStart(2, "0")}</span>
                      <Mask delay={0.05 + i * 0.06} className="flex-1">
                        <span className="display text-[2.6rem] text-ink">{item.label}</span>
                      </Mask>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <a href={`mailto:${site.email}`} className="text-lg font-light text-ink">
                {site.email}
              </a>
              <a
                href={site.resumePdf}
                download
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-[0.95rem] font-medium text-ground no-underline"
              >
                <DownloadSimple size={16} weight="bold" aria-hidden /> Download resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
