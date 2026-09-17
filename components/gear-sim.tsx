"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Plug, PlugsConnected, Shuffle } from "@phosphor-icons/react/dist/ssr";
import {
  CAN_ID_GEAR_STATUS,
  CAN_TIMEOUT_MS,
  checksum,
  computeTarget,
  encode,
  engineRpm,
  FAULT_CHECKSUM,
  FAULT_INVALID_REQUEST,
  FAULT_TIMEOUT,
  Gear,
  gearName,
  isForward,
  SPEED_PARK_LIMIT_X10,
  SPEED_REVERSE_LIMIT_X10,
  THROTTLE_UPSHIFT_INHIBIT_PCT,
  transitionAllowed,
  type Ctx,
} from "@/lib/gearbox";

type Tone = "ok" | "warn" | "bad" | "info";
type Note = { id: number; tone: Tone; text: string; rule?: string };

/** SVG path for a spur gear. */
function gearPath(teeth: number, r: number, depth: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const corners = [
      [a, r - depth],
      [a + step * 0.12, r],
      [a + step * 0.42, r],
      [a + step * 0.54, r - depth],
    ];
    for (const [ang, rad] of corners) pts.push(`${(Math.cos(ang) * rad).toFixed(2)},${(Math.sin(ang) * rad).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

const BIG = gearPath(24, 46, 7);
const SMALL = gearPath(12, 25, 6);

const toneStyle: Record<Tone, string> = {
  ok: "border-[color-mix(in_srgb,#22c55e_55%,transparent)] bg-[color-mix(in_srgb,#22c55e_12%,transparent)]",
  info: "border-rule bg-[var(--surface-2)]",
  warn: "border-[color-mix(in_srgb,#f59e0b_60%,transparent)] bg-[color-mix(in_srgb,#f59e0b_12%,transparent)]",
  bad: "border-[color-mix(in_srgb,#ef4444_60%,transparent)] bg-[color-mix(in_srgb,#ef4444_12%,transparent)]",
};

export function GearSim({ compact = false }: { compact?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const [ctx, setCtx] = useState<Ctx>({ current: Gear.P, speedX10: 0, throttle: 20, brake: false, faults: 0 });
  const [note, setNote] = useState<Note>({
    id: 0,
    tone: "info",
    text: "You're in Park. Press the brake, then pull the lever to D to drive.",
  });
  const [counter, setCounter] = useState(0);
  const [unplugged, setUnplugged] = useState(false);
  const [rxState, setRxState] = useState<"ok" | "checksum" | "timeout">("ok");
  const [scrambled, setScrambled] = useState<number | null>(null);
  const lastRx = useRef(Date.now());
  const noteId = useRef(1);
  const driver = useRef<SVGGElement>(null);
  const driven = useRef<SVGGElement>(null);
  const angle = useRef(0);

  const say = useCallback((tone: Tone, text: string, rule?: string) => {
    setNote({ id: noteId.current++, tone, text, rule });
  }, []);

  const speed = ctx.speedX10 / 10;
  const rpm = engineRpm(ctx.current, speed);

  // the shift scheduler runs continuously, like the control task
  useEffect(() => {
    const id = setInterval(() => {
      setCtx((c) => {
        if (!isForward(c.current)) return c;
        const target = computeTarget(c.current, c.speedX10, c.throttle);
        if (target === c.current) return c;
        if (target > c.current)
          say("ok", `Shifted up to ${gearName(target)} at ${(c.speedX10 / 10).toFixed(0)} km/h, so the engine can relax.`, "SWR-010");
        else
          say(
            "ok",
            `Shifted down to ${gearName(target)}. It waits 3 km/h below the upshift point so it never flips back and forth.`,
            "SWR-011",
          );
        return { ...c, current: target };
      });
    }, 350);
    return () => clearInterval(id);
  }, [say]);

  // SWR-012: explain when a heavy foot is holding the gear
  const holdWarned = useRef(false);
  useEffect(() => {
    if (!isForward(ctx.current) || ctx.current === Gear.D8) return;
    const wouldUp = computeTarget(ctx.current, ctx.speedX10, 0) > ctx.current;
    const holding = wouldUp && ctx.throttle > THROTTLE_UPSHIFT_INHIBIT_PCT;
    if (holding && !holdWarned.current) {
      holdWarned.current = true;
      say("warn", `Holding ${gearName(ctx.current)}: you're flooring it, so the controller won't upshift and steal your power.`, "SWR-012");
    }
    if (!holding) holdWarned.current = false;
  }, [ctx.current, ctx.speedX10, ctx.throttle, say]);

  // the bus: a status frame goes out on every tick, slowed down so you can watch it
  useEffect(() => {
    const id = setInterval(() => {
      if (unplugged) {
        if (Date.now() - lastRx.current >= CAN_TIMEOUT_MS && rxState !== "timeout") {
          setRxState("timeout");
          setCtx((c) => ({ ...c, faults: c.faults | FAULT_TIMEOUT }));
          say("bad", "No frame for 250 ms. The receiver stops trusting old data and goes to its fail-safe state.", "SWR-032");
        }
        return;
      }
      lastRx.current = Date.now();
      setCounter((n) => (n + 1) & 0x0f);
    }, 300);
    return () => clearInterval(id);
  }, [unplugged, rxState, say]);

  // spin the gears from engine speed without re-rendering React every frame
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      const moving = ctx.current !== Gear.P && ctx.current !== Gear.N ? rpm : ctx.current === Gear.N ? 0 : 0;
      angle.current += (moving / 60) * 360 * dt * 0.06;
      driver.current?.setAttribute("transform", `rotate(${angle.current})`);
      driven.current?.setAttribute("transform", `rotate(${(-angle.current * 12) / 24 + 7.5})`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce, rpm, ctx.current]);

  const request = (g: Gear) => {
    const want = g === Gear.D1 && isForward(ctx.current) ? ctx.current : g;
    if (g === Gear.D1 && isForward(ctx.current)) {
      say("info", `Already driving in ${gearName(ctx.current)}. The controller picks the gear for you as speed changes.`);
      return;
    }
    if (transitionAllowed(ctx, want)) {
      setCtx((c) => ({ ...c, current: want, faults: c.faults & ~FAULT_INVALID_REQUEST }));
      if (want === Gear.N) say("ok", "Neutral. Always allowed, at any speed: it's the safe state.", "SWR-005");
      else if (want === Gear.P) say("ok", "Parked. The gearbox is locked.", "SWR-004");
      else if (want === Gear.R) say("ok", "Reverse engaged, slowly.", "SWR-003");
      else say("ok", "In drive, pulling away in D1.", "SWR-002");
      return;
    }
    setCtx((c) => ({ ...c, faults: c.faults | FAULT_INVALID_REQUEST }));
    if (want === Gear.R && ctx.speedX10 > SPEED_REVERSE_LIMIT_X10)
      say(
        "bad",
        `Blocked. Reverse at ${speed.toFixed(0)} km/h would wreck the gearbox. You stay in ${gearName(ctx.current)} and a fault is logged.`,
        "SWR-003",
      );
    else if (want === Gear.P && ctx.speedX10 > SPEED_PARK_LIMIT_X10)
      say(
        "bad",
        `Blocked. Park at ${speed.toFixed(0)} km/h would snap the parking pawl, the metal pin that locks the gearbox.`,
        "SWR-004",
      );
    else if (ctx.current === Gear.P && !ctx.brake)
      say("bad", "Blocked. Press the brake first to leave Park, same as a real car.", "SWR-002");
    else say("bad", "Blocked. That shift isn't allowed from here.", "SWR-006");
  };

  const frame = encode(ctx, counter);
  const received = scrambled !== null ? frame.map((b, i) => (i === 1 ? b ^ 0x5a : b)) : frame;
  const rxOk = scrambled === null || checksum(received) === received[7];

  const scramble = () => {
    setScrambled(Date.now());
    setRxState("checksum");
    setCtx((c) => ({ ...c, faults: c.faults | FAULT_CHECKSUM }));
    say("bad", "A byte got scrambled on the wire. The checksum doesn't match, so the receiver throws the frame away instead of trusting a wrong speed.", "SWR-023");
    setTimeout(() => {
      setScrambled(null);
      setRxState((s) => (s === "checksum" ? "ok" : s));
      setCtx((c) => ({ ...c, faults: c.faults & ~FAULT_CHECKSUM }));
    }, 2600);
  };

  const togglePlug = () => {
    if (unplugged) {
      setUnplugged(false);
      setRxState("ok");
      lastRx.current = Date.now();
      setCtx((c) => ({ ...c, faults: c.faults & ~FAULT_TIMEOUT }));
      say("ok", "Bus reconnected. Frames are arriving and the fault clears.", "SWR-032");
    } else {
      setUnplugged(true);
      lastRx.current = Date.now();
      say("warn", "Bus unplugged. Waiting to see how long the receiver will trust silence...");
    }
  };

  const reset = () => {
    setCtx({ current: Gear.P, speedX10: 0, throttle: 20, brake: false, faults: 0 });
    setUnplugged(false);
    setRxState("ok");
    setScrambled(null);
    say("info", "Reset. You're in Park. Press the brake, then pull the lever to D to drive.");
  };

  const lever: { g: Gear; label: string }[] = [
    { g: Gear.P, label: "P" },
    { g: Gear.R, label: "R" },
    { g: Gear.N, label: "N" },
    { g: Gear.D1, label: "D" },
  ];
  const leverActive = (g: Gear) => (g === Gear.D1 ? isForward(ctx.current) : ctx.current === g);

  return (
    <div className="text-ink">
      <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-[1.05fr_1fr]"}`}>
        {/* the car */}
        <div className="flex flex-col gap-3 border border-rule bg-[var(--surface-2)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-ink-2 uppercase">Gear</p>
              <p className="text-5xl leading-none font-bold tabular-nums" style={{ color: "var(--accent)" }}>
                {gearName(ctx.current)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tracking-[0.14em] text-ink-2 uppercase">Speed</p>
              <p className="text-4xl leading-none font-bold tabular-nums">
                {speed.toFixed(0)}
                <span className="ml-1 text-base font-medium text-ink-2">km/h</span>
              </p>
              <p className="mt-1 text-sm text-ink-2 tabular-nums">engine {rpm.toLocaleString()} rpm</p>
            </div>
          </div>

          {/* meshing gears */}
          <svg viewBox="-70 -55 180 110" className="mx-auto h-28 w-full max-w-[16rem]" aria-hidden>
            <g ref={driver}>
              <path d={BIG} fill="var(--accent)" opacity="0.9" />
              <circle r="12" fill="var(--surface-2)" />
              <circle r="4" fill="var(--accent)" />
            </g>
            <g transform="translate(69,0)">
              <g ref={driven}>
                <path d={SMALL} fill="var(--ink-2)" />
                <circle r="7" fill="var(--surface-2)" />
              </g>
            </g>
          </svg>

          <label className="block">
            <span className="flex justify-between text-sm">
              <span>How fast is the car going?</span>
              <span className="text-ink-2 tabular-nums">{speed.toFixed(0)} km/h</span>
            </span>
            <input
              type="range"
              min={0}
              max={120}
              value={speed}
              onChange={(e) => setCtx((c) => ({ ...c, speedX10: Number(e.target.value) * 10 }))}
              className="mt-1.5 w-full accent-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm">
              <span>Throttle (how hard you press)</span>
              <span className="text-ink-2 tabular-nums">{ctx.throttle}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={ctx.throttle}
              onChange={(e) => setCtx((c) => ({ ...c, throttle: Number(e.target.value) }))}
              className="mt-1.5 w-full accent-[var(--accent)]"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden border border-rule" role="group" aria-label="Gear lever">
              {lever.map(({ g, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => request(g)}
                  aria-pressed={leverActive(g)}
                  className="h-11 w-11 text-lg font-bold transition-colors"
                  style={
                    leverActive(g)
                      ? { background: "var(--accent)", color: "var(--accent-ink)" }
                      : { background: "var(--surface)", color: "var(--ink)" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCtx((c) => ({ ...c, brake: !c.brake }))}
              aria-pressed={ctx.brake}
              className="h-11 border px-4 text-sm font-semibold transition-colors"
              style={
                ctx.brake
                  ? { background: "#ef4444", borderColor: "#ef4444", color: "#fff" }
                  : { borderColor: "var(--rule-strong)", color: "var(--ink)" }
              }
            >
              {ctx.brake ? "Brake: pressed" : "Press brake"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset" className="ml-auto h-11 px-2 text-ink-2 hover:text-ink">
              <ArrowCounterClockwise size={20} />
            </button>
          </div>
        </div>

        {/* what the controller did, and the bus */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={note.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`border p-3.5 ${toneStyle[note.tone]}`}
              role="status"
              aria-live="polite"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-ink-2 uppercase">What the controller did</p>
              <p className="mt-1.5 text-base leading-snug">{note.text}</p>
              {note.rule && <p className="mt-1.5 font-mono text-xs text-ink-2">requirement {note.rule}</p>}
            </motion.div>
          </AnimatePresence>

          <div className="border border-rule bg-[var(--surface-2)] p-3.5">
            <p className="flex items-center justify-between text-xs font-semibold tracking-[0.14em] text-ink-2 uppercase">
              <span>Message on the CAN bus</span>
              <span className="font-mono tracking-normal normal-case">0x{CAN_ID_GEAR_STATUS.toString(16).toUpperCase()}</span>
            </p>
            <div className="mt-2 grid grid-cols-8 gap-1">
              {received.map((b, i) => {
                const hit = scrambled !== null && i === 1;
                const labels = ["gear", "spd", "spd", "thr", "flt", "--", "cnt", "sum"];
                return (
                  <div key={i} className="text-center">
                    <div
                      className="border py-1.5 font-mono text-sm tabular-nums transition-colors"
                      style={{
                        borderColor: hit ? "#ef4444" : i >= 6 ? "var(--accent)" : "var(--rule-strong)",
                        background: hit ? "color-mix(in srgb, #ef4444 20%, transparent)" : "transparent",
                        opacity: unplugged ? 0.35 : 1,
                      }}
                    >
                      {b.toString(16).toUpperCase().padStart(2, "0")}
                    </div>
                    <div className="mt-0.5 text-[0.65rem] text-ink-2">{labels[i]}</div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-ink-2">
              The gear, speed and throttle packed into 8 bytes. <span className="text-ink">cnt</span> counts every frame, and{" "}
              <span className="text-ink">sum</span> is a checksum so damaged messages get caught.
            </p>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: rxState === "ok" && rxOk ? "#22c55e" : "#ef4444" }}
                aria-hidden
              />
              <span>
                Receiver:{" "}
                {rxState === "timeout"
                  ? "fail-safe, no messages"
                  : rxState === "checksum" || !rxOk
                    ? "rejected a damaged frame"
                    : "frames arriving, checksum OK"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={scramble}
                disabled={unplugged || scrambled !== null}
                className="flex items-center gap-1.5 border border-rule-strong px-3 py-2 text-sm hover:border-accent disabled:opacity-40"
              >
                <Shuffle size={16} /> Scramble a byte
              </button>
              <button
                type="button"
                onClick={togglePlug}
                className="flex items-center gap-1.5 border border-rule-strong px-3 py-2 text-sm hover:border-accent"
              >
                {unplugged ? <PlugsConnected size={16} /> : <Plug size={16} />}
                {unplugged ? "Plug the bus back in" : "Unplug the bus"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-2">
        Try it: drive to 40 km/h, then pull the lever to R. This runs the same rules as the STM32 firmware, ported line for line.
      </p>
    </div>
  );
}
