"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Plug, PlugsConnected, Shuffle } from "@phosphor-icons/react/dist/ssr";
import { BusDiagram } from "./bus-diagram";
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
  const [withBus, setWithBus] = useState(true);
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

  const [wreck, setWreck] = useState<"none" | "cut" | "crunch">("none");
  const [shake, setShake] = useState(0);

  // cut a wire: with CAN the receiver notices; without CAN nobody does, and the gearbox pays
  const cutWire = () => {
    if (withBus) {
      if (!unplugged) togglePlug();
      return;
    }
    if (wreck !== "none") return;
    setWreck("cut");
    say("warn", "A wire just snapped. Without CAN there's no counter, no checksum, no timeout. Nobody notices...");
    setTimeout(() => {
      setWreck("crunch");
      setShake((n) => n + 1);
      setCtx((c) => ({ ...c, current: Gear.R }));
      say(
        "bad",
        `CRUNCH. The gearbox kept acting on garbage from the broken wire and slammed into Reverse at ${Math.max(40, speed).toFixed(0)} km/h. The gears are destroyed. With CAN, the timeout would have caught it in 250 ms.`,
        "why SWR-032 exists",
      );
    }, reduce ? 200 : 1400);
  };

  const repair = () => {
    setWreck("none");
    setCtx({ current: Gear.P, speedX10: 0, throttle: 20, brake: false, faults: 0 });
    say("info", "Repaired. Switch to With CAN bus and cut the wire again to see the controller catch it.");
  };

  const reset = () => {
    setCtx({ current: Gear.P, speedX10: 0, throttle: 20, brake: false, faults: 0 });
    setUnplugged(false);
    setRxState("ok");
    setScrambled(null);
    setWreck("none");
    say("info", "Reset. You're in Park. Press the brake, then pull the lever to D to drive.");
  };

  const lever: { g: Gear; label: string }[] = [
    { g: Gear.P, label: "P" },
    { g: Gear.R, label: "R" },
    { g: Gear.N, label: "N" },
    { g: Gear.D1, label: "D" },
  ];
  const leverActive = (g: Gear) => (g === Gear.D1 ? isForward(ctx.current) : ctx.current === g);
  const crunched = wreck === "crunch";

  // shards of the big gear for the crunch
  const shards = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return { i, dx: Math.cos(a) * (70 + (i % 3) * 25), dy: Math.sin(a) * (50 + (i % 4) * 18), rot: (i % 2 ? 1 : -1) * (160 + i * 23), a };
  });

  const card = "border border-rule bg-[var(--surface-2)]";

  return (
    <div className={`text-ink ${compact ? "" : "lg:grid lg:grid-cols-12 lg:gap-4"}`}>
      {/* ---------- the car ---------- */}
      <motion.div
        key={shake}
        animate={crunched && !reduce ? { x: [0, -14, 12, -10, 8, -4, 0], rotate: [0, -1.5, 1.2, -1, 0.6, 0] } : undefined}
        transition={{ duration: 0.55 }}
        className={`relative flex flex-col gap-2.5 overflow-hidden p-3.5 lg:col-span-5 ${card}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-ink-2 uppercase">Gear</p>
            <p className="text-4xl leading-none font-bold tabular-nums" style={{ color: crunched ? "#ef4444" : "var(--accent)" }}>
              {gearName(ctx.current)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-ink-2 uppercase">Speed</p>
            <p className="text-3xl leading-none font-bold tabular-nums">
              {speed.toFixed(0)}
              <span className="ml-1 text-sm font-medium text-ink-2">km/h</span>
            </p>
            <p className="mt-0.5 text-xs text-ink-2 tabular-nums">engine {crunched ? "----" : rpm.toLocaleString()} rpm</p>
          </div>
        </div>

        {/* meshing gears, or what is left of them */}
        <div className="relative mx-auto h-24 w-full max-w-[15rem]">
          <svg viewBox="-70 -55 180 110" className="absolute inset-0 h-full w-full" aria-hidden>
            {!crunched ? (
              <>
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
              </>
            ) : (
              <>
                {shards.map((sh) => (
                  <motion.path
                    key={sh.i}
                    d={`M0 0 L${Math.cos(sh.a) * 46} ${Math.sin(sh.a) * 46} L${Math.cos(sh.a + 0.45) * 46} ${Math.sin(sh.a + 0.45) * 46} Z`}
                    fill={sh.i % 3 === 0 ? "#ef4444" : "var(--accent)"}
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    animate={reduce ? { opacity: 0.6 } : { x: sh.dx, y: sh.dy + 40, rotate: sh.rot, opacity: [1, 1, 0.5] }}
                    transition={{ duration: 1.1, ease: [0.2, 0.8, 0.3, 1] }}
                  />
                ))}
                {!reduce &&
                  Array.from({ length: 18 }, (_, i) => (
                    <motion.circle
                      key={`s${i}`}
                      r={2 + (i % 3)}
                      fill={i % 2 ? "#ffd166" : "#ff7a1a"}
                      initial={{ cx: 0, cy: 0, opacity: 1 }}
                      animate={{ cx: Math.cos(i * 0.9) * (80 + i * 4), cy: Math.sin(i * 0.9) * (60 + i * 2), opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  ))}
              </>
            )}
          </svg>
          <AnimatePresence>
            {crunched && (
              <motion.p
                initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: -6 }}
                transition={{ type: "spring", stiffness: 380, damping: 14 }}
                className="absolute inset-0 flex items-center justify-center text-3xl font-black tracking-tight text-[#ef4444] [text-shadow:0_2px_0_#000]"
              >
                CRUNCH!
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {crunched && !reduce && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#ef4444]"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          />
        )}

        <label className="block">
          <span className="flex justify-between text-xs">
            <span>How fast is the car going?</span>
            <span className="text-ink-2 tabular-nums">{speed.toFixed(0)} km/h</span>
          </span>
          <input
            type="range"
            min={0}
            max={120}
            value={speed}
            disabled={crunched}
            onChange={(e) => setCtx((c) => ({ ...c, speedX10: Number(e.target.value) * 10 }))}
            className="mt-1 w-full accent-[var(--accent)]"
          />
        </label>
        <label className="block">
          <span className="flex justify-between text-xs">
            <span>Throttle (how hard you press)</span>
            <span className="text-ink-2 tabular-nums">{ctx.throttle}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={ctx.throttle}
            disabled={crunched}
            onChange={(e) => setCtx((c) => ({ ...c, throttle: Number(e.target.value) }))}
            className="mt-1 w-full accent-[var(--accent)]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden border border-rule" role="group" aria-label="Gear lever">
            {lever.map(({ g, label }) => (
              <button
                key={label}
                type="button"
                disabled={crunched}
                onClick={() => request(g)}
                aria-pressed={leverActive(g)}
                className="h-10 w-10 text-base font-bold transition-colors disabled:opacity-40"
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
            disabled={crunched}
            onClick={() => setCtx((c) => ({ ...c, brake: !c.brake }))}
            aria-pressed={ctx.brake}
            className="h-10 border px-3 text-xs font-semibold transition-colors disabled:opacity-40"
            style={
              ctx.brake
                ? { background: "#ef4444", borderColor: "#ef4444", color: "#fff" }
                : { borderColor: "var(--rule-strong)", color: "var(--ink)" }
            }
          >
            {ctx.brake ? "Brake: pressed" : "Press brake"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset" className="ml-auto h-10 px-2 text-ink-2 hover:text-ink">
            <ArrowCounterClockwise size={18} />
          </button>
        </div>
      </motion.div>

      {/* ---------- the network ---------- */}
      <div className="mt-3 flex flex-col gap-3 lg:col-span-7 lg:mt-0">
        <div className={`p-3 ${card}`}>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">How the car&apos;s controllers talk</p>
            <div className="flex items-center gap-2">
              <div className="flex border border-rule p-0.5 text-xs" role="radiogroup" aria-label="Wiring">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    role="radio"
                    aria-checked={withBus === v}
                    onClick={() => {
                      setWithBus(v);
                      if (wreck !== "none") repair();
                    }}
                    className="px-2.5 py-1 font-medium"
                    style={withBus === v ? { background: "var(--accent)", color: "var(--accent-ink)" } : { color: "var(--ink-2)" }}
                  >
                    {v ? "With CAN bus" : "Without CAN bus"}
                  </button>
                ))}
              </div>
              {wreck === "crunch" ? (
                <button type="button" onClick={repair} className="border border-rule-strong px-2.5 py-1 text-xs font-semibold hover:border-accent">
                  Repair
                </button>
              ) : withBus && unplugged ? (
                <button type="button" onClick={togglePlug} className="flex items-center gap-1 border border-rule-strong px-2.5 py-1 text-xs font-semibold hover:border-accent">
                  <PlugsConnected size={14} /> Reconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={cutWire}
                  disabled={wreck === "cut"}
                  className="flex items-center gap-1 border border-[#ef4444] px-2.5 py-1 text-xs font-semibold text-[#ef4444] hover:bg-[color-mix(in_srgb,#ef4444_15%,transparent)] disabled:opacity-50"
                >
                  <Plug size={14} /> Cut a wire
                </button>
              )}
            </div>
          </div>
          <BusDiagram
            withBus={withBus}
            gear={gearName(ctx.current)}
            speed={Math.round(speed)}
            counter={counter}
            state={unplugged ? "unplugged" : scrambled !== null ? "scrambled" : "ok"}
            wreck={wreck}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={note.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`border p-3 ${toneStyle[note.tone]}`}
              role="status"
              aria-live="polite"
            >
              <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-ink-2 uppercase">What the controller did</p>
              <p className="mt-1 text-sm leading-snug">{note.text}</p>
              {note.rule && <p className="mt-1 font-mono text-[0.7rem] text-ink-2">requirement {note.rule}</p>}
            </motion.div>
          </AnimatePresence>

          <div className={`p-3 ${card}`}>
            <p className="flex items-center justify-between text-[0.65rem] font-semibold tracking-[0.14em] text-ink-2 uppercase">
              <span>Message on the bus</span>
              <span className="font-mono tracking-normal normal-case">0x{CAN_ID_GEAR_STATUS.toString(16).toUpperCase()}</span>
            </p>
            <div className="mt-1.5 grid grid-cols-8 gap-0.5">
              {received.map((b, i) => {
                const hit = scrambled !== null && i === 1;
                const labels = ["gear", "spd", "spd", "thr", "flt", "--", "cnt", "sum"];
                return (
                  <div key={i} className="text-center">
                    <div
                      className="border py-1 font-mono text-xs tabular-nums transition-colors"
                      style={{
                        borderColor: hit ? "#ef4444" : i >= 6 ? "var(--accent)" : "var(--rule-strong)",
                        background: hit ? "color-mix(in srgb, #ef4444 20%, transparent)" : "transparent",
                        opacity: unplugged || !withBus ? 0.35 : 1,
                      }}
                    >
                      {b.toString(16).toUpperCase().padStart(2, "0")}
                    </div>
                    <div className="mt-0.5 text-[0.55rem] text-ink-2">{labels[i]}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: rxState === "ok" && rxOk && withBus ? "#22c55e" : "#ef4444" }} aria-hidden />
                {!withBus
                  ? "no bus, no checks"
                  : rxState === "timeout"
                    ? "fail-safe, no messages"
                    : rxState === "checksum" || !rxOk
                      ? "rejected a damaged frame"
                      : "checksum OK"}
              </span>
              <button
                type="button"
                onClick={scramble}
                disabled={unplugged || scrambled !== null || !withBus}
                className="flex items-center gap-1 border border-rule-strong px-2 py-1 text-xs hover:border-accent disabled:opacity-40"
              >
                <Shuffle size={13} /> Scramble a byte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
