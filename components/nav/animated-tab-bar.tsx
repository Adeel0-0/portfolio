"use client";

import * as React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import "./animated-tab-bar.css";

/**
 * Icon bar with a bulge that slides under the active item.
 *
 * Adapted from the original in two ways worth knowing about:
 *
 *   1. It is controlled. The original owned `activeIndex` internally, but here
 *      the active section is derived from scroll position, so ownership has to
 *      sit above the component or the two disagree the moment you scroll.
 *
 *   2. The markup is a <nav> of <button>s rather than a <menu>. These navigate
 *      the page; they are not a menu and not a tablist, and buttons in a nav
 *      is the shape screen readers already understand.
 */

export type TabItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Tints the halo behind the active icon. Defaults to brand. */
  color?: string;
};

export type AnimatedTabBarProps = {
  items: TabItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
};

// useLayoutEffect warns when React renders this on the server. The measurement
// genuinely needs to happen before paint on the client, so swap rather than
// downgrade — otherwise the bulge is visibly wrong for one frame on every load.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function AnimatedTabBar({
  items,
  activeIndex,
  onSelect,
  className,
}: AnimatedTabBarProps) {
  const navRef = useRef<HTMLElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const positionBulge = useCallback(() => {
    const activeItem = itemRefs.current[activeIndex];
    const nav = navRef.current;
    const border = borderRef.current;
    if (!activeItem || !nav || !border) return;

    // offsetLeft rather than getBoundingClientRect: both elements share an
    // offset parent, so this needs no scroll compensation and forces no layout.
    const left = Math.round(
      activeItem.offsetLeft +
        (activeItem.offsetWidth - border.offsetWidth) / 2
    );
    border.style.transform = `translate3d(${left}px, 0, 0)`;
  }, [activeIndex]);

  useIsomorphicLayoutEffect(() => {
    positionBulge();
  }, [positionBulge]);

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
      positionBulge();
      // Restore animation on the next frame, once the jump has painted.
      requestAnimationFrame(() => nav.style.removeProperty("--timeOut"));
    };

    const observer = new ResizeObserver(remeasureInstantly);
    observer.observe(nav);

    /**
     * The single most common bug in this pattern: item widths depend on the
     * font, and next/font swaps the real face in after first paint. Without
     * this the bulge is silently a few pixels off on every single load.
     */
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) remeasureInstantly();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [positionBulge]);

  return (
    <>
      <div className="svg-container" aria-hidden="true">
        <svg viewBox="0 0 202.9 45.5">
          <clipPath
            id="menu-clip-path"
            clipPathUnits="objectBoundingBox"
            transform="scale(0.0049285362247413 0.021978021978022)"
          >
            <path d="M6.7,45.5c5.7,0.1,14.1-0.4,23.3-4c5.7-2.3,9.9-5,18.1-10.5c10.7-7.1,11.8-9.2,20.6-14.3c5-2.9,9.2-5.2,15.2-7 c7.1-2.1,13.3-2.3,17.6-2.1c4.2-0.2,10.5,0.1,17.6,2.1c6.1,1.8,10.2,4.1,15.2,7c8.8,5,9.9,7.1,20.6,14.3c8.3,5.5,12.4,8.2,18.1,10.5 c9.2,3.6,17.6,4.2,23.3,4H6.7z" />
          </clipPath>
        </svg>
      </div>

      <nav
        ref={navRef}
        aria-label="Sections"
        className={`menu${className ? ` ${className}` : ""}`}
      >
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
            style={
              { "--bgColorItem": item.color } as React.CSSProperties
            }
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
        <div ref={borderRef} className="menu__border" aria-hidden="true" />
      </nav>
    </>
  );
}
