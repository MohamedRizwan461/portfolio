"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, GameController, X } from "@phosphor-icons/react/dist/ssr";
import type { ModeId } from "@/lib/modes";

const KEY = "riz-invite";
const EASE = [0.16, 1, 0.3, 1] as const;

const INVITE: Partial<Record<ModeId, { line: string; cta: string }>> = {
  curious: { line: "Want to play a game? Drive through my story and I will tell it to you.", cta: "Take the drive" },
  engineer: { line: "Want to have some fun? Drive the CAN gear controller and try to break it.", cta: "Open the simulator" },
};

/**
 * After a few seconds on the board, offer the thing this visitor would enjoy:
 * the drive for the curious, the gear simulator for engineers. Asked once.
 */
export function InviteToast({ mode, blocked, accent, onAccept }: { mode: ModeId | null; blocked: boolean; accent: string; onAccept: () => void }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const invite = mode ? INVITE[mode] : undefined;

  useEffect(() => {
    if (!invite || blocked) return;
    try {
      if (window.sessionStorage.getItem(KEY) === mode) return;
    } catch {}
    const t = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(t);
  }, [invite, blocked, mode]);

  const close = () => {
    setShow(false);
    try {
      window.sessionStorage.setItem(KEY, String(mode));
    } catch {}
  };

  if (!invite) return null;

  return (
    <AnimatePresence>
      {show && !blocked && (
        <motion.div
          className="absolute bottom-[15.5rem] left-4 z-30 w-[min(21rem,calc(100vw-2rem))] sm:bottom-[17rem] sm:left-8"
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <div className="glass relative rounded-2xl p-4 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]">
            <button type="button" onClick={close} aria-label="No thanks" className="absolute top-3 right-3 text-ink-2 transition-colors hover:text-ink">
              <X size={13} weight="bold" />
            </button>
            <p className="flex items-center gap-2" style={{ color: accent }}>
              <GameController size={16} weight="fill" aria-hidden />
              <span className="eyebrow !text-[0.6rem]" style={{ color: accent }}>
                Psst
              </span>
            </p>
            <p className="mt-2 pr-4 text-[0.95rem] leading-relaxed text-ink">{invite.line}</p>
            <div className="mt-4 flex items-center gap-2">
              {mode === "curious" ? (
                <Link
                  href="/about"
                  onClick={close}
                  className="flex h-10 items-center gap-2 rounded-full px-4 text-[0.85rem] font-medium text-black no-underline"
                  style={{ background: accent }}
                >
                  {invite.cta} <ArrowRight size={13} weight="bold" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onAccept();
                  }}
                  className="flex h-10 items-center gap-2 rounded-full px-4 text-[0.85rem] font-medium text-black"
                  style={{ background: accent }}
                >
                  {invite.cta} <ArrowRight size={13} weight="bold" />
                </button>
              )}
              <button type="button" onClick={close} className="h-10 px-3 text-[0.85rem] text-ink-2 transition-colors hover:text-ink">
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
