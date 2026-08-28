"use client";

import dynamic from "next/dynamic";

/**
 * Loads the canvas background off the critical path.
 *
 * `ssr: false` needs a client component in Next 14, which is the only reason
 * this wrapper exists — app/layout.tsx is a server component and cannot call
 * dynamic() with that option itself.
 *
 * There is nothing to prerender here: the field is decorative, contributes
 * nothing to SEO or LCP, and drawing it costs a canvas context the server
 * doesn't have. Deferring it keeps it out of the initial bundle entirely.
 */
const EmbeddingField = dynamic(
  () => import("@/components/ui/embedding-field").then((m) => m.EmbeddingField),
  { ssr: false }
);

export function SiteBackground() {
  return (
    <EmbeddingField className="pointer-events-none fixed inset-0 z-field h-full w-full" />
  );
}
