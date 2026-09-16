"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./ui";

/** The deck on the home page carries its own controls, so the footer stays off it. */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/tour" || pathname === "/about") return null;
  return <SiteFooter />;
}
