"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, useSpring } from "motion/react";

export function useAuroraScroll(containerRef: RefObject<HTMLDivElement | null>) {
  const scrollY = useMotionValue(0);
  const scrollYSmooth = useSpring(scrollY, { stiffness: 80, damping: 18, mass: 0.6 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => scrollY.set(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef, scrollY]);

  return { scrollY, scrollYSmooth };
}
