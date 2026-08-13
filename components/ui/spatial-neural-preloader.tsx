"use client";

import { useState, useEffect, useCallback } from "react";
import { ParticleField } from "@/components/ui/particle-field";

const commands = [
    "Initializing neural weights...",
    "Loading vector embeddings...",
    "Connecting to PostgreSQL...",
    "Establishing RAG pipelines...",
    "Optimizing model inference...",
    "Bypassing mainframe security...",
    "Access granted."
];

// Single source of truth: the progress counter and the typing animation both
// pace off this, so they can't drift apart.
const LOADER_DURATION = 2000;
const HOLD_AT_100 = 400;
const EXIT_DURATION = 600;
// Hard ceiling. If anything above misbehaves, the overlay still leaves — it
// covers the entire page, so a stuck preloader means a dead site.
const FAILSAFE = LOADER_DURATION + 4000;
const SESSION_KEY = "preloader:seen";

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
    const [phase, setPhase] = useState<"running" | "exiting" | "done">("running");

    const dismiss = useCallback(() => {
        try {
            sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
            // Private browsing / storage disabled — the loader just replays.
        }
        setPhase((p) => (p === "running" ? "exiting" : p));
    }, []);

    useEffect(() => {
        // Repeat visits in this tab, and visitors who asked for reduced motion,
        // skip the whole sequence. sessionStorage and matchMedia don't exist
        // during SSR, so this has to run after hydration rather than in the
        // useState initializer — otherwise server and client markup differ.
        let alreadySeen = false;
        try {
            alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
        } catch {
            // Storage unavailable; fall through and play the animation.
        }
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (alreadySeen || prefersReducedMotion) {
            setPhase("done");
            return;
        }

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

    // Unmount after the fade-out so the canvas and its rAF loop stop for good.
    useEffect(() => {
        if (phase !== "exiting") return;
        const timer = setTimeout(() => setPhase("done"), EXIT_DURATION);
        return () => clearTimeout(timer);
    }, [phase]);

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

    return (
        <div
            role="status"
            aria-label="Loading portfolio"
            className={`js-preloader fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black transition-all duration-500 ease-in ${
                phase === "exiting" ? "scale-110 opacity-0" : "scale-100 opacity-100"
            }`}
        >
            {/* Particle backdrop */}
            <div className="absolute inset-0 z-0">
                <ParticleField className="h-full w-full" />
            </div>

            {/* Frosted Glass Overlay */}
            <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm" />

            {/* Terminal Window */}
            <div className="animate-fade-up relative z-20 w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur-md">
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
                    <div className="font-mono text-4xl font-bold tracking-tighter text-white">
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
