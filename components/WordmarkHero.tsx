"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function WordmarkHero() {
  const reduce = useReducedMotion();

  return (
    // container-type so cqw font-size scales with this box, not the viewport
    <div
      className="mx-auto w-full max-w-xl"
      style={{ perspective: 1100, containerType: "inline-size" }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, rotateX: 32, y: 44, scale: 0.92 }}
        animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease }}
        style={{ transformOrigin: "center bottom" }}
      >
        {/* aspect-ratio box sized to the real wordmark bbox (662 × 237) */}
        <div
          role="img"
          aria-label="Norvo"
          style={{ position: "relative", width: "100%", aspectRatio: "662 / 237" }}
        >
          {/* N — monogram PNG. Negative offsets crop the PNG's padding so the
              visible arch lands at x[0–198] y[0–237] in the container.
              Measured: PNG has 21.4% L/R and 15.6% T/B whitespace; arch fills
              57.1% width / 69.2% height of the PNG (square). */}
          <motion.img
            src="/norvo monogram.png"
            alt=""
            aria-hidden
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            style={{
              position: "absolute",
              left: "-11.2%",
              top: "-22.8%",
              width: "52.4%",
              height: "auto",
            }}
          />

          {/* orvo — Sora 300 text: clean, thin, zero Chrome compositing issues.
              Positioned by measurement: left 33.8%, baseline at 77.2% from top.
              cqw = % of this container's width → scales with the box. */}
          <div
            style={{
              position: "absolute",
              left: "33.8%",
              bottom: "8%",
              fontFamily: "var(--font-sora)",
              fontWeight: 100,
              fontSize: "27.6cqw",
              lineHeight: 1,
              whiteSpace: "nowrap",
              color: "var(--foreground)",
              letterSpacing: "-0.01em",
            }}
          >
            {"orvo".split("").map((ch, i) => (
              <motion.span
                key={i}
                style={{ display: "inline-block" }}
                initial={reduce ? false : { opacity: 0, y: "0.35em" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease, delay: 0.7 + i * 0.15 }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}