import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ShaderBackground } from "@/components/ui/adisyon-shader";
import { SpatialNeuralPreloader } from "@/components/ui/spatial-neural-preloader";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const title = "Syed Mohammad Adeel — AI/ML & Software Engineer";
const description =
  "Portfolio of Syed Mohammad Adeel: AI-powered backend systems, embeddings & vector search, RAG pipelines, computer vision, and production APIs.";

export const metadata: Metadata = {
  metadataBase: new URL("https://adeel-portfolio.vercel.app"),
  title,
  description,
  keywords: [
    "AI Engineer",
    "ML Engineer",
    "Backend Engineer",
    "RAG",
    "Vector Search",
    "Python",
    "FastAPI",
  ],
  authors: [{ name: "Syed Mohammad Adeel" }],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_US",
    siteName: "Syed Mohammad Adeel",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} font-sans`}>
        {/* Without JS the prerendered markup would keep the preloader overlay up
            and leave every scroll-reveal at opacity 0 — i.e. a black screen.
            The content is server-rendered, so it should still be readable. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                ".js-preloader{display:none!important}.reveal{opacity:1!important;transform:none!important}",
            }}
          />
        </noscript>
        <SpatialNeuralPreloader />
        <ShaderBackground className="fixed inset-0 -z-10 h-full w-full" />
        {children}
      </body>
    </html>
  );
}
