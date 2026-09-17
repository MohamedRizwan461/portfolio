import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Backdrop } from "@/components/backdrop";
import { SiteHeader } from "@/components/site-header";
import { ThemeApplier } from "@/components/theme-applier";
import { ConditionalFooter } from "@/components/site-chrome";
import { site } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Mohamed Rizwan Ameer John (Riz), robotics and embedded systems engineer. Firmware, robots and computer vision on real hardware, three filed Indian patents.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} (Riz) | Robotics & Embedded Systems Engineer`,
    template: `%s | ${site.name}`,
  },
  description,
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | ${site.role}`,
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  verification: { google: "5aNEJI4tRYrHMu2sRpW7GoRvO6qQL3LqcWJQYL277lY" },
};

export const viewport: Viewport = {
  themeColor: "#0d0f12",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <ThemeApplier />
        <Backdrop />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: site.name,
              alternateName: ["Riz", "Mohamed Rizwan", "Mohamed Rizwan A"],
              url: site.url,
              image: `${site.url}/images/riz/headshot-cut.png`,
              jobTitle: site.role,
              email: `mailto:${site.email}`,
              address: { "@type": "PostalAddress", addressLocality: "Chicago", addressRegion: "IL", addressCountry: "US" },
              alumniOf: [
                { "@type": "CollegeOrUniversity", name: "Governors State University" },
                { "@type": "CollegeOrUniversity", name: "KCG College of Technology" },
              ],
              knowsAbout: ["Embedded systems", "Robotics", "Firmware", "Computer vision", "CAN bus", "Autonomous vehicles"],
              sameAs: [site.linkedin, site.github],
            }),
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
