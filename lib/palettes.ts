import type { ModeId } from "@/lib/modes";

/**
 * Colour worlds to try on. Each one repaints the room, the board, the copper and
 * the three operator colours together, so they can be judged as a whole.
 */
export type Palette = {
  id: string;
  name: string;
  line: string;
  ground: string;
  board: string;
  boardEdge: string;
  copper: string;
  fieldB: string;
  accents: Record<ModeId, string>;
};

export const palettes: Palette[] = [
  {
    id: "midnight",
    name: "Midnight Signal",
    line: "The current look. Navy room, teal board, blue, teal and amber.",
    ground: "#0c1422",
    board: "#16414a",
    boardEdge: "#1c4d57",
    copper: "#c7a25c",
    fieldB: "rgba(39, 224, 196, 0.32)",
    accents: { recruiter: "#4d8dff", engineer: "#27e0c4", curious: "#f5b642" },
  },
  {
    id: "green-pcb",
    name: "Classic Green PCB",
    line: "Real solder-mask green with gold copper, like the boards on your bench.",
    ground: "#06120c",
    board: "#0f5a31",
    boardEdge: "#157040",
    copper: "#e0b04e",
    fieldB: "rgba(124, 242, 154, 0.26)",
    accents: { recruiter: "#5ec8ff", engineer: "#7cf29a", curious: "#ffcf4a" },
  },
  {
    id: "scope",
    name: "Oscilloscope",
    line: "Black screen, dark board, and the scope's own channel colours: CH1 yellow, CH2 cyan, CH3 magenta.",
    ground: "#050807",
    board: "#0d2119",
    boardEdge: "#13301f",
    copper: "#b99a52",
    fieldB: "rgba(53, 214, 255, 0.24)",
    accents: { recruiter: "#ffd23f", engineer: "#35d6ff", curious: "#ff5ad1" },
  },
  {
    id: "purple-enig",
    name: "Purple ENIG",
    line: "The purple hobby-PCB mask with gold pads. Distinctive and a little playful.",
    ground: "#110b1d",
    board: "#40216a",
    boardEdge: "#4e2a80",
    copper: "#f0bf55",
    fieldB: "rgba(180, 140, 255, 0.3)",
    accents: { recruiter: "#b48cff", engineer: "#4de3c1", curious: "#ffb454" },
  },
  {
    id: "ev-carbon",
    name: "EV Carbon",
    line: "Charcoal and matte-black board, like an EV dashboard: signal red, electric blue, amber.",
    ground: "#0d0f12",
    board: "#20242b",
    boardEdge: "#2a2f37",
    copper: "#c9a45c",
    fieldB: "rgba(63, 169, 255, 0.24)",
    accents: { recruiter: "#ff5252", engineer: "#3fa9ff", curious: "#ffb020" },
  },
];

export const PALETTE_STORAGE_KEY = "riz-palette";
export const DEFAULT_PALETTE = palettes[0];
