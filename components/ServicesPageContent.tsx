"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import Button from "./Button";
import CtaSection from "./CtaSection";

// ============================================================================
// HERO SECTION
// ============================================================================
function ServiceHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 pt-32 pb-12 md:pt-40 md:pb-16"
    >
      <motion.div
        style={{ scale, opacity }}
        className="mx-auto w-full max-w-4xl text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-display text-5xl font-light tracking-tight sm:text-6xl md:text-7xl"
        >
          Transform your digital presence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="mx-auto mt-8 max-w-2xl text-xl font-light text-gray-600 sm:text-2xl"
        >
          We don't build generic websites. We craft immersive digital experiences that make your business impossible to ignore.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl text-base text-gray-700 sm:text-lg"
        >
          From custom design to advanced interactions, every detail is crafted to make you stand out.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button href="/projects" variant="primary">
            Explore our work
          </Button>
        </motion.div>
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(13, 122, 122, 0.04) 0%, transparent 70%)",
        }}
      />
    </section>
  );
}

// ============================================================================
// SERVICE CARD COMPONENT
// ============================================================================
interface ServiceCardProps {
  number: string;
  title: string;
  tagline: string;
  description: string;
  benefits: string[];
  children: React.ReactNode;
  layout?: "left" | "right";
  accentColor?: "blue" | "purple";
}

