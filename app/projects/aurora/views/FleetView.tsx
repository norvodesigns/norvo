"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { G } from "../constants";
import type { Nav } from "../types";
import { FLEET, type Vehicle } from "../data";

interface Props { navigate: Nav; }

// SVG vehicle silhouettes — same as previous version, accent color updated
function VehicleSilhouette({ id, accent }: { id: string; accent: string }) {
  if (id === "aurora-i") {
    return (
      <svg viewBox="0 0 120 200" style={{ width: "100%", height: "100%" }} aria-hidden>
        <defs>
          <linearGradient id={`sil-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.06" />
          </linearGradient>
          <radialGradient id={`glow-${id}`} cx="50%" cy="60%" r="45%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.30" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="110" rx="45" ry="60" fill={`url(#glow-${id})`} />
        <ellipse cx="60" cy="165" rx="14" ry="6" fill={accent} opacity="0.28" />
        <path d="M 60,18 C 40,18 30,60 28,110 L 30,140 L 90,140 L 92,110 C 90,60 80,18 60,18 Z"
          fill={`url(#sil-${id})`} stroke={accent} strokeWidth="0.8" strokeOpacity="0.50" />
        <path d="M 60,10 C 52,10 46,16 44,22 L 76,22 C 74,16 68,10 60,10 Z"
          fill={accent} fillOpacity="0.40" />
        <circle cx="60" cy="80" r="12" fill="none" stroke={accent} strokeWidth="0.7" strokeOpacity="0.45" />
        <circle cx="60" cy="80" r="8" fill={accent} fillOpacity="0.06" />
        <path d="M 30,140 L 16,162 M 90,140 L 104,162" stroke={accent} strokeWidth="0.7" strokeOpacity="0.30" />
        <path d="M 46,140 Q 60,158 74,140" fill={accent} fillOpacity="0.22" />
        <line x1="60" y1="22" x2="60" y2="140" stroke={accent} strokeWidth="0.35" strokeOpacity="0.18" />
      </svg>
    );
  }

  if (id === "aurora-ii") {
    return (
      <svg viewBox="0 0 160 200" style={{ width: "100%", height: "100%" }} aria-hidden>
        <defs>
          <linearGradient id={`sil-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
          </linearGradient>
          <radialGradient id={`glow-${id}`} cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="80" cy="110" rx="65" ry="60" fill={`url(#glow-${id})`} />
        <ellipse cx="66" cy="168" rx="8" ry="3" fill={accent} opacity="0.25" />
        <ellipse cx="94" cy="168" rx="8" ry="3" fill={accent} opacity="0.25" />
        <path d="M 80,22 C 50,22 32,55 28,100 L 26,148 L 134,148 L 132,100 C 128,55 110,22 80,22 Z"
          fill={`url(#sil-${id})`} stroke={accent} strokeWidth="0.8" strokeOpacity="0.45" />
        <rect x="42" y="30" width="76" height="14" rx="2"
          fill={accent} fillOpacity="0.10" stroke={accent} strokeWidth="0.6" strokeOpacity="0.36" />
        <rect x="62" y="18" width="36" height="14" rx="3"
          fill={accent} fillOpacity="0.20" stroke={accent} strokeWidth="0.7" strokeOpacity="0.50" />
        {[45, 65, 85, 105, 120].map((x, i) => (
          <ellipse key={i} cx={x} cy="75" rx="5.5" ry="4"
            fill="none" stroke={accent} strokeWidth="0.6" strokeOpacity="0.38" />
        ))}
        <rect x="8"   y="90" width="18" height="42" rx="1"
          fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.5" strokeOpacity="0.30" />
        <rect x="134" y="90" width="18" height="42" rx="1"
          fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="0.5" strokeOpacity="0.30" />
        {[100, 112, 124].map(y => (
          <line key={y} x1="8" y1={y} x2="26" y2={y} stroke={accent} strokeWidth="0.3" strokeOpacity="0.22" />
        ))}
        <path d="M 50,148 Q 66,168 82,148" fill={accent} fillOpacity="0.20" />
        <path d="M 78,148 Q 94,168 110,148" fill={accent} fillOpacity="0.20" />
        <line x1="80" y1="44" x2="80" y2="148" stroke={accent} strokeWidth="0.35" strokeOpacity="0.16" />
      </svg>
    );
  }

  // Nexus Station — toroidal
  return (
    <svg viewBox="0 0 200 180" style={{ width: "100%", height: "100%" }} aria-hidden>
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.24" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="90" rx="80" ry="70" fill={`url(#glow-${id})`} />
      <ellipse cx="100" cy="90" rx="72" ry="32"
        fill="none" stroke={accent} strokeWidth="0.9" strokeOpacity="0.45" />
      <path d="M 28,90 A 72,32 0 0,1 172,90" fill={accent} fillOpacity="0.05" />
      <circle cx="100" cy="90" r="16"
        fill={accent} fillOpacity="0.08" stroke={accent} strokeWidth="0.7" strokeOpacity="0.45" />
      <circle cx="100" cy="90" r="9" fill={accent} fillOpacity="0.18" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={i} x1="100" y1="90"
            x2={100 + Math.cos(rad) * 56} y2={90 + Math.sin(rad) * 25}
            stroke={accent} strokeWidth="0.5" strokeOpacity="0.28" />
        );
      })}
      <rect x="92" y="38" width="16" height="36" rx="2"
        fill={accent} fillOpacity="0.10" stroke={accent} strokeWidth="0.55" strokeOpacity="0.34" />
      <rect x="92" y="116" width="16" height="26" rx="2"
        fill={accent} fillOpacity="0.10" stroke={accent} strokeWidth="0.55" strokeOpacity="0.34" />
      <rect x="16"  y="66" width="30" height="48" rx="1"
        fill={accent} fillOpacity="0.08" stroke={accent} strokeWidth="0.55" strokeOpacity="0.28" />
      <rect x="154" y="66" width="30" height="48" rx="1"
        fill={accent} fillOpacity="0.08" stroke={accent} strokeWidth="0.55" strokeOpacity="0.28" />
      {[75, 85, 95, 105].map(y => (
        <line key={y} x1="16" y1={y} x2="46" y2={y} stroke={accent} strokeWidth="0.28" strokeOpacity="0.20" />
      ))}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle key={i}
            cx={100 + Math.cos(rad) * 63}
            cy={90  + Math.sin(rad) * 28}
            r="2" fill={accent} fillOpacity="0.30" />
        );
      })}
    </svg>
  );
}

