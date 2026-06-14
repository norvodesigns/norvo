"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "motion/react";
import Button from "./Button";

const ease = [0.22, 1, 0.36, 1] as const;
const SP = { stiffness: 120, damping: 17 };

// Glowing depth orbs — each at a different tz; they visibly separate as you tilt
const ORBS = [
  { x: 14, y: 22, r: 28,  tz:  55, op: 0.38, c: "#0D7A7A" },
  { x: 86, y: 17, r: 18,  tz:  90, op: 0.30, c: "#1A9494" },
  { x: 76, y: 74, r: 34,  tz:  30, op: 0.26, c: "#1A9494" },
  { x: 22, y: 70, r: 22,  tz:  68, op: 0.36, c: "#0D7A7A" },
  { x: 91, y: 50, r: 12,  tz: 105, op: 0.22, c: "#1A9494" },
  { x:  8, y: 48, r: 26,  tz:  42, op: 0.32, c: "#1A9494" },
  { x: 52, y: 90, r: 16,  tz:  78, op: 0.28, c: "#0D7A7A" },
  { x: 48, y:  6, r: 14,  tz:  95, op: 0.24, c: "#1A9494" },
  { x: 38, y: 44, r: 10,  tz: 120, op: 0.18, c: "#1A9494" },
  { x: 64, y: 33, r: 20,  tz:  62, op: 0.30, c: "#0D7A7A" },
];

function Line({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Normalised mouse position: −1 … +1
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring-smoothed tilt
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-9, 9]),  SP);
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [ 7, -7]), SP);

  // Background glow tracks cursor like a moving light source
  const glowX = useTransform(rawX, [-1, 1], ["12%", "88%"]);
  const glowY = useTransform(rawY, [-1, 1], ["12%", "88%"]);
  const glowBg = useMotionTemplate`radial-gradient(ellipse at ${glowX} ${glowY}, #0D7A7A 0%, #1A9494 55%, transparent 72%)`;

  // Subtle specular sheen on the surface
  const sheenX = useTransform(rawX, [-1, 1], ["35%", "65%"]);
  const sheenY = useTransform(rawY, [-1, 1], ["35%", "65%"]);
  const sheen  = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.042) 0%, transparent 52%)`;

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left)  / rect.width  * 2 - 1);
    rawY.set((e.clientY - rect.top)   / rect.height * 2 - 1);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden bg-[#061212] px-6 py-32 sm:py-48"
      style={{ perspective: "1400px" }}
    >
      {/* Moving light — follows cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: glowBg }}
      />

      {/* Surface sheen */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: sheen }}
      />

      {/* ── 3D tilting stage ───────────────────────────────────── */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative mx-auto max-w-4xl"
      >
        {/* Gold accent frame — a crisp border so gold reads as an edge, not blended into the green */}
        <div
          className="pointer-events-none absolute -inset-x-4 -inset-y-8 rounded-[2rem] border border-[#D9A441]/55 sm:-inset-x-8 sm:-inset-y-10"
          style={{
            transform: "translateZ(24px)",
            boxShadow: "0 0 50px rgba(217,164,65,0.15), inset 0 0 40px rgba(217,164,65,0.05)",
          }}
        />

        {/* Depth-layered glowing orbs — each at a unique z, drift apart on tilt */}
        {ORBS.map((o, i) => (
          <div
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${o.x}%`, top: `${o.y}%`,
              width:  `${o.r * 2}px`,
              height: `${o.r * 2}px`,
              marginLeft: `-${o.r}px`,
              marginTop:  `-${o.r}px`,
              background: o.c,
              opacity:    o.op,
              filter:     `blur(${o.r * 1.6}px)`,
              transform:  `translateZ(${o.tz}px)`,
            }}
          />
        ))}

        {/* Arch watermark — pushed deepest behind content */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.045]"
          style={{ transform: "translateZ(-40px)" }}
        >
          <svg viewBox="0 0 256 305" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[90%] w-auto max-h-full">
            <path
              transform="translate(0,305) scale(0.1,-0.1)"
              d="M1071 2959 c-531 -104 -907 -730 -982 -1634 -32 -388 38 -1255 102 -1255 34 0 52 74 124 515 96 585 155 855 251 1145 190 570 468 878 810 897 343 20 601 -215 769 -697 96 -277 160 -611 230 -1205 50 -427 68 -525 92 -501 24 24 16 643 -11 891 -80 711 -282 1230 -606 1556 -159 160 -307 247 -482 283 -82 17 -224 19 -297 5z"
              fill="white"
            />
          </svg>
        </div>

        {/* ── Text content — mid layer ───────────────────────── */}
        <div className="text-center" style={{ transform: "translateZ(12px)" }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
            className="mb-8 text-xs uppercase tracking-[0.3em] text-white/35"
          >
            Start a project
          </motion.p>

          <h2 className="font-display text-4xl font-light leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl">
            <Line delay={0.05}>Ready to build something</Line>
            <Line delay={0.18}>
              <span className="text-gradient">extraordinary?</span>
            </Line>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease, delay: 0.4 }}
            className="mx-auto mt-8 max-w-lg text-base text-white/45 sm:text-lg"
          >
            Tell us about your project. We'll create something you're proud to send people to.
          </motion.p>
        </div>

        {/* ── Buttons — brought forward, closest to viewer ──── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease, delay: 0.55 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
          style={{ transform: "translateZ(38px)" }}
        >
          <Button href="/contact" variant="primary" size="md">Start a project</Button>
          <Button href="/projects" variant="secondary" size="md" dark>See the work</Button>
        </motion.div>

        {/* Email — same forward layer as buttons */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.0, ease, delay: 0.75 }}
          className="mt-14 text-center text-xs tracking-[0.15em] text-white/25"
          style={{ transform: "translateZ(38px)" }}
        >
          or reach us directly at{" "}
          <a
            href="mailto:norvodesigns@gmail.com"
            className="underline underline-offset-4 transition-colors duration-300 hover:text-white/60"
          >
            norvodesigns@gmail.com
          </a>
        </motion.p>
      </motion.div>
    </section>
  );
}