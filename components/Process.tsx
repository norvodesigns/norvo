"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import ScrollReveal3D from "./ScrollReveal3D";

const STEPS = [
  {
    num: "01",
    title: "Discover",
    body: "We learn your brand, audience, and goals. Quick, focused, no fluff — so we build the right thing from day one.",
  },
  {
    num: "02",
    title: "Design & Build",
    body: "Every page crafted as an experience, then built to perform beautifully on every device. You see it come together in real time.",
  },
  {
    num: "03",
    title: "Launch & Grow",
    body: "We don't disappear after launch. We stay involved, refining and evolving what we built together as your business grows.",
  },
];

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 22 });
  const sry = useSpring(ry, { stiffness: 200, damping: 22 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-y * 7);
    ry.set(x * 7);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: 700 }}
    >
      <motion.div style={{ rotateX: srx, rotateY: sry }}>
        {children}
      </motion.div>
    </div>
  );
}

export default function Process() {
  return (
    <section className="px-6 py-28 sm:py-40">
      <div className="mx-auto max-w-7xl">

        <ScrollReveal3D className="mb-16 max-w-xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">How it works</p>
          <h2 className="font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-6xl">
            Simple process.<br />
            <span className="text-gradient">No surprises.</span>
          </h2>
        </ScrollReveal3D>

        <div className="grid gap-px bg-black/[0.06] rounded-3xl overflow-hidden sm:grid-cols-3">
          {STEPS.map((step) => (
            <TiltCard key={step.num}>
              <div className="bg-white p-10 md:p-12 h-full">
                <ScrollReveal3D>
                  <span
                    className="font-display text-5xl font-light leading-none tracking-tight text-gradient"
                    aria-hidden
                  >
                    {step.num}
                  </span>
                  <h3 className="mt-6 font-display text-xl font-light tracking-tight sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/55 sm:text-base">
                    {step.body}
                  </p>
                </ScrollReveal3D>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}