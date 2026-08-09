"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
// @ts-ignore
import * as random from "maath/random/dist/maath-random.esm";

// 3D Particles Component
function NeuralParticles(props: any) {
    const ref = useRef<any>();
    // Generate random points in a sphere
    const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));

    useFrame((state: any, delta: number) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#00ffcc"
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

const commands = [
    "Initializing neural weights...",
    "Loading vector embeddings...",
    "Connecting to PostgreSQL...",
    "Establishing RAG pipelines...",
    "Optimizing model inference...",
    "Bypassing mainframe security...",
    "Access granted."
];

export function SpatialNeuralPreloader() {
    const [progress, setProgress] = useState(0);
    const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
    const [typedText, setTypedText] = useState("");
    const [isVisible, setIsVisible] = useState(true);

    // Progress Counter Logic
    useEffect(() => {
        const duration = 3500; // Total loading time in ms
        const intervalTime = 30;
        const steps = duration / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
            setProgress(newProgress);

            if (newProgress === 100) {
                clearInterval(timer);
                setTimeout(() => setIsVisible(false), 800); // Wait a bit at 100% before hiding
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, []);

    // Typing Animation Logic
    useEffect(() => {
        if (progress === 100) {
            setTypedText(commands[commands.length - 1]);
            return;
        }

        const commandDuration = 3500 / commands.length;
        const expectedIndex = Math.min(
            Math.floor((progress / 100) * commands.length),
            commands.length - 1
        );

        if (expectedIndex !== currentCommandIndex) {
            setCurrentCommandIndex(expectedIndex);
            setTypedText(""); // Reset typed text for new command
        }

        const targetCommand = commands[currentCommandIndex];
        if (typedText.length < targetCommand.length) {
            const timeout = setTimeout(() => {
                setTypedText(targetCommand.slice(0, typedText.length + 1));
            }, commandDuration / targetCommand.length);
            return () => clearTimeout(timeout);
        }
    }, [progress, currentCommandIndex, typedText]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
                >
                    {/* 3D Background */}
                    <div className="absolute inset-0 z-0">
                        <Canvas camera={{ position: [0, 0, 1] }}>
                            <NeuralParticles />
                        </Canvas>
                    </div>

                    {/* Frosted Glass Overlay */}
                    <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm" />

                    {/* Terminal Window */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-20 w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur-md"
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
                                <span>{typedText}</span>
                                <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="inline-block h-4 w-2 bg-green-400"
                                />
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
                            <motion.div
                                className="h-full bg-green-400"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
