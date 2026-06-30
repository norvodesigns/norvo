"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import Button from "@/components/Button";

const COLORS = ["#6D5DFB", "#D8B46A", "#F4F5F7", "#A89DFF", "#f0c060", "#4433CC", "#e8b84b"];

function spawnBurst(canvas: HTMLCanvasElement) {
  // getContext("2d") only returns null on OffscreenCanvas; safe to assert here
  const ctx = canvas.getContext("2d")!;

  const W = (canvas.width = canvas.offsetWidth);
  const H = (canvas.height = canvas.offsetHeight);
  const cx = W / 2;
  const cy = H * 0.26;

  const particles = Array.from({ length: 90 }, () => ({
    x: cx + (Math.random() - 0.5) * 70,
    y: cy,
    vx: (Math.random() - 0.5) * 13,
    vy: -Math.random() * 16 - 3,
    size: Math.random() * 8 + 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.35,
    opacity: 1,
    rect: Math.random() > 0.4,
  }));

  let raf: number;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of particles) {
      p.vy += 0.4;
      p.vx *= 0.98;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity = Math.max(0, p.opacity - 0.012);
      if (p.opacity <= 0) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.rect) {
        ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (alive) raf = requestAnimationFrame(draw);
  }

  draw();
  return () => cancelAnimationFrame(raf);
}

export default function SubmitSuccess({
  heading,
  body,
}: {
  heading: string;
  body: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRef = useRef<() => void>(() => {});

  const burst = useCallback(() => {
    if (reduce) return;
    stopRef.current();
    if (canvasRef.current) stopRef.current = spawnBurst(canvasRef.current);
  }, [reduce]);

  useEffect(() => {
    burst();
    return () => stopRef.current();
  }, [burst]);

  const spring = { type: "spring" as const, stiffness: 300, damping: 20 };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl px-8 py-14 text-center"
      style={{ border: "1px solid rgba(244,245,247,0.08)", background: "rgba(244,245,247,0.02)" }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Checkmark — tap/click to re-burst */}
      <motion.button
        type="button"
        onClick={burst}
        initial={reduce ? false : { scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, ...spring }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-lg"
        style={{ background: "linear-gradient(120deg, #6D5DFB, #D8B46A)" }}
        aria-label="Celebrate again"
      >
        ✓
        {!reduce && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: "2px solid #6D5DFB" }}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ delay: 0.5, duration: 1.3, ease: "easeOut", repeat: Infinity, repeatDelay: 2.2 }}
            />
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: "2px solid #D8B46A" }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.0, opacity: 0 }}
              transition={{ delay: 0.8, duration: 1.3, ease: "easeOut", repeat: Infinity, repeatDelay: 2.2 }}
            />
          </>
        )}
      </motion.button>

      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="font-display text-2xl font-light"
      >
        {heading}
      </motion.h2>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mx-auto mt-3 max-w-md text-[var(--archive-white)]/50"
      >
        {body}
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8"
      >
        <Button href="/" variant="secondary" size="sm" noTilt>
          ← Back to home
        </Button>
      </motion.div>

      {!reduce && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-5 text-xs text-[var(--archive-white)]/20"
        >
          Tap ✓ to celebrate
        </motion.p>
      )}
    </motion.div>
  );
}
