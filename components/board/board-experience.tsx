"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CaretDown,
  CursorClick,
  DownloadSimple,
  ListBullets,
  Moon,
  PlayCircle,
  SpeakerHigh,
  SpeakerSlash,
  Sun,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { cards, type Card } from "@/lib/cards";
import { site } from "@/lib/content";
import { MODE_STORAGE_KEY, modes, type ModeId } from "@/lib/modes";
import { applyTheme, DEFAULT_THEME, readThemeChoice, SCHEME_STORAGE_KEY, THEME_STORAGE_KEY, themes, type Scheme, type Theme } from "@/lib/themes";
import { markStationSeen } from "@/lib/progress";
import { setSoundEnabled, soundEnabled } from "@/lib/sound";
import { stations } from "@/lib/stations";
import { ThemeToggle } from "@/components/theme-toggle";
import { BootIntro } from "./boot-intro";
import { RowDock } from "./row-dock";
import { TitleModal } from "./title-modal";

const BoardScene = dynamic(() => import("./board-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-sm text-ink-2">
      <span className="animate-pulse">&gt; routing traces...</span>
    </div>
  ),
});

const EASE = [0.16, 1, 0.3, 1] as const;

/** which card tells the story of which chip */
const CARD_FOR_STATION: Record<string, string> = {
  biology: "journey",
  "smart-knee-actuator": "knee",
  "sign-language-eyewear": "eyewear",
  "rfid-iot-attendance": "wsn",
  "ev-boost-converter": "asmc",
  "autonomous-mobile-robot": "robot",
  "can-gear-controller": "can",
};

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
    <span className="num hidden items-center gap-2 border border-rule bg-ground/60 px-2.5 py-1 font-mono text-[0.7rem] tracking-wide text-ink-2 backdrop-blur md:flex">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
      </span>
      BUS OK · CNT {n.toString(16).toUpperCase()} · CRC OK
    </span>
  );
}

