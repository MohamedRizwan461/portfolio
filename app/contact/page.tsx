import type { Metadata } from "next";
import { EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/motion-bits";
import { Branch, Wire, WireSection } from "@/components/wire";
import { Container } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Mohamed Rizwan Ameer John by email, LinkedIn or GitHub.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

const channels = [
  { label: "Email", value: site.email, href: `mailto:${site.email}`, Icon: EnvelopeSimple },
  { label: "LinkedIn", value: "mohamed-rizwan-ameer-john-3a459a231", href: site.linkedin, Icon: LinkedinLogo, external: true },
  { label: "GitHub", value: "MohamedRizwan461", href: site.github, Icon: GithubLogo, external: true },
];

export default function ContactPage() {
  return (
    <Container className="pt-10 sm:pt-16">
      <Reveal>
        <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] sm:text-6xl">Contact</h1>
        <p className="mt-6 max-w-[52ch] text-xl leading-snug text-ink-2 sm:text-2xl">
          Hiring for robotics, embedded or EV work, or want to talk through a project? Any of these reach me
          directly.
        </p>
      </Reveal>

      <Wire className="mt-16 space-y-14">
        <WireSection title="Direct" id="channels">
          <ul className="mt-4 max-w-xl">
            {channels.map(({ label, value, href, Icon, external }) => (
              <li key={label} className="border-b border-rule">
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener" } : {})}
                  className="ease group grid grid-cols-[1.5rem_5rem_1fr] items-center gap-3 py-4 no-underline hover:text-accent"
                >
                  <Icon size={20} aria-hidden />
                  <span className="text-sm text-ink-2 group-hover:text-accent">{label}</span>
                  <span className="font-mono text-sm break-words">{value}</span>
                </a>
              </li>
            ))}
          </ul>
        </WireSection>

        <WireSection title="Send a message" id="message">
          <p className="mt-4 text-sm text-ink-2">
            Opens your email app with the message filled in. Nothing is stored on this site.
          </p>
          <Branch>
            <div className="max-w-2xl">
              <ContactForm email={site.email} />
            </div>
          </Branch>
        </WireSection>
      </Wire>
    </Container>
  );
}
