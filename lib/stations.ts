/**
 * The board. A data bus runs left to right in time order; every chip hanging off
 * it is a chapter or a project, and the part number is the part it really ran on.
 */
export type Station = {
  id: string;
  chip: string; // silkscreen part number
  title: string;
  /** what fits on the board without colliding with neighbours */
  short: string;
  year: string;
  x: number;
  z: number;
  group: "origin" | "assistive" | "controls" | "autonomy";
  blurb: string;
  stack: string[];
  href: string;
  media?: { kind: "image" | "video"; src: string; poster?: string; alt: string };
};

export const BUS_Z = 0;

export const stations: Station[] = [
  {
    id: "biology",
    chip: "START",
    title: "My journey",
    short: "My journey",
    year: "Where it began",
    x: -9,
    z: -4.2,
    group: "origin",
    blurb: "How a body moves, and what it costs a person when it stops. Everything after this attaches to a human being.",
    stack: ["curiosity", "anatomy", "why"],
    href: "/about#biology",
  },
  {
    id: "smart-knee-actuator",
    chip: "RP2040",
    title: "Smart Knee Actuator",
    short: "Knee Actuator",
    year: "2022",
    x: -6,
    z: 4.2,
    group: "assistive",
    blurb: "A pneumatic knee exoskeleton that classifies gait phase with TinyML and fires the cylinder when the knee needs it. Patent application 202341027059.",
    stack: ["Embedded C", "RP2040", "TinyML", "Pneumatics"],
    href: "/projects/smart-knee-actuator",
    media: {
      kind: "video",
      src: "/video/knee-actuator-working.mp4",
      poster: "/video/knee-actuator-working-poster.jpg",
      alt: "Knee actuator running on a leg",
    },
  },
  {
    id: "sign-language-eyewear",
    chip: "BCM2711",
    title: "Sign Language Eyewear",
    short: "Sign Eyewear",
    year: "2023",
    x: -3,
    z: -4.2,
    group: "assistive",
    blurb: "Camera glasses that read Indian Sign Language and speak it aloud, fully on a Raspberry Pi. Patent application filed Feb 2023.",
    stack: ["Python", "OpenCV", "MediaPipe", "Raspberry Pi 4B"],
    href: "/projects/sign-language-eyewear",
    media: { kind: "image", src: "/images/eyewear/worn-prototype.jpg", alt: "Eyewear prototype being worn" },
  },
  {
    id: "rfid-iot-attendance",
    chip: "ESP8266",
    title: "Wireless Sensor Network Platform",
    short: "Sensor Network",
    year: "2023",
    x: 0,
    z: 4.2,
    group: "assistive",
    blurb: "RFID taps on an ESP8266 node, posted over Wi-Fi to a serverless backend. Patent application 202341008938.",
    stack: ["ESP8266", "RFID", "Apps Script"],
    href: "/projects/rfid-iot-attendance",
    media: { kind: "image", src: "/images/rfid/wsn-architecture.jpg", alt: "Wireless sensor network architecture" },
  },
  {
    id: "ev-boost-converter",
    chip: "ASMC-36V",
    title: "EV Boost Converter Control",
    short: "EV Converter",
    year: "2023",
    x: 3,
    z: -4.2,
    group: "controls",
    blurb: "Adaptive sliding mode control holding a fuel cell vehicle bus at 36 V from 1 to 100 W, with a Lyapunov stability proof. Design and simulation, with Akshitha.",
    stack: ["MATLAB", "Simulink", "Stateflow"],
    href: "/projects/ev-boost-converter",
  },
  {
    id: "autonomous-mobile-robot",
    chip: "ATMEGA",
    title: "Autonomous Mobile Robot",
    short: "Mobile Robot",
    year: "2024",
    x: 6,
    z: 4.2,
    group: "autonomy",
    blurb: "Built the robot in semester one, taught it to avoid obstacles with Q-learning on the microcontroller in semester two. This is the little one driving around.",
    stack: ["C++", "Arduino", "Q-Learning", "HIL"],
    href: "/projects/autonomous-mobile-robot",
    media: {
      kind: "video",
      src: "/video/robot-goal-run.mp4",
      poster: "/video/robot-goal-run-poster.jpg",
      alt: "Robot navigating to a goal marker",
    },
  },
  {
    id: "can-gear-controller",
    chip: "STM32F4",
    title: "CAN Gear Controller",
    short: "CAN Controller",
    year: "2026",
    x: 9,
    z: -4.2,
    group: "autonomy",
    blurb: "Two STM32 nodes on a CAN bus with FreeRTOS, safety interlocks written as requirements first, and a checksum that rejects bad frames. In progress.",
    stack: ["Embedded C", "STM32", "FreeRTOS", "CAN"],
    href: "/projects/can-gear-controller",
  },
];

export const groupColor: Record<Station["group"], string> = {
  origin: "#f5b642",
  assistive: "#27e0c4",
  controls: "#b18cff",
  autonomy: "#4d8dff",
};

export const groupLabel: Record<Station["group"], string> = {
  origin: "Origin",
  assistive: "Assistive devices",
  controls: "Controls",
  autonomy: "Autonomy",
};
