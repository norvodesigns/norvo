"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { PROPERTIES, AGENTS, type Property } from "./data";

// ─── Brand ────────────────────────────────────────────────────────────────────

const G = {
  gold:    "#C49A2E",
  black:   "#0D0D0B",
  white:   "#FAFAF9",
  gray:    "#5C5C58",
  light:   "#F2F1EE",
  border:  "#E0DFDB",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Route =
  | { view: "home" }
  | { view: "properties" }
  | { view: "property"; id: string }
  | { view: "about" }
  | { view: "contact" };

type Nav = (r: Route) => void;

const NAV_LINKS: { label: string; route: Route }[] = [
  { label: "Properties", route: { view: "properties" } },
  { label: "About",      route: { view: "about"      } },
  { label: "Contact",    route: { view: "contact"    } },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusBadge = (s: string) =>
  s === "Available"
    ? { background: "rgba(13,13,11,0.65)",  color: "rgba(255,255,255,0.72)" }
    : s === "Coming Soon"
    ? { background: "rgba(30,50,80,0.75)",  color: "rgba(160,200,255,0.85)" }
    : { background: "rgba(196,154,46,0.85)", color: "#0D0D0B" }; // Pre-Sale = gold

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" } as const,
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
});

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StrataPage() {
  const [route,      setRoute]      = useState<Route>({ view: "home" });
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "instant" });
    setScrolled(false);
  }, [route]);

  const navigate: Nav = useCallback((r: Route) => {
    setRoute(r);
    setMobileOpen(false);
  }, []);

  const transparent = !scrolled && route.view === "home";
  const key = route.view === "property" ? `property-${route.id}` : route.view;

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 z-[500] overflow-y-auto"
        style={{ background: G.white, color: G.black }}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 50)}
      >
        {/* ── Strata Nav — z-50 so it always sits above scrolling content ── */}
        <StrataNav
          navigate={navigate} route={route}
          transparent={transparent}
          mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38 }}
          >
            {route.view === "home"       && <HomePage       navigate={navigate} />}
            {route.view === "properties" && <PropertiesPage navigate={navigate} />}
            {route.view === "property"   && <PropertyDetailPage id={route.id} navigate={navigate} />}
            {route.view === "about"      && <AboutPage      navigate={navigate} />}
            {route.view === "contact"    && <ContactPage />}
          </motion.div>
        </AnimatePresence>

        <footer className="border-t px-6 py-8 text-center"
          style={{ borderColor: G.border }}>
          <p className="text-xs" style={{ color: `${G.gray}80` }}>
            © 2025 Strata Real Estate · Concept website by{" "}
            <a href="/projects" className="underline transition-opacity hover:opacity-60">Norvo</a>
            {" "}· All properties and content are entirely fictional
          </p>
        </footer>
      </div>

      <ExitButton />
    </>
  );
}

// ─── Strata Nav ───────────────────────────────────────────────────────────────

