"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { Scramble } from "@/components/TextAnimations";
import ScrollReveal3D from "@/components/ScrollReveal3D";
import { useDeviceTilt } from "@/components/DeviceTilt";
import { G, ease } from "../constants";
import type { Nav } from "../types";
import { VOYAGES } from "../data";
import VoyagePanel from "./VoyagePanel";

interface Props {
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollYSmooth: MotionValue<number>;
}

const AURORA_LETTERS = "AURORA".split("");

const HERO_MARKERS = [
  { label: "MISSION CLASS",  value: "CISLUNAR",          pos: { top: "22%", left: "4%" },    right: false },
  { label: "FLEET STATUS",   value: "3 VEHICLES",        pos: { top: "22%", right: "4%" },   right: true  },
  { label: "FIRST LAUNCH",   value: "2029 EST",          pos: { bottom: "28%", left: "4%" }, right: false },
  { label: "ALTITUDE RANGE", value: "180 – 384,400 km",  pos: { bottom: "28%", right: "4%" }, right: true  },
];

const MISSION_STATS = [
  { value: "3",    label: "Voyage Classes" },
  { value: "2029", label: "First Flight" },
  { value: "18M+", label: "km Travelled" },
  { value: "100%", label: "Bespoke" },
];

function StatBgNumber({
  value, index, progress,
}: { value: string; index: number; progress: MotionValue<number> }) {
  const isLeft = index % 2 === 0;
  const top    = 5 + index * 24;
  const y = useTransform(progress, [0, 1], [isLeft ? 40 : -40, isLeft ? -40 : 40]);
  return (
    <motion.div
      style={{
        position: "absolute",
        top: `${top}%`,
        left:  isLeft ? "-3%" : "auto",
        right: !isLeft ? "-3%" : "auto",
        y,
        fontFamily: "var(--font-display)",
        fontWeight: 100,
        fontSize: "clamp(6rem, 22vw, 26rem)",
        color: "rgba(68,102,255,0.04)",
        lineHeight: 1,
        pointerEvents: "none",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </motion.div>
  );
}

export default function HomeView({ navigate, containerRef, scrollYSmooth: _scrollYSmooth }: Props) {
  const heroRef  = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const reduce   = useReducedMotion();
  const tilt     = useDeviceTilt();
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    setIsMd(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  // Cursor / gyro for subtle hero atmosphere parallax
  const cursorX    = useMotionValue(0);
  const cursorY    = useMotionValue(0);
  const atmX = useSpring(cursorX, { stiffness: 40, damping: 20 });
  const atmY = useSpring(cursorY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      cursorX.set(((e.clientX / window.innerWidth)  - 0.5) * 28);
      cursorY.set(((e.clientY / window.innerHeight) - 0.5) * 18);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [cursorX, cursorY, reduce]);

  useEffect(() => {
    if (reduce || !tilt?.enabled) return;
    const ux = tilt.tiltX.on("change", v => cursorX.set(v * 28));
    const uy = tilt.tiltY.on("change", v => cursorY.set(-v * 18));
    return () => { ux(); uy(); };
  }, [tilt, reduce, cursorX, cursorY]);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef as React.RefObject<HTMLElement>,
    container: containerRef,
    offset: ["start start", "end start"],
  });

  const wordmarkY = useTransform(heroProgress, [0, 1], ["0%", "-18%"]);
  const heroOp    = useTransform(heroProgress, [0, 0.80], [1, 0]);
  const fogOp     = useTransform(heroProgress, [0, 0.5],  [0, 0.55]);

  const { scrollYProgress: statsProgress } = useScroll({
    target: statsRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.01, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease }}
      style={{ background: G.void }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        style={{ position: "relative", height: "100dvh", overflow: "hidden" }}
      >
        {/* Atmosphere parallax layer — sits above WebGL, moves with cursor */}
        <motion.div
          style={{ position: "absolute", inset: "-8%", x: atmX, y: atmY, pointerEvents: "none" }}
        >
          {/* Radial engine-glow from base */}
          <div style={{
            position: "absolute", bottom: "-20%", left: "50%",
            transform: "translateX(-50%)",
            width: "80%", height: "55%",
            background: "radial-gradient(ellipse at 50% 100%, rgba(68,102,255,0.10) 0%, transparent 70%)",
          }} />
          {/* Top vignette */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "35%",
            background: "linear-gradient(to bottom, rgba(2,2,9,0.72) 0%, transparent 100%)",
          }} />
          {/* Bottom gradient */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
            background: "linear-gradient(to top, rgba(2,2,9,0.95) 0%, rgba(2,2,9,0.3) 60%, transparent 100%)",
          }} />
        </motion.div>

        {/* Scroll-driven fog */}
        <motion.div style={{ position: "absolute", inset: 0, opacity: fogOp, background: "rgba(2,2,9,0.5)", pointerEvents: "none" }} />

        {/* Telemetry markers — desktop only */}
        {isMd && HERO_MARKERS.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 + i * 0.2, duration: 0.6 }}
            style={{ position: "absolute", ...m.pos, pointerEvents: "none" }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: m.right ? "flex-end" : "flex-start", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: m.right ? "row-reverse" : "row" }}>
                <div style={{ width: 20, height: 1, background: "rgba(100,110,255,0.45)" }} />
                <div style={{ width: 3, height: 3, borderRadius: "50%", background: G.glow }} />
              </div>
              <div style={{ color: "rgba(100,110,255,0.50)", fontSize: "0.42rem", letterSpacing: "0.28em", textAlign: m.right ? "right" : "left" }}>
                {m.label}
              </div>
              <div style={{ color: "rgba(224,224,244,0.65)", fontSize: "0.55rem", letterSpacing: "0.12em", textAlign: m.right ? "right" : "left" }}>
                {m.value}
              </div>
            </div>
          </motion.div>
        ))}

        {/* AURORA wordmark */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            y: wordmarkY, opacity: heroOp,
          }}
        >
          {/* Frosted backdrop */}
          <div style={{
            position: "absolute",
            width: "min(96vw, 1280px)",
            height: "clamp(9rem, 22vw, 24rem)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            background: "rgba(2,2,9,0.12)",
            pointerEvents: "none",
            borderRadius: 2,
          }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", perspective: 1100 }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 100,
              fontSize: "clamp(4rem, 14vw, 15rem)",
              letterSpacing: "0.38em",
              lineHeight: 0.9,
              margin: 0,
              color: G.white,
              display: "flex",
            }}>
              {AURORA_LETTERS.map((l, i) => (
                <motion.span
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: "0.4em", rotateX: -60 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.55 + i * 0.09, duration: 0.80, ease }}
                  style={{ display: "inline-block", transformStyle: "preserve-3d" }}
                >
                  {l}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25, duration: 0.7, ease }}
              style={{ marginTop: "1.5rem", color: "rgba(170,192,255,0.45)", fontSize: "0.60rem", letterSpacing: "0.34em", textAlign: "center" }}
            >
              <Scramble text="PRIVATE SPACE TRAVEL · BEYOND THE ATMOSPHERE" duration={1400} />
            </motion.p>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.65, ease }}
          style={{
            position: "absolute", bottom: "8%", left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap",
          }}
        >
          <NavBtn primary onClick={() => navigate({ view: "voyages" })}>EXPLORE VOYAGES</NavBtn>
          <NavBtn onClick={() => navigate({ view: "contact" })}>BOOK A CONSULTATION</NavBtn>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.7 }}
          style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 1, height: 24, background: "rgba(68,102,255,0.35)" }}
          />
        </motion.div>
      </section>

      {/* ── Voyage Panels ─────────────────────────────────────────────── */}
      <section>
        {/* Interstitial label */}
        <div style={{
          background: G.void, padding: "3rem 2rem",
          textAlign: "center",
          borderBottom: "1px solid rgba(68,102,255,0.08)",
        }}>
          <ScrollReveal3D axis="y">
            <div style={{ color: "rgba(100,110,255,0.65)", fontSize: "0.5rem", letterSpacing: "0.32em", marginBottom: "0.75rem" }}>
              AVAILABLE VOYAGES
            </div>
            <p style={{ color: "rgba(224,224,244,0.35)", fontSize: "0.75rem", maxWidth: 520, margin: "0 auto" }}>
              Three voyage classes — each designed for a different relationship with the void.
              From a 90-minute arc to the edge, to eight days beyond the far side of the Moon.
            </p>
          </ScrollReveal3D>
        </div>

        {VOYAGES.map((v, i) => (
          <div key={v.id}>
            <VoyagePanel
              voyage={v}
              index={i}
              total={VOYAGES.length}
              onClick={() => navigate({ view: "voyage", id: v.id })}
              containerRef={containerRef}
            />
            {i < VOYAGES.length - 1 && (
              <div style={{ background: G.void, padding: "3.5rem 2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(68,102,255,0.10)" }} />
                <span style={{ color: "rgba(100,110,255,0.28)", fontSize: "0.48rem", letterSpacing: "0.32em" }}>
                  {String(i + 2).padStart(2, "0")}
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(68,102,255,0.10)" }} />
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ── Mission Stats ─────────────────────────────────────────────── */}
      <section
        ref={statsRef}
        style={{ position: "relative", padding: "12rem 2rem", overflow: "hidden" }}
      >
        {MISSION_STATS.map((s, i) => (
          <StatBgNumber key={i} value={s.value} index={i} progress={statsProgress} />
        ))}

        <div style={{
          position: "relative",
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
          gap: "4rem 3rem", maxWidth: 600, margin: "0 auto",
        }}>
          {MISSION_STATS.map((s, i) => (
            <ScrollReveal3D key={i} axis="x" direction={i % 2 === 0 ? 0 : 1}>
              <div style={{ borderTop: "1px solid rgba(68,102,255,0.18)", paddingTop: "1.25rem" }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 100, fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  color: G.glowSoft, lineHeight: 1, marginBottom: "0.5rem",
                }}>
                  {s.value}
                </div>
                <div style={{ color: "rgba(224,224,244,0.38)", fontSize: "0.55rem", letterSpacing: "0.22em" }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            </ScrollReveal3D>
          ))}
        </div>
      </section>

      {/* ── CTA Band ─────────────────────────────────────────────────── */}
      <section style={{ padding: "8rem 2rem 10rem", textAlign: "center", borderTop: "1px solid rgba(224,224,244,0.06)" }}>
        <ScrollReveal3D axis="y">
          <div style={{ color: "rgba(100,110,255,0.60)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1.25rem" }}>
            <Scramble text="HUMAN SPACEFLIGHT · REIMAGINED" />
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100, fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: G.white, margin: "0 0 1rem",
          }}>
            The Void Awaits
          </h2>
          <p style={{ color: "rgba(224,224,244,0.35)", fontSize: "0.80rem", maxWidth: 460, margin: "0 auto 2.5rem" }}>
            Aurora offers three voyage classes — sub-orbital, orbital, and cislunar.
            Each a different way to leave the planet behind.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <NavBtn primary onClick={() => navigate({ view: "voyages" })}>VIEW ALL VOYAGES</NavBtn>
            <NavBtn onClick={() => navigate({ view: "fleet" })}>THE FLEET</NavBtn>
          </div>
        </ScrollReveal3D>
      </section>

      <div style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid rgba(224,224,244,0.05)" }}>
        <p style={{ color: "rgba(224,224,244,0.14)", fontSize: "0.5rem", letterSpacing: "0.16em" }}>
          AURORA IS A CONCEPT SHOWCASE — ALL VOYAGES ARE FICTIONAL · NORVO.DESIGN
        </p>
      </div>
    </motion.div>
  );
}

