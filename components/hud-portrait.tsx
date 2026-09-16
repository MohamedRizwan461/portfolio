"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** Approximate landmark positions, in percent of the frame. */
const LANDMARKS = [
  [36.5, 48.5], [64, 48.5], // eyes
  [50, 64], // nose tip
  [41, 75], [59, 75], // mouth corners
  [16, 52], [84, 52], // ears
  [50, 88], // chin
  [36, 42], [64, 42], // brows
];

/** Telemetry that scrolls under the portrait. Real values from real projects. */
const TELEMETRY = [
  "gait phase: SWING · cylinder armed",
  "CAN 0x18F00500 · counter 12 · checksum OK",
  "obstacle at 42 cm · policy says turn left",
  "hand landmarks: 21/21 tracked",
  "bus voltage 36.0 V · ripple < 0.5%",
  "status: open to robotics and embedded roles",
];

export function HudPortrait() {
  const reduce = useReducedMotion();
  const [line, setLine] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setLine((n) => (n + 1) % TELEMETRY.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="relative mx-auto w-full max-w-[11.5rem] select-none sm:max-w-[21rem]">
      {/* the glow the subject stands in */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 scale-125 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(77,141,255,0.35),rgba(39,224,196,0.12)_48%,transparent_72%)] blur-xl"
      />

      <div className="relative overflow-hidden border border-rule bg-[#070b12]">
        {/* subject */}
        <Image
          src="/images/riz/headshot-cut.png"
          width={820}
          height={900}
          alt="Mohamed Rizwan Ameer John"
          priority
          sizes="(min-width: 1024px) 340px, 60vw"
          className="relative z-10 h-auto w-full object-contain contrast-[1.05] saturate-[0.85]"
        />

        {/* cool cast so the portrait belongs to the instrument, not to a passport office */}
        <span
          aria-hidden
          className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(77,141,255,0.22),rgba(39,224,196,0.14))] mix-blend-color"
        />

        {/* scan lines */}
        <span
          aria-hidden
          className="absolute inset-0 z-20 opacity-[0.18] [background-image:repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_3px)]"
        />

        {/* detection frame */}
        <span aria-hidden className="absolute inset-[14%_18%_10%_18%] z-30 border border-accent/70">
          {[
            "-top-px -left-px border-t-2 border-l-2",
            "-top-px -right-px border-t-2 border-r-2",
            "-bottom-px -left-px border-b-2 border-l-2",
            "-bottom-px -right-px border-b-2 border-r-2",
          ].map((pos) => (
            <span key={pos} className={`absolute h-3 w-3 border-accent ${pos}`} />
          ))}
          <span className="absolute -top-6 left-0 font-mono text-[0.6rem] tracking-wider text-accent">
            SUBJECT 01
          </span>
        </span>

        {/* landmarks, the way his own pipeline draws them */}
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 z-30 h-full w-full">
          {LANDMARKS.map(([x, y], i) => (
            <motion.circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={0.7}
              className="fill-accent-2"
              initial={reduce ? false : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 2.4, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          <path
            d="M36.5 48.5 L50 64 L64 48.5 M41 75 L50 77 L59 75 M50 64 L50 88"
            className="stroke-accent-2/40"
            strokeWidth={0.4}
            fill="none"
          />
        </svg>

        {/* the beam that sweeps the subject */}
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute inset-x-0 z-30 h-16 bg-[linear-gradient(180deg,transparent,rgba(39,224,196,0.35),transparent)]"
            animate={{ top: ["-10%", "100%"] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "linear", repeatDelay: 1.6 }}
          />
        )}

        {/* readout */}
        <div className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-between gap-2 border-t border-rule bg-[#060a10]/85 px-3 py-2 font-mono text-[0.6rem] tracking-wide text-ink-2 backdrop-blur">
          <span className="text-accent-2">DETECTED: 1 ENGINEER</span>
          <span className="num hidden sm:inline">CONF 0.97</span>
        </div>
      </div>

      {/* his own Maya particle render, sitting under the portrait like a second channel */}
      <div className="mt-3 hidden grid-cols-[1fr_auto] items-stretch gap-3 sm:grid">
        <div className="relative overflow-hidden border border-rule bg-black">
          <img
            src="/video/face-holo.webp"
            alt="Particle hologram of a face, rendered in Maya"
            width={520}
            height={292}
            loading="lazy"
            className="h-full w-full object-cover opacity-90"
          />
          <span className="absolute bottom-1 left-2 font-mono text-[0.55rem] tracking-wider text-accent-2/90">
            CH 02 · MAYA PARTICLE RENDER
          </span>
        </div>
        <div className="flex w-24 flex-col justify-between border border-rule px-2 py-2 font-mono text-[0.55rem] text-ink-2">
          <span className="text-accent">SYS</span>
          <span className="num">3 patents</span>
          <span className="num">8 builds</span>
          <span className="text-accent-2">ONLINE</span>
        </div>
      </div>

      {/* telemetry ticker */}
      <p className="mt-3 hidden truncate border border-rule bg-[#070b12]/70 px-3 py-2 font-mono text-[0.6rem] text-ink-2 sm:block">
        <span className="mr-2 text-accent">&gt;</span>
        <motion.span
          key={line}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-block"
        >
          {TELEMETRY[line]}
        </motion.span>
      </p>
    </div>
  );
}
