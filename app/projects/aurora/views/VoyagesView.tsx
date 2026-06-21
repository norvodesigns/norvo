"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { G } from "../constants";
import type { Nav } from "../types";
import { VOYAGES, type Voyage } from "../data";

interface Props {
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Reuse the same deterministic star builder from HomeView
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

function EnvOverlay({ voyage: v }: { voyage: Voyage }) {
  if (v.class === "Sub-Orbital") return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.60 }} aria-hidden>
      <defs>
        <linearGradient id={`atm-v-${v.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3366FF" stopOpacity="0" />
          <stop offset="75%" stopColor="#4488FF" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#88CCFF" stopOpacity="0.38" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={`url(#atm-v-${v.id})`} />
      <path d="M -5,86 Q 50,81 105,86" fill="none" stroke="#5599FF" strokeWidth="0.4" opacity="0.20" />
    </svg>
  );

  if (v.class === "Orbital") return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }} aria-hidden>
      <defs>
        <radialGradient id={`eg-v-${v.id}`} cx="50%" cy="120%" r="70%">
          <stop offset="0%" stopColor={v.envAccent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={v.envAccent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="115" rx="55" ry="40" fill={`url(#eg-v-${v.id})`} />
    </svg>
  );

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.50 }} aria-hidden>
      <defs>
        <radialGradient id={`moon-v-${v.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8888B8" stopOpacity="0.50" />
          <stop offset="100%" stopColor="#222260" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="68" cy="28" r="9" fill={`url(#moon-v-${v.id})`} />
      <circle cx="68" cy="28" r="8.2" fill="none" stroke="#9090C8" strokeWidth="0.25" opacity="0.30" />
    </svg>
  );
}

function VoyageCard({ voyage: v, index, onClick }: { voyage: Voyage; index: number; onClick: () => void }) {
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
        height: "clamp(260px, 45vh, 380px)",
        overflow: "hidden",
        cursor: "pointer",
        outline: hovered ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.06)",
        outlineOffset: -1,
        transition: "outline-color 0.25s ease",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: v.envGradient }} />

      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.75 }} aria-hidden>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.op} />
        ))}
      </svg>

      <EnvOverlay voyage={v} />

      <div style={{
        position: "absolute", inset: 0,
        background: hovered
          ? "linear-gradient(to top, rgba(8,8,8,0.82) 0%, rgba(8,8,8,0.18) 60%, rgba(8,8,8,0.05) 100%)"
          : "linear-gradient(to top, rgba(8,8,8,0.90) 0%, rgba(8,8,8,0.30) 60%, rgba(8,8,8,0.08) 100%)",
        transition: "background 0.35s ease",
      }} />

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.10)" }} />

      <div style={{ position: "absolute", top: 14, right: 14, textAlign: "right" }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.38rem", color: "rgba(255,255,255,0.26)", letterSpacing: "0.14em" }}>
          {v.designation}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "0.36rem", color: "rgba(255,255,255,0.16)", letterSpacing: "0.10em", marginTop: 2 }}>
          {v.altitude} · {v.duration}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 1.25rem 1.25rem", zIndex: 1 }}>
        <div style={{
          display: "inline-block",
          border: "1px solid rgba(255,255,255,0.20)",
          padding: "0.18rem 0.55rem",
          fontSize: "0.38rem", letterSpacing: "0.22em",
          color: G.silver, marginBottom: "0.55rem",
          fontFamily: "monospace",
        }}>
          {v.class.toUpperCase()}
        </div>

        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 100,
          fontSize: "clamp(1.1rem, 2.5vw, 1.65rem)",
          color: G.white, letterSpacing: "0.04em",
          margin: "0 0 0.35rem", lineHeight: 1.1,
        }}>
          {v.name}
        </h2>

        <div style={{ fontSize: "0.58rem", color: G.chrome, marginBottom: "0.55rem" }}>
          {v.price}
        </div>

        <div style={{
          fontSize: "0.38rem", color: G.silver, letterSpacing: "0.18em",
          fontFamily: "monospace",
          opacity: hovered ? 1 : 0.28,
          transition: "opacity 0.25s ease",
        }}>
          VIEW DEPARTURE →
        </div>
      </div>
    </div>
  );
}

const TABLE_ROWS: { label: string; getValue: (v: Voyage) => string }[] = [
  { label: "ALTITUDE",    getValue: v => v.altitude },
  { label: "DURATION",    getValue: v => v.duration },
  { label: "MICROGRAVITY", getValue: v => v.microgravity },
  { label: "CAPACITY",    getValue: v => `${v.capacity} passengers` },
  { label: "PRICE",       getValue: v => v.price },
];

export default function VoyagesView({ navigate, containerRef: _containerRef }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ minHeight: "100%", background: G.void2 }}
    >
      {/* Header */}
      <div style={{ padding: "2rem 1.5rem 2rem" }}>
        <div style={{
          fontFamily: "monospace", fontSize: "0.40rem",
          color: G.ice, letterSpacing: "0.24em", marginBottom: "0.65rem",
        }}>
          VOYAGE CATALOG
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 100,
          fontSize: "clamp(1.8rem, 4vw, 3rem)", color: G.white,
          letterSpacing: "0.04em", margin: "0 0 0.5rem",
        }}>
          Departures
        </h1>
        <p style={{ color: G.silver, fontSize: "0.70rem", margin: 0 }}>
          Three classes of departure — select the distance that calls to you
        </p>
      </div>

      {/* Card grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 1,
        margin: "0 1.5rem",
      }}>
        {VOYAGES.map((v, i) => (
          <VoyageCard
            key={v.id}
            voyage={v}
            index={i}
            onClick={() => navigate({ view: "voyage", id: v.id })}
          />
        ))}
      </div>

      {/* Mission parameters table */}
      <div style={{ padding: "2.5rem 1.5rem 0" }}>
        <div style={{
          fontFamily: "monospace", fontSize: "0.40rem",
          color: G.ice, letterSpacing: "0.24em", marginBottom: "1.5rem",
        }}>
          MISSION PARAMETERS
        </div>

        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "140px repeat(3, 1fr)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          paddingBottom: "0.75rem",
        }}>
          <div />
          {VOYAGES.map(v => (
            <div key={v.id} style={{
              fontSize: "0.42rem", letterSpacing: "0.18em",
              color: G.platinum, fontFamily: "monospace",
              textAlign: "center",
            }}>
              {v.designation}
            </div>
          ))}
        </div>

        {TABLE_ROWS.map((row, ri) => (
          <div key={row.label} style={{
            display: "grid",
            gridTemplateColumns: "140px repeat(3, 1fr)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: ri % 2 === 0 ? "rgba(28,28,30,0.40)" : "transparent",
          }}>
            <div style={{
              padding: "0.65rem 0.5rem 0.65rem 0",
              fontFamily: "monospace", fontSize: "0.38rem",
              color: G.iron, letterSpacing: "0.16em",
            }}>
              {row.label}
            </div>
            {VOYAGES.map(v => (
              <div key={v.id} style={{
                padding: "0.65rem 0.75rem",
                fontSize: "0.60rem", color: G.chrome,
                textAlign: "center",
              }}>
                {row.getValue(v)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: "2rem 1.5rem 3rem", marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p style={{ color: G.iron, fontSize: "0.42rem", letterSpacing: "0.14em", margin: 0 }}>
          ALL CONTENT IS ENTIRELY FICTIONAL — AURORA IS A CONCEPT SHOWCASE BY NORVO
        </p>
      </div>
    </motion.div>
  );
}
