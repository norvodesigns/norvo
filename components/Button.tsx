"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "blue";
  size?: "sm" | "md";
  withArrow?: boolean;
  dark?: boolean;
  className?: string;
};

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  withArrow = false,
  dark = false,
  className = "",
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouchRef = useRef(0);
  const [hover, setHover] = useState(false);
  const router = useRouter();

  const clearT = () => {
    if (tRef.current) { clearTimeout(tRef.current); tRef.current = null; }
  };

  const setOrigin = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${((clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--y", `${((clientY - r.top) / r.height) * 100}%`);
  };

  // Safety net: clear stuck hover whenever pointer moves outside
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
  const isBlue = variant === "blue";
  const pad = size === "sm" ? "px-5 py-2.5" : "px-8 py-4";
  const grad = "linear-gradient(120deg,#0D7A7A,#D9A441)";
  const baseBg    = (primary || isBlue) ? grad : "transparent";
  const baseColor = (primary || isBlue) ? "#ffffff" : dark ? "rgba(255,255,255,0.7)" : "#0a0a0a";
  const hoverBg   = (primary || isBlue) ? "#ffffff" : grad;
  const hoverColor = (primary || isBlue) ? "#0D7A7A" : "#ffffff";

  const isExternal = href.startsWith("http");

  return (
    <motion.a
      ref={ref}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (!isExternal) {
          e.preventDefault();
          router.push(href);
        }
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "touch") return;
        if (Date.now() - lastTouchRef.current < 600) return;
        clearT(); setOrigin(e.clientX, e.clientY); setHover(true);
      }}
      onPointerLeave={() => { clearT(); setHover(false); }}
      onPointerCancel={() => { clearT(); setHover(false); }}
      onPointerDown={(e) => {
        if (e.pointerType === "touch") {
          lastTouchRef.current = Date.now();
          clearT(); setOrigin(e.clientX, e.clientY); setHover(true);
        }
      }}
      onPointerUp={(e) => {
        if (e.pointerType === "touch") {
          clearT();
          tRef.current = setTimeout(() => setHover(false), 240);
        }
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full text-sm font-medium ${pad} ${
        primary
          ? "shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30"
          : dark ? "border border-white/[0.18]" : "border border-black/15"
      } ${className}`}
      style={{ background: baseBg, "--x": "50%", "--y": "50%" } as React.CSSProperties}
    >
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

      <span className="pointer-events-none absolute -left-1/3 top-0 z-20 h-full w-1/3 -skew-x-12 bg-white/30 blur-md transition-[left] duration-700 ease-out group-hover:left-full" />
    </motion.a>
  );
}