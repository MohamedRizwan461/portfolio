import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabSwitcher } from "@/components/story/lab";
import { StoryChat } from "@/components/story/story-chat";
import { StoryDrive } from "@/components/story/story-drive";
import { StoryFilm } from "@/components/story/story-film";
import { StoryWatch } from "@/components/story/story-watch";

const STYLES = ["film", "drive", "chat", "watch"] as const;
type Style = (typeof STYLES)[number];

export const dynamicParams = false;

export function generateStaticParams() {
  return STYLES.map((style) => ({ style }));
}

// prototypes to compare, kept out of search
export const metadata: Metadata = {
  title: "About prototypes",
  robots: { index: false, follow: false },
};

export default async function StoryPrototype({ params }: { params: Promise<{ style: string }> }) {
  const { style } = await params;
  if (!STYLES.includes(style as Style)) notFound();
  return (
    <>
      <h1 className="sr-only">About Mohamed Rizwan Ameer John</h1>
      <LabSwitcher />
      {style === "film" && <StoryFilm />}
      {style === "drive" && <StoryDrive />}
      {style === "chat" && <StoryChat />}
      {style === "watch" && <StoryWatch />}
    </>
  );
}
