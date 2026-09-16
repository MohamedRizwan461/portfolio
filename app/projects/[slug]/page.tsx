import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion-bits";
import { Branch, Wire, WireSection } from "@/components/wire";
import { VideoFigure } from "@/components/video-figure";
import { Container, Figure, SectionHead, SpecTable } from "@/components/ui";
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
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[0.75rem_1fr] gap-2 text-ink">
          <span aria-hidden className="mt-[0.6rem] h-px w-2 bg-accent" />
          <span className="max-w-[68ch] text-ink-2">{item}</span>
        </li>
      ))}
    </ul>
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

  return (
    <article>
      <Container className="pt-8 sm:pt-12">
        <Link href="/projects" className="ease inline-flex items-center gap-2 text-sm text-ink-2 hover:text-accent">
          <ArrowLeft size={14} weight="bold" aria-hidden /> Projects
        </Link>

        <Reveal className="mt-6">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="num font-mono text-xs text-ink-2">
                {project.date}
                <span className="mx-2">/</span>
                {project.context}
                {project.status && <span className="ml-3 text-accent">{project.status}</span>}
              </p>
              <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-[-0.03em] sm:text-5xl">
                {project.title}
              </h1>
            </div>
            <dl className="grid content-start gap-4 text-sm lg:col-span-4 lg:border-l lg:border-rule lg:pl-8">
              <div>
                <dt className="text-ink-2">Role</dt>
                <dd className="mt-1">{project.role}</dd>
              </div>
              <div>
                <dt className="text-ink-2">Stack</dt>
                <dd className="mt-1 font-mono text-xs leading-5">{project.stack.join(", ")}</dd>
              </div>
              {project.patent && (
                <div>
                  <dt className="text-ink-2">Patent</dt>
                  <dd className="mt-1 font-mono text-xs leading-5">{project.patent}</dd>
                </div>
              )}
            </dl>
          </div>
        </Reveal>
      </Container>

      <Container className="grid gap-12 pt-12 pb-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Wire className="space-y-16">
            <WireSection title="Problem" id="problem">
              <p className="mt-4 max-w-[62ch] text-lg sm:text-xl">{project.problem}</p>
            </WireSection>

            <WireSection title="What I built" id="built">
              <List items={project.built} />
            </WireSection>

            {project.hardware.length > 0 && (
              <WireSection title="Hardware" id="hardware">
                <List items={project.hardware} />
              </WireSection>
            )}

            <WireSection title="Software" id="software">
              <List items={project.software} />
            </WireSection>

            <WireSection title="Validation" id="validation">
              <List items={project.validation} />
            </WireSection>

            <WireSection title="Results" id="results">
              <List items={project.results} />
            </WireSection>
          </Wire>
        </div>

        <aside className="space-y-10 lg:col-span-5">
          <Branch>
            <section aria-labelledby="characteristics">
              <SectionHead id="characteristics">Characteristics</SectionHead>
              <div className="mt-2">
                <SpecTable rows={project.characteristics} caption={`${project.title} characteristics`} />
              </div>
            </section>
          </Branch>

          {project.videos && project.videos.length > 0 && (
            <section aria-labelledby="footage">
              <Branch>
                <SectionHead id="footage">Footage</SectionHead>
              </Branch>
              <div className="mt-4 space-y-8">
                {project.videos.map((v, i) => (
                  <Branch key={v.src} index={i}>
                    <VideoFigure video={v} />
                  </Branch>
                ))}
              </div>
            </section>
          )}

          {figures.length > 0 && (
            <section aria-labelledby="figures">
              <Branch>
                <SectionHead id="figures">Figures</SectionHead>
              </Branch>
              <div className="mt-4 space-y-8">
                {figures.map((f, i) => (
                  <Branch key={f.caption} index={i}>
                    <Figure figure={f} number={i + 1} preload={i === 0} sizes="(min-width: 1024px) 440px, 100vw" />
                  </Branch>
                ))}
              </div>
            </section>
          )}

          {project.links.length > 0 && (
            <Branch>
              <section aria-labelledby="links">
                <SectionHead id="links">Links</SectionHead>
                <ul className="mt-4 space-y-2">
                  {project.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener"
                        className="ease inline-flex items-center gap-1.5 text-accent hover:text-ink"
                      >
                        {l.label} <ArrowUpRight size={14} weight="bold" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </Branch>
          )}
        </aside>
      </Container>

      <Container>
        <Link
          href={`/projects/${next.slug}`}
          className="ease group flex items-center justify-between gap-6 border-t border-b border-rule py-6 no-underline hover:border-accent"
        >
          <span>
            <span className="block text-xs text-ink-2">Next project</span>
            <span className="mt-1 block text-xl font-semibold tracking-tight group-hover:text-accent">
              {next.title}
            </span>
          </span>
          <ArrowRight
            size={20}
            weight="bold"
            aria-hidden
            className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
          />
        </Link>
      </Container>
    </article>
  );
}
