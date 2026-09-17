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
      <Container className="pt-36 sm:pt-44">
        <Mask>
          <p className="eyebrow">
            Selected work <span className="mx-2 opacity-40">/</span> {String(projects.length).padStart(2, "0")}
          </p>
        </Mask>
        <h1 className="display mt-6 text-[clamp(3.75rem,12vw,10rem)] leading-[0.92]">
          <Mask delay={0.08}>Projects</Mask>
        </h1>
        <Reveal delay={0.3} className="mt-12 grid gap-6 border-t border-rule pt-6 sm:grid-cols-12">
          <p className="eyebrow sm:col-span-4">Firmware · Robotics · Autonomy</p>
          <p className="text-lg leading-relaxed font-light text-ink-2 sm:col-span-7 sm:col-start-6 sm:text-xl">
            Eight systems, from bare-metal firmware to FEA-validated mechanisms. Each one covers the problem, what I
            built, the stack, how it was validated and the results.
          </p>
        </Reveal>
      </Container>

      <Container className="pt-20 sm:pt-28">
        <ProjectsIndex projects={projects} />
      </Container>
    </>
  );
}
