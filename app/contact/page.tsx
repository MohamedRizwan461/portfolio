import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/contact-form";
import { Mask, Reveal } from "@/components/motion-bits";
import { Container } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Mohamed Rizwan Ameer John by email, LinkedIn or GitHub.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

const channels = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "LinkedIn", value: "Mohamed Rizwan Ameer John", href: site.linkedin, external: true },
  { label: "GitHub", value: "MohamedRizwan461", href: site.github, external: true },
];

export default function ContactPage() {
  return (
    <Container className="pt-36 sm:pt-44">
      <Mask>
        <p className="eyebrow">Contact</p>
      </Mask>
      <h1 className="display mt-6 text-[clamp(3.75rem,12vw,10rem)] leading-[0.92]">
        <Mask delay={0.08}>Let&apos;s talk.</Mask>
      </h1>
      <Reveal delay={0.3} className="mt-12 grid gap-6 border-t border-rule pt-6 sm:grid-cols-12">
        <p className="eyebrow sm:col-span-4">Robotics · Embedded · EV</p>
        <p className="text-lg leading-relaxed font-light text-ink-2 sm:col-span-7 sm:col-start-6 sm:text-xl">
          Hiring for robotics, embedded or EV work, or want to talk through a project? Any of these reach me directly.
        </p>
      </Reveal>

      <ul className="mt-20 border-t border-rule">
        {channels.map(({ label, value, href, external }, i) => (
          <li key={label} className="border-b border-rule">
            <Reveal delay={0.05 * i}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener" } : {})}
                className="group grid grid-cols-12 items-center gap-4 py-8 no-underline sm:py-10"
              >
                <span className="eyebrow col-span-12 sm:col-span-3">
                  {String(i + 1).padStart(2, "0")} <span className="mx-2 opacity-40">/</span> {label}
                </span>
                <span className="display col-span-10 text-[clamp(1.5rem,4vw,3rem)] break-words text-ink transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 sm:col-span-8">
                  {value}
                </span>
                <span className="col-span-2 flex justify-end sm:col-span-1">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-rule-strong text-ink transition-all duration-500 group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-ground">
                    <ArrowUpRight size={18} weight="bold" aria-hidden />
                  </span>
                </span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>

      <section aria-labelledby="message" className="mt-32 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">Or write here</p>
          <h2 id="message" className="display mt-4 text-[clamp(2rem,4vw,3rem)]">
            Send a message
          </h2>
          <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-ink-2">
            Opens your email app with the message filled in. Nothing is stored on this site.
          </p>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <ContactForm email={site.email} />
        </div>
      </section>
    </Container>
  );
}
