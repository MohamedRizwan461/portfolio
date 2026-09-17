import type { Metadata } from "next";
import Link from "next/link";
import { CarProfile } from "@phosphor-icons/react/dist/ssr";
import { ChapterViewer } from "@/components/chapter-viewer";

export const metadata: Metadata = {
  title: "About, in writing",
  description: "The written version of how Riz got from biology in Chennai to autonomous vehicles in Chicago.",
  alternates: { canonical: "/about/read" },
};

export default function AboutReadPage() {
  return (
    <div className="mx-auto flex h-[100dvh] min-h-[38rem] w-full max-w-6xl flex-col px-4 pt-24 pb-5 max-lg:h-auto sm:px-8 sm:pt-28">
      <h1 className="sr-only">About Mohamed Rizwan Ameer John</h1>
      <Link
        href="/about"
        className="glass fixed top-[5.25rem] right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2 text-[0.78rem] text-ink no-underline sm:top-[5.75rem] sm:right-8"
      >
        <CarProfile size={15} aria-hidden /> Take the drive
      </Link>
      <ChapterViewer />
    </div>
  );
}
