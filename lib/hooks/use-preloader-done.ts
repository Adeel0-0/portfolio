"use client";

import { useEffect, useState } from "react";

/**
 * True once the preloader has finished and released the page.
 *
 * The preloader writes a `data-preloader` attribute onto <html> for the ~1.1s
 * its sequence runs, then removes it. That window matters for two reasons:
 *
 *   1. While the attribute exists, globals.css transforms #site-shell — which
 *      makes it a containing block. Fixed chrome mounts outside #site-shell to
 *      avoid that, and gates on this hook so it fades in after the launch
 *      rather than sitting over the dive.
 *
 *   2. The preloader binds a global keydown handler that dismisses it. Anything
 *      else listening for keys during that window (the terminal overlay) would
 *      fire simultaneously. Gating on this hook removes the collision.
 *
 * Returns true immediately when the attribute is absent, which covers every
 * path the preloader already short-circuits: repeat visits within a tab,
 * prefers-reduced-motion, and no-JS.
 *
 * Deliberately starts false on the server AND on first client render, so the
 * markup matches across hydration. Consumers render hidden, not absent.
 */
export function usePreloaderDone(): boolean {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (!root.hasAttribute("data-preloader")) {
      setDone(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (!root.hasAttribute("data-preloader")) {
        setDone(true);
        observer.disconnect();
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-preloader"],
    });

    return () => observer.disconnect();
  }, []);

  return done;
}
