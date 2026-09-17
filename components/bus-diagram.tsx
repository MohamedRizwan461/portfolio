"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const NODES = [
  { id: "engine", label: "Engine", x: 60 },
  { id: "shift", label: "Shift ECU", x: 180 },
  { id: "gearbox", label: "Gearbox", x: 300 },
  { id: "brakes", label: "Brakes", x: 420 },
  { id: "dash", label: "Dashboard", x: 540 },
];

type Props = {
  withBus: boolean;
  gear: string;
  speed: number;
  counter: number;
  state: "ok" | "scrambled" | "unplugged";
  wreck?: "none" | "cut" | "crunch";
};

/**
 * Why a car uses CAN, in one picture. Without it every controller is wired to
 * every other; with it they share two wires and every message is checked.
 */
export function BusDiagram({ withBus, gear, speed, counter, state, wreck = "none" }: Props) {
  const reduce = useReducedMotion() ?? false;
  const TOP = 36;
  const BOX_W = 92;
  const BOX_H = 44;
  const BUS_Y = 128;

  // every pair of controllers, for the "without" picture
  const pairs: [number, number][] = [];
  for (let i = 0; i < NODES.length; i++) for (let j = i + 1; j < NODES.length; j++) pairs.push([i, j]);

  const bad = state !== "ok";
  const busColor = state === "unplugged" ? "var(--rule-strong)" : "var(--accent)";

  return (
    <div className="border border-rule bg-[var(--surface-2)] p-3">
      <svg viewBox="0 0 600 170" className="h-auto w-full" role="img"
        aria-label={withBus
          ? "Five car controllers sharing a two-wire CAN bus, with a gear status message travelling from the shift controller to the gearbox"
          : "Five car controllers each wired directly to every other controller, ten separate wiring bundles"}>
        {withBus ? (
          <>
            <line x1="20" y1={BUS_Y - 6} x2="580" y2={BUS_Y - 6} stroke={busColor} strokeWidth="4" />
            <line x1="20" y1={BUS_Y + 6} x2="580" y2={BUS_Y + 6} stroke="var(--ink-2)" strokeWidth="4" opacity={state === "unplugged" ? 0.35 : 1} />
            <text x="580" y={BUS_Y + 30} textAnchor="end" fontSize="11" fontFamily="monospace" fill="var(--ink-2)">CAN high / CAN low</text>
            {NODES.map((n) => (
              <line key={n.id} x1={n.x} y1={TOP + BOX_H} x2={n.x} y2={BUS_Y - 6} stroke="var(--ink-2)" strokeWidth="2" />
            ))}
            {state === "unplugged" && (
              <g transform="translate(240 128)">
                <line x1="-12" y1="-14" x2="12" y2="14" stroke="#ef4444" strokeWidth="4" />
                <line x1="12" y1="-14" x2="-12" y2="14" stroke="#ef4444" strokeWidth="4" />
              </g>
            )}
            {/* the message travelling from the shift ECU to the gearbox */}
            <AnimatePresence>
              {state !== "unplugged" && (
                <motion.g
                  key={Math.floor(counter / 3)}
                  initial={{ x: 180, opacity: 0 }}
                  animate={reduce ? { x: 300, opacity: 1 } : { x: [180, 300, 300], opacity: [0, 1, 0] }}
                  transition={reduce ? { duration: 0 } : { duration: 0.9, times: [0, 0.75, 1], ease: "easeInOut" }}
                >
                  <rect x="-40" y={BUS_Y - 22} width="80" height="18" rx="3"
                    fill={state === "scrambled" ? "#ef4444" : "var(--accent)"} />
                  <text x="0" y={BUS_Y - 9} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="monospace" fill="var(--accent-ink)">
                    {state === "scrambled" ? "?? CORRUPT" : `${gear} · ${speed} km/h`}
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            {pairs.map(([a, b], i) => {
              const xa = NODES[a].x;
              const xb = NODES[b].x;
              const dip = 40 + ((i * 17) % 60);
              // the shift ECU to gearbox wire is the one that snaps
              const snapped = wreck !== "none" && a === 1 && b === 2;
              return (
                <path key={`${a}${b}`} d={`M${xa} ${TOP + BOX_H} C${xa} ${TOP + BOX_H + dip} ${xb} ${TOP + BOX_H + dip} ${xb} ${TOP + BOX_H}`}
                  fill="none" stroke={snapped ? "#ef4444" : ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"][i % 5]}
                  strokeWidth={snapped ? 4 : 2.5} opacity={snapped ? 1 : 0.8}
                  strokeDasharray={snapped ? "40 14 200" : undefined} />
              );
            })}
            {wreck !== "none" && (
              <g transform="translate(240 118)">
                {Array.from({ length: 14 }, (_, i) => (
                  <motion.line key={i} x1="0" y1="0" stroke={i % 2 ? "#ffd166" : "#ff7a1a"} strokeWidth="2.5" strokeLinecap="round"
                    initial={{ x2: 0, y2: 0, opacity: 1 }}
                    animate={reduce ? { opacity: 0.8 } : { x2: Math.cos(i * 0.45) * (18 + (i % 4) * 7), y2: Math.sin(i * 0.45) * (18 + (i % 3) * 8), opacity: [1, 1, 0] }}
                    transition={{ duration: 0.5, repeat: wreck === "cut" && !reduce ? Infinity : 0, repeatDelay: 0.15, delay: i * 0.02 }} />
                ))}
                <text x="0" y="-18" textAnchor="middle" fontSize="12" fontWeight="800" fill="#ef4444">SNAP</text>
              </g>
            )}
          </>
        )}

        {NODES.map((n) => {
          const isGearbox = n.id === "gearbox";
          const alarm = (withBus && isGearbox && bad) || (!withBus && isGearbox && wreck === "crunch");
          return (
            <g key={n.id}>
              <rect x={n.x - BOX_W / 2} y={TOP} width={BOX_W} height={BOX_H} rx="6"
                fill="var(--surface)" stroke={alarm ? "#ef4444" : n.id === "shift" && withBus ? "var(--accent)" : "var(--rule-strong)"} strokeWidth={alarm ? 3 : 2} />
              <text x={n.x} y={TOP + 26} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--ink)">{n.label}</text>
              {!withBus && isGearbox && wreck !== "none" && (
                <text x={n.x} y={TOP - 8} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#ef4444">
                  {wreck === "cut" ? "still using old data..." : "DESTROYED"}
                </text>
              )}
              {withBus && isGearbox && (
                <text x={n.x} y={TOP - 8} textAnchor="middle" fontSize="11" fontFamily="monospace" fill={alarm ? "#ef4444" : "#22c55e"}>
                  {state === "unplugged" ? "TIMEOUT · fail-safe" : state === "scrambled" ? "checksum bad · ignored" : "received · checksum OK"}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-sm leading-snug text-ink">
        {withBus ? (
          <>
            <strong>With CAN:</strong> every controller shares the same two wires. Each message carries an ID, a counter and a checksum,
            so a damaged or missing message is caught instead of trusted.
          </>
        ) : (
          <>
            <strong>Without CAN:</strong> every controller needs its own wire to every other one. Five controllers already need{" "}
            {pairs.length} bundles; a real car has 70+. Heavy, expensive, and a broken wire just silently loses data.
          </>
        )}
      </p>
    </div>
  );
}
