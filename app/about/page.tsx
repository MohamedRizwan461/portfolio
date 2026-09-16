import type { Metadata } from "next";
import { ChapterViewer } from "@/components/chapter-viewer";

export const metadata: Metadata = {
  title: "About",
  description:
    "From biology to assistive robotics to autonomous vehicles: how Riz got from an electronics degree in Chennai to building robots and firmware in Chicago.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] min-h-[34rem] w-full max-w-6xl flex-col px-4 pt-5 pb-4 sm:px-8 max-lg:h-auto">
      <h1 className="sr-only">About Mohamed Rizwan Ameer John</h1>
      <ChapterViewer />
    </div>
  );
}
