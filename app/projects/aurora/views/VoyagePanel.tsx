"use client";

import { useRef, useState, type RefObject } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import type { Voyage } from "../data";
import { G } from "../constants";

// Seeded pseudo-random star positions per voyage (deterministic, no re-render flicker)
function buildStars(seed: number, count: number) {
  const rng = (n: number) => {
    let x = Math.sin(n * 9301 + seed * 49297 + 233720) * 10000;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => ({
    x:  rng(i * 3 + 0) * 100,
    y:  rng(i * 3 + 1) * 100,
    r:  rng(i * 3 + 2) * 1.2 + 0.3,
    op: rng(i * 3 + 2) * 0.55 + 0.15,
  }));
}

const PANEL_STARS = [
  buildStars(17, 80),
  buildStars(42, 60),
  buildStars(91, 50),
];

interface Props {
  voyage: Voyage;
  index: number;
  total: number;
  onClick: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function VoyagePanel({ voyage: v, index, total, onClick, containerRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: panelRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  const envY     = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const arrowX   = useSpring(hovered ? 0 : -10, { stiffness: 200, damping: 30 });
  const accentH  = useSpring(hovered ? 1 : 0,   { stiffness: 180, damping: 26 });

  const stars = PANEL_STARS[index % PANEL_STARS.length];
  const num   = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={panelRef}
      data-panel="true"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        minHeight: "82vh",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {/* Environment gradient + stars parallax layer */}
      <motion.div
        style={{
          position: "absolute", inset: "-12%",
          y: envY,
        }}
      >
        {/* Gradient environment */}
        <div style={{
          position: "absolute", inset: 0,
          background: v.envGradient,
        }} />

        {/* Procedural SVG star field */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.9 }}
          aria-hidden
        >
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={s.x} cy={s.y}
              r={s.r}
              fill="white"
              opacity={s.op}
            />
          ))}
        </svg>

        {/* Planet arc for Orbital and Lunar voyages */}
        {v.class === "Orbital" && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}
            aria-hidden
          >
            {/* Earth glow arc from below */}
            <defs>
              <radialGradient id={`eg-${v.id}`} cx="50%" cy="120%" r="70%">
                <stop offset="0%"  stopColor={v.envAccent} stopOpacity="0.55" />
                <stop offset="100%" stopColor={v.envAccent} stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="115" rx="55" ry="40" fill={`url(#eg-${v.id})`} />
            {/* Earth arc line */}
            <path
              d="M 5,100 Q 50,78 95,100"
              fill="none"
              stroke={v.envAccent}
              strokeWidth="0.6"
              opacity="0.35"
            />
          </svg>
        )}

        {v.class === "Cislunar" && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.65 }}
            aria-hidden
          >
            {/* Distant Moon disc */}
            <defs>
              <radialGradient id={`moon-${v.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor="#8888B8" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#4444A0" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#222260" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="72" cy="26" r="10" fill={`url(#moon-${v.id})`} />
            <circle cx="72" cy="26" r="9.2" fill="none" stroke="#9090C8" strokeWidth="0.25" opacity="0.45" />
            {/* Orbital path arc */}
            <path
              d="M -10,85 Q 50,30 110,85"
              fill="none"
              stroke={v.envAccent}
              strokeWidth="0.35"
              strokeDasharray="2.5 2.5"
              opacity="0.25"
            />
          </svg>
        )}

        {v.class === "Sub-Orbital" && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.8 }}
            aria-hidden
          >
            {/* Atmospheric glow bands */}
            <defs>
              <linearGradient id={`atm-${v.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#3366FF" stopOpacity="0" />
                <stop offset="70%"  stopColor="#4488FF" stopOpacity="0.12" />
                <stop offset="90%"  stopColor="#66AAFF" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#88CCFF" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={`url(#atm-${v.id})`} />
            {/* Horizon line */}
            <path
              d="M -5,88 Q 50,83 105,88"
              fill="none"
              stroke="#5599FF"
              strokeWidth="0.5"
              opacity="0.30"
            />
            {/* Ascent trajectory */}
            <path
              d="M 40,98 Q 52,60 60,12"
              fill="none"
              stroke={v.envAccent}
              strokeWidth="0.35"
              strokeDasharray="1.8 2.2"
              opacity="0.35"
            />
          </svg>
        )}

        {/* Dark overlay gradient — more transparent on hover */}
        <div style={{
          position: "absolute", inset: 0,
          background: hovered
            ? "linear-gradient(to top, rgba(2,2,9,0.90) 0%, rgba(2,2,9,0.25) 55%, transparent 100%)"
            : "linear-gradient(to top, rgba(2,2,9,0.88) 0%, rgba(2,2,9,0.18) 50%, transparent 100%)",
          transition: "background 0.55s ease",
        }} />
      </motion.div>

      {/* Left accent line — scaleY on hover */}
      <motion.div
        style={{
          position: "absolute",
          left: 0, top: "8%", bottom: "8%",
          width: 1.5,
          scaleY: accentH,
          transformOrigin: "top",
          background: `linear-gradient(to bottom, transparent, ${v.envAccent} 30%, ${v.envAccent}88 70%, transparent)`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Environmental telemetry — top right */}
      <div style={{
        position: "absolute", top: 28, right: 28,
        textAlign: "right", pointerEvents: "none",
      }}>
        <div style={{ color: "rgba(170,192,255,0.35)", fontSize: "0.48rem", letterSpacing: "0.26em", marginBottom: 2 }}>
          {v.designation}
        </div>
        <div style={{ color: "rgba(170,192,255,0.22)", fontSize: "0.42rem", letterSpacing: "0.2em" }}>
          ALT {v.altitude} · {v.class.toUpperCase()}
        </div>
      </div>

      {/* Panel index */}
      <div style={{
        position: "absolute", top: 28, left: 28,
        color: "rgba(224,224,244,0.14)",
        fontSize: "0.58rem", letterSpacing: "0.22em",
        pointerEvents: "none",
      }}>
        {num} / {String(total).padStart(2, "0")}
      </div>

      {/* Foreground copy */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "0 2rem 2.5rem",
        width: "100%",
      }}>
        <div style={{ color: "rgba(170,192,255,0.70)", fontSize: "0.48rem", letterSpacing: "0.32em", marginBottom: "0.75rem" }}>
          {v.class.toUpperCase()} · {v.duration.toUpperCase()}
        </div>

        <h3 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 200,
          fontSize: "clamp(1.8rem, 4vw, 3rem)",
          color: G.white,
          lineHeight: 1.05,
          margin: "0 0 0.5rem",
          letterSpacing: "0.06em",
        }}>
          {v.name}
        </h3>

        <div style={{ color: "rgba(224,224,244,0.40)", fontSize: "0.70rem", letterSpacing: "0.04em", marginBottom: "1rem", fontStyle: "italic" }}>
          &ldquo;{v.tagline}&rdquo;
        </div>

        <div style={{ color: "rgba(170,192,255,0.80)", fontSize: "0.80rem", letterSpacing: "0.06em", marginBottom: "1.5rem" }}>
          {v.price}
        </div>

        <motion.div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            color: G.white, fontSize: "0.62rem", letterSpacing: "0.22em",
            opacity: hovered ? 1 : 0.30,
            transition: "opacity 0.4s ease",
          }}
        >
          <span>VIEW VOYAGE</span>
          <motion.span style={{ x: arrowX, display: "inline-block" }}>→</motion.span>
        </motion.div>
      </div>

      {/* Bottom hairline */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 1, background: "rgba(100,110,255,0.12)",
      }} />
    </div>
  );
}
