"use client";

import { useEffect, useRef } from "react";
import {
  MotionValue,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { BEATS, sceneKeyframes } from "@/lib/timeline";
import { useDeviceTilt } from "@/components/DeviceTilt";
import { useBind } from "./useBind";

// Era 4 — Experiences · "The Spatial Word" (File 06).
// The web becomes a place you are inside. The atmosphere is now the photoreal
// nebula backdrop (MediaBackdrop); this layer carries only the words — the
// boldest scale contrast of the journey — drifting at depth over that field,
// with a soft scrim so they stay legible. Type parallaxes to pointer (desktop)
// / tilt (mobile); the Signature Gradient flows through the near word as a
// living force, foreshadowing the harmony ahead.

interface Props {
  progress: MotionValue<number>;
}

export default function Era04({ progress }: Props) {
  const [s, e] = BEATS.era4; // 0.389 – 0.6
  const reduce = useReducedMotion();
  const tilt = useDeviceTilt();

  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const midRef = useRef<HTMLParagraphElement>(null);

  // Parallax inputs: pointer (desktop) + device tilt (mobile), -1..1.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 50, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") return;
      mx.set((ev.clientX / window.innerWidth - 0.5) * 2);
      my.set((ev.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  useEffect(() => {
    if (reduce || !tilt?.enabled) return;
    const apply = () => {
      mx.set(tilt.tiltX.get());
      my.set(tilt.tiltY.get());
    };
    const ux = tilt.tiltX.on("change", apply);
    const uy = tilt.tiltY.on("change", apply);
    return () => {
      ux();
      uy();
    };
  }, [reduce, tilt, mx, my]);

  // Near sweeps, deep barely moves — the depth differential of the Parallax.
  const nearX = useTransform(sx, [-1, 1], [28, -28]);
  const nearY = useTransform(sy, [-1, 1], [18, -18]);
  const midX = useTransform(sx, [-1, 1], [14, -14]);
  const midY = useTransform(sy, [-1, 1], [9, -9]);
  const deepX = useTransform(sx, [-1, 1], [6, -6]);

  const opacity = useTransform(progress, sceneKeyframes(BEATS.era4), [0, 1, 1, 0]);
  const headO = useTransform(progress, [s + 0.02, s + 0.07, e - 0.05, e], [0, 1, 1, 0]);
  // The word group eases forward as the warp gathers — the lean into the rush.
  const accel = useTransform(progress, [e - 0.06, e + 0.01], [1, 1.14]);

  useBind(sectionRef, { opacity });
  useBind(labelRef, { x: deepX, opacity: headO });
  useBind(headlineRef, { x: nearX, y: nearY, opacity: headO, scale: accel });
  useBind(midRef, { x: midX, y: midY, opacity: headO });

  return (
    <section
      ref={sectionRef}
      aria-label="Era 4 — Experiences"
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-[#F4F5F7]"
    >
      {/* Soft scrim — keeps the words legible over the bright nebula, fading to
          nothing at the edges so the atmosphere reads at the periphery. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 45% 42% at 50% 50%, rgba(15,16,20,0.7) 0%, rgba(15,16,20,0.4) 45%, rgba(15,16,20,0) 72%)",
        }}
      />

      <div className="relative">
        <p
          ref={labelRef}
          className="mb-6 font-mono text-[0.6rem] uppercase tracking-[0.5em] text-[#F4F5F7]/55"
        >
          Experiences
        </p>

        {/* near headline — the boldest scale contrast of the journey */}
        <h2
          ref={headlineRef}
          className="text-[2.9rem] font-light leading-[0.96] tracking-tight sm:text-[5.5rem]"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
        >
          We make
          <br />
          <span
            className="norvo-anim-gradient-flow font-medium"
            style={{
              backgroundImage: "linear-gradient(120deg, #6D5DFB, #D8B46A, #6D5DFB)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            places.
          </span>
        </h2>

        <p
          ref={midRef}
          className="mx-auto mt-8 max-w-md text-[0.95rem] leading-relaxed text-[#F4F5F7]/70"
          style={{ textShadow: "0 1px 20px rgba(0,0,0,0.6)" }}
        >
          The web stopped being something you look at. With depth, motion, and
          intention, it became somewhere you can be.
        </p>
      </div>
    </section>
  );
}
