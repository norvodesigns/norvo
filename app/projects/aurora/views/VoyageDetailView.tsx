"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import ScrollReveal3D from "@/components/ScrollReveal3D";
import { G, ease, springFast } from "../constants";
import type { Nav } from "../types";
import { VOYAGES } from "../data";

interface Props {
  id: string;
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function VoyageDetailView({ id, navigate, containerRef }: Props) {
  const voyage = VOYAGES.find(v => v.id === id) ?? VOYAGES[0];
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: containerRef,
    offset: ["start start", "end start"],
  });
  const envY  = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const headOp = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease }}
      style={{ background: G.void }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div ref={heroRef} style={{ position: "relative", height: "85dvh", overflow: "hidden" }}>
        {/* Gradient environment with parallax */}
        <motion.div style={{ position: "absolute", inset: "-12%", y: envY }}>
          <div style={{ position: "absolute", inset: 0, background: voyage.envGradient }} />

          {/* SVG astronomy overlay */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.8 }} aria-hidden>
            {Array.from({ length: 70 }, (_, i) => {
              const x = ((i * 137.5) % 100);
              const y = ((i * 97.3)  % 100);
              const r = (((i * 13) % 10) / 10) * 1.4 + 0.3;
              return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={(((i * 31) % 10) / 10) * 0.55 + 0.12} />;
            })}
          </svg>

          {/* Voyage-class SVG detail */}
          {voyage.class === "Sub-Orbital" && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }} aria-hidden>
              <defs>
                <linearGradient id="hero-atm" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3366FF" stopOpacity="0" />
                  <stop offset="85%" stopColor="#66AAFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#88CCFF" stopOpacity="0.65" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="100" height="100" fill="url(#hero-atm)" />
              <path d="M -5,88 Q 50,83 105,88" fill="none" stroke="#5599FF" strokeWidth="0.5" opacity="0.35" />
            </svg>
          )}
          {voyage.class === "Orbital" && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.65 }} aria-hidden>
              <defs>
                <radialGradient id="hero-earth" cx="50%" cy="120%" r="75%">
                  <stop offset="0%"  stopColor={voyage.envAccent} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={voyage.envAccent} stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="50" cy="115" rx="60" ry="45" fill="url(#hero-earth)" />
              <path d="M 0,98 Q 50,76 100,98" fill="none" stroke={voyage.envAccent} strokeWidth="0.65" opacity="0.35" />
            </svg>
          )}
          {voyage.class === "Cislunar" && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.60 }} aria-hidden>
              <defs>
                <radialGradient id="hero-moon" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"  stopColor="#8888B8" stopOpacity="0.60" />
                  <stop offset="100%" stopColor="#222260" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="72" cy="24" r="12" fill="url(#hero-moon)" />
              <circle cx="72" cy="24" r="11" fill="none" stroke="#9090C8" strokeWidth="0.3" opacity="0.40" />
              <path d="M -10,88 Q 50,28 110,88" fill="none" stroke={voyage.envAccent}
                strokeWidth="0.4" strokeDasharray="3 3" opacity="0.25" />
            </svg>
          )}

          {/* Overlays */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(2,2,9,0.70) 0%, rgba(2,2,9,0.15) 45%, rgba(2,2,9,0.90) 100%)",
          }} />
        </motion.div>

        {/* Hero copy */}
        <motion.div
          style={{
            position: "absolute", inset: 0, opacity: headOp,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "0 2rem 5rem",
          }}
        >
          <motion.button
            onClick={() => navigate({ view: "voyages" })}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ...springFast }}
            style={{
              alignSelf: "flex-start",
              marginBottom: "2.5rem",
              background: "transparent",
              border: "none",
              color: "rgba(100,110,255,0.65)",
              fontSize: "0.5rem", letterSpacing: "0.28em",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 8,
              padding: 0,
            }}
          >
            ← ALL VOYAGES
          </motion.button>

          <div style={{ color: "rgba(100,110,255,0.65)", fontSize: "0.48rem", letterSpacing: "0.30em", marginBottom: "0.75rem" }}>
            {voyage.class.toUpperCase()} · {voyage.designation}
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100,
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            color: G.white,
            letterSpacing: "0.06em",
            margin: "0 0 0.75rem",
          }}>
            {voyage.name}
          </h1>
          <p style={{
            color: "rgba(224,224,244,0.42)",
            fontSize: "0.80rem",
            fontStyle: "italic",
            margin: "0 0 1.5rem",
          }}>
            &ldquo;{voyage.tagline}&rdquo;
          </p>
          <div style={{ color: "rgba(170,192,255,0.85)", fontSize: "0.90rem", letterSpacing: "0.06em" }}>
            {voyage.price}
          </div>
        </motion.div>

        {/* Top telemetry */}
        <div style={{ position: "absolute", top: 28, right: 28, textAlign: "right", pointerEvents: "none" }}>
          <div style={{ color: "rgba(100,110,255,0.35)", fontSize: "0.48rem", letterSpacing: "0.24em", marginBottom: 2 }}>
            {voyage.designation}
          </div>
          <div style={{ color: "rgba(100,110,255,0.22)", fontSize: "0.42rem", letterSpacing: "0.2em" }}>
            {voyage.altitude} · {voyage.duration.toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem", background: G.deep }}>
        <ScrollReveal3D axis="y">
          <div style={{ color: "rgba(100,110,255,0.55)", fontSize: "0.48rem", letterSpacing: "0.32em", marginBottom: "2.5rem", textAlign: "center" }}>
            MISSION PARAMETERS
          </div>
        </ScrollReveal3D>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "2rem",
          maxWidth: 780, margin: "0 auto",
        }}>
          {voyage.stats.map((s, i) => (
            <ScrollReveal3D key={i} axis="x" direction={i % 2 === 0 ? 0 : 1}>
              <div style={{ borderTop: "1px solid rgba(68,102,255,0.18)", paddingTop: "1.25rem" }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 100,
                  fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                  color: G.glowSoft,
                  lineHeight: 1,
                  marginBottom: "0.4rem",
                }}>
                  {s.value}
                </div>
                <div style={{ color: "rgba(224,224,244,0.38)", fontSize: "0.50rem", letterSpacing: "0.20em" }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            </ScrollReveal3D>
          ))}
        </div>
      </section>

      {/* ── Description ───────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 2rem", background: G.void, borderTop: "1px solid rgba(68,102,255,0.08)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <ScrollReveal3D axis="y">
            <div style={{ color: "rgba(100,110,255,0.55)", fontSize: "0.48rem", letterSpacing: "0.32em", marginBottom: "1.5rem" }}>
              THE EXPERIENCE
            </div>
            <p style={{
              color: "rgba(224,224,244,0.60)",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.75,
              fontWeight: 200,
              letterSpacing: "0.02em",
            }}>
              {voyage.description}
            </p>
          </ScrollReveal3D>
        </div>
      </section>

      {/* ── Highlights ────────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem 7rem", background: G.deep, borderTop: "1px solid rgba(68,102,255,0.08)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <ScrollReveal3D axis="y">
            <div style={{ color: "rgba(100,110,255,0.55)", fontSize: "0.48rem", letterSpacing: "0.32em", marginBottom: "2.5rem" }}>
              VOYAGE HIGHLIGHTS
            </div>
          </ScrollReveal3D>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {voyage.highlights.map((h, i) => (
              <ScrollReveal3D key={i} axis="x" direction={0}>
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: "1rem",
                  borderLeft: `1.5px solid rgba(68,102,255,0.20)`,
                  paddingLeft: "1.25rem",
                }}>
                  <span style={{ color: "rgba(100,110,255,0.45)", fontSize: "0.45rem", letterSpacing: "0.24em", marginTop: 2, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ color: "rgba(224,224,244,0.65)", fontSize: "0.82rem", lineHeight: 1.55 }}>
                    {h}
                  </span>
                </div>
              </ScrollReveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 2rem 8rem", background: G.void, textAlign: "center", borderTop: "1px solid rgba(68,102,255,0.08)" }}>
        <ScrollReveal3D axis="y">
          <div style={{ color: "rgba(100,110,255,0.55)", fontSize: "0.48rem", letterSpacing: "0.32em", marginBottom: "1.25rem" }}>
            SECURE YOUR SEAT
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100,
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            color: G.white,
            marginBottom: "1rem",
          }}>
            Begin the Process
          </h2>
          <p style={{ color: "rgba(224,224,244,0.38)", fontSize: "0.80rem", maxWidth: 420, margin: "0 auto 2.5rem" }}>
            Voyages depart on a private schedule. Contact our mission team to discuss availability and passenger requirements.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate({ view: "contact" })}
              style={{
                background: "rgba(68,102,255,0.10)",
                border: "1px solid rgba(68,102,255,0.55)",
                color: "rgba(136,153,255,0.95)",
                padding: "0.75rem 2.5rem",
                fontSize: "0.5rem", letterSpacing: "0.28em",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              REQUEST A CONSULTATION
            </button>
            <button
              onClick={() => navigate({ view: "voyages" })}
              style={{
                background: "transparent",
                border: "1px solid rgba(224,224,244,0.18)",
                color: "rgba(224,224,244,0.50)",
                padding: "0.75rem 2.5rem",
                fontSize: "0.5rem", letterSpacing: "0.28em",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              OTHER VOYAGES
            </button>
          </div>
        </ScrollReveal3D>
      </section>

      <div style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid rgba(224,224,244,0.05)" }}>
        <p style={{ color: "rgba(224,224,244,0.14)", fontSize: "0.5rem", letterSpacing: "0.16em" }}>
          AURORA IS A CONCEPT SHOWCASE — ALL VOYAGES ARE FICTIONAL · NORVO.DESIGN
        </p>
      </div>
    </motion.div>
  );
}
