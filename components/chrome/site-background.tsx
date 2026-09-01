"use client";

import { CursorGradient } from "@/components/effects/cursor-gradient";

/**
 * The page background.
 *
 * This used to stack a drifting dot scatter (components/ui/embedding-field.tsx)
 * over the cursor wash. The scatter is gone: at the density that read as
 * "embedding space" it also read as a starfield, which pulled the page toward
 * space-scene and away from pit wall, and it cost a full-viewport canvas
 * repaint for the whole life of the page to do it.
 *
 * What is left is a div and a pointermove listener. There is no canvas here any
 * more, so nothing needs deferring and this no longer has to be the client
 * wrapper that a dynamic({ ssr: false }) import required — it stays a component
 * purely so app/layout.tsx keeps one name for "the background".
 */
export function SiteBackground() {
  return <CursorGradient />;
}
