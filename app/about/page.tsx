import type { Metadata } from "next";
import { AboutDrive } from "@/components/story/about-drive";
import { beats } from "@/lib/story";

export const metadata: Metadata = {
  title: "About",
  description:
    "From biology to assistive robotics to autonomous vehicles: how Riz got from an electronics degree in Chennai to building robots and firmware in Chicago.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <h1 className="sr-only">About Mohamed Rizwan Ameer John</h1>
      {/* the story in plain text: for search engines, screen readers and anyone skimming */}
      <div className="sr-only">
        {beats.map((b) => (
          <section key={b.id}>
            <h2>
              {b.label}, {b.years}
            </h2>
            {b.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </section>
        ))}
      </div>
      <AboutDrive />
    </>
  );
}
