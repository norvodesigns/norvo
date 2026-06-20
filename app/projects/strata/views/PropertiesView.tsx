"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Scramble } from "@/components/TextAnimations";
import { G, ease } from "../constants";
import type { Nav } from "../types";
import { PROPERTIES } from "../data";
import AtmosphericPropertyPanel from "./shared/AtmosphericPropertyPanel";

interface Props {
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function PropertiesView({ navigate, containerRef }: Props) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: headerRef,
    container: containerRef,
    offset: ["start start", "end start"],
  });

  const imgY  = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const headOp = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Track which panel is in view via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const panels = el.querySelectorAll("[data-panel-index]");
    if (!panels.length) return;

    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.panelIndex ?? 0);
            setActiveIndex(idx);
          }
        }
      },
      { root: el, threshold: 0.4 }
    );
    panels.forEach(p => obs.observe(p));
    return () => obs.disconnect();
  }, [containerRef]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.01, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease }}
      style={{ background: G.black }}
    >
      {/* Header */}
      <div ref={headerRef} style={{ position: "relative", height: "70dvh", overflow: "hidden" }}>
        <motion.div style={{ position: "absolute", inset: "-15%", y: imgY }}>
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
            alt="Properties"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(13,13,11,0.65) 0%, rgba(13,13,11,0.88) 100%)",
          }} />
        </motion.div>

        <motion.div
          style={{ position: "absolute", inset: 0, opacity: headOp,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "0 2rem 4rem",
          }}
        >
          <div style={{ color: `rgba(196,154,46,0.7)`, fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1.25rem" }}>
            <Scramble text="ALL RESIDENCES" />
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100,
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            color: G.white,
            letterSpacing: "0.06em",
            margin: 0,
          }}>
            Properties
          </h1>
          <p style={{ color: `rgba(250,250,249,0.45)`, fontSize: "0.75rem", marginTop: "1rem" }}>
            {PROPERTIES.length} curated residences across California
          </p>
        </motion.div>

        {/* Coordinate markers */}
        <div style={{
          position: "absolute", top: 32, right: 32,
          textAlign: "right",
          pointerEvents: "none",
        }} className="hidden md:block">
          <div style={{ color: `rgba(196,154,46,0.35)`, fontSize: "0.5rem", letterSpacing: "0.22em" }}>
            {PROPERTIES[0].coordinates}
          </div>
          <div style={{ color: `rgba(196,154,46,0.25)`, fontSize: "0.45rem", letterSpacing: "0.18em", marginTop: 4 }}>
            {PROPERTIES[0].district}
          </div>
        </div>
      </div>

      {/* Floating panel counter */}
      <div style={{
        position: "sticky", top: 80, zIndex: 50,
        display: "flex", justifyContent: "flex-end",
        padding: "0 2rem",
        pointerEvents: "none",
      }}>
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            color: `rgba(196,154,46,0.7)`,
            fontSize: "0.55rem",
            letterSpacing: "0.22em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {String(activeIndex + 1).padStart(2, "0")} / {String(PROPERTIES.length).padStart(2, "0")}
        </motion.div>
      </div>

      {/* Panels */}
      <div>
        {PROPERTIES.map((p, i) => (
          <div key={p.id} data-panel-index={i}>
            <AtmosphericPropertyPanel
              property={p}
              index={i}
              onClick={() => navigate({ view: "property", id: p.id })}
              containerRef={containerRef}
            />
            {/* Gold hairline separator with diamond */}
            {i < PROPERTIES.length - 1 && (
              <div style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "0 2rem",
                background: G.black,
              }}>
                <div style={{ flex: 1, height: 1, background: `rgba(196,154,46,0.1)` }} />
                <div style={{ color: `rgba(196,154,46,0.3)`, fontSize: "0.55rem" }}>◆</div>
                <div style={{ flex: 1, height: 1, background: `rgba(196,154,46,0.1)` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: "6rem 2rem",
        textAlign: "center",
        borderTop: `1px solid rgba(224,223,219,0.08)`,
      }}>
        <p style={{ color: `rgba(250,250,249,0.25)`, fontSize: "0.55rem", letterSpacing: "0.2em" }}>
          ALL CONTENT IS ENTIRELY FICTIONAL — STRATA IS A CONCEPT SHOWCASE BY NORVO
        </p>
      </div>
    </motion.div>
  );
}
