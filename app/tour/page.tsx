import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CarProfile, ChartBar, EnvelopeSimple, GameController, Textbox } from "@phosphor-icons/react/dist/ssr";
import { HudPortrait } from "@/components/hud-portrait";
import { CountUp, Mask, Reveal } from "@/components/motion-bits";
import { Container } from "@/components/ui";
import { projects, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Start here",
  description: "Every way into Riz's work in one place: the drive through his story, the gear controller simulator, the case studies and the board.",
  alternates: { canonical: "/tour" },
};

const ways = [
  {
    href: "/about",
    Icon: CarProfile,
    title: "Take the drive",
    line: "Seven stops, biology in Chennai to autonomous vehicles in Chicago. He pulls over and tells you each one.",
    meta: "3 minutes",
  },
  {
    href: "/projects/can-gear-controller#try-it",
    Icon: GameController,
    title: "Try the gear controller",
    line: "Shift into reverse at 40 km/h and watch the firmware refuse. Then cut the CAN wire and see what happens without it.",
    meta: "Interactive",
  },
  {
    href: "/projects",
    Icon: Textbox,
    title: "Read the case studies",
    line: `${projects.length} systems, each one problem, build, stack, validation and results. Firmware, mechanisms and vision.`,
    meta: "Deep",
  },
  {
    href: "/",
    Icon: ChartBar,
    title: "Explore the board",
    line: "The 3D circuit board on the home page: every chip is a project, and a robot drives to the one you pick.",
    meta: "Playful",
  },
  {
    href: "/contact",
    Icon: EnvelopeSimple,
    title: "Get in touch",
    line: "Email, LinkedIn or GitHub, and a short message form that opens your own mail app.",
    meta: "Direct",
  },
];

const facts = [
  { k: "Patents filed", v: <CountUp key="p" to={3} /> },
  { k: "MS Computer Science", v: "2026" },
  { k: "Based in", v: "Chicago, IL" },
];

export default function StartHere() {
  return (
    <Container className="pt-24 pb-16 sm:pt-28">
      <Mask>
        <p className="eyebrow">Start here</p>
      </Mask>
      <h1 className="display mt-3 text-[clamp(1.75rem,2.6vw,2.4rem)] !tracking-[-0.035em]">
        <Mask delay={0.08}>Five ways in.</Mask>
      </h1>
      <Reveal delay={0.2}>
        <p className="mt-3 max-w-[54ch] text-[0.98rem] leading-relaxed font-light text-ink-2">
          {site.role}. {site.ask}. Pick whichever suits the time you have.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-10 border-t border-rule pt-8 lg:grid-cols-12 lg:gap-14">
        <ul className="flex flex-col gap-2.5 lg:col-span-7">
          {ways.map(({ href, Icon, title, line, meta }, i) => (
            <li key={href}>
              <Reveal delay={0.05 * i}>
                <Link
                  href={href}
                  className="group flex items-start gap-4 rounded-xl border border-rule bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] px-5 py-4 no-underline transition-[border-color,background-color,transform] duration-500 hover:-translate-y-0.5 hover:border-rule-strong hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)]"
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rule-strong text-ink transition-colors duration-500 group-hover:border-accent group-hover:text-accent">
                    <Icon size={17} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-[1.05rem] font-medium tracking-tight text-ink">{title}</span>
                      <span className="eyebrow !text-[0.58rem]">{meta}</span>
                    </span>
                    <span className="mt-1.5 block max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-2">{line}</span>
                  </span>
                  <ArrowRight
                    size={15}
                    weight="bold"
                    aria-hidden
                    className="mt-3 shrink-0 text-ink-2 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-ink"
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.2} className="lg:col-span-5">
          <HudPortrait />
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-rule pt-5">
            {facts.map((f) => (
              <div key={f.k}>
                <dt className="eyebrow !text-[0.58rem]">{f.k}</dt>
                <dd className="num mt-1.5 font-mono text-[0.95rem] text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Container>
  );
}
