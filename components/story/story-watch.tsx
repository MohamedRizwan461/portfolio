"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowClockwise, ArrowRight, Pause, Play } from "@phosphor-icons/react/dist/ssr";
import { beats, storyLines } from "@/lib/story";
import { useAccent } from "./lab";

const W = 1600;
const H = 900;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** each line gets time to be read: longer lines stay longer */
const timeline = (() => {
  let t = 0;
  const lines = storyLines.map((l) => {
    const d = clamp(2.2 + l.text.length * 0.045, 2.8, 6.5);
    const item = { ...l, start: t, dur: d };
    t += d;
    return item;
  });
  const beatSpans = beats.map((b, bi) => {
    const ls = lines.filter((l) => l.bi === bi);
    return { beat: b, start: ls[0].start, end: ls[ls.length - 1].start + ls[ls.length - 1].dur };
  });
  return { lines, beatSpans, total: t };
})();

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* ------------------------------------------------------------------ scenes */

function Helix({ u, t, accent }: { u: number; t: number; accent: string }) {
  const xs = Array.from({ length: 121 }, (_, i) => 180 + i * 10.5);
  const y = (x: number, ph: number) => 450 + Math.sin(x * 0.011 + t * 1.3 + ph) * 170;
  const reveal = ease(u * 3);
  return (
    <g>
      <defs>
        <clipPath id="helix-clip">
          <rect x={0} y={0} width={180 + 1270 * reveal} height={H} />
        </clipPath>
      </defs>
      <g clipPath="url(#helix-clip)">
        {xs.filter((_, i) => i % 3 === 0).map((x) => {
          const d = Math.cos(x * 0.011 + t * 1.3);
          return <line key={x} x1={x} x2={x} y1={y(x, 0)} y2={y(x, Math.PI)} stroke="#9fb3c8" strokeWidth={3} opacity={0.15 + Math.abs(d) * 0.35} />;
        })}
        <polyline points={xs.map((x) => `${x},${y(x, 0)}`).join(" ")} fill="none" stroke={accent} strokeWidth={7} strokeLinecap="round" />
        <polyline points={xs.map((x) => `${x},${y(x, Math.PI)}`).join(" ")} fill="none" stroke="#e6edf3" strokeWidth={7} strokeLinecap="round" opacity={0.85} />
      </g>
    </g>
  );
}

function Circuit({ u, t, accent }: { u: number; t: number; accent: string }) {
  const traces = useMemo(() => {
    const out: string[] = [];
    for (let s = 0; s < 4; s++)
      for (let k = 0; k < 5; k++) {
        const o = -80 + k * 40;
        const pts =
          s === 0
            ? [[910, 450 + o], [1010 + k * 30, 450 + o], [1080 + k * 30, 450 + o * 2.4], [1500, 450 + o * 2.4]]
            : s === 1
              ? [[690, 450 + o], [590 - k * 30, 450 + o], [520 - k * 30, 450 + o * 2.4], [100, 450 + o * 2.4]]
              : s === 2
                ? [[800 + o, 340], [800 + o, 260 - k * 20], [800 + o * 3, 190 - k * 20], [800 + o * 3, 40]]
                : [[800 + o, 560], [800 + o, 640 + k * 20], [800 + o * 3, 710 + k * 20], [800 + o * 3, 860]];
        out.push(`M ${pts.map((p) => p.join(" ")).join(" L ")}`);
      }
    return out;
  }, []);
  return (
    <g>
      {traces.map((d, i) => {
        const r = ease(u * 2.4 - i * 0.03);
        return (
          <g key={i}>
            <path d={d} pathLength={1} fill="none" stroke="#b39462" strokeWidth={4} strokeDasharray="1 1" strokeDashoffset={1 - r} opacity={0.75} />
            <path d={d} pathLength={1} fill="none" stroke={accent} strokeWidth={6} strokeLinecap="round" strokeDasharray="0.04 0.96" strokeDashoffset={-((t * 0.35 + i * 0.13) % 1)} opacity={r} />
          </g>
        );
      })}
      <rect x={690} y={340} width={220} height={220} rx={10} fill="#0b0e13" stroke="#3a414b" strokeWidth={3} />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} fill="#9aa4ae">
          <rect x={705 + i * 20} y={326} width={8} height={14} />
          <rect x={705 + i * 20} y={560} width={8} height={14} />
          <rect x={676} y={355 + i * 20} width={14} height={8} />
          <rect x={910} y={355 + i * 20} width={14} height={8} />
        </g>
      ))}
      <text x={800} y={445} textAnchor="middle" fontSize={34} fontWeight={700} fill="#e6edf3" fontFamily="monospace">
        EEE
      </text>
      <text x={800} y={485} textAnchor="middle" fontSize={18} fill="#8b949e" fontFamily="monospace">
        KCG · CHENNAI
      </text>
    </g>
  );
}

