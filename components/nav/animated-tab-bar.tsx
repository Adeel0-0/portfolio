"use client";

import * as React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import "./animated-tab-bar.css";

/**
 * Icon bar with an indicator that slides behind the active item.
 *
 * Two things worth knowing about:
 *
 *   1. It is controlled. The active section is derived from scroll position, so
 *      ownership has to sit above this component or the two disagree the moment
 *      you scroll.
 *
 *   2. The markup is a <nav> of <button>s rather than a <menu>. These navigate
 *      the page; they are not a menu and not a tablist, and buttons in a nav is
 *      the shape screen readers already understand.
 *
 * The indicator used to be a clip-path arc bulging out of the bar's top edge.
 * animated-tab-bar.css explains at length why that could not be made to sit
 * flush against a bordered pill.
 */

export type TabItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

export type AnimatedTabBarProps = {
  items: TabItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
};

// useLayoutEffect warns when React renders this on the server. The measurement
// genuinely needs to happen before paint on the client, so swap rather than
// downgrade — otherwise the indicator is visibly wrong for one frame on load.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function AnimatedTabBar({
  items,
  activeIndex,
  onSelect,
  className,
}: AnimatedTabBarProps) {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const positionIndicator = useCallback(() => {
    const activeItem = itemRefs.current[activeIndex];
    const indicator = indicatorRef.current;
    if (!activeItem || !indicator) return;

    // offsetLeft rather than getBoundingClientRect: both elements share an
    // offset parent, so this needs no scroll compensation and forces no layout.
    // Width is taken from the button too, so a non-uniform item can never leave
    // the indicator the wrong size — the failure the old fixed-width bulge had
    // no way to avoid.
    indicator.style.width = `${activeItem.offsetWidth}px`;
    indicator.style.transform = `translate3d(${activeItem.offsetLeft}px, 0, 0)`;
  }, [activeIndex]);

  useIsomorphicLayoutEffect(() => {
    positionIndicator();
  }, [positionIndicator]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    /**
     * Re-measure without animating. `--timeOut: none` makes the transition
     * shorthand invalid at computed-value time, which resets it to 0s — see
     * the note in animated-tab-bar.css. A resize should snap, not glide.
     */
    const remeasureInstantly = () => {
      nav.style.setProperty("--timeOut", "none");
      positionIndicator();
      // Restore animation on the next frame, once the jump has painted.
      requestAnimationFrame(() => nav.style.removeProperty("--timeOut"));
    };

    const observer = new ResizeObserver(remeasureInstantly);
    observer.observe(nav);

    /**
     * The single most common bug in this pattern: item widths depend on the
     * font, and next/font swaps the real face in after first paint. Without
     * this the indicator is silently a few pixels off on every single load.
     */
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) remeasureInstantly();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [positionIndicator]);

  return (
    <nav
      ref={navRef}
      aria-label="Sections"
      className={`menu${className ? ` ${className}` : ""}`}
    >
      {/* Before the items, so it paints behind them without needing a negative
          z-index — which would put it behind the bar's own background. */}
      <div ref={indicatorRef} className="menu__indicator" aria-hidden="true" />

      {items.map((item, index) => (
        <button
          key={item.id}
          // Block body, not a concise arrow. The concise form returns the
          // node, which React 19 then calls as a ref cleanup function.
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          type="button"
          className={`menu__item${index === activeIndex ? " active" : ""}`}
          aria-label={item.label}
          aria-current={index === activeIndex ? "true" : undefined}
          onClick={() => onSelect(index)}
        >
          {item.icon}
          <span className="menu__tip" aria-hidden="true">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
