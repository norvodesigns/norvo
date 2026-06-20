"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { G } from "../constants";

export default function StrataCursor() {
  const [state, setState] = useState<"init" | "hidden" | "default" | "panel">("init");
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Outer reticle springs slowly behind cursor
  const rx = useSpring(mouseX, { stiffness: 150, damping: 22 });
  const ry = useSpring(mouseY, { stiffness: 150, damping: 22 });

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
      const target = e.target as HTMLElement;
      const onPanel = !!target.closest("[data-panel]");
      const onLink  = !!target.closest("a, button, [role=button]");
      setState(onPanel ? "panel" : onLink ? "default" : "default");
    };
    const onLeave  = () => setState("hidden");
    const onEnter  = () => setState("default");

    window.addEventListener("mousemove",  onMove,  { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });
    document.addEventListener("mouseenter", onEnter, { passive: true });
    return () => {
      window.removeEventListener("mousemove",    onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [mouseX, mouseY]);

  if (state === "init" || state === "hidden") return null;
  if (isCoarse.current) return null;

  const panel = state === "panel";

  return (
    <>
      {/* Outer reticle — lags behind */}
      <motion.div
        className="pointer-events-none fixed z-[600]"
        style={{
          x: rx, y: ry,
          translateX: "-50%", translateY: "-50%",
          width: panel ? 40 : 20,
          height: panel ? 40 : 20,
        }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {panel ? (
          // Crosshair for property panels
          <div className="relative h-full w-full">
            <span style={{
              position: "absolute", top: "50%", left: 0, right: 0,
              height: 1, background: `rgba(196,154,46,0.65)`,
              transform: "translateY(-50%)",
            }} />
            <span style={{
              position: "absolute", left: "50%", top: 0, bottom: 0,
              width: 1, background: `rgba(196,154,46,0.65)`,
              transform: "translateX(-50%)",
            }} />
          </div>
        ) : (
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            border: `1px solid rgba(196,154,46,0.6)`,
          }} />
        )}
      </motion.div>

      {/* Inner dot — instant */}
      <motion.div
        className="pointer-events-none fixed z-[601]"
        style={{
          x: mouseX, y: mouseY,
          translateX: "-50%", translateY: "-50%",
          width: 4, height: 4, borderRadius: "50%",
          backgroundColor: G.gold,
        }}
        animate={{ opacity: panel ? 0 : 1, scale: panel ? 0 : 1 }}
        transition={{ duration: 0.12 }}
      />
    </>
  );
}
