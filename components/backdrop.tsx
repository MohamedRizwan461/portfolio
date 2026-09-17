"use client";

/**
 * The room the site lives in: near-black, a soft key light from above in the
 * operator's colour, a faint grid that fades out below the header, film grain
 * and a vignette. Pure CSS, and it holds still under reduced motion.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ground">
      <div className="bd-light" />
      <div className="bd-field bd-field-b" />
      <div className="bd-grid" />
      <div className="bd-grain" />
      <div className="bd-vignette" />
    </div>
  );
}
