import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Mask, Reveal } from "@/components/motion-bits";
import { VideoFigure } from "@/components/video-figure";
import { GearSim } from "@/components/gear-sim";
import { ProjectVisual } from "@/components/project-visual";
import { ReadProgress } from "@/components/read-progress";
import { SectionIndex } from "@/components/section-index";
import { Container, Figure, SpecTable } from "@/components/ui";
import { projects } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.problem,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { url: `/projects/${slug}`, title: project.title, description: project.problem },
  };
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {items.map((item, i) => (
        <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 py-2.5">
          <span className="pt-1 font-mono text-[0.68rem] text-ink-2">{String(i + 1).padStart(2, "0")}</span>
          <span className="max-w-[74ch] text-[0.92rem] leading-[1.6] text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-32">
      <Reveal>
        <div className="flex items-baseline gap-4">
          <span className="eyebrow">{String(n).padStart(2, "0")}</span>
          <h2 id={`${id}-h`} className="display text-[clamp(1.15rem,1.5vw,1.35rem)] !tracking-[-0.025em]">
            {title}
          </h2>
        </div>
        <div className="mt-4">{children}</div>
      </Reveal>
    </section>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  const figures =
    project.cover.src || project.cover.kind
      ? [project.cover, ...project.figures.filter((f) => f !== project.cover)]
      : project.figures;
  const hasVideo = Boolean(project.videos?.length);
  const portrait = hasVideo && Boolean(project.videos![0].portrait);
  const heroFigure = !hasVideo ? figures[0] : undefined;
  // portrait footage sits beside a figure so the frame is never half empty
  const sideFigure = portrait ? figures.find((f) => f.src) : undefined;
  const galleryFigures = (hasVideo ? figures : figures.slice(1)).filter((f) => f !== sideFigure);
  const extraVideos = project.videos?.slice(1) ?? [];

  const sections = [
    { id: "built", label: "What I built", items: project.built },
    { id: "hardware", label: "Hardware", items: project.hardware },
    { id: "software", label: "Software", items: project.software },
    { id: "validation", label: "Validation", items: project.validation },
    { id: "results", label: "Results", items: project.results },
  ].filter((s) => s.items.length > 0);
  const toc = [
    ...sections.map(({ id, label }) => ({ id, label })),
    ...(project.code?.length ? [{ id: "code", label: "The code" }] : []),
    { id: "characteristics", label: "Characteristics" },
    ...(galleryFigures.length || extraVideos.length ? [{ id: "gallery", label: "Gallery" }] : []),
  ];

  const meta = [
    { k: "Role", v: project.role },
    { k: "Stack", v: project.stack.join(", "), mono: true },
    project.patent ? { k: "Patent", v: project.patent, mono: true } : { k: "Context", v: project.context },
  ];

  return (
    <article>
      <ReadProgress />
      {/* hero */}
      <Container className="pt-24 sm:pt-28">
        <Link href="/projects" className="eyebrow group inline-flex items-center gap-2 no-underline hover:text-ink">
          <ArrowLeft size={12} weight="bold" aria-hidden className="transition-transform duration-500 group-hover:-translate-x-1" />
          <span className="link-u">All projects</span>
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Mask>
            <p className="eyebrow">
              {String(index + 1).padStart(2, "0")} <span className="mx-2 opacity-40">/</span> {project.date}
              <span className="mx-2 opacity-40">/</span> {project.context}
            </p>
          </Mask>
          {project.status && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] px-3 py-1 font-mono text-[0.62rem] tracking-[0.2em] text-accent uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
              {project.status}
            </span>
          )}
        </div>

        <h1 className="display mt-3 max-w-[26ch] text-[clamp(1.75rem,2.6vw,2.4rem)] leading-[1.08] !tracking-[-0.035em]">
          <Mask delay={0.06}>{project.title}</Mask>
        </h1>

        <Reveal delay={0.25}>
          <p className="mt-4 max-w-[62ch] text-[0.98rem] leading-relaxed font-light text-ink-2 sm:text-[1.05rem]">{project.problem}</p>
        </Reveal>

        {project.links.length > 0 && (
          <Reveal delay={0.3}>
            <ul className="mt-7 flex flex-wrap gap-2">
              {project.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener"
                    className="group inline-flex h-9 items-center gap-2 rounded-full border border-rule-strong px-4 text-[0.82rem] text-ink no-underline transition-colors duration-300 hover:border-ink"
                  >
                    {l.label}
                    <ArrowUpRight size={12} weight="bold" aria-hidden className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal delay={0.35}>
          <dl className="mt-8 grid gap-px overflow-hidden border border-rule bg-[var(--rule)] sm:grid-cols-3">
            {meta.map((m) => (
              <div key={m.k} className="bg-ground p-4 sm:p-5">
                <dt className="eyebrow">{m.k}</dt>
                <dd className={`mt-2 leading-relaxed text-ink ${m.mono ? "font-mono text-[0.74rem]" : "text-[0.9rem]"}`}>{m.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>

      {/* the evidence, big */}
      <Container className="pt-10 sm:pt-12">
        <Reveal>
          {portrait ? (
            <div className="grid items-end gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <VideoFigure video={project.videos![0]} />
              </div>
              {sideFigure && (
                <div className="lg:col-span-7">
                  <Figure figure={sideFigure} number={2} sizes="(min-width: 1024px) 640px, 100vw" />
                </div>
              )}
            </div>
          ) : hasVideo ? (
            <VideoFigure video={project.videos![0]} />
          ) : heroFigure?.src ? (
            <div className="mx-auto max-w-4xl">
              <Figure figure={heroFigure} number={1} preload sizes="(min-width: 1024px) 896px, 100vw" />
            </div>
          ) : heroFigure?.kind === "canFrame" ? (
            <div className="grid gap-px overflow-hidden border border-rule bg-[var(--rule)] lg:grid-cols-2">
              <div className="aspect-[16/10] bg-ground">
                <ProjectVisual project={project} sizes="560px" />
              </div>
              <div className="bg-ground">
                <Figure figure={heroFigure} number={1} />
              </div>
            </div>
          ) : (
            <div className="aspect-[21/9] overflow-hidden border border-rule">
              <ProjectVisual project={project} sizes="100vw" />
            </div>
          )}
        </Reveal>
      </Container>

      {project.slug === "can-gear-controller" && (
        <Container className="pt-14">
          <section aria-labelledby="try-it" className="border border-rule bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-5 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-accent">Interactive</p>
                <h2 id="try-it" className="display mt-2 text-[clamp(1.3rem,1.8vw,1.6rem)]">
                  Drive it yourself
                </h2>
              </div>
              <p className="max-w-[40ch] text-ink-2">No engineering background needed. Try to shift into reverse at speed.</p>
            </div>
            <div className="mt-8" data-lenis-prevent>
              <GearSim />
            </div>
          </section>
        </Container>
      )}

      {/* the case study */}
      <Container className="grid gap-10 pt-14 sm:pt-16 lg:grid-cols-12 lg:gap-10">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-32">
            <SectionIndex sections={toc} />
          </div>
        </aside>

        <div className="space-y-10 lg:col-span-9">
          {sections.map((s, i) => (
            <Section key={s.id} id={s.id} n={i + 1} title={s.label}>
              <List items={s.items} />
            </Section>
          ))}

          {project.code?.length ? (
            <Section id="code" n={sections.length + 1} title="The code">
              <div className="space-y-5">
                {project.code.map((c) => (
                  <figure key={c.file} className="m-0 overflow-hidden border border-rule bg-[color-mix(in_srgb,var(--surface)_70%,transparent)]">
                    <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule px-4 py-2.5">
                      <span className="font-mono text-[0.72rem] text-ink">{c.file}</span>
                      <span className="max-w-[62ch] text-[0.78rem] leading-relaxed text-ink-2">{c.note}</span>
                    </figcaption>
                    <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.72rem] leading-[1.7] text-ink-2 sm:text-[0.78rem]">
                      <code>{c.body}</code>
                    </pre>
                  </figure>
                ))}
              </div>
            </Section>
          ) : null}

          <Section id="characteristics" n={sections.length + (project.code?.length ? 2 : 1)} title="Characteristics">
            <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
              <SpecTable rows={project.characteristics} caption={`${project.title} characteristics`} />
              {project.links.length > 0 && (
                <div>
                  <p className="eyebrow">Links</p>
                  <ul className="mt-4 space-y-3">
                    {project.links.map((l) => (
                      <li key={l.href}>
                        <a href={l.href} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 text-ink no-underline">
                          <span className="link-u">{l.label}</span>
                          <ArrowUpRight size={14} weight="bold" aria-hidden className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>

          {(galleryFigures.length > 0 || extraVideos.length > 0) && (
            <Section id="gallery" n={sections.length + (project.code?.length ? 3 : 2)} title="Gallery">
              <div className="columns-1 gap-5 sm:columns-2 [&>*]:mb-5 [&>*]:break-inside-avoid">
                {extraVideos.map((v) => (
                  <VideoFigure key={v.src} video={v} />
                ))}
                {galleryFigures.map((f, i) => (
                  <Figure key={f.caption} figure={f} number={i + (sideFigure ? 3 : hasVideo ? 1 : 2)} sizes="(min-width: 640px) 420px, 100vw" />
                ))}
              </div>
            </Section>
          )}
        </div>
      </Container>

      {/* next */}
      <Container className="pt-20">
        <Link href={`/projects/${next.slug}`} className="group block border-t border-rule pt-10 no-underline">
          <p className="eyebrow">Next project</p>
          <div className="mt-6 flex items-end justify-between gap-6">
            <span className="display block max-w-[26ch] text-[clamp(1.4rem,2.2vw,1.9rem)] text-ink transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-4">
              {next.title}
            </span>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-rule-strong text-ink transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-ground">
              <ArrowRight size={18} weight="light" aria-hidden />
            </span>
          </div>
        </Link>
      </Container>
    </article>
  );
}
