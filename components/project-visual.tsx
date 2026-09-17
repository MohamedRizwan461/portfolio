import Image from "next/image";
import type { Project } from "@/lib/content";
import { CanBusScene, CircuitScene, ProtoScene, VisionScene } from "./illustrations";

/** The project's cover photo, or a small scene of what it does when there is no photo. */
export function ProjectVisual({ project, sizes, className = "" }: { project: Project; sizes: string; className?: string }) {
  const c = project.cover;
  if (c.src)
    return <Image src={c.src} width={c.width} height={c.height} alt={c.alt} sizes={sizes} className={`h-full w-full object-cover ${className}`} />;
  const Scene =
    project.slug === "can-gear-controller"
      ? CanBusScene
      : project.slug === "ev-boost-converter"
        ? CircuitScene
        : project.slug === "supply-chain-risk"
          ? VisionScene
          : ProtoScene;
  return <Scene className={`h-full w-full ${className}`} />;
}
