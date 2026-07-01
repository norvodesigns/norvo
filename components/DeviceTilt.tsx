"use client";

import { createContext, useContext, useMemo } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

/* ──────────────────────────────────────────────────────────────────────────
   Device tilt — RETIRED.

   The gyroscope tilt parallax and its "Tilt to explore" permission popup have
   been removed from the site entirely. There is no `deviceorientation`
   listener, no permission flow, and no popup anywhere — that banner can never
   appear again on any page.

   This module is intentionally kept as a no-op stub so the existing consumers
   (`useDeviceTilt()` in Nav, Hero, Button, the Strata prototype, etc.) keep
   compiling and running unchanged. `enabled` is permanently `false`, so every
   `if (!tilt?.enabled) return;` guard short-circuits and nothing gyro-driven
   ever runs; `tiltX`/`tiltY` are static zeroed values kept only to satisfy the
   type. Desktop pointer/cursor interactions are unaffected (they never used
   this signal).
   ──────────────────────────────────────────────────────────────────────── */

type TiltContextValue = {
  /** Always 0 — tilt is retired. */
  tiltX: MotionValue<number>;
  /** Always 0 — tilt is retired. */
  tiltY: MotionValue<number>;
  /** Always false. */
  enabled: boolean;
  /** Always false — there is no opt-in popup anymore. */
  promptVisible: boolean;
};

const DeviceTiltContext = createContext<TiltContextValue | null>(null);

/** Consume the (retired) tilt signal. Always resolves to a disabled value. */
export function useDeviceTilt() {
  return useContext(DeviceTiltContext);
}

export function DeviceTiltProvider({ children }: { children: React.ReactNode }) {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const value = useMemo<TiltContextValue>(
    () => ({ tiltX, tiltY, enabled: false, promptVisible: false }),
    [tiltX, tiltY],
  );
  return <DeviceTiltContext.Provider value={value}>{children}</DeviceTiltContext.Provider>;
}
