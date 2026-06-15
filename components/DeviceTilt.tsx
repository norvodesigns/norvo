"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useMotionValue, type MotionValue } from "motion/react";

/* ──────────────────────────────────────────────────────────────────────────
   Device tilt provider

   Exposes a normalised −1…+1 tilt vector driven by the phone's gyroscope so
   that, on touch devices, tilting the phone drives the same parallax/tilt that
   the cursor drives on desktop. iOS 13+ gates DeviceOrientation behind an
   explicit user-gesture permission request, so we surface a small popup with a
   button that calls requestPermission().
   ──────────────────────────────────────────────────────────────────────── */

type TiltContextValue = {
  /** −1 (tilt left)  … +1 (tilt right) */
  tiltX: MotionValue<number>;
  /** −1 (tilt back/up) … +1 (tilt forward/down) */
  tiltY: MotionValue<number>;
  /** true once permission is granted and we're listening */
  enabled: boolean;
  /** true while the opt-in popup is on screen (consumers can yield space) */
  promptVisible: boolean;
};

const DeviceTiltContext = createContext<TiltContextValue | null>(null);

/** Consume the shared gyroscope tilt. Returns null when no provider is mounted. */
export function useDeviceTilt() {
  return useContext(DeviceTiltContext);
}

// iOS exposes requestPermission() as a static on DeviceOrientationEvent; it is
// absent from the DOM lib types, so describe just what we touch.
type OrientationPermission = "granted" | "denied" | "default";
interface DeviceOrientationEventStatic {
  requestPermission?: () => Promise<OrientationPermission>;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// How many degrees of tilt (from the angle you were holding the phone at when
// you enabled it) maps to the full −1…+1 range.
const TILT_RANGE_DEG = 16;
// Light low-pass on raw sensor data; the per-section springs do the rest.
const SMOOTH = 0.2;

const STORAGE_KEY = "norvo:tilt";

const readPref = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
const writePref = (v: "on" | "off") => {
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* storage blocked — ignore */
  }
};

export function DeviceTiltProvider({ children }: { children: React.ReactNode }) {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const [enabled, setEnabled] = useState(false);
  // "hidden" until we know the device supports it; "prompt" shows the popup.
  const [phase, setPhase] = useState<"hidden" | "prompt">("hidden");

  // Baseline orientation captured on the first reading == neutral position.
  const baseRef = useRef<{ beta: number; gamma: number } | null>(null);

  // The gyro listener — React owns its lifecycle so it is always torn down on
  // unmount (e.g. client-side navigation away from the homepage) and never
  // double-attached. Only runs once `enabled` flips true.
  useEffect(() => {
    if (!enabled) return;
    baseRef.current = null; // re-baseline at the start of each listen session

    const handle = (e: DeviceOrientationEvent) => {
      const { beta, gamma } = e;
      if (beta == null || gamma == null) return;

      if (!baseRef.current) baseRef.current = { beta, gamma };
      const dx = gamma - baseRef.current.gamma; // left/right
      const dy = beta - baseRef.current.beta; // front/back

      // Re-orient the axes for landscape so "tilt right" always means right.
      const angle =
        (typeof screen !== "undefined" && screen.orientation?.angle) || 0;
      let nx = dx;
      let ny = dy;
      if (angle === 90) {
        nx = dy;
        ny = -dx;
      } else if (angle === 270) {
        nx = -dy;
        ny = dx;
      } else if (angle === 180) {
        nx = -dx;
        ny = -dy;
      }

      const targetX = clamp(nx / TILT_RANGE_DEG, -1, 1);
      const targetY = clamp(ny / TILT_RANGE_DEG, -1, 1);
      tiltX.set(lerp(tiltX.get(), targetX, SMOOTH));
      tiltY.set(lerp(tiltY.get(), targetY, SMOOTH));
    };

    window.addEventListener("deviceorientation", handle, true);
    return () => window.removeEventListener("deviceorientation", handle, true);
  }, [enabled, tiltX, tiltY]);

  // Decide whether to offer the popup. Touch device + orientation support only.
  useEffect(() => {
    const isTouch =
      window.matchMedia?.("(pointer: coarse)").matches ?? "ontouchstart" in window;
    const hasOrientation = "DeviceOrientationEvent" in window;
    if (!isTouch || !hasOrientation) return;

    const DOE = window.DeviceOrientationEvent as unknown as DeviceOrientationEventStatic;
    const needsGesture = typeof DOE.requestPermission === "function";

    const saved = readPref();
    if (saved === "off") return;
    // Previously granted with no gesture required (Android): just start
    // listening. iOS always needs a fresh gesture, so fall through to the prompt.
    if (saved === "on" && !needsGesture) {
      setEnabled(true);
      return;
    }
    setPhase("prompt");
  }, []);

  const enable = async () => {
    try {
      const DOE = window.DeviceOrientationEvent as unknown as DeviceOrientationEventStatic;
      if (typeof DOE.requestPermission === "function") {
        // Called synchronously from the button gesture — required by iOS.
        const res = await DOE.requestPermission();
        if (res !== "granted") {
          writePref("off");
          setPhase("hidden");
          return;
        }
      }
      writePref("on");
      setPhase("hidden");
      setEnabled(true);
    } catch {
      setPhase("hidden");
    }
  };

  const dismiss = () => {
    writePref("off");
    setPhase("hidden");
  };

  const value = useMemo<TiltContextValue>(
    () => ({ tiltX, tiltY, enabled, promptVisible: phase === "prompt" }),
    [tiltX, tiltY, enabled, phase],
  );

  return (
    <DeviceTiltContext.Provider value={value}>
      {children}
      <TiltPrompt show={phase === "prompt"} onEnable={enable} onDismiss={dismiss} />
    </DeviceTiltContext.Provider>
  );
}

/* ── The opt-in popup (mobile only) ───────────────────────────────────────── */

function TiltPrompt({
  show,
  onEnable,
  onDismiss,
}: {
  show: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          // z-30 keeps it above page content but below the mobile menu (z-40)
          // and the floating hamburger (z-50), so an open menu cleanly covers it.
          className="fixed inset-x-0 z-30 flex justify-center px-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
        >
          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-[#D9A441]/30 bg-[#061212]/85 px-4 py-3 text-white shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0D7A7A] to-[#1A9494]"
            >
              {/* tilting-phone glyph */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="-rotate-12"
              >
                <rect
                  x="7"
                  y="3"
                  width="10"
                  height="18"
                  rx="2.2"
                  stroke="white"
                  strokeWidth="1.6"
                />
                <path
                  d="M3 9c-.5 1.6-.5 3.4 0 5M21 9c.5 1.6.5 3.4 0 5"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </svg>
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-tight">Tilt to explore</p>
              <p className="text-[11px] leading-snug text-white/55">
                Move your phone to steer the 3D scene.
              </p>
            </div>

            <button
              onClick={onEnable}
              className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#061212] transition-opacity active:opacity-80"
            >
              Enable
            </button>
            <button
              onClick={onDismiss}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 text-white/40 transition-colors active:text-white/70"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
