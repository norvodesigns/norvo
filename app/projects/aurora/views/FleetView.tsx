"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ScrollReveal3D from "@/components/ScrollReveal3D";
import { G, ease } from "../constants";
import type { Nav } from "../types";
import { FLEET, type Vehicle } from "../data";

interface Props { navigate: Nav; }

// Minimal SVG silhouettes for each vehicle
function VehicleSilhouette({ id, accent }: { id: string; accent: string }) {
  if (id === "aurora-i") {
    // Sub-orbital capsule — sleek pointed capsule with engine bell
    return (
      <svg viewBox="0 0 120 200" style={{ width: "100%", height: "100%" }} aria-hidden>
        <defs>
          <linearGradient id={`sil-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.06" />
          </linearGradient>
          <radialGradient id={`glow-${id}`} cx="50%" cy="60%" r="45%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Glow */}
        <ellipse cx="60" cy="110" rx="45" ry="60" fill={`url(#glow-${id})`} />
        {/* Engine glow */}
        <ellipse cx="60" cy="165" rx="14" ry="6" fill={accent} opacity="0.35" />
        {/* Hull */}
        <path
          d="M 60,18 C 40,18 30,60 28,110 L 30,140 L 90,140 L 92,110 C 90,60 80,18 60,18 Z"
          fill={`url(#sil-${id})`}
          stroke={accent}
          strokeWidth="0.8"
          strokeOpacity="0.55"
        />
        {/* Nose cone */}
        <path d="M 60,10 C 52,10 46,16 44,22 L 76,22 C 74,16 68,10 60,10 Z"
          fill={accent} fillOpacity="0.45" />
        {/* Viewport ring */}
        <circle cx="60" cy="80" r="12" fill="none" stroke={accent} strokeWidth="0.7" strokeOpacity="0.50" />
        <circle cx="60" cy="80" r="8"  fill={accent} fillOpacity="0.08" />
        {/* Landing leg stubs */}
        <path d="M 30,140 L 16,162 M 90,140 L 104,162" stroke={accent} strokeWidth="0.7" strokeOpacity="0.35" />
        {/* Engine bell */}
        <path d="M 46,140 Q 60,158 74,140" fill={accent} fillOpacity="0.25" />
        {/* Hull seam lines */}
        <line x1="60" y1="22" x2="60" y2="140" stroke={accent} strokeWidth="0.35" strokeOpacity="0.20" />
      </svg>
    );
  }

  if (id === "aurora-ii") {
    // Orbital cruiser — wider, flat-topped with docking collar
    return (
      <svg viewBox="0 0 160 200" style={{ width: "100%", height: "100%" }} aria-hidden>
        <defs>
          <linearGradient id={`sil-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.20" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id={`glow-${id}`} cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.30" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="80" cy="110" rx="65" ry="60" fill={`url(#glow-${id})`} />
        {/* Engine cluster */}
        <ellipse cx="66" cy="168" rx="8" ry="3"  fill={accent} opacity="0.30" />
        <ellipse cx="94" cy="168" rx="8" ry="3"  fill={accent} opacity="0.30" />
        {/* Main hull */}
        <path
          d="M 80,22 C 50,22 32,55 28,100 L 26,148 L 134,148 L 132,100 C 128,55 110,22 80,22 Z"
          fill={`url(#sil-${id})`}
          stroke={accent}
          strokeWidth="0.8"
          strokeOpacity="0.50"
        />
        {/* Flat observation deck top */}
        <rect x="42" y="30" width="76" height="14" rx="2"
          fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.6" strokeOpacity="0.40" />
        {/* Docking collar */}
        <rect x="62" y="18" width="36" height="14" rx="3"
          fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="0.7" strokeOpacity="0.55" />
        {/* Viewport strip */}
        {[45, 65, 85, 105, 120].map((x, i) => (
          <ellipse key={i} cx={x} cy="75" rx="5.5" ry="4"
            fill="none" stroke={accent} strokeWidth="0.6" strokeOpacity="0.42" />
        ))}
        {/* Solar wings */}
        <rect x="8"  y="90" width="18" height="42" rx="1" fill={accent} fillOpacity="0.14" stroke={accent} strokeWidth="0.5" strokeOpacity="0.35" />
        <rect x="134" y="90" width="18" height="42" rx="1" fill={accent} fillOpacity="0.14" stroke={accent} strokeWidth="0.5" strokeOpacity="0.35" />
        {/* Grid lines on wings */}
        {[100,112,124].map(y => (
          <line key={y} x1="8" y1={y} x2="26" y2={y} stroke={accent} strokeWidth="0.3" strokeOpacity="0.25" />
        ))}
        {/* Engine pods */}
        <path d="M 50,148 Q 66,168 82,148" fill={accent} fillOpacity="0.22" />
        <path d="M 78,148 Q 94,168 110,148" fill={accent} fillOpacity="0.22" />
        {/* Hull seam */}
        <line x1="80" y1="44" x2="80" y2="148" stroke={accent} strokeWidth="0.35" strokeOpacity="0.18" />
      </svg>
    );
  }

  // Nexus Station — toroidal orbital habitat
  return (
    <svg viewBox="0 0 200 180" style={{ width: "100%", height: "100%" }} aria-hidden>
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="90" rx="80" ry="70" fill={`url(#glow-${id})`} />
      {/* Outer ring */}
      <ellipse cx="100" cy="90" rx="72" ry="32"
        fill="none" stroke={accent} strokeWidth="0.9" strokeOpacity="0.50" />
      {/* Ring section fills */}
      <path d="M 28,90 A 72,32 0 0,1 172,90" fill={accent} fillOpacity="0.06" />
      {/* Inner hub */}
      <circle cx="100" cy="90" r="16"
        fill={accent} fillOpacity="0.10" stroke={accent} strokeWidth="0.7" strokeOpacity="0.50" />
      <circle cx="100" cy="90" r="9"
        fill={accent} fillOpacity="0.20" />
      {/* Spokes */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x2  = 100 + Math.cos(rad) * 56;
        const y2  = 90  + Math.sin(rad) * 25;
        return (
          <line key={i} x1="100" y1="90" x2={x2} y2={y2}
            stroke={accent} strokeWidth="0.5" strokeOpacity="0.32" />
        );
      })}
      {/* Docking arm — top */}
      <rect x="92" y="38" width="16" height="36" rx="2"
        fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.55" strokeOpacity="0.38" />
      {/* Docking arm — bottom */}
      <rect x="92" y="116" width="16" height="26" rx="2"
        fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.55" strokeOpacity="0.38" />
      {/* Solar panels */}
      <rect x="16"  y="66" width="30" height="48" rx="1"
        fill={accent} fillOpacity="0.10" stroke={accent} strokeWidth="0.55" strokeOpacity="0.32" />
      <rect x="154" y="66" width="30" height="48" rx="1"
        fill={accent} fillOpacity="0.10" stroke={accent} strokeWidth="0.55" strokeOpacity="0.32" />
      {/* Solar grid lines */}
      {[75, 85, 95, 105].map(y => (
        <line key={y} x1="16" y1={y} x2="46" y2={y} stroke={accent} strokeWidth="0.28" strokeOpacity="0.22" />
      ))}
      {/* Viewport dots on ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 100 + Math.cos(rad) * 63;
        const y = 90  + Math.sin(rad) * 28;
        return <circle key={i} cx={x} cy={y} r="2" fill={accent} fillOpacity="0.35" />;
      })}
    </svg>
  );
}

function VehicleCard({ vehicle, active, onClick }: { vehicle: Vehicle; active: boolean; onClick: () => void }) {
  const accent = active ? G.glowSoft : G.silver;

  return (
    <motion.div
      onClick={onClick}
      data-panel="true"
      layout
      style={{
        cursor: "pointer",
        border: `1px solid ${active ? "rgba(68,102,255,0.40)" : "rgba(100,100,180,0.14)"}`,
        background: active ? "rgba(68,102,255,0.06)" : "rgba(11,11,28,0.50)",
        padding: "2rem",
        transition: "border-color 0.35s ease, background 0.35s ease",
        display: "flex", flexDirection: "column", gap: "1.5rem",
      }}
      whileHover={{ scale: 1.005 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {/* Silhouette */}
      <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: vehicle.id === "nexus" ? 160 : 100, height: 160 }}>
          <VehicleSilhouette id={vehicle.id} accent={accent} />
        </div>
      </div>

      {/* Info */}
      <div>
        <div style={{ color: "rgba(100,110,255,0.50)", fontSize: "0.45rem", letterSpacing: "0.28em", marginBottom: 4 }}>
          {vehicle.designation} · {vehicle.type.toUpperCase()}
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 200,
          fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
          color: G.white,
          letterSpacing: "0.08em",
        }}>
          {vehicle.name}
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem",
      }}>
        {[
          { label: "MAX ALT",    value: vehicle.maxAlt },
          { label: "VELOCITY",   value: vehicle.maxVelocity },
          { label: "CAPACITY",   value: `${vehicle.capacity} passengers` },
          { label: "FIRST FLIGHT", value: vehicle.firstFlight },
        ].map(s => (
          <div key={s.label}>
            <div style={{ color: "rgba(100,110,255,0.40)", fontSize: "0.40rem", letterSpacing: "0.22em" }}>{s.label}</div>
            <div style={{ color: "rgba(224,224,244,0.65)", fontSize: "0.65rem", marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function FleetView({ navigate: _navigate }: Props) {
  const [activeId, setActiveId] = useState<string>(FLEET[0].id);
  const active = FLEET.find(v => v.id === activeId) ?? FLEET[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.01, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease }}
      style={{ minHeight: "100dvh", background: G.void }}
    >
      {/* Header */}
      <div style={{ padding: "9rem 2rem 4rem", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          style={{ color: "rgba(100,110,255,0.60)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1.25rem" }}
        >
          AURORA FLEET
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100,
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            color: G.white,
            letterSpacing: "0.06em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          The Vehicles
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.65, ease }}
          style={{ color: "rgba(224,224,244,0.35)", fontSize: "0.75rem", marginTop: "1.25rem", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}
        >
          Three purpose-built vehicles for three voyage classes — designed from first principles for private human spaceflight
        </motion.p>
      </div>

      {/* Vehicle cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.5rem",
        padding: "0 2rem 3rem",
        maxWidth: 1100, margin: "0 auto",
      }}>
        {FLEET.map((v, i) => (
          <ScrollReveal3D key={v.id} axis="y">
            <VehicleCard
              vehicle={v}
              active={activeId === v.id}
              onClick={() => setActiveId(v.id)}
            />
          </ScrollReveal3D>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease }}
          style={{
            maxWidth: 780, margin: "0 auto",
            padding: "3rem 2rem",
            borderTop: "1px solid rgba(68,102,255,0.12)",
          }}
        >
          <div style={{ color: "rgba(100,110,255,0.55)", fontSize: "0.48rem", letterSpacing: "0.32em", marginBottom: "1.25rem" }}>
            {active.designation} — {active.type.toUpperCase()}
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100,
            fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
            color: G.white,
            marginBottom: "1.5rem",
            letterSpacing: "0.06em",
          }}>
            {active.name}
          </h2>
          <p style={{ color: "rgba(224,224,244,0.55)", fontSize: "0.85rem", lineHeight: 1.75, marginBottom: "2.5rem" }}>
            {active.description}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1.5rem",
            borderTop: "1px solid rgba(68,102,255,0.12)",
            paddingTop: "2rem",
          }}>
            {[
              { label: "HULL MATERIAL",  value: active.hull },
              { label: "PROPULSION",     value: active.propulsion },
            ].map(s => (
              <div key={s.label}>
                <div style={{ color: "rgba(100,110,255,0.42)", fontSize: "0.42rem", letterSpacing: "0.22em", marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ color: "rgba(224,224,244,0.60)", fontSize: "0.72rem", lineHeight: 1.55 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ padding: "4rem 2rem 3rem", textAlign: "center", borderTop: "1px solid rgba(224,224,244,0.05)" }}>
        <p style={{ color: "rgba(224,224,244,0.14)", fontSize: "0.5rem", letterSpacing: "0.16em" }}>
          AURORA IS A CONCEPT SHOWCASE — ALL VEHICLES ARE FICTIONAL · NORVO.DESIGN
        </p>
      </div>
    </motion.div>
  );
}
