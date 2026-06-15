"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import WordmarkHero from "./WordmarkHero";
import Button from "./Button";
import { Reveal3D } from "./TextAnimations";
import { useDeviceTilt } from "./DeviceTilt";

// WebGL must load client-side only
const WebGLBackdrop = dynamic(() => import("./WebGLBackdrop"), { ssr: false });

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  // cursor tilt + parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });

  const rotX = useTransform(sy, (v) => -v * 5);
  const rotY = useTransform(sx, (v) => v * 5);
  const frontX = useTransform(sx, (v) => v * 26);
  const frontY = useTransform(sy, (v) => v * 20);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  // Mobile: gyroscope drives the same tilt the cursor does. The gyro vector is
  // −1…+1; the cursor convention here is −0.5…+0.5, so halve it to match feel.
  const tilt = useDeviceTilt();
  useEffect(() => {
    if (!tilt?.enabled) return;
    mx.set(tilt.tiltX.get() * 0.5);
    my.set(tilt.tiltY.get() * 0.5);
    const ux = tilt.tiltX.on("change", (v) => mx.set(v * 0.5));
    const uy = tilt.tiltY.on("change", (v) => my.set(v * 0.5));
    return () => { ux(); uy(); };
  }, [tilt, mx, my]);

  // scroll-driven recede into space
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const scale = useTransform(p, [0, 1], [1, 0.82]);
  const lift = useTransform(p, [0, 1], [0, 90]);
  const fade = useTransform(p, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{ perspective: 1200 }}
    >
      {/* living WebGL backdrop */}
      <WebGLBackdrop />
      {/* blend backdrop into the white page below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]"
           style={{height:"16px",background:"linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.8) 100%)"}} />

      {/* tilting + receding content */}
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY, scale, y: lift, opacity: fade, transformPerspective: 1200 }}
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <motion.div style={{ x: frontX, y: frontY }}>
          <WordmarkHero />

          <h1 className="mt-10 font-display text-4xl font-light leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            We craft<br />
            <Reveal3D
              text="3D-feeling web spaces"
              variant="letters"
              className="font-normal"
              startDelay={1.15}
            />
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base text-black/55 sm:text-lg">
            Premium, immersive websites for businesses and organizations — tailored to feel just
            as alive on your phone as on your desktop.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/start" variant="primary">Start a project</Button>
            <Button href="/projects" variant="secondary">See the work</Button>
          </div>
        </motion.div>
      </motion.div>

      {/* scroll cue — suppressed while the tilt opt-in popup occupies the bottom */}
      {!tilt?.promptVisible && (
        <motion.div
          style={{ opacity: fade }}
          className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-black/20 p-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-black/40"
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}