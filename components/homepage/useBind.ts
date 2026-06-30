"use client";

import { useEffect, RefObject } from "react";
import type { MotionValue } from "motion/react";

// Bind MotionValues to a plain element's style by subscribing and writing
// el.style directly. This deliberately avoids motion's component layer, whose
// hardware-accelerated path calls the native Web Animations API
// (element.animate) for scroll-linked opacity/transform — which throws a
// TypeError in some WebKit builds. Plain style writes on "change" never touch
// WAAPI, so the scroll choreography is identical but bulletproof.

interface Bindings {
  opacity?: MotionValue<number>;
  x?: MotionValue<number>;
  y?: MotionValue<number>;
  scale?: MotionValue<number>;
  width?: MotionValue<string> | MotionValue<number>;
  backgroundColor?: MotionValue<string>;
  color?: MotionValue<string>;
  // a static transform prefix applied before the animated transform
  // (e.g. "translate(-50%, -50%)" for centered elements)
  baseTransform?: string;
}

export function useBind(ref: RefObject<HTMLElement | null>, b: Bindings) {
  const { opacity, x, y, scale, width, backgroundColor, color, baseTransform } = b;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const unsubs: Array<() => void> = [];
    const hasTransform = !!(x || y || scale || baseTransform);

    const applyTransform = () => {
      const tx = x?.get() ?? 0;
      const ty = y?.get() ?? 0;
      const s = scale?.get() ?? 1;
      el.style.transform = `${baseTransform ? baseTransform + " " : ""}translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
    };

    if (hasTransform) {
      applyTransform();
      [x, y, scale].forEach((mv) => mv && unsubs.push(mv.on("change", applyTransform)));
    }

    const bind = (
      mv: MotionValue<number> | MotionValue<string> | undefined,
      set: (v: number | string) => void,
    ) => {
      if (!mv) return;
      set(mv.get());
      unsubs.push(mv.on("change", set));
    };

    bind(opacity, (v) => (el.style.opacity = String(v)));
    bind(width, (v) => (el.style.width = typeof v === "number" ? `${v}px` : v));
    bind(backgroundColor, (v) => (el.style.backgroundColor = String(v)));
    bind(color, (v) => (el.style.color = String(v)));

    return () => unsubs.forEach((u) => u());
  }, [ref, opacity, x, y, scale, width, backgroundColor, color, baseTransform]);
}