function ServiceCard({
  number,
  title,
  tagline,
  description,
  benefits,
  children,
  layout = "left",
  accentColor = "blue",
}: ServiceCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const accentClass = accentColor === "purple" ? "text-[#D9A441]" : "text-[#0D7A7A]";

  return (
    <section ref={ref} className="relative flex items-center justify-center overflow-hidden px-6 py-20 sm:px-12 lg:px-16">
      <div className="w-full max-w-7xl">
        <div className={`hidden gap-16 lg:grid ${layout === "left" ? "lg:grid-cols-2" : "lg:grid-cols-2"} items-center`}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className={layout === "right" ? "order-last" : ""}
          >
            <div className="mb-4 text-sm font-light tracking-widest text-gray-400">{number}</div>
            <h2 className="mb-3 text-5xl font-light leading-tight tracking-tight">{title}</h2>
            <p className={`mb-6 text-2xl font-light ${accentClass}`}>{tagline}</p>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-gray-700">{description}</p>
            <ul className="space-y-3">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 text-base text-gray-700">
                  <span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full ${accentColor === "purple" ? "bg-amber-100" : "bg-teal-100"}`}>
                    <span className={`h-2 w-2 rounded-full ${accentColor === "purple" ? "bg-[#D9A441]" : "bg-[#0D7A7A]"}`} />
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className={layout === "right" ? "order-first" : ""}
          >
            {children}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="lg:hidden"
        >
          <div className="mb-4 text-sm font-light tracking-widest text-gray-400">{number}</div>
          <h2 className="mb-3 text-4xl font-light leading-tight tracking-tight">{title}</h2>
          <p className={`mb-6 text-xl font-light ${accentClass}`}>{tagline}</p>
          <p className="mb-8 text-base leading-relaxed text-gray-700">{description}</p>
          <div className="mb-8 flex justify-center">{children}</div>
          <ul className="space-y-3">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                <span className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full flex-shrink-0 ${accentColor === "purple" ? "bg-amber-100" : "bg-teal-100"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${accentColor === "purple" ? "bg-[#D9A441]" : "bg-[#0D7A7A]"}`} />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// ALL VISUALS INLINE
// ============================================================================
function CustomWebsiteDesignVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-80 w-full max-w-md"
    >
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute left-0 top-0 rounded-lg border border-gray-200 bg-white shadow-lg"
        style={{ width: "320px", height: "240px" }}
      >
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
        </div>
        <div className="p-4">
          <div className="mb-3 h-2 w-20 rounded-full bg-[#0D7A7A]" />
          <div className="mb-2 h-2 w-32 rounded-full bg-gray-200" />
          <div className="mb-2 h-2 w-28 rounded-full bg-gray-200" />
          <div className="mt-4 space-y-2">
            <div className="h-1.5 w-full rounded-full bg-gray-100" />
            <div className="h-1.5 w-5/6 rounded-full bg-gray-100" />
          </div>
        </div>
      </motion.div>

      {[
        { top: "32px", right: "0", delay: 0.15 },
        { bottom: "80px", right: "48px", delay: 0.3 },
        { bottom: "0", left: "48px", delay: 0.45 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: pos.delay as number }}
          whileHover={{ scale: 1.05 }}
          className="absolute rounded-lg bg-white p-4 shadow-lg cursor-pointer"
          style={{
            ...(pos.top && { top: pos.top }),
            ...(pos.bottom && { bottom: pos.bottom }),
            ...(pos.right && { right: pos.right }),
            ...(pos.left && { left: pos.left }),
          }}
        >
          {i === 0 && (
            <>
              <div className="mb-2 text-xs font-light text-gray-500">Color</div>
              <div className="flex gap-2">
                <div className="h-10 w-10 rounded-lg bg-[#0D7A7A]" />
                <div className="h-10 w-10 rounded-lg bg-[#D9A441]" />
              </div>
            </>
          )}
          {i === 1 && (
            <>
              <div className="mb-2 text-xs font-light text-gray-500">Typography</div>
              <div>
                <div className="text-sm font-light">Light</div>
                <div className="text-xs text-gray-600">Sora, 300</div>
              </div>
            </>
          )}
          {i === 2 && (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-6 w-6 rounded bg-teal-100" />
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// REUSABLE BEFORE/AFTER SLIDER
// ============================================================================
interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  label: string;
}

function BeforeAfterSlider({ beforeSrc, afterSrc, label }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    getPosition(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    getPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    getPosition(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Attach touch listener as non-passive so preventDefault works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const newPosition = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, newPosition)));
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [isDragging]);

  return (
    <div className="space-y-2">
      <div className="text-xs font-light tracking-widest text-gray-400 uppercase">{label}</div>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full cursor-col-resize select-none overflow-hidden rounded-xl shadow-md"
        style={{ aspectRatio: "16/9" }}
      >
        {/* After — full background (right side) */}
        <img
          src={afterSrc}
          alt="After redesign"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />

        {/* Before — clipped to left of slider */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeSrc}
            alt="Before redesign"
            className="absolute inset-0 h-full object-cover object-top"
            style={{ width: containerRef.current?.offsetWidth ?? "100%" }}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute inset-y-0 w-px bg-white shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle */}
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-[#0D7A7A] to-[#D9A441] shadow-xl">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 8L2 5M2 5L5 2M2 5h12M11 8l3 3M14 11l-3 3M14 11H2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-3">
          <span className="rounded-md bg-black/50 px-2.5 py-1 text-xs font-light tracking-wide text-white backdrop-blur-sm">Before</span>
          <span className="rounded-md bg-black/50 px-2.5 py-1 text-xs font-light tracking-wide text-white backdrop-blur-sm">After</span>
        </div>
      </div>
    </div>
  );
}

function WebsiteRedesignsVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-lg space-y-6"
    >
      <BeforeAfterSlider
        beforeSrc="/mozartlaser-hero/before.jpeg"
        afterSrc="/mozartlaser-hero/after.jpeg"
        label="Hero Section"
      />
      <BeforeAfterSlider
        beforeSrc="/mozartlaser-products/before.jpeg"
        afterSrc="/mozartlaser-products/after.jpeg"
        label="Products Page"
      />
    </motion.div>
  );
}

