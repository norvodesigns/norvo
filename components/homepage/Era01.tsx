"use client";

import { useRef } from "react";
import { MotionValue, useTransform } from "motion/react";
import { BEATS } from "@/lib/timeline";
import { useBind } from "./useBind";

// Era 1 — Records · DOCUMENTS (1991–1996). The archive's FIRST and SIMPLEST
// record: the web as pure information. Almost nothing on the screen — one
// luminous statement on the dark archive ground. Complexity grows from here, one
// record at a time, as the web itself did.
//
// Fully present at progress 0 (the first screen) so you can always scroll back
// to the beginning without reloading; it slides away only as the timeline moves.

interface Props {
  progress: MotionValue<number>;
}

export default function Era01({ progress }: Props) {
  const [, e] = BEATS.era1;
  const sectionRef = useRef<HTMLElement>(null);

  // Cross-fades in as the Threshold dissolves (the Threshold owns the very top),
  // holds, then slides away as the timeline advances.
  const opacity = useTransform(progress, [0.012, 0.04, e - 0.03, e], [0, 1, 1, 0]);
  const x = useTransform(progress, [e - 0.05, e], [0, -140]);
  useBind(sectionRef, { opacity, x });

  return (
    <section
      ref={sectionRef}
      aria-label="Archive record 001 — Documents"
      className="pointer-events-none absolute inset-0 flex flex-col justify-center px-8 text-[var(--archive-white)] sm:px-[10vw]"
    >
      <div className="max-w-[26ch]">
        <div className="mb-8 flex items-center gap-3 font-mono text-[0.62rem] tracking-[0.3em] text-[var(--archive-white)]/45">
          <span className="text-[var(--norvo-violet)]">REC.001</span>
          <span className="text-[var(--archive-white)]/25">//</span>
          <span>THE DOCUMENT ERA</span>
        </div>

        <h2 className="font-mono text-[2.6rem] font-light leading-[1.04] tracking-tight sm:text-[clamp(3rem,8vmin,5.5rem)]">
          <span className="text-gradient norvo-anim-gradient-flow" style={{ willChange: "background-position" }}>
            Information
            <br />
            is the interface.
          </span>
          <span
            className="norvo-anim-cursor ml-2 inline-block translate-y-[0.05em] align-middle"
            style={{ width: "0.5ch", height: "0.95em", background: "var(--norvo-violet)" }}
            aria-hidden
          />
        </h2>

        <p className="mt-8 max-w-[42ch] font-mono text-[0.9rem] leading-[1.8] text-[var(--archive-white)]/45">
          The web began as information. Nothing stood between a person and what
          they came to know.
        </p>
      </div>
    </section>
  );
}