function Knee({ u, t, accent }: { u: number; t: number; accent: string }) {
  const hip = [700, 190];
  const a1 = Math.sin(t * 2.6) * 0.32;
  const flex = Math.max(0, Math.sin(t * 2.6 + 1.2)) * 0.95;
  const knee = [hip[0] + Math.sin(a1) * 280, hip[1] + Math.cos(a1) * 280];
  const a2 = a1 - flex;
  const ankle = [knee[0] + Math.sin(a2) * 260, knee[1] + Math.cos(a2) * 260];
  const along = (p: number[], q: number[], k: number, off: number, ang: number) => [lerp(p[0], q[0], k) + Math.cos(ang) * off, lerp(p[1], q[1], k) - Math.sin(ang) * off];
  const top = along(hip, knee, 0.45, 70, a1);
  const bottom = along(knee, ankle, 0.4, 62, a2);
  const mid = [lerp(top[0], bottom[0], 0.55), lerp(top[1], bottom[1], 0.55)];
  const patents = ease((u - 0.62) * 4);
  return (
    <g>
      <line x1={300} x2={1300} y1={760} y2={760} stroke="#232c3a" strokeWidth={3} />
      <line x1={hip[0]} y1={hip[1]} x2={knee[0]} y2={knee[1]} stroke="#c9d4e0" strokeWidth={62} strokeLinecap="round" opacity={0.9} />
      <line x1={knee[0]} y1={knee[1]} x2={ankle[0]} y2={ankle[1]} stroke="#c9d4e0" strokeWidth={46} strokeLinecap="round" opacity={0.9} />
      <line x1={ankle[0] - 10} y1={ankle[1] + 20} x2={ankle[0] + 90} y2={ankle[1] + 26} stroke="#c9d4e0" strokeWidth={30} strokeLinecap="round" opacity={0.9} />
      {/* braces */}
      {[0.3, 0.7].map((k) => {
        const p = along(hip, knee, k, 0, a1);
        return <line key={k} x1={p[0] - Math.cos(a1) * 44} y1={p[1] + Math.sin(a1) * 44} x2={p[0] + Math.cos(a1) * 44} y2={p[1] - Math.sin(a1) * 44} stroke={accent} strokeWidth={10} strokeLinecap="round" />;
      })}
      {[0.35, 0.7].map((k) => {
        const p = along(knee, ankle, k, 0, a2);
        return <line key={k} x1={p[0] - Math.cos(a2) * 36} y1={p[1] + Math.sin(a2) * 36} x2={p[0] + Math.cos(a2) * 36} y2={p[1] - Math.sin(a2) * 36} stroke={accent} strokeWidth={10} strokeLinecap="round" />;
      })}
      {/* the pneumatic cylinder */}
      <line x1={top[0]} y1={top[1]} x2={mid[0]} y2={mid[1]} stroke="#e6edf3" strokeWidth={22} strokeLinecap="round" />
      <line x1={mid[0]} y1={mid[1]} x2={bottom[0]} y2={bottom[1]} stroke={accent} strokeWidth={7} strokeLinecap="round" />
      <circle cx={knee[0]} cy={knee[1]} r={24} fill="#0b0e13" stroke={accent} strokeWidth={6} />
      <text x={top[0] + 40} y={top[1] - 10} fontSize={22} fill="#8b949e" fontFamily="monospace">
        {flex > 0.4 ? "GAIT PHASE · SWING" : "GAIT PHASE · STANCE"}
      </text>
      {/* three patent applications stamp in */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${1080 + i * 110} ${260 + i * 26}) rotate(${-6 + i * 5})`} opacity={clamp(patents * 3 - i)}>
          <rect x={0} y={0} width={150} height={196} fill="#e9edf2" />
          {[0, 1, 2, 3, 4].map((l) => (
            <rect key={l} x={18} y={30 + l * 22} width={l === 0 ? 90 : 114} height={6} fill="#b8c1cc" />
          ))}
          <rect x={30} y={140} width={92} height={34} fill="none" stroke={accent} strokeWidth={4} />
          <text x={76} y={164} textAnchor="middle" fontSize={20} fontWeight={700} fill={accent} fontFamily="monospace">
            FILED
          </text>
        </g>
      ))}
    </g>
  );
}

function Recognition({ u, accent }: { u: number; accent: string }) {
  const stops = [
    { x: 260, label: "Smart India", sub: "Hackathon" },
    { x: 620, label: "IIT PALS", sub: "Winner" },
    { x: 980, label: "YESIST12", sub: "Prelims won" },
    { x: 1340, label: "Egypt", sub: "Finalist" },
  ];
  const p = ease(u * 1.3);
  const head = lerp(260, 1340, p);
  return (
    <g>
      <line x1={260} x2={1340} y1={520} y2={520} stroke="#232c3a" strokeWidth={6} strokeLinecap="round" />
      <line x1={260} x2={head} y1={520} y2={520} stroke={accent} strokeWidth={6} strokeLinecap="round" />
      {stops.map((s, i) => {
        const on = head >= s.x - 2;
        return (
          <g key={s.label}>
            <circle cx={s.x} cy={520} r={on ? 20 : 12} fill={on ? accent : "#1a1f27"} stroke={on ? "#e6edf3" : "#3a414b"} strokeWidth={3} />
            <text x={s.x} y={470} textAnchor="middle" fontSize={34} fill={on ? "#e6edf3" : "#5b6470"} fontFamily="sans-serif">
              {s.label}
            </text>
            <text x={s.x} y={580} textAnchor="middle" fontSize={20} fill={on ? accent : "#3a414b"} fontFamily="monospace">
              {s.sub.toUpperCase()}
            </text>
            {i === 3 && on && (
              <g transform={`translate(${s.x} 300)`} opacity={ease((u - 0.72) * 5)}>
                <path d="M -60 -70 L 60 -70 L 50 -10 Q 0 30 -50 -10 Z" fill="none" stroke={accent} strokeWidth={8} />
                <path d="M -60 -60 Q -100 -60 -90 -30 Q -80 -10 -52 -14" fill="none" stroke={accent} strokeWidth={6} />
                <path d="M 60 -60 Q 100 -60 90 -30 Q 80 -10 52 -14" fill="none" stroke={accent} strokeWidth={6} />
                <line x1={0} y1={20} x2={0} y2={50} stroke={accent} strokeWidth={8} />
                <line x1={-34} y1={56} x2={34} y2={56} stroke={accent} strokeWidth={10} strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

function Pivot({ u, t, accent }: { u: number; t: number; accent: string }) {
  const flight = clamp(u / 0.33);
  const fork = clamp((u - 0.33) / 0.22);
  const arena = clamp((u - 0.55) / 0.45);
  const arc = (k: number) => [lerp(260, 1340, k), 560 - Math.sin(k * Math.PI) * 330];
  const plane = arc(ease(flight));
  // the rover's path around the bottle
  const path = (k: number) => {
    const x = lerp(360, 1240, k);
    const y = 560 - Math.sin(clamp((k - 0.25) / 0.5) * Math.PI) * 190;
    return [x, y];
  };
  const rk = ease(arena * 1.2);
  const rp = path(rk);
  const rp2 = path(Math.min(1, rk + 0.01));
  const heading = (Math.atan2(rp2[1] - rp[1], rp2[0] - rp[0]) * 180) / Math.PI;
  return (
    <g>
      <g opacity={1 - clamp((u - 0.28) * 10)}>
        <path d={`M 260 560 Q 800 -100 1340 560`} fill="none" stroke="#3a414b" strokeWidth={3} strokeDasharray="10 12" />
        <circle cx={260} cy={560} r={14} fill={accent} />
        <circle cx={1340} cy={560} r={14} fill="#e6edf3" />
        <text x={260} y={620} textAnchor="middle" fontSize={30} fill="#e6edf3" fontFamily="sans-serif">
          Chennai
        </text>
        <text x={1340} y={620} textAnchor="middle" fontSize={30} fill="#e6edf3" fontFamily="sans-serif">
          Chicago
        </text>
        <g transform={`translate(${plane[0]} ${plane[1]}) rotate(${lerp(-40, 40, flight)})`}>
          <path d="M -40 0 L 34 -4 Q 46 -2 46 3 Q 46 7 34 7 L -40 5 Z" fill="#e6edf3" />
          <path d="M -4 2 L -22 28 L -12 28 L 12 3 Z" fill="#9fb3c8" />
          <path d="M -4 0 L -18 -22 L -10 -22 L 10 -1 Z" fill="#9fb3c8" />
        </g>
      </g>
      <g opacity={fork * (1 - clamp((u - 0.52) * 12))}>
        <path d="M 800 800 L 800 520" stroke="#3a414b" strokeWidth={40} />
        <path d="M 800 540 Q 800 400 520 260" fill="none" stroke="#2a3038" strokeWidth={34} />
        <path d="M 800 540 Q 800 400 1080 260" fill="none" stroke={accent} strokeWidth={34} opacity={0.85} />
        <text x={470} y={220} textAnchor="middle" fontSize={40} fill="#5b6470" fontFamily="sans-serif" textDecoration="line-through">
          MS EEE
        </text>
        <text x={1130} y={220} textAnchor="middle" fontSize={40} fill="#e6edf3" fontFamily="sans-serif">
          MS CS
        </text>
      </g>
      <g opacity={arena}>
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={300 + i * 83} x2={300 + i * 83} y1={250} y2={760} stroke="#161c25" strokeWidth={2} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1={300} x2={1300} y1={250 + i * 85} y2={250 + i * 85} stroke="#161c25" strokeWidth={2} />
        ))}
        <path d={`M ${Array.from({ length: 41 }, (_, i) => path(i / 40).join(" ")).join(" L ")}`} fill="none" stroke="#3a414b" strokeWidth={3} strokeDasharray="8 10" />
        <circle cx={800} cy={560} r={46} fill="#0b0e13" stroke="#9fb3c8" strokeWidth={5} />
        <text x={800} y={640} textAnchor="middle" fontSize={20} fill="#8b949e" fontFamily="monospace">
          OBSTACLE
        </text>
        <circle cx={1240} cy={560} r={40} fill="none" stroke={accent} strokeWidth={6} />
        <circle cx={1240} cy={560} r={16} fill={accent} opacity={0.6 + Math.sin(t * 5) * 0.3} />
        <g transform={`translate(${rp[0]} ${rp[1]}) rotate(${heading})`}>
          {[-0.5, -0.25, 0, 0.25, 0.5].map((a) => (
            <line key={a} x1={0} y1={0} x2={Math.cos(a) * 190} y2={Math.sin(a) * 190} stroke={accent} strokeWidth={2} opacity={0.35} />
          ))}
          <rect x={-46} y={-34} width={92} height={68} rx={10} fill="#e6edf3" />
          <rect x={-40} y={-44} width={30} height={14} rx={4} fill="#1a1f27" />
          <rect x={10} y={-44} width={30} height={14} rx={4} fill="#1a1f27" />
          <rect x={-40} y={30} width={30} height={14} rx={4} fill="#1a1f27" />
          <rect x={10} y={30} width={30} height={14} rx={4} fill="#1a1f27" />
          <circle r={14} fill="#1a1f27" />
        </g>
        <text x={300} y={225} fontSize={22} fill="#8b949e" fontFamily="monospace">
          Q-LEARNING · ON THE MICROCONTROLLER
        </text>
      </g>
    </g>
  );
}

function Vehicles({ u, t, accent }: { u: number; t: number; accent: string }) {
  const k = ease(u * 1.15);
  const mph = Math.round(lerp(25, 75, k));
  const ttc = lerp(2.1, 1.3, k).toFixed(1);
  const gap = lerp(560, 330, k);
  const brake = u > 0.72 && Math.sin(t * 14) > 0;
  const laneShift = (t * lerp(200, 700, k)) % 120;
  const ego = 300;
  const lead = ego + gap + 220;
  const carShape = (x: number, body: string, tail: boolean) => (
    <g transform={`translate(${x} 600)`}>
      <path d="M 0 -20 Q -2 -44 22 -54 Q 50 -84 92 -84 L 124 -84 Q 150 -82 166 -58 Q 196 -54 200 -34 Q 202 -14 188 -10 L 6 -10 Q -4 -10 0 -20 Z" fill={body} />
      <path d="M 30 -58 Q 52 -78 92 -78 L 120 -78 Q 142 -76 154 -58 Z" fill="#0b1118" />
      <circle cx={46} cy={-8} r={22} fill="#0b0e13" />
      <circle cx={156} cy={-8} r={22} fill="#0b0e13" />
      {tail && <rect x={-2} y={-44} width={10} height={10} rx={2} fill={brake ? "#ff2d2d" : "#7a1d1d"} />}
    </g>
  );
  return (
    <g>
      <rect x={0} y={610} width={W} height={290} fill="#0a0d12" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={i * 120 - laneShift} y={700} width={64} height={8} fill="#3a414b" />
      ))}
      {carShape(lead, "#5b6470", true)}
      {carShape(ego, "#e6edf3", false)}
      {[0, 1, 2].map((i) => {
        const p = (t * 1.2 + i / 3) % 1;
        return <path key={i} d={`M ${ego + 210 + p * (gap - 20)} 500 Q ${ego + 240 + p * (gap - 20)} 560 ${ego + 210 + p * (gap - 20)} 620`} fill="none" stroke={accent} strokeWidth={5} opacity={1 - p} />;
      })}
      <g transform="translate(150 150)">
        <text x={0} y={0} fontSize={22} fill="#8b949e" fontFamily="monospace">
          SPEED
        </text>
        <text x={0} y={70} fontSize={76} fill="#e6edf3" fontFamily="monospace">
          {mph}
          <tspan fontSize={30} fill="#8b949e">
            {" "}
            mph
          </tspan>
        </text>
        <text x={420} y={0} fontSize={22} fill="#8b949e" fontFamily="monospace">
          TIME TO COLLISION
        </text>
        <text x={420} y={70} fontSize={76} fill={brake ? "#ff4d4f" : accent} fontFamily="monospace">
          {ttc}
          <tspan fontSize={30} fill="#8b949e">
            {" "}
            s
          </tspan>
        </text>
        {brake && (
          <text x={900} y={60} fontSize={46} fontWeight={700} fill="#ff4d4f" fontFamily="monospace">
            AEB
          </text>
        )}
      </g>
    </g>
  );
}

function Next({ u, accent }: { u: number; accent: string }) {
  return (
    <g opacity={ease(u * 3)}>
      <circle cx={800} cy={420} r={lerp(80, 300, ease(u * 1.5))} fill={accent} opacity={0.08} />
      <circle cx={800} cy={420} r={lerp(40, 180, ease(u * 1.5))} fill={accent} opacity={0.12} />
      <text x={800} y={400} textAnchor="middle" fontSize={78} fontWeight={300} fill="#eef1f5" fontFamily="sans-serif" letterSpacing={-2}>
        Let&apos;s build something
      </text>
      <text x={800} y={490} textAnchor="middle" fontSize={78} fontWeight={300} fill={accent} fontFamily="sans-serif" letterSpacing={-2}>
        that moves.
      </text>
      <text x={800} y={580} textAnchor="middle" fontSize={24} fill="#8b949e" fontFamily="monospace" letterSpacing={6}>
        MOHAMED RIZWAN AMEER JOHN · CHICAGO
      </text>
    </g>
  );
}

/**
 * Option D: a short animated film with chapters and big subtitles. Every frame is
 * computed from the playhead, so scrubbing and chapter jumps are exact.
 */
export function StoryWatch() {
  const reduce = useReducedMotion() ?? false;
  const accent = useAccent();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const bar = useRef<HTMLDivElement>(null);
  const total = timeline.total;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((v) => {
        const n = v + dt;
        if (n >= total) {
          setPlaying(false);
          return total;
        }
        return n;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => (t >= total ? (setT(0), true) : !p));
      }
      if (e.key === "ArrowRight") setT((v) => Math.min(total, v + 5));
      if (e.key === "ArrowLeft") setT((v) => Math.max(0, v - 5));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [t, total]);

  const line = timeline.lines.find((l) => t >= l.start && t < l.start + l.dur) ?? timeline.lines[timeline.lines.length - 1];
  const span = timeline.beatSpans[line.bi];
  const u = clamp((t - span.start) / (span.end - span.start));
  const sceneT = reduce ? 0 : t;
  const ended = t >= total;

  const seek = (clientX: number) => {
    const r = bar.current?.getBoundingClientRect();
    if (!r) return;
    setT(clamp((clientX - r.left) / r.width) * total);
  };

  const scene = (() => {
    switch (span.beat.id) {
      case "biology":
        return <Helix u={u} t={sceneT} accent={accent} />;
      case "electronics":
        return <Circuit u={u} t={sceneT} accent={accent} />;
      case "assistive":
        return <Knee u={u} t={sceneT} accent={accent} />;
      case "recognition":
        return <Recognition u={u} accent={accent} />;
      case "pivot":
        return <Pivot u={u} t={sceneT} accent={accent} />;
      case "vehicles":
        return <Vehicles u={u} t={sceneT} accent={accent} />;
      default:
        return <Next u={u} accent={accent} />;
    }
  })();

  return (
    <div className="mx-auto flex h-[100dvh] max-w-6xl flex-col px-4 pt-36 pb-5 sm:px-8 sm:pt-40">
      <div className="mx-auto w-full max-w-[calc((100dvh-17rem)*16/9)]">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-rule bg-[#05070b] shadow-[0_60px_140px_-50px_rgba(0,0,0,0.95)]" onClick={() => setPlaying((p) => !p)}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
            <AnimatePresence mode="wait">
              <motion.g key={span.beat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                {scene}
              </motion.g>
            </AnimatePresence>
          </svg>

          <p className="eyebrow absolute top-4 left-5 !text-white/55 sm:top-6 sm:left-7">
            <span style={{ color: accent }}>{span.beat.n}</span> <span className="mx-2 opacity-40">/</span> {span.beat.label}
          </p>

          {/* subtitles */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pt-16 pb-5 text-center sm:px-12 sm:pb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${line.bi}-${line.li}`}
                className="mx-auto max-w-[40ch] text-[clamp(0.95rem,2vw,1.6rem)] leading-snug font-light tracking-tight text-white"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45 }}
              >
                {line.text}
              </motion.p>
            </AnimatePresence>
          </div>

          {ended && (
            <div className="absolute inset-0 flex items-end justify-center gap-3 bg-black/30 pb-[14%]" onClick={(e) => e.stopPropagation()}>
              <Link href="/contact" className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black no-underline">
                Get in touch <ArrowRight size={14} weight="bold" />
              </Link>
              <button type="button" onClick={() => (setT(0), setPlaying(true))} className="flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm text-white">
                <ArrowClockwise size={14} weight="bold" /> Watch again
              </button>
            </div>
          )}
        </div>

        {/* controls */}
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => (ended ? (setT(0), setPlaying(true)) : setPlaying((p) => !p))}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-ground"
          >
            {playing ? <Pause size={16} weight="fill" /> : ended ? <ArrowClockwise size={16} weight="bold" /> : <Play size={16} weight="fill" />}
          </button>
          <div
            ref={bar}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(total)}
            aria-valuenow={Math.round(t)}
            tabIndex={0}
            onPointerDown={(e) => {
              seek(e.clientX);
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={(e) => e.buttons === 1 && seek(e.clientX)}
            className="relative flex h-8 flex-1 cursor-pointer items-center"
          >
            <div className="flex h-1.5 w-full gap-1">
              {timeline.beatSpans.map((s) => {
                const fill = clamp((t - s.start) / (s.end - s.start));
                return (
                  <div key={s.beat.id} className="relative h-full overflow-hidden rounded-full bg-white/10" style={{ flex: s.end - s.start }}>
                    <div className="absolute inset-y-0 left-0" style={{ width: `${fill * 100}%`, background: accent }} />
                  </div>
                );
              })}
            </div>
          </div>
          <span className="font-mono text-xs text-ink-2 tabular-nums">
            {fmt(t)} / {fmt(total)}
          </span>
        </div>
        <ol className="mt-2 hidden gap-1 pr-[6.75rem] pl-[3.75rem] md:flex">
          {timeline.beatSpans.map((s) => (
            <li key={s.beat.id} style={{ flex: s.end - s.start }} className="min-w-0">
              <button type="button" onClick={() => (setT(s.start), setPlaying(true))} className={`truncate font-mono text-[0.58rem] tracking-[0.16em] uppercase transition-colors ${s === span ? "text-ink" : "text-ink-2 hover:text-ink"}`}>
                {s.beat.label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
