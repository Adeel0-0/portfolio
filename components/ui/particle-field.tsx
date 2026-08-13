"use client";

import { useEffect, useRef } from "react";

/**
 * Rotating particle sphere on a 2D canvas.
 *
 * This deliberately replaces what used to be a react-three-fiber scene. The
 * effect sits behind a `bg-black/40 backdrop-blur-sm` overlay for ~2 seconds,
 * so the three.js/drei/maath stack it required (~210 KB gzipped, on the
 * critical path) bought nothing a few hundred projected dots can't do.
 */

const COUNT = 260;
const ROTATION_SPEED = 0.22; // radians/sec
const COLOR = "0, 255, 204"; // matches the previous PointMaterial cyan

type Point = { x: number; y: number; z: number };

export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // No 2D context: the overlay just stays plain black.

    // Even distribution over a sphere shell — inverse-transform sampling on
    // cos(phi), otherwise points bunch at the poles.
    const points: Point[] = Array.from({ length: COUNT }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.72 + Math.random() * 0.28;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
      };
    });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    let angle = 0;
    let last = performance.now();
    let disposed = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const draw = (now: number) => {
      raf = 0;
      if (disposed) return;

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!prefersReducedMotion) angle += dt * ROTATION_SPEED;

      resize();
      const w = canvas.width;
      const h = canvas.height;
      const scale = Math.min(w, h) * 0.34;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Setting canvas.width resets context state, so fillStyle is re-applied
      // every frame rather than once outside the loop.
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgb(${COLOR})`;

      for (const p of points) {
        const x = p.x * cos - p.z * sin;
        const z = p.x * sin + p.z * cos;
        const depth = 1 / (2.2 - z); // cheap perspective divide
        const sx = w / 2 + x * scale * depth * 2;
        const sy = h / 2 + p.y * scale * depth * 2;

        ctx.globalAlpha = 0.2 + (z + 1) * 0.28;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.7, depth * 1.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // A static field needs exactly one frame.
      if (!prefersReducedMotion) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
