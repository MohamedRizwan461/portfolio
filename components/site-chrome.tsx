"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./ui";

/** Full-screen pages, and the contact page that already is the sign-off, go without the footer. */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/start" || pathname.startsWith("/about") || pathname === "/contact" || pathname.startsWith("/story")) return null;
  return <SiteFooter />;
}
