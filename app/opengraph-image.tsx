import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Mohamed Rizwan Ameer John, Robotics and Embedded Systems Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/images/riz/headshot-cut.png"));
  const photoSrc = `data:image/png;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "radial-gradient(circle at 20% 15%, #16305e 0%, #06090e 55%), #06090e",
          color: "#eef2f6",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: "#27e0c4" }}>
            <span style={{ fontWeight: 700, color: "#eef2f6", marginRight: 18 }}>RIZ</span>
            BUS OK · CRC OK
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 70 }}>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02 }}>Mohamed Rizwan</div>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02, color: "#9aa7b4" }}>
              Ameer John
            </div>
            <div style={{ fontSize: 32, marginTop: 28, maxWidth: 640 }}>
              Robotics and embedded systems engineer. Firmware, robots and vision systems on real hardware.
            </div>
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontSize: 24, color: "#9aa7b4" }}>
            <span style={{ color: "#4d8dff", fontWeight: 700 }}>3 filed patents</span>
            <span style={{ margin: "0 16px" }}>·</span>
            <span>IEEE YESIST12 International Finalist</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 360 }}>
          <img src={photoSrc} width={330} height={362} alt="" style={{ objectFit: "contain" }} />
        </div>
      </div>
    ),
    size,
  );
}
