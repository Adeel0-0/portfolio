"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { loadPortraitField, type PortraitField } from "@/lib/portrait-field";
import { TREATMENTS } from "@/lib/portrait-treatments";
import { readToken } from "@/lib/tokens";

/**
 * The About portrait, cycling through the scan treatments.
 *
 * This replaces what was a separate /ascii route. A page you have to navigate
 * to is a page nobody navigates to — and the treatments are not a destination,
 * they are the answer to "what does this person do", delivered in the slot
 * where a portfolio already puts a face.
 *
 * ---------------------------------------------------------------------------
 * How it draws
 *
 * Bottom to top: the real photograph as a next/image, then two stacked
 * canvases, then the wash overlay.
 *
 * Two canvases rather than one, because every transition here is a cross-fade
 * and a single canvas cannot cross-fade with itself — redrawing it swaps the
 * picture in one frame. So the incoming treatment is drawn into whichever
 * canvas is currently hidden, and then the two swap opacity. The photograph
 * slide needs no canvas at all: both fade to zero and the image underneath is
 * simply uncovered, which is why it is a real <img> and not a seventh draw.
 *
 * Nothing here runs a rAF loop. Every treatment in the set is static, so a
 * slide costs exactly one draw and the section is idle between them — unlike
 * the particle field in the wider experiment, which had to animate forever to
 * mean anything.
 */

/**
 * Sampling grid width.
 *
 * Capped by the source, not by taste: portrait.png is 311px wide and the 3:4
 * crop keeps about 250 of those columns, so asking for more than that would
 * upsample the photograph and call it detail.
 */
const FIELD_COLS = 240;

const ADVANCE_MS = 3800;
const FADE_MS = 420;

const TOKENS = {
  ground: "--background",
  ink: "--foreground",
  accent: "--brand",
} as const;

export function PortraitSlideshow({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);

  const fieldRef = useRef<PortraitField | null>(null);
  /** Which canvas the next treatment should be drawn into. */
  const nextSlotRef = useRef<"a" | "b">("a");

  const [index, setIndex] = useState(0);
  /** null means the untreated photograph is showing. */
  const [front, setFront] = useState<"a" | "b" | null>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  const treatment = TREATMENTS[index];

  /* ------------------------------------------------------------ the drawing */

  /**
   * Draws `at` into a specific canvas. Returns false when it could not — no
   * field yet, no context, zero-sized canvas — so the caller can leave the
   * photograph up rather than swapping to a blank layer.
   */
  const drawInto = useCallback(
    (slot: "a" | "b", at: number): boolean => {
      const field = fieldRef.current;
      const canvas = (slot === "a" ? canvasARef : canvasBRef).current;
      const render = TREATMENTS[at].render;
      if (!field || !canvas || !render) return false;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (width < 1 || height < 1) return false;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;

      // Tokens are read per draw rather than cached on mount. A draw happens a
      // handful of times a minute, not per frame, and reading here means the
      // treatments follow a theme change instead of holding the palette that
      // happened to be live when the component mounted.
      //
      // The font must be resolved too: a canvas font string is parsed by the
      // canvas, so `var(--font-jetbrains-mono)` would be discarded silently and
      // the ASCII ramp would render in the 10px sans-serif default. The canvas
      // carries `font-mono`, so its own computed style is the resolved stack.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, width, height);

      render({
        ctx,
        field,
        width,
        height,
        colors: {
          ground: readToken(TOKENS.ground),
          ink: readToken(TOKENS.ink),
          accent: readToken(TOKENS.accent),
        },
        monoFont: getComputedStyle(canvas).fontFamily || "monospace",
      });
      return true;
    },
    []
  );

  /* --------------------------------------------------------- load the field */

  useEffect(() => {
    let alive = true;
    loadPortraitField({ src, cols: FIELD_COLS })
      .then((field) => {
        if (!alive) return;
        fieldRef.current = field;
        setReady(true);
      })
      .catch(() => {
        // The photograph is already on screen and stays there. A portrait that
        // silently declines to be clever is a much better failure than an
        // empty box where a face should be.
      });
    return () => {
      alive = false;
    };
  }, [src]);

  /* ------------------------------------------------- draw on slide / resize */

  useEffect(() => {
    if (!ready) return;

    if (!treatment.render) {
      setFront(null);
      return;
    }
    const slot = nextSlotRef.current;
    if (drawInto(slot, index)) {
      nextSlotRef.current = slot === "a" ? "b" : "a";
      setFront(slot);
    }
  }, [ready, index, treatment.render, drawInto]);

  // Read by the resize observer below, which must not be rebuilt every time
  // the slide changes — observe() fires once immediately, so an observer torn
  // down and recreated per slide would run a second, redundant draw of the
  // treatment it just drew.
  const currentRef = useRef({ front, index });
  currentRef.current = { front, index };

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !ready) return;

    // Redraw the visible canvas at the new size, coalesced to the next frame so
    // a drag-resize does not run a full treatment per observer callback.
    let frame = 0;
    let first = true;
    const observer = new ResizeObserver(() => {
      // The initial callback carries the size the slide effect already drew at.
      if (first) {
        first = false;
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { front: f, index: i } = currentRef.current;
        if (f) drawInto(f, i);
      });
    });
    observer.observe(host);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ready, drawInto]);

  /* ------------------------------------------------------------ auto-advance */

  useEffect(() => {
    if (!ready || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const host = hostRef.current;
    if (!host) return;

    // Only cycle while the portrait is actually on screen. Drawing treatments
    // for a section three viewports away is work nobody asked for.
    let timer: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        stop();
        if (entry.isIntersecting) {
          timer = setInterval(
            () => setIndex((i) => (i + 1) % TREATMENTS.length),
            ADVANCE_MS
          );
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(host);

    return () => {
      stop();
      observer.disconnect();
    };
  }, [ready, paused]);

  /* -------------------------------------------------------------------- view */

  const canvasClass =
    "pointer-events-none absolute inset-0 h-full w-full font-mono transition-opacity";

  return (
    <div className="mx-auto w-full max-w-[20rem] lg:mx-0">
      <div
        ref={hostRef}
        // Hovering or tabbing in stops the carousel, so reading a caption or
        // aiming at a chip does not get the slide pulled out from under you.
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 640px) 320px, 80vw"
          className="object-cover"
          priority={false}
        />

        <canvas
          ref={canvasARef}
          aria-hidden="true"
          className={canvasClass}
          style={{
            opacity: front === "a" ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        />
        <canvas
          ref={canvasBRef}
          aria-hidden="true"
          className={canvasClass}
          style={{
            opacity: front === "b" ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        />

        {/* Navy wash so the portrait sits in the palette rather than beside it.
            Above the canvases, so it grades the treatments too. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent"
        />
      </div>

      {/* Chips, not dots. Five unlabelled dots make you click each one to find
          out what it does; the names are the interesting part. */}
      <div
        role="group"
        aria-label="Portrait treatment"
        className="mt-3 flex flex-wrap gap-1.5"
      >
        {TREATMENTS.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-pressed={i === index}
            disabled={!ready && item.render !== null}
            className={`rounded-full border px-2 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] transition-colors disabled:opacity-40 ${
              i === index
                ? "border-brand/40 bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* aria-live so the caption change is announced when a chip is pressed.
          `polite` because it is a description, not an alert. */}
      <p
        aria-live="polite"
        className="mt-2 min-h-[2.25rem] font-mono text-[0.625rem] leading-relaxed text-muted-foreground"
      >
        <span className="text-foreground">{caption}</span>
        <span className="mx-1.5 text-border">/</span>
        {treatment.note}
      </p>
    </div>
  );
}
