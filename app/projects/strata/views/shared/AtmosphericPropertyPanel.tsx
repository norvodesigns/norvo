"use client";

import { useRef, useState, type RefObject } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import type { Property } from "../../data";
import { G } from "../../constants";

interface Props {
  property: Property;
  index: number;
  onClick: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function AtmosphericPropertyPanel({ property: p, index, onClick, containerRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: panelRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  const imgY     = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const imgScale = useSpring(hovered ? 1.05 : 1.0, { stiffness: 200, damping: 30 });
  const arrowX   = useSpring(hovered ? 0 : -8,     { stiffness: 200, damping: 30 });

  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={panelRef}
      data-panel="true"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        minHeight: "80vh",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {/* Background image with parallax */}
      <motion.div
        style={{
          position: "absolute", inset: "-15%",
          y: imgY,
          scale: imgScale,
        }}
      >
        <img
          src={p.heroImage}
          alt={p.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: hovered
            ? "linear-gradient(to top, rgba(13,13,11,0.92) 0%, rgba(13,13,11,0.35) 55%, transparent 100%)"
            : "linear-gradient(to top, rgba(13,13,11,0.88) 0%, rgba(13,13,11,0.25) 50%, transparent 100%)",
          transition: "background 0.5s ease",
        }} />
      </motion.div>

      {/* Mid layer: environmental data (desktop only) */}
      <div style={{
        position: "absolute", top: 32, right: 32,
        textAlign: "right",
        pointerEvents: "none",
        display: "none",
      }} className="md:block">
        <div style={{ color: `rgba(196,154,46,0.4)`, fontSize: "0.5rem", letterSpacing: "0.24em", marginBottom: 2 }}>
          {p.coordinates}
        </div>
        <div style={{ color: `rgba(196,154,46,0.3)`, fontSize: "0.45rem", letterSpacing: "0.2em" }}>
          {p.elevation} · {p.district}
        </div>
      </div>

      {/* Panel index */}
      <div style={{
        position: "absolute", top: 32, left: 32,
        color: `rgba(250,250,249,0.18)`,
        fontSize: "0.6rem",
        letterSpacing: "0.22em",
        fontVariantNumeric: "tabular-nums",
        pointerEvents: "none",
      }}>
        {num} / 06
      </div>

      {/* Foreground: text */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "0 2rem 2.5rem",
        width: "100%",
      }}>
        <div style={{ color: `rgba(196,154,46,0.75)`, fontSize: "0.5rem", letterSpacing: "0.32em", marginBottom: "0.75rem" }}>
          {p.location.toUpperCase()}
        </div>

        <h3 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 200,
          fontSize: "clamp(1.8rem, 4vw, 3rem)",
          color: G.white,
          lineHeight: 1.05,
          margin: "0 0 0.5rem",
        }}>
          {p.name}
        </h3>

        <div style={{ color: `rgba(196,154,46,0.9)`, fontSize: "0.8rem", letterSpacing: "0.08em", marginBottom: "1rem" }}>
          {p.priceRange}
        </div>

        <div style={{ color: `rgba(250,250,249,0.45)`, fontSize: "0.65rem", marginBottom: "1.5rem" }}>
          {p.beds} bed · {p.baths} bath · {p.sqft} sq ft
        </div>

        {/* CTA — reveals on hover */}
        <motion.div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            color: G.white,
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            opacity: hovered ? 1 : 0.35,
            transition: "opacity 0.4s ease",
          }}
        >
          <span>VIEW PROPERTY</span>
          <motion.span style={{ x: arrowX, display: "inline-block" }}>→</motion.span>
        </motion.div>

        {/* Status tag */}
        {p.status !== "Available" && (
          <div style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.2rem 0.75rem",
            border: `1px solid rgba(196,154,46,0.4)`,
            color: `rgba(196,154,46,0.85)`,
            fontSize: "0.5rem",
            letterSpacing: "0.28em",
          }}>
            {p.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Gold hairline at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 1,
        background: `rgba(196,154,46,0.15)`,
      }} />
    </div>
  );
}
