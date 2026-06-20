"use client";

import { useRef, useState, useEffect, type RefObject } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useDeviceTilt } from "@/components/DeviceTilt";
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
  const reduce = useReducedMotion();
  const tilt   = useDeviceTilt();

  const { scrollYProgress } = useScroll({
    target: panelRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  // Scroll parallax
  const imgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  // Gyro / cursor x-parallax on image
  const gyroX    = useMotionValue(0);
  const imgShiftX = useSpring(gyroX, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reduce || !tilt?.enabled) return;
    const u = tilt.tiltX.on("change", v => gyroX.set(v * 18));
    return () => { u(); gyroX.set(0); };
  }, [tilt, reduce, gyroX]);

  // Hover springs
  const imgScale = useSpring(hovered ? 1.045 : 1.0, { stiffness: 200, damping: 30 });
  const arrowX   = useSpring(hovered ? 0 : -8,      { stiffness: 200, damping: 30 });
  const accentH  = useSpring(hovered ? 1 : 0,        { stiffness: 180, damping: 26 });

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
      {/* Background: scroll parallax → gyro x shift */}
      <motion.div
        style={{
          position: "absolute", inset: "-15%",
          y: imgY,
          scale: imgScale,
        }}
      >
        <motion.div
          style={{ position: "absolute", inset: 0, x: imgShiftX }}
        >
          <img
            src={p.heroImage}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        </motion.div>

        {/* Dark overlay — lifts on hover */}
        <div style={{
          position: "absolute", inset: 0,
          background: hovered
            ? "linear-gradient(to top, rgba(13,13,11,0.93) 0%, rgba(13,13,11,0.3) 55%, transparent 100%)"
            : "linear-gradient(to top, rgba(13,13,11,0.88) 0%, rgba(13,13,11,0.22) 50%, transparent 100%)",
          transition: "background 0.55s ease",
        }} />
      </motion.div>

      {/* Gold vertical accent — scaleY 0→1 on hover, left edge */}
      <motion.div
        style={{
          position: "absolute",
          left: 0, top: "10%", bottom: "10%",
          width: 2,
          scaleY: accentH,
          transformOrigin: "top",
          background: "linear-gradient(to bottom, transparent, rgba(196,154,46,0.7) 30%, rgba(196,154,46,0.55) 70%, transparent)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Environmental data — desktop only */}
      <div style={{
        position: "absolute", top: 32, right: 32,
        textAlign: "right",
        pointerEvents: "none",
        display: "none",
      }} className="md:block">
        <div style={{ color: "rgba(196,154,46,0.4)", fontSize: "0.5rem", letterSpacing: "0.24em", marginBottom: 2 }}>
          {p.coordinates}
        </div>
        <div style={{ color: "rgba(196,154,46,0.3)", fontSize: "0.45rem", letterSpacing: "0.2em" }}>
          {p.elevation} · {p.district}
        </div>
      </div>

      {/* Panel index */}
      <div style={{
        position: "absolute", top: 32, left: 32,
        color: "rgba(250,250,249,0.18)",
        fontSize: "0.6rem",
        letterSpacing: "0.22em",
        fontVariantNumeric: "tabular-nums",
        pointerEvents: "none",
      }}>
        {num} / 06
      </div>

      {/* Foreground text */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "0 2rem 2.5rem",
        width: "100%",
      }}>
        <div style={{ color: "rgba(196,154,46,0.75)", fontSize: "0.5rem", letterSpacing: "0.32em", marginBottom: "0.75rem" }}>
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

        <div style={{ color: "rgba(196,154,46,0.9)", fontSize: "0.8rem", letterSpacing: "0.08em", marginBottom: "1rem" }}>
          {p.priceRange}
        </div>

        <div style={{ color: "rgba(250,250,249,0.45)", fontSize: "0.65rem", marginBottom: "1.5rem" }}>
          {p.beds} bed · {p.baths} bath · {p.sqft} sq ft
        </div>

        {/* CTA — brightens and arrow slides on hover */}
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
          <span>VIEW LISTING</span>
          <motion.span style={{ x: arrowX, display: "inline-block" }}>→</motion.span>
        </motion.div>

        {/* Status tag */}
        {p.status !== "Available" && (
          <div style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.2rem 0.75rem",
            border: "1px solid rgba(196,154,46,0.4)",
            color: "rgba(196,154,46,0.85)",
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
        background: "rgba(196,154,46,0.15)",
      }} />
    </div>
  );
}
