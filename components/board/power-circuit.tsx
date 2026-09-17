"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { playPowerOn, playTick } from "@/lib/sound";

const BATTERY_POS = { x: 96, y: 60 };
const SOCKET = { x: 250, y: 60 };
const PLUG_START = { x: 170, y: 168 };
const SNAP = 34;

/**
 * The way in: plug the loose wire into the socket, then flip the switch.
 * Current runs round the loop, the LED lights, and the board powers up.
 */
export function PowerCircuit({ onPowered }: { onPowered: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const svg = useRef<SVGSVGElement>(null);
  const plugRef = useRef<SVGGElement>(null);
  const [plug, setPlug] = useState(PLUG_START);
  const [dragging, setDragging] = useState(false);
  const [connected, setConnected] = useState(false);
  const [closed, setClosed] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const toSvg = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 520, y: ((e.clientY - r.top) / r.height) * 230 };
  };

  const connect = useCallback(() => {
    if (connected) return;
    setPlug(SOCKET);
    setConnected(true);
    setDragging(false);
    playTick();
  }, [connected]);

  const flip = useCallback(() => {
    if (!connected || closed) return;
    setClosed(true);
    playPowerOn();
    setTimeout(onPowered, reduce ? 150 : 1300);
  }, [connected, closed, onPowered, reduce]);

  const onMove = (e: PointerEvent) => {
    if (!dragging || connected) return;
    const p = toSvg(e);
    setPlug({ x: Math.max(20, Math.min(500, p.x)), y: Math.max(20, Math.min(210, p.y)) });
    if (Math.hypot(p.x - SOCKET.x, p.y - SOCKET.y) < SNAP) connect();
  };

  const keyAct = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  // the loose lead from the battery to wherever the plug is
  const lead = `M${BATTERY_POS.x} ${BATTERY_POS.y} C${BATTERY_POS.x + 70} ${BATTERY_POS.y} ${plug.x - 60} ${plug.y + 40} ${plug.x - 16} ${plug.y}`;
  const live = connected && closed;
  const loop = "M96 60 H250 M270 60 H330 M380 60 H440 V176 H60 V96";

  return (
    <div className="w-full max-w-xl select-none">
      <svg
        ref={svg}
        viewBox="0 0 520 230"
        className="h-auto w-full touch-none"
        onPointerMove={onMove}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
        role="group"
        aria-label="A circuit: a battery, a loose wire, a socket, a switch and an LED"
      >
        {/* return path and switch-to-LED wiring */}
        <path d="M270 60 H330 M380 60 H440 V176 H60 V96" fill="none" stroke="var(--ink-2)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        {live && (
          <path d={loop} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" className={reduce ? "" : "pc-current"} />
        )}

        {/* battery */}
        <g transform="translate(40 40)">
          <rect x="0" y="0" width="56" height="60" rx="6" fill="var(--surface-2)" stroke="var(--rule-strong)" strokeWidth="2" />
          <rect x="18" y="-8" width="20" height="8" rx="2" fill="var(--rule-strong)" />
          <text x="28" y="26" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">+</text>
          <text x="28" y="50" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="var(--ink-2)">3V3</text>
        </g>

        {/* socket */}
        <g transform={`translate(${SOCKET.x} ${SOCKET.y})`}>
          <rect x="-4" y="-16" width="24" height="32" rx="4" fill="var(--surface)" stroke={connected ? "var(--accent)" : "var(--rule-strong)"} strokeWidth="2" />
          <circle cx="8" cy="0" r="5" fill="var(--ground)" />
          {!connected && hint && !reduce && (
            <circle cx="8" cy="0" r="16" fill="none" stroke="var(--accent)" strokeWidth="2" className="pc-ping" />
          )}
        </g>

        {connected && !closed && hint && !reduce && (
          <circle cx="380" cy="30" r="10" fill="none" stroke="var(--accent)" strokeWidth="2" className="pc-ping pointer-events-none" />
        )}

        {/* switch */}
        <g
          transform="translate(330 60)"
          role="button"
          tabIndex={connected ? 0 : -1}
          aria-label="Flip the switch"
          aria-disabled={!connected}
          onClick={flip}
          onKeyDown={keyAct(flip)}
          className={connected && !closed ? "cursor-pointer outline-none" : "outline-none"}
        >
          <rect x="-8" y="-26" width="66" height="52" fill="transparent" />
          <circle cx="0" cy="0" r="6" fill="var(--ink)" />
          <circle cx="50" cy="0" r="6" fill="var(--ink)" />
          <line
            x1="0"
            y1="0"
            x2="50"
            y2="0"
            stroke={closed ? "var(--accent)" : "var(--ink)"}
            strokeWidth="6"
            strokeLinecap="round"
            style={{
              transformOrigin: "0px 0px",
              transform: closed ? "rotate(0deg)" : "rotate(-38deg)",
              transition: reduce ? "none" : "transform 220ms cubic-bezier(0.3, 1.6, 0.5, 1)",
            }}
          />
        </g>

        {/* LED */}
        <g transform="translate(440 118)">
          {live && <circle r="34" fill="var(--accent)" opacity="0.28" className={reduce ? "" : "pc-glow"} />}
          <path d="M-14 -16 H14 V6 A14 14 0 0 1 -14 6 Z" fill={live ? "var(--accent)" : "var(--surface)"} stroke="var(--rule-strong)" strokeWidth="2" />
          <text x="0" y="36" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="var(--ink-2)">LED</text>
        </g>

        {/* the loose lead and its plug */}
        <path d={lead} fill="none" stroke={live ? "var(--accent)" : "#e25b2c"} strokeWidth="5" strokeLinecap="round" />
        <g
          ref={plugRef}
          transform={`translate(${plug.x} ${plug.y})`}
          role="button"
          tabIndex={connected ? -1 : 0}
          aria-label="Plug the wire into the socket"
          onPointerDown={(e) => {
            if (connected) return;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setDragging(true);
          }}
          onClick={() => !dragging && connect()}
          onKeyDown={keyAct(connect)}
          className={connected ? "outline-none" : "cursor-grab outline-none active:cursor-grabbing"}
          style={{ transition: dragging || reduce ? "none" : "transform 260ms cubic-bezier(0.2, 1.4, 0.4, 1)" }}
        >
          <rect x="-26" y="-12" width="24" height="24" rx="4" fill="#e25b2c" />
          <rect x="-2" y="-4" width="12" height="8" rx="1" fill="#c7cdd4" />
          {!connected && <circle r="30" fill="transparent" />}
        </g>
      </svg>

      <ol className="mt-3 grid grid-cols-2 gap-2 text-left text-sm">
        <li className={`border px-3 py-2 ${connected ? "border-rule text-ink-2 line-through" : "border-accent text-ink"}`}>
          <span className="font-mono text-accent">1</span> Drag the orange wire into the socket
        </li>
        <li className={`border px-3 py-2 ${connected && !closed ? "border-accent text-ink" : "border-rule text-ink-2"} ${closed ? "line-through" : ""}`}>
          <span className="font-mono text-accent">2</span> Flip the switch
        </li>
      </ol>
      <button type="button" onClick={() => { connect(); setTimeout(() => { setClosed(true); playPowerOn(); setTimeout(onPowered, reduce ? 150 : 1300); }, 250); }} className="mt-3 text-sm text-ink-2 underline hover:text-ink">
        Skip, just power it on
      </button>
    </div>
  );
}
