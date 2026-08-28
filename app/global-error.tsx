"use client";

import { useEffect } from "react";

/**
 * The last line of defence: a throw in RootLayout itself.
 *
 * `error.tsx` cannot catch this, because it renders *inside* the layout that
 * failed. This one replaces the layout wholesale, which is why it has to
 * supply its own <html> and <body>.
 *
 * Styled with inline styles on purpose. globals.css is imported by the root
 * layout, and the root layout is precisely what did not render — so Tailwind
 * classes and the design tokens cannot be assumed to exist here. Hardcoding
 * the two palette values is the correct trade for a page that must render when
 * everything else is broken. They are `--rb-bg` and `--rb-fg` from globals.css.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#070B18",
          color: "#E8ECF5",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ maxWidth: "46ch" }}>
          <p
            style={{
              margin: "0 0 1rem",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#E1112C",
            }}
          >
            {"// Session stopped"}
          </p>

          <h1
            style={{
              margin: "0 0 1rem",
              fontSize: "1.875rem",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            This site failed to load.
          </h1>

          <p style={{ margin: "0 0 1.75rem", lineHeight: 1.6, color: "#8894B0" }}>
            Something broke before the page could start. Reloading usually
            clears it.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: "9999px",
              padding: "0.75rem 1.5rem",
              background: "#E1112C",
              color: "#FFFFFF",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              cursor: "pointer",
            }}
          >
            Reload
          </button>

          {error.digest && (
            <p
              style={{
                margin: "1.5rem 0 0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.75rem",
                color: "#8894B0",
              }}
            >
              Ref {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
