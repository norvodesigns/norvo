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
import { PROPERTIES } from "../data";
import AtmosphericPropertyPanel from "./shared/AtmosphericPropertyPanel";

interface Props {
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollYSmooth: MotionValue<number>;
}

const STRATA_LETTERS = "STRATA".split("");

const HOME_STATS = [
  { value: "IDX",  label: "MLS Integration" },
  { value: "4–6w", label: "Time to Launch" },
  { value: "100%", label: "Custom Design" },
  { value: "99+",  label: "Lighthouse Score" },
];

const HERO_MARKERS = [
  { label: "COORDINATES", value: PROPERTIES[0].coordinates, pos: { top: "22%", left: "4%" },  right: false },
  { label: "ELEVATION",   value: PROPERTIES[0].elevation,   pos: { top: "22%", right: "4%" }, right: true },
  { label: "DISTRICT",    value: PROPERTIES[0].district,    pos: { bottom: "28%", left: "4%" },  right: false },
  { label: "SITE AREA",   value: PROPERTIES[0].siteArea,    pos: { bottom: "28%", right: "4%" }, right: true },
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
        color: "rgba(196,154,46,0.05)",
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

  // Shared cursor / gyro motion values for hero image parallax
  const cursorX    = useMotionValue(0);
  const cursorY    = useMotionValue(0);
  const imgCursorX = useSpring(cursorX, { stiffness: 55, damping: 18 });
  const imgCursorY = useSpring(cursorY, { stiffness: 55, damping: 18 });

  // Mouse — desktop
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      cursorX.set(((e.clientX / window.innerWidth)  - 0.5) * 36);
      cursorY.set(((e.clientY / window.innerHeight) - 0.5) * 24);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [cursorX, cursorY, reduce]);

  // Gyro — mobile
  useEffect(() => {
    if (reduce || !tilt?.enabled) return;
    const ux = tilt.tiltX.on("change", v => cursorX.set(v * 36));
    const uy = tilt.tiltY.on("change", v => cursorY.set(-v * 24));
    return () => { ux(); uy(); };
  }, [tilt, reduce, cursorX, cursorY]);

  // Hero scroll parallax
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef as React.RefObject<HTMLElement>,
    container: containerRef,
    offset: ["start start", "end start"],
  });

  const imgY      = useTransform(heroProgress, [0, 1], ["0%", "30%"]);
  const wordmarkY = useTransform(heroProgress, [0, 1], ["0%", "-15%"]);
  const heroOp    = useTransform(heroProgress, [0, 0.85], [1, 0]);
  const fogOp     = useTransform(heroProgress, [0, 0.5],  [0, 0.5]);

  // Stats section scroll
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
      style={{ background: G.black }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        style={{ position: "relative", height: "100dvh", overflow: "hidden" }}
      >
        {/* Scroll parallax → cursor parallax */}
        <motion.div style={{ position: "absolute", inset: "-15%", y: imgY }}>
          <motion.div style={{ position: "absolute", inset: 0, x: imgCursorX, y: imgCursorY }}>
            <img
              src={PROPERTIES[0].heroImage}
              alt="Strata"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>
        </motion.div>

        {/* Dark overlays */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(13,13,11,0.65) 0%, transparent 30%, transparent 60%, rgba(13,13,11,0.92) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(13,13,11,0.4) 0%, transparent 40%, transparent 60%, rgba(13,13,11,0.4) 100%)",
        }} />
        <motion.div style={{ position: "absolute", inset: 0, opacity: fogOp, background: "rgba(13,13,11,0.5)" }} />

        {/* Coordinate markers — desktop only */}
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
                <div style={{ width: 20, height: 1, background: "rgba(196,154,46,0.55)" }} />
                <div style={{ width: 3, height: 3, borderRadius: "50%", background: G.gold }} />
              </div>
              <div style={{ color: "rgba(196,154,46,0.55)", fontSize: "0.42rem", letterSpacing: "0.28em", textAlign: m.right ? "right" : "left" }}>
                {m.label}
              </div>
              <div style={{ color: "rgba(250,250,249,0.65)", fontSize: "0.55rem", letterSpacing: "0.12em", textAlign: m.right ? "right" : "left" }}>
                {m.value}
              </div>
            </div>
          </motion.div>
        ))}

        {/* STRATA wordmark */}
        <motion.div
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            y: wordmarkY, opacity: heroOp,
          }}
        >
          {/* Frosted backdrop so the letters read clean over busy architecture */}
          <div style={{
            position: "absolute",
            width: "min(96vw, 1280px)",
            height: "clamp(9rem, 22vw, 24rem)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            background: "rgba(13,13,11,0.18)",
            pointerEvents: "none",
            borderRadius: 2,
          }} />

          {/* Text above the blur */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", perspective: 900 }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 100,
              fontSize: "clamp(4rem, 14vw, 15rem)",
              letterSpacing: "0.32em",
              lineHeight: 0.9,
              margin: 0,
              color: G.white,
              display: "flex",
            }}>
              {STRATA_LETTERS.map((l, i) => (
                <motion.span
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: "0.4em", rotateX: -60 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.75, ease }}
                  style={{ display: "inline-block", transformStyle: "preserve-3d" }}
                >
                  {l}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.7, ease }}
              style={{ marginTop: "1.5rem", color: "rgba(250,250,249,0.5)", fontSize: "0.65rem", letterSpacing: "0.32em", textAlign: "center" }}
            >
              <Scramble text="REAL ESTATE WEBSITES · BUILT BY NORVO" duration={1200} />
            </motion.p>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.65, ease }}
          style={{
            position: "absolute", bottom: "8%", left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap",
          }}
        >
          <NavBtn primary onClick={() => navigate({ view: "properties" })}>SEE EXAMPLE LISTINGS</NavBtn>
          <NavBtn onClick={() => navigate({ view: "contact" })}>START YOUR PROJECT</NavBtn>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.7 }}
          style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 1, height: 24, background: "rgba(196,154,46,0.35)" }}
          />
        </motion.div>
      </section>

      {/* ── Property Panels ──────────────────────────────────────────── */}
      <section>
        {/* IDX callout */}
        <div style={{
          background: G.black, padding: "3rem 2rem",
          textAlign: "center",
          borderBottom: "1px solid rgba(196,154,46,0.1)",
        }}>
          <ScrollReveal3D axis="y">
            <div style={{ color: "rgba(196,154,46,0.7)", fontSize: "0.5rem", letterSpacing: "0.32em", marginBottom: "0.75rem" }}>
              IDX / MLS INTEGRATION
            </div>
            <p style={{ color: "rgba(250,250,249,0.45)", fontSize: "0.75rem", maxWidth: 560, margin: "0 auto" }}>
              The listings below are example data. On your real site, these panels
              pull live from your MLS feed via IDX integration — included at no extra setup cost.
            </p>
          </ScrollReveal3D>
        </div>

        {PROPERTIES.map((p, i) => (
          <div key={p.id}>
            <AtmosphericPropertyPanel
              property={p}
              index={i}
              onClick={() => navigate({ view: "property", id: p.id })}
              containerRef={containerRef}
            />
            {i < PROPERTIES.length - 1 && (
              <div style={{ background: G.black, padding: "3.5rem 2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(196,154,46,0.14)" }} />
                <span style={{ color: "rgba(196,154,46,0.3)", fontSize: "0.48rem", letterSpacing: "0.32em" }}>
                  {String(i + 2).padStart(2, "0")}
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(196,154,46,0.14)" }} />
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ── Environmental Stats ──────────────────────────────────────── */}
      <section
        ref={statsRef}
        style={{ position: "relative", padding: "12rem 2rem", overflow: "hidden" }}
      >
        {HOME_STATS.map((s, i) => (
          <StatBgNumber key={i} value={s.value} index={i} progress={statsProgress} />
        ))}

        <div style={{
          position: "relative",
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
          gap: "4rem 3rem", maxWidth: 600, margin: "0 auto",
        }}>
          {HOME_STATS.map((s, i) => (
            <ScrollReveal3D key={i} axis="x" direction={i % 2 === 0 ? 0 : 1}>
              <div style={{ borderTop: "1px solid rgba(196,154,46,0.22)", paddingTop: "1.25rem" }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 100, fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  color: G.gold, lineHeight: 1, marginBottom: "0.5rem",
                }}>
                  {s.value}
                </div>
                <div style={{ color: "rgba(250,250,249,0.45)", fontSize: "0.55rem", letterSpacing: "0.22em" }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            </ScrollReveal3D>
          ))}
        </div>
      </section>

      {/* ── CTA Band ─────────────────────────────────────────────────── */}
      <section style={{ padding: "8rem 2rem 10rem", textAlign: "center", borderTop: "1px solid rgba(224,223,219,0.08)" }}>
        <ScrollReveal3D axis="y">
          <div style={{ color: "rgba(196,154,46,0.65)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1.25rem" }}>
            <Scramble text="BUILT TO PERFORM" />
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100, fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: G.white, margin: "0 0 1rem",
          }}>
            Your Real Estate Website
          </h2>
          <p style={{ color: "rgba(250,250,249,0.4)", fontSize: "0.8rem", maxWidth: 460, margin: "0 auto 2.5rem" }}>
            Custom design, IDX integration, lead capture — delivered in 4–6 weeks.
            No templates. No shared hosting.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <NavBtn primary onClick={() => navigate({ view: "properties" })}>EXAMPLE LISTINGS</NavBtn>
            <NavBtn onClick={() => navigate({ view: "contact" })}>START A PROJECT</NavBtn>
          </div>
        </ScrollReveal3D>
      </section>

      <div style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid rgba(224,223,219,0.06)" }}>
        <p style={{ color: "rgba(250,250,249,0.18)", fontSize: "0.5rem", letterSpacing: "0.16em" }}>
          STRATA IS A CONCEPT SHOWCASE — ALL LISTINGS ARE FICTIONAL · NORVO.DESIGN
        </p>
      </div>
    </motion.div>
  );
}

