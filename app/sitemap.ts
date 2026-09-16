import type { MetadataRoute } from "next";
import { projects, site } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/projects", "/about", "/resume", "/contact", ...projects.map((p) => `/projects/${p.slug}`)];
  return routes.map((route) => ({ url: `${site.url}${route}` }));
}
