import { ImageResponse } from "next/og";
import { profile, stats } from "@/data/resume";

// Deliberately no `runtime = "edge"`: on the Node runtime Next prerenders this
// to a static PNG at build time. Edge would make it render per request.
export const alt = "Syed Mohammad Adeel — AI/ML & Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Theme tokens from app/globals.css, resolved to hex — ImageResponse has no
// access to Tailwind or CSS custom properties.
const BACKGROUND = "#0f1729";
const PRIMARY = "#00eeff";
const MUTED = "#b6c2d9";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${BACKGROUND} 0%, #16233d 100%)`,
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: PRIMARY,
          }}
        >
          {profile.role}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            lineHeight: 1.05,
          }}
        >
          {profile.name}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 900,
            fontSize: 30,
            color: MUTED,
            lineHeight: 1.4,
          }}
        >
          {profile.tagline}
        </div>

        <div style={{ display: "flex", marginTop: 56, gap: 64 }}>
          {stats.map((s) => (
            <div key={s.value} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: PRIMARY }}>
                {s.value}
              </div>
              <div style={{ marginTop: 6, fontSize: 20, color: MUTED, maxWidth: 300 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
