"use client";
import { motion } from "motion/react";

interface Props {
  children: React.ReactNode;
  className?: string;
  axis?: "x" | "y";
  direction?: 0 | 1;
}

export default function ScrollReveal3D({
  children,
  className = "",
  axis = "x",
  direction = 0,
}: Props) {
  // One-time reveal as the element enters view. Deliberately NOT scroll-linked:
  // a scroll-linked transform reverses (un-reveals) when you scroll back up, and
  // on iOS that backward scrub is batched/choppy and reads as a glitch. once:true
  // plays the reveal a single time and leaves it put.
  const hidden =
    axis === "y"
      ? { opacity: 0, rotateY: direction === 0 ? -20 : 20, scale: 0.9 }
      : { opacity: 0, rotateX: 22, y: 60, scale: 0.9 };
  const shown =
    axis === "y"
      ? { opacity: 1, rotateY: 0, scale: 1 }
      : { opacity: 1, rotateX: 0, y: 0, scale: 1 };

  return (
    <div style={{ perspective: "800px" }} className={className}>
      <motion.div
        initial={hidden}
        whileInView={shown}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
