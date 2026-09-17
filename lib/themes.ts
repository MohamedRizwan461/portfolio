import type { ModeId } from "@/lib/modes";

/**
 * Colour families to try on. Every family has a dark and a light version, and a
 * finish: "glow" keeps the drifting light fields and lit copper, "matte" is flat,
 * solid colour with no glow. In light mode the board stays a real PCB colour, so it
 * reads like a product shot on a pale desk.
 */
export type Scheme = "dark" | "light";
export type Finish = "glow" | "matte";

export type Tokens = {
  ground: string;
  surface: string;
  surface2: string;
  ink: string;
  ink2: string;
  rule: string;
  ruleStrong: string;
  gridLine: string;
  vignette: string;
  fieldB: string;
  board: string;
  boardEdge: string;
  boardInk: string;
  copper: string;
  onAccent: string;
  accents: Record<ModeId, string>;
};

export type Theme = {
  id: string;
  name: string;
  line: string;
  finish: Finish;
  favourite?: boolean;
  dark: Tokens;
  light: Tokens;
};

const DARK = {
  ink: "#eef1f5",
  ink2: "#9aa3b0",
  rule: "rgba(255,255,255,0.08)",
  ruleStrong: "rgba(255,255,255,0.18)",
  gridLine: "rgba(255,255,255,0.045)",
  vignette: "rgba(0,0,0,0.62)",
  boardInk: "#f2f6fa",
  onAccent: "#05080d",
};

const LIGHT = {
  ink: "#111820",
  ink2: "#5b6572",
  rule: "rgba(10,20,30,0.09)",
  ruleStrong: "rgba(10,20,30,0.2)",
  gridLine: "rgba(10,20,30,0.06)",
  vignette: "rgba(255,255,255,0)",
  boardInk: "#f2f6fa",
  onAccent: "#ffffff",
};

