"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  MotionValue,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import Button from "@/components/Button";
import { useBind } from "./useBind";

// The focal wall of The Observatory — the payoff (Files 08 §8.9, 17 §17.6).
// Streamlined to the single thing this room is for: the brand statement arrives
// in full, the Signature Gradient flowing slowly across it like light on brushed
// metal, and the invitation to act waits beneath it. The impact figures and the
// disciplines live in Era 3 (Interfaces) and are NOT repeated here — the climax
// is a clear, uncluttered open door, not a recap.

interface Props {
  progress: MotionValue<number>;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function EndState({ progress }: Props) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // The arrival Bloom: the focal wall content resolves just after the warp lands
  // in the hall (warp ends ~0.71), so the visitor is WITH the statement, and holds.
  const opacity = useTransform(progress, [0.73, 0.83], [0, 1]);
  const y = useTransform(progress, [0.73, 0.83], [26, 0]);
  useBind(sectionRef, { opacity, y });

  // Latch the door reveal once the room is reached; `interactive` tracks live
  // visibility so the centered CTAs only capture clicks while the room is on
  // screen (otherwise they'd intercept center-screen clicks throughout the eras).
  const [arrived, setArrived] = useState(false);
  const [interactive, setInteractive] = useState(false);
  useMotionValueEvent(progress, "change", (v) => {
    if (!arrived && v > 0.745) setArrived(true);
    const live = v > 0.745;
    setInteractive((cur) => (cur === live ? cur : live));
  });

  // Visibility comes from the section's scroll-driven opacity (useBind) above, so
  // the CTA can never get stuck hidden by a state latch that didn't fire. `arrived`
  // only adds a subtle upward settle once the room is reached.
  const settle = (delay: number) => ({
    transform: arrived ? "translateY(0)" : "translateY(14px)",
    transition: reduce ? "transform 0.4s ease" : `transform 0.7s ${EASE} ${delay}s`,
  });

  return (
    <section
      ref={sectionRef}
      aria-label="The Observatory — start a project"
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center font-mono"
    >
      {/* Soft Graphite backing — reads as the lit focal wall so the content is
          legible against the hall behind it, with no hard edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[150vmin] w-[150vmin] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 40% 36% at 50% 50%, rgba(15,17,21,0.94) 0%, rgba(15,17,21,0.82) 45%, rgba(15,17,21,0) 72%)",
        }}
      />
      <div
        className="relative flex w-full max-w-2xl flex-col items-center"
        style={{ pointerEvents: interactive ? "auto" : "none" }}
      >
        <p className="mb-7 text-[0.62rem] uppercase tracking-[0.5em] text-[var(--observatory-gold)]/70">
          The Observatory
        </p>

        <h2 className="text-[2.2rem] font-light leading-[1.05] tracking-tight sm:text-[clamp(2.4rem,7vmin,4.2rem)]">
          {/* Seamless flowing gradient (ping-pong ease-in-out, no hard loop
              restart) — the linear restart was the "sudden jump", worst in Safari.
              will-change hints the compositor so the bg-position stays smooth. */}
          <span
            className="text-gradient norvo-anim-gradient-flow inline-block"
            style={{ willChange: "background-position" }}
          >
            WE DESIGN THE FUTURE.
          </span>
        </h2>

        <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-[var(--archive-white)]/55">
          Let&rsquo;s build something worth returning to.
        </p>

        {/* The open door — same Button as everywhere else (clip-path wipe), and
            the work plainly alongside it. Two acts, not a cluttered cluster. */}
        <div
          className="mt-11 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
          style={settle(0.08)}
        >
          <Button href="/start" variant="primary" size="md" withArrow>
            Start a Project
          </Button>
          <Button href="/projects" variant="secondary" size="md">
            View the work
          </Button>
        </div>

        {/* Contact, relocated out of the primary cluster — a quiet secondary line. */}
        <div
          className="mt-9 flex items-center gap-3 text-[0.78rem] text-[var(--archive-white)]/40"
          style={settle(0.16)}
        >
          <Link
            href="/contact"
            className="transition-colors duration-300 hover:text-[var(--archive-white)]/80"
          >
            Contact
          </Link>
          <span aria-hidden className="text-[var(--archive-white)]/20">
            ·
          </span>
          <a
            href="mailto:norvodesigns@gmail.com"
            className="tracking-[0.04em] transition-colors duration-300 hover:text-[var(--archive-white)]/80"
          >
            norvodesigns@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
