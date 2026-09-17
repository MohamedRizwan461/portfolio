import type { Metadata } from "next";
import { ArrowUpRight, EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/contact-form";
import { Mask, Reveal } from "@/components/motion-bits";
import { ResumeViewer } from "@/components/resume-viewer";
import { Container } from "@/components/ui";
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
            <ResumeViewer pdf={site.resumePdf} />
          </div>
        </aside>
      </div>
    </Container>
  );
}
