"use client";

import { useEffect, useRef } from "react";

import { readTokenAlpha } from "@/lib/tokens";

/**
 * A drifting scatter that gathers toward the cursor — an embedding space you
 * can disturb.
 *
 * A sibling of components/ui/particle-field.tsx rather than an evolution of it.
 * That file is imported by the preloader, which is frozen, so changing it in
 * place would change the preloader's look. The rAF skeleton and the
 * reduced-motion single-frame pattern are copied from it because both are good;
 * the per-frame resize() is not, and is corrected here.
 *
 * This runs for the whole life of the page rather than for two seconds, so the
 * budget is tighter than the preloader's:
 *
 *   · resize is measured by a ResizeObserver, never in the draw loop. The
 *     original reads canvas.clientWidth every frame, which forces a layout
 *     recalculation 60 times a second.
 *   · device pixel ratio is capped at 1.5, not 2 — full-screen at 2 on a 1440p
 *     display is 8.3 megapixels of clear-and-fill per frame.
 *   · capped at 30fps. The drift is slow enough that nobody can tell, and it
 *     halves the cost.
 *   · paused entirely when the tab is hidden.
 *   · no ctx.shadowBlur anywhere. It is the canonical way to make a 2D canvas
 *     ten times slower; the glow here is two stacked arcs at low alpha.
 */

/** Points per million device pixels, so density is consistent across screens. */
const DENSITY = 90;
const MAX_POINTS = 190;
const FRAME_MS = 1000 / 30;
/** Cursor influence radius, as a fraction of the smaller viewport dimension. */
const PULL_RADIUS = 0.28;
const PULL_STRENGTH = 0.35;

type Point = {
  /** Home position, normalised 0..1. The drift orbits this. */
  hx: number;
  hy: number;
  /** Current drawn position, in normalised units. */
  x: number;
  y: number;
  phase: number;
  speed: number;
  radius: number;
};

export function EmbeddingField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // No 2D context: the page just has a plain background.

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Read once. getComputedStyle inside the loop would reintroduce exactly the
    // per-frame style resolution this file exists to avoid.
    const dotColor = readTokenAlpha("--rb-dim", 0.55);
    const haloColor = readTokenAlpha("--signal", 0.16);

    let width = 0;
    let height = 0;
    let points: Point[] = [];

    const seed = () => {
      const count = Math.min(
        MAX_POINTS,
        Math.max(40, Math.round(((width * height) / 1_000_000) * DENSITY))
      );
      points = Array.from({ length: count }, () => {
        const hx = Math.random();
        const hy = Math.random();
        return {
          hx,
          hy,
          x: hx,
          y: hy,
          phase: Math.random() * Math.PI * 2,
          speed: 0.12 + Math.random() * 0.22,
          radius: 0.7 + Math.random() * 1.1,
        };
      });
    };

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width === w && canvas.height === h) return false;
      canvas.width = w;
      canvas.height = h;
      width = w;
      height = h;
      return true;
    };

    measure();
    seed();

    // Off-canvas until the pointer actually moves, so nothing is pulled at rest.
    const pointer = { x: -1, y: -1, active: false };

    const handlePointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * width;
      pointer.y = (event.clientY / window.innerHeight) * height;
      pointer.active = true;
    };

    const draw = (elapsed: number) => {
      const min = Math.min(width, height);
      const pullRadius = min * PULL_RADIUS;

      ctx.clearRect(0, 0, width, height);

      for (const p of points) {
        // Slow lissajous drift around the home position.
        const t = elapsed * p.speed;
        p.x = p.hx + Math.sin(t + p.phase) * 0.012;
        p.y = p.hy + Math.cos(t * 0.8 + p.phase) * 0.012;

        let px = p.x * width;
        let py = p.y * height;

        if (pointer.active) {
          const dx = pointer.x - px;
          const dy = pointer.y - py;
          const dist = Math.hypot(dx, dy);
          if (dist < pullRadius && dist > 0.001) {
            // Falls off with distance, so the gather has a soft edge.
            const force = (1 - dist / pullRadius) ** 2 * PULL_STRENGTH;
            px += dx * force;
            py += dy * force;
          }
        }

        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cheap glow: one wide, very faint arc under the cursor. A radial
      // gradient per frame or a shadowBlur would both cost far more.
      if (pointer.active) {
        ctx.fillStyle = haloColor;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, pullRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let raf = 0;
    let last = 0;
    let disposed = false;

    const loop = (now: number) => {
      raf = 0;
      if (disposed) return;
      if (now - last >= FRAME_MS) {
        last = now;
        draw(now / 1000);
      }
      raf = requestAnimationFrame(loop);
    };

    if (prefersReducedMotion) {
      // A static field needs exactly one frame — and no pointer listener at
      // all, since the whole point of the interaction is motion.
      draw(0);
    } else {
      window.addEventListener("pointermove", handlePointer, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(() => {
      if (measure()) {
        seed();
        if (prefersReducedMotion) draw(0);
      }
    });
    observer.observe(canvas);

    const handleVisibility = () => {
      if (prefersReducedMotion) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={className} />
  );
}
