import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { canFrameBytes, site, type Figure as FigureData } from "@/lib/content";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-8 ${className}`}>{children}</div>;
}

const buttonLook = {
  primary: "bg-accent text-accent-ink border-accent hover:bg-ink hover:border-ink hover:text-ground",
  secondary: "bg-transparent text-ink border-rule-strong hover:border-accent hover:text-accent",
};
const buttonBase =
  "ease inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap border px-5 text-sm font-medium no-underline active:translate-y-px";

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
      <thead>
        <tr className="border-b border-rule-strong text-left">
          <th scope="col" className="py-2 pr-4 text-left font-medium">
            Parameter
          </th>
          <th scope="col" className="py-2 text-left font-medium">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.parameter} className="ease border-b border-rule align-top hover:bg-accent-soft">
            <th scope="row" className="py-2 pr-4 text-left font-normal text-ink-2">
              {row.parameter}
            </th>
            <td className="num py-2 font-mono text-[0.8125rem]">{row.value}</td>
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
      <div className="border border-rule">
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
      <figcaption className="mt-2 text-xs text-ink-2">
        {number !== undefined && <span className="num mr-2 font-mono text-ink">Fig. {number}</span>}
        {figure.caption}
      </figcaption>
    </figure>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-rule-strong">
      <Container className="grid gap-6 py-8 text-sm sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="font-medium">{site.name}</p>
          <p className="text-ink-2">{site.role}. {site.location}</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <a className="ease hover:text-accent" href={`mailto:${site.email}`}>
              Email
            </a>
          </li>
          <li>
            <a className="ease hover:text-accent" href={site.linkedin} rel="noopener" target="_blank">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="ease hover:text-accent" href={site.github} rel="noopener" target="_blank">
              GitHub
            </a>
          </li>
          <li>
            <a className="ease hover:text-accent" href={site.resumePdf} download>
              Download resume
            </a>
          </li>
        </ul>
      </Container>
    </footer>
  );
}

