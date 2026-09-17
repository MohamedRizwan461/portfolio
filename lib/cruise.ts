import { beats } from "./story";

/** Geometry and state of the drive, shared by the scene and the controls. */
export const CP0 = 24;
export const GAP = 46;
export const cpX = (k: number) => CP0 + k * GAP;
export const END = cpX(beats.length - 1) + 44;
export const MAX_V = 15;
export const LANE = 1.4;

export type Sim = {
  s: number;
  v: number;
  dir: number;
  auto: boolean;
  started: boolean;
  talking: boolean;
  speaking: boolean;
  next: number;
  near: number;
  reduce: boolean;
};
