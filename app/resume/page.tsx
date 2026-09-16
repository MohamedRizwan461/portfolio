import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion-bits";
import { Wire, WireSection } from "@/components/wire";
import { ButtonAnchor, Container } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume of Mohamed Rizwan Ameer John, robotics and embedded systems engineer. View or download the PDF.",
  alternates: { canonical: "/resume" },
  openGraph: { url: "/resume" },
};

export default function ResumePage() {
  return (
    <Container className="pt-10 sm:pt-16">
      <Reveal className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] sm:text-6xl">Resume</h1>
          <p className="mt-4 text-lg text-ink-2">Two pages. PDF, 310 KB.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonAnchor href={site.resumePdf} download>
            Download resume <DownloadSimple size={16} weight="bold" aria-hidden />
          </ButtonAnchor>
          <ButtonAnchor href={site.resumePdf} target="_blank" rel="noopener" variant="secondary">
            Open in new tab <ArrowUpRight size={16} weight="bold" aria-hidden />
          </ButtonAnchor>
        </div>
      </Reveal>

      <Wire className="mt-10">
        <WireSection title="The document" id="document" meta="2 pages">
      {/* Desktop: the browser's own PDF viewer. */}
      <div className="mt-6 hidden border border-rule md:block">
        <iframe
          src={`${site.resumePdf}#view=FitH`}
          title="Resume PDF viewer"
          className="block h-[80vh] min-h-[640px] w-full bg-white"
        />
      </div>

      {/* Phones cannot scroll embedded PDFs reliably, so show the rendered pages. */}
      <div className="mt-8 space-y-6 md:hidden">
        {[1, 2].map((n) => (
          <figure key={n} className="m-0">
            <Image
              src={`/resume/page-${n}.png`}
              width={1224}
              height={1584}
              alt={`Resume page ${n}`}
              sizes="100vw"
              className="h-auto w-full border border-rule bg-white"
            />
            <figcaption className="num mt-2 font-mono text-xs text-ink-2">Page {n} of 2</figcaption>
          </figure>
        ))}
      </div>
        </WireSection>
      </Wire>
    </Container>
  );
}
