"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion, AnimatePresence, useTransform,
  useMotionValue, useSpring, useReducedMotion, useInView,
} from "motion/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useDeviceTilt } from "@/components/DeviceTilt";

import { G, ease } from "./constants";
import type { Route } from "./types";
import { useAuroraScroll } from "./hooks/useAuroraScroll";
import AuroraCursor from "./cursor/AuroraCursor";
import HomeView from "./views/HomeView";
import VoyagesView from "./views/VoyagesView";
import VoyageDetailView from "./views/VoyageDetailView";
import FleetView from "./views/FleetView";
import ContactView from "./views/ContactView";

const AuroraBackground = dynamic(
  () => import("./webgl/AuroraBackground"),
  { ssr: false }
);

const NAV_LINKS: { label: string; route: Route }[] = [
  { label: "Voyages", route: { view: "voyages" } },
  { label: "Fleet",   route: { view: "fleet" } },
  { label: "Contact", route: { view: "contact" } },
];

function routeKey(r: Route): string {
  return r.view === "voyage" ? `voyage-${r.id}` : r.view;
}

export default function AuroraPage() {
  const [route, setRoute] = useState<Route>({ view: "home" });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYSmooth } = useAuroraScroll(containerRef);

  const lookRef      = useRef({ x: 0, y: 0 });
  const scrollRafRef = useRef(0);

  // Bridge scrollY to scrollRafRef for the WebGL shader
  useEffect(() => {
    return scrollY.on("change", v => {
      const el = containerRef.current;
      const max = el ? Math.max(el.scrollHeight - el.clientHeight, 1) : 1;
      scrollRafRef.current = v / max;
    });
  }, [scrollY]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lookRef.current.x = (e.clientX / window.innerWidth)  * 2 - 1;
      lookRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const tilt = useDeviceTilt();
  useEffect(() => {
    if (!tilt?.enabled) return;
    const ux = tilt.tiltX.on("change", v => { lookRef.current.x =  v; });
    const uy = tilt.tiltY.on("change", v => { lookRef.current.y = -v; });
    return () => { ux(); uy(); };
  }, [tilt]);

  const navigate = (r: Route) => {
    containerRef.current?.scrollTo({ top: 0, behavior: "instant" });
    setRoute(r);
  };

  // Nav becomes frosted when scrolled
  const navBg   = useTransform(scrollY, [0, 60], ["rgba(2,2,9,0)",   "rgba(6,6,15,0.88)"]);
  const navBlur = useTransform(scrollY, [0, 60], ["blur(0px)", "blur(14px)"]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.style.cssText += ";scrollbar-width:none;-ms-overflow-style:none;";
  }, []);

  return (
    <div style={{
      position: "fixed", inset: "6px", zIndex: 500,
      background: G.void,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.80)",
    }}>
      {/* WebGL deep-space background — persists across route changes */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <AuroraBackground lookRef={lookRef} scrollRafRef={scrollRafRef} />
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        style={{
          position: "relative", zIndex: 10,
          height: "100%", overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* ── Navigation ────────────────────────────────────────── */}
        <motion.nav
          style={{
            position: "sticky", top: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 1.5rem",
            height: 64,
            background: navBg,
            backdropFilter: navBlur,
            WebkitBackdropFilter: navBlur,
            borderBottom: "1px solid rgba(68,102,255,0.07)",
          }}
        >
          {/* AURORA wordmark */}
          <button
            onClick={() => navigate({ view: "home" })}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 200,
              fontSize: "1.1rem",
              letterSpacing: "0.30em",
              color: G.white,
            }}
          >
            AURORA
          </button>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {NAV_LINKS.map(({ label, route: r }) => {
              const active = route.view === r.view;
              return (
                <button
                  key={label}
                  onClick={() => navigate(r)}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    fontSize: "0.55rem",
                    letterSpacing: "0.22em",
                    color: active ? G.glowSoft : "rgba(224,224,244,0.42)",
                    transition: "color 0.25s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "rgba(224,224,244,0.80)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "rgba(224,224,244,0.42)"; }}
                >
                  {label.toUpperCase()}
                </button>
              );
            })}
          </div>
        </motion.nav>

        {/* ── View router ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <div key={routeKey(route)}>
            {route.view === "home" && (
              <HomeView
                navigate={navigate}
                containerRef={containerRef}
                scrollYSmooth={scrollYSmooth}
              />
            )}
            {route.view === "voyages" && (
              <VoyagesView
                navigate={navigate}
                containerRef={containerRef}
              />
            )}
            {route.view === "voyage" && (
              <VoyageDetailView
                id={route.id}
                navigate={navigate}
                containerRef={containerRef}
              />
            )}
            {route.view === "fleet" && (
              <FleetView navigate={navigate} />
            )}
            {route.view === "contact" && (
              <ContactView navigate={navigate} />
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* Custom cursor — desktop only */}
      <AuroraCursor />

      {/* Exit button */}
      <ExitButton />
    </div>
  );
}

