"use client";

import Image from "next/image";
import { EnvelopeSimple, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef } from "react";
import type { CardThumb as Thumb } from "@/lib/cards";

/** One thumbnail. Video thumbs play only while `playing` is true, like a Netflix hover preview. */
export function CardThumb({ thumb, playing = false, large = false, accent = "#4d8dff" }: { thumb: Thumb; playing?: boolean; large?: boolean; accent?: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else {
      v.pause();
      v.currentTime = 0;
    }
  }, [playing]);

  switch (thumb.kind) {
    case "image":
      return (
        <Image
          src={thumb.src}
          alt=""
          fill
          sizes={large ? "768px" : "280px"}
          className={thumb.fit === "contain" ? "bg-white object-contain p-2" : "object-cover object-top"}
        />
      );
    case "video":
      return (
        <video
          ref={video}
          src={thumb.src}
          poster={thumb.poster}
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay={large}
          className="absolute inset-0 h-full w-full object-cover"
          style={thumb.zoom ? { transform: `scale(${thumb.zoom})` } : undefined}
        />
      );
    case "webp":
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={thumb.src} alt="" className="absolute inset-0 h-full w-full object-cover" />;
    case "canframe":
      return (
        <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-[#0d1726] p-3 font-mono">
          <span className="text-[0.65rem] text-ink-2">
            ID <span className="text-ink">0x18F00500</span> · DLC 8
          </span>
          <div className="grid grid-cols-8 gap-0.5">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
              <span
                key={b}
                className={`flex aspect-square items-center justify-center border text-[0.6rem] ${
                  b >= 6 ? "border-transparent text-accent-ink" : "border-rule-strong text-ink"
                }`}
                style={b >= 6 ? { background: accent } : undefined}
              >
                {b}
              </span>
            ))}
          </div>
          <span className="text-[0.6rem] text-ink-2">counter · checksum</span>
        </div>
      );
    case "volt":
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#140f24] font-mono">
          <span className="text-3xl font-semibold tabular-nums" style={{ color: "#b18cff" }}>
            36.0<span className="text-lg"> V</span>
          </span>
          <span className="mt-1 text-[0.65rem] text-ink-2">1 to 100 W · ripple &lt; 0.5%</span>
        </div>
      );
    case "github":
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#23324a,#0b1120)]">
          <GithubLogo size={large ? 96 : 48} weight="fill" className="text-ink" aria-hidden />
        </div>
      );
    case "contact":
      return (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: `radial-gradient(circle at 30% 20%, ${accent}55, #0b1120 70%)` }}>
          <EnvelopeSimple size={large ? 96 : 48} weight="duotone" className="text-ink" aria-hidden />
        </div>
      );
  }
}