// ── NavBtn with ripple fill ───────────────────────────────────────────────────
function NavBtn({ children, onClick, primary = false }: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const lastTouchRef = useRef(0);

  const setOrigin = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${((clientX - r.left) / r.width)  * 100}%`);
    el.style.setProperty("--y", `${((clientY - r.top)  / r.height) * 100}%`);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onPointerEnter={e => {
        if (e.pointerType === "touch") return;
        if (Date.now() - lastTouchRef.current < 600) return;
        setOrigin(e.clientX, e.clientY); setHover(true);
      }}
      onPointerLeave={e => { if (e.pointerType !== "touch") setHover(false); }}
      onPointerCancel={() => setHover(false)}
      onPointerDown={e => {
        if (e.pointerType !== "touch") return;
        lastTouchRef.current = Date.now();
        setOrigin(e.clientX, e.clientY); setHover(true);
      }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      style={{
        position: "relative", overflow: "hidden",
        background: primary ? "rgba(68,102,255,0.08)" : "transparent",
        border: primary ? "1px solid rgba(68,102,255,0.55)" : "1px solid rgba(224,224,244,0.18)",
        padding: "0.65rem 2rem",
        fontSize: "0.5rem", letterSpacing: "0.3em",
        cursor: "pointer", fontFamily: "inherit",
        "--x": "50%", "--y": "50%",
      } as React.CSSProperties}
    >
      <span style={{
        position: "relative", zIndex: 0,
        color: primary ? "rgba(136,153,255,0.95)" : "rgba(224,224,244,0.50)",
      }}>
        {children}
      </span>

      <span
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: primary ? "rgba(68,102,255,0.18)" : "rgba(224,224,244,0.08)",
          clipPath: hover ? "circle(150% at var(--x) var(--y))" : "circle(0% at var(--x) var(--y))",
          transition: "clip-path 450ms ease-out",
        }}
      >
        <span style={{
          color: primary ? "rgba(136,153,255,1)" : "rgba(224,224,244,0.85)",
          fontSize: "0.5rem", letterSpacing: "0.3em",
        }}>
          {children}
        </span>
      </span>
    </motion.button>
  );
}
