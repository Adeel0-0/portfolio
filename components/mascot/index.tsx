"use client";

import { useEffect, useRef, useState } from "react";

import { useActiveSection } from "@/components/providers/scroll-provider";
import { useGaze } from "@/lib/hooks/use-gaze";
import { usePreloaderDone } from "@/lib/hooks/use-preloader-done";
import { AnimatePresence, m, useReducedMotion } from "@/lib/motion";
import { sectionById } from "@/lib/sections";
import { readStorage, writeStorage } from "@/lib/storage";
import type { MascotPose, MascotSprite } from "./mascot-sprite";
import { RadioBubble } from "./radio-bubble";
import { SvgPixelMascot } from "./sprites/svg-pixel";

/**
 * The race engineer on the pit wall.
 *
 * A mascot with a job: it reads the section you are in and talks to you about
 * it over team radio. That is the whole difference between this and Clippy —
 * it is reacting to something real, and it can be told to go away.
 *
 * ── THE ONLY LINE THAT CHANGES WHEN THE RENDERER IS CHOSEN ──────────────────
 * Every behaviour below is renderer-agnostic. Swapping (a) the hand-coded pixel
 * grid for (b) a sprite sheet or (c) a hybrid means changing this import and
 * nothing else.
 */
const Sprite: MascotSprite = SvgPixelMascot;

const SIZE = 76;
const DISMISS_KEY = "mascot:dismissed";

/** Blink roughly every 3-6s, for about a frame and a half. */
const BLINK_MIN_MS = 3000;
const BLINK_MAX_MS = 6000;
const BLINK_HOLD_MS = 150;
/** How long the engineer keeps talking after a new line arrives. */
const TALK_MS = 1400;
const TALK_FRAME_MS = 180;

export function Mascot() {
  const ready = usePreloaderDone();
  const reduced = useReducedMotion();
  const { activeId } = useActiveSection();
  const containerRef = useRef<HTMLDivElement>(null);

  const [dismissed, setDismissed] = useState(true);
  const [blinking, setBlinking] = useState(false);
  const [talkFrame, setTalkFrame] = useState<0 | 1 | null>(null);

  const line = sectionById(activeId).radio;
  const gaze = useGaze(containerRef, !dismissed && !reduced);

  // Read persistence in an effect, never during render: localStorage does not
  // exist on the server, and branching on it during render would desync
  // hydration. Defaults to dismissed so nothing flashes in before we know.
  useEffect(() => {
    setDismissed(readStorage("local", DISMISS_KEY) === "true");
  }, []);

  // Blink. Rescheduled at a fresh random interval each time so it never falls
  // into a visible rhythm.
  useEffect(() => {
    if (dismissed || reduced) return;

    let hold: ReturnType<typeof setTimeout>;
    let next: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay =
        BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS);
      next = setTimeout(() => {
        setBlinking(true);
        hold = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, BLINK_HOLD_MS);
      }, delay);
    };

    schedule();
    return () => {
      clearTimeout(hold);
      clearTimeout(next);
    };
  }, [dismissed, reduced]);

  // Talk whenever the line changes — i.e. whenever you enter a new section.
  useEffect(() => {
    if (dismissed || reduced) return;

    setTalkFrame(0);
    const cycle = setInterval(
      () => setTalkFrame((frame) => (frame === 0 ? 1 : 0)),
      TALK_FRAME_MS
    );
    const stop = setTimeout(() => {
      clearInterval(cycle);
      setTalkFrame(null);
    }, TALK_MS);

    return () => {
      clearInterval(cycle);
      clearTimeout(stop);
    };
  }, [line, dismissed, reduced]);

  function handleDismiss() {
    setDismissed(true);
    writeStorage("local", DISMISS_KEY, "true");
  }

  // Talking wins over blinking: a blink mid-sentence reads as a glitch.
  const pose: MascotPose =
    talkFrame !== null
      ? talkFrame === 0
        ? "talk-a"
        : "talk-b"
      : blinking
        ? "blink"
        : "idle";

  return (
    <AnimatePresence>
      {ready && !dismissed && (
        <m.div
          ref={containerRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.3, 1] }}
          // Hidden below md: the dock already owns the bottom of a phone
          // screen, and two floating things there is one too many.
          className="pointer-events-none fixed bottom-6 right-6 z-mascot hidden flex-col items-end gap-2 md:flex"
        >
          <div className="pointer-events-auto">
            <RadioBubble line={line} onDismiss={handleDismiss} />
          </div>
          {/* Bob lives in CSS rather than JS so the global reduced-motion kill
              switch in globals.css stops it without the engine checking. */}
          <div className={reduced ? undefined : "animate-bob"}>
            <Sprite
              pose={pose}
              gaze={gaze}
              size={SIZE}
              still={Boolean(reduced)}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
