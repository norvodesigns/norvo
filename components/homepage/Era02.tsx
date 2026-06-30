"use client";

import { useRef } from "react";
import { MotionValue, useTransform } from "motion/react";
import { BEATS } from "@/lib/timeline";
import { useBind } from "./useBind";

// Era 2 — Records · PAGES (1996–2003). The record of structure: the web learns
// composition. Rendered as a sleek futuristic blueprint — faint column guides
// and a baseline grid draw the page into being, the statement sits on the grid,
// and the first Observatory Gold rule appears. Full-bleed. Brand palette only.

interface Props {
  progress: MotionValue<number>;
}

export default function Era02({ progress }: Props) {
  const [s, e] = BEATS.era2;
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  // slides IN from the right, holds, slides OUT to the left (a record passing).
  const opacity = useTransform(progress, [s, s + 0.02, e - 0.03, e], [0, 1, 1, 0]);
  const x = useTransform(progress, [s, s + 0.05, e - 0.05, e], [150, 0, 0, -140]);
  useBind(sectionRef, { opacity, x });
  // the blueprint grid draws in; the gold rule extends (the first gold)
  const gridO = useTransform(progress, [s + 0.01, s + 0.06], [0, 1]);
  const ruleW = useTransform(progress, [s + 0.04, s + 0.09], [0, 240]);
  useBind(gridRef, { opacity: gridO });
  useBind(ruleRef, { width: ruleW });

  return (
    <section
      ref={sectionRef}
      aria-label="Archive record 002 — Pages"
      className="pointer-events-none absolute inset-0 flex items-center px-8 text-[var(--archive-white)] sm:px-[10vw]"
    >
      {/* Blueprint column guides + baseline grid — structure becoming visible */}
      <div
        ref={gridRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-[10vw] inset-y-[16vh]"
        style={{ opacity: 0 }}
      >
        <div className="grid h-full grid-cols-12 gap-0">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="h-full border-l border-[var(--archive-white)]/[0.06]" />
          ))}
        </div>
        <div className="absolute -top-5 left-0 font-mono text-[0.5rem] tracking-[0.3em] text-[var(--archive-white)]/30">
          12-COL GRID · BASELINE 8PX
        </div>
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="mb-6 flex items-center gap-3 font-mono text-[0.62rem] tracking-[0.3em] text-[var(--archive-white)]/45">
          <span className="text-[var(--norvo-violet)]">REC.002</span>
          <span className="text-[var(--archive-white)]/25">//</span>
          <span>THE COMPOSITION ERA · 1996–2003</span>
        </div>

        <h2 className="max-w-[24ch] font-mono text-[2rem] font-light leading-[1.08] tracking-tight sm:text-[3.6rem]">
          A page stops being a document.
          <br />
          It becomes a <span className="text-gradient">composition</span>.
        </h2>

        {/* the first Observatory Gold rule — structure earns its accent */}
        <div ref={ruleRef} className="mt-7 h-px overflow-hidden" aria-hidden>
          <div className="h-full w-[240px]" style={{ background: "var(--observatory-gold)" }} />
        </div>

        {/* a real composed field — columns aligned on the grid */}
        <div className="mt-9 grid grid-cols-1 max-w-3xl gap-x-12 gap-y-6 font-mono sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[0.6rem] uppercase tracking-[0.28em] text-[var(--norvo-violet)]">
              Structure
            </div>
            <p className="text-[0.84rem] leading-[1.75] text-[var(--archive-white)]/55">
              Margins appear. A title finds its rule, columns divide to align line
              for line. The page discovers a top, a hierarchy, a place the eye is
              meant to go.
            </p>
          </div>
          <div>
            <div className="mb-2 text-[0.6rem] uppercase tracking-[0.28em] text-[var(--observatory-gold)]">
              Discipline
            </div>
            <p className="text-[0.84rem] leading-[1.75] text-[var(--archive-white)]/55">
              Beauty here is proportion and alignment — never decoration laid on
              after the fact. The structure itself can be designed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