const SPEC_ROWS: { label: string; key: keyof Vehicle }[] = [
  { label: "TYPE",         key: "type" },
  { label: "HULL",         key: "hull" },
  { label: "PROPULSION",   key: "propulsion" },
  { label: "MAX ALTITUDE", key: "maxAlt" },
  { label: "MAX VELOCITY", key: "maxVelocity" },
  { label: "CAPACITY",     key: "capacity" },
  { label: "FIRST FLIGHT", key: "firstFlight" },
];

function HangarSlot({ vehicle, active, onClick }: { vehicle: Vehicle; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const accent = active ? G.ice : G.steel;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "1.5rem 1rem 1rem",
        cursor: "pointer",
        transition: "background 0.2s ease",
        background: hovered && !active ? "rgba(255,255,255,0.02)" : "transparent",
      }}
    >
      {/* Silhouette */}
      <div style={{
        width: vehicle.id === "nexus" ? 140 : 80,
        height: 140,
        marginBottom: "1rem",
        transition: "transform 0.25s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}>
        <VehicleSilhouette id={vehicle.id} accent={accent} />
      </div>

      {/* Designation */}
      <div style={{
        fontFamily: "monospace", fontSize: "0.38rem",
        color: active ? G.ice : G.iron,
        letterSpacing: "0.16em", marginBottom: 4,
        transition: "color 0.2s ease",
      }}>
        {vehicle.designation}
      </div>

      {/* Name */}
      <div style={{
        fontSize: "0.60rem", letterSpacing: "0.10em",
        color: active ? G.white : G.silver,
        marginBottom: 8,
        transition: "color 0.2s ease",
      }}>
        {vehicle.name}
      </div>

      {/* Active underline */}
      <div style={{
        width: 32, height: 2,
        background: active ? G.ice : "transparent",
        transition: "background 0.25s ease",
      }} />
    </div>
  );
}

