"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first scrolls into view, then stops observing.
 *
 * Replaces framer-motion's `whileInView` for entrance animations, which is the
 * only thing the library was doing on the content sections.
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reveal immediately rather than never, if the observer is unavailable —
    // sections start at opacity 0, so a silent failure would hide content.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}