function StrataNav({
  navigate, route, transparent, mobileOpen, setMobileOpen,
}: {
  navigate: Nav; route: Route; transparent: boolean;
  mobileOpen: boolean; setMobileOpen: (o: boolean) => void;
}) {
  return (
    /* z-50 keeps nav above ALL scrolling content inside the overlay */
    <nav className="sticky top-0 z-50 transition-all duration-500"
      style={{
        background:   transparent ? "transparent" : G.white,
        borderBottom: transparent ? "none" : `1px solid ${G.border}`,
      }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:h-20">

        {/* Wordmark */}
        <button onClick={() => navigate({ view: "home" })}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
          <span className="h-3 w-3 rotate-45 rounded-sm"
            style={{ background: G.gold }} />
          <span className="font-display text-[0.65rem] font-light uppercase tracking-[0.48em]"
            style={{ color: transparent ? "rgba(255,255,255,0.9)" : G.black }}>
            Strata
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((l) => {
            const active = route.view === l.route.view;
            return (
              <button key={l.label} onClick={() => navigate(l.route)}
                className="relative text-sm transition-colors duration-200"
                style={{ color: active ? G.gold : transparent ? "rgba(255,255,255,0.55)" : G.gray }}>
                {l.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 h-px w-full rounded-full"
                    style={{ background: G.gold }} />
                )}
              </button>
            );
          })}
        </div>

        {/* CTA + burger */}
        <div className="flex items-center gap-3">
          <motion.button onClick={() => navigate({ view: "contact" })}
            whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="hidden rounded-full px-5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-black md:block"
            style={{ background: G.gold }}>
            Schedule Viewing
          </motion.button>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-label="Toggle menu">
            <span className="block h-px w-5 rounded-full transition-all duration-300"
              style={{
                background: transparent ? "rgba(255,255,255,0.85)" : G.black,
                transform: mobileOpen ? "translateY(5px) rotate(45deg)" : "none",
              }} />
            <span className="block h-px w-5 rounded-full transition-all duration-300"
              style={{
                background: transparent ? "rgba(255,255,255,0.85)" : G.black,
                transform: mobileOpen ? "translateY(-5px) rotate(-45deg)" : "none",
              }} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className="overflow-hidden transition-all duration-300 ease-out md:hidden"
        style={{ maxHeight: mobileOpen ? "300px" : "0" }}>
        <div className="flex flex-col gap-7 border-t px-7 py-9"
          style={{ background: G.white, borderColor: G.border }}>
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={() => navigate(l.route)}
              className="text-left font-display text-3xl font-light tracking-tight transition-colors"
              style={{ color: route.view === l.route.view ? G.gold : G.black }}>
              {l.label}
            </button>
          ))}
          <button onClick={() => navigate({ view: "contact" })}
            className="mt-2 w-full rounded-full py-3 text-sm font-medium tracking-wide text-black"
            style={{ background: G.gold }}>
            Schedule Viewing
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Exit Button ──────────────────────────────────────────────────────────────

function ExitButton() {
  return (
    <Link href="/projects"
      className="fixed bottom-6 left-6 z-[600] flex items-center gap-2 rounded-full border border-white/18 bg-black/82 px-4 py-2.5 text-[0.6rem] uppercase tracking-[0.2em] text-white/55 backdrop-blur-md transition-all duration-300 hover:border-white/38 hover:text-white/85">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M7.5 5H2.5M2.5 5L5 2.5M2.5 5L5 7.5"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Exit Prototype
    </Link>
  );
}

// ─── Property Card — image-first, no white box ────────────────────────────────

