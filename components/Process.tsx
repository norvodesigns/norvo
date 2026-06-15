"use client";

import ScrollReveal3D from "./ScrollReveal3D";
import Tilt3D from "./Tilt3D";

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
            // seamless grid tiles → no scale/lift so neighbours don't overlap
            <Tilt3D key={step.num} className="h-full" max={9} scale={1} lift={0} perspective={700}>
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
            </Tilt3D>
          ))}
        </div>
      </div>
    </section>
  );
}