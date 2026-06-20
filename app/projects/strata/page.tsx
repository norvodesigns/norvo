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
import { useStrataScroll } from "./hooks/useStrataScroll";
import StrataCursor from "./cursor/StrataCursor";
import HomeView from "./views/HomeView";
import PropertiesView from "./views/PropertiesView";
import AboutView from "./views/AboutView";
import ContactView from "./views/ContactView";
import PropertyDetailView from "./views/PropertyDetailView";

const AtmosphereCanvas = dynamic(
  () => import("./webgl/StrataAtmosphere"),
  { ssr: false }
);

const NAV_LINKS: { label: string; route: Route }[] = [
  { label: "Residences", route: { view: "properties" } },
  { label: "About",      route: { view: "about" } },
  { label: "Contact",    route: { view: "contact" } },
];

function routeKey(r: Route): string {
  return r.view === "property" ? `property-${r.id}` : r.view;
}

export default function StrataPage() {
  const [route, setRoute] = useState<Route>({ view: "home" });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYSmooth } = useStrataScroll(containerRef);

  // Bridging refs for AtmosphereCanvas — plain objects, updated from listeners
  const lookRef      = useRef({ x: 0, y: 0 });
  const scrollRafRef = useRef(0);

  // Track mouse for atmosphere
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lookRef.current.x = (e.clientX / window.innerWidth)  * 2 - 1;
      lookRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Bridge scrollY to scrollRafRef
  useEffect(() => {
    return scrollY.on("change", v => {
      const el = containerRef.current;
      const max = el ? Math.max(el.scrollHeight - el.clientHeight, 1) : 1;
      scrollRafRef.current = v / max;
    });
  }, [scrollY]);

  // Gyro → atmosphere look (mobile)
  const tilt = useDeviceTilt();
  useEffect(() => {
    if (!tilt?.enabled) return;
    const ux = tilt.tiltX.on("change", v => { lookRef.current.x =  v; });
    const uy = tilt.tiltY.on("change", v => { lookRef.current.y = -v; });
    return () => { ux(); uy(); };
  }, [tilt]);

  // Scroll to top whenever view changes
  const navigate = (r: Route) => {
    containerRef.current?.scrollTo({ top: 0, behavior: "instant" });
    setRoute(r);
  };

  // Nav background: transparent at top, dark when scrolled
  const navBg = useTransform(scrollY, [0, 60], [
    "rgba(13,13,11,0)",
    "rgba(13,13,11,0.88)",
  ]);
  const navBlur = useTransform(scrollY, [0, 60], ["blur(0px)", "blur(12px)"]);

  // Hide scrollbar globally within this overlay
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.style.cssText += ";scrollbar-width:none;-ms-overflow-style:none;";
  }, []);

  return (
    <div style={{
      position: "fixed", inset: "6px", zIndex: 500,
      background: G.black,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.72)",
    }}>
      {/* WebGL atmosphere — sits beneath everything, persists across view changes */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <AtmosphereCanvas lookRef={lookRef} scrollRafRef={scrollRafRef} />
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
            borderBottom: "1px solid rgba(224,223,219,0.06)",
          }}
        >
          {/* Wordmark */}
          <button
            onClick={() => navigate({ view: "home" })}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 200,
              fontSize: "1.1rem",
              letterSpacing: "0.22em",
              color: G.white,
            }}
          >
            STRATA
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
                    color: active ? G.gold : "rgba(250,250,249,0.5)",
                    transition: "color 0.25s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "rgba(250,250,249,0.85)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "rgba(250,250,249,0.5)"; }}
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
            {route.view === "properties" && (
              <PropertiesView
                navigate={navigate}
                containerRef={containerRef}
              />
            )}
            {route.view === "property" && (
              <PropertyDetailView
                id={route.id}
                navigate={navigate}
                containerRef={containerRef}
              />
            )}
            {route.view === "about" && (
              <AboutView
                navigate={navigate}
                containerRef={containerRef}
              />
            )}
            {route.view === "contact" && (
              <ContactView navigate={navigate} />
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* Custom cursor — desktop only, no SSR */}
      <StrataCursor />

      {/* Exit button */}
      <ExitButton />
    </div>
  );
}

// ── Exit button: Button.tsx animation DNA, white pill ──────────────────────────
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

  // Gyro tilt on mobile (same pattern as Button.tsx)
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

  const setTilt = (clientX: number, clientY: number) => {
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
    // Entrance wrapper — slides up from below on page load
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
        onPointerMove={e => { if (e.pointerType !== "touch") setTilt(e.clientX, e.clientY); }}
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
          boxShadow: "0 6px 28px rgba(0,0,0,0.38)",
          rotateX, rotateY,
          transformPerspective: 600,
          "--x": "50%",
          "--y": "50%",
        } as React.CSSProperties}
      >
        <span style={{
          position: "relative", zIndex: 0,
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#0D0D0B", fontSize: fz, fontWeight: 500,
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
            background: "#0D0D0B",
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
          background: "rgba(255,255,255,0.35)",
          filter: "blur(4px)",
          transition: "left 700ms ease-out",
        }} />
      </motion.a>
    </motion.div>
  );
}