export function BoardExperience() {
  const reduce = useReducedMotion() ?? false;
  const compact = useCompact();
  const [hovered, setHovered] = useState<string | null>(null);
  const [driveTo, setDriveTo] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(() => new Set(["biology"]));
  const [openCard, setOpenCard] = useState<Card | null>(null);
  const [mode, setMode] = useState<ModeId | null>(null);
  const [intro, setIntro] = useState<"gate" | "select" | null>(null);
  const [sound, setSound] = useState(true);
  const [hint, setHint] = useState(true);
  const [seenTick, setSeenTick] = useState(0);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [scheme, setScheme] = useState<Scheme>("dark");
  const [showPalettes, setShowPalettes] = useState(false);
  const [palettesOpen, setPalettesOpen] = useState(true);
  const userDriven = useRef(false);
  const lastInput = useRef(0);
  const autoIndex = useRef(0);
  const parkedAt = useRef<string | null>("biology");

  const modeConfig = modes.find((m) => m.id === mode) ?? modes[0];
  const tokens = theme[scheme];
  const accent = tokens.accents[modeConfig.id];
  const palette = useMemo(() => ({ ...tokens, finish: theme.finish }), [tokens, theme.finish]);
  const route = modeConfig.route;

  // first visit powers on and asks who is operating; returning visitors keep their mode
  useEffect(() => {
    lastInput.current = Date.now();
    setSound(soundEnabled());
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(MODE_STORAGE_KEY);
    } catch {}
    const params = new URLSearchParams(window.location.search);
    const replay = params.has("boot");
    // palette trial: available locally or with ?palettes
    try {
      const choice = readThemeChoice();
      setTheme(choice.theme);
      setScheme(choice.scheme);
    } catch {}
    setShowPalettes(params.has("themes"));
    if (saved && modes.some((m) => m.id === saved)) setMode(saved as ModeId);
    if (replay || !saved) setIntro("gate");
  }, []);

  // the whole site, backdrop included, takes the theme and the operator's colour
  useEffect(() => {
    applyTheme(theme, scheme, modeConfig.id);
  }, [theme, scheme, modeConfig.id]);

  const chooseTheme = useCallback((t: Theme) => {
    setTheme(t);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, t.id);
    } catch {}
  }, []);

  const chooseScheme = useCallback((sc: Scheme) => {
    setScheme(sc);
    try {
      window.localStorage.setItem(SCHEME_STORAGE_KEY, sc);
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 7000);
    return () => clearTimeout(t);
  }, []);

  // P cycles themes, L flips light and dark, while trying them on
  useEffect(() => {
    if (!showPalettes) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (e.key === "p" || e.key === "P") {
        const i = themes.findIndex((t) => t.id === theme.id);
        chooseTheme(themes[(i + 1) % themes.length]);
      }
      if (e.key === "l" || e.key === "L") chooseScheme(scheme === "dark" ? "light" : "dark");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPalettes, theme, scheme, chooseTheme, chooseScheme]);

  const openStation = useCallback((id: string) => {
    const card = cards[CARD_FOR_STATION[id]];
    if (card) setOpenCard(card);
  }, []);

  const pick = useCallback(
    (id: string) => {
      userDriven.current = true;
      lastInput.current = Date.now();
      setHint(false);
      setActive(id);
      if (parkedAt.current === id) {
        openStation(id);
        return;
      }
      parkedAt.current = null;
      setDriveTo(id);
    },
    [openStation],
  );

  const arrive = useCallback(
    (id: string) => {
      parkedAt.current = id;
      markStationSeen(id);
      setSeenTick((t) => t + 1);
      setVisited((v) => new Set(v).add(id));
      if (userDriven.current) openStation(id);
      else setActive(id);
    },
    [openStation],
  );

  const selectMode = useCallback((id: ModeId) => {
    const m = modes.find((x) => x.id === id)!;
    setMode(id);
    setIntro(null);
    setOpenCard(null);
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, id);
    } catch {}
    // send the robot to this operator's first stop; curious visitors get the tour straight away
    autoIndex.current = 0;
    userDriven.current = false;
    lastInput.current = m.openFirst ? Date.now() : 0;
    parkedAt.current = null;
    setActive(m.route[0]);
    setDriveTo(m.route[0]);
  }, []);

  // idle autopilot: tours this operator's route until someone takes the wheel
  useEffect(() => {
    if (reduce || intro) return;
    const id = setInterval(() => {
      const idle = Date.now() - lastInput.current;
      if (openCard || idle < 9000) return;
      userDriven.current = false;
      autoIndex.current = (autoIndex.current + 1) % route.length;
      const next = route[autoIndex.current];
      parkedAt.current = null;
      setActive(next);
      setDriveTo(next);
    }, 4200);
    return () => clearInterval(id);
  }, [openCard, reduce, intro, route]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (intro || openCard) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const current = stations.findIndex((s) => s.id === (active ?? "biology"));
      const next = (current + (e.key === "ArrowRight" ? 1 : -1) + stations.length) % stations.length;
      pick(stations[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, pick, intro, openCard]);

  const openFromRow = useCallback((card: Card) => {
    lastInput.current = Date.now();
    setHint(false);
    setOpenCard(card);
    // the robot goes to the chip the visitor is reading about
    if (card.station && parkedAt.current !== card.station) {
      userDriven.current = false;
      parkedAt.current = null;
      setActive(card.station);
      setDriveTo(card.station);
    }
  }, []);

  const dimmed = useMemo(
    () => new Set(modeConfig.highlight.length ? stations.filter((s) => !modeConfig.highlight.includes(s.id)).map((s) => s.id) : []),
    [modeConfig],
  );

  const btn = "ease flex items-center gap-1.5 border border-rule bg-ground/70 px-2.5 py-1.5 text-[0.8rem] text-ink no-underline backdrop-blur hover:border-accent hover:text-accent";

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <AnimatePresence>
        {intro && (
          <BootIntro
            key={intro}
            start={intro}
            current={mode}
            accents={tokens.accents}
            onSelect={selectMode}
            onDismiss={mode ? () => setIntro(null) : undefined}
          />
        )}
      </AnimatePresence>

      {/* the board, framed to the right of the hero on wide screens */}
      <div
        className="absolute inset-x-0 top-[31%] bottom-[35%] isolate z-0 sm:top-[34%] lg:top-[8%] lg:bottom-[27%] lg:left-[29%]"
        onPointerDown={() => {
          lastInput.current = Date.now();
          setHint(false);
        }}
      >
        <BoardScene
          driveTo={driveTo}
          hovered={hovered}
          active={active}
          visited={visited}
          dimmed={dimmed}
          accent={accent}
          accessory={modeConfig.accessory}
          palette={palette}
          reduce={reduce}
          compact={compact}
          onHover={setHovered}
          onPick={pick}
          onArrive={arrive}
        />
      </div>

      {/* netflix-style vignettes so words stay readable over the board */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[48%] bg-[linear-gradient(to_right,var(--ground)_0%,color-mix(in_srgb,var(--ground)_85%,transparent)_45%,transparent_100%)] lg:block" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[42%] bg-[linear-gradient(to_top,var(--ground)_0%,color-mix(in_srgb,var(--ground)_80%,transparent)_50%,transparent_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--ground)_90%,transparent),transparent)]" />

      {/* top bar */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-baseline gap-2 no-underline">
            <span className="font-mono text-sm font-bold tracking-tight" style={{ color: accent }}>
              RIZ
            </span>
            <span className="hidden text-sm text-ink sm:inline">Mohamed Rizwan</span>
          </Link>
          <BusStatus />
          {mode && (
            <button
              type="button"
              onClick={() => setIntro("select")}
              className="ease flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[0.7rem] tracking-wide text-ink backdrop-blur hover:bg-white/5"
              style={{ borderColor: accent }}
            >
              <span className="hidden sm:inline text-ink-2">MODE</span>
              <span style={{ color: accent }}>{modeConfig.label.toUpperCase()}</span>
              <CaretDown size={12} aria-hidden />
            </button>
          )}
        </div>
        <nav aria-label="Primary" className="flex items-center gap-2">
          <Link href="/tour" className={`${btn} hidden lg:flex`}>
            <PlayCircle size={16} aria-hidden /> Guided tour
          </Link>
          <Link href="/about" className={`${btn} hidden lg:flex`}>
            About
          </Link>
          <Link href="/projects" className={`${btn} hidden sm:flex`}>
            <ListBullets size={16} aria-hidden /> All projects
          </Link>
          <button
            type="button"
            onClick={() => {
              const next = !sound;
              setSound(next);
              setSoundEnabled(next);
            }}
            aria-label={sound ? "Mute sound" : "Turn sound on"}
            className={`${btn} px-2.5`}
          >
            {sound ? <SpeakerHigh size={16} aria-hidden /> : <SpeakerSlash size={16} aria-hidden />}
          </button>
          <ThemeToggle scheme={scheme} onChange={chooseScheme} className={`${btn} px-2.5`} />
          <a
            href={site.resumePdf}
            download
            className={`ease flex items-center gap-1.5 border px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--accent-ink)] no-underline hover:brightness-110 ${
              mode === "recruiter" ? "motion-safe:animate-[resume-glow_2.2s_ease-out_infinite]" : ""
            }`}
            style={{ background: accent, borderColor: accent }}
          >
            <DownloadSimple size={16} weight="bold" aria-hidden /> Resume
          </a>
        </nav>
      </header>

      {/* hero: changes with the operator */}
      <AnimatePresence mode="wait">
        <motion.section
          key={modeConfig.id}
          initial={reduce ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="pointer-events-none absolute top-[4.5rem] left-4 z-20 max-w-[22rem] sm:top-24 sm:left-6 sm:max-w-md lg:top-[20%] lg:left-10 lg:max-w-[25rem] [@media(max-height:860px)]:lg:top-[17%]"
        >
          <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase" style={{ color: accent }}>
            {modeConfig.kicker}
          </p>
          <h1 className="mt-2 text-[1.45rem] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-3xl lg:text-[2.35rem]">
            {modeConfig.headline}
          </h1>
          <p className="mt-3 hidden max-w-[40ch] text-sm leading-relaxed text-ink-2 2xl:block">{modeConfig.sub}</p>
          <div className="pointer-events-auto mt-4 flex flex-wrap gap-2 sm:mt-5">
            {modeConfig.primary.download || modeConfig.primary.external ? (
              <a
                href={modeConfig.primary.href}
                {...(modeConfig.primary.download ? { download: true } : { target: "_blank", rel: "noopener" })}
                className="ease flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-semibold text-[var(--ground)] no-underline hover:opacity-90 sm:px-4 sm:text-sm"
              >
                {modeConfig.primary.download ? <DownloadSimple size={18} weight="bold" /> : <ArrowUpRight size={18} weight="bold" />}
                {modeConfig.primary.label}
              </a>
            ) : (
              <Link
                href={modeConfig.primary.href}
                className="ease flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-semibold text-[var(--ground)] no-underline hover:opacity-90 sm:px-4 sm:text-sm"
              >
                <PlayCircle size={18} weight="fill" /> {modeConfig.primary.label}
              </Link>
            )}
            {modeConfig.secondary.external ? (
              <a
                href={modeConfig.secondary.href}
                target="_blank"
                rel="noopener"
                className="ease flex items-center gap-2 bg-[color-mix(in_srgb,var(--ink)_13%,transparent)] px-4 py-2.5 text-sm font-semibold text-ink no-underline backdrop-blur hover:bg-[color-mix(in_srgb,var(--ink)_22%,transparent)] sm:px-4 sm:text-sm"
              >
                {modeConfig.secondary.label} <ArrowUpRight size={16} weight="bold" />
              </a>
            ) : (
              <Link
                href={modeConfig.secondary.href}
                className="ease flex items-center gap-2 bg-[color-mix(in_srgb,var(--ink)_13%,transparent)] px-4 py-2.5 text-sm font-semibold text-ink no-underline backdrop-blur hover:bg-[color-mix(in_srgb,var(--ink)_22%,transparent)] sm:px-4 sm:text-sm"
              >
                {modeConfig.secondary.label} <ArrowRight size={16} weight="bold" />
              </Link>
            )}
          </div>

        </motion.section>
      </AnimatePresence>

      {/* how to play, in words people can actually read */}
      <AnimatePresence>
        {hint && !intro && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: reduce ? 0 : 1 }}
            className="absolute top-[3.6rem] left-10 z-20 hidden items-center gap-2 border bg-[color-mix(in_srgb,var(--ground)_90%,transparent)] px-2.5 py-1 text-[0.75rem] text-ink-2 backdrop-blur lg:flex"
            style={{ borderColor: accent }}
          >
            <CursorClick size={14} weight="duotone" style={{ color: accent }} aria-hidden />
            Click any chip and the robot drives there. Drag to look around.
            <button type="button" onClick={() => setHint(false)} aria-label="Dismiss hint" className="text-ink-2 hover:text-ink">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the row */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pb-3 sm:px-6 sm:pb-5">
        <RowDock key={modeConfig.id} title={modeConfig.rowTitle} ids={modeConfig.cards} accent={accent} seenTick={seenTick} onOpen={openFromRow} />
      </div>

      {/* keyboard and screen reader access to every chip */}
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

      {showPalettes && !intro && !palettesOpen && (
        <button
          type="button"
          onClick={() => setPalettesOpen(true)}
          className="absolute top-20 right-4 z-40 flex items-center gap-2 border border-rule bg-[color-mix(in_srgb,var(--ground)_92%,transparent)] px-3 py-2 text-sm text-ink backdrop-blur hover:border-accent sm:right-6"
        >
          <span className="flex gap-1">
            {(["recruiter", "engineer", "curious"] as const).map((m) => (
              <span key={m} className="h-2.5 w-2.5 rounded-full" style={{ background: tokens.accents[m] }} />
            ))}
          </span>
          Themes
        </button>
      )}

      {showPalettes && !intro && palettesOpen && (
        <aside
          aria-label="Try colour themes"
          className="absolute top-20 right-4 z-40 flex max-h-[calc(100dvh-6.5rem)] w-[19rem] flex-col border border-rule bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur sm:right-6"
        >
          <div className="flex items-center justify-between text-xs font-semibold tracking-[0.15em] text-ink-2 uppercase">
            Try a theme
            <span className="flex items-center gap-2 font-mono tracking-normal normal-case">
              P theme · L light
              <button type="button" onClick={() => setPalettesOpen(false)} aria-label="Hide themes" className="text-ink-2 hover:text-ink">
                <X size={14} />
              </button>
            </span>
          </div>

          {/* light and dark */}
          <div className="mt-2.5 grid grid-cols-2 border border-rule p-0.5" role="radiogroup" aria-label="Light or dark">
            {(["dark", "light"] as const).map((sc) => (
              <button
                key={sc}
                type="button"
                role="radio"
                aria-checked={scheme === sc}
                onClick={() => chooseScheme(sc)}
                className="flex items-center justify-center gap-2 py-1.5 text-sm font-medium transition-colors"
                style={scheme === sc ? { background: accent, color: "var(--accent-ink)" } : { color: "var(--ink-2)" }}
              >
                {sc === "dark" ? <Moon size={15} weight="fill" /> : <Sun size={15} weight="fill" />}
                {sc === "dark" ? "Dark" : "Light"}
              </button>
            ))}
          </div>

          <ul className="mt-2.5 min-h-0 space-y-1.5 overflow-y-auto pr-0.5">
            {themes.map((t, i) => {
              const on = t.id === theme.id;
              const tk = t[scheme];
              const first = i === 0 || Boolean(themes[i - 1].favourite) !== Boolean(t.favourite);
              return (
                <li key={t.id}>
                  {first && (
                    <p className="mt-1 mb-1.5 text-[0.7rem] font-semibold tracking-[0.12em] text-ink-2 uppercase">
                      {t.favourite ? "Your favourites" : "More to try"}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => chooseTheme(t)}
                    title={t.line}
                    className="flex w-full items-center gap-2.5 border px-2.5 py-2 text-left transition-colors"
                    style={{ borderColor: on ? accent : "var(--rule)", background: on ? "var(--accent-soft)" : "transparent" }}
                  >
                    <span className="flex h-7 w-10 shrink-0 overflow-hidden border border-rule">
                      <span className="w-1/2" style={{ background: tk.ground }} />
                      <span className="w-1/2" style={{ background: tk.board }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{t.name}</span>
                      <span className="block font-mono text-[0.65rem] tracking-wide text-ink-2 uppercase">{t.finish}</span>
                    </span>
                    <span className="flex gap-1">
                      {(["recruiter", "engineer", "curious"] as const).map((m) => (
                        <span key={m} className="h-2.5 w-2.5 rounded-full" style={{ background: tk.accents[m] }} />
                      ))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2.5 border-t border-rule pt-2 text-xs leading-snug text-ink-2">{theme.line}</p>
        </aside>
      )}

      <TitleModal card={openCard} accent={accent} onClose={() => setOpenCard(null)} />
    </div>
  );
}
