"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── Reveal3D — smooth 3D entrance for emphasized text ─── */
export function Reveal3D({
  text,
  variant = "letters",
  className = "",
  startDelay = 0,
  gradient = true,
}: {
  text: string;
  variant?: "letters" | "words" | "depth";
  className?: string;
  startDelay?: number;
  gradient?: boolean;
}) {
  const reduce = useReducedMotion();

  // gradient applied PER SPAN so background-clip:text survives inline-block
  const grad: React.CSSProperties = gradient
    ? {
        backgroundImage: "linear-gradient(120deg,#0D7A7A,#D9A441)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }
    : {};

  if (reduce) return <span className={className} style={grad}>{text}</span>;

  if (variant === "words") {
    const words = text.split(" ");
    return (
      <span className={`inline-block ${className}`} style={{ perspective: 800, whiteSpace: "nowrap" }}>
        {words.map((w, i) => (
          <span key={i} className="inline-block">
            <motion.span
              className="inline-block"
              style={{ ...grad, transformOrigin: "bottom center" }}
              initial={{ rotateX: -90, opacity: 0, y: "0.35em" }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              transition={{ delay: startDelay + i * 0.14, duration: 0.7, ease }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </span>
    );
  }

  if (variant === "depth") {
    const words = text.split(" ");
    return (
      <span className={`inline-block ${className}`} style={{ perspective: 700, whiteSpace: "nowrap" }}>
        {words.map((w, i) => (
          <span key={i} className="inline-block" style={{ perspective: 700 }}>
            <motion.span
              className="inline-block"
              style={{ ...grad, transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, z: -240 }}
              animate={{ opacity: 1, z: 0 }}
              transition={{ delay: startDelay + i * 0.16, duration: 0.8, ease }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </span>
    );
  }

  // default: letters — per-letter gradient, no blur (was the glitch)
  const chars = Array.from(text);
  return (
    <span className={`inline-block ${className}`} style={{ perspective: 700, whiteSpace: "nowrap" }}>
      {chars.map((c, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ ...grad, transformOrigin: "bottom center", whiteSpace: "pre" }}
          initial={{ opacity: 0, y: "0.5em", rotateX: -70 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: startDelay + i * 0.045, duration: 0.55, ease }}
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </span>
  );
}

/* ─── Typewriter ─── */
export function Typewriter({
  text, className = "", speed = 70, startDelay = 150,
}: { text: string; className?: string; speed?: number; startDelay?: number; }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!inView) return;
    if (prefersReduced()) { setCount(text.length); setDone(true); return; }
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      interval = setInterval(() => {
        i++; setCount(i);
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
    }, startDelay);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [inView, text, speed, startDelay]);
  return (
    <span ref={ref} className={className}>
      {text.slice(0, count)}
      {!done && (
        <motion.span aria-hidden animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          className="ml-0.5 inline-block font-light">|</motion.span>
      )}
    </span>
  );
}

/* ─── WordCycle ─── */
export function WordCycle({
  words, className = "", interval = 2200,
}: { words: string[]; className?: string; interval?: number; }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReduced()) return;
    const id = setInterval(() => setI((p) => (p + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
  return (
    <span className="relative inline-block" style={{ perspective: 600 }}>
      <span className="invisible" aria-hidden>{longest}</span>
      <span className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span key={words[i]}
            initial={{ rotateX: -90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }} transition={{ duration: 0.45, ease }}
            className={`inline-block ${className}`} style={{ transformOrigin: "center" }}>
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

/* ─── Scramble ─── */
export function Scramble({
  text, className = "", duration = 900,
}: { text: string; className?: string; duration?: number; }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!inView) return;
    if (prefersReduced()) { setDisplay(text); return; }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&*<>/";
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pr = Math.min((now - start) / duration, 1);
      const reveal = Math.floor(pr * text.length);
      let out = "";
      for (let j = 0; j < text.length; j++) {
        if (text[j] === " ") { out += " "; continue; }
        out += j < reveal ? text[j] : chars[Math.floor(Math.random() * chars.length)];
      }
      setDisplay(out);
      if (pr < 1) raf = requestAnimationFrame(tick); else setDisplay(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, text, duration]);
  return <span ref={ref} className={className}>{display}</span>;
}