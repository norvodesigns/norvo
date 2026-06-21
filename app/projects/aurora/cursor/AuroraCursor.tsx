"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { G } from "../constants";

export default function AuroraCursor() {
  const [state, setState] = useState<"init" | "hidden" | "default" | "panel">("init");
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const rx = useSpring(mouseX, { stiffness: 140, damping: 20 });
  const ry = useSpring(mouseY, { stiffness: 140, damping: 20 });
  const isCoarse = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      isCoarse.current = true;
      setState("hidden");
      return;
    }
    setState("default");

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      const t = e.target as HTMLElement;
      setState(t.closest("[data-panel]") ? "panel" : "default");
    };
    const onLeave  = () => setState("hidden");
    const onEnter  = () => setState("default");

    window.addEventListener("mousemove",   onMove,  { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });
    document.addEventListener("mouseenter", onEnter, { passive: true });
    return () => {
      window.removeEventListener("mousemove",   onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [mouseX, mouseY]);

  if (state === "init" || state === "hidden" || isCoarse.current) return null;

  const panel = state === "panel";

  return (
    <>
      {/* Outer reticle — lags */}
      <motion.div
        className="pointer-events-none fixed z-[700]"
        style={{
          x: rx, y: ry,
          translateX: "-50%", translateY: "-50%",
          width: panel ? 44 : 22,
          height: panel ? 44 : 22,
        }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {panel ? (
          // Crosshair reticle for voyage panels
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <span style={{
              position: "absolute", top: "50%", left: 0, right: 0, height: 1,
              background: `rgba(168, 168, 196, 0.55)`, transform: "translateY(-50%)",
            }} />
            <span style={{
              position: "absolute", left: "50%", top: 0, bottom: 0, width: 1,
              background: `rgba(168, 168, 196, 0.55)`, transform: "translateX(-50%)",
            }} />
            <span style={{
              position: "absolute", inset: "30%",
              borderRadius: "50%",
              border: `1px solid rgba(168,168,196,0.35)`,
            }} />
          </div>
        ) : (
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            border: `1px solid rgba(100, 110, 255, 0.55)`,
          }} />
        )}
      </motion.div>

      {/* Inner dot — instant */}
      <motion.div
        className="pointer-events-none fixed z-[701]"
        style={{
          x: mouseX, y: mouseY,
          translateX: "-50%", translateY: "-50%",
          width: 4, height: 4, borderRadius: "50%",
          backgroundColor: G.glow,
        }}
        animate={{ opacity: panel ? 0 : 1, scale: panel ? 0 : 1 }}
        transition={{ duration: 0.12 }}
      />
    </>
  );
}
