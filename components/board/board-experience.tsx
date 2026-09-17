"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CaretDown,
  DownloadSimple,
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  ListBullets,
  PlayCircle,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/content";
import { MODE_STORAGE_KEY, modes, type ModeId } from "@/lib/modes";
import { groupColor, groupLabel, stations, type Station } from "@/lib/stations";
import { BootIntro } from "./boot-intro";

const BoardScene = dynamic(() => import("./board-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-xs text-ink-2">
      <span className="animate-pulse">&gt; routing traces...</span>
    </div>
  ),
});

const EASE = [0.16, 1, 0.3, 1] as const;

function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setCompact(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return compact;
}

/** A CAN rolling counter ticking in the corner, because every good bus has one. */
function BusStatus() {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setN((v) => (v + 1) % 16), 400);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <span className="num flex items-center gap-2 border border-rule bg-ground/60 px-2.5 py-1 font-mono text-[0.65rem] tracking-wide text-ink-2 backdrop-blur">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-2" />
      </span>
      <span className="hidden sm:inline">BUS OK · 0x18F00500 ·</span> CNT {n.toString(16).toUpperCase()} · CRC OK
    </span>
  );
}

export function BoardExperience() {
  const reduce = useReducedMotion() ?? false;
  const compact = useCompact();
  const [hovered, setHovered] = useState<string | null>(null);
  const [driveTo, setDriveTo] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [panel, setPanel] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(() => new Set(["biology"]));
  const userDriven = useRef(false);
  const lastInput = useRef(0);
  const autoIndex = useRef(-1);
  const parkedAt = useRef<string | null>("biology");
  const [mode, setMode] = useState<ModeId | null>(null);
  const [intro, setIntro] = useState<"boot" | "menu" | null>(null);
  const modeConfig = modes.find((m) => m.id === mode) ?? null;
  const route = modeConfig?.route ?? stations.map((s) => s.id);

  // first visit boots up and asks who is here; returning visitors keep their mode
  useEffect(() => {
    lastInput.current = Date.now();
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(MODE_STORAGE_KEY);
    } catch {}
    const replay = new URLSearchParams(window.location.search).has("boot");
    if (saved && modes.some((m) => m.id === saved)) setMode(saved as ModeId);
    if (replay || !saved) setIntro("boot");
  }, []);

  const pick = useCallback((id: string) => {
    userDriven.current = true;
    lastInput.current = Date.now();
    setActive(id);
    // already parked there: no trip needed, just open it
    if (parkedAt.current === id) {
      setPanel(id);
      return;
    }
    setPanel(null);
    parkedAt.current = null;
    setDriveTo(id);
  }, []);

  const arrive = useCallback((id: string) => {
    parkedAt.current = id;
    setVisited((v) => new Set(v).add(id));
    if (userDriven.current) setPanel(id);
    else setActive(id);
  }, []);

  const selectMode = useCallback(
    (id: ModeId) => {
      const m = modes.find((x) => x.id === id)!;
      setMode(id);
      setIntro(null);
      try {
        window.localStorage.setItem(MODE_STORAGE_KEY, id);
      } catch {}
      autoIndex.current = 0;
      if (m.openFirst) {
        pick(m.route[0]);
      } else {
        // curious: hand the wheel to the autopilot right away
        userDriven.current = false;
        lastInput.current = 0;
        setPanel(null);
        parkedAt.current = null;
        setActive(m.route[0]);
        setDriveTo(m.route[0]);
      }
    },
    [pick],
  );

  // idle autopilot: the robot tours this visitor's route until someone takes the wheel
  useEffect(() => {
    if (reduce || intro) return;
    const id = setInterval(() => {
      const idle = Date.now() - lastInput.current;
      if (panel || idle < 9000) return;
      userDriven.current = false;
      autoIndex.current = (autoIndex.current + 1) % route.length;
      const next = route[autoIndex.current];
      parkedAt.current = null;
      setActive(next);
      setDriveTo(next);
    }, 4200);
    return () => clearInterval(id);
  }, [panel, reduce, intro, route]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (intro) return;
      if (e.key === "Escape") {
        setPanel(null);
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const current = stations.findIndex((s) => s.id === (active ?? "biology"));
      const next = (current + (e.key === "ArrowRight" ? 1 : -1) + stations.length) % stations.length;
      autoIndex.current = next;
      pick(stations[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, pick, intro]);

  const panelStation = stations.find((s) => s.id === panel) ?? null;
  const dimmed = new Set(
    modeConfig && modeConfig.highlight.length ? stations.filter((s) => !modeConfig.highlight.includes(s.id)).map((s) => s.id) : [],
  );
  const groups = Object.keys(groupLabel) as Station["group"][];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <AnimatePresence>
        {intro && (
          <BootIntro
            key={intro}
            start={intro}
            current={mode}
            onSelect={selectMode}
            onDismiss={mode ? () => setIntro(null) : undefined}
          />
        )}
      </AnimatePresence>
      {/* the board */}
      <div className="absolute inset-0 isolate z-0" onPointerDown={() => (lastInput.current = Date.now())}>
        <BoardScene
          driveTo={driveTo}
          hovered={hovered}
          active={active}
          visited={visited}
          dimmed={dimmed}
          reduce={reduce}
          compact={compact}
          onHover={setHovered}
          onPick={pick}
          onArrive={arrive}
        />
      </div>

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-5">
        <div className="pointer-events-auto flex flex-col gap-2">
          <Link href="/" className="flex items-baseline gap-2 no-underline">
            <span className="font-mono text-sm font-semibold tracking-tight">RIZ</span>
            <span className="text-sm text-ink-2">Mohamed Rizwan</span>
          </Link>
          <BusStatus />
          {modeConfig && (
            <button
              type="button"
              onClick={() => setIntro("menu")}
              className="ease flex w-fit items-center gap-1.5 border border-rule bg-ground/60 px-2.5 py-1 font-mono text-[0.65rem] tracking-wide text-ink-2 backdrop-blur hover:border-accent hover:text-accent"
            >
              MODE <span className="text-accent-2">{modeConfig.label.toUpperCase()}</span>
              <CaretDown size={10} aria-hidden />
            </button>
          )}
        </div>
        <nav aria-label="Primary" className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
          <Link
            href="/tour"
            className="ease hidden items-center gap-1.5 border border-rule bg-ground/60 px-3 py-1.5 text-xs text-ink no-underline backdrop-blur hover:border-accent hover:text-accent sm:flex"
          >
            <PlayCircle size={14} aria-hidden /> Guided tour
          </Link>
          <Link
            href="/projects"
            className="ease flex items-center gap-1.5 border border-rule bg-ground/60 px-3 py-1.5 text-xs text-ink no-underline backdrop-blur hover:border-accent hover:text-accent"
          >
            <ListBullets size={14} aria-hidden /> <span className="hidden sm:inline">All projects</span>
            <span className="sm:hidden">List</span>
          </Link>
          <a
            href={site.resumePdf}
            download
            className={`ease relative flex items-center gap-1.5 border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-accent-ink no-underline hover:border-accent-2 hover:bg-accent-2 ${
              modeConfig?.glowResume ? "shadow-[0_0_0_0_rgba(77,141,255,0.7)] motion-safe:animate-[resume-glow_2.2s_ease-out_infinite]" : ""
            }`}
          >
            <DownloadSimple size={14} aria-hidden /> Resume
          </a>
        </nav>
      </header>

      {/* identity card */}
      <motion.aside
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={compact && panel ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
        transition={{ duration: compact && panel ? 0.25 : 0.7, delay: compact && panel ? 0 : 0.3, ease: EASE }}
        aria-hidden={compact && !!panel}
        className="panel absolute bottom-3 left-3 z-30 w-[calc(100%-1.5rem)] max-w-sm p-4 sm:bottom-5 sm:left-5 sm:p-5"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border border-accent-2/60 motion-safe:animate-[spin_9s_linear_infinite] [border-style:dashed]"
            />
            <span aria-hidden className="absolute inset-1.5 rounded-full bg-[radial-gradient(circle,rgba(77,141,255,0.45),transparent_70%)]" />
            <Image
              src="/images/riz/headshot-cut.png"
              width={820}
              height={900}
              alt="Mohamed Rizwan Ameer John"
              priority
              sizes="80px"
              className="absolute inset-1 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)] rounded-full object-cover object-top"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg leading-tight font-semibold tracking-tight sm:text-xl">
              Mohamed Rizwan Ameer John
            </h1>
            <p className="mt-1 text-xs text-ink-2 sm:text-sm">Robotics and embedded systems engineer</p>
          </div>
        </div>
        <p className="mt-3 hidden text-sm text-ink-2 sm:block">
          This board is my career. Time runs left to right along the bus, every chip is something I built, and the
          little robot is the one I taught to drive.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`mailto:${site.email}`}
            className="ease flex items-center gap-1.5 border border-rule px-3 py-1.5 text-xs text-ink no-underline hover:border-accent hover:text-accent"
          >
            <EnvelopeSimple size={14} aria-hidden /> Email
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener"
            className="ease flex items-center gap-1.5 border border-rule px-3 py-1.5 text-xs text-ink no-underline hover:border-accent hover:text-accent"
          >
            <LinkedinLogo size={14} aria-hidden /> LinkedIn
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener"
            className="ease flex items-center gap-1.5 border border-rule px-3 py-1.5 text-xs text-ink no-underline hover:border-accent hover:text-accent"
          >
            <GithubLogo size={14} aria-hidden /> GitHub
          </a>
        </div>
      </motion.aside>

      {/* legend and controls hint */}
      <div className="pointer-events-none absolute right-5 bottom-5 z-20 hidden flex-col items-end gap-3 lg:flex">
        <ul className="panel pointer-events-auto flex flex-col gap-1.5 px-3 py-2.5 font-mono text-[0.65rem] text-ink-2">
          {groups.map((g) => (
            <li key={g} className="flex items-center gap-2">
              <span className="h-2 w-2" style={{ background: groupColor[g] }} />
              {groupLabel[g]}
            </li>
          ))}
        </ul>
        <p className="font-mono text-[0.65rem] tracking-wider text-ink-2">CLICK A CHIP · ← → DRIVE · DRAG TO LOOK</p>
      </div>

      {/* station list for keyboard and screen reader users */}
      <nav aria-label="Projects on the board" className="sr-only">
        <ul>
          {stations.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => pick(s.id)}>
                {s.title}, {s.year}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* project panel, opens when the robot arrives */}
      <AnimatePresence>
        {panelStation && (
          <motion.aside
            key={panelStation.id}
            role="dialog"
            aria-label={panelStation.title}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: compact ? 0 : 40, y: compact ? 40 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: compact ? 0 : 40, y: compact ? 40 : 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="panel absolute z-50 flex max-h-[72dvh] flex-col overflow-y-auto max-md:inset-x-3 max-md:bottom-3 max-md:!bg-[#080c13] md:top-24 md:right-5 md:w-[24rem] md:bg-[#080c13]/90"
          >
            <div className="flex items-start justify-between gap-3 border-b border-rule p-4">
              <div>
                <p className="num font-mono text-[0.65rem] tracking-wider" style={{ color: groupColor[panelStation.group] }}>
                  {panelStation.chip} · {groupLabel[panelStation.group].toUpperCase()} · {panelStation.year}
                </p>
                <h2 className="mt-1 text-xl leading-tight font-semibold tracking-tight">{panelStation.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Close"
                className="ease flex h-8 w-8 shrink-0 items-center justify-center border border-rule text-ink-2 hover:border-accent hover:text-accent"
              >
                <X size={14} aria-hidden />
              </button>
            </div>

            {panelStation.media && (
              <div className="border-b border-rule bg-black">
                {panelStation.media.kind === "video" ? (
                  <video
                    src={panelStation.media.src}
                    poster={panelStation.media.poster}
                    aria-label={panelStation.media.alt}
                    autoPlay={!reduce}
                    muted
                    loop
                    playsInline
                    className="block max-h-56 w-full object-cover"
                  />
                ) : (
                  <Image
                    src={panelStation.media.src}
                    alt={panelStation.media.alt}
                    width={800}
                    height={450}
                    sizes="384px"
                    className="block max-h-56 w-full object-cover"
                  />
                )}
              </div>
            )}

            <div className="p-4">
              <p className="text-sm text-ink-2">{panelStation.blurb}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {panelStation.stack.map((t) => (
                  <li key={t} className="border border-rule px-2 py-0.5 font-mono text-[0.65rem] text-ink-2">
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href={panelStation.href}
                className="ease group mt-5 inline-flex items-center gap-2 border border-accent bg-accent px-4 py-2 text-sm font-medium text-accent-ink no-underline hover:border-accent-2 hover:bg-accent-2"
              >
                {panelStation.group === "origin" ? "Read the story" : "Open case study"}
                <ArrowRight size={14} weight="bold" aria-hidden className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* hover tooltip for the chip under the cursor */}
      <AnimatePresence>
        {hovered && !panel && (
          <motion.p
            key={hovered}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute top-24 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-2 border border-rule bg-ground/80 px-3 py-1.5 font-mono text-[0.7rem] text-ink backdrop-blur md:flex"
          >
            Click to drive the robot to {stations.find((s) => s.id === hovered)?.title}
            <ArrowUpRight size={12} aria-hidden />
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
