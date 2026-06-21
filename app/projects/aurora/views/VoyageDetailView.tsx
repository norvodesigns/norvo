"use client";

import { motion } from "motion/react";
import { G } from "../constants";
import type { Nav } from "../types";
import { VOYAGES } from "../data";

interface Props {
  id: string;
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Deterministic star field
function buildStars(seed: number, count: number) {
  const rng = (n: number) => {
    const x = Math.sin(n * 9301 + seed * 49297 + 233720) * 10000;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => ({
    x: rng(i * 3) * 100, y: rng(i * 3 + 1) * 100,
    r: rng(i * 3 + 2) * 1.3 + 0.25, op: rng(i * 3 + 2) * 0.55 + 0.12,
  }));
}
const DETAIL_STARS = buildStars(77, 80);

export default function VoyageDetailView({ id, navigate, containerRef: _containerRef }: Props) {
  const voyage = VOYAGES.find(v => v.id === id) ?? VOYAGES[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        display: "grid",
        gridTemplateColumns: "clamp(200px, 38%, 440px) 1fr",
        gridTemplateRows: "100%",
        height: "100%",
        background: G.void2,
      }}
    >
      {/* Left pane — environment (sticky, no scroll) */}
      <div style={{
        position: "sticky", top: 0, height: "100%", overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Gradient env */}
        <div style={{ position: "absolute", inset: 0, background: voyage.envGradient }} />

        {/* Stars */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.80 }} aria-hidden>
          {DETAIL_STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.op} />
          ))}
        </svg>

        {/* Class-specific overlay */}
        {voyage.class === "Sub-Orbital" && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }} aria-hidden>
            <defs>
              <linearGradient id="det-atm" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3366FF" stopOpacity="0" />
                <stop offset="80%" stopColor="#66AAFF" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#88CCFF" stopOpacity="0.60" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#det-atm)" />
            <path d="M -5,87 Q 50,82 105,87" fill="none" stroke="#5599FF" strokeWidth="0.45" opacity="0.28" />
          </svg>
        )}
        {voyage.class === "Orbital" && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.60 }} aria-hidden>
            <defs>
              <radialGradient id="det-earth" cx="50%" cy="120%" r="75%">
                <stop offset="0%" stopColor={voyage.envAccent} stopOpacity="0.50" />
                <stop offset="100%" stopColor={voyage.envAccent} stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="115" rx="60" ry="45" fill="url(#det-earth)" />
          </svg>
        )}
        {voyage.class === "Cislunar" && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }} aria-hidden>
            <defs>
              <radialGradient id="det-moon" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8888B8" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#222260" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="70" cy="26" r="11" fill="url(#det-moon)" />
            <circle cx="70" cy="26" r="10.2" fill="none" stroke="#9090C8" strokeWidth="0.28" opacity="0.36" />
            <path d="M -10,86 Q 50,26 110,86" fill="none" stroke={voyage.envAccent}
              strokeWidth="0.35" strokeDasharray="3 3" opacity="0.22" />
          </svg>
        )}

        {/* Dark gradient — heavier at bottom for text legibility */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.12) 40%, rgba(8,8,8,0.88) 100%)",
        }} />

        {/* Top scanline */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.10)" }} />

        {/* Bottom-anchored label */}
        <div style={{ position: "relative", padding: "1.5rem", zIndex: 1 }}>
          <div style={{ fontFamily: "monospace", fontSize: "0.38rem", color: G.ice, letterSpacing: "0.20em", marginBottom: 6 }}>
            {voyage.class.toUpperCase()} · {voyage.designation}
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 100,
            fontSize: "clamp(1.4rem, 3.5vw, 2.5rem)", color: G.white,
            letterSpacing: "0.04em", margin: 0, lineHeight: 1.1,
          }}>
            {voyage.name}
          </h1>
        </div>
      </div>

      {/* Right pane — scrollable data */}
      <div style={{
        height: "100%", overflowY: "auto", overflowX: "hidden",
        padding: "2rem 2rem 4rem",
        background: G.void2,
      }}>
        {/* Back button */}
        <button
          onClick={() => navigate({ view: "voyages" })}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontFamily: "monospace", fontSize: "0.40rem", letterSpacing: "0.22em",
            color: G.silver, marginBottom: "2rem", display: "flex",
            alignItems: "center", gap: 8, transition: "color 0.2s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = G.ice; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = G.silver; }}
        >
          ← ALL VOYAGES
        </button>

        {/* Price */}
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 100,
          fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)", color: G.frost,
          marginBottom: "2rem", letterSpacing: "0.03em",
        }}>
          {voyage.price}
        </div>

        {/* Spec sheet */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{
            fontFamily: "monospace", fontSize: "0.40rem",
            color: G.ice, letterSpacing: "0.22em", marginBottom: "1rem",
          }}>
            MISSION PARAMETERS
          </div>
          {voyage.stats.map((s, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "0.60rem 0",
            }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.38rem", color: G.iron, letterSpacing: "0.16em" }}>
                {s.label.toUpperCase()}
              </div>
              <div style={{ fontSize: "0.72rem", color: G.chrome }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{
            fontFamily: "monospace", fontSize: "0.40rem",
            color: G.ice, letterSpacing: "0.22em", marginBottom: "1rem",
          }}>
            THE EXPERIENCE
          </div>
          <p style={{
            color: G.chrome, fontSize: "0.82rem",
            fontWeight: 200, lineHeight: 1.75, letterSpacing: "0.01em", margin: 0,
          }}>
            {voyage.description}
          </p>
        </div>

        {/* Highlights */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{
            fontFamily: "monospace", fontSize: "0.40rem",
            color: G.ice, letterSpacing: "0.22em", marginBottom: "1rem",
          }}>
            VOYAGE HIGHLIGHTS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {voyage.highlights.map((h, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                paddingBottom: "0.75rem",
              }}>
                <div style={{ fontFamily: "monospace", fontSize: "0.38rem", color: G.ice, paddingTop: "0.18rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ color: G.chrome, fontSize: "0.72rem", lineHeight: 1.55 }}>
                  {h}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          padding: "1.5rem",
          background: G.gunmetal,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            fontFamily: "monospace", fontSize: "0.38rem",
            color: G.ice, letterSpacing: "0.20em", marginBottom: "0.6rem",
          }}>
            SECURE YOUR SEAT
          </div>
          <p style={{ color: G.silver, fontSize: "0.68rem", lineHeight: 1.6, margin: "0 0 1.25rem" }}>
            Voyages depart on a private schedule. Contact our mission team to discuss availability and passenger requirements.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate({ view: "contact" })}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.28)",
                color: G.frost,
                padding: "0.65rem 1.75rem",
                fontSize: "0.40rem", letterSpacing: "0.28em",
                cursor: "pointer", fontFamily: "monospace",
                transition: "border-color 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = G.ice;
                (e.currentTarget as HTMLButtonElement).style.color = G.ice;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.28)";
                (e.currentTarget as HTMLButtonElement).style.color = G.frost;
              }}
            >
              REQUEST A CONSULTATION
            </button>
            <button
              onClick={() => navigate({ view: "voyages" })}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                color: G.silver,
                padding: "0.65rem 1.75rem",
                fontSize: "0.40rem", letterSpacing: "0.28em",
                cursor: "pointer", fontFamily: "monospace",
              }}
            >
              OTHER VOYAGES
            </button>
          </div>
        </div>

        <p style={{
          marginTop: "2.5rem",
          color: G.iron, fontSize: "0.42rem", letterSpacing: "0.14em",
        }}>
          AURORA IS A CONCEPT SHOWCASE — ALL VOYAGES ARE FICTIONAL · NORVO.DESIGN
        </p>
      </div>
    </motion.div>
  );
}
