"use client";

import { useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import type { Destination } from "../types";
import { G } from "../constants";

type Props = {
  destination: Destination | null;
  isMobile: boolean;
  onClose: () => void;
};

// Magnetic button that tracks cursor
function MagButton({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 200, damping: 22 });
  const spy = useSpring(py, { stiffness: 200, damping: 22 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left - r.width / 2) * 0.30);
    py.set((e.clientY - r.top - r.height / 2) * 0.30);
  };
  const onLeave = () => { px.set(0); py.set(0); };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: spx, y: spy, ...style }}
      whileTap={{ scale: 0.96 }}
      data-panel
    >
      {children}
    </motion.button>
  );
}

export default function InfoPanel({ destination, isMobile, onClose }: Props) {
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        left: 0, right: 0, bottom: 0,
        maxHeight: "75vh",
        borderRadius: "24px 24px 0 0",
      }
    : {
        position: "fixed",
        right: 0, top: 0, bottom: 0,
        width: "clamp(360px, 36vw, 480px)",
        borderRadius: "0 0 0 0",
      };

  const initial = isMobile ? { y: "100%" } : { x: "100%" };
  const animate = isMobile ? { y: 0 }      : { x: 0 };
  const exit    = isMobile ? { y: "100%" } : { x: "100%" };

  return (
    <AnimatePresence>
      {destination && (
        <motion.div
          key={destination.id}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={{ type: "spring", stiffness: 72, damping: 22 }}
          style={{
            ...panelStyle,
            zIndex: 300,
            background: "rgba(17, 24, 39, 0.78)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderLeft: isMobile ? "none" : `1px solid rgba(166,200,255,0.10)`,
            borderTop: isMobile ? `1px solid rgba(166,200,255,0.10)` : "none",
            boxShadow: "-32px 0 80px rgba(0,0,0,0.55), inset 1px 0 0 rgba(255,255,255,0.03)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          data-panel
        >
          {/* Inner shimmer line at top */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(166,200,255,0.18), transparent)",
          }} />

          {/* Scrollable content */}
          <div style={{
            overflowY: "auto",
            flex: 1,
            padding: isMobile ? "2rem 1.5rem 3rem" : "2.5rem 2rem 3rem",
            scrollbarWidth: "none",
          }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                {/* Designation */}
                <div style={{
                  fontFamily: "monospace",
                  fontSize: "0.55rem",
                  letterSpacing: "0.22em",
                  color: G.secondary,
                  marginBottom: "0.5rem",
                }}>
                  {destination.designation} · {destination.classification}
                </div>

                {/* Name */}
                <h2 style={{
                  fontFamily: "var(--font-display, serif)",
                  fontWeight: 200,
                  fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                  letterSpacing: "0.06em",
                  color: G.white,
                  margin: 0,
                  lineHeight: 1.1,
                }}>
                  {destination.name}
                </h2>

                {/* Role badge */}
                <div style={{
                  display: "inline-block",
                  marginTop: "0.7rem",
                  padding: "0.22rem 0.65rem",
                  background: "rgba(166,200,255,0.08)",
                  border: "1px solid rgba(166,200,255,0.16)",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: "0.48rem",
                  letterSpacing: "0.18em",
                  color: G.secondary,
                }}>
                  {destination.role}
                </div>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                data-panel
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "50%",
                  width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: G.silver,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                  marginLeft: "1rem",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(166,200,255,0.35)";
                  (e.currentTarget as HTMLElement).style.color = G.white;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.10)";
                  (e.currentTarget as HTMLElement).style.color = G.silver;
                }}
              >
                ×
              </button>
            </div>

            {/* Status */}
            <div style={{
              fontFamily: "monospace",
              fontSize: "0.48rem",
              letterSpacing: "0.16em",
              color: G.highlight,
              marginBottom: "1.25rem",
            }}>
              ● {destination.status}
            </div>

            {/* Tagline */}
            <p style={{
              fontStyle: "italic",
              fontSize: "0.85rem",
              color: G.silver,
              lineHeight: 1.55,
              margin: "0 0 1.25rem",
              borderLeft: `2px solid rgba(166,200,255,0.2)`,
              paddingLeft: "0.85rem",
            }}>
              {destination.tagline}
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 0 1.25rem" }} />

            {/* Description */}
            <p style={{
              fontSize: "0.80rem",
              color: G.silver,
              lineHeight: 1.70,
              margin: "0 0 1.75rem",
            }}>
              {destination.description}
            </p>

            {/* Stats grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: "1.75rem",
            }}>
              {destination.stats.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(17,24,39,0.6)",
                    padding: "0.75rem 1rem",
                  }}
                >
                  <div style={{
                    fontFamily: "monospace",
                    fontSize: "0.44rem",
                    letterSpacing: "0.14em",
                    color: G.iron,
                    marginBottom: 4,
                  }}>
                    {s.label.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: "0.80rem",
                    color: G.primary,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                  }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{
                fontFamily: "monospace",
                fontSize: "0.46rem",
                letterSpacing: "0.20em",
                color: G.iron,
                marginBottom: "0.85rem",
              }}>
                MISSION HIGHLIGHTS
              </div>
              {destination.highlights.map((h, i) => (
                <div key={i} style={{
                  display: "flex", gap: "0.65rem",
                  alignItems: "flex-start",
                  marginBottom: "0.55rem",
                  fontSize: "0.75rem",
                  color: G.silver,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: G.secondary, flexShrink: 0, marginTop: 2, fontSize: "0.55rem" }}>
                    ◆
                  </span>
                  {h}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              <MagButton
                style={{
                  flex: 1,
                  padding: "0.9rem 1.5rem",
                  background: G.secondary,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.70rem",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  color: "#080808",
                  whiteSpace: "nowrap",
                } as React.CSSProperties}
              >
                Request Clearance
              </MagButton>
              <MagButton
                style={{
                  padding: "0.9rem 1.25rem",
                  background: "transparent",
                  border: `1px solid rgba(166,200,255,0.22)`,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.70rem",
                  letterSpacing: "0.14em",
                  color: G.secondary,
                  whiteSpace: "nowrap",
                } as React.CSSProperties}
              >
                Scan System
              </MagButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
