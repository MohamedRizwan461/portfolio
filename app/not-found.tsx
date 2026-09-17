import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Mask, Reveal } from "@/components/motion-bits";
import { Container } from "@/components/ui";

export const metadata = { title: "Page not found", robots: { index: false } };

const links = [
  { href: "/", label: "The board" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <Container className="flex min-h-[100dvh] flex-col justify-center pt-24 pb-16">
      <Mask>
        <p className="eyebrow">Error 404 · no signal</p>
      </Mask>
      <h1 className="display mt-3 text-[clamp(1.75rem,2.6vw,2.4rem)] !tracking-[-0.035em]">
        <Mask delay={0.08}>This page went off the bus.</Mask>
      </h1>
      <Reveal delay={0.2}>
        <p className="mt-3 max-w-[46ch] text-[0.98rem] leading-relaxed font-light text-ink-2">
          The address did not resolve to anything. Every other node is still up.
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        <ul className="mt-10 max-w-md border-t border-rule">
          {links.map((l, i) => (
            <li key={l.href} className="border-b border-rule">
              <Link href={l.href} className="group flex items-center justify-between gap-4 py-4 no-underline">
                <span className="flex items-baseline gap-4">
                  <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[1.05rem] font-light text-ink transition-transform duration-500 group-hover:translate-x-1.5">{l.label}</span>
                </span>
                <ArrowRight size={15} weight="bold" aria-hidden className="text-ink-2 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-ink" />
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </Container>
  );
}