function MobileOptimizationVisual() {
  const iframeRef   = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef      = useRef(0);
  const dirRef      = useRef(1);   // 1 = scrolling down, -1 = scrolling up
  const rafRef      = useRef<number>(0);
  const runningRef  = useRef(false);

  const SCREEN_W  = 204;
  const IFRAME_W  = 390;
  const IFRAME_H  = 844;
  const scale     = SCREEN_W / IFRAME_W;
  const NOTCH_H   = 20;
  const MAX_SCROLL = 3200;
  const SPEED     = 2.5;

  const injectStyles = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.head || doc.getElementById("nrv-hide")) return;
    const s = doc.createElement("style");
    s.id = "nrv-hide";
    s.textContent = "::-webkit-scrollbar{display:none}html,body{scrollbar-width:none;-ms-overflow-style:none}";
    doc.head.appendChild(s);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const tick = () => {
      if (!runningRef.current) return;

      const win = iframeRef.current?.contentWindow;
      if (win) {
        posRef.current += SPEED * dirRef.current;

        if (posRef.current >= MAX_SCROLL) {
          posRef.current = MAX_SCROLL;
          dirRef.current = -1;
        } else if (posRef.current <= 0) {
          posRef.current = 0;
          dirRef.current = 1;
        }

        win.scrollTo({ top: posRef.current, behavior: "instant" as ScrollBehavior });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !runningRef.current) {
          injectStyles();
          runningRef.current = true;
          rafRef.current = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && runningRef.current) {
          runningRef.current = false;
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Phone frame */}
      <div className="relative w-56 rounded-[2.8rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl ring-1 ring-white/10">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-20 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-900" />

        {/* Screen */}
        <div
          className="relative overflow-hidden rounded-[2rem] bg-white"
          style={{ aspectRatio: "9/19.5" }}
        >
          {/* Bar covering the notch area — matches Harborview navbar color so corners look natural */}
          <div className="absolute left-0 right-0 top-0 z-10" style={{ height: NOTCH_H, background: "#f5f3ef" }} />

          {/* Live site iframe, scaled to fit the phone screen */}
          <iframe
            ref={iframeRef}
            src="/norvo-example-site.html"
            title="Norvo mobile experience preview"
            onLoad={injectStyles}
            style={{
              position: "absolute",
              top: NOTCH_H,
              left: 0,
              width: IFRAME_W,
              height: IFRAME_H,
              border: "none",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              pointerEvents: "none",
            }}
          />

          {/* Full interaction blocker — prevents any touch/scroll/click on the iframe */}
          <div
            className="absolute inset-0 z-20"
            style={{ touchAction: "none" }}
          />

          {/* Hamburger menu icon — purely decorative */}
          <div className="absolute right-3 top-6 z-30 flex flex-col gap-[4px]">
            <div className="h-[2px] w-4 rounded-full bg-gray-800" />
            <div className="h-[2px] w-4 rounded-full bg-gray-800" />
            <div className="h-[2px] w-3 rounded-full bg-gray-800" />
          </div>
        </div>

        {/* Home bar */}
        <div className="mt-2 flex justify-center pb-1">
          <div className="h-1 w-24 rounded-full bg-gray-600" />
        </div>
      </div>

      <p className="text-center text-xs font-light tracking-widest text-gray-400 uppercase">
        Premium mobile experience
      </p>
    </motion.div>
  );
}

function InteractiveExperiencesVisual() {
  const [counter, setCounter] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const barRef = useRef(null);
  const barInView = useInView(barRef, { once: true });

  useEffect(() => {
    let count = 0;
    const increment = () => {
      if (count < 65) {
        count += Math.ceil((65 - count) / 10);
        setCounter(count);
        setTimeout(increment, 30);
      } else {
        setCounter(65);
      }
    };
    increment();
  }, []);

  useEffect(() => {
    setTimeout(() => setRevealed(true), 500);
  }, []);

  const text = "Design is the silent ambassador of your brand.";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* Fills once to 82%, never restarts */}
      <div className="space-y-2">
        <div className="text-xs font-light text-gray-500">Scroll Depth Tracking</div>
        <div className="overflow-hidden rounded-lg bg-gray-100 p-3">
          <div className="mb-2 text-xs text-gray-600">Avg. scroll depth on interactive pages</div>
          <div ref={barRef} className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={barInView ? { scaleX: 0.82 } : {}}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full origin-left bg-gradient-to-r from-[#0D7A7A] to-[#D9A441]"
            />
          </div>
          <div className="mt-1 text-right text-xs text-gray-400">82% vs 31% industry avg</div>
        </div>
      </div>

      {/* repeatType "mirror" — layers glide back and forth, never jump */}
      <div className="space-y-2">
        <div className="text-xs font-light text-gray-500">Parallax Depth Layers</div>
        <div className="relative h-32 overflow-hidden rounded-lg bg-gradient-to-br from-teal-50 to-amber-50">
          <motion.div
            animate={{ x: 20 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            className="absolute inset-y-0 left-0 w-1/3 bg-teal-200 opacity-60 flex items-end justify-center pb-2"
          >
            <span className="text-[10px] font-light text-teal-800">Background</span>
          </motion.div>
          <motion.div
            animate={{ x: 40 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.15 }}
            className="absolute inset-y-0 left-1/4 w-1/3 bg-teal-300 opacity-70 flex items-end justify-center pb-2"
          >
            <span className="text-[10px] font-light text-teal-900">Midground</span>
          </motion.div>
          <motion.div
            animate={{ x: 60 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.3 }}
            className="absolute inset-y-0 left-1/2 w-1/3 bg-amber-300 opacity-80 flex items-end justify-center pb-2"
          >
            <span className="text-[10px] font-light text-amber-900">Foreground</span>
          </motion.div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-light text-gray-500">Live Stat</div>
        <div className="rounded-lg bg-gray-100 p-4">
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              className="text-4xl font-light text-[#0D7A7A]"
            >
              {counter}%
            </motion.div>
            <div className="mt-1 text-xs text-gray-600">of web traffic is now mobile</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-light text-gray-500">Text Reveal</div>
        <div className="rounded-lg bg-gray-100 p-4">
          <div className="text-center text-sm font-light text-gray-800">
            {text.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, color: "#0D7A7A" }}
                animate={revealed ? { opacity: 1, color: "#1f2937" } : {}}
                transition={{ duration: 0.3, delay: i * 0.04, ease: "easeOut" }}
              >
                {char}
              </motion.span>
            ))}
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">— Paul Rand</div>
        </div>
      </div>
    </motion.div>
  );
}

