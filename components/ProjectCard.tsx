"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  useInView,
} from "motion/react";
import type { Project } from "./projectsData";
import { useDeviceTilt } from "./DeviceTilt";
export type { Project } from "./projectsData";

export function ProjectCard({ p, index = 0, noReveal = false }: { p: Project; index?: number; noReveal?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [imgError, setImgError] = useState(false);
  const reduce = useReducedMotion();
  const tilt = useDeviceTilt();
  const inView = useInView(ref);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 18 });

  // Specular glare that tracks the light (opposite the tilt)
  const glareX = useTransform(mx, (v) => `${50 - v * 130}%`);
  const glareY = useTransform(my, (v) => `${50 - v * 130}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.28), transparent 55%)`;

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  // Mobile: tilt the card with the gyroscope — only while it's on screen.
  useEffect(() => {
    if (reduce || !tilt?.enabled || !inView) return;
    const apply = () => { mx.set(tilt.tiltX.get() * 0.5); my.set(tilt.tiltY.get() * 0.5); };
    apply();
    const ux = tilt.tiltX.on("change", apply);
    const uy = tilt.tiltY.on("change", apply);
    return () => { ux(); uy(); mx.set(0); my.set(0); };
  }, [tilt, reduce, inView, mx, my]);

  const isLive = p.kind === "live";
  const shot = p.shot ?? null;
  const linkProps = isLive
    ? { href: p.url, target: "_blank", rel: "noopener noreferrer" }
    : { href: p.href };

  return (
    <motion.div
      {...(!noReveal && {
        initial: { opacity: 0, y: 64, rotateX: 9, scale: 0.94 },
        whileInView: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: (index % 2) * 0.13 },
        style: { transformPerspective: 1000 },
      })}
    >
      <a {...linkProps} ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="group block">
        {/* outer div handles aspect ratio, rounding, and clipping — no 3D transform so overflow-hidden works */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-sm transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-teal-900/20">
          {/* inner motion div handles the tilt only — no preserve-3d: the card
              tilts as a flat plane, and preserve-3d forced an expensive 3D
              compositing context that stuttered during scroll. */}
          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
            className="absolute inset-0"
          >
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ background: p.gradient }}
          />
          {shot && !imgError && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shot}
              alt={`${p.name} website preview`}
              onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}
          {!isLive && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <span className="text-center font-display text-4xl font-light text-white/90 sm:text-5xl">{p.name}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
          <div className="absolute right-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            {isLive ? "Live" : "Prototype"}
          </div>
          <div className="absolute bottom-5 left-5 flex items-center gap-2 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {isLive ? "Visit site" : "Explore"}
            <span className="transition-transform duration-300 group-hover:translate-x-1">{isLive ? "↗" : "→"}</span>
          </div>
          {/* moving specular glare — reads as a glossy 3D surface */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare }}
          />
          </motion.div>
        </div>
        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl font-normal tracking-tight text-black">{p.name}</h3>
          <span className="shrink-0 text-[0.7rem] uppercase tracking-[0.2em] text-black/40">{p.category}</span>
        </div>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-black/55">{p.description}</p>
      </a>
    </motion.div>
  );
}