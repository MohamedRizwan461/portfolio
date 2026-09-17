import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { projects, site } from "@/lib/content";

export const alt = "Project case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/** A link preview per case study: the title, the stack and the cover. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return new ImageResponse(<div />, size);

  let cover: string | null = null;
  if (project.cover.src) {
    try {
      const file = await readFile(join(process.cwd(), "public", project.cover.src));
      const type = project.cover.src.endsWith(".png") ? "png" : "jpeg";
      cover = `data:image/${type};base64,${file.toString("base64")}`;
    } catch {}
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "radial-gradient(circle at 78% 10%, #1a2740 0%, #06080b 60%), #06080b",
          color: "#eef1f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "60px 0 56px 68px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 21, letterSpacing: 4, color: "#9aa3b0", textTransform: "uppercase" }}>
            <span style={{ color: "#3fa9ff", flexShrink: 0 }}>{project.date}</span>
            <span style={{ margin: "0 14px", opacity: 0.4 }}>/</span>
            <span>{project.context.length > 34 ? `${project.context.slice(0, 32)}...` : project.context}</span>
          </div>
          <div style={{ display: "flex", fontSize: project.title.length > 30 ? 62 : 74, fontWeight: 300, letterSpacing: -2.5, lineHeight: 1.05, marginTop: 34, maxWidth: cover ? 600 : 1000 }}>
            {project.title}
          </div>
          <div style={{ display: "flex", fontSize: 25, color: "#9aa3b0", marginTop: 24, maxWidth: cover ? 540 : 900, lineHeight: 1.35 }}>
            {project.problem.length > 118 ? `${project.problem.slice(0, 115)}...` : project.problem}
          </div>
          <div style={{ display: "flex", marginTop: "auto", gap: 10, maxWidth: cover ? 560 : 1000, paddingTop: 24 }}>
            {project.stack.slice(0, 4).map((s) => (
              <div key={s} style={{ display: "flex", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "7px 16px", fontSize: 19, color: "#cfd6de" }}>
                {s}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 30, fontSize: 21, letterSpacing: 3, color: "#6f7a86", textTransform: "uppercase" }}>
            <div style={{ display: "flex", width: 9, height: 9, borderRadius: 9, background: "#3fa9ff", marginRight: 14 }} />
            {site.name}
          </div>
        </div>
        {cover && (
          <div style={{ display: "flex", width: 470, height: "100%", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} width={470} height={630} alt="" style={{ objectFit: "cover", width: 470, height: 630 }} />
          </div>
        )}
      </div>
    ),
    size,
  );
}
