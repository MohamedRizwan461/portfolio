"use client";

import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { TextAlignLeft } from "@phosphor-icons/react/dist/ssr";
import { ChapterViewer } from "@/components/chapter-viewer";
import { StoryCruise } from "./story-cruise";

/** WebGL is not a given: old laptops, locked-down browsers and some phones say no. */
function useCanRender3D() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") ?? c.getContext("webgl");
      const cores = navigator.hardwareConcurrency ?? 4;
      setOk(Boolean(gl) && cores >= 4);
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/**
 * About: the drive by default, the written chapters for anyone who would rather
 * read, cannot run 3D, or asked for less motion.
 */
export function AboutDrive() {
  const reduce = useReducedMotion();
  const can3d = useCanRender3D();

  if (can3d === null) return <div className="h-[100dvh] bg-[#05070b]" />;

  if (!can3d || reduce) {
    return (
      <div className="mx-auto flex h-[100dvh] min-h-[38rem] w-full max-w-6xl flex-col px-4 pt-24 pb-5 max-lg:h-auto sm:px-8 sm:pt-28">
        <ChapterViewer />
      </div>
    );
  }

  return (
    <>
      <StoryCruise />
      <Link
        href="/about/read"
        className="glass fixed top-[5.25rem] right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2 text-[0.78rem] text-ink no-underline transition-colors hover:text-ink sm:top-[5.75rem] sm:right-8"
      >
        <TextAlignLeft size={14} aria-hidden /> Read it instead
      </Link>
    </>
  );
}
