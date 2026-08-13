import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SpatialNeuralPreloader } from "@/components/ui/spatial-neural-preloader";
import { content } from "@/data";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
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
      <body className={`${spaceGrotesk.variable} font-sans`}>
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
        {children}
      </body>
    </html>
  );
}
