/**
 * Operator modes chosen at boot. Each one changes where the robot drives first,
 * which chips stay lit, and what the autopilot tours. The board itself never changes.
 */
export type ModeId = "recruiter" | "engineer" | "curious";

export type Mode = {
  id: ModeId;
  key: string; // the key you can press on the boot menu
  label: string;
  line: string;
  /** stations in the order this visitor should see them */
  route: string[];
  /** only these chips stay lit; empty means all */
  highlight: string[];
  /** drive to the first stop and open it straight away */
  openFirst: boolean;
  glowResume: boolean;
};

export const modes: Mode[] = [
  {
    id: "recruiter",
    key: "1",
    label: "Recruiter",
    line: "Strongest work first, resume one click away.",
    route: ["can-gear-controller", "smart-knee-actuator", "sign-language-eyewear", "autonomous-mobile-robot"],
    highlight: [],
    openFirst: true,
    glowResume: true,
  },
  {
    id: "engineer",
    key: "2",
    label: "Engineer",
    line: "Firmware, protocols and the parts they ran on.",
    route: ["can-gear-controller", "smart-knee-actuator", "autonomous-mobile-robot", "rfid-iot-attendance", "ev-boost-converter"],
    highlight: ["can-gear-controller", "smart-knee-actuator", "autonomous-mobile-robot", "rfid-iot-attendance", "ev-boost-converter"],
    openFirst: true,
    glowResume: false,
  },
  {
    id: "curious",
    key: "3",
    label: "Just curious",
    line: "Let the robot give you the tour.",
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
    glowResume: false,
  },
];

export const MODE_STORAGE_KEY = "riz-mode";
