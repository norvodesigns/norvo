"use client";

import { useRef } from "react";
import { MotionValue, useTransform, useMotionValueEvent } from "motion/react";
import { useBind } from "./useBind";

// The persistent HUD over Eras 1–3: you are inside the NORVO DATA ARCHIVE,
// scrubbing a timeline through the history of the web. A live year readout that
// ticks as you scroll, a timeline with era nodes and a moving playhead, and
// corner framing make "moving through time" explicit. Fades out as the live
// experience (Era 4 → Warp) takes over. Brand palette only.

interface Props {
  progress: MotionValue<number>;
}

// playhead/year run across this progress span (the Era 1–3 range)
const SPAN_A = 0.015;
const SPAN_B = 0.375;
const END = 0.4;

const NODES = [
  { at: 0.06, label: "DOCUMENTS" },
  { at: 0.19, label: "PAGES" },
  { at: 0.32, label: "INTERFACES" },
];
const pos = (at: number) => ((at - SPAN_A) / (SPAN_B - SPAN_A)) * 100;

export default function ArchiveFrame({ progress }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const opacity = useTransform(progress, [0, 0.02, END - 0.03, END], [0, 1, 1, 0]);
  useBind(rootRef, { opacity });

  useMotionValueEvent(progress, "change", (v) => {
    const t = Math.min(1, Math.max(0, (v - SPAN_A) / (SPAN_B - SPAN_A)));
    if (yearRef.current) {
      yearRef.current.textContent = String(Math.round(1991 + t * (2014 - 1991)));
    }
    if (headRef.current) headRef.current.style.left = `${t * 100}%`;
    if (fillRef.current) fillRef.current.style.width = `${t * 100}%`;
    NODES.forEach((n, i) => {
      const el = nodeRefs.current[i];
      if (el) el.style.opacity = v >= n.at - 0.01 ? "1" : "0.35";
    });
  });

  const bracket = "absolute h-5 w-5 border-[var(--archive-white)]/20";
  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-30 font-mono" style={{ opacity: 0 }}>
      {/* HUD corner brackets — the archive viewport */}
      <div className={`${bracket} left-5 top-20 border-l border-t`} />
      <div className={`${bracket} right-5 top-20 border-r border-t`} />
      <div className={`${bracket} bottom-5 left-5 border-b border-l`} />
      <div className={`${bracket} bottom-5 right-5 border-b border-r`} />

      {/* Top-center: the archive identity + the live year (the time machine) */}
      <div className="absolute left-1/2 top-[4.6rem] -translate-x-1/2 text-center">
        <div className="text-[0.58rem] tracking-[0.5em] text-[var(--archive-white)]/40">
          NORVO · DATA ARCHIVE
        </div>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="text-[0.5rem] tracking-[0.3em] text-[var(--archive-white)]/30">YEAR</span>
          <span ref={yearRef} className="text-gradient text-[1.7rem] font-light tabular-nums leading-none">
            1991
          </span>
        </div>
      </div>

      {/* Bottom: the timeline scrubber — playhead advances through the records */}
      <div className="absolute inset-x-[14vw] bottom-[7vh]">
        <div className="relative h-px bg-[var(--archive-white)]/15">
          <div
            ref={fillRef}
            className="absolute left-0 top-0 h-px"
            style={{ width: "0%", background: "var(--norvo-gradient)" }}
          />
          {NODES.map((n, i) => (
            <div
              key={n.label}
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${pos(n.at)}%` }}
            >
              <div
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className="flex flex-col items-center transition-opacity duration-300"
                style={{ opacity: 0.35 }}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--archive-white)]/70" />
                <div className="mt-2 whitespace-nowrap text-[0.5rem] tracking-[0.28em] text-[var(--archive-white)]/55">
                  {n.label}
                </div>
              </div>
            </div>
          ))}
          {/* playhead */}
          <div
            ref={headRef}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: "0%" }}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: "var(--norvo-gradient)", boxShadow: "0 0 14px 1px rgba(109,93,251,0.7)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
