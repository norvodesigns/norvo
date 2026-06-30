"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MotionValue, useTransform, useMotionValueEvent } from "motion/react";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import { BEATS } from "@/lib/timeline";
import { useBind } from "./useBind";

// Persistent chrome for The Ascent (Files 00 §0.6, 15, 17). The global Nav/Footer
// self-suppress on "/", so this owns wayfinding for the whole journey:
//   • the five destinations are always one action away (the escape is a gift)
//   • a calm location sense (which era, how far along)
//   • four colors only — legibility adapts to the era's ground, never costume
// The ground is light through Documents/Pages/Interfaces and dark from
// Experiences onward, so ink (Graphite) inverts to light (Archive White) at the
// Era 3→4 seam.

interface Props {
  progress: MotionValue<number>;
  introComplete: boolean;
}

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

function eraOf(v: number) {
  if (v < BEATS.era1[1]) return { n: "01", label: "DOCUMENTS", phase: 0 };
  if (v < BEATS.era2[1]) return { n: "02", label: "PAGES", phase: 1 };
  if (v < BEATS.era3[1]) return { n: "03", label: "INTERFACES", phase: 2 };
  if (v < BEATS.era4[1]) return { n: "04", label: "EXPERIENCES", phase: 3 };
  if (v < BEATS.warp[1]) return { n: "✦", label: "TIME WARP", phase: 4 };
  return { n: "∞", label: "THE OBSERVATORY", phase: 5 };
}

// File 15 — the one navigation re-tempers era by era (it never reorders or
// disappears). The chrome of the site itself visibly develops as the visitor
// climbs: a bare text index in Documents, a composed masthead rule in Pages, a
// frosted operational bar in Interfaces, a luminous readout in the Observatory.
function barTreatment(phase: number, dark: boolean) {
  const ink = dark ? "244,245,247" : "20,22,26";
  switch (phase) {
    case 0: // Documents — a plain text index, no chrome
      return { background: "transparent", backdropFilter: "none", borderBottom: "1px solid transparent", letterSpacing: "0.01em" };
    case 1: // Pages — a composed masthead: a single hairline rule appears
      return { background: "transparent", backdropFilter: "none", borderBottom: `1px solid rgba(${ink},0.14)`, letterSpacing: "0.04em" };
    case 2: // Interfaces — an operational app bar: faint frosted backing
      return { background: `rgba(${ink === "244,245,247" ? "20,22,26" : "244,245,247"},0.4)`, backdropFilter: "blur(14px)", borderBottom: `1px solid rgba(${ink},0.1)`, letterSpacing: "0.06em" };
    default: // Experiences / Warp / Observatory — luminous frosted readout
      return { background: "rgba(20,22,26,0.32)", backdropFilter: "blur(18px)", borderBottom: `1px solid rgba(${ink},0.08)`, letterSpacing: "0.08em" };
  }
}

export default function HomepageNav({ progress, introComplete }: Props) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true); // ground is dark during the Threshold
  const [era, setEra] = useState(eraOf(0));
  // The % readout is written straight to the DOM (a ref), never via setState — a
  // per-frame setState here was re-rendering the whole nav on every scroll tick,
  // which dropped frames during momentum decay (the tail "stop-stop"). dark/era
  // only setState when they actually change (≈7 times across the whole journey).
  const pctRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(progress, "change", (v) => {
    // The whole journey now runs on a dark ground (the Data Archive → cinematic
    // film), so the ink stays Archive White throughout.
    const d = true;
    setDark((p) => (p === d ? p : d));
    const e = eraOf(v);
    setEra((p) => (p.n === e.n ? p : e));
    if (pctRef.current) {
      pctRef.current.textContent = `${Math.round(Math.min(1, v) * 100)}% — THE ASCENT`;
    }
  });

  // The journey-progress rail fills in the Signature Gradient. Driven through
  // useBind (plain DOM) rather than a <motion.div> — a scroll-linked MotionValue
  // on a motion component routes through WAAPI (element.animate) and crashes the
  // user's WebKit. This is the persistent chrome, so it must be crash-proof.
  const railRef = useRef<HTMLDivElement>(null);
  const railWidth = useTransform(progress, [0, 1], ["0%", "100%"]);
  useBind(railRef, { width: railWidth });

  const ink = dark || !introComplete ? "#F4F5F7" : "#14161A";

  return (
    <>
      {/* Location rail — how far along The Ascent (Signature Gradient) */}
      <div className="fixed inset-x-0 top-0 z-40 h-px" style={{ background: "rgba(128,128,128,0.12)" }}>
        <div ref={railRef} className="h-full" style={{ background: "var(--norvo-gradient)" }} />
      </div>

      {/* Top bar — re-tempers per era (File 15) so the chrome itself evolves */}
      <header
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 sm:px-[8vw]"
        style={{
          color: open ? "#F4F5F7" : ink,
          transition: "color 0.8s ease, background 0.8s ease, backdrop-filter 0.8s ease, border-color 0.8s ease",
          ...(open
            ? { background: "transparent", backdropFilter: "none", borderBottom: "1px solid transparent" }
            : barTreatment(era.phase, dark || !introComplete)),
        }}
      >
        <Link href="/" aria-label="Norvo Designs — home" className="relative z-50">
          <Logo className="text-[1.45rem]" mono />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative text-[0.82rem] tracking-wide opacity-65 transition-opacity duration-300 hover:opacity-100"
            >
              {l.label}
              <span
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ background: "var(--norvo-gradient)" }}
              />
            </Link>
          ))}
          <Button href="/start" variant="primary" size="sm">
            Start a project
          </Button>
        </nav>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
          style={{ color: open ? "#F4F5F7" : ink }}
        >
          <span
            className="block h-[1.5px] w-5 rounded-full bg-current transition-transform duration-300"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65,0,0.35,1)",
              transform: open ? "translateY(3.25px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block h-[1.5px] w-5 rounded-full bg-current transition-transform duration-300"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65,0,0.35,1)",
              transform: open ? "translateY(-3.25px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </header>

      {/* Location indicator — which era (desktop) */}
      <div
        className="pointer-events-none fixed bottom-6 left-6 z-40 hidden font-mono text-[0.65rem] tracking-[0.2em] md:block sm:left-[8vw]"
        style={{ color: ink, transition: "color 0.8s ease" }}
      >
        <div className="flex items-center gap-2 opacity-50">
          <span>{era.n}</span>
          <span>·</span>
          <span>{era.label}</span>
        </div>
        <div ref={pctRef} className="mt-1 tabular-nums opacity-30">0% — THE ASCENT</div>
      </div>

      {/* Mobile menu overlay — CSS-driven (no WAAPI), always mounted so the close
          control and links can never stall mid-animation. */}
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-[#14161A] px-8 md:hidden"
        style={{
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.4s cubic-bezier(0.22,1,0.36,1), visibility 0.4s",
        }}
      >
        {LINKS.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="text-[2.2rem] font-light leading-none tracking-tight text-[var(--archive-white)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transitionDelay: open ? `${0.08 + i * 0.06}s` : "0s",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {l.label}
          </Link>
        ))}
        <div
          className="mt-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transitionDelay: open ? `${0.08 + LINKS.length * 0.06}s` : "0s",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <Button href="/start" variant="primary" withArrow onClick={() => setOpen(false)}>
            Start a project
          </Button>
        </div>
        <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-[var(--archive-white)]/30">
          <a href="mailto:norvodesigns@gmail.com" className="hover:text-[var(--archive-white)]">
            norvodesigns@gmail.com
          </a>
          <span>Instagram · X · Facebook</span>
        </div>
      </div>
    </>
  );
}
