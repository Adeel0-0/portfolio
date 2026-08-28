"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useMotionValueEvent,
  useScroll,
  type MotionValue,
} from "@/lib/motion";
import {
  FIRST_SECTION_ID,
  LAST_SECTION_ID,
  SECTIONS,
  type SectionId,
} from "@/lib/sections";

/**
 * Page-level scroll state, owned in exactly one place.
 *
 * Two contexts rather than one, deliberately. Scroll progress changes every
 * frame and the active section changes about five times per page; if they
 * shared a context, every section change would re-render the rev strip and the
 * canvas for nothing, and every frame would re-render the nav.
 *
 * `scrollYProgress` is exposed as a MotionValue and never as React state, so
 * scrolling costs zero renders — consumers bind it straight to `style`.
 */

type ScrollMotion = { scrollYProgress: MotionValue<number> };
type ActiveSection = {
  activeId: SectionId;
  scrollTo: (id: SectionId) => void;
};

const ScrollMotionContext = createContext<ScrollMotion | null>(null);
const ActiveSectionContext = createContext<ActiveSection | null>(null);

/** How long observer updates are ignored after a nav click, in ms. */
const SCROLL_LOCK_MS = 700;

/**
 * Fraction of the page past which the last section is forced active.
 *
 * A section shorter than the viewport never crosses the middle band the
 * observer watches, so Contact would otherwise never light up in the nav. This
 * is the standard failure of the scroll-spy pattern and it needs an explicit
 * escape hatch, not a smaller rootMargin.
 */
const END_OF_PAGE = 0.995;

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const [activeId, setActiveId] = useState<SectionId>(FIRST_SECTION_ID);

  /** Observer updates are suppressed until this timestamp. */
  const lockUntil = useRef(0);
  /** Which sections currently straddle the viewport's middle band. */
  const intersecting = useRef(new Set<SectionId>());

  const scrollTo = useCallback((id: SectionId) => {
    const target = document.getElementById(id);
    if (!target) return;

    // Inherits `scroll-behavior: smooth` from html, which the reduced-motion
    // block in globals.css already resets to auto. No branch needed here.
    target.scrollIntoView({ block: "start" });

    // Show the destination immediately, and stop the observer from walking the
    // pip through every section the smooth scroll passes over on the way.
    setActiveId(id);
    lockUntil.current = performance.now() + SCROLL_LOCK_MS;
  }, []);

  useEffect(() => {
    const elements = SECTIONS.map((section) =>
      document.getElementById(section.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          if (entry.isIntersecting) intersecting.current.add(id);
          else intersecting.current.delete(id);
        }

        if (performance.now() < lockUntil.current) return;

        // Resolve in document order rather than trusting entry order, so
        // overlapping sections always settle on the higher one.
        const next = SECTIONS.find((section) =>
          intersecting.current.has(section.id)
        );
        if (next) setActiveId(next.id);
      },
      // Only the middle 10% of the viewport counts as "here". Wider bands make
      // two sections active at once on tall screens.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    for (const el of elements) observer.observe(el);

    // Deep links: honour the hash on mount, and hold it while the browser
    // performs its own jump to the anchor.
    const hash = window.location.hash.slice(1) as SectionId;
    if (hash && SECTIONS.some((section) => section.id === hash)) {
      setActiveId(hash);
      lockUntil.current = performance.now() + SCROLL_LOCK_MS;
    }

    return () => observer.disconnect();
  }, []);

  // Piggybacks framer-motion's existing frameloop rather than adding a second
  // scroll listener just to notice we reached the bottom.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value < END_OF_PAGE) return;
    if (performance.now() < lockUntil.current) return;
    setActiveId((current) =>
      current === LAST_SECTION_ID ? current : LAST_SECTION_ID
    );
  });

  const motionValue = useMemo(() => ({ scrollYProgress }), [scrollYProgress]);
  const activeValue = useMemo(
    () => ({ activeId, scrollTo }),
    [activeId, scrollTo]
  );

  return (
    <ScrollMotionContext.Provider value={motionValue}>
      <ActiveSectionContext.Provider value={activeValue}>
        {children}
      </ActiveSectionContext.Provider>
    </ScrollMotionContext.Provider>
  );
}

export function useScrollProgress(): MotionValue<number> {
  const context = useContext(ScrollMotionContext);
  if (!context) {
    throw new Error("useScrollProgress must be used inside <ScrollProvider>");
  }
  return context.scrollYProgress;
}

export function useActiveSection(): ActiveSection {
  const context = useContext(ActiveSectionContext);
  if (!context) {
    throw new Error("useActiveSection must be used inside <ScrollProvider>");
  }
  return context;
}