// ── Exit button — white pill, same DNA as Strata ──────────────────────────────
function ExitButton() {
  const router       = useRouter();
  const ref          = useRef<HTMLAnchorElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const reduce       = useReducedMotion();
  const tilt         = useDeviceTilt();
  const inView       = useInView(wrapRef);
  const [hover, setHover]       = useState(false);
  const [isDesktop, setDesktop] = useState(false);
  const lastTouchRef = useRef(0);

  useEffect(() => {
    setDesktop(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  const px  = useMotionValue(0);
  const py  = useMotionValue(0);
  const tsx = useSpring(px, { stiffness: 230, damping: 22, mass: 0.5 });
  const tsy = useSpring(py, { stiffness: 230, damping: 22, mass: 0.5 });
  const rotateX = useTransform(tsy, v => -v * 22);
  const rotateY = useTransform(tsx, v =>  v * 22);

  useEffect(() => {
    if (!tilt?.enabled || !inView) return;
    const apply = () => { px.set(tilt.tiltX.get() * 0.5); py.set(tilt.tiltY.get() * 0.5); };
    apply();
    const ux = tilt.tiltX.on("change", apply);
    const uy = tilt.tiltY.on("change", apply);
    return () => { ux(); uy(); px.set(0); py.set(0); };
  }, [tilt, inView, px, py]);

  const setOrigin = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${((clientX - r.left)  / r.width)  * 100}%`);
    el.style.setProperty("--y", `${((clientY - r.top)   / r.height) * 100}%`);
  };

  const setTiltFromPointer = (clientX: number, clientY: number) => {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((clientX - r.left) / r.width  - 0.5);
    py.set((clientY - r.top)  / r.height - 0.5);
  };
  const resetTilt = () => { px.set(0); py.set(0); };

  const pad = isDesktop ? "0.8rem 2.25rem" : "0.65rem 1.75rem";
  const fz  = isDesktop ? "0.75rem"        : "0.65rem";

  return (
    <motion.div
      ref={wrapRef}
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "fixed", bottom: 24, left: 24, zIndex: 600 }}
    >
      <motion.a
        ref={ref}
        href="/projects"
        onClick={e => { e.preventDefault(); router.push("/projects"); }}
        onPointerEnter={e => {
          if (e.pointerType === "touch") return;
          if (Date.now() - lastTouchRef.current < 600) return;
          setOrigin(e.clientX, e.clientY); setHover(true);
        }}
        onPointerMove={e => { if (e.pointerType !== "touch") setTiltFromPointer(e.clientX, e.clientY); }}
        onPointerLeave={e => { if (e.pointerType !== "touch") { setHover(false); resetTilt(); } }}
        onPointerCancel={() => { setHover(false); resetTilt(); }}
        onPointerDown={e => {
          if (e.pointerType !== "touch") return;
          lastTouchRef.current = Date.now();
          setOrigin(e.clientX, e.clientY); setHover(true);
        }}
        whileHover={reduce ? {} : { y: -2 }}
        whileTap={reduce   ? {} : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          padding: pad,
          background: "#ffffff",
          borderRadius: 9999,
          overflow: "hidden",
          textDecoration: "none",
          boxShadow: "0 6px 28px rgba(0,0,0,0.42)",
          rotateX, rotateY,
          transformPerspective: 600,
          "--x": "50%",
          "--y": "50%",
        } as React.CSSProperties}
      >
        <span style={{
          position: "relative", zIndex: 0,
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#020209", fontSize: fz, fontWeight: 500,
          letterSpacing: "0.18em", fontFamily: "inherit", whiteSpace: "nowrap",
        }}>
          ← EXIT
        </span>

        {/* Ripple fill */}
        <span
          aria-hidden
          style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#020209",
            clipPath: hover ? "circle(150% at var(--x) var(--y))" : "circle(0% at var(--x) var(--y))",
            transition: "clip-path 500ms ease-out",
          }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#ffffff", fontSize: fz, fontWeight: 500,
            letterSpacing: "0.18em", fontFamily: "inherit", whiteSpace: "nowrap",
          }}>
            ← EXIT
          </span>
        </span>

        {/* Shimmer */}
        <span aria-hidden style={{
          pointerEvents: "none", position: "absolute",
          top: 0, zIndex: 20, height: "100%", width: "33%",
          left: hover ? "100%" : "-33%",
          transform: "skewX(-12deg)",
          background: "rgba(255,255,255,0.30)",
          filter: "blur(4px)",
          transition: "left 700ms ease-out",
        }} />
      </motion.a>
    </motion.div>
  );
}
