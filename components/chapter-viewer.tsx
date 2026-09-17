"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { chapters, type ChapterMedia } from "@/lib/journey";
import { markChapterRead } from "@/lib/progress";

const EASE = [0.16, 1, 0.3, 1] as const;

function Media({ media, className = "", sizes }: { media: ChapterMedia; className?: string; sizes: string }) {
  const reduce = useReducedMotion();
  const fit = media.fit === "cover" ? "object-cover" : "object-contain";
  const doc = media.fit !== "cover";
  return (
    <figure className={`m-0 flex min-h-0 flex-col ${className}`}>
      <div className={`relative min-h-0 flex-1 overflow-hidden border border-rule ${doc ? "bg-white/95 p-2" : "bg-black"}`}>
        {media.kind === "video" ? (
          <video
            src={media.src}
            poster={media.poster}
            aria-label={media.alt}
            autoPlay={!reduce}
            muted
            loop
            playsInline
            className={`absolute inset-0 h-full w-full ${fit}`}
          />
        ) : media.src.endsWith(".webp") ? (
          <img src={media.src} alt={media.alt} className={`absolute inset-0 h-full w-full ${fit}`} />
        ) : (
          <Image src={media.src} alt={media.alt} fill sizes={sizes} className={`${fit} ${doc ? "p-2" : ""}`} />
        )}
      </div>
      <figcaption className="mt-1.5 line-clamp-1 text-xs text-ink-2">{media.caption}</figcaption>
    </figure>
  );
}

/** Certificates and diagrams: sized to their real shape, the second laid over the first like paper on a desk. */
function Documents({ main, extra }: { main: ChapterMedia; extra?: ChapterMedia }) {
  const reduce = useReducedMotion();
  return (
    <figure className="m-0 flex h-full min-h-0 w-full flex-col">
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <motion.div
          className="relative flex max-h-full max-w-full items-center justify-center"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Image
            src={main.src}
            alt={main.alt}
            width={main.width ?? 1200}
            height={main.height ?? 800}
            sizes="(min-width: 1024px) 620px, 90vw"
            className={`h-auto max-h-[calc(100dvh-17rem)] w-auto max-w-full object-contain max-lg:max-h-[42dvh] ${
              main.src.endsWith(".png") && main.src.includes("headshot") ? "" : "border border-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
            }`}
          />
        </motion.div>
        {extra && (
          <motion.div
            className="absolute right-0 bottom-0 w-[44%] max-w-[18rem]"
            initial={reduce ? false : { opacity: 0, y: 24, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 3 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            whileHover={reduce ? undefined : { rotate: 0, scale: 1.04 }}
          >
            <Image
              src={extra.src}
              alt={extra.alt}
              width={extra.width ?? 1200}
              height={extra.height ?? 800}
              sizes="288px"
              className="h-auto w-full border border-white/15 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)]"
            />
          </motion.div>
        )}
      </div>
      <figcaption className="mt-2 line-clamp-2 text-xs text-ink-2">
        {main.caption}
        {extra && <span className="text-ink-2/80"> · {extra.caption}</span>}
      </figcaption>
    </figure>
  );
}

/**
 * The About story as one window: a timeline to jump between chapters, the words
 * on the left, the evidence on the right. No long scroll.
 */
export function ChapterViewer() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();

  const go = useCallback((next: number) => {
    setIndex((cur) => {
      const n = (next + chapters.length) % chapters.length;
      setDir(n >= cur ? 1 : -1);
      window.history.replaceState(null, "", `#${chapters[n].id}`);
      return n;
    });
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const i = chapters.findIndex((c) => c.id === window.location.hash.slice(1));
      if (i >= 0) setIndex(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const c = chapters[index];

  // count this chapter as read for the "continue watching" bar on the board
  useEffect(() => {
    markChapterRead(chapters[index].id);
  }, [index]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* timeline */}
      <ol className="grid grid-cols-7 gap-1.5" aria-label="Chapters">
        {chapters.map((ch, i) => (
          <li key={ch.id}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === index ? "step" : undefined}
              className="group block w-full text-left"
            >
              <span className="block h-0.5 w-full overflow-hidden bg-rule">
                <motion.span
                  className="block h-full bg-accent"
                  initial={false}
                  animate={{ width: i <= index ? "100%" : "0%" }}
                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                />
              </span>
              <span
                className={`mt-2 hidden truncate font-mono text-[0.65rem] tracking-wide transition-colors md:block ${
                  i === index ? "text-accent" : "text-ink-2 group-hover:text-ink"
                }`}
              >
                {ch.domain}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="relative mt-5 min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.article
            key={c.id}
            id={c.id}
            initial={reduce ? false : { opacity: 0, x: dir * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -30 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="grid h-full min-h-0 gap-6 lg:grid-cols-12 lg:gap-10"
          >
            {/* words */}
            <div className="flex min-h-0 flex-col lg:col-span-5">
              <p className="num flex gap-3 font-mono text-xs">
                <span className="text-accent">{c.domain}</span>
                <span className="text-ink-2">{c.years}</span>
              </p>
              <h2 className="mt-2 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight font-semibold tracking-[-0.025em]">
                {c.title}
              </h2>
              <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-ink-2">
                {c.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {c.facts && (
                <dl className="mt-4 divide-y divide-rule border-y border-rule text-sm">
                  {c.facts.map((f) => (
                    <div key={f.k} className="grid grid-cols-[9rem_1fr] gap-3 py-1.5">
                      <dt className="text-ink-2">{f.k}</dt>
                      <dd className="num font-mono text-[0.8rem]">{f.v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {c.link && (
                <Link
                  href={c.link.href}
                  className="ease group mt-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-accent hover:text-ink"
                >
                  {c.link.label}
                  <ArrowRight size={14} weight="bold" aria-hidden className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>

            {/* evidence */}
            <div className="flex min-h-[16rem] gap-3 lg:col-span-7 lg:min-h-0">
              {c.media.fit === "contain" ? (
                <Documents main={c.media} extra={c.extra} />
              ) : (
                <>
                  <Media
                    media={c.media}
                    className={c.extra ? "basis-[58%]" : "flex-1"}
                    sizes="(min-width: 1024px) 520px, 90vw"
                  />
                  {c.extra && <Media media={c.extra} className="basis-[42%]" sizes="(min-width: 1024px) 320px, 45vw" />}
                </>
              )}
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="mt-5 flex items-center justify-between border-t border-rule pt-3">
        <p className="num font-mono text-xs text-ink-2">
          <span className="text-ink">{String(index + 1).padStart(2, "0")}</span> / {String(chapters.length).padStart(2, "0")}
          <span className="ml-3 hidden sm:inline">← → to move between chapters</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous chapter"
            className="ease flex h-9 w-9 items-center justify-center border border-rule text-ink hover:border-accent hover:text-accent"
          >
            <ArrowLeft size={15} weight="bold" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next chapter"
            className="ease flex h-9 items-center gap-2 border border-accent bg-accent px-4 text-sm font-medium text-accent-ink hover:border-accent-2 hover:bg-accent-2"
          >
            {index === chapters.length - 1 ? "Start over" : "Next chapter"}
            <ArrowRight size={15} weight="bold" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
