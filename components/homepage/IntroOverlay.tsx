"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MotionValue, useTransform, useReducedMotion } from "motion/react";
import { useBind } from "./useBind";

// File 02 — The Threshold. The hush at the doorway: a dark room powering on,
// naming itself, then handing the visitor control. Three calm typed sentences;
// when they finish, an animated "begin scrolling" cue.
//
// The Threshold is the journey's permanent FIRST SCREEN: it stays mounted and
// its opacity follows scroll, so it fades out as you descend into the archive
// and returns when you scroll back to the very top — no reload required.

const LINES = [
  "The web began as information.",
  "You are about to travel through everything it became.",
  "Norvo designs the future of the web.",
];

const CHAR_MS = 42;
const LINE_HOLD_MS = 850;
const OPENING_PAUSE_MS = 1500;
const FINAL_HOLD_MS = 1200;

interface Props {
  progress: MotionValue<number>;
  onComplete: () => void;
}

export default function IntroOverlay({ progress, onComplete }: Props) {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState<string[]>(["", "", ""]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [begun, setBegun] = useState(false);

  const skipRef = useRef(false);
  const begunRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll-linked visibility — full at the top, gone by the time Record 001 is in
  // view. While the intro lock holds the scroll at 0, this stays at 1.
  const fade = useTransform(progress, [0, 0.03], [1, 0]);
  useBind(rootRef, { opacity: fade });

  const fastForward = useCallback(() => {
    skipRef.current = true;
  }, []);

  // Begin = unlock the scroll. The Threshold then simply follows the scroll
  // (fading as you descend), so it remains reachable forever after.
  const begin = useCallback(() => {
    if (begunRef.current) return;
    begunRef.current = true;
    setBegun(true);
    onComplete();
  }, [onComplete]);

  // Typing schedule — self-scheduling so an early scroll/tap can collapse it.
  useEffect(() => {
    if (reduce) {
      setTyped([...LINES]);
      setActive(LINES.length);
      const t = window.setTimeout(() => setReady(true), 400);
      return () => window.clearTimeout(t);
    }
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => timers.push(window.setTimeout(res, ms)));
    (async () => {
      await wait(OPENING_PAUSE_MS);
      for (let li = 0; li < LINES.length; li++) {
        if (cancelled) return;
        setActive(li);
        const text = LINES[li];
        for (let c = 1; c <= text.length; c++) {
          if (cancelled) return;
          if (skipRef.current) break;
          setTyped((p) => {
            const n = [...p];
            n[li] = text.slice(0, c);
            return n;
          });
          await wait(CHAR_MS);
        }
        setTyped((p) => {
          const n = [...p];
          n[li] = text;
          return n;
        });
        if (!skipRef.current) await wait(LINE_HOLD_MS);
      }
      if (cancelled) return;
      setActive(LINES.length);
      if (!skipRef.current) await wait(FINAL_HOLD_MS);
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [reduce]);

  // Input: before ready → fast-forward the typing; once ready → begin. Listeners
  // detach the moment we've begun (further scrolling just drives the journey).
  useEffect(() => {
    if (begun) return;
    const onForward = (e: Event) => {
      if (e.type === "click" && (e.target as HTMLElement)?.closest("a,button")) return;
      if (ready) begin();
      else fastForward();
    };
    const onKey = (ev: KeyboardEvent) => {
      if (["ArrowDown", " ", "Enter", "PageDown"].includes(ev.key)) onForward(ev);
    };
    window.addEventListener("wheel", onForward, { passive: true });
    window.addEventListener("touchstart", onForward, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onForward);
      window.removeEventListener("touchstart", onForward);
      window.removeEventListener("keydown", onKey);
    };
  }, [ready, begun, begin, fastForward]);

  const allTyped = active >= LINES.length;

  return (
    <div
      ref={rootRef}
      aria-label="Norvo — the threshold"
      className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-center px-8 sm:px-[8vw]"
      style={{ backgroundColor: "#14161A" }}
    >
      {/* The Threshold film — a dark chamber powering on; a graphite veil keeps
          the typed words legible. */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src="/media/threshold.mp4?v=3"
        poster="/media/threshold_poster.jpg?v=3"
        autoPlay={!reduce}
        loop
        muted
        playsInline
        style={{ opacity: 0.85 }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(15,16,20,0.82) 0%, rgba(15,16,20,0.6) 38%, rgba(15,16,20,0.32) 70%, rgba(15,16,20,0.2) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[45%]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% -20%, rgba(244,245,247,0.06), transparent 70%)",
        }}
      />

      {/* The typed column */}
      <div
        className="relative max-w-[42ch] font-mono text-[1.05rem] leading-[2.1] sm:text-[1.25rem]"
        style={{ color: "#F4F5F7", textShadow: "0 1px 24px rgba(0,0,0,0.85)" }}
      >
        {LINES.map((line, i) => {
          const isActiveLine = i === active && !allTyped;
          const showCursor =
            !reduce && (isActiveLine || (allTyped && i === LINES.length - 1 && !ready));
          return (
            <div key={i} className="min-h-[2.1em]">
              <span>{reduce ? line : typed[i]}</span>
              {showCursor && <BlockCursor />}
            </div>
          );
        })}
      </div>

      {/* The forward cue — an animated arrow inviting the descent */}
      {ready && (
        <div className="norvo-anim-revealup absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-2.5">
          <span className="text-[0.62rem] uppercase tracking-[0.42em] text-[var(--archive-white)]/55">
            Begin scrolling
          </span>
          <svg
            className="norvo-anim-scrollcue h-5 w-5"
            style={{ color: "var(--norvo-violet)" }}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

function BlockCursor() {
  return (
    <span
      aria-hidden
      className="norvo-anim-cursor ml-[0.06em] inline-block translate-y-[0.12em]"
      style={{ width: "0.62em", height: "1.05em", background: "currentColor" }}
    />
  );
}
