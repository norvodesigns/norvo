"use client";

// TEMPORARY diagnostic. Visible only at ?debug=1 — invisible to normal visitors.
// Draws reference lines and prints the device's real safe-area / viewport values
// so we can see exactly how iOS 27 beta places top:0 vs the Dynamic Island.
// Remove this component (and its use in app/layout.tsx) once the nav is fixed.

import { useEffect, useRef, useState } from "react";

type Readings = {
  insetTop: string;
  insetBottom: string;
  insetLeft: string;
  insetRight: string;
  innerH: number;
  clientH: number;
  screenH: number;
  vvHeight: number | null;
  vvOffsetTop: number | null;
  vvScale: number | null;
  navTop: number | null;
  scrollY: number;
};

const line = (top: string, color: string, label: string): React.CSSProperties => ({
  position: "fixed",
  left: 0,
  right: 0,
  top,
  height: 2,
  background: color,
  zIndex: 2147483647,
  pointerEvents: "none",
  // label is encoded via box-shadow-free approach; we render text separately
});

export default function SafeAreaDebug() {
  const probe = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [r, setR] = useState<Readings | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") !== "1") return;
    setOn(true);

    const read = () => {
      const cs = probe.current ? getComputedStyle(probe.current) : null;
      const vv = window.visualViewport;
      const nav = document.querySelector("header");
      setR({
        insetTop: cs?.paddingTop ?? "?",
        insetBottom: cs?.paddingBottom ?? "?",
        insetLeft: cs?.paddingLeft ?? "?",
        insetRight: cs?.paddingRight ?? "?",
        innerH: window.innerHeight,
        clientH: document.documentElement.clientHeight,
        screenH: window.screen.height,
        vvHeight: vv ? Math.round(vv.height) : null,
        vvOffsetTop: vv ? Math.round(vv.offsetTop) : null,
        vvScale: vv ? vv.scale : null,
        navTop: nav ? Math.round(nav.getBoundingClientRect().top) : null,
        scrollY: Math.round(window.scrollY),
      });
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    window.visualViewport?.addEventListener("resize", read);
    window.visualViewport?.addEventListener("scroll", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("scroll", read);
    };
  }, []);

  if (!on) return null;

  return (
    <>
      {/* probe: env() paddings resolve to px so we can read them back */}
      <div
        ref={probe}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      />

      {/* BLUE line at top:0 — where the browser places a fixed top:0 element */}
      <div aria-hidden style={line("0px", "#2979ff", "top:0")} />
      {/* RED line at env(safe-area-inset-top) — where it thinks the safe area ends */}
      <div aria-hidden style={line("env(safe-area-inset-top)", "#ff1744", "safe-top")} />
      {/* GREEN translucent fill from -120px to top:0 — should sit ABOVE top:0 */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: -120,
          height: 120,
          background: "rgba(0,200,83,0.35)",
          zIndex: 2147483646,
          pointerEvents: "none",
        }}
      />

      {/* readout */}
      <div
        style={{
          position: "fixed",
          left: 8,
          bottom: 8,
          zIndex: 2147483647,
          background: "rgba(0,0,0,0.85)",
          color: "#0f0",
          font: "11px/1.45 ui-monospace, Menlo, monospace",
          padding: "8px 10px",
          borderRadius: 8,
          pointerEvents: "none",
          maxWidth: "94vw",
          whiteSpace: "pre",
        }}
      >
        {r
          ? [
              "BLUE = top:0   RED = safe-top",
              "GREEN = area above top:0",
              `inset T/B: ${r.insetTop} / ${r.insetBottom}`,
              `inset L/R: ${r.insetLeft} / ${r.insetRight}`,
              `<header> top:0 lands at y=${r.navTop}px`,
              `window.innerH = ${r.innerH}`,
              `doc.clientH  = ${r.clientH}`,
              `screen.H     = ${r.screenH}`,
              `visualVP h / offsetTop = ${r.vvHeight} / ${r.vvOffsetTop}`,
              `vv.scale = ${r.vvScale}`,
              `scrollY = ${r.scrollY}`,
            ].join("\n")
          : "measuring…"}
      </div>
    </>
  );
}
