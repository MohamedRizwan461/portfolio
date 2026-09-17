"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, FastForward } from "@phosphor-icons/react/dist/ssr";
import { beats, type StoryMedia } from "@/lib/story";
import { playTick } from "@/lib/sound";
import { useAccent } from "./lab";

const EASE = [0.16, 1, 0.3, 1] as const;

type Msg =
  | { id: number; from: "me" | "riz"; kind: "text"; text: string }
  | { id: number; from: "riz"; kind: "media"; media: StoryMedia }
  | { id: number; from: "riz"; kind: "badge"; text: string }
  | { id: number; from: "riz"; kind: "link"; label: string; href: string };

type DistOmit<T> = T extends unknown ? Omit<T, "id"> : never;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function MediaBubble({ media }: { media: StoryMedia }) {
  const tall = media.h > media.w;
  return (
    <div className={`overflow-hidden rounded-2xl rounded-tl-md border border-white/10 bg-black ${tall ? "w-44 sm:w-52" : "w-64 sm:w-80"}`} style={{ aspectRatio: `${media.w} / ${media.h}` }}>
      {media.kind === "video" ? (
        <video
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
          aria-label={media.alt}
          className="h-full w-full object-cover"
          style={media.position ? { objectPosition: media.position } : undefined}
        />
      ) : media.src.endsWith(".webp") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt} className="h-full w-full object-cover" />
      ) : (
        <div className="relative h-full w-full bg-white">
          <Image src={media.src} alt={media.alt} fill sizes="320px" className="object-contain" />
        </div>
      )}
    </div>
  );
}

/**
 * Option C: the story as a conversation. The visitor asks, Riz answers a message
 * at a time with photos and footage as attachments. People read messages.
 */
