"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { MotionValue, useTransform, useReducedMotion } from "motion/react";
import { BEATS } from "@/lib/timeline";
import { useBind } from "./useBind";

// The photoreal cinematic backdrop — SCROLL-SCRUBBED on every platform: scroll
// position drives each clip's currentTime (destination-driven, minimum-speed
// follower), so the camera moves with you and holds when you stop.
//
// iOS NOTE: two things must be true for the scrub to work on iOS, and both are
// handled here + in page.tsx:
//   1. Continuous scroll signal. iOS Safari freezes the main thread during a
//      NATIVE touch-drag + momentum, so this rAF loop can't run mid-gesture. Lenis
//      `syncTouch` (page.tsx) drives touch in JS instead, keeping the loop and the
//      scroll value live every frame — without it the clip only jumped to its final
//      frame after the finger lifted.
//   2. A decoded, seekable <video>. iOS won't render a scrubbed clip until it has
//      played once inside a user gesture, so we prime all three (play→pause) on the
//      first touch/click — that forces the decode and unlocks currentTime rendering.
// Together the scrub works on iOS exactly as it does on desktop Safari and Chrome.
// muted + playsInline keep the priming legal inline on iOS.

interface Props {
  progress: MotionValue<number>;
  lenis?: React.RefObject<Lenis | null>;
}

const [wStart, wEnd] = BEATS.warp;
const [obsStart] = BEATS.observatory;
const NEB_IN = 0.4;
const NEB_OUT = wStart + 0.015;
const HALL_SETTLE = obsStart + 0.15;

export default function MediaBackdrop({ progress, lenis }: Props) {
  const reduce = useReducedMotion();
  const nebula = useRef<HTMLVideoElement>(null);
  const warp = useRef<HTMLVideoElement>(null);
  const hall = useRef<HTMLVideoElement>(null);
  const warpWrap = useRef<HTMLDivElement>(null);
  const hallWrap = useRef<HTMLDivElement>(null);

  // Cross-dissolves (opacity only — plain DOM, never WAAPI).
  const warpO = useTransform(progress, [wStart - 0.01, wStart + 0.03, wEnd - 0.005, wEnd + 0.02], [0, 1, 1, 0]);
  const hallO = useTransform(progress, [wEnd - 0.02, wEnd + 0.02], [0, 1]);
  useBind(warpWrap, { opacity: warpO });
  useBind(hallWrap, { opacity: hallO });

  useEffect(() => {
    if (reduce) {
      let raf = 0;
      const hold = () => {
        const ok = still(nebula.current, 4) && still(warp.current, 3.6) && still(hall.current, 1.6);
        if (!ok) raf = requestAnimationFrame(hold);
      };
      raf = requestAnimationFrame(hold);
      return () => cancelAnimationFrame(raf);
    }

    // Prime for iOS — force the decode + unlock currentTime rendering on the
    // first user gesture (anywhere). Harmless on desktop. The clips are muted and
    // either covered or at opacity 0, so the brief play→pause is never seen.
    const els = [nebula.current, warp.current, hall.current];
    const primed = new WeakSet<HTMLVideoElement>();
    const prime = () => {
      els.forEach((el) => {
        if (!el || primed.has(el)) return;
        const p = el.play();
        if (p && typeof p.then === "function") {
          p.then(() => {
            el.pause();
            primed.add(el);
          }).catch(() => {
            /* not buffered yet — a later gesture re-tries this clip */
          });
        } else {
          el.pause();
          primed.add(el);
        }
      });
      // Re-armed on every gesture (NOT once): if a clip wasn't buffered on the
      // first touch — e.g. warp.mp4 (14MB) on cellular — it still gets primed on a
      // later one, so it can't get stuck showing only its poster. Detach once all
      // three have actually decoded to a seekable frame.
      if (els.every((el) => !el || (primed.has(el) && el.readyState >= 2))) {
        window.removeEventListener("touchstart", prime);
        window.removeEventListener("pointerdown", prime);
      }
    };
    window.addEventListener("touchstart", prime, { passive: true });
    window.addEventListener("pointerdown", prime);

    // Scroll-scrub — destination-driven, minimum-speed follower. The destination
    // (Lenis targetScroll) snaps to its final value the instant you stop, so the
    // playhead always advances ≥~1 frame/tick (no decel creep), then lands.
    const cur: Record<string, number> = { nebula: 0, warp: 0, hall: 0 };
    let raf = 0;
    const frac = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
    const drive = (el: HTMLVideoElement | null, key: string, f: number, span: number, dtScale: number) => {
      if (!el || el.readyState < 2 || !isFinite(el.duration)) return;
      const target = f * el.duration * span;
      const d = target - cur[key];
      const ad = Math.abs(d);
      // The follower step is scaled by the real frame delta so the playhead chases
      // at the same wall-clock speed regardless of refresh rate. dtScale === 1 at
      // 60Hz (desktop is unchanged); on a 120Hz ProMotion iPhone an unscaled fixed
      // step would advance ~2× too fast.
      cur[key] = ad < 0.035 ? target : cur[key] + Math.sign(d) * Math.max(ad * 0.3, 0.045) * dtScale;
      if (Math.abs(el.currentTime - cur[key]) > 0.01) {
        try {
          el.currentTime = cur[key];
        } catch {
          /* not seekable yet */
        }
      }
    };
    let prev = 0;
    const loop = (t: number) => {
      // Normalize to a 60Hz frame; cap at 2 so a long stalled frame (tab refocus)
      // can't lurch the playhead.
      const dtScale = prev ? Math.min(2, (t - prev) / 16.667) : 1;
      prev = t;
      const l = lenis?.current;
      const v = l && l.limit > 0 ? l.targetScroll / l.limit : progress.get();
      drive(nebula.current, "nebula", frac(v, NEB_IN, NEB_OUT), 1, dtScale);
      drive(warp.current, "warp", frac(v, wStart, wEnd), 1, dtScale);
      drive(hall.current, "hall", frac(v, obsStart, HALL_SETTLE), 0.92, dtScale);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("touchstart", prime);
      window.removeEventListener("pointerdown", prime);
    };
  }, [reduce, progress, lenis]);

  const cover = "absolute inset-0 h-full w-full object-cover";
  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#14161A]">
      <video ref={nebula} className={cover} src="/media/era4.mp4?v=6" poster="/media/era4_poster.jpg?v=6" muted playsInline preload="auto" />
      <div ref={warpWrap} className="absolute inset-0" style={{ opacity: 0 }}>
        <video ref={warp} className={cover} src="/media/warp.mp4?v=6" poster="/media/warp_poster.jpg?v=6" muted playsInline preload="auto" />
      </div>
      <div ref={hallWrap} className="absolute inset-0" style={{ opacity: 0 }}>
        <video ref={hall} className={cover} src="/media/observatory.mp4?v=6" poster="/media/observatory_poster.jpg?v=6" muted playsInline preload="auto" />
      </div>
    </div>
  );
}

// Reduced motion: hold a representative still.
function still(el: HTMLVideoElement | null, t: number) {
  if (!el) return true;
  if (el.readyState < 1) return false;
  if (Math.abs(el.currentTime - t) > 0.05) {
    try {
      el.currentTime = t;
    } catch {
      return false;
    }
  }
  return true;
}
