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
      <figcaption className="mt-2 text-xs text-ink-2">
        {number !== undefined && <span className="num mr-2 font-mono text-ink">Fig. {number}</span>}
        {video.caption}
      </figcaption>
    </figure>
  );
}
