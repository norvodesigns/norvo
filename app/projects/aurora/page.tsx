"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { DestinationId, NavState } from "./types";
import { DESTINATIONS } from "./data";
import InfoPanel from "./components/InfoPanel";
import ReturnButton from "./components/ReturnButton";
import AuroraCursor from "./cursor/AuroraCursor";

const CosmicMap = dynamic(() => import("./webgl/CosmicMap"), { ssr: false });

// ─── Warp exit canvas ─────────────────────────────────────────────────────────

function WarpOverlay({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const maxR = Math.hypot(cx, cy) * 1.15;

    const streaks = Array.from({ length: 220 }, (_, i) => ({
      angle: (i / 220) * Math.PI * 2 + (Math.sin(i * 0.4) * 0.06),
      width: 0.4 + (((i * 7 + 3) % 10) / 10) * 1.8,
      blue: i % 3 === 0,
    }));

    const start = performance.now();
    const duration = 1700;

    const frame = (now: number) => {
      const p = Math.min((now - start) / duration, 1.0);
      const stretch = Math.pow(p, 1.8);

      ctx.fillStyle = `rgba(3,5,7,${Math.min(p * 5, 1)})`;
      ctx.fillRect(0, 0, w, h);

      streaks.forEach(s => {
        const sr = stretch * maxR * 0.03;
        const er = stretch * maxR * 1.12 * (0.85 + 0.15 * Math.sin(s.angle * 3));
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(s.angle) * sr, cy + Math.sin(s.angle) * sr);
        ctx.lineTo(cx + Math.cos(s.angle) * er, cy + Math.sin(s.angle) * er);
        const a = Math.min(p * 2.8, 1.0) * 0.75;
        ctx.strokeStyle = s.blue
          ? `rgba(166,200,255,${a})`
          : `rgba(232,237,245,${a * 0.65})`;
        ctx.lineWidth = s.width;
        ctx.stroke();
      });

      // Bright central core
      if (p > 0.3) {
        const coreA = Math.min((p - 0.3) / 0.4, 1.0);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.4);
        grad.addColorStop(0, `rgba(200,215,255,${coreA * 0.55})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // White flash
      if (p > 0.78) {
        const flash = (p - 0.78) / 0.22;
        ctx.fillStyle = `rgba(255,255,255,${flash * flash * 0.95})`;
        ctx.fillRect(0, 0, w, h);
      }

      if (p < 1.0) {
        requestAnimationFrame(frame);
      } else {
        onComplete();
      }
    };
    requestAnimationFrame(frame);
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0,
        zIndex: 9000, pointerEvents: "none",
      }}
    />
  );
}

// ─── Coordinate HUD ───────────────────────────────────────────────────────────

function CoordHud() {
  const [coords, setCoords] = useState({ ra: "00h 00m 00s", dec: "+00° 00′ 00″" });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const ra_h  = Math.floor((e.clientX / window.innerWidth) * 24);
      const ra_m  = Math.floor(((e.clientX / window.innerWidth) * 24 * 60) % 60);
      const ra_s  = Math.floor(((e.clientX / window.innerWidth) * 24 * 3600) % 60);
      const dec_d = Math.floor((1 - e.clientY / window.innerHeight) * 180 - 90);
      const dec_m = Math.floor(Math.abs(((1 - e.clientY / window.innerHeight) * 180 - 90) * 60) % 60);
      setCoords({
        ra:  `${String(ra_h).padStart(2,"0")}h ${String(ra_m).padStart(2,"0")}m ${String(ra_s).padStart(2,"0")}s`,
        dec: `${dec_d >= 0 ? "+" : ""}${String(dec_d).padStart(2,"0")}° ${String(dec_m).padStart(2,"0")}′ 00″`,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: 20, left: 20,
      zIndex: 400, pointerEvents: "none",
      fontFamily: "monospace",
      fontSize: "0.44rem",
      letterSpacing: "0.14em",
      color: "rgba(169,179,196,0.45)",
      lineHeight: 1.7,
    }}>
      <div>RA  {coords.ra}</div>
      <div>DEC {coords.dec}</div>
      <div style={{ marginTop: 4, color: "rgba(169,179,196,0.28)" }}>
        AURORA NAV · AV.2031
      </div>
    </div>
  );
}

// ─── Planet labels (HTML overlay) ─────────────────────────────────────────────

function PlanetLabels({
  destinations,
  hoveredId,
  viewingId,
  screenPosRef,
  navPhase,
}: {
  destinations: typeof DESTINATIONS;
  hoveredId: DestinationId | null;
  viewingId: DestinationId | null;
  screenPosRef: React.RefObject<Record<string, { x: number; y: number }>>;
  navPhase: string;
}) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    let rafId: number;
    let last = "";
    const loop = () => {
      const snap = JSON.stringify(screenPosRef.current);
      if (snap !== last) { last = snap; setPositions({ ...screenPosRef.current }); }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [screenPosRef]);

  if (navPhase === "viewing") return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}>
      {destinations.map(d => {
        const p = positions[d.id];
        if (!p) return null;
        const active = hoveredId === d.id || viewingId === d.id;
        return (
          <div
            key={d.id}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              transform: "translate(calc(-50% + 48px), -50%)",
              pointerEvents: "none",
              opacity: navPhase === "flying" ? 0 : 1,
              transition: "opacity 0.4s ease",
            }}
          >
            {/* Name */}
            <div style={{
              fontFamily: "monospace",
              fontSize: "0.50rem",
              letterSpacing: "0.20em",
              color: active ? "#E8EDF5" : "rgba(169,179,196,0.55)",
              whiteSpace: "nowrap",
              transition: "color 0.2s",
              textShadow: "0 1px 8px rgba(0,0,0,0.8)",
            }}>
              {d.name.toUpperCase()}
            </div>
            {/* Designation */}
            <div style={{
              fontFamily: "monospace",
              fontSize: "0.38rem",
              letterSpacing: "0.16em",
              color: active ? "rgba(166,200,255,0.7)" : "rgba(169,179,196,0.28)",
              whiteSpace: "nowrap",
              marginTop: 1,
              transition: "color 0.2s",
            }}>
              {d.designation}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuroraPage() {
  const router = useRouter();
  const [navState, setNavState] = useState<NavState>({ phase: "map", targetId: null });
  const [isExiting, setIsExiting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredId, setHoveredId] = useState<DestinationId | null>(null);
  const screenPosRef = useRef<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  const handleSelect = useCallback((id: DestinationId) => {
    setNavState({ phase: "flying", targetId: id });
  }, []);

  const handleFlyComplete = useCallback(() => {
    setNavState(s => ({ ...s, phase: "viewing" }));
  }, []);

  const handleClose = useCallback(() => {
    setNavState({ phase: "map", targetId: null });
  }, []);

  const handleReturn = useCallback(() => {
    setIsExiting(true);
  }, []);

  const handleWarpComplete = useCallback(() => {
    router.push("/projects");
  }, [router]);

  const viewing = navState.phase === "viewing" ? navState.targetId : null;
  const flying  = navState.phase === "flying"  ? navState.targetId : null;
  const viewingDest = viewing ? DESTINATIONS.find(d => d.id === viewing) ?? null : null;

  return (
    <div style={{
      position: "fixed", inset: "6px",
      zIndex: 500,
      background: "#030507",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.9)",
    }}>
      {/* Star map — full canvas */}
      <CosmicMap
        destinations={DESTINATIONS}
        flyToId={flying ?? viewing}
        viewingId={viewing}
        onSelect={handleSelect}
        onHover={setHoveredId}
        onFlyComplete={handleFlyComplete}
        screenPosRef={screenPosRef}
      />

      {/* Planet name labels */}
      <PlanetLabels
        destinations={DESTINATIONS}
        hoveredId={hoveredId}
        viewingId={viewing}
        screenPosRef={screenPosRef}
        navPhase={navState.phase}
      />

      {/* Info panel */}
      <InfoPanel
        destination={viewingDest}
        isMobile={isMobile}
        onClose={handleClose}
      />

      {/* Return button */}
      <ReturnButton onClick={handleReturn} />

      {/* Coordinate HUD — desktop only */}
      {!isMobile && <CoordHud />}

      {/* Custom cursor — desktop only */}
      {!isMobile && <AuroraCursor />}

      {/* Warp exit overlay */}
      {isExiting && <WarpOverlay onComplete={handleWarpComplete} />}
    </div>
  );
}
