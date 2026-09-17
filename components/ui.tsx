import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { canFrameBytes, site, type Figure as FigureData } from "@/lib/content";
import { ChicagoClock } from "./chicago-clock";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-8 ${className}`}>{children}</div>;
}

/* Buttons are full pills; surfaces stay sharp. */
const buttonLook = {
  primary:
    "bg-ink text-ground border-ink hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--ink)_12%,transparent),0_18px_50px_-18px_var(--accent)]",
  secondary:
    "bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] text-ink border-rule-strong backdrop-blur hover:border-[color-mix(in_srgb,var(--ink)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]",
};
const buttonBase =
  "group/btn inline-flex h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-full border px-6 text-[0.9rem] font-medium no-underline transition-[box-shadow,background-color,border-color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] [&_svg]:transition-transform [&_svg]:duration-500 hover:[&_svg]:translate-x-0.5";

type ButtonProps = ComponentProps<typeof Link> & { variant?: keyof typeof buttonLook };

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <Link {...props} className={`${buttonBase} ${buttonLook[variant]} ${className}`} />;
}

/** For files and external URLs, where client-side routing does not apply. */
export function ButtonAnchor({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"a"> & { variant?: keyof typeof buttonLook }) {
  return <a {...props} className={`${buttonBase} ${buttonLook[variant]} ${className}`} />;
}

export function SectionHead({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="ds-head">
      {children}
    </h2>
  );
}

export function SpecTable({
  rows,
  caption,
}: {
  rows: { parameter: string; value: string }[];
  caption?: string;
}) {
  return (
    <table className="w-full border-collapse text-sm">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead className="sr-only">
        <tr>
          <th scope="col">Parameter</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.parameter} className="border-b border-rule align-top transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--ink)_3%,transparent)]">
            <th scope="row" className="w-[42%] py-3.5 pr-4 text-left font-normal text-ink-2">
              {row.parameter}
            </th>
            <td className="num py-3.5 text-right font-mono text-[0.8125rem] text-ink">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CanFrame() {
  return (
    <div className="h-full bg-panel p-4 sm:p-5">
      <p className="mb-3 font-mono text-xs text-ink-2">
        ID <span className="text-ink">0x18F00500</span> &nbsp;DLC <span className="text-ink">8</span>
      </p>
      <ol className="grid grid-cols-8 border-l border-t border-rule-strong">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
          <li
            key={b}
            className={`num flex h-12 items-center justify-center border-r border-b border-rule-strong font-mono text-sm ${
              b === 6 || b === 7 ? "bg-accent text-accent-ink" : ""
            }`}
          >
            {b}
          </li>
        ))}
      </ol>
      <dl className="mt-4 grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-1.5 text-xs">
        {canFrameBytes.map((r) => (
          <div key={r.byte} className="contents">
            <dt className="num font-mono text-ink-2">B{r.byte}</dt>
            <dd>
              <span className="font-medium">{r.signal}</span> <span className="text-ink-2">{r.note}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Figure({
  figure,
  number,
  preload,
  sizes = "(min-width: 1024px) 480px, 100vw",
  compact,
}: {
  figure: FigureData;
  number?: number;
  preload?: boolean;
  sizes?: string;
  compact?: boolean;
}) {
  return (
    <figure className="m-0">
      <div className="overflow-hidden border border-rule">
        {figure.kind === "canFrame" ? (
          <CanFrame />
        ) : figure.src ? (
          <div className="flex items-center justify-center bg-white">
            <Image
              src={figure.src}
              width={figure.width}
              height={figure.height}
              alt={figure.alt}
              sizes={sizes}
              preload={preload}
              className={`h-auto w-full object-contain ${compact ? "max-h-56" : ""}`}
            />
          </div>
        ) : null}
      </div>
      <figcaption className="mt-3 flex gap-3 text-xs leading-relaxed text-ink-2">
        {number !== undefined && <span className="eyebrow shrink-0 !text-[0.62rem] text-ink">Fig. {String(number).padStart(2, "0")}</span>}
        {figure.caption}
      </figcaption>
    </figure>
  );
}

const footerNav = [
  { href: "/tour", label: "Guided tour" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-32 border-t border-rule">
      <Container className="pt-20 pb-10 sm:pt-28">
        <p className="eyebrow">What next</p>
        <h2 className="display mt-5 max-w-[14ch] text-[clamp(2.75rem,8vw,6.5rem)]">Let&apos;s build something that moves.</h2>
        <a
          href={`mailto:${site.email}`}
          className="link-u mt-10 inline-block text-[clamp(1.15rem,2.6vw,2rem)] font-light tracking-tight text-ink"
        >
          {site.email}
        </a>

        <div className="mt-20 grid gap-10 border-t border-rule pt-10 sm:grid-cols-3">
          <div>
            <p className="eyebrow">Navigate</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-u text-ink-2 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Connect</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a className="link-u text-ink-2 hover:text-ink" href={site.linkedin} rel="noopener" target="_blank">
                  LinkedIn
                </a>
              </li>
              <li>
                <a className="link-u text-ink-2 hover:text-ink" href={site.github} rel="noopener" target="_blank">
                  GitHub
                </a>
              </li>
              <li>
                <a className="link-u text-ink-2 hover:text-ink" href={site.resumePdf} download>
                  Download resume
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Based in</p>
            <p className="mt-4 text-sm text-ink">Chicago, IL</p>
            <p className="mt-1 font-mono text-sm text-ink-2">
              <ChicagoClock /> <span className="text-[0.7rem] tracking-widest">CT</span>
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
          <p className="eyebrow">{site.name}</p>
          <a href="#main" className="eyebrow link-u hover:text-ink">
            Back to top
          </a>
        </div>
      </Container>
    </footer>
  );
}