export const themes: Theme[] = [
  {
    id: "midnight",
    name: "Midnight Signal",
    line: "Navy room, teal board, glowing signal colours.",
    finish: "glow",
    favourite: true,
    dark: {
      ...DARK,
      ground: "#0c1422",
      surface: "#0f1a2b",
      surface2: "#15233a",
      fieldB: "rgba(39,224,196,0.32)",
      board: "#16414a",
      boardEdge: "#1c4d57",
      copper: "#c7a25c",
      accents: { recruiter: "#4d8dff", engineer: "#27e0c4", curious: "#f5b642" },
    },
    light: {
      ...LIGHT,
      ground: "#eef3f9",
      surface: "#ffffff",
      surface2: "#e3eaf3",
      fieldB: "rgba(39,224,196,0.18)",
      board: "#16414a",
      boardEdge: "#1c4d57",
      copper: "#c7a25c",
      accents: { recruiter: "#1f6fe5", engineer: "#0a8f7c", curious: "#b87400" },
    },
  },
  {
    id: "midnight-matte",
    name: "Midnight Matte",
    line: "Midnight Signal with the glow switched off: flat navy, solid colour.",
    finish: "matte",
    favourite: true,
    dark: {
      ...DARK,
      ground: "#111a2b",
      surface: "#172238",
      surface2: "#1e2c46",
      fieldB: "rgba(0,0,0,0)",
      board: "#1d3a52",
      boardEdge: "#234560",
      copper: "#b89a5e",
      accents: { recruiter: "#6d9eff", engineer: "#3cc9b4", curious: "#e8b04f" },
    },
    light: {
      ...LIGHT,
      ground: "#e9edf3",
      surface: "#ffffff",
      surface2: "#dde3ec",
      fieldB: "rgba(0,0,0,0)",
      board: "#1d3a52",
      boardEdge: "#234560",
      copper: "#b89a5e",
      accents: { recruiter: "#2f63c9", engineer: "#12806f", curious: "#a86a00" },
    },
  },
  {
    id: "ev-carbon",
    name: "EV Carbon",
    line: "Charcoal and a matte-black board, like an EV dashboard.",
    finish: "glow",
    favourite: true,
    dark: {
      ...DARK,
      ground: "#06080b",
      surface: "#0c0f13",
      surface2: "#12161c",
      fieldB: "rgba(63,169,255,0.10)",
      board: "#20242b",
      boardEdge: "#2a2f37",
      copper: "#c9a45c",
      accents: { recruiter: "#3fa9ff", engineer: "#ff4d4f", curious: "#ffb020" },
    },
    light: {
      ...LIGHT,
      ground: "#f3f4f6",
      surface: "#ffffff",
      surface2: "#e9ebef",
      fieldB: "rgba(63,169,255,0.14)",
      board: "#20242b",
      boardEdge: "#2a2f37",
      copper: "#c9a45c",
      accents: { recruiter: "#1a73c9", engineer: "#d62f2f", curious: "#b86e00" },
    },
  },
  {
    id: "ev-carbon-matte",
    name: "EV Carbon Matte",
    line: "EV Carbon, flat: solid charcoal like a car interior, no glow.",
    finish: "matte",
    favourite: true,
    dark: {
      ...DARK,
      ground: "#16181c",
      surface: "#1e2126",
      surface2: "#262a30",
      fieldB: "rgba(0,0,0,0)",
      board: "#2b2f36",
      boardEdge: "#353a42",
      copper: "#b39462",
      accents: { recruiter: "#4c9ffe", engineer: "#e5484d", curious: "#f5a623" },
    },
    light: {
      ...LIGHT,
      ground: "#e8e9ec",
      surface: "#ffffff",
      surface2: "#dcdee2",
      fieldB: "rgba(0,0,0,0)",
      board: "#2b2f36",
      boardEdge: "#353a42",
      copper: "#b39462",
      accents: { recruiter: "#1d66c7", engineer: "#c42b30", curious: "#b06f00" },
    },
  },
  {
    id: "graphite-ice",
    name: "Graphite & Ice",
    line: "Matte graphite with a silver-finish board and icy accents. Calm and precise.",
    finish: "matte",
    dark: {
      ...DARK,
      ground: "#14171b",
      surface: "#1c2025",
      surface2: "#242930",
      fieldB: "rgba(0,0,0,0)",
      board: "#3a424c",
      boardEdge: "#454e59",
      copper: "#aeb8c2",
      accents: { recruiter: "#8ec5ff", engineer: "#6ee7b7", curious: "#fcd34d" },
    },
    light: {
      ...LIGHT,
      ground: "#f4f6f8",
      surface: "#ffffff",
      surface2: "#e6eaee",
      fieldB: "rgba(0,0,0,0)",
      board: "#3a424c",
      boardEdge: "#454e59",
      copper: "#aeb8c2",
      accents: { recruiter: "#2b72c4", engineer: "#0f8a66", curious: "#a86b10" },
    },
  },
  {
    id: "slate-orange",
    name: "Slate & Safety Orange",
    line: "Matte slate like a lab bench, safety orange like the warning labels on it.",
    finish: "matte",
    dark: {
      ...DARK,
      ground: "#1a1d21",
      surface: "#22262b",
      surface2: "#2a2f35",
      fieldB: "rgba(0,0,0,0)",
      board: "#2f3a45",
      boardEdge: "#394552",
      copper: "#c49a5a",
      accents: { recruiter: "#ff7a1a", engineer: "#38bdf8", curious: "#a3e635" },
    },
    light: {
      ...LIGHT,
      ground: "#eceff2",
      surface: "#ffffff",
      surface2: "#dfe3e8",
      fieldB: "rgba(0,0,0,0)",
      board: "#2f3a45",
      boardEdge: "#394552",
      copper: "#c49a5a",
      accents: { recruiter: "#d9590a", engineer: "#0277b8", curious: "#4d7c0f" },
    },
  },
  {
    id: "racing-green",
    name: "Racing Green",
    line: "Deep matte green with brass-coloured copper and warm accents.",
    finish: "matte",
    dark: {
      ...DARK,
      ground: "#0f1a15",
      surface: "#15231c",
      surface2: "#1b2d24",
      fieldB: "rgba(0,0,0,0)",
      board: "#1e3a2c",
      boardEdge: "#254634",
      copper: "#d0a85a",
      accents: { recruiter: "#ff8a3d", engineer: "#6cc3ff", curious: "#d9e45a" },
    },
    light: {
      ...LIGHT,
      ground: "#eef2ee",
      surface: "#ffffff",
      surface2: "#e0e7e1",
      fieldB: "rgba(0,0,0,0)",
      board: "#1e3a2c",
      boardEdge: "#254634",
      copper: "#d0a85a",
      accents: { recruiter: "#cc5a14", engineer: "#1b6fae", curious: "#6b7700" },
    },
  },
  {
    id: "ceramic",
    name: "Ceramic White",
    line: "A white board with black chips, like a ceramic substrate. Clean and modern.",
    finish: "matte",
    dark: {
      ...DARK,
      ground: "#121417",
      surface: "#1a1d21",
      surface2: "#23272c",
      fieldB: "rgba(0,0,0,0)",
      board: "#e6e9ed",
      boardEdge: "#d3d8de",
      boardInk: "#111820",
      copper: "#b38b44",
      accents: { recruiter: "#5b95ff", engineer: "#16c79a", curious: "#ff9f1c" },
    },
    light: {
      ...LIGHT,
      ground: "#f7f8fa",
      surface: "#ffffff",
      surface2: "#eceff3",
      fieldB: "rgba(0,0,0,0)",
      board: "#e6e9ed",
      boardEdge: "#d3d8de",
      boardInk: "#111820",
      copper: "#b38b44",
      accents: { recruiter: "#1f6fe5", engineer: "#0c8a6b", curious: "#b86e00" },
    },
  },
  {
    id: "green-pcb",
    name: "Classic Green PCB",
    line: "Real solder-mask green with gold copper, like the boards on your bench.",
    finish: "glow",
    dark: {
      ...DARK,
      ground: "#06120c",
      surface: "#0c1c14",
      surface2: "#12261b",
      fieldB: "rgba(124,242,154,0.26)",
      board: "#0f5a31",
      boardEdge: "#157040",
      copper: "#e0b04e",
      accents: { recruiter: "#5ec8ff", engineer: "#7cf29a", curious: "#ffcf4a" },
    },
    light: {
      ...LIGHT,
      ground: "#eef5f0",
      surface: "#ffffff",
      surface2: "#dfeae2",
      fieldB: "rgba(124,242,154,0.16)",
      board: "#0f5a31",
      boardEdge: "#157040",
      copper: "#e0b04e",
      accents: { recruiter: "#1b73b8", engineer: "#1b8a4b", curious: "#a67c00" },
    },
  },
  {
    id: "scope",
    name: "Oscilloscope",
    line: "Near-black screen and a real scope's channel colours: yellow, cyan, magenta.",
    finish: "glow",
    dark: {
      ...DARK,
      ground: "#050807",
      surface: "#0b1110",
      surface2: "#111a18",
      fieldB: "rgba(53,214,255,0.24)",
      board: "#0d2119",
      boardEdge: "#13301f",
      copper: "#b99a52",
      accents: { recruiter: "#ffd23f", engineer: "#35d6ff", curious: "#ff5ad1" },
    },
    light: {
      ...LIGHT,
      ground: "#f1f2f0",
      surface: "#ffffff",
      surface2: "#e3e6e2",
      fieldB: "rgba(53,214,255,0.14)",
      board: "#0d2119",
      boardEdge: "#13301f",
      copper: "#b99a52",
      accents: { recruiter: "#a88600", engineer: "#0781a3", curious: "#b0189f" },
    },
  },
  {
    id: "purple-enig",
    name: "Purple ENIG",
    line: "The purple hobby-PCB mask with gold pads. Distinctive and a little playful.",
    finish: "glow",
    dark: {
      ...DARK,
      ground: "#110b1d",
      surface: "#1a1229",
      surface2: "#221935",
      fieldB: "rgba(180,140,255,0.3)",
      board: "#40216a",
      boardEdge: "#4e2a80",
      copper: "#f0bf55",
      accents: { recruiter: "#b48cff", engineer: "#4de3c1", curious: "#ffb454" },
    },
    light: {
      ...LIGHT,
      ground: "#f4f0fa",
      surface: "#ffffff",
      surface2: "#e8e1f3",
      fieldB: "rgba(180,140,255,0.18)",
      board: "#40216a",
      boardEdge: "#4e2a80",
      copper: "#f0bf55",
      accents: { recruiter: "#6d3fe0", engineer: "#0a8a78", curious: "#b86400" },
    },
  },
];

