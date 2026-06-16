"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  useInView,
} from "motion/react";
import { useDeviceTilt } from "./DeviceTilt";

/* ──────────────────────────────────────────────────────────────────────────
   Tilt3D — a reusable 3D tilt wrapper.

   • Desktop: tilts toward the cursor as it moves over the element (interactive
     hover), lifts on the Z axis, and sweeps a soft specular glare.
   • Mobile: tilts with the device gyroscope (shared DeviceTilt signal), so the
     whole page reads like a physical surface you steer by tilting the phone.
   • Honors prefers-reduced-motion (renders a plain, static wrapper).
   ──────────────────────────────────────────────────────────────────────── */

type Tilt3DProps = {
  children: React.ReactNode;
  className?: string;
  /** max tilt in degrees */
  max?: number;
  /** hover scale */
  scale?: number;
  /** Z lift in px on hover (desktop) */
  lift?: number;
  /** show the moving specular glare */
  glare?: boolean;
  /** glare strength 0..1 */
  glareOpacity?: number;
  perspective?: number;
  /** how much the gyro contributes (1 = same as a full cursor sweep) */
  gyroStrength?: number;
  /** drive the tilt from the gyroscope on mobile (default true) */
  gyro?: boolean;
  style?: React.CSSProperties;
};

// Critically damped — no overshoot. When iOS resumes the sensor after a scroll,
// the tilt should glide to position, not spring past it and wobble back.
const SPRING = { stiffness: 150, damping: 19, mass: 0.6 };

export default function Tilt3D({
  children,
  className = "",
  max = 12,
  scale = 1.03,
  lift = 16,
  glare = true,
  glareOpacity = 0.22,
  perspective = 900,
  gyroStrength = 1,
  gyro = true,
  style,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const tilt = useDeviceTilt();
  const inView = useInView(ref);
  const [hovering, setHovering] = useState(false);

  // −0.5 … +0.5 normalised position (cursor over element, or gyro)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateX = useTransform(sy, (v) => -v * 2 * max);
  const rotateY = useTransform(sx, (v) => v * 2 * max);

  // glare follows the light direction (opposite the tilt)
  const glareX = useTransform(sx, (v) => `${50 - v * 120}%`);
  const glareY = useTransform(sy, (v) => `${50 - v * 120}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,${glareOpacity}), transparent 60%)`;

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onEnter = () => setHovering(true);
  const onLeave = () => {
    setHovering(false);
    px.set(0);
    py.set(0);
  };

  // Mobile: drive tilt from the gyroscope (−1…+1 → −0.5…+0.5 to match cursor).
  // Gated on visibility so only on-screen wrappers run springs as you tilt.
  useEffect(() => {
    if (!gyro || reduce || !tilt?.enabled || !inView) return;
    const apply = () => {
      px.set(tilt.tiltX.get() * 0.5 * gyroStrength);
      py.set(tilt.tiltY.get() * 0.5 * gyroStrength);
    };
    apply();
    const ux = tilt.tiltX.on("change", apply);
    const uy = tilt.tiltY.on("change", apply);
    return () => {
      ux();
      uy();
      px.set(0);
      py.set(0);
    };
  }, [tilt, reduce, inView, gyro, px, py, gyroStrength]);

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: perspective,
        transformStyle: "preserve-3d",
        position: "relative",
        ...style,
      }}
      animate={{ scale: hovering ? scale : 1, z: hovering ? lift : 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={className}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBg, opacity: hovering ? 1 : 0, transition: "opacity 0.3s" }}
        />
      )}
    </motion.div>
  );
}