export default function FleetView({ navigate: _navigate }: Props) {
  const [activeId, setActiveId] = useState<string>(FLEET[0].id);
  const active = FLEET.find(v => v.id === activeId) ?? FLEET[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ minHeight: "100%", background: G.void2 }}
    >
      {/* Header */}
      <div style={{ padding: "2rem 1.5rem 2rem" }}>
        <div style={{
          fontFamily: "monospace", fontSize: "0.40rem",
          color: G.ice, letterSpacing: "0.24em", marginBottom: "0.65rem",
        }}>
          AURORA FLEET
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 100,
          fontSize: "clamp(1.8rem, 4vw, 3rem)", color: G.white,
          letterSpacing: "0.04em", margin: 0,
        }}>
          Hangar
        </h1>
      </div>

      {/* Hangar row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {FLEET.map((v, i) => (
          <div key={v.id} style={{
            borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <HangarSlot
              vehicle={v}
              active={activeId === v.id}
              onClick={() => setActiveId(v.id)}
            />
          </div>
        ))}
      </div>

      {/* Spec comparison table */}
      <div style={{ padding: "0 1.5rem" }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "120px repeat(3, 1fr)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          padding: "1rem 0 0.75rem",
        }}>
          <div /> {/* empty label cell */}
          {FLEET.map(v => (
            <div key={v.id} style={{
              fontSize: "0.42rem", letterSpacing: "0.18em",
              color: activeId === v.id ? G.white : G.silver,
              fontFamily: "monospace",
              textAlign: "center",
              transition: "color 0.2s ease",
            }}>
              {v.designation}
            </div>
          ))}
        </div>

        {/* Spec rows */}
        {SPEC_ROWS.map((row, ri) => (
          <div
            key={row.key}
            style={{
              display: "grid",
              gridTemplateColumns: "120px repeat(3, 1fr)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: ri % 2 === 0 ? "rgba(28,28,30,0.40)" : "transparent",
            }}
          >
            <div style={{
              padding: "0.65rem 0.5rem 0.65rem 0",
              fontFamily: "monospace", fontSize: "0.38rem",
              color: G.iron, letterSpacing: "0.16em",
            }}>
              {row.label}
            </div>
            {FLEET.map(v => (
              <div key={v.id} style={{
                padding: "0.65rem 0.75rem",
                fontSize: "0.60rem", color: G.chrome,
                textAlign: "center",
                background: activeId === v.id ? "rgba(44,44,46,0.55)" : "transparent",
                transition: "background 0.25s ease",
              }}>
                {row.key === "capacity"
                  ? `${v[row.key]} passengers`
                  : String(v[row.key])}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Active vehicle description */}
      <div style={{ padding: "1.5rem" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              padding: "1.25rem 1.5rem",
              background: G.gunmetal,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{
              fontFamily: "monospace", fontSize: "0.38rem",
              color: G.ice, letterSpacing: "0.20em", marginBottom: "0.6rem",
            }}>
              {active.designation} — {active.type.toUpperCase()}
            </div>
            <p style={{ color: G.chrome, fontSize: "0.80rem", lineHeight: 1.70, margin: 0 }}>
              {active.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ padding: "2rem 1.5rem 3rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p style={{ color: G.iron, fontSize: "0.42rem", letterSpacing: "0.14em", margin: 0 }}>
          AURORA IS A CONCEPT SHOWCASE — ALL VEHICLES ARE FICTIONAL · NORVO.DESIGN
        </p>
      </div>
    </motion.div>
  );
}
