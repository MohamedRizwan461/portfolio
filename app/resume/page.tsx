import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Mask, Reveal } from "@/components/motion-bits";
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
    <Container className="pt-28 sm:pt-36">
      <Mask>
        <p className="eyebrow">
          Document <span className="mx-2 opacity-40">/</span> 2 pages <span className="mx-2 opacity-40">/</span> PDF
        </p>
      </Mask>
      <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="display text-[clamp(2.5rem,5.2vw,4.25rem)]">
          <Mask delay={0.08}>Resume</Mask>
        </h1>
        <Reveal delay={0.3} className="flex flex-wrap gap-3 lg:pb-1">
          <ButtonAnchor href={site.resumePdf} download>
            <DownloadSimple size={16} weight="bold" aria-hidden /> Download resume
          </ButtonAnchor>
          <ButtonAnchor href={site.resumePdf} target="_blank" rel="noopener" variant="secondary">
            Open in new tab <ArrowUpRight size={16} weight="bold" aria-hidden />
          </ButtonAnchor>
        </Reveal>
      </div>

      <Reveal delay={0.4} className="mt-10 border-t border-rule pt-8">
        {/* Desktop: the browser's own PDF viewer, framed like a document on a desk */}
        <div className="hidden border border-rule bg-[var(--surface)] p-2 shadow-[0_50px_120px_-50px_rgba(0,0,0,0.9)] md:block">
          <iframe src={`${site.resumePdf}#view=FitH`} title="Resume PDF viewer" className="block h-[82vh] min-h-[640px] w-full bg-white" />
        </div>

        {/* Phones cannot scroll embedded PDFs reliably, so show the rendered pages. */}
        <div className="space-y-8 md:hidden">
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
              <figcaption className="eyebrow mt-3">Page {n} of 2</figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </Container>
  );
}