export function StoryChat() {
  const reduce = useReducedMotion() ?? false;
  const accent = useAccent();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(true);
  const [fast, setFast] = useState(false);
  const fastRef = useRef(false);
  fastRef.current = fast;
  const scroller = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const push = useCallback((m: DistOmit<Msg>) => {
    idRef.current += 1;
    setMsgs((ms) => [...ms, { ...m, id: idRef.current } as Msg]);
  }, []);

  const say = useCallback(
    async (text: string) => {
      setTyping(true);
      await wait(reduce || fastRef.current ? 150 : Math.min(1500, 450 + text.length * 14));
      setTyping(false);
      push({ from: "riz", kind: "text", text });
      await wait(reduce || fastRef.current ? 80 : 280);
    },
    [push, reduce],
  );

  // greeting
  useEffect(() => {
    let alive = true;
    (async () => {
      await wait(500);
      if (!alive) return;
      await say("Hey, I'm Riz. Robotics and embedded systems engineer.");
      await say("Ask me anything about how I got here. It's a short story, I promise.");
      setBusy(false);
    })();
    return () => {
      alive = false;
    };
  }, [say]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [msgs, typing, reduce]);

  const ask = useCallback(
    async (k: number) => {
      if (busy || k >= beats.length) return;
      setBusy(true);
      const b = beats[k];
      playTick();
      push({ from: "me", kind: "text", text: b.ask });
      await wait(350);
      for (let li = 0; li < b.lines.length; li++) {
        await say(b.lines[li]);
        if (li === 0 && b.media) {
          push({ from: "riz", kind: "media", media: b.media });
          await wait(fastRef.current ? 80 : 400);
        }
      }
      if (b.badge) push({ from: "riz", kind: "badge", text: b.badge });
      if (b.link) push({ from: "riz", kind: "link", label: b.link.label, href: b.link.href });
      setStep(k + 1);
      setBusy(false);
    },
    [busy, push, say],
  );

  // "tell me everything" keeps asking until the end
  useEffect(() => {
    if (fast && !busy && step < beats.length) ask(step);
  }, [fast, busy, step, ask]);

  const done = step >= beats.length;

  return (
    <div className="mx-auto grid h-[100dvh] max-w-6xl gap-8 px-4 pt-36 pb-5 sm:px-8 lg:grid-cols-12 lg:pt-40">
      {/* the chapters, filling as the conversation goes */}
      <aside className="hidden lg:col-span-4 lg:block">
        <p className="eyebrow">About · the conversation</p>
        <h1 className="display mt-3 text-[clamp(1.6rem,2.4vw,2.2rem)] !tracking-[-0.035em]">Ask me how I got here.</h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed font-light text-ink-2">Tap a question. I answer the way I would across a table: short, with the photos to prove it.</p>
        <ol className="mt-8 border-t border-rule">
          {beats.map((b, k) => (
            <li key={b.id} className="flex items-center justify-between border-b border-rule py-3 text-sm">
              <span className={k < step ? "text-ink" : k === step ? "text-ink" : "text-ink-2"}>
                <span className="mr-3 font-mono text-[0.68rem] text-ink-2">{b.n}</span>
                {b.label}
              </span>
              {k < step ? <Check size={14} weight="bold" style={{ color: accent }} /> : k === step ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} /> : null}
            </li>
          ))}
        </ol>
      </aside>

      {/* the thread */}
      <section aria-label="Conversation with Riz" className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-rule bg-[color-mix(in_srgb,var(--ground)_60%,transparent)] backdrop-blur-xl lg:col-span-8">
        <header className="flex items-center gap-3 border-b border-rule px-5 py-3.5">
          <div className="relative">
            <Image src="/images/riz/headshot.jpg" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
            <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--ground)] bg-[#22c55e]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Mohamed Rizwan</p>
            <p className="text-xs text-ink-2">{typing ? "typing..." : "online"}</p>
          </div>
          <button
            type="button"
            onClick={() => setFast((f) => !f)}
            className="flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.18em] uppercase transition-colors"
            style={{ borderColor: fast ? accent : "var(--rule-strong)", color: fast ? accent : "var(--ink-2)" }}
          >
            <FastForward size={12} weight="fill" /> Tell me everything
          </button>
        </header>

        <div ref={scroller} data-lenis-prevent className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-5 sm:px-6">
          <AnimatePresence initial={false}>
            {msgs.map((m) => (
              <motion.div
                key={m.id}
                layout
                className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                initial={reduce ? false : { opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {m.kind === "text" ? (
                  <p
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed ${m.from === "me" ? "rounded-br-md text-black" : "rounded-tl-md border border-white/10 bg-white/[0.06] text-ink"}`}
                    style={m.from === "me" ? { background: accent } : undefined}
                  >
                    {m.text}
                  </p>
                ) : m.kind === "media" ? (
                  <MediaBubble media={m.media} />
                ) : m.kind === "badge" ? (
                  <p className="flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.16em] text-ink uppercase" style={{ borderColor: accent }}>
                    <Check size={11} weight="bold" style={{ color: accent }} /> {m.text}
                  </p>
                ) : (
                  <Link href={m.href} className="group flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-ink no-underline hover:border-white/25">
                    {m.label} <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <div className="flex">
              <span className="flex gap-1 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.06] px-4 py-3.5">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-ink-2"
                    animate={reduce ? undefined : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                  />
                ))}
              </span>
            </div>
          )}
        </div>

        {/* quick replies */}
        <div className="border-t border-rule px-4 py-3.5 sm:px-6">
          {done ? (
            <div className="flex flex-wrap gap-2">
              <Link href="/projects" className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-ground no-underline">
                See the projects <ArrowRight size={14} weight="bold" />
              </Link>
              <Link href="/contact" className="flex h-10 items-center gap-2 rounded-full border border-rule-strong px-4 text-sm text-ink no-underline">
                Get in touch
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => ask(step)}
                className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-black transition-opacity disabled:opacity-40"
                style={{ background: accent }}
              >
                {beats[step].ask}
              </button>
              {step < beats.length - 1 && (
                <span className="hidden font-mono text-[0.6rem] tracking-[0.18em] text-ink-2 uppercase sm:inline">
                  {step + 1} of {beats.length}
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
