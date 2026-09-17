import { projects, site } from "@/lib/content";

export type CardThumb =
  | { kind: "image"; src: string; fit?: "cover" | "contain" }
  | { kind: "video"; src: string; poster: string; zoom?: number }
  | { kind: "webp"; src: string }
  | { kind: "canframe" }
  | { kind: "volt" }
  | { kind: "github" }
  | { kind: "contact" };

export type Card = {
  id: string;
  title: string;
  meta: string;
  badges: string[];
  thumb: CardThumb;
  blurb: string;
  episodes?: { title: string; text: string }[];
  cta: { label: string; href: string; download?: boolean; external?: boolean };
  /** chip on the board this card belongs to; seeing it counts as watching */
  station?: string;
  /** "chapters" shows how much of the About story has been read */
  progress?: "chapters";
};

function projectCard(
  id: string,
  slug: string,
  thumb: CardThumb,
  extra: Partial<Pick<Card, "badges" | "title">> = {},
): Card {
  const p = projects.find((x) => x.slug === slug)!;
  return {
    id,
    title: extra.title ?? p.title,
    meta: `${p.date} · ${p.context}`,
    badges: extra.badges ?? [...(p.patent ? ["Patented"] : []), ...(p.status ? [p.status] : [])],
    thumb,
    blurb: p.problem,
    episodes: [
      { title: "What I built", text: p.built.join(" ") },
      { title: "How it was validated", text: p.validation.join(" ") },
      { title: "Results", text: p.results.join(" ") },
    ],
    cta: { label: "Open full case study", href: `/projects/${slug}` },
    station: slug,
  };
}

export const cards: Record<string, Card> = {
  resume: {
    id: "resume",
    title: "Resume",
    meta: "2 pages · PDF",
    badges: ["Recruiter pick"],
    thumb: { kind: "image", src: "/resume/page-1.png", fit: "cover" },
    blurb: "Embedded software engineer: bare-metal C/C++ on ARM Cortex-M, FreeRTOS, CAN, MIL/SIL/HIL validation, three filed patents.",
    cta: { label: "Download resume", href: site.resumePdf, download: true },
  },
  patents: {
    id: "patents",
    title: "Three filed patents",
    meta: "Indian Patent Office · 2023",
    badges: ["On record"],
    thumb: { kind: "image", src: "/images/patents/knee-record.png", fit: "cover" },
    blurb:
      "Smart Knee Actuator (202341027059, published Oct 2024), Sign Language Interpreting Eyewear (filed Feb 2023) and a Wireless Sensor Network Management Web Platform (202341008938).",
    episodes: [
      { title: "Smart Knee Actuator", text: "Application 202341027059, filed 12 April 2023, published October 2024." },
      { title: "Sign Language Interpreting Eyewear", text: "Indian patent application filed 10 February 2023." },
      { title: "Wireless Sensor Network Platform", text: "Application 202341008938, filed February 2023." },
    ],
    cta: { label: "See the knee actuator", href: "/projects/smart-knee-actuator" },
  },
  yesist: {
    id: "yesist",
    title: "IEEE YESIST12 International Finalist",
    meta: "Grand Finale · Egypt · Sep 2023",
    badges: ["Finalist"],
    thumb: { kind: "image", src: "/images/certs/yesist12-finalist.jpg", fit: "cover" },
    blurb:
      "Team Robusta won the YESIST12 preliminary round at SSN College in March 2023 and went on to the international Grand Finale, Maker Fair Track, in Egypt. Also: IIT PALS winner, IIT Madras, and Smart India Hackathon.",
    cta: { label: "Read the recognition chapter", href: "/about#recognition" },
  },
  fellowship: {
    id: "fellowship",
    title: "The Build Fellowship: Tesla FCW/AEB",
    meta: "Mar to Apr 2025 · Remote",
    badges: ["Experience"],
    thumb: { kind: "image", src: "/images/certs/build-fellowship.jpg", fit: "cover" },
    blurb:
      "Analyzed Tesla forward collision warning and automatic emergency braking against crash-test data from 25 to 75 mph: time to collision fell from 2.1 s to 1.3 s, avoidance rate down 7.7% under partial offset.",
    cta: { label: "Read the AV chapter", href: "/about#av" },
  },
  contact: {
    id: "contact",
    title: "Get in touch",
    meta: "Chicago · open to relocation",
    badges: [],
    thumb: { kind: "contact" },
    blurb: "Email or LinkedIn reach me directly.",
    cta: { label: "Email me", href: `mailto:${site.email}`, external: true },
  },
  github: {
    id: "github",
    title: "GitHub",
    meta: "MohamedRizwan461",
    badges: [],
    thumb: { kind: "github" },
    blurb: "Project write-ups, the supply chain risk app, and the source of this portfolio: Next.js, three.js and React Three Fiber.",
    cta: { label: "Open GitHub", href: site.github, external: true },
  },
  can: projectCard("can", "can-gear-controller", { kind: "canframe" }),
  knee: projectCard("knee", "smart-knee-actuator", {
    kind: "video",
    src: "/video/knee-actuator-working.mp4",
    poster: "/video/knee-actuator-working-poster.jpg",
    zoom: 1.75,
  }),
  robot: projectCard("robot", "autonomous-mobile-robot", {
    kind: "video",
    src: "/video/robot-rl-demo.mp4",
    poster: "/video/robot-rl-demo-poster.jpg",
  }),
  eyewear: projectCard("eyewear", "sign-language-eyewear", { kind: "image", src: "/images/eyewear/worn-prototype.jpg" }),
  wsn: projectCard("wsn", "rfid-iot-attendance", { kind: "image", src: "/images/rfid/wsn-architecture.jpg", fit: "contain" }),
  asmc: projectCard("asmc", "ev-boost-converter", { kind: "volt" }),
  journey: {
    id: "journey",
    title: "My journey",
    meta: "7 chapters · biology to robots",
    badges: ["Start here"],
    thumb: { kind: "webp", src: "/video/face-holo.webp" },
    blurb:
      "Biology first, then electronics, then both at once: assistive devices, patents, a degree that changed, and a turn toward autonomous vehicles.",
    cta: { label: "Continue my journey", href: "/about#biology" },
    progress: "chapters",
  },
  maya: {
    id: "maya",
    title: "Particle face, rendered in Maya",
    meta: "3D animation · curl noise",
    badges: ["3D"],
    thumb: { kind: "webp", src: "/video/face-holo.webp" },
    blurb: "Before the robots learned to drive, I learned to make particles hold the shape of a face. Maya, curl noise and a lot of render time.",
    cta: { label: "Read my journey", href: "/about#biology" },
  },
  jet: {
    id: "jet",
    title: "Jet hologram, rendered in Maya",
    meta: "3D animation · particles",
    badges: ["3D"],
    thumb: { kind: "webp", src: "/video/jet-holo.webp" },
    blurb: "A jet made of particles on a motion path, animated in Maya with speed regulated for take-off and landing.",
    cta: { label: "Back to the board", href: "/" },
  },
};
