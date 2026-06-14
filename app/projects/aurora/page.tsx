"use client";

import { useEffect, useRef } from "react";

export default function AuroraPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: w / 2, y: h / 2 };
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("touchmove", (e) => {
      if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
    }, { passive: true });

    // Each blob tracks its own smoothed position
    type Blob = {
      baseX: number; baseY: number;
      cx: number; cy: number; // current smoothed position
      r: number;
      rgb: [number, number, number];
      phase: number; speed: number; amp: number;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const blobs: Blob[] = [
      { baseX: 0.28, baseY: 0.38, cx: 0, cy: 0, r: 0.44, rgb: [47, 107, 237],  phase: 0,   speed: 0.28, amp: 0.10 },
      { baseX: 0.72, baseY: 0.62, cx: 0, cy: 0, r: 0.48, rgb: [163, 27, 191],  phase: 1.3, speed: 0.22, amp: 0.09 },
      { baseX: 0.50, baseY: 0.25, cx: 0, cy: 0, r: 0.38, rgb: [123, 47, 247],  phase: 2.5, speed: 0.33, amp: 0.11 },
      { baseX: 0.18, baseY: 0.72, cx: 0, cy: 0, r: 0.36, rgb: [47, 107, 237],  phase: 3.7, speed: 0.26, amp: 0.08 },
      { baseX: 0.82, baseY: 0.28, cx: 0, cy: 0, r: 0.40, rgb: [163, 27, 191],  phase: 0.9, speed: 0.30, amp: 0.10 },
      { baseX: 0.50, baseY: 0.80, cx: 0, cy: 0, r: 0.37, rgb: [80, 60, 220],   phase: 1.7, speed: 0.24, amp: 0.09 },
      { baseX: 0.35, baseY: 0.60, cx: 0, cy: 0, r: 0.32, rgb: [47, 180, 220],  phase: 4.1, speed: 0.29, amp: 0.07 },
    ];

    // Init cx/cy
    blobs.forEach(b => { b.cx = b.baseX * w; b.cy = b.baseY * h; });

    let t = 0;
    let raf = 0;

    const frame = () => {
      t += 0.007;

      // Fade to background each frame (trail effect)
      ctx.fillStyle = "rgba(6,0,14,0.18)";
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((blob) => {
        // Target: organic drift
        const tx = (blob.baseX + Math.sin(t * blob.speed + blob.phase) * blob.amp) * w;
        const ty = (blob.baseY + Math.cos(t * blob.speed * 0.85 + blob.phase) * blob.amp * 0.8) * h;

        // Cursor pushes blobs away gently
        const dx = tx - mouse.x;
        const dy = ty - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pushR = Math.min(w, h) * 0.45;
        const strength = Math.max(0, 1 - dist / pushR) * 55;
        const pushX = (dx / dist) * strength;
        const pushY = (dy / dist) * strength;

        // Smooth toward target
        blob.cx = lerp(blob.cx, tx + pushX, 0.04);
        blob.cy = lerp(blob.cy, ty + pushY, 0.04);

        const radius = blob.r * Math.min(w, h) * 0.75;
        const [r, g, b] = blob.rgb;
        const grad = ctx.createRadialGradient(blob.cx, blob.cy, 0, blob.cx, blob.cy, radius);
        grad.addColorStop(0,   `rgba(${r},${g},${b},0.60)`);
        grad.addColorStop(0.45,`rgba(${r},${g},${b},0.22)`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.cx, blob.cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(frame);
    };
    // Initial clear
    ctx.fillStyle = "#06000e";
    ctx.fillRect(0, 0, w, h);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* UI overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-7 sm:p-10">
        {/* top bar */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
              Norvo — Interactive Concept
            </p>
            <h1 className="mt-0.5 font-display text-3xl font-light text-white/90 sm:text-4xl">
              Aurora
            </h1>
          </div>
          <a
            href="/projects"
            className="pointer-events-auto rounded-full border border-white/20 px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-white/45 backdrop-blur-sm transition-colors duration-300 hover:border-white/40 hover:text-white/80"
          >
            ← Projects
          </a>
        </div>

        {/* bottom info */}
        <div className="max-w-sm">
          <p className="text-sm text-white/40">Move your cursor — blobs drift away from it</p>
          <p className="mt-1 text-xs leading-relaxed text-white/20">
            A living gradient field built entirely on canvas, running at 60fps with no GPU shaders.
            Proof that a background can feel alive without slowing anything down.
          </p>
        </div>
      </div>
    </div>
  );
}