"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { MotionValue, useTransform, useReducedMotion } from "motion/react";
import { BEATS } from "@/lib/timeline";
import { useBind } from "./useBind";

// The photoreal cinematic backdrop (AI-generated, Veo 3.1). Three clips are
// SCROLL-SCRUBBED: scroll drives each video's currentTime, so the camera moves
// with your scroll and holds when you stop. Light (just <video>, no canvas / no
// big decoded-bitmap buffers) so it stays smooth on WebKit/Safari.
//
// THE END-OF-SCROLL STUTTER, FIXED AT THE ROOT: scrubbing a video to the
// SMOOTHED scroll position means that as Lenis eases to rest the playhead creeps
// across frame boundaries slower and slower — the picture hitches twice before
// it lands. The fix: drive currentTime from the scroll DESTINATION (Lenis's
// targetScroll, which snaps to its final value the instant you stop) and close
// the gap with a minimum-speed follower. There is always a gap to the
// destination, so the playhead always advances ≥~1 frame/tick (frames present
// steadily, never creep), then snaps the last sliver — a crisp landing, no
// double-stutter. During active scroll it tracks normally.

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

    const cur: Record<string, number> = { nebula: 0, warp: 0, hall: 0 };
    let raf = 0;
    const frac = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

    // Minimum-speed follower toward the destination frame. The min step keeps
    // the playhead advancing ≥~1 video-frame per tick (no slow creep); the snap
    // lands the last sliver instantly.
    const drive = (el: HTMLVideoElement | null, key: string, f: number, span: number) => {
      if (!el || el.readyState < 2 || !isFinite(el.duration)) return;
      const target = f * el.duration * span;
      const d = target - cur[key];
      const ad = Math.abs(d);
      cur[key] = ad < 0.035 ? target : cur[key] + Math.sign(d) * Math.max(ad * 0.3, 0.045);
      if (Math.abs(el.currentTime - cur[key]) > 0.01) {
        try {
          el.currentTime = cur[key];
        } catch {
          /* not seekable yet */
        }
      }
    };

    const loop = () => {
      const l = lenis?.current;
      // Destination progress — where the scroll is HEADED. Snaps to its final
      // value the moment you stop, so the videos settle instead of creeping.
      const v = l && l.limit > 0 ? l.targetScroll / l.limit : progress.get();
      drive(nebula.current, "nebula", frac(v, NEB_IN, NEB_OUT), 1);
      drive(warp.current, "warp", frac(v, wStart, wEnd), 1);
      drive(hall.current, "hall", frac(v, obsStart, HALL_SETTLE), 0.92);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
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

// One-shot still for reduced motion; returns true once set (or already set).
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
