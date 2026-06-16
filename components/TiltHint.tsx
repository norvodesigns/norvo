"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useDeviceTilt } from "./DeviceTilt";

/* A little "⟵ Tilt ⟶" nudge with arrows bouncing out to both sides. Shows ONLY
   when (1) the device is a touch/mobile device and (2) the gyro has been enabled
   — i.e. there's actually a tilt effect to discover. Drop it on sections with a
   prominent tilt (hero, capability spheres, CTA). */
export default function TiltHint({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const tilt = useDeviceTilt();
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    setCoarse(window.matchMedia?.("(pointer: coarse)").matches ?? false);
  }, []);

  if (!coarse || !tilt?.enabled) return null;

  const color = dark ? "text-white/55" : "text-black/45";
  const bounce = { duration: 1.3, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-none inline-flex select-none items-center justify-center gap-2.5 ${color} ${className}`}
    >
      <motion.span
        aria-hidden
        animate={{ x: [0, -5, 0] }}
        transition={bounce}
        className="text-base leading-none"
      >
        ⟵
      </motion.span>
      <span className="text-[0.6rem] font-medium uppercase tracking-[0.35em]">Tilt</span>
      <motion.span
        aria-hidden
        animate={{ x: [0, 5, 0] }}
        transition={bounce}
        className="text-base leading-none"
      >
        ⟶
      </motion.span>
    </motion.div>
  );
}