function PerformanceOptimizationVisual() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="grid grid-cols-2 gap-4"
    >
      {[
        { label: "LCP",            value: "1.4s",    type: "gauge",  sub: "Largest Contentful Paint" },
        { label: "Lighthouse",     value: "98/100",  type: "text",   sub: "Performance score" },
        { label: "Core Web Vitals",value: "✓",       type: "circle", sub: "All green" },
        { label: "Speed Index",    value: 94,        type: "bar",    sub: "94 / 100" },
        { label: "Zero CLS",       value: "✓",       type: "circle", sub: "No layout shift" },
        { label: "TTFB",           value: 91,        type: "bar",    sub: "Time to first byte" },
      ].map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-1 text-xs font-light text-gray-500 uppercase tracking-widest">
            {metric.label}
          </div>
          <div className="mb-3 text-[10px] text-gray-400">{metric.sub}</div>
          {metric.type === "gauge" && (
            <div className="space-y-2">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.5, delay: i * 0.1 + 0.2 }}
                className="h-2 origin-left rounded-full bg-gradient-to-r from-[#0D7A7A] to-[#D9A441]"
              />
              <div className="text-sm font-light text-gray-700">{metric.value}</div>
            </div>
          )}
          {metric.type === "text" && (
            <div className="text-2xl font-light text-gray-900">{metric.value}</div>
          )}
          {metric.type === "bar" && (
            <div className="space-y-2">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.5, delay: i * 0.1 + 0.2 }}
                className="h-3 origin-left rounded-full bg-gradient-to-r from-[#0D7A7A] to-[#D9A441]"
                style={{ width: `${metric.value}%` }}
              />
              <div className="text-sm font-light text-gray-700">{metric.value}%</div>
            </div>
          )}
          {metric.type === "circle" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-teal-50 text-2xl font-light text-[#0D7A7A]"
            >
              {metric.value}
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

function BrandExperienceDesignVisual() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      <div>
        <h3 className="mb-4 text-sm font-light text-gray-500">Typography</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { name: "Sora Light 300",  size: "text-2xl", weight: "font-light" },
            { name: "Sora Regular 400", size: "text-xl", weight: "font-normal" },
            { name: "Sora SemiBold 600", size: "text-lg", weight: "font-semibold" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className={`${item.size} ${item.weight} font-sans`}>Aa</div>
              <div className="mt-2 text-xs text-gray-500">{item.name}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-light text-gray-500">Colors</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { name: "Teal  #0D7A7A",  color: "bg-[#0D7A7A]" },
            { name: "Gold  #D9A441",  color: "bg-[#D9A441]" },
            { name: "Teal Light",     color: "bg-teal-100" },
            { name: "Amber Light",    color: "bg-amber-100" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: (i + 3) * 0.08 }}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className={`h-12 w-full rounded-lg ${item.color} mb-2`} />
              <div className="text-xs text-gray-700">{item.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SERVICE SHOWCASE
// ============================================================================
function ServiceShowcase() {
  return (
    <section id="services" className="relative w-full">
      <ServiceCard
        number="01"
        title="Custom Website Design"
        tagline="Built from the ground up, not from templates"
        description="Every business is unique. We don't use templates or cookie-cutter layouts. Instead, we start with your vision, your brand, and your goals. Our designers craft every pixel, every interaction, every detail specifically for you. The result is a website that feels expensive, modern, and unmistakably yours."
        benefits={["Fully custom visual identity", "Tailored to your brand strategy", "Modern, premium aesthetics", "Competitive advantage through design"]}
        layout="left"
        accentColor="blue"
      >
        <CustomWebsiteDesignVisual />
      </ServiceCard>

      <ServiceCard
        number="02"
        title="Website Redesigns"
        tagline="From outdated to unforgettable"
        description="Your website is stuck in 2015. It's slow, it's generic, and it's costing you business. We transform outdated websites into premium digital experiences that win clients. We rebuild your site with modern technology, beautiful design, and strategic interactions."
        benefits={["Modernize your online presence", "Improve user experience significantly", "Faster load times", "Increased conversion potential"]}
        layout="right"
        accentColor="purple"
      >
        <WebsiteRedesignsVisual />
      </ServiceCard>

      <ServiceCard
        number="03"
        title="Mobile Optimization"
        tagline="Premium on phones, not forgotten"
        description="80% of people browse on phones. Most websites treat mobile as an afterthought. We reverse that: we design for mobile first, then adapt to desktop. Your users get a genuine premium experience no matter what device they use."
        benefits={["Mobile-first design philosophy", "Optimized touch interactions", "Fast performance on any connection", "Better conversion on mobile devices"]}
        layout="left"
        accentColor="blue"
      >
        <MobileOptimizationVisual />
      </ServiceCard>

      <ServiceCard
        number="04"
        title="Interactive Experiences"
        tagline="Motion that tells your story"
        description="A static website is a missed opportunity. We layer in advanced motion design, scroll-linked animations, and immersive interactions that guide visitors through your story. These aren't gimmicks—they're purposeful interactions that increase engagement."
        benefits={["Scroll-linked storytelling", "Advanced motion design", "Guided user journeys", "Higher engagement metrics", "Memorable brand experience"]}
        layout="right"
        accentColor="purple"
      >
        <InteractiveExperiencesVisual />
      </ServiceCard>

      <ServiceCard
        number="05"
        title="Performance Optimization"
        tagline="Luxury at lightning speed"
        description="Beautiful design means nothing if the site takes 10 seconds to load. We obsess over performance: optimized images, efficient code, smart caching, and strategic loading. Your visitors get a luxury experience that loads in under 2 seconds."
        benefits={["Sub-2-second load times", "Optimized images and code", "SEO-friendly performance", "Better user retention", "Reduced bounce rates"]}
        layout="left"
        accentColor="blue"
      >
        <PerformanceOptimizationVisual />
      </ServiceCard>

      <ServiceCard
        number="06"
        title="Brand Experience Design"
        tagline="Consistency across every touchpoint"
        description="A great website needs a foundation: a cohesive visual identity. We design your brand experience—typography, color systems, motion principles, interactive patterns, and design language. Everything works together seamlessly."
        benefits={["Cohesive visual identity", "Consistent brand experience", "Professional appearance", "Memorable brand recall", "Scalable design system"]}
        layout="right"
        accentColor="purple"
      >
        <BrandExperienceDesignVisual />
      </ServiceCard>
    </section>
  );
}

// ============================================================================
// PROCESS SECTION
// ============================================================================
function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { title: "Discover", description: "We dive deep into your business, goals, audience, and competition. Understanding comes first." },
    { title: "Design", description: "Our designers craft the visual identity, interactions, and user experience. Every detail is intentional." },
    { title: "Build", description: "Our engineers bring designs to life with clean, modern code. Performance and quality are non-negotiable." },
    { title: "Refine", description: "We test, optimize, and iterate. We don't ship anything that isn't perfect." },
    { title: "Launch", description: "Your new website goes live. We celebrate, then provide ongoing support and monitoring." },
  ];

  return (
    <section className="relative w-full overflow-hidden px-6 py-20 sm:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-5xl font-light tracking-tight md:text-4xl">Our Process</h2>
          <p className="mt-4 text-lg text-gray-600">A systematic approach to digital excellence</p>
        </motion.div>

        <div className="hidden lg:block">
          <div className="relative">
            <svg className="absolute left-0 top-16 h-1 w-full" style={{ zIndex: 1 }} preserveAspectRatio="none" viewBox="0 0 1200 2" fill="none">
              <motion.line x1="0" y1="1" x2="1200" y2="1" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="1200" initial={{ strokeDashoffset: 1200 }} whileInView={{ strokeDashoffset: 0 }} transition={{ duration: 2, delay: 0.3 }} viewport={{ once: true }} />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0D7A7A" />
                  <stop offset="100%" stopColor="#D9A441" />
                </linearGradient>
              </defs>
            </svg>

            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  viewport={{ once: true }}
                  onClick={() => setActiveStep(i)}
                  className="flex flex-col items-center text-center cursor-pointer"
                >
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    className={`relative h-24 w-24 rounded-full border-2 transition-colors duration-300 flex items-center justify-center text-lg font-light ${
                      activeStep === i ? "border-[#0D7A7A] bg-gradient-to-br from-[#0D7A7A] to-[#D9A441] text-white shadow-lg" : "border-gray-300 bg-white text-gray-700 hover:border-[#0D7A7A]"
                    }`}
                  >
                    {activeStep === i && <motion.div layoutId="activeCircle" className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0D7A7A] to-[#D9A441]" transition={{ type: "spring", stiffness: 400, damping: 40 }} />}
                    <span className="relative z-10">{(i + 1).toString().padStart(2, "0")}</span>
                  </motion.button>

                  <motion.div
                    animate={{ color: activeStep === i ? "#0a0a0a" : "#999999" }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 max-w-xs"
                  >
                    <h3 className="text-lg font-light">{step.title}</h3>
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: activeStep === i ? 1 : 0, height: activeStep === i ? "auto" : 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 text-sm text-gray-700 overflow-hidden"
                    >
                      {step.description}
                    </motion.p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:hidden">
          <div className="relative">
            <svg className="absolute left-1/2 top-0 h-full w-1" style={{ zIndex: 1, transform: "translateX(-50%)" }} viewBox="0 0 2 1200" fill="none">
              <motion.line x1="1" y1="0" x2="1" y2="1200" stroke="url(#vLineGradient)" strokeWidth="2" strokeDasharray="1200" initial={{ strokeDashoffset: 1200 }} whileInView={{ strokeDashoffset: 0 }} transition={{ duration: 2, delay: 0.3 }} viewport={{ once: true }} />
              <defs>
                <linearGradient id="vLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0D7A7A" />
                  <stop offset="100%" stopColor="#D9A441" />
                </linearGradient>
              </defs>
            </svg>

            <div className="space-y-12">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  viewport={{ once: true }}
                  onClick={() => setActiveStep(i)}
                  className="flex flex-col items-center text-center cursor-pointer"
                >
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    className={`relative h-32 w-32 rounded-full border-2 transition-colors duration-300 flex items-center justify-center text-lg font-light ${
                      activeStep === i ? "border-[#0D7A7A] bg-gradient-to-br from-[#0D7A7A] to-[#D9A441] text-white shadow-lg" : "border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    <span className="relative z-10">{(i + 1).toString().padStart(2, "0")}</span>
                  </motion.button>

                  <motion.div
                    animate={{ color: activeStep === i ? "#0a0a0a" : "#999999" }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 max-w-xs"
                  >
                    <h3 className="text-lg font-light">{step.title}</h3>
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: activeStep === i ? 1 : 0, height: activeStep === i ? "auto" : 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 text-sm text-gray-700 overflow-hidden"
                    >
                      {step.description}
                    </motion.p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// WHY NORVO SECTION
// ============================================================================
function WhyNorvoSection() {
  const benefits = [
    { title: "Custom Built", description: "No templates. No cookie-cutter layouts. Everything is designed specifically for your business." },
    { title: "Mobile First", description: "Most agencies build for desktop then shrink for phones. We prioritize mobile from day one." },
    { title: "Modern Design Philosophy", description: "We follow principles from Apple, Stripe, and Lusion. Premium aesthetics, intentional details." },
    { title: "Advanced Interactions", description: "Scroll-linked animations, custom motion, and purposeful interactions. Design that works harder." },
    { title: "Performance Focused", description: "Beautiful means nothing if it's slow. We obsess over speed without sacrificing luxury." },
    { title: "Obsessive Attention to Detail", description: "Kerning. Shadows. Micro-interactions. Hover states. Everything is crafted to perfection." },
  ];

  return (
    <section className="relative w-full px-6 py-20 sm:px-12 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-5xl font-light tracking-tight md:text-4xl">Why Choose Norvo</h2>
          <p className="mt-4 text-lg text-gray-600">What sets us apart</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => {
            const ref = useRef(null);
            const isInView = useInView(ref, { once: true, margin: "-50px" });

            return (
              <motion.div
                ref={ref}
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                whileHover={{ y: -8 }}
                className="rounded-lg border border-gray-200 bg-white p-8 transition-shadow duration-300 hover:shadow-lg"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 0.4 } : {}}
                  whileHover={{ opacity: 0.7 }}
                  className="mb-4 text-5xl font-light bg-gradient-to-r from-[#0D7A7A] to-[#D9A441] bg-clip-text text-transparent"
                >
                  {(i + 1).toString().padStart(2, "0")}
                </motion.div>
                <h3 className="mb-3 text-xl font-light tracking-tight">{benefit.title}</h3>
                <p className="text-base leading-relaxed text-gray-700">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// RESULTS SECTION
// ============================================================================
function ResultsSection() {
  const results = [
    {
      stat: "50",
      display: "50ms",
      label: "First Impression",
      description: "Users form a judgment about your website in 50 milliseconds — before they've read a single word. Your design is doing the talking.",
      source: "Google UX Research",
    },
    {
      stat: "75",
      display: "75%",
      label: "Credibility From Design",
      description: "75% of people judge a company's credibility based entirely on its website design. A poor site doesn't just look bad — it loses trust.",
      source: "Stanford Web Credibility Study",
    },
    {
      stat: "88",
      display: "88%",
      label: "Won't Return After Bad UX",
      description: "88% of users are less likely to return to a website after a bad experience. There's rarely a second chance to make a first impression.",
      source: "UX Planet / Gomez",
    },
    {
      stat: "53",
      display: "53%",
      label: "Mobile Abandonment",
      description: "53% of mobile users abandon a page that takes longer than 3 seconds to load. Speed and beauty have to work together.",
      source: "Google / SOASTA Research",
    },
  ];

  return (
    <section className="relative w-full px-6 py-20 sm:px-12 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-5xl font-light tracking-tight md:text-4xl">The Impact of Premium Design</h2>
          <p className="mt-4 text-lg text-gray-600">Real results that move the needle</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {results.map((result, i) => {
            const ref = useRef(null);
            const isInView = useInView(ref, { once: true });
            const [displayValue, setDisplayValue] = useState(0);

            useEffect(() => {
              if (!isInView) return;
              let current = 0;
              const numericValue = parseFloat(result.stat);
              const increment = numericValue / 30;
              const interval = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                  setDisplayValue(numericValue);
                  clearInterval(interval);
                } else {
                  setDisplayValue(parseFloat(current.toFixed(1)));
                }
              }, 30);
              return () => clearInterval(interval);
            }, [isInView]);

            return (
              <motion.div
                ref={ref}
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                whileHover={{ y: -6 }}
                className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-teal-50 p-8"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="text-5xl font-light bg-gradient-to-r from-[#0D7A7A] to-[#D9A441] bg-clip-text text-transparent md:text-4xl">
                    {result.display}
                  </div>
                </motion.div>

                <div className="mb-3 text-sm font-light uppercase tracking-widest text-gray-500">{result.label}</div>
                <p className="text-base leading-relaxed text-gray-700">{result.description}</p>
                <div className="mt-4 text-xs text-gray-400 italic">Source: {result.source}</div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="mt-6 h-0.5 w-12 origin-left bg-gradient-to-r from-[#0D7A7A] to-[#D9A441]"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export default function Services() {
  return (
    <main className="min-h-screen bg-white">
      <ServiceHero />
      <ServiceShowcase />
      <ProcessSection />
      <WhyNorvoSection />
      <ResultsSection />
      <CtaSection />
    </main>
  );
}