export const THEME_STORAGE_KEY = "riz-theme";
export const SCHEME_STORAGE_KEY = "riz-scheme";
export const THEME_EVENT = "riz-theme-change";
export const DEFAULT_THEME = themes.find((t) => t.id === "ev-carbon")!;

function hexToRgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** The operator's colour, muted toward grey, for the background glow. */
function glow(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  const mute = (c: number, g: number) => Math.round(c * 0.55 + g * 0.45);
  return `rgba(${mute((n >> 16) & 255, 70)}, ${mute((n >> 8) & 255, 70)}, ${mute(n & 255, 75)}, ${a})`;
}

export function readThemeChoice(): { theme: Theme; scheme: Scheme } {
  let theme = DEFAULT_THEME;
  let scheme: Scheme = "dark";
  try {
    theme = themes.find((t) => t.id === window.localStorage.getItem(THEME_STORAGE_KEY)) ?? DEFAULT_THEME;
    scheme = window.localStorage.getItem(SCHEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {}
  return { theme, scheme };
}

/** Paint the whole site: every page reads these variables. */
export function applyTheme(theme: Theme, scheme: Scheme, mode: ModeId) {
  const t = theme[scheme];
  const accent = t.accents[mode];
  const root = document.documentElement;
  const set = (k: string, v: string) => root.style.setProperty(k, v);
  set("--ground", t.ground);
  set("--panel", t.surface);
  set("--panel-strong", t.surface2);
  set("--surface", t.surface);
  set("--surface-2", t.surface2);
  set("--ink", t.ink);
  set("--ink-2", t.ink2);
  set("--rule", t.rule);
  set("--rule-strong", t.ruleStrong);
  set("--grid-line", t.gridLine);
  set("--vignette", t.vignette);
  set("--accent", accent);
  set("--accent-2", t.accents.engineer === accent ? t.accents.recruiter : t.accents.engineer);
  set("--accent-ink", t.onAccent);
  set("--accent-soft", hexToRgba(accent, scheme === "light" ? 0.12 : 0.14));
  set("--field-a", theme.finish === "matte" ? "rgba(0,0,0,0)" : hexToRgba(accent, scheme === "light" ? 0.18 : 0.3));
  set("--field-b", t.fieldB);
  set("--warm", glow(accent, scheme === "light" ? 0.16 : 0.27));
  set("--warm-2", glow(accent, scheme === "light" ? 0.1 : 0.2));
  root.style.colorScheme = scheme;
  root.dataset.finish = theme.finish;
  root.dataset.scheme = scheme;
}
