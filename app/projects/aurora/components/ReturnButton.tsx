"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export default function ReturnButton({ onClick }: { onClick: () => void }) {
  const ref  = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);

  const px  = useMotionValue(0);
  const py  = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 240, damping: 22 });
  const spy = useSpring(py, { stiffness: 240, damping: 22 });
  const rx  = useTransform(spy, v => -v * 18);
  const ry  = useTransform(spx, v =>  v * 18);

  const originRef = useRef({ x: "50%", y: "50%" });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    originRef.current = {
      x: `${((e.clientX - r.left) / r.width) * 100}%`,
      y: `${((e.clientY - r.top) / r.height) * 100}%`,
    };
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top)  / r.height - 0.5);
  };
  const onLeave = () => { setHover(false); px.set(0); py.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "fixed", top: 20, right: 20, zIndex: 600 }}
    >
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileTap={{ scale: 0.94 }}
        style={{
          rotateX: rx,
          rotateY: ry,
          transformPerspective: 500,
          position: "relative",
          padding: "0.6rem 1.4rem",
          background: hover
            ? "rgba(23, 34, 53, 0.85)"
            : "rgba(17, 24, 39, 0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: hover
            ? "1px solid rgba(166,200,255,0.35)"
            : "1px solid rgba(166,200,255,0.12)",
          borderRadius: 8,
          cursor: "pointer",
          overflow: "hidden",
          transition: "background 0.25s, border-color 0.25s",
          boxShadow: hover
            ? "0 0 18px rgba(90,108,255,0.15), 0 8px 32px rgba(0,0,0,0.55)"
            : "0 4px 24px rgba(0,0,0,0.45)",
        } as React.CSSProperties}
      >
        {/* Escape particles (show on hover) */}
        {hover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ x: "50%", y: "50%", opacity: 1, scale: 1 }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 140}%`,
                  y: `${50 + (Math.random() - 0.5) * 140}%`,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.7 + i * 0.08, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  width: 2, height: 2,
                  background: "rgba(166,200,255,0.8)",
                  borderRadius: "50%",
                  top: 0, left: 0,
                }}
              />
            ))}
          </motion.div>
        )}

        <span style={{
          position: "relative", zIndex: 1,
          fontFamily: "monospace",
          fontSize: "0.55rem",
          letterSpacing: "0.22em",
          color: hover ? "#E8EDF5" : "rgba(169,179,196,0.85)",
          whiteSpace: "nowrap",
          transition: "color 0.2s",
        }}>
          RETURN TO REALITY
        </span>
      </motion.button>
    </motion.div>
  );
}
