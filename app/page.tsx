"use client";

import { useRef, useState, useEffect } from "react";
import Lenis from "lenis";
import { useScroll, useTransform } from "motion/react";
import { SCROLL_VH } from "@/lib/timeline";
import { useBind } from "@/components/homepage/useBind";

import IntroOverlay from "@/components/homepage/IntroOverlay";
import Era01 from "@/components/homepage/Era01";
import Era02 from "@/components/homepage/Era02";
import Era03 from "@/components/homepage/Era03";
import Era04 from "@/components/homepage/Era04";
import EndState from "@/components/homepage/EndState";
import HomepageNav from "@/components/homepage/HomepageNav";
import MediaBackdrop from "@/components/homepage/MediaBackdrop";
import ArchiveFrame from "@/components/homepage/ArchiveFrame";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const archiveEnvRef = useRef<HTMLDivElement>(null);

  const lenisRef = useRef<Lenis | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth scroll — replaces the OS's inertial momentum (which was stuttering as
  // it decayed) with a controlled lerp. The whole journey, including the video
  // scrub, reads from this smoothed scroll, so motion is uniformly buttery.
  // Smooth on wheel/trackpad AND touch: syncTouch drives the scroll in JS on
  // mobile too, which is what makes the video scrub scroll-linked there (see below).
  useEffect(() => {
    // The Ascent is a fixed journey that must always begin at the Threshold.
    // Disable the browser's scroll restoration and force the top, or a reload
    // from deep in the page lands mid-journey (it restores scrollY to the old
    // position, so scrollYProgress reads ~1 and skips straight to the Observatory).
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    // syncTouch is the key to the mobile video scrub. iOS Safari freezes the main
    // thread — requestAnimationFrame AND scroll events — for the whole duration of
    // a native touch-drag and its momentum, so a scroll-linked rAF loop (the video
    // scrubber in MediaBackdrop) can't run mid-gesture; the clip only jumped to its
    // final frame once the finger lifted. syncTouch makes Lenis own touch scrolling
    // in JS (intercept touchmove → scrollTo), so scroll advances continuously, the
    // rAF loop fires every frame, and the playhead tracks the finger in lockstep —
    // the same scroll-linked scrub the wheel already gets on desktop. This path is
    // plain scroll/transform, never WAAPI, so it's unaffected by the WebKit crash.
    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      syncTouch: true,
      syncTouchLerp: 0.08, // lower than the 0.1 we had → a longer, smoother glide-to-rest after a flick (momentum feel)
      touchMultiplier: 1.1, // finger-travel → scroll ratio; nudged above 1:1 to offset the lack of native touch acceleration
      touchInertiaExponent: 1.8, // how far a flick coasts. Higher = more momentum. Kept a touch under the 1.9–2.0 range so a
      // hard flick doesn't throw the scrubbed video too far ahead of the eras (which ride the smoothed scroll) before it catches up
    });
    lenisRef.current = lenis;
    lenis.scrollTo(0, { immediate: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lock scroll until the Threshold hands over control (via Lenis, not a raw
  // overflow toggle, so the two never fight).
  useEffect(() => {
    const lenis = lenisRef.current;
    if (introComplete) lenis?.start();
    else lenis?.stop();
  }, [introComplete]);

  // The eras now live inside the dark NORVO Data Archive — a deep Graphite field
  // throughout Records 1–3, which lifts away entering Experiences to reveal the
  // photoreal cinematic backdrop (nebula → warp → Observatory).
  const bgOpacity = useTransform(scrollYProgress, [0.39, 0.46], [1, 0]);
  useBind(bgRef, { opacity: bgOpacity });
  // The archive environment — a faint engineered grid, present while you browse
  // the records, fading as the live experience (nebula) takes over.
  const envOpacity = useTransform(scrollYProgress, [0, 0.02, 0.37, 0.43], [0, 1, 1, 0]);
  useBind(archiveEnvRef, { opacity: envOpacity });

  return (
    <>
      <IntroOverlay progress={scrollYProgress} onComplete={() => setIntroComplete(true)} />

      {/* Persistent chrome — always reachable (Usability Covenant) */}
      <HomepageNav progress={scrollYProgress} introComplete={introComplete} />

      {/* The archive HUD — year readout + timeline scrubber over Records 1–3 */}
      <ArchiveFrame progress={scrollYProgress} />

      {/* Photoreal cinematic backdrop — fixed behind everything; the paper arc
          above covers it through Documents/Pages/Interfaces, then lifts to reveal
          it from Experiences onward. */}
      <MediaBackdrop progress={scrollYProgress} lenis={lenisRef} />

      {/* Scroll driver */}
      <div ref={containerRef} style={{ height: `${SCROLL_VH}vh` }}>
        <div className="sticky top-0 z-10 h-screen w-full overflow-hidden">
          {/* The dark archive ground — lifts away to reveal the cinematic film */}
          <div ref={bgRef} className="pointer-events-none absolute inset-0 bg-[#0E1014]" />
          {/* The archive environment — faint engineered grid + a centering vignette */}
          <div
            ref={archiveEnvRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 0,
              backgroundImage:
                "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(109,93,251,0.06), transparent 70%), linear-gradient(rgba(244,245,247,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(244,245,247,0.022) 1px, transparent 1px)",
              backgroundSize: "100% 100%, 64px 64px, 64px 64px",
              maskImage: "radial-gradient(ellipse 95% 88% at 50% 50%, #000 45%, transparent 92%)",
              WebkitMaskImage: "radial-gradient(ellipse 95% 88% at 50% 50%, #000 45%, transparent 92%)",
            }}
          />

          <Era01 progress={scrollYProgress} />
          <Era02 progress={scrollYProgress} />
          <Era03 progress={scrollYProgress} />
          <Era04 progress={scrollYProgress} />
          <EndState progress={scrollYProgress} />
        </div>
      </div>
    </>
  );
}
