"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

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
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.1"],
  });

  // No spring — direct mapping is smooth without glitch/overshoot
  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [direction === 0 ? -20 : 20, 0]);
  const y       = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const scale   = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  const style = axis === "y"
    ? { rotateY, opacity, scale }
    : { rotateX, y, opacity, scale };

  return (
    <div ref={ref} style={{ perspective: "800px" }} className={className}>
      <motion.div style={style}>{children}</motion.div>
    </div>
  );
}