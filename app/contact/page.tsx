import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, DownloadSimple, EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/contact-form";
import { Mask, Reveal } from "@/components/motion-bits";
import { ButtonAnchor, Container } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Resume & Contact",
  description:
    "Resume of Mohamed Rizwan Ameer John, robotics and embedded systems engineer, with email, LinkedIn and GitHub. View or download the PDF.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

const channels = [
  { label: "Email", value: site.email, href: `mailto:${site.email}`, Icon: EnvelopeSimple },
  { label: "LinkedIn", value: "Mohamed Rizwan Ameer John", href: site.linkedin, external: true, Icon: LinkedinLogo },
  { label: "GitHub", value: "MohamedRizwan461", href: site.github, external: true, Icon: GithubLogo },
];

export default function ContactPage() {
  return (
    <Container className="pt-24 pb-8 sm:pt-28">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* reach me; on phones this column dissolves so the resume sits before the form */}
        <div className="contents lg:col-span-5 lg:block">
          <div className="order-1">
          <Mask>
            <p className="eyebrow">Resume &amp; contact</p>
          </Mask>
          <h1 className="display mt-3 text-[clamp(1.75rem,2.6vw,2.4rem)] !tracking-[-0.035em]">
            <Mask delay={0.08}>Let&apos;s talk.</Mask>
          </h1>
          <Reveal delay={0.2}>
            <p className="mt-3 max-w-[44ch] text-[0.98rem] leading-relaxed font-light text-ink-2">
              Hiring for robotics, embedded or EV work, or want to talk through a project? Any of these reach me directly.
            </p>
          </Reveal>

          <ul className="mt-6 border-t border-rule">
            {channels.map(({ label, value, href, external, Icon }, i) => (
              <li key={label} className="border-b border-rule">
                <Reveal delay={0.25 + 0.05 * i}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener" } : {})}
                    className="group flex items-center gap-4 py-3 no-underline"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rule-strong bg-[color-mix(in_srgb,var(--ink)_4%,transparent)] text-ink transition-colors duration-500 group-hover:border-accent group-hover:text-accent">
                      <Icon size={18} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="eyebrow block !text-[0.6rem]">{label}</span>
                      <span className="mt-0.5 block truncate text-[1rem] font-light tracking-tight text-ink transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                        {value}
                      </span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule-strong text-ink transition-all duration-500 group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-ground">
                      <ArrowUpRight size={13} weight="bold" aria-hidden />
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
          </div>

          <Reveal delay={0.4} className="order-3 lg:mt-7">
            <section aria-labelledby="message">
              <h2 id="message" className="eyebrow">
                Or send a message
              </h2>
              <p className="mt-1.5 text-xs text-ink-2">Opens your email app with it filled in. Nothing is stored here.</p>
              <div className="mt-4">
                <ContactForm email={site.email} />
              </div>
            </section>
          </Reveal>
        </div>

        {/* the resume, pinned beside it */}
        <aside aria-labelledby="resume" className="order-2 lg:order-none lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="resume" className="eyebrow">
                  Resume <span className="mx-2 opacity-40">/</span> 2 pages <span className="mx-2 opacity-40">/</span> PDF
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonAnchor href={site.resumePdf} download className="!h-10 !px-4">
                  <DownloadSimple size={15} weight="bold" aria-hidden /> Download
                </ButtonAnchor>
                <ButtonAnchor href={site.resumePdf} target="_blank" rel="noopener" variant="secondary" className="!h-10 !px-4">
                  Open <ArrowUpRight size={14} weight="bold" aria-hidden />
                </ButtonAnchor>
              </div>
            </div>

            {/* desktop: the browser's own PDF viewer, as tall as the window allows */}
            <div className="mt-4 hidden border border-rule bg-[var(--surface)] p-1.5 shadow-[0_50px_120px_-50px_rgba(0,0,0,0.9)] md:block">
              <iframe
                src={`${site.resumePdf}#navpanes=0&view=FitH`}
                title="Resume PDF viewer"
                className="block h-[calc(100dvh-13.25rem)] min-h-[480px] w-full bg-white"
              />
            </div>

            {/* phones: the first page as a preview; the full PDF is one tap away */}
            <a href={site.resumePdf} target="_blank" rel="noopener" className="group relative mt-4 block overflow-hidden border border-rule md:hidden">
              <Image
                src="/resume/page-1.png"
                width={1224}
                height={1584}
                alt="Resume, page 1"
                sizes="100vw"
                className="h-[62vh] w-full bg-white object-cover object-top"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent px-4 pt-12 pb-4 text-sm text-white">
                Page 1 of 2
                <span className="inline-flex items-center gap-1.5 font-medium">
                  Open full PDF <ArrowUpRight size={14} weight="bold" aria-hidden />
                </span>
              </span>
            </a>
          </div>
        </aside>
      </div>
    </Container>
  );
}
