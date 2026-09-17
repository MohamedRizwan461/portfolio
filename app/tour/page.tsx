import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, DownloadSimple, EnvelopeSimple, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { Deck, type Slide } from "@/components/deck";
import { JourneyStrip } from "@/components/journey-strip";
import { HudPortrait } from "@/components/hud-portrait";
import { CountUp, Typewriter } from "@/components/motion-bits";
import { VideoFigure } from "@/components/video-figure";
import { CanBusScene, CarScene, ProtoScene, VisionScene } from "@/components/illustrations";
import { Button, ButtonAnchor } from "@/components/ui";
import { featured, projects, proof, site, strengths } from "@/lib/content";

const knee = projects.find((p) => p.slug === "smart-knee-actuator")!;

const slides: Slide[] = [
  {
    id: "hello",
    label: "Hello",
    content: (
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="order-2 lg:order-1 lg:col-span-7">
          <p className="num font-mono text-xs text-accent-2">
            <Typewriter text="> boot riz ... sensors ok, actuators ok, coffee ok" />
          </p>
          <h1 className="mt-4 text-[clamp(2.1rem,7vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
            Mohamed Rizwan
            <span className="block text-ink-2">Ameer John</span>
          </h1>
          <p className="mt-4 max-w-[38ch] text-lg leading-snug text-ink sm:mt-6 sm:text-2xl">
            Robotics and embedded systems engineer. I build firmware, robots and vision systems that run on real
            hardware.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/projects">
              View projects <ArrowRight size={16} weight="bold" aria-hidden />
            </Button>
            <ButtonAnchor href={site.resumePdf} download variant="secondary">
              Download resume <DownloadSimple size={16} weight="bold" aria-hidden />
            </ButtonAnchor>
          </div>
          <dl className="mt-8 hidden flex-wrap gap-x-10 gap-y-4 text-sm sm:flex">
            {[
              ["Patents filed", <CountUp key="p" to={3} />],
              ["MS Computer Science", "2026"],
              ["Focus", "Robotics, embedded, AV"],
            ].map(([k, v]) => (
              <div key={String(k)}>
                <dt className="text-xs text-ink-2">{k}</dt>
                <dd className="num mt-1 font-mono">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5">
          <HudPortrait />
        </div>
      </div>
    ),
  },
  {
    id: "path",
    label: "The path",
    content: (
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em]">
          Biology first. Then the machines.
        </h2>
        <p className="mt-4 max-w-[58ch] text-ink-2">
          Biology came first, engineering second, and the two have been the same subject ever since: machines that move
          for people who cannot.
        </p>
        <JourneyStrip />
      </div>
    ),
  },
  {
    id: "running",
    label: "It runs",
    content: (
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em]">
            No renders were harmed.
            <span className="block text-accent-2">It actually moves.</span>
          </h2>
          <p className="mt-4 max-w-[46ch] text-ink-2">
            A pneumatic knee exoskeleton that reads gait phase on an RP2040 and fires the cylinder when the knee needs
            it. Bench footage, not a simulation.
          </p>
          <dl className="mt-8 grid max-w-md grid-cols-2 gap-3 text-sm">
            {[
              ["Classifier", "TinyML, on-device"],
              ["Actuation", "5/2 DCV, 10 bar"],
              ["FEA load case", "500 N"],
              ["Patent", "202341027059"],
            ].map(([k, v]) => (
              <div key={k} className="panel p-3">
                <dt className="text-xs text-ink-2">{k}</dt>
                <dd className="num mt-1 font-mono text-[0.8125rem]">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8">
            <Link
              href="/projects/smart-knee-actuator"
              className="ease group inline-flex items-center gap-2 font-medium text-accent hover:text-ink"
            >
              Read the case study
              <ArrowRight
                size={16}
                weight="bold"
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </p>
        </div>
        <div className="lg:col-span-7">
          {/* portrait footage: never taller than the window */}
          <div className="mx-auto w-full max-w-[calc((100dvh-15rem)*0.75)]">
            <VideoFigure video={knee.videos![0]} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "work",
    label: "Work",
    content: (
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em]">
            Selected work
          </h2>
          <Link
            href="/projects"
            className="ease group inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-ink"
          >
            All {projects.length} projects
            <ArrowRight
              size={14}
              weight="bold"
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/projects/${p.slug}`}
                className="panel group ease flex h-full flex-col overflow-hidden no-underline hover:border-accent"
              >
                <span className="hidden aspect-[16/10] overflow-hidden bg-black/40 sm:block">
                  {p.cover.src ? (
                    <Image
                      src={p.cover.src}
                      width={p.cover.width}
                      height={p.cover.height}
                      alt={p.cover.alt}
                      sizes="(min-width: 768px) 360px, 100vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    />
                  ) : (
                    <CanBusScene className="h-full w-full" />
                  )}
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="num font-mono text-xs text-ink-2">
                    {p.date}
                    {p.status && <span className="ml-2 text-accent-2">{p.status}</span>}
                  </span>
                  <span className="mt-2 block text-lg font-semibold tracking-tight group-hover:text-accent">
                    {p.title}
                  </span>
                  <span className="mt-2 line-clamp-3 block text-sm text-ink-2">{p.problem}</span>
                  <span className="mt-auto pt-4 font-mono text-[0.7rem] text-ink-2">{p.stack.join(" · ")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "proof",
    label: "Proof",
    content: (
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em]">
            Three filed patents, on record
          </h2>
          <p className="mt-4 max-w-[46ch] text-ink-2">
            Two in assistive robotics, one in wireless sensor networks, filed with the Indian Patent Office. Current
            status: awaiting examination, because patent offices run at a much lower sample rate than firmware.
          </p>
          <dl className="mt-8 divide-y divide-rule border-y border-rule">
            {proof.map((item) => (
              <div key={item.value} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <dt className="text-sm text-ink-2">{item.detail}</dt>
                <dd className="num font-mono text-sm text-accent">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-6">
          <figure className="m-0">
            <div className="panel overflow-hidden">
              <Image
                src="/images/patents/knee-record.png"
                width={840}
                height={420}
                alt="Indian Patent Office record for application 202341027059, Smart Knee Actuator"
                sizes="(min-width: 1024px) 520px, 100vw"
                className="h-auto w-full bg-white object-contain"
              />
            </div>
            <figcaption className="mt-2 text-xs text-ink-2">
              Indian Patent Office record, application 202341027059, filed 12 April 2023.
            </figcaption>
          </figure>
        </div>
      </div>
    ),
  },
  {
    id: "skills",
    label: "What I do",
    content: (
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em]">What I do</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {strengths.map((s) => (
            <li key={s.title} className="panel overflow-hidden">
              <div className="aspect-[2/1] border-b border-rule">
                {s.title.startsWith("Embedded") ? (
                  <CarScene className="h-full w-full" />
                ) : s.title.startsWith("Computer") ? (
                  <VisionScene className="h-full w-full" />
                ) : (
                  <ProtoScene className="h-full w-full" />
                )}
              </div>
              <div className="p-5">
              <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-sm text-ink-2">{s.body}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {s.tools.map((t) => (
                  <li key={t} className="border border-rule px-2 py-0.5 font-mono text-[0.7rem] text-ink-2">
                    {t}
                  </li>
                ))}
              </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "contact",
    label: "Contact",
    content: (
      <div className="mx-auto w-full max-w-4xl text-center">
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] leading-tight font-semibold tracking-[-0.03em]">
          Ping me. I respond faster
          <span className="block text-accent">than a bus timeout.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[52ch] text-lg text-ink-2">
          Robotics, embedded or autonomous vehicles. Somewhere I can be useful from the first week and learn from
          engineers further along than me.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonAnchor href={`mailto:${site.email}`}>
            <EnvelopeSimple size={18} aria-hidden /> Email me
          </ButtonAnchor>
          <ButtonAnchor href={site.linkedin} target="_blank" rel="noopener" variant="secondary">
            <LinkedinLogo size={18} aria-hidden /> LinkedIn
          </ButtonAnchor>
          <ButtonAnchor href={site.github} target="_blank" rel="noopener" variant="secondary">
            GitHub <ArrowUpRight size={16} weight="bold" aria-hidden />
          </ButtonAnchor>
        </div>
        <p className="num mt-10 font-mono text-sm text-ink-2">{site.email}</p>
      </div>
    ),
  },
];

export const metadata = {
  title: "Guided tour",
  description: "A seven-screen guided tour of Riz's work: the path, the hardware, the patents.",
  alternates: { canonical: "/tour" },
};

export default function Tour() {
  return <Deck slides={slides} />;
}
