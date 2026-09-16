"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/content";

const nav = [
  { href: "/tour", label: "Tour" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  // the board on the home page draws its own chrome
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-ground/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-0">
        <Link href="/" className="ease flex items-baseline gap-3 no-underline hover:text-accent">
          <span className="font-mono text-sm font-semibold tracking-tight">{site.designation}</span>
          <span className="text-sm text-ink-2">{site.short}</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="grid grid-cols-5 border-t border-rule sm:flex sm:gap-1 sm:border-0">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`ease block px-2 pt-2.5 pb-1 text-center text-sm no-underline sm:px-3 sm:py-2 ${
                      active ? "text-accent font-medium" : "text-ink hover:text-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
