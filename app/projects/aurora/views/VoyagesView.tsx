"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Scramble } from "@/components/TextAnimations";
import { G, ease } from "../constants";
import type { Nav } from "../types";
import { VOYAGES } from "../data";
import VoyagePanel from "./VoyagePanel";

interface Props {
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function VoyagesView({ navigate, containerRef }: Props) {
  const headerRef    = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: headerRef,
    container: containerRef,
    offset: ["start start", "end start"],
  });
  const headY  = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const headOp = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Track which voyage is in view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const panels = el.querySelectorAll("[data-voyage-index]");
    if (!panels.length) return;
    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.voyageIndex ?? 0));
          }
        }
      },
      { root: el, threshold: 0.35 }
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
      style={{ background: G.void }}
    >
      {/* Header */}
      <div ref={headerRef} style={{ position: "relative", height: "60dvh", overflow: "hidden" }}>
        <motion.div
          style={{
            position: "absolute", inset: "-15%", y: headY,
            background: "radial-gradient(ellipse 120% 80% at 50% 120%, rgba(68,102,255,0.18) 0%, transparent 65%)",
          }}
        />
        {/* Star field decoration */}
        <svg viewBox="0 0 400 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.45 }} aria-hidden>
          {Array.from({ length: 90 }, (_, i) => {
            const x = ((i * 137.508) % 400);
            const y = ((i * 97.3)   % 300);
            const r = (((i * 13) % 10) / 10) * 1.4 + 0.3;
            return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={(((i * 31) % 10) / 10) * 0.55 + 0.12} />;
          })}
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(2,2,9,0.55) 0%, rgba(2,2,9,0.90) 100%)",
        }} />

        <motion.div
          style={{
            position: "absolute", inset: 0, opacity: headOp,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "0 2rem 4rem",
          }}
        >
          <div style={{ color: "rgba(100,110,255,0.70)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1.25rem" }}>
            <Scramble text="VOYAGE CATALOG" />
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100,
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            color: G.white,
            letterSpacing: "0.06em",
            margin: 0,
          }}>
            Available Voyages
          </h1>
          <p style={{ color: "rgba(224,224,244,0.38)", fontSize: "0.75rem", marginTop: "1rem" }}>
            Three classes of departure — select the distance that calls to you
          </p>
        </motion.div>

        <div style={{
          position: "absolute", top: 32, right: 32, textAlign: "right", pointerEvents: "none",
        }}>
          <div style={{ color: "rgba(100,110,255,0.32)", fontSize: "0.5rem", letterSpacing: "0.22em" }}>
            CISLUNAR RANGE MAX
          </div>
          <div style={{ color: "rgba(100,110,255,0.22)", fontSize: "0.45rem", letterSpacing: "0.18em", marginTop: 4 }}>
            384,400 KM
          </div>
        </div>
      </div>

      {/* Floating counter */}
      <div style={{
        position: "sticky", top: 80, zIndex: 50,
        display: "flex", justifyContent: "flex-end",
        padding: "0 2rem",
        pointerEvents: "none",
      }}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            color: "rgba(100,110,255,0.65)",
            fontSize: "0.55rem",
            letterSpacing: "0.22em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {String(active + 1).padStart(2, "0")} / {String(VOYAGES.length).padStart(2, "0")}
        </motion.div>
      </div>

      {/* Voyage panels */}
      <div>
        {VOYAGES.map((v, i) => (
          <div key={v.id} data-voyage-index={i}>
            <VoyagePanel
              voyage={v}
              index={i}
              total={VOYAGES.length}
              onClick={() => navigate({ view: "voyage", id: v.id })}
              containerRef={containerRef}
            />
            {i < VOYAGES.length - 1 && (
              <div style={{
                display: "flex", alignItems: "center", gap: "1.5rem",
                padding: "3.5rem 2rem",
                background: G.void,
              }}>
                <div style={{ flex: 1, height: 1, background: "rgba(68,102,255,0.10)" }} />
                <span style={{ color: "rgba(100,110,255,0.28)", fontSize: "0.48rem", letterSpacing: "0.32em" }}>✦</span>
                <div style={{ flex: 1, height: 1, background: "rgba(68,102,255,0.10)" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        padding: "6rem 2rem",
        textAlign: "center",
        borderTop: "1px solid rgba(224,224,244,0.06)",
      }}>
        <p style={{ color: "rgba(224,224,244,0.18)", fontSize: "0.55rem", letterSpacing: "0.2em" }}>
          ALL CONTENT IS ENTIRELY FICTIONAL — AURORA IS A CONCEPT SHOWCASE BY NORVO
        </p>
      </div>
    </motion.div>
  );
}
