"use client";

import { useReducedMotion } from "motion/react";

export type VideoData = {
  src: string;
  poster: string;
  alt: string;
  caption: string;
  portrait?: boolean;
};

/**
 * Real footage of the hardware running. Loops like a GIF by default, but stays a
 * video so it is small, seekable and can be paused. Under reduced motion it holds
 * on the poster frame until the visitor presses play.
 */
export function VideoFigure({
  video,
  number,
  className = "",
}: {
  video: VideoData;
  number?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <figure className={`m-0 ${className}`}>
      <div className={`overflow-hidden border border-rule bg-black ${video.portrait ? "aspect-[3/4]" : ""}`}>
        <video
          src={video.src}
          poster={video.poster}
          aria-label={video.alt}
          autoPlay={!reduce}
          muted
          loop={!reduce}
          playsInline
          controls
          preload="metadata"
          className={`block w-full ${video.portrait ? "h-full scale-[1.32] object-cover" : ""}`}
        />
      </div>
      <figcaption className="mt-3 flex gap-3 text-xs leading-relaxed text-ink-2">
        {number !== undefined && <span className="eyebrow shrink-0 !text-[0.62rem] text-ink">Fig. {String(number).padStart(2, "0")}</span>}
        {video.caption}
      </figcaption>
    </figure>
  );
}