function PropertyCard({
  p, i, navigate, large = false,
}: {
  p: Property; i: number; navigate: Nav; large?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.06 }}
      className="group cursor-pointer"
      onClick={() => navigate({ view: "property", id: p.id })}
    >
      {/* Image fills the card — no white background */}
      <div className={`relative overflow-hidden rounded-2xl ${large ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />

        {/* Atmospheric gradient — heavy at bottom, light at top */}
        <div className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(13,13,11,0.92) 0%, rgba(13,13,11,0.45) 38%, rgba(13,13,11,0.05) 65%)",
          }} />

        {/* Status */}
        <div className="absolute left-5 top-5">
          <span className="rounded-full px-3 py-1 text-[0.58rem] font-medium uppercase tracking-[0.14em] backdrop-blur-sm"
            style={statusBadge(p.status)}>
            {p.status}
          </span>
        </div>

        {/* Bottom text — always visible, subtle hover reveal on arrow */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
          <p className="mb-2 text-[0.58rem] uppercase tracking-[0.32em]"
            style={{ color: "rgba(255,255,255,0.38)" }}>
            {p.location} · {p.city}
          </p>
          <h3 className={`font-display font-light leading-tight text-white ${large ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
            {p.name}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="font-display font-light" style={{ color: G.gold }}>
              {p.priceRange}
            </p>
            <span className="translate-x-0 text-xs opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
              style={{ color: "rgba(255,255,255,0.55)" }}>
              View →
            </span>
          </div>
          <div className="mt-2 flex gap-4 text-[0.65rem]"
            style={{ color: "rgba(255,255,255,0.28)" }}>
            <span>{p.beds} bed</span>
            <span>{p.baths} bath</span>
            <span>{p.sqft} sqft</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ navigate }: { navigate: Nav }) {
  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────────────────
           -mt-16 sm:-mt-20 pulls the section behind the sticky nav so the
           image fills the full viewport top-to-bottom with zero white gap.
           pt-16/20 on the content div pushes text below the nav overlay.   */}
      <section className="relative -mt-16 h-screen min-h-[640px] overflow-hidden sm:-mt-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt="" aria-hidden
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
        />
        {/* Deep gradient — darkest at bottom-left where text lives */}
        <div className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,13,11,0.72) 0%, rgba(13,13,11,0.18) 55%, rgba(13,13,11,0.48) 100%)",
          }} />

        {/* Content — bottom-left editorial positioning */}
        <div className="absolute inset-0 flex flex-col justify-end px-8 pb-16 sm:px-12 sm:pb-20 lg:px-16">
          {/* Pre-title */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mb-6 flex items-center gap-4"
          >
            <span className="h-px w-8" style={{ background: G.gold }} />
            <span className="text-[0.6rem] uppercase tracking-[0.5em]"
              style={{ color: "rgba(255,255,255,0.42)" }}>
              Strata Real Estate
            </span>
          </motion.div>

          {/* Headline — large, editorial */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-light leading-none tracking-tight text-white"
            style={{ fontSize: "clamp(3.2rem, 9vw, 8.5rem)" }}
          >
            For<br />
            <em className="not-italic" style={{ color: G.gold }}>the</em><br />
            elevated<br />
            market.
          </motion.h1>

          {/* Sub-line + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.72 }}
            className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center"
          >
            <p className="max-w-xs text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              Representing the finest properties with uncompromising discretion.
            </p>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate({ view: "properties" })}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="rounded-full px-7 py-3 text-sm font-medium text-black"
                style={{ background: G.gold }}>
                View Properties
              </motion.button>
              <motion.button
                onClick={() => navigate({ view: "contact" })}
                whileHover={{ scale: 1.05, y: -2, backgroundColor: "rgba(255,255,255,0.12)" }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="rounded-full border px-7 py-3 text-sm"
                style={{
                  borderColor: "rgba(255,255,255,0.55)",
                  color: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(8px)",
                }}>
                Contact Advisor
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Bottom-right: property count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="absolute bottom-16 right-8 text-right sm:bottom-20 sm:right-12 lg:right-16"
        >
          <p className="text-[0.58rem] uppercase tracking-[0.28em]"
            style={{ color: "rgba(255,255,255,0.28)" }}>
            Currently representing
          </p>
          <p className="mt-1 font-display text-2xl font-light" style={{ color: G.gold }}>
            6 <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>concept properties</span>
          </p>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="h-7 w-px"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }} />
        </motion.div>
      </section>

      {/* ── THIN LABEL STRIP ─────────────────────────────────────────────── */}
      <div className="border-y py-4" style={{ borderColor: G.border }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 overflow-x-auto px-8 sm:px-12 lg:px-16">
          {["Riverside District", "North Ridge", "Suncoast Estates", "The Platinum Quarter", "Hilltop Reserve", "Greenway Commons"].map((loc, i) => (
            <span key={loc}
              className="shrink-0 text-[0.6rem] uppercase tracking-[0.28em]"
              style={{ color: i === 0 ? G.gold : G.gray }}>
              {loc}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED PROPERTIES — editorial asymmetric layout ──────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">

          {/* Section label */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[0.6rem] uppercase tracking-[0.35em]"
                style={{ color: G.gray }}>
                Currently Available
              </p>
              <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
                Featured Properties
              </h2>
            </div>
            <button onClick={() => navigate({ view: "properties" })}
              className="hidden text-sm transition-opacity hover:opacity-60 md:block"
              style={{ color: G.gold }}>
              All Properties →
            </button>
          </div>

          {/* Mosaic: large left (2/3) + 2 stacked right (1/3) */}
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Large featured */}
            <PropertyCard p={PROPERTIES[0]} i={0} navigate={navigate} large />

            {/* Two stacked — side by side on tablet, stacked on desktop */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <PropertyCard p={PROPERTIES[1]} i={1} navigate={navigate} />
              <PropertyCard p={PROPERTIES[2]} i={2} navigate={navigate} />
            </div>
          </div>

          <div className="mt-8 text-center md:hidden">
            <button onClick={() => navigate({ view: "properties" })}
              className="text-sm transition-opacity hover:opacity-60"
              style={{ color: G.gold }}>
              View All Properties →
            </button>
          </div>
        </div>
      </section>

      {/* ── CINEMATIC QUOTE SECTION ──────────────────────────────────────── */}
      <section className="relative overflow-hidden py-36 sm:py-48" style={{ background: G.black }}>
        {/* Background image — heavily suppressed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
          alt="" aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        {/* Vignette */}
        <div className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(13,13,11,0.0) 0%, rgba(13,13,11,0.85) 100%)",
          }} />

        <div className="relative z-10 mx-auto max-w-5xl px-8 text-center sm:px-12">
          <motion.div {...reveal()} className="mb-10 flex items-center justify-center gap-5">
            <span className="h-px flex-1 max-w-16" style={{ background: `${G.gold}50` }} />
            <span className="text-[0.6rem] uppercase tracking-[0.5em]" style={{ color: G.gold }}>
              Philosophy
            </span>
            <span className="h-px flex-1 max-w-16" style={{ background: `${G.gold}50` }} />
          </motion.div>

          <motion.blockquote
            {...reveal(0.08)}
            className="font-display font-light leading-[1.18] tracking-tight text-white"
            style={{ fontSize: "clamp(1.8rem, 5vw, 4rem)" }}
          >
            "The finest properties deserve representation equal to their quality."
          </motion.blockquote>

          <motion.p {...reveal(0.15)}
            className="mt-8 text-xs uppercase tracking-[0.42em]"
            style={{ color: `${G.gold}90` }}>
            — Strata Real Estate, est. 2008
          </motion.p>

          {/* Stats */}
          <motion.div {...reveal(0.22)}
            className="mt-20 grid grid-cols-2 gap-10 border-t pt-16 sm:grid-cols-4"
            style={{ borderColor: `${G.gold}22` }}>
            {[
              { value: "847+",  label: "Properties Represented" },
              { value: "$4.2B", label: "Transaction Volume" },
              { value: "17",    label: "Years in Market" },
              { value: "98%",   label: "Client Satisfaction" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-light text-white sm:text-4xl">{s.value}</p>
                <p className="mt-2 text-[0.6rem] uppercase tracking-[0.22em]"
                  style={{ color: "rgba(255,255,255,0.3)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
          <p className="mt-6 text-[0.62rem] italic" style={{ color: "rgba(255,255,255,0.18)" }}>
            Fictional statistics created for demonstration purposes.
          </p>
        </div>
      </section>

      {/* ── SOFT CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32" style={{ background: G.light }}>
        <div className="mx-auto max-w-3xl px-8 text-center">
          <motion.p {...reveal()} className="mb-4 text-[0.6rem] uppercase tracking-[0.38em]"
            style={{ color: G.gray }}>
            Ready to begin
          </motion.p>
          <motion.h2 {...reveal(0.07)}
            className="font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">
            Seeking something exceptional?
          </motion.h2>
          <motion.p {...reveal(0.14)} className="mx-auto mt-5 max-w-md text-base leading-relaxed"
            style={{ color: G.gray }}>
            Our advisors are available seven days a week. Every inquiry is treated with full discretion.
          </motion.p>
          <motion.div {...reveal(0.2)}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <motion.button onClick={() => navigate({ view: "contact" })}
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              className="rounded-full px-8 py-3.5 text-sm font-medium text-black"
              style={{ background: G.gold }}>
              Speak to an Advisor
            </motion.button>
            <motion.button onClick={() => navigate({ view: "properties" })}
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              className="rounded-full border px-8 py-3.5 text-sm"
              style={{ borderColor: G.border, color: G.gray }}>
              Browse Properties
            </motion.button>
          </motion.div>
        </div>
      </section>
    </>
  );
}

// ─── Properties Page ──────────────────────────────────────────────────────────

function PropertiesPage({ navigate }: { navigate: Nav }) {
  type Filter = "All" | "Available" | "Pre-Sale" | "Coming Soon";
  const [filter, setFilter] = useState<Filter>("All");

  const filtered =
    filter === "All" ? PROPERTIES : PROPERTIES.filter((p) => p.status === filter);

  return (
    <div className="min-h-screen" style={{ background: G.white }}>
      {/* Header */}
      <div className="border-b px-8 pb-10 pt-12 sm:px-12 lg:px-16"
        style={{ borderColor: G.border }}>
        <p className="mb-3 text-[0.6rem] uppercase tracking-[0.38em]" style={{ color: G.gray }}>
          Concept Market
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-display text-5xl font-light tracking-tight sm:text-6xl">
            Properties
          </h1>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(["All", "Available", "Pre-Sale", "Coming Soon"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="shrink-0 rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition-all duration-200"
                style={{
                  background:   filter === f ? G.black : "transparent",
                  borderColor:  filter === f ? G.black : G.border,
                  color:        filter === f ? G.white : G.gray,
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-8 py-12 sm:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div key={filter}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <PropertyCard key={p.id} p={p} i={i} navigate={navigate} />
            ))}
          </motion.div>
        </AnimatePresence>
        <p className="mt-14 text-center text-[0.62rem] italic" style={{ color: `${G.gray}70` }}>
          All developments and addresses are fictional and for demonstration purposes only.
        </p>
      </div>
    </div>
  );
}

// ─── Property Detail Page ─────────────────────────────────────────────────────

function PropertyDetailPage({ id, navigate }: { id: string; navigate: Nav }) {
  const [activeImg, setActiveImg] = useState(0);
  const [form,      setForm]      = useState({ name: "", email: "", date: "", message: "" });
  const [sent,      setSent]      = useState(false);

  const property = PROPERTIES.find((p) => p.id === id);
  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p style={{ color: G.gray }}>Property not found.</p>
      </div>
    );
  }

  const agent    = AGENTS.find((a) => a.id === property.agentId);
  const allImgs  = [property.heroImage, ...property.gallery];
  const similar  = PROPERTIES.filter((p) => p.id !== id).slice(0, 3);

  const handleSubmit = () => {
    if (form.name.trim() && form.email.trim()) setSent(true);
  };

  return (
    <div className="min-h-screen">

      {/* Hero — full bleed, 65vh */}
      <div className="relative h-[65vh] min-h-[480px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={allImgs[activeImg]} alt={property.name}
          className="h-full w-full object-cover transition-all duration-700" />
        <div className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,13,11,0.4) 0%, rgba(13,13,11,0.05) 40%, rgba(13,13,11,0.82) 100%)",
          }} />

        {/* Back */}
        <button onClick={() => navigate({ view: "properties" })}
          className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-white/60 backdrop-blur-sm transition-colors hover:text-white sm:left-10"
          style={{ backdropFilter: "blur(8px)" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M7.5 5H2.5M2.5 5L5 2.5M2.5 5L5 7.5"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Properties
        </button>

        {/* Status */}
        <div className="absolute right-6 top-6 sm:right-10">
          <span className="rounded-full px-3 py-1.5 text-[0.58rem] font-medium uppercase tracking-[0.14em] backdrop-blur-sm"
            style={statusBadge(property.status)}>
            {property.status}
          </span>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 sm:px-12 lg:px-16">
          <p className="text-[0.58rem] uppercase tracking-[0.32em]"
            style={{ color: "rgba(255,255,255,0.38)" }}>
            {property.label}
          </p>
          <h1 className="mt-1.5 font-display font-light leading-none text-white"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}>
            {property.name}
          </h1>
          <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {property.location} · {property.city}
          </p>
        </div>
      </div>

      {/* Gallery strip */}
      <div className="border-b px-8 py-3 sm:px-12 lg:px-16"
        style={{ borderColor: G.border, background: G.light }}>
        <div className="flex gap-2 overflow-x-auto">
          {allImgs.map((img, i) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className="h-[52px] w-[76px] shrink-0 overflow-hidden rounded-md transition-all duration-200"
              style={{
                outline:       activeImg === i ? `2px solid ${G.gold}` : "2px solid transparent",
                outlineOffset: "2px",
                opacity:       activeImg === i ? 1 : 0.55,
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-8 py-14 sm:px-12 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-3 lg:gap-20">

          {/* Left: Details */}
          <div className="lg:col-span-2">

            {/* Stats row */}
            <div className="mb-8 grid grid-cols-2 gap-6 rounded-2xl p-6 sm:grid-cols-4 sm:gap-0 sm:p-8"
              style={{ background: G.light }}>
              {[
                { label: "Bedrooms",    value: property.beds  },
                { label: "Bathrooms",   value: property.baths },
                { label: "Sq. Footage", value: property.sqft  },
                { label: "Lot Size",    value: property.lot   },
              ].map((s, i, arr) => (
                <div key={s.label}
                  className={`${i < arr.length - 1 ? "sm:border-r" : ""} sm:px-6 first:sm:pl-0 last:sm:pr-0`}
                  style={{ borderColor: G.border }}>
                  <p className="text-[0.58rem] uppercase tracking-[0.22em]" style={{ color: G.gray }}>
                    {s.label}
                  </p>
                  <p className="mt-1.5 font-display text-xl font-light">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Price + meta */}
            <div className="mb-10">
              <p className="text-[0.58rem] uppercase tracking-[0.22em]" style={{ color: G.gray }}>
                Price Range
              </p>
              <p className="mt-1 font-display text-4xl font-light" style={{ color: G.gold }}>
                {property.priceRange}
              </p>
              <p className="mt-2 text-xs" style={{ color: G.gray }}>
                {property.listed} · Built {property.yearBuilt}
              </p>
            </div>

            {/* Description */}
            <div className="mb-12 border-l-2 pl-7" style={{ borderColor: `${G.gold}50` }}>
              <p className="text-base leading-[1.85]" style={{ color: G.gray }}>
                {property.description}
              </p>
              <p className="mt-3 text-xs italic" style={{ color: `${G.gray}70` }}>
                Concept property — for demonstration purposes only.
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="mb-6 font-display text-xl font-light">Features &amp; Amenities</h2>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {property.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="mt-1 shrink-0 text-[0.55rem]" style={{ color: G.gold }}>✦</span>
                    <span className="text-sm leading-relaxed" style={{ color: G.gray }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Agent + inquiry */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-2xl border"
              style={{ borderColor: G.border }}>

              {/* Agent header */}
              {agent && (
                <div className="p-6" style={{ background: G.black }}>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={agent.avatar} alt={agent.name}
                      className="h-11 w-11 rounded-full object-cover ring-1"
                      style={{ ringColor: G.gold }} />
                    <div>
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {agent.title}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <p>📞 {agent.phone}</p>
                    <p>✉ {agent.email}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="p-6" style={{ background: G.white }}>
                {sent ? (
                  <div className="py-8 text-center">
                    <div className="mb-3 font-display text-3xl" style={{ color: G.gold }}>✓</div>
                    <p className="font-display text-lg font-light">Request received</p>
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: G.gray }}>
                      Concept form — no actual submission occurred.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="mb-5 font-display text-lg font-light">Schedule a Viewing</h3>
                    <div className="space-y-3">
                      {[
                        { key: "name",    placeholder: "Full Name",      type: "text" },
                        { key: "email",   placeholder: "Email Address",  type: "email" },
                        { key: "date",    placeholder: "",               type: "date" },
                      ].map(({ key: k, placeholder, type }) => (
                        <input key={k}
                          value={form[k as keyof typeof form]}
                          type={type} placeholder={placeholder}
                          onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                          style={{ borderColor: G.border, background: G.light, color: G.black }} />
                      ))}
                      <textarea value={form.message} rows={3} placeholder="Message (optional)"
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none"
                        style={{ borderColor: G.border, background: G.light, color: G.black }} />
                      <motion.button onClick={handleSubmit}
                        whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 380, damping: 18 }}
                        className="w-full rounded-full py-3 text-sm font-medium text-black"
                        style={{ background: G.gold }}>
                        Request Viewing
                      </motion.button>
                      <p className="text-center text-[0.58rem]" style={{ color: `${G.gray}60` }}>
                        Concept form · No submission occurs
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar */}
        <div className="mt-24 border-t pt-16" style={{ borderColor: G.border }}>
          <h2 className="mb-10 font-display text-2xl font-light">Similar Properties</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p, i) => (
              <PropertyCard key={p.id} p={p} i={i} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────

function AboutPage({ navigate }: { navigate: Nav }) {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative h-80 overflow-hidden sm:h-[440px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=80"
          alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(13,13,11,0.5), rgba(13,13,11,0.78))" }} />
        <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-12 sm:px-12 lg:px-16">
          <p className="mb-3 text-[0.6rem] uppercase tracking-[0.42em]" style={{ color: G.gold }}>
            Our Story
          </p>
          <h1 className="font-display text-5xl font-light tracking-tight text-white sm:text-7xl">
            About Strata
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 sm:py-28" style={{ background: G.white }}>
        <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-28">
            <motion.div {...reveal()}>
              <blockquote className="font-display text-3xl font-light leading-[1.22] tracking-tight sm:text-4xl">
                "We were founded on a single conviction: the finest properties deserve representation that matches their quality."
              </blockquote>
              <p className="mt-10 text-base leading-[1.85]" style={{ color: G.gray }}>
                Strata was established in 2008 with a deliberate focus on a limited portfolio of exceptional properties. We do not operate at volume. We operate with precision — placing each property with buyers who understand its full value.
              </p>
              <p className="mt-4 text-base leading-[1.85]" style={{ color: G.gray }}>
                Our advisors are drawn from backgrounds in architecture, private banking, and luxury hospitality — disciplines that share an understanding of the difference between price and value.
              </p>
            </motion.div>

            <motion.div {...reveal(0.1)}
              className="grid grid-cols-2 gap-8 sm:gap-10">
              {[
                { value: "847+",  label: "Properties Represented" },
                { value: "$4.2B", label: "Transaction Volume"     },
                { value: "17",    label: "Years in Market"        },
                { value: "98%",   label: "Client Retention"       },
              ].map((s) => (
                <div key={s.label} className="border-l-2 pl-6"
                  style={{ borderColor: `${G.gold}55` }}>
                  <p className="font-display text-4xl font-light">{s.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em]" style={{ color: G.gray }}>
                    {s.label}
                  </p>
                </div>
              ))}
              <p className="col-span-2 text-[0.62rem] italic" style={{ color: `${G.gray}70` }}>
                Fictional statistics for demonstration.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 sm:py-28" style={{ background: G.light }}>
        <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
          <p className="mb-3 text-[0.6rem] uppercase tracking-[0.38em]" style={{ color: G.gray }}>
            Our Team
          </p>
          <h2 className="mb-14 font-display text-4xl font-light tracking-tight sm:text-5xl">
            The Advisors
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {AGENTS.map((a, i) => (
              <motion.div key={a.id} {...reveal(i * 0.09)}>
                <div className="mb-5 aspect-[3/4] overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.avatar} alt={a.name}
                    className="h-full w-full object-cover" />
                </div>
                <h3 className="font-display text-2xl font-light">{a.name}</h3>
                <p className="mt-1.5 text-sm" style={{ color: G.gray }}>{a.title}</p>
                <p className="mt-3 text-xs" style={{ color: G.gold }}>{a.phone}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-8 text-xs italic" style={{ color: `${G.gray}70` }}>
            Concept advisors — fictional team created for demonstration.
          </p>
        </div>
      </section>

      {/* IDX / For Agents */}
      <section className="py-24 sm:py-32" style={{ background: G.black }}>
        <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-24">
            <motion.div {...reveal()}>
              <p className="mb-4 text-[0.6rem] uppercase tracking-[0.42em]" style={{ color: G.gold }}>
                For Real Estate Professionals
              </p>
              <h2 className="font-display text-4xl font-light leading-[1.1] text-white sm:text-5xl">
                Your IDX feed,
                <br />finally beautiful.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed"
                style={{ color: "rgba(255,255,255,0.42)" }}>
                This website is a concept built by Norvo to demonstrate what we build for agents and brokerages. IDX integration with your MLS is included in every build — no hidden fees, no technical complexity. Live listings, beautifully presented.
              </p>
              <motion.button onClick={() => navigate({ view: "contact" })}
                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="mt-8 rounded-full px-8 py-3.5 text-sm font-medium text-black"
                style={{ background: G.gold }}>
                Talk to Us About Your Site
              </motion.button>
            </motion.div>
            <motion.div {...reveal(0.1)} className="grid grid-cols-2 gap-4">
              {[
                { title: "IDX Integration",  body: "All major MLS providers supported. Full sync included, no hidden fees." },
                { title: "Mobile First",     body: "Every gallery, map, and form built for touch before it reaches desktop." },
                { title: "Lead Capture",     body: "Inquiry forms, CRM sync, and routing baked in from day one." },
                { title: "Fast Launch",      body: "Brief to live in four steps. No retainers after launch." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border p-5"
                  style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)" }}>
                  <h4 className="mb-2 text-sm font-medium text-white">{f.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {f.body}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Contact Page ─────────────────────────────────────────────────────────────

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", property: "", message: "" });
  const [sent, setSent] = useState(false);

  const field = { borderColor: G.border, background: G.light, color: G.black };

  return (
    <div className="min-h-screen" style={{ background: G.white }}>

      {/* Header */}
      <section className="py-20" style={{ background: G.light }}>
        <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
          <p className="mb-3 text-[0.6rem] uppercase tracking-[0.42em]" style={{ color: G.gray }}>
            Get in Touch
          </p>
          <h1 className="font-display text-5xl font-light tracking-tight sm:text-7xl">
            Contact an Advisor
          </h1>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-8 py-20 sm:px-12 lg:px-16">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

          {/* Info */}
          <div>
            <h2 className="mb-10 font-display text-2xl font-light">Our Office</h2>
            <div className="space-y-8">
              {[
                { label: "Address", value: "850 Pinnacle Drive, Suite 200\nSample City, CA 90210" },
                { label: "Phone",   value: "(555) 204-1100"                                       },
                { label: "Email",   value: "connect@stratarealty.com"                             },
                { label: "Hours",   value: "Monday – Sunday  ·  8 AM – 8 PM"                     },
              ].map((c) => (
                <div key={c.label}>
                  <p className="mb-2 text-[0.58rem] uppercase tracking-[0.32em]" style={{ color: G.gold }}>
                    {c.label}
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: G.gray }}>
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-10 flex h-44 items-center justify-center rounded-2xl border"
              style={{ borderColor: G.border, background: G.light }}>
              <div className="text-center">
                <p className="text-sm" style={{ color: G.gray }}>Sample City, CA</p>
                <p className="mt-1 text-xs italic" style={{ color: `${G.gray}60` }}>
                  Map placeholder · concept address
                </p>
              </div>
            </div>

            {/* Advisors */}
            <div className="mt-12">
              <p className="mb-5 text-[0.6rem] uppercase tracking-[0.34em]" style={{ color: G.gray }}>
                Your Advisors
              </p>
              <div className="space-y-5">
                {AGENTS.map((a) => (
                  <div key={a.id} className="flex items-center gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.avatar} alt={a.name}
                      className="h-11 w-11 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium">{a.name}</p>
                      <p className="text-xs" style={{ color: G.gray }}>{a.title} · {a.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border p-8 sm:p-10" style={{ borderColor: G.border }}>
            {sent ? (
              <div className="py-16 text-center">
                <div className="mb-4 font-display text-4xl" style={{ color: G.gold }}>✓</div>
                <h3 className="font-display text-2xl font-light">Message received</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed" style={{ color: G.gray }}>
                  This is a concept form — no actual submission occurred.
                </p>
              </div>
            ) : (
              <>
                <h2 className="mb-7 font-display text-2xl font-light">Send a Message</h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[0.58rem] uppercase tracking-[0.22em]"
                        style={{ color: G.gray }}>Name</label>
                      <input value={form.name} placeholder="Full name"
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                        style={field} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[0.58rem] uppercase tracking-[0.22em]"
                        style={{ color: G.gray }}>Email</label>
                      <input value={form.email} placeholder="your@email.com"
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                        style={field} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[0.58rem] uppercase tracking-[0.22em]"
                      style={{ color: G.gray }}>Phone (optional)</label>
                    <input value={form.phone} placeholder="(555) 000-0000"
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={field} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[0.58rem] uppercase tracking-[0.22em]"
                      style={{ color: G.gray }}>Property of Interest</label>
                    <select value={form.property}
                      onChange={(e) => setForm((f) => ({ ...f, property: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{ ...field, color: form.property ? G.black : G.gray }}>
                      <option value="">Select a property</option>
                      {PROPERTIES.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} — {p.location}
                        </option>
                      ))}
                      <option value="general">General inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[0.58rem] uppercase tracking-[0.22em]"
                      style={{ color: G.gray }}>Message</label>
                    <textarea value={form.message} rows={5}
                      placeholder="Tell us what you're looking for..."
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={field} />
                  </div>
                  <motion.button onClick={handleSubmit}
                    whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    className="w-full rounded-full py-3.5 text-sm font-medium text-black"
                    style={{ background: G.gold }}>
                    Send Message
                  </motion.button>
                  <p className="text-center text-[0.58rem]" style={{ color: `${G.gray}60` }}>
                    Concept form · This is a demonstration website by Norvo
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function handleSubmit() {
    if (form.name.trim() && form.email.trim()) setSent(true);
  }
}