import { ImageResponse } from "next/og";
import { profile, stats, content } from "@/data";

// Deliberately no `runtime = "edge"`: on the Node runtime Next prerenders this
// to a static PNG at build time. Edge would make it render per request.
export const alt = content.siteMeta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse can't read Tailwind classes or CSS custom properties, so the
// palette has to be inlined as hex. Mirrors the --rb-* tier in app/globals.css
// and must be edited alongside it (and alongside app/icon.svg).
const BACKGROUND = "#070B18"; // --rb-bg
const BACKGROUND_TO = "#0D1428"; // --rb-surface
const PRIMARY = "#E8ECF5"; // --rb-fg
const MUTED = "#8894B0"; // --rb-dim
const BRAND = "#E1112C"; // --rb-red
const BEST = "#B14BF4"; // --rb-purple

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
          background: `linear-gradient(135deg, ${BACKGROUND} 0%, ${BACKGROUND_TO} 100%)`,
          padding: "80px",
        }}
      >
        {/* Livery stripe — the only brand-red mark on the card. */}
        <div
          style={{ display: "flex", width: 96, height: 6, background: BRAND }}
        />

        <div
          style={{
            display: "flex",
            marginTop: 28,
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
              {/* Timing purple marks the personal best, exactly as on the page.
                  Only one stat carries it, or the signal stops meaning anything. */}
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  color: s.best ? BEST : PRIMARY,
                }}
              >
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
