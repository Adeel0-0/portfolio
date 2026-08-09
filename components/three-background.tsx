"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // ── Scene setup ──────────────────────────────────────────────
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // ── Particles ────────────────────────────────────────────────
        const PARTICLE_COUNT = 180;
        const SPREAD = 12;

        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * SPREAD;
            positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
            positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;

            velocities[i * 3] = (Math.random() - 0.5) * 0.005;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x0ea5e9,
            size: 0.04,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // ── Connection lines ─────────────────────────────────────────
        const MAX_CONNECTIONS = 600;
        const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
        const lineColors = new Float32Array(MAX_CONNECTIONS * 6);

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(linePositions, 3)
        );
        lineGeometry.setAttribute(
            "color",
            new THREE.BufferAttribute(lineColors, 3)
        );

        const lineMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        // ── Mouse interaction ────────────────────────────────────────
        const mouse = new THREE.Vector2(0, 0);
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("mousemove", handleMouseMove);

        // ── Animation loop ───────────────────────────────────────────
        const CONNECTION_DISTANCE = 2.2;
        let animationId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();

            // Update particles
            const posArray = particleGeometry.attributes.position
                .array as Float32Array;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                posArray[i * 3] += velocities[i * 3];
                posArray[i * 3 + 1] += velocities[i * 3 + 1];
                posArray[i * 3 + 2] += velocities[i * 3 + 2];

                // Bounce at boundaries
                for (let axis = 0; axis < 3; axis++) {
                    if (Math.abs(posArray[i * 3 + axis]) > SPREAD / 2) {
                        velocities[i * 3 + axis] *= -1;
                    }
                }
            }
            particleGeometry.attributes.position.needsUpdate = true;

            // Update connections
            let connectionCount = 0;
            const lPos = lineGeometry.attributes.position
                .array as Float32Array;
            const lCol = lineGeometry.attributes.color.array as Float32Array;

            for (
                let i = 0;
                i < PARTICLE_COUNT && connectionCount < MAX_CONNECTIONS;
                i++
            ) {
                for (
                    let j = i + 1;
                    j < PARTICLE_COUNT && connectionCount < MAX_CONNECTIONS;
                    j++
                ) {
                    const dx = posArray[i * 3] - posArray[j * 3];
                    const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
                    const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < CONNECTION_DISTANCE) {
                        const alpha = 1 - dist / CONNECTION_DISTANCE;
                        const idx = connectionCount * 6;

                        lPos[idx] = posArray[i * 3];
                        lPos[idx + 1] = posArray[i * 3 + 1];
                        lPos[idx + 2] = posArray[i * 3 + 2];
                        lPos[idx + 3] = posArray[j * 3];
                        lPos[idx + 4] = posArray[j * 3 + 1];
                        lPos[idx + 5] = posArray[j * 3 + 2];

                        // Cyan-ish color with fade
                        lCol[idx] = 0.055 * alpha;
                        lCol[idx + 1] = 0.647 * alpha;
                        lCol[idx + 2] = 0.914 * alpha;
                        lCol[idx + 3] = 0.055 * alpha;
                        lCol[idx + 4] = 0.647 * alpha;
                        lCol[idx + 5] = 0.914 * alpha;

                        connectionCount++;
                    }
                }
            }

            // Zero out unused connections
            for (let i = connectionCount * 6; i < MAX_CONNECTIONS * 6; i++) {
                lPos[i] = 0;
                lCol[i] = 0;
            }

            lineGeometry.attributes.position.needsUpdate = true;
            lineGeometry.attributes.color.needsUpdate = true;
            lineGeometry.setDrawRange(0, connectionCount * 2);

            // Camera drift
            camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
            camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.02;
            camera.rotation.y = Math.sin(elapsed * 0.1) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };

        animate();

        // ── Resize handler ───────────────────────────────────────────
        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener("resize", handleResize);

        // ── Cleanup ──────────────────────────────────────────────────
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            particleGeometry.dispose();
            particleMaterial.dispose();
            lineGeometry.dispose();
            lineMaterial.dispose();
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0"
            aria-hidden="true"
        />
    );
}
