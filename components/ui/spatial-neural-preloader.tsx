"use client";

import { useState, useEffect, useCallback } from "react";
import { ParticleField } from "@/components/ui/particle-field";
import { readStorage, writeStorage } from "@/lib/storage";

// Three lines, not seven. The whole run is 350ms, so seven would be ~50ms
// each — that is flicker, not a boot sequence.
const commands = [
    "Initializing neural weights...",
    "Loading vector embeddings...",
    "Access granted."
];

// Single source of truth: the progress counter and the typing animation both
// pace off this, so they can't drift apart.
//
// The whole sequence is ~630ms (350 + 60 + 220). It used to be 3320ms, which
// was 3.3 seconds of black screen held over content that was already fully
// server-rendered underneath — the page was being deliberately hidden from the
// visitor and from LCP. A brand moment is worth a beat; it is not worth that.
const LOADER_DURATION = 350;
const HOLD_AT_100 = 60;
// The hand-off: rush past the camera while the page pushes forward behind it.
// globals.css derives every duration in that choreography from this number via
// the --pl-launch custom property, so this really is the only place it lives.
const LAUNCH_DURATION = 220;
// Hard ceiling. If anything above misbehaves, the overlay still leaves — it
// covers the entire page, so a stuck preloader means a dead site.
const FAILSAFE = LOADER_DURATION + 1500;
const SESSION_KEY = "preloader:seen";
// Playing once per tab is right for visitors and hostile to iteration — you
// can't tune an animation you have to open a new tab to see. The key is still
// written in dev, just not read, so production behaviour is unchanged.
const REPLAY_EVERY_LOAD = process.env.NODE_ENV !== "production";
// Written onto <html> so globals.css can animate the page in without this
// component needing a client boundary around the whole tree.
const ROOT_ATTR = "data-preloader";

// The old sequence had an "anticipate" phase between running and launching: a
// 120ms dip to scale(0.97) before the dive. At this speed it is imperceptible,
// and dropping it removes a phase, an effect and a CSS block.
type Phase = "running" | "launching" | "done";

/** Derive the typed line from progress — no extra state, no per-character render. */
function lineFor(progress: number) {
    const pos = (progress / 100) * commands.length;
    const index = Math.min(Math.floor(pos), commands.length - 1);
    const command = commands[index];
    const within = Math.min(pos - index, 1);
    return command.slice(0, Math.ceil(within * command.length));
}

