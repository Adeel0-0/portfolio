"use client";

import { RaceControlProvider } from "@/components/chrome/race-control";
import { SkillFocusProvider } from "@/components/effects/skill-focus";
import { LazyMotion, MotionConfig } from "@/lib/motion";
import { ScrollProvider } from "./scroll-provider";

/**
 * Fetched on demand rather than imported at the top of the file. Passing the
 * feature object directly would bundle it into the main chunk, which is the
 * mistake LazyMotion exists to prevent.
 */
const loadMotionFeatures = () =>
  import("@/lib/motion-features").then((mod) => mod.default);

/**
 * Every client-side provider the page needs, in one boundary.
 *
 * Takes `children` as a prop rather than importing the page tree, which keeps
 * the "use client" directive from propagating into app/page.tsx — the sections
 * stay server components and ship no JS of their own.
 *
 * `strict` on LazyMotion is load-bearing, not caution: it throws at runtime if
 * any component imports the full `motion` object instead of `m`. That is what
 * holds the bundle at roughly 5 KB up front with the rest loaded lazily, versus
 * ~34 KB for all of framer-motion. `domAnimation` deliberately excludes layout
 * animations and drag, so nothing here may use `layoutId` — the nav notch is
 * built from a transform and a spring for exactly that reason.
 *
 * `reducedMotion="user"` covers declarative motion (animate, whileHover,
 * variants) automatically. It does NOT cover MotionValues bound to style, so
 * scroll-linked work still has to branch on useReducedMotion() explicitly.
 */
export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <ScrollProvider>
          <RaceControlProvider>
            <SkillFocusProvider>{children}</SkillFocusProvider>
          </RaceControlProvider>
        </ScrollProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
