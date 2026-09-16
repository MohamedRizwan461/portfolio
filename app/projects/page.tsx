import type { Metadata } from "next";
import { Reveal } from "@/components/motion-bits";
import { ProjectsWire } from "@/components/projects-wire";
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
      <Container className="pt-10 sm:pt-16">
        <Reveal>
          <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] sm:text-6xl">Projects</h1>
          <p className="mt-6 max-w-[58ch] text-xl leading-snug text-ink-2 sm:text-2xl">
            Eight systems, from bare-metal firmware to FEA-validated mechanisms. Each one covers the problem, what I
            built, the stack, how it was validated and the results.
          </p>
        </Reveal>
      </Container>

      <Container className="pt-14 pb-8 sm:pt-20">
        <ProjectsWire projects={projects} />
      </Container>
    </>
  );
}
