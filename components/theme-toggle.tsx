"use client";

import { Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { MODE_STORAGE_KEY, modes, type ModeId } from "@/lib/modes";
import { applyTheme, readThemeChoice, SCHEME_STORAGE_KEY, type Scheme } from "@/lib/themes";

/**
 * One small sun/moon button. Controlled when the board passes its scheme in;
 * standalone on every other page.
 */
export function ThemeToggle({
  scheme: controlled,
  onChange,
  className = "",
}: {
  scheme?: Scheme;
  onChange?: (s: Scheme) => void;
  className?: string;
}) {
  const [local, setLocal] = useState<Scheme>("dark");
  useEffect(() => {
    if (!controlled) setLocal(readThemeChoice().scheme);
  }, [controlled]);
  const scheme = controlled ?? local;
  const next: Scheme = scheme === "dark" ? "light" : "dark";

  const flip = () => {
    if (onChange) return onChange(next);
    setLocal(next);
    try {
      window.localStorage.setItem(SCHEME_STORAGE_KEY, next);
    } catch {}
    let mode: ModeId = "recruiter";
    try {
      const saved = window.localStorage.getItem(MODE_STORAGE_KEY);
      if (saved && modes.some((m) => m.id === saved)) mode = saved as ModeId;
    } catch {}
    applyTheme(readThemeChoice().theme, next, mode);
  };

  return (
    <button type="button" onClick={flip} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} className={className}>
      {scheme === "dark" ? <Sun size={16} weight="bold" aria-hidden /> : <Moon size={16} weight="bold" aria-hidden />}
    </button>
  );
}
