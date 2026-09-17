"use client";

/**
 * The room the site lives in: near-black warmed by a slow oxblood glow, a soft
 * key light from above in the operator's colour, an engineering grid, film grain
 * and a vignette. Pure CSS, and it holds still under reduced motion.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ground">
      <div className="bd-warm bd-warm-a" />
      <div className="bd-warm bd-warm-b" />
      <div className="bd-light" />
      <div className="bd-field bd-field-b" />
      <div className="bd-grid" />
      <div className="bd-grain" />
      <div className="bd-vignette" />
    </div>
  );
}
