"use client";

import dynamic from "next/dynamic";

/**
 * The three pieces of chrome that have no business being in the initial bundle.
 *
 * None contributes to SEO, LCP, or the no-JS experience: the mascot and track
 * map are decoration, and the terminal is an easter egg nobody can trigger
 * before hydration anyway. All three also gate on the preloader finishing, so
 * fetching them during it costs nothing visible.
 *
 * `ssr: false` requires a client component in Next 14, which is the only reason
 * this wrapper exists — app/layout.tsx is a server component.
 */

const Mascot = dynamic(
  () => import("@/components/mascot").then((m) => m.Mascot),
  { ssr: false }
);

const TerminalOverlay = dynamic(
  () => import("@/components/terminal/terminal-overlay").then((m) => m.TerminalOverlay),
  { ssr: false }
);

const TrackMap = dynamic(
  () => import("@/components/chrome/track-map").then((m) => m.TrackMap),
  { ssr: false }
);

export function DeferredChrome() {
  return (
    <>
      <TrackMap />
      <Mascot />
      <TerminalOverlay />
    </>
  );
}
