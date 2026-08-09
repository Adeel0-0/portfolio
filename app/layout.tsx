import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ShaderBackground } from "@/components/ui/adisyon-shader";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Syed Mohammad Adeel — AI/ML & Software Engineer",
  description:
    "Portfolio of Syed Mohammad Adeel: AI-powered backend systems, embeddings & vector search, RAG pipelines, computer vision, and production APIs.",
};

import { SpatialNeuralPreloader } from "@/components/ui/spatial-neural-preloader";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} font-sans`}>
        <SpatialNeuralPreloader />
        <ShaderBackground className="fixed inset-0 -z-10 h-full w-full" />
        {children}
      </body>
    </html>
  );
}
