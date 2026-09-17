/**
 * A faithful TypeScript port of the CAN gear controller firmware
 * (src/gear_state.c, src/shift_scheduler.c, src/can_protocol.c), so the
 * simulation on the site behaves exactly like the C it describes.
 */

export enum Gear {
  P = 0,
  R,
  N,
  D1,
  D2,
  D3,
  D4,
  D5,
  D6,
  D7,
  D8,
}

export const FAULT_INVALID_REQUEST = 1 << 0;
export const FAULT_TIMEOUT = 1 << 1;
export const FAULT_CHECKSUM = 1 << 2;

export const SPEED_REVERSE_LIMIT_X10 = 50; // SWR-003
export const SPEED_PARK_LIMIT_X10 = 20; // SWR-004
export const THROTTLE_UPSHIFT_INHIBIT_PCT = 85; // SWR-012
export const SHIFT_HYSTERESIS_X10 = 30; // SWR-011
export const CAN_TIMEOUT_MS = 250; // SWR-032
export const CAN_ID_GEAR_STATUS = 0x18f00500;

const UPSHIFT_X10 = [120, 220, 340, 460, 600, 760, 920, 0];

export type Ctx = { current: Gear; speedX10: number; throttle: number; brake: boolean; faults: number };

export const isForward = (g: Gear) => g >= Gear.D1 && g <= Gear.D8;

export function gearName(g: Gear) {
  return ["P", "R", "N", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"][g] ?? "??";
}

/** SWR-002..SWR-007 */
export function transitionAllowed(ctx: Ctx, requested: Gear): boolean {
  if (requested === ctx.current) return true;
  if (requested === Gear.N) return true;
  if (requested === Gear.P) return ctx.speedX10 <= SPEED_PARK_LIMIT_X10;
  if (requested === Gear.R) {
    if (ctx.speedX10 > SPEED_REVERSE_LIMIT_X10) return false;
    if (ctx.current === Gear.P && !ctx.brake) return false;
    return true;
  }
  if (isForward(requested)) {
    if (ctx.current === Gear.P) return ctx.brake && requested === Gear.D1;
    if (ctx.current === Gear.R || ctx.current === Gear.N) return requested === Gear.D1;
    const delta = requested - ctx.current;
    return delta === 1 || delta === -1;
  }
  return false;
}

export function upshiftAt(from: Gear) {
  return isForward(from) ? UPSHIFT_X10[from - Gear.D1] : 0;
}

export function downshiftAt(from: Gear) {
  if (!isForward(from) || from === Gear.D1) return 0;
  const lowerUp = UPSHIFT_X10[from - Gear.D1 - 1];
  return lowerUp > SHIFT_HYSTERESIS_X10 ? lowerUp - SHIFT_HYSTERESIS_X10 : 0;
}

/** SWR-010..SWR-013 */
export function computeTarget(current: Gear, speedX10: number, throttle: number): Gear {
  if (!isForward(current)) return current;
  if (throttle <= THROTTLE_UPSHIFT_INHIBIT_PCT && current < Gear.D8) {
    const up = upshiftAt(current);
    if (up !== 0 && speedX10 >= up) return current + 1;
  }
  if (current > Gear.D1 && speedX10 < downshiftAt(current)) return current - 1;
  return current;
}

/** SWR-022: one's-complement style sum over bytes 0..6 */
export function checksum(bytes: number[]) {
  const sum = bytes.slice(0, 7).reduce((a, b) => (a + b) & 0xff, 0);
  return (0xff - sum) & 0xff;
}

/** SWR-020 byte layout */
export function encode(ctx: Ctx, counter: number): number[] {
  const b = [
    ctx.current,
    ctx.speedX10 & 0xff,
    (ctx.speedX10 >> 8) & 0xff,
    ctx.throttle & 0xff,
    ctx.faults & 0xff,
    0,
    counter & 0x0f,
    0,
  ];
  b[7] = checksum(b);
  return b;
}

/** Engine speed for the picture: rough ratios for an 8-speed box. */
const RATIOS = [4.7, 3.1, 2.1, 1.67, 1.29, 1.0, 0.84, 0.67];
export function engineRpm(gear: Gear, speedKph: number) {
  if (!isForward(gear)) return gear === Gear.R ? 900 + speedKph * 120 : 800;
  return Math.max(800, Math.round(speedKph * RATIOS[gear - Gear.D1] * 32));
}
