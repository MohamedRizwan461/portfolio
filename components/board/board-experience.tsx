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
import { Mask } from "@/components/motion-bits";
import { ThemeToggle } from "@/components/theme-toggle";
const BootIntro = dynamic(() => import("./boot-intro").then((m) => m.BootIntro), { ssr: false });
import { InviteToast } from "./invite-toast";
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
    <span className="num eyebrow hidden items-center gap-2.5 !text-[0.6rem] xl:flex">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
      </span>
      Bus ok <span className="opacity-40">/</span> cnt {n.toString(16).toUpperCase()} <span className="opacity-40">/</span> crc ok
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

  // the film plays once, for first-time visitors only; everyone lands on the board
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
    else setMode("recruiter");
    let seen = false;
    try {
      seen = window.localStorage.getItem("riz-seen-intro") === "1";
    } catch {}
    if (replay || !seen) {
      setIntro("gate");
      // it plays once: a refresh halfway through should not start it again
      try {
        window.localStorage.setItem("riz-seen-intro", "1");
      } catch {}
    }
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
    try {
      window.localStorage.setItem("riz-seen-intro", "1");
    } catch {}
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

  const link = "rounded-full px-4 py-2 text-[0.85rem] text-ink-2 no-underline transition-colors duration-300 hover:text-ink";
  const iconBtn =
    "flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] hover:text-ink";
  const pillPrimary =
    "flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[0.88rem] font-medium text-ground no-underline transition-shadow duration-500 hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--ink)_12%,transparent)] sm:h-12 sm:px-6";
  const pillSecondary =
    "flex h-11 items-center gap-2 rounded-full border border-rule-strong bg-[color-mix(in_srgb,var(--ground)_40%,transparent)] px-5 text-[0.88rem] font-medium text-ink no-underline backdrop-blur transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--ink)_50%,transparent)] sm:h-12 sm:px-6";

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <AnimatePresence>
        {intro && (
          <BootIntro
            key={intro}
            start={intro}
            afterIntro={intro === "gate" ? "close" : "select"}
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
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 14px ${accent}` }} />
            <span className="hidden text-[0.95rem] font-medium tracking-tight text-ink sm:inline">Mohamed Rizwan</span>
            <span className="text-[0.95rem] font-medium tracking-tight text-ink sm:hidden">Riz</span>
          </Link>
          {mode && (
            <button
              type="button"
              onClick={() => setIntro("select")}
              className="flex items-center gap-2 rounded-full border border-rule-strong bg-[color-mix(in_srgb,var(--ground)_50%,transparent)] px-3.5 py-1.5 font-mono text-[0.6rem] tracking-[0.22em] text-ink-2 uppercase backdrop-blur transition-colors duration-300 hover:border-ink hover:text-ink"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
              <span className="hidden md:inline">View</span>
              <span className="text-ink">{modeConfig.label}</span>
              <CaretDown size={10} weight="bold" aria-hidden />
            </button>
          )}
          <BusStatus />
        </div>
        <nav aria-label="Primary" className="flex items-center gap-0.5">
          <Link href="/tour" className={`${link} hidden lg:block`}>
            Guided tour
          </Link>
          <Link href="/about" className={`${link} hidden lg:block`}>
            About
          </Link>
          <Link href="/projects" className={`${link} mr-1 hidden sm:block`}>
            Projects
          </Link>
          <button
            type="button"
            onClick={() => {
              const next = !sound;
              setSound(next);
              setSoundEnabled(next);
            }}
            aria-label={sound ? "Mute sound" : "Turn sound on"}
            className={`${iconBtn} hidden sm:flex`}
          >
            {sound ? <SpeakerHigh size={16} aria-hidden /> : <SpeakerSlash size={16} aria-hidden />}
          </button>
          <ThemeToggle scheme={scheme} onChange={chooseScheme} className={iconBtn} />
          {mode === "recruiter" && (
            <a
              href={site.resumePdf}
              download
              aria-label="Download resume"
              className="ml-1 flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-ink text-[0.85rem] font-medium text-ground no-underline transition-shadow duration-500 sm:ml-1.5 sm:w-auto sm:px-5"
              style={{ boxShadow: `0 0 0 1px ${accent}, 0 0 32px -6px ${accent}` }}
            >
              <DownloadSimple size={15} weight="bold" aria-hidden /> <span className="hidden sm:inline">Resume</span>
            </a>
          )}
        </nav>
      </header>

      {/* hero: changes with the operator */}
      <AnimatePresence mode="wait">
        <motion.section
          key={modeConfig.id}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute top-[4.75rem] left-4 z-20 max-w-[22rem] sm:top-28 sm:left-8 sm:max-w-md lg:top-[19%] lg:left-12 lg:max-w-[26rem] [@media(max-height:860px)]:lg:top-[15%]"
        >
          <Mask>
            <p className="eyebrow flex items-center gap-3" style={{ color: accent }}>
              <span className="h-px w-8" style={{ background: accent }} />
              {modeConfig.kicker}
            </p>
          </Mask>
          <h1 className="display mt-4 text-[1.6rem] sm:text-[2.1rem] lg:text-[2.4rem] [@media(max-height:860px)]:lg:text-[2.15rem]">
            <Mask delay={0.08}>{modeConfig.headline}</Mask>
          </h1>
          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-4 flex max-w-[34ch] items-start gap-2.5 text-[0.82rem] leading-relaxed text-ink-2"
          >
            <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
            {site.ask}
          </motion.p>
          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-3 hidden max-w-[40ch] text-[0.95rem] leading-relaxed font-light text-ink-2 2xl:block"
          >
            {modeConfig.sub}
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="pointer-events-auto mt-6 flex flex-wrap gap-2.5 sm:mt-8"
          >
            {modeConfig.primary.download || modeConfig.primary.external ? (
              <a
                href={modeConfig.primary.href}
                {...(modeConfig.primary.download ? { download: true } : { target: "_blank", rel: "noopener" })}
                className={pillPrimary}
              >
                {modeConfig.primary.download ? <DownloadSimple size={16} weight="bold" /> : <ArrowUpRight size={16} weight="bold" />}
                {modeConfig.primary.label}
              </a>
            ) : (
              <Link href={modeConfig.primary.href} className={pillPrimary}>
                <PlayCircle size={17} weight="fill" /> {modeConfig.primary.label}
              </Link>
            )}
            {modeConfig.secondary.external ? (
              <a href={modeConfig.secondary.href} target="_blank" rel="noopener" className={pillSecondary}>
                {modeConfig.secondary.label} <ArrowUpRight size={15} weight="bold" />
              </a>
            ) : (
              <Link href={modeConfig.secondary.href} className={pillSecondary}>
                {modeConfig.secondary.label} <ArrowRight size={15} weight="bold" />
              </Link>
            )}
          </motion.div>
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
            className="eyebrow absolute top-[4.9rem] left-12 z-20 hidden items-center gap-3 !text-[0.6rem] lg:flex"
          >
            <CursorClick size={13} style={{ color: accent }} aria-hidden />
            Click a chip and the robot drives there. Drag to look around.
            <button type="button" onClick={() => setHint(false)} aria-label="Dismiss hint" className="text-ink-2 hover:text-ink">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* an invitation to the thing this visitor would enjoy */}
      <InviteToast
        mode={mode}
        blocked={Boolean(intro) || Boolean(openCard)}
        accent={accent}
        onAccept={() => openFromRow(cards.gearsim)}
      />

      {/* the row */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pb-3 sm:px-8 sm:pb-6">
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
