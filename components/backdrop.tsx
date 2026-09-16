"use client";

/**
 * The room the site lives in: two slow radial fields drifting over near-black,
 * a faint engineering grid, and a vignette. Pure CSS so it costs no main thread,
 * and it freezes under reduced motion.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ground">
      <div className="bd-field bd-field-a" />
      <div className="bd-field bd-field-b" />
      <div className="bd-grid" />
      <div className="bd-vignette" />
    </div>
  );
}