export function SpatialNeuralPreloader() {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<Phase>("running");
    // Gates the page-hiding attribute below. Starts false and is set only on
    // the path where the sequence actually plays, so a repeat visit, a
    // reduced-motion visitor or an early bail-out can never leave the page
    // hidden. The worst case is a missing animation, not a missing site.
    const [sequenceActive, setSequenceActive] = useState(false);

    const dismiss = useCallback(() => {
        // Private browsing / storage disabled just means the loader replays;
        // writeStorage swallows that for us.
        writeStorage("session", SESSION_KEY, "1");
        setPhase((p) => (p === "running" ? "launching" : p));
    }, []);

    useEffect(() => {
        // Repeat visits in this tab, and visitors who asked for reduced motion,
        // skip the whole sequence. sessionStorage and matchMedia don't exist
        // during SSR, so this has to run after hydration rather than in the
        // useState initializer — otherwise server and client markup differ.
        // Storage unavailable reads as null, i.e. not seen, and the animation
        // plays — the right way to fail.
        const alreadySeen =
            !REPLAY_EVERY_LOAD && readStorage("session", SESSION_KEY) === "1";
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (alreadySeen || prefersReducedMotion) {
            setPhase("done");
            return;
        }

        // Past this point the sequence is committed, so it's safe to let the
        // page be hidden underneath the overlay.
        setSequenceActive(true);

        const intervalTime = 30;
        const steps = LOADER_DURATION / intervalTime;
        let currentStep = 0;
        let holdTimer: ReturnType<typeof setTimeout>;

        const timer = setInterval(() => {
            currentStep++;
            const next = Math.min(Math.round((currentStep / steps) * 100), 100);
            setProgress(next);
            if (next === 100) {
                clearInterval(timer);
                holdTimer = setTimeout(dismiss, HOLD_AT_100);
            }
        }, intervalTime);

        const failsafe = setTimeout(() => setPhase("done"), FAILSAFE);

        return () => {
            clearInterval(timer);
            clearTimeout(holdTimer);
            clearTimeout(failsafe);
        };
    }, [dismiss]);

    // Unmount after the dive so the canvas and its rAF loop stop for good.
    useEffect(() => {
        if (phase !== "launching") return;
        const timer = setTimeout(() => setPhase("done"), LAUNCH_DURATION);
        return () => clearTimeout(timer);
    }, [phase]);

    // Mirror the phase onto <html> for globals.css. The cleanup runs on every
    // phase change and on unmount, so there is no path that leaves the page
    // stuck hidden — including the FAILSAFE jump straight to "done".
    //
    // LAUNCH_DURATION goes across as a custom property in the same pass. Every
    // duration in the hand-off choreography is a calc() off it, so the
    // stylesheet cannot fall out of step with this file the way it could when
    // the number was written in both places.
    useEffect(() => {
        if (!sequenceActive) return;
        const root = document.documentElement;
        root.style.setProperty("--pl-launch", `${LAUNCH_DURATION}ms`);
        if (phase === "done") {
            root.removeAttribute(ROOT_ATTR);
            return;
        }
        root.setAttribute(ROOT_ATTR, phase);
        return () => root.removeAttribute(ROOT_ATTR);
    }, [phase, sequenceActive]);

    // Escape hatch: any click or keypress skips straight to the page.
    useEffect(() => {
        if (phase !== "running") return;
        window.addEventListener("pointerdown", dismiss);
        window.addEventListener("keydown", dismiss);
        return () => {
            window.removeEventListener("pointerdown", dismiss);
            window.removeEventListener("keydown", dismiss);
        };
    }, [phase, dismiss]);

    if (phase === "done") return null;

    // The exit choreography lives in globals.css, keyed off the same
    // data-preloader attribute, so the overlay's dive and the page's
    // push-forward sit beside each other and stay in sync.
    return (
        <div
            role="status"
            aria-label="Loading portfolio"
            className="js-preloader fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        >
            {/* Particle backdrop */}
            <div className="absolute inset-0 z-0">
                <ParticleField className="h-full w-full" />
            </div>

            {/* Frosted glass overlay. The backdrop-blur comes off during the
                dive — nesting backdrop-filter inside an ancestor whose filter
                is animating is expensive and renders inconsistently, and the
                real blur supersedes it anyway. */}
            <div
                className={`absolute inset-0 z-10 bg-black/40 ${
                    phase === "launching" ? "" : "backdrop-blur-sm"
                }`}
            />

            {/* Terminal Window. Its backdrop-blur comes off during the dive for
                the same reason as the frost above — and it matters more here,
                because this card is what scales, so its backdrop gets
                re-rendered at 3.2x viewport area every frame. */}
            <div
                className={`animate-fade-up relative z-20 w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-black/60 p-8 shadow-2xl ${
                    phase === "launching" ? "" : "backdrop-blur-md"
                }`}
            >
                {/* Terminal Header */}
                <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    <div className="ml-2 font-mono text-xs text-white/50">sys_init.sh</div>
                </div>

                {/* Terminal Body */}
                <div className="min-h-[120px] font-mono text-sm text-green-400">
                    <div className="mb-2 text-white/70">
                        Syed Mohammad Adeel OS [Version 10.0.22631.3880]
                        <br />
                        (c) 2026. All rights reserved.
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400">C:\Users\Adeel&gt;</span>
                        <span>{lineFor(progress)}</span>
                        <span className="animate-blink inline-block h-4 w-2 bg-green-400" />
                    </div>
                </div>

                {/* Progress Counter */}
                <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-4">
                    <div className="font-mono text-xs text-white/50">SYSTEM_BOOT</div>
                    <div className="font-mono text-5xl font-bold tracking-tighter text-white">
                        {progress}%
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full bg-green-400 transition-[width] duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-white/30">
                    Click anywhere to skip
                </p>
            </div>
        </div>
    );
}
