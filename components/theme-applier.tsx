"use client";

import { useEffect } from "react";
import { MODE_STORAGE_KEY, modes, type ModeId } from "@/lib/modes";
import { applyTheme, readThemeChoice } from "@/lib/themes";

/** Every page wears the theme and operator colour the visitor chose on the board. */
export function ThemeApplier() {
  useEffect(() => {
    const { theme, scheme } = readThemeChoice();
    let mode: ModeId = "recruiter";
    try {
      const saved = window.localStorage.getItem(MODE_STORAGE_KEY);
      if (saved && modes.some((m) => m.id === saved)) mode = saved as ModeId;
    } catch {}
    applyTheme(theme, scheme, mode);
  }, []);
  return null;
}
