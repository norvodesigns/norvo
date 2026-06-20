"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useTransform } from "motion/react";
import Link from "next/link";
import dynamic from "next/dynamic";

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
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: G.black }}>
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
      <Link
        href="/projects"
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 600,
          display: "flex", alignItems: "center", gap: 8,
          padding: "0.45rem 1rem",
          background: "rgba(13,13,11,0.75)",
          border: "1px solid rgba(224,223,219,0.18)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "rgba(250,250,249,0.65)",
          fontSize: "0.5rem",
          letterSpacing: "0.22em",
          textDecoration: "none",
          transition: "color 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget;
          el.style.color = G.white;
          el.style.borderColor = "rgba(196,154,46,0.4)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          el.style.color = "rgba(250,250,249,0.65)";
          el.style.borderColor = "rgba(224,223,219,0.18)";
        }}
      >
        ← EXIT
      </Link>
    </div>
  );
}
