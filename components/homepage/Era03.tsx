"use client";

import { useEffect, useRef, useState } from "react";
import { MotionValue, useTransform, useMotionValueEvent, useReducedMotion } from "motion/react";
import { BEATS } from "@/lib/timeline";
import { useBind } from "./useBind";

// Era 3 — Records · INTERFACES (2004–2014). The record of software: the web
// becomes a thing you operate. Rendered as a sleek futuristic control surface —
// a gradient data-graph, live value readouts that resolve once, a command line —
// all on the dark archive ground in the brand palette. Full-bleed.

interface Props {
  progress: MotionValue<number>;
}

const STATS = [
  { value: 50, suffix: "ms", label: "First impression" },
  { value: 75, suffix: "%", label: "Credibility from design" },
  { value: 88, suffix: "%", label: "Won't return after bad UX" },
  { value: 2, suffix: "×", label: "Conversion lift" },
];

export default function Era03({ progress }: Props) {
  const [s, e] = BEATS.era3;
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const opacity = useTransform(progress, [s, s + 0.02, e - 0.03, e], [0, 1, 1, 0]);
  const x = useTransform(progress, [s, s + 0.05, e - 0.05, e], [150, 0, 0, -140]);
  useBind(sectionRef, { opacity, x });

  const [entered, setEntered] = useState(false);
  useMotionValueEvent(progress, "change", (v) => {
    if (!entered && v > s + 0.01) setEntered(true);
  });

  return (
    <section
      ref={sectionRef}
      aria-label="Archive record 003 — Interfaces"
      className="pointer-events-none absolute inset-0 flex items-center px-8 text-[var(--archive-white)] sm:px-[10vw]"
    >
      <div className="w-full max-w-5xl font-mono">
        <div className="mb-6 flex items-center gap-3 text-[0.62rem] tracking-[0.3em] text-[var(--archive-white)]/45">
          <span className="text-[var(--norvo-violet)]">REC.003</span>
          <span className="text-[var(--archive-white)]/25">//</span>
          <span>THE INTERFACE ERA · 2004–2014</span>
        </div>

        <h2 className="max-w-[22ch] text-[2rem] font-light leading-[1.08] tracking-tight sm:text-[3.6rem]">
          The page learns to <span className="text-gradient">answer</span>.
        </h2>

        {/* live system metrics — the interface era's denser operational surface */}
        <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[0.56rem] tracking-[0.18em] text-[var(--archive-white)]/40">
          {([["SESSIONS", "12.4K"], ["LATENCY", "42MS"], ["UPTIME", "99.9%"], ["EVENTS", "LIVE"]] as const).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--norvo-violet)" }} />
              <span>{k}</span>
              <span className="text-[var(--archive-white)]/70">{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
          {/* The control surface — a gradient data-graph */}
          <div className="rounded-xl border border-[var(--archive-white)]/10 bg-[var(--archive-white)]/[0.025] p-5">
            <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.24em] text-[var(--archive-white)]/35">
              <span>Engagement · live</span>
              <span className="text-[var(--norvo-violet)]">▲ realtime</span>
            </div>
            <Graph run={entered} />
            <div className="mt-3 flex items-center gap-2 text-[0.6rem] text-[var(--archive-white)]/30">
              <span className="text-[var(--norvo-violet)]">›</span>
              <span>query: how do people read the web</span>
              <span className="norvo-anim-cursor inline-block h-[0.85em] w-[0.5ch] translate-y-[0.1em] bg-[var(--norvo-violet)]" />
            </div>
          </div>

          {/* Live value readouts */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[var(--archive-white)]/10 bg-[var(--archive-white)]/[0.025] px-4 py-3.5"
                style={{
                  opacity: entered ? 1 : 0,
                  transform: entered ? "translateY(0)" : "translateY(12px)",
                  transition: reduce ? "opacity 0.4s ease" : `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.07}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.07}s`,
                }}
              >
                <Stat {...stat} run={entered} reduce={!!reduce} delay={0.12 + i * 0.07} />
                <div className="mt-1 text-[0.55rem] uppercase leading-tight tracking-[0.14em] text-[var(--archive-white)]/40">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Graph({ run }: { run: boolean }) {
  // A sleek area graph drawn in the Signature Gradient; the line draws itself in
  // once on entry (stroke-dashoffset), then holds.
  const pathRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const p = pathRef.current;
    if (!p || !run) return;
    const len = p.getTotalLength();
    p.style.transition = "none";
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    // next frame → animate to 0
    const id = requestAnimationFrame(() => {
      p.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)";
      p.style.strokeDashoffset = "0";
    });
    return () => cancelAnimationFrame(id);
  }, [run]);

  const d = "M0,86 L40,78 L80,82 L120,60 L160,66 L200,44 L240,52 L280,30 L320,36 L360,14 L400,20";
  return (
    <svg viewBox="0 0 400 100" className="mt-3 h-20 w-full sm:h-28" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="archGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6D5DFB" />
          <stop offset="100%" stopColor="#D8B46A" />
        </linearGradient>
        <linearGradient id="archFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D5DFB" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6D5DFB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L400,100 L0,100 Z`} fill="url(#archFill)" />
      <path ref={pathRef} d={d} fill="none" stroke="url(#archGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Stat({ value, suffix, run, reduce, delay }: { value: number; suffix: string; run: boolean; reduce: boolean; delay: number }) {
  const [n, setN] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!run || started.current) return;
    started.current = true;
    if (reduce) {
      setN(value);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const dur = 680;
    const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur);
      setN(Math.round(value * easeOut(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay * 1000);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [run, reduce, value, delay]);

  return (
    <div className="text-[1.5rem] font-semibold tabular-nums tracking-tight sm:text-[1.7rem]" style={{ color: "var(--observatory-gold)" }}>
      {n}
      {suffix}
    </div>
  );
}
