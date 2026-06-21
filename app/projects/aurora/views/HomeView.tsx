"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { G } from "../constants";
import type { Nav } from "../types";
import { VOYAGES, type Voyage } from "../data";

interface Props {
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Per-class SVG astronomy overlays (same as VoyagePanel, adapted for card format)
function VoyageEnvOverlay({ voyage: v }: { voyage: Voyage }) {
  if (v.class === "Sub-Orbital") return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.65 }} aria-hidden>
      <defs>
        <linearGradient id={`atm-h-${v.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3366FF" stopOpacity="0" />
          <stop offset="75%" stopColor="#4488FF" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#88CCFF" stopOpacity="0.40" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={`url(#atm-h-${v.id})`} />
      <path d="M -5,86 Q 50,81 105,86" fill="none" stroke="#5599FF" strokeWidth="0.4" opacity="0.25" />
    </svg>
  );

  if (v.class === "Orbital") return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.60 }} aria-hidden>
      <defs>
        <radialGradient id={`eg-h-${v.id}`} cx="50%" cy="120%" r="70%">
          <stop offset="0%" stopColor={v.envAccent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={v.envAccent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="115" rx="55" ry="40" fill={`url(#eg-h-${v.id})`} />
    </svg>
  );

  // Cislunar
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }} aria-hidden>
      <defs>
        <radialGradient id={`moon-h-${v.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8888B8" stopOpacity="0.50" />
          <stop offset="100%" stopColor="#222260" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="68" cy="28" r="9" fill={`url(#moon-h-${v.id})`} />
      <circle cx="68" cy="28" r="8.2" fill="none" stroke="#9090C8" strokeWidth="0.25" opacity="0.35" />
    </svg>
  );
}

// Deterministic star field for each card
function buildStars(seed: number, count: number) {
  const rng = (n: number) => {
    const x = Math.sin(n * 9301 + seed * 49297 + 233720) * 10000;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => ({
    x: rng(i * 3) * 100,
    y: rng(i * 3 + 1) * 100,
    r: rng(i * 3 + 2) * 1.1 + 0.25,
    op: rng(i * 3 + 2) * 0.50 + 0.12,
  }));
}
const CARD_STARS = [buildStars(17, 55), buildStars(42, 45), buildStars(91, 38)];

function DepartureCard({ voyage: v, index, onClick, isMobile }: {
  voyage: Voyage;
  index: number;
  onClick: () => void;
  isMobile: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const stars = CARD_STARS[index % CARD_STARS.length];

  return (
    <div
      onClick={onClick}
      data-panel="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        minHeight: isMobile ? "42vw" : undefined,
        borderRight: !isMobile && index < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
        borderBottom: isMobile && index < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
        outline: hovered ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.0)",
        outlineOffset: -1,
        transition: "outline-color 0.25s ease",
      }}
    >
      {/* Gradient environment */}
      <div style={{ position: "absolute", inset: 0, background: v.envGradient }} />

      {/* Star field */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.80 }} aria-hidden>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.op} />
        ))}
      </svg>

      {/* Per-voyage astronomy overlay */}
      <VoyageEnvOverlay voyage={v} />

      {/* Dark gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: hovered
          ? "linear-gradient(to top, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.20) 60%, rgba(8,8,8,0.05) 100%)"
          : "linear-gradient(to top, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.32) 60%, rgba(8,8,8,0.10) 100%)",
        transition: "background 0.35s ease",
      }} />

      {/* Top scanline */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.12)" }} />

      {/* Top-right telemetry */}
      <div style={{ position: "absolute", top: 14, right: 16, textAlign: "right" }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.38rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.14em" }}>
          {v.designation}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "0.36rem", color: "rgba(255,255,255,0.16)", letterSpacing: "0.10em", marginTop: 2 }}>
          {v.altitude}
        </div>
      </div>

      {/* Bottom-left content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 1.25rem 1.25rem", zIndex: 1 }}>
        {/* Class badge */}
        <div style={{
          display: "inline-block",
          border: "1px solid rgba(255,255,255,0.22)",
          padding: "0.18rem 0.55rem",
          fontSize: "0.38rem", letterSpacing: "0.22em",
          color: G.silver, marginBottom: "0.6rem",
          fontFamily: "monospace",
        }}>
          {v.class.toUpperCase()}
        </div>

        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 100,
          fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)",
          color: G.white, letterSpacing: "0.05em",
          margin: "0 0 0.4rem", lineHeight: 1.1,
        }}>
          {v.name}
        </h2>

        <div style={{ fontSize: "0.58rem", color: G.chrome, letterSpacing: "0.03em", marginBottom: "0.65rem" }}>
          {v.price}
        </div>

        <div style={{
          fontSize: "0.38rem", color: G.silver, letterSpacing: "0.18em",
          fontFamily: "monospace",
          opacity: hovered ? 1 : 0.30,
          transition: "opacity 0.25s ease",
        }}>
          VIEW DEPARTURE →
        </div>
      </div>
    </div>
  );
}

export default function HomeView({ navigate, containerRef: _containerRef }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  const year = new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        display: "flex", flexDirection: "column",
        height: "100%",
        background: "transparent",
      }}
    >
      {/* Top status band */}
      <div style={{
        height: 52, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 1.25rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(8,8,8,0.55)",
      }}>
        <span style={{
          fontFamily: "monospace", fontSize: "0.42rem",
          letterSpacing: "0.20em", color: G.silver,
        }}>
          AURORA PRIVATE SPACEFLIGHT · STATUS: NOMINAL
        </span>
        <span style={{
          marginLeft: "auto", fontFamily: "monospace",
          fontSize: "0.40rem", color: G.iron, letterSpacing: "0.14em",
        }}>
          {year}
        </span>
      </div>

      {/* Departure cards */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gridTemplateRows: isMobile ? "repeat(3, 1fr)" : "1fr",
        overflow: isMobile ? "auto" : "hidden",
        minHeight: 0,
      }}>
        {VOYAGES.map((v, i) => (
          <DepartureCard
            key={v.id}
            voyage={v}
            index={i}
            isMobile={isMobile}
            onClick={() => navigate({ view: "voyage", id: v.id })}
          />
        ))}
      </div>

      {/* Bottom status ticker */}
      <div style={{
        height: 38, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 1.25rem",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(8,8,8,0.55)",
      }}>
        <span style={{
          fontFamily: "monospace", fontSize: "0.40rem",
          letterSpacing: "0.16em", color: G.iron,
        }}>
          3 VOYAGE CLASSES · 3 VEHICLES · EST. 2029
        </span>
      </div>
    </motion.div>
  );
}