// ── CTA button with ripple fill ───────────────────────────────────────────────
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
        background: primary ? "rgba(196,154,46,0.08)" : "transparent",
        border: primary ? "1px solid rgba(196,154,46,0.55)" : "1px solid rgba(250,250,249,0.2)",
        padding: "0.65rem 2rem",
        fontSize: "0.5rem", letterSpacing: "0.3em",
        cursor: "pointer", fontFamily: "inherit",
        "--x": "50%", "--y": "50%",
      } as React.CSSProperties}
    >
      <span style={{
        position: "relative", zIndex: 0,
        color: primary ? "rgba(196,154,46,0.9)" : "rgba(250,250,249,0.55)",
      }}>
        {children}
      </span>

      {/* Ripple fill */}
      <span
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: primary ? "rgba(196,154,46,0.2)" : "rgba(250,250,249,0.1)",
          clipPath: hover ? "circle(150% at var(--x) var(--y))" : "circle(0% at var(--x) var(--y))",
          transition: "clip-path 450ms ease-out",
        }}
      >
        <span style={{
          color: primary ? "rgba(196,154,46,1)" : "rgba(250,250,249,0.9)",
          fontSize: "0.5rem", letterSpacing: "0.3em",
        }}>
          {children}
        </span>
      </span>
    </motion.button>
  );
}
