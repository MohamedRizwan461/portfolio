"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ArrowsOut, DownloadSimple, X } from "@phosphor-icons/react/dist/ssr";

const EASE = [0.16, 1, 0.3, 1] as const;
const PAGES = ["/resume/page-1.png", "/resume/page-2.png"];
const W = 1530;
const H = 1980;

/**
 * The resume on display as paper: page one on top, page two peeking out behind.
 * Expanding opens a full-screen reader with both pages.
 */
export function ResumeViewer({ pdf }: { pdf: string }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger.current?.focus();
    };
  }, [open]);

  const pill = "h-10 items-center gap-2 rounded-full px-4 text-sm font-medium no-underline transition-[box-shadow,background-color,border-color] duration-500";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="resume" className="eyebrow">
          Resume <span className="mx-2 opacity-40">/</span> 2 pages <span className="mx-2 opacity-40">/</span> PDF
        </h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(true)} className={`${pill} inline-flex bg-ink text-ground hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--ink)_12%,transparent)]`}>
            <ArrowsOut size={15} weight="bold" aria-hidden /> Expand
          </button>
          <a href={pdf} download className={`${pill} inline-flex border border-rule-strong text-ink hover:border-[color-mix(in_srgb,var(--ink)_50%,transparent)]`}>
            <DownloadSimple size={15} weight="bold" aria-hidden /> Download
          </a>
        </div>
      </div>

      {/* the paper on the desk */}
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Expand the resume to read it"
        className="group relative mt-5 block w-full cursor-zoom-in text-left"
      >
        <span
          className="relative mx-auto block w-full max-w-full lg:h-[var(--h)] lg:w-[calc(var(--h)*0.817)]"
          style={{ aspectRatio: `${W + 120} / ${H + 40}`, "--h": "max(26rem, min(calc(100dvh - 13.5rem), 46rem))" } as React.CSSProperties}
        >
          {/* page two, behind */}
          <span className="absolute top-5 right-0 block w-[88%] rotate-[2.5deg] border border-black/10 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:rotate-[4deg]" style={{ aspectRatio: `${W} / ${H}` }}>
            <Image src={PAGES[1]} alt="" fill sizes="(min-width: 1024px) 520px, 80vw" className="object-contain opacity-90" />
          </span>
          {/* page one, on top */}
          <span className="absolute top-0 left-0 block w-[88%] border border-black/10 bg-white shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:-rotate-[0.6deg]" style={{ aspectRatio: `${W} / ${H}` }}>
            <Image src={PAGES[0]} alt="Resume of Mohamed Rizwan Ameer John, page 1" fill sizes="(min-width: 1024px) 520px, 80vw" className="object-contain" preload />
            <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/0 to-transparent pb-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 max-lg:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                <ArrowsOut size={15} weight="bold" aria-hidden /> Click to read
              </span>
            </span>
          </span>
        </span>
      </button>

      {mounted &&
        createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Resume"
            className="fixed inset-0 z-[90] flex flex-col bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.35 }}
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6" onClick={(e) => e.stopPropagation()}>
              <p className="eyebrow !text-white/70">
                <span className="hidden sm:inline">
                  Mohamed Rizwan Ameer John <span className="mx-2 opacity-40">/</span>{" "}
                </span>
                Resume
              </p>
              <div className="flex items-center gap-2">
                <a href={pdf} download className={`${pill} hidden bg-white text-black sm:inline-flex`}>
                  <DownloadSimple size={15} weight="bold" aria-hidden /> Download
                </a>
                <a href={pdf} target="_blank" rel="noopener" className={`${pill} hidden border border-white/25 text-white hover:border-white/60 sm:inline-flex`}>
                  Open PDF <ArrowUpRight size={14} weight="bold" aria-hidden />
                </a>
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white/60"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-3 py-6 sm:px-6 sm:py-10">
              <motion.div
                className="mx-auto flex max-w-[56rem] flex-col gap-6"
                initial={reduce ? false : { opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
                onClick={(e) => e.stopPropagation()}
              >
                {PAGES.map((src, i) => (
                  <figure key={src} className="m-0">
                    <Image
                      src={src}
                      width={W}
                      height={H}
                      alt={`Resume of Mohamed Rizwan Ameer John, page ${i + 1}`}
                      sizes="(min-width: 960px) 896px, 100vw"
                      className="h-auto w-full bg-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]"
                    />
                    <figcaption className="eyebrow mt-3 text-center !text-white/50">
                      Page {i + 1} of {PAGES.length}
                    </figcaption>
                  </figure>
                ))}
                <div className="flex justify-center gap-2 pb-4 sm:hidden">
                  <a href={pdf} download className={`${pill} inline-flex bg-white text-black`}>
                    <DownloadSimple size={15} weight="bold" aria-hidden /> Download
                  </a>
                  <a href={pdf} target="_blank" rel="noopener" className={`${pill} inline-flex border border-white/25 text-white`}>
                    Open PDF <ArrowUpRight size={14} weight="bold" aria-hidden />
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
