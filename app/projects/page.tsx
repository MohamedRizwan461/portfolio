import type { Metadata } from "next";
import { Mask, Reveal } from "@/components/motion-bits";
import { ProjectsIndex } from "@/components/projects-index";
import { Container } from "@/components/ui";
import { projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Case studies: CAN gear controller, patented smart knee actuator and sign language eyewear, autonomous mobile robot, EV boost converter and more.",
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <Container className="pt-24 sm:pt-28">
        <Mask>
          <p className="eyebrow">
            Selected work <span className="mx-2 opacity-40">/</span> {String(projects.length).padStart(2, "0")}
          </p>
        </Mask>
        <h1 className="display mt-3 text-[clamp(1.75rem,2.6vw,2.4rem)] !tracking-[-0.035em]">
          <Mask delay={0.08}>Projects</Mask>
        </h1>
        <Reveal delay={0.3} className="mt-6 grid gap-4 border-t border-rule pt-5 sm:grid-cols-12">
          <p className="eyebrow sm:col-span-4">Firmware · Robotics · Autonomy</p>
          <p className="text-[0.98rem] leading-relaxed font-light text-ink-2 sm:col-span-7 sm:col-start-6">
            Eight systems, from bare-metal firmware to FEA-validated mechanisms. Each one covers the problem, what I
            built, the stack, how it was validated and the results.
          </p>
        </Reveal>
      </Container>

      <Container className="pt-10 sm:pt-12">
        <ProjectsIndex projects={projects} />
      </Container>
    </>
  );
}
