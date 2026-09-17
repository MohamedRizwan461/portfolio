import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = "Mohamed Rizwan Ameer John, Robotics and Embedded Systems Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/images/riz/portrait-cut.png"));
  const photoSrc = `data:image/png;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "radial-gradient(circle at 22% 8%, #1b2a44 0%, #06080b 58%), #06080b",
          color: "#eef1f5",
          padding: "62px 70px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 21, letterSpacing: 4, color: "#9aa3b0", textTransform: "uppercase" }}>
            <div style={{ display: "flex", width: 9, height: 9, borderRadius: 9, background: "#3fa9ff", marginRight: 14 }} />
            Robotics · Embedded · Autonomy
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 74 }}>
            <div style={{ fontSize: 78, fontWeight: 300, letterSpacing: -3, lineHeight: 1.02 }}>Mohamed Rizwan</div>
            <div style={{ fontSize: 78, fontWeight: 300, letterSpacing: -3, lineHeight: 1.02, color: "#8c96a3" }}>Ameer John</div>
            <div style={{ fontSize: 29, marginTop: 30, maxWidth: 620, color: "#c3cbd4", lineHeight: 1.35 }}>
              Firmware, robots and vision systems that run on real hardware.
            </div>
          </div>
          <div style={{ display: "flex", marginTop: "auto", gap: 10 }}>
            {["3 patents filed", "IEEE YESIST12 Finalist", "MS CS 2026"].map((t) => (
              <div key={t} style={{ display: "flex", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "9px 18px", fontSize: 20, color: "#cfd6de" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 360 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoSrc} width={380} height={343} alt="" style={{ objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", position: "absolute", left: 70, bottom: 26, fontSize: 19, letterSpacing: 3, color: "#5f6a77", textTransform: "uppercase" }}>
          {site.url.replace("https://", "")}
        </div>
      </div>
    ),
    size,
  );
}
