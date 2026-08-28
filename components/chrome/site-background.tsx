"use client";

import dynamic from "next/dynamic";

import { CursorGradient } from "@/components/effects/cursor-gradient";

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

/**
 * Both background layers, in paint order.
 *
 * The cursor wash is first so it sits behind the scatter — the dots read as
 * catching the light rather than floating over a coloured shape. Both are at
 * z-field, so DOM order is what separates them.
 *
 * The wash is not deferred alongside the canvas: it is a div and a listener,
 * it costs nothing to ship, and it is the layer that should be there first.
 */
export function SiteBackground() {
  return (
    <>
      <CursorGradient />
      <EmbeddingField className="pointer-events-none fixed inset-0 z-field h-full w-full" />
    </>
  );
}
