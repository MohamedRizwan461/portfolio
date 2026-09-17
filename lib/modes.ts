import type { Accessory } from "@/components/board/robot-model";

/**
 * Operator modes chosen at boot. Unlike a profile picker that only swaps a
 * background, each mode changes the board's colour, the robot, the headline,
 * the row of cards, which chips stay lit and where the robot drives.
 */
export type ModeId = "recruiter" | "engineer" | "curious";

export type Mode = {
  id: ModeId;
  key: string;
  label: string;
  line: string;
  accent: string;
  accessory: Accessory;
  /** hero card */
  kicker: string;
  headline: string;
  sub: string;
  primary: { label: string; href: string; download?: boolean; external?: boolean };
  secondary: { label: string; href: string; external?: boolean };
  /** netflix-style row */
  rowTitle: string;
  cards: string[];
  /** board behaviour */
  route: string[];
  highlight: string[];
  openFirst: boolean;
};

export const modes: Mode[] = [
  {
    id: "recruiter",
    key: "1",
    label: "Recruiter",
    line: "Strongest work first, resume one click away.",
    accent: "#4d8dff",
    accessory: "tie",
    kicker: "Robotics & embedded systems engineer",
    headline: "3 filed patents. Hardware that actually runs.",
    sub: "MS Computer Science, 2026. Firmware, robots and vision systems, built and tested on real hardware.",
    primary: { label: "Download resume", href: "/resume/Mohamed-Rizwan-Ameer-John-Resume.pdf", download: true },
    secondary: { label: "LinkedIn", href: "https://www.linkedin.com/in/mohamed-rizwan-ameer-john-3a459a231/", external: true },
    rowTitle: "Top picks for recruiters",
    cards: ["resume", "gearsim", "knee", "patents", "yesist", "can", "fellowship", "contact"],
    route: ["can-gear-controller", "smart-knee-actuator", "sign-language-eyewear", "autonomous-mobile-robot"],
    highlight: [],
    openFirst: true,
  },
  {
    id: "engineer",
    key: "2",
    label: "Engineer",
    line: "Firmware, protocols and the parts they ran on.",
    accent: "#27e0c4",
    accessory: "probe",
    kicker: "Bare metal to bus traffic",
    headline: "Embedded C, CAN, FreeRTOS, TinyML.",
    sub: "Interlocks written as requirements first, frames checked with a counter and checksum, gait classified on a Cortex-M0+.",
    primary: { label: "GitHub", href: "https://github.com/MohamedRizwan461", external: true },
    secondary: { label: "All case studies", href: "/projects" },
    rowTitle: "Firmware, protocols and control",
    cards: ["gearsim", "can", "knee", "robot", "asmc", "wsn", "eyewear", "github"],
    route: ["can-gear-controller", "smart-knee-actuator", "autonomous-mobile-robot", "rfid-iot-attendance", "ev-boost-converter"],
    highlight: ["can-gear-controller", "smart-knee-actuator", "autonomous-mobile-robot", "rfid-iot-attendance", "ev-boost-converter"],
    openFirst: true,
  },
  {
    id: "curious",
    key: "3",
    label: "Just curious",
    line: "Let the robot give you the tour.",
    accent: "#f5b642",
    accessory: "eyes",
    kicker: "From biology to robots",
    headline: "Machines that move for people who can't.",
    sub: "A boy who loved biology, a degree in electronics, a knee brace, a pair of talking glasses and a robot that taught itself to drive.",
    primary: { label: "Start my journey", href: "/about#biology" },
    secondary: { label: "Guided tour", href: "/tour" },
    rowTitle: "Watch it move",
    cards: ["gearsim", "journey", "knee", "robot", "eyewear", "maya", "jet"],
    route: [
      "biology",
      "smart-knee-actuator",
      "sign-language-eyewear",
      "rfid-iot-attendance",
      "ev-boost-converter",
      "autonomous-mobile-robot",
      "can-gear-controller",
    ],
    highlight: [],
    openFirst: false,
  },
];

export const MODE_STORAGE_KEY = "riz-mode";
