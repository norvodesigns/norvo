"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, useInView } from "motion/react";
import { useDeviceTilt } from "./DeviceTilt";

type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  withArrow?: boolean;
  dark?: boolean;
  className?: string;
  onClick?: () => void;
  noTilt?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  withArrow = false,
  dark = false,
  className = "",
  onClick,
  noTilt = false,
  type = "button",
  disabled = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const lastTouchRef = useRef(0);
  const [hover, setHover] = useState(false);
  const router = useRouter();

  const reduce = useReducedMotion();
  const tilt = useDeviceTilt();
  const inView = useInView(ref);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const tsx = useSpring(px, { stiffness: 230, damping: 22, mass: 0.5 });
  const tsy = useSpring(py, { stiffness: 230, damping: 22, mass: 0.5 });
  const rotateX = useTransform(tsy, (v) => -v * 22);
  const rotateY = useTransform(tsx, (v) => v * 22);

  useEffect(() => {
    if (noTilt || reduce || !tilt?.enabled || !inView) return;
    const apply = () => {
      px.set(tilt.tiltX.get() * 0.5);
      py.set(tilt.tiltY.get() * 0.5);
    };
    apply();
    const ux = tilt.tiltX.on("change", apply);
    const uy = tilt.tiltY.on("change", apply);
    return () => { ux(); uy(); px.set(0); py.set(0); };
  }, [tilt, reduce, inView, noTilt, px, py]);

  const setOrigin = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${((clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--y", `${((clientY - r.top) / r.height) * 100}%`);
  };

  const setTiltFrom = (clientX: number, clientY: number) => {
    if (noTilt || reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((clientX - r.left) / r.width - 0.5);
    py.set((clientY - r.top) / r.height - 0.5);
  };
  const resetTilt = () => { px.set(0); py.set(0); };

  useEffect(() => {
    if (!hover) return;
    const check = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        setHover(false);
      }
    };
    window.addEventListener("pointermove", check, { passive: true });
    return () => window.removeEventListener("pointermove", check);
  }, [hover]);

  const primary = variant === "primary";
  const pad = size === "sm" ? "px-5 py-2.5" : "px-8 py-4";
  const grad = "linear-gradient(120deg, #6D5DFB, #D8B46A)";

  const baseBg = primary ? grad : "transparent";
  const baseColor = primary ? "#ffffff" : "var(--archive-white)";
  const hoverBg = primary ? "#ffffff" : grad;
  const hoverColor = primary ? "#6D5DFB" : "#14161A";

  const sharedProps = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (disabled || e.pointerType === "touch") return;
      if (Date.now() - lastTouchRef.current < 600) return;
      setOrigin(e.clientX, e.clientY); setHover(true);
    },
    onPointerMove: (e: React.PointerEvent) => { if (!disabled && e.pointerType !== "touch") setTiltFrom(e.clientX, e.clientY); },
    onPointerLeave: (e: React.PointerEvent) => { if (e.pointerType !== "touch") { setHover(false); resetTilt(); } },
    onPointerCancel: () => { setHover(false); resetTilt(); },
    onPointerDown: (e: React.PointerEvent) => {
      if (disabled || e.pointerType !== "touch") return;
      lastTouchRef.current = Date.now();
      setOrigin(e.clientX, e.clientY); setHover(true);
    },
    whileHover: disabled ? {} : { y: -2 },
    whileTap: disabled ? {} : { scale: 0.94 },
    transition: { type: "spring", stiffness: 420, damping: 22 },
    className: `group relative inline-flex items-center justify-center overflow-hidden rounded-full text-sm font-medium tracking-wide ${pad} ${
      primary
        ? "shadow-lg shadow-[#6D5DFB]/20 hover:shadow-xl hover:shadow-[#6D5DFB]/30"
        : "border border-[var(--border-strong)]"
    } disabled:cursor-not-allowed disabled:opacity-40 ${className}`,
    style: { background: baseBg, rotateX, rotateY, transformPerspective: 600, "--x": "50%", "--y": "50%" } as React.CSSProperties,
  };

  const inner = (
    <>
      <span className="relative z-0 inline-flex items-center gap-2 whitespace-nowrap" style={{ color: baseColor }}>
        {children}
        {withArrow && <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 z-10 flex items-center justify-center transition-[clip-path] duration-500 ease-out"
        style={{
          background: hoverBg,
          clipPath: hover ? "circle(150% at var(--x) var(--y))" : "circle(0% at var(--x) var(--y))",
        }}
      >
        <span className="inline-flex items-center gap-2 whitespace-nowrap" style={{ color: hoverColor }}>
          {children}
          {withArrow && <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
        </span>
      </span>
      <span className="pointer-events-none absolute -left-1/3 top-0 z-20 h-full w-1/3 -skew-x-12 bg-white/20 blur-md transition-[left] duration-700 ease-out group-hover:left-full" />
    </>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spread = sharedProps as any;

  if (href) {
    const isExternal = href.startsWith("http");
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onClick={(e) => {
          if (!isExternal) { e.preventDefault(); router.push(href); }
          onClick?.();
        }}
        {...spread}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...spread}
    >
      {inner}
    </motion.button>
  );
}
