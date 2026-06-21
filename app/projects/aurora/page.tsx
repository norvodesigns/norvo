"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion, useTransform,
  useMotionValue, useSpring, useReducedMotion, useInView,
} from "motion/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useDeviceTilt } from "@/components/DeviceTilt";

import { G } from "./constants";
import type { Route } from "./types";
import { useAuroraScroll } from "./hooks/useAuroraScroll";
import AuroraCursor from "./cursor/AuroraCursor";
import HomeView from "./views/HomeView";
import VoyagesView from "./views/VoyagesView";
import VoyageDetailView from "./views/VoyageDetailView";
import FleetView from "./views/FleetView";
import ContactView from "./views/ContactView";
import { AnimatePresence } from "motion/react";

const AuroraBackground = dynamic(
  () => import("./webgl/AuroraBackground"),
  { ssr: false }
);

const NAV_ITEMS: { num: string; label: string; route: Route }[] = [
  { num: "01", label: "HOME",    route: { view: "home"    } },
  { num: "02", label: "VOYAGES", route: { view: "voyages" } },
  { num: "03", label: "FLEET",   route: { view: "fleet"   } },
  { num: "04", label: "CONTACT", route: { view: "contact" } },
];

function routeKey(r: Route): string {
  return r.view === "voyage" ? `voyage-${r.id}` : r.view;
}

function activeView(r: Route): string {
  return r.view === "voyage" ? "voyages" : r.view;
}

export default function AuroraPage() {
  const [route, setRoute] = useState<Route>({ view: "home" });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYSmooth } = useAuroraScroll(containerRef);

  const lookRef      = useRef({ x: 0, y: 0 });
  const scrollRafRef = useRef(0);

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

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

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.style.cssText += ";scrollbar-width:none;-ms-overflow-style:none;";
  }, []);

  const current = activeView(route);

  return (
    <div style={{
      position: "fixed", inset: "6px", zIndex: 500,
      background: G.void,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.85)",
    }}>
      {/* WebGL starfield — behind everything */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <AuroraBackground lookRef={lookRef} scrollRafRef={scrollRafRef} />
      </div>

      {/* Two-column grid: sidebar | content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "160px 1fr",
        gridTemplateRows: isMobile ? "1fr 56px" : "1fr",
        height: "100%",
      }}>
        {/* ── Sidebar / bottom tab bar ──────────────────────────────── */}
        {isMobile ? (
          // Mobile: bottom tab bar
          <div style={{
            gridRow: 2, gridColumn: 1,
            display: "flex", flexDirection: "row",
            height: 56,
            background: "rgba(28,28,30,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            {NAV_ITEMS.map(({ num, label, route: r }) => {
              const isActive = current === r.view;
              return (
                <button
                  key={r.view}
                  onClick={() => navigate(r)}
                  style={{
                    flex: 1,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 3,
                    background: "none", border: "none", cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <span style={{
                    fontFamily: "monospace",
                    fontSize: "0.42rem",
                    letterSpacing: "0.12em",
                    color: isActive ? G.ice : G.iron,
                    transition: "color 0.2s ease",
                  }}>{num}</span>
                  <span style={{
                    fontSize: "0.40rem",
                    letterSpacing: "0.16em",
                    color: isActive ? G.white : G.silver,
                    transition: "color 0.2s ease",
                  }}>{label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          // Desktop: vertical sidebar
          <div style={{
            gridRow: 1, gridColumn: 1,
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            background: "rgba(28,28,30,0.78)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}>
            {/* Top: wordmark + nav */}
            <div>
              {/* Wordmark */}
              <div style={{ padding: "1.5rem 1rem 1rem" }}>
                <button
                  onClick={() => navigate({ view: "home" })}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 200,
                    fontSize: "0.65rem",
                    letterSpacing: "0.32em",
                    color: G.white,
                    display: "block",
                  }}
                >
                  AURORA
                </button>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0 0" }} />

              {/* Nav items */}
              <div style={{ paddingTop: "1.5rem" }}>
                {NAV_ITEMS.map(({ num, label, route: r }) => {
                  const isActive = current === r.view;
                  return (
                    <button
                      key={r.view}
                      onClick={() => navigate(r)}
                      style={{
                        position: "relative",
                        width: "100%",
                        display: "flex", flexDirection: "column", alignItems: "flex-start",
                        gap: 3,
                        padding: "0.65rem 0.75rem 0.65rem 1.25rem",
                        background: "none", border: "none", cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {/* Active accent bar */}
                      {isActive && (
                        <span style={{
                          position: "absolute", left: 0, top: 0, bottom: 0,
                          width: 2, background: G.ice,
                        }} />
                      )}
                      <span style={{
                        fontFamily: "monospace",
                        fontSize: "0.40rem",
                        letterSpacing: "0.14em",
                        color: isActive ? G.ice : G.iron,
                        transition: "color 0.2s ease",
                      }}>{num}</span>
                      <span style={{
                        fontSize: "0.52rem",
                        letterSpacing: "0.20em",
                        color: isActive ? G.white : G.silver,
                        transition: "color 0.2s ease",
                      }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom: build string */}
            <div style={{ padding: "1rem 1rem 1.25rem" }}>
              <span style={{
                fontFamily: "monospace",
                fontSize: "0.40rem",
                letterSpacing: "0.16em",
                color: G.iron,
              }}>AV.2029</span>
            </div>
          </div>
        )}

        {/* ── Main content area ─────────────────────────────────────── */}
        <div
          ref={containerRef}
          style={{
            gridRow: 1, gridColumn: isMobile ? 1 : 2,
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <div key={routeKey(route)} style={{ height: "100%" }}>
              {route.view === "home" && (
                <HomeView navigate={navigate} containerRef={containerRef} />
              )}
              {route.view === "voyages" && (
                <VoyagesView navigate={navigate} containerRef={containerRef} />
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
      </div>

      {/* Custom cursor — desktop only */}
      <AuroraCursor />

      {/* Exit button */}
      <ExitButton />
    </div>
  );
}

// ── Exit button — white pill ───────────────────────────────────────────────────
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
          color: "#080808", fontSize: fz, fontWeight: 500,
          letterSpacing: "0.18em", fontFamily: "inherit", whiteSpace: "nowrap",
        }}>
          ← EXIT
        </span>

        <span
          aria-hidden
          style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#080808",
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
