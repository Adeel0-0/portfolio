import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { DeferredChrome } from "@/components/chrome/deferred-chrome";
import { RevStrip } from "@/components/chrome/rev-strip";
import { SiteBackground } from "@/components/chrome/site-background";
import { NavDock } from "@/components/nav/nav-dock";
import { SiteProviders } from "@/components/providers/site-providers";
import { SpatialNeuralPreloader } from "@/components/ui/spatial-neural-preloader";
import { content } from "@/data";

/**
 * Two faces, one rule: Space Grotesk for anything a human wrote, JetBrains Mono
 * for anything that would appear on a timing screen — metrics, deltas, stack
 * chips, the terminal. That split is the design.
 *
 * Neither declares `weight`, which is what selects the variable font: one woff2
 * covering the whole axis instead of a separate file per weight.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const { siteMeta } = content;

export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.url),
  title: siteMeta.title,
  description: siteMeta.description,
  keywords: siteMeta.keywords,
  authors: [{ name: siteMeta.author }],
  openGraph: {
    title: siteMeta.title,
    description: siteMeta.description,
    type: "website",
    locale: siteMeta.locale,
    siteName: siteMeta.siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteMeta.title,
    description: siteMeta.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}
      >
        {/* Without JS the prerendered markup would keep the preloader overlay
            up forever — it covers the whole viewport, so the page would read as
            a dead black screen. The content itself is server-rendered. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: ".js-preloader{display:none!important}",
            }}
          />
        </noscript>
        <SpatialNeuralPreloader />
        <SiteProviders>
          {/* Fixed chrome lives OUTSIDE #site-shell, and this is load-bearing.
              globals.css transforms that wrapper while the preloader hands off,
              and a transformed ancestor becomes the containing block for
              position:fixed. Nested inside, the dock would anchor to the bottom
              of the document — thousands of pixels below the fold — and then
              snap into place at the end of the launch, in full view, because
              the overlay has already faded by then. */}
          <SiteBackground />
          <RevStrip />
          <NavDock />
          <DeferredChrome />
          {/* Target for the preloader hand-off in globals.css — the page pushes
              forward into place as the overlay dives past. Left untouched
              whenever the preloader is skipped.

              `relative z-content` puts it above the canvas explicitly. The
              canvas cannot simply take a negative z-index: body paints an
              opaque background, so anything behind it disappears. Note this
              creates a stacking context but NOT a containing block — only
              transform, filter and will-change do that, which is exactly why
              the fixed chrome above still has to live outside this div. */}
          <div id="site-shell" className="relative z-content">
            {children}
          </div>
        </SiteProviders>
      </body>
    </html>
  );
}
