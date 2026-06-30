"use client";

import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import Link from "next/link";

// ── Capability Module Card ────────────────────────────────────────────────────

interface CapabilityProps {
  index: number;
  number: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  visual: React.ReactNode;
}

function CapabilityModule({ index, number, title, tagline, description, capabilities, visual }: CapabilityProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const isReverse = index % 2 === 1;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative border-b py-20 md:py-28"
      style={{ borderColor: "rgba(244,245,247,0.06)" }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-16">
        <div className={`flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-20 ${isReverse ? "lg:[&>*:first-child]:order-last" : ""}`}>

          {/* Text column */}
          <div>
            <div className="mb-3 flex items-center gap-4">
              <span
                className="text-[10px] font-medium tracking-[0.4em] uppercase"
                style={{ color: "var(--norvo-violet)" }}
              >
                MODULE {number}
              </span>
              <div className="h-px flex-1" style={{ background: "rgba(109,93,251,0.3)" }} />
            </div>

            <h2 className="mb-4 text-4xl font-light leading-tight tracking-tight text-[var(--archive-white)] md:text-5xl">
              {title}
            </h2>
            <p
              className="mb-6 text-lg font-light"
              style={{ color: "var(--observatory-gold)" }}
            >
              {tagline}
            </p>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-[var(--archive-white)]/55">
              {description}
            </p>

            <ul className="space-y-3">
              {capabilities.map((cap, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3 text-sm text-[var(--archive-white)]/60"
                >
                  <span
                    className="h-1 w-4 rounded-full"
                    style={{ background: "var(--norvo-gradient)" }}
                  />
                  {cap}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Visual column */}
          <div className="flex justify-center lg:justify-start">
            {visual}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ── Capability Visuals ────────────────────────────────────────────────────────

function CustomDesignVisual() {
  return (
    <div
      className="relative h-72 w-full max-w-md rounded-2xl border p-6"
      style={{ background: "rgba(244,245,247,0.03)", borderColor: "rgba(244,245,247,0.08)" }}
    >
      <div className="mb-4 text-xs tracking-widest text-[var(--archive-white)]/30 uppercase">Design System</div>

      {/* Color swatches */}
      <div className="mb-4 flex gap-3">
        {["#14161A", "#6D5DFB", "#D8B46A", "#F4F5F7"].map((c, i) => (
          <motion.div
            key={i}
            className="h-10 w-10 rounded-lg"
            style={{ background: c, border: "1px solid rgba(244,245,247,0.1)" }}
            whileHover={{ scale: 1.15, y: -4 }}
          />
        ))}
      </div>

      {/* Typography preview */}
      <div className="mb-4 space-y-1">
        <div className="text-xl font-light text-[var(--archive-white)]">Aa — Display</div>
        <div className="text-sm text-[var(--archive-white)]/40">Geist Mono · Weights 300–700</div>
      </div>

      {/* Component preview */}
      <div className="flex gap-3">
        <div
          className="rounded-full px-4 py-2 text-xs font-medium text-white"
          style={{ background: "linear-gradient(120deg, #6D5DFB, #D8B46A)" }}
        >
          Primary CTA
        </div>
        <div
          className="rounded-full px-4 py-2 text-xs font-medium text-[var(--archive-white)]/70"
          style={{ border: "1px solid rgba(244,245,247,0.2)" }}
        >
          Secondary
        </div>
      </div>

      {/* Floating annotation */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-8 rounded-xl p-3 text-xs"
        style={{ background: "rgba(109,93,251,0.15)", border: "1px solid rgba(109,93,251,0.3)", color: "#A89DFF" }}
      >
        Custom built
        <br />
        from scratch
      </motion.div>
    </div>
  );
}

function RedesignVisual() {
  const [pos, setPos] = useState(50);

  return (
    <div className="w-full max-w-md">
      <div className="mb-2 text-[10px] tracking-widest text-[var(--archive-white)]/30 uppercase">
        Before / After
      </div>
      <div
        className="relative cursor-col-resize select-none overflow-hidden rounded-xl"
        style={{ aspectRatio: "16/9", background: "#111" }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos(((e.clientX - r.left) / r.width) * 100);
        }}
      >
        {/* After */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a0b0f, #14161A)" }}>
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-2xl font-light text-[var(--archive-white)]">After</div>
              <div
                className="rounded-full px-4 py-2 text-xs text-white"
                style={{ background: "linear-gradient(120deg, #6D5DFB, #D8B46A)" }}
              >
                Modern & Premium
              </div>
            </div>
          </div>
        </div>

        {/* Before */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${pos}%` }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ width: `${10000 / pos}%`, background: "#E8E8E8" }}
          >
            <div className="text-center">
              <div className="mb-2 text-xl text-gray-700">Before</div>
              <div className="rounded bg-gray-300 px-3 py-1 text-xs text-gray-600">
                Outdated
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/80"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-sm">
            <span className="text-[10px] text-white">⟺</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileVisual() {
  return (
    <div className="flex items-center justify-center">
      <div
        className="relative rounded-[2.5rem] p-2"
        style={{ background: "#1a1a1a", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", width: 180 }}
      >
        <div className="relative overflow-hidden rounded-[2rem]" style={{ aspectRatio: "9/19.5", background: "#0a0b0f" }}>
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl" style={{ background: "#1a1a1a" }} />

          {/* Screen content */}
          <div className="absolute inset-0 pt-5">
            <div className="h-8 border-b px-4 flex items-center justify-between"
              style={{ borderColor: "rgba(244,245,247,0.05)", background: "rgba(244,245,247,0.02)" }}>
              <div className="h-3 w-12 rounded" style={{ background: "rgba(244,245,247,0.1)" }} />
              <div className="h-3 w-3 rounded-full" style={{ background: "rgba(109,93,251,0.5)" }} />
            </div>
            <div className="p-3 space-y-2">
              {[80, 60, 90, 50, 70].map((w, i) => (
                <div key={i} className="h-2 rounded-full" style={{ width: `${w}%`, background: "rgba(244,245,247,0.08)" }} />
              ))}
              <div className="mt-4 rounded-xl h-20" style={{ background: "rgba(109,93,251,0.1)" }} />
            </div>
          </div>
        </div>
        {/* Home bar */}
        <div className="mt-2 flex justify-center pb-1">
          <div className="h-0.5 w-16 rounded-full" style={{ background: "rgba(244,245,247,0.3)" }} />
        </div>
      </div>
    </div>
  );
}

function InteractiveVisual() {
  return (
    <div className="relative w-full max-w-md">
      {[
        { label: "Scroll depth", value: 82, unit: "%" },
        { label: "Avg. session", value: 4.2, unit: "min" },
        { label: "Conversion", value: 3.8, unit: "×" },
      ].map((metric, i) => (
        <motion.div
          key={i}
          className="mb-3 rounded-xl p-4"
          style={{ background: "rgba(244,245,247,0.03)", border: "1px solid rgba(244,245,247,0.07)" }}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-[var(--archive-white)]/40">{metric.label}</span>
            <span className="text-sm font-light text-[var(--archive-white)]">
              {metric.value}{metric.unit}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(244,245,247,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(to right, #6D5DFB, #D8B46A)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: Math.min(metric.value / 100, 1) }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: i * 0.1 + 0.3 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PerformanceVisual() {
  const metrics = [
    { label: "LCP", value: "1.4s", color: "#22c55e" },
    { label: "FID", value: "8ms", color: "#22c55e" },
    { label: "CLS", value: "0.02", color: "#22c55e" },
    { label: "Score", value: "98", color: "#6D5DFB" },
  ];

  return (
    <div
      className="relative rounded-2xl p-6"
      style={{ background: "rgba(244,245,247,0.03)", border: "1px solid rgba(244,245,247,0.08)", width: "100%", maxWidth: 380 }}
    >
      <div className="mb-4 text-xs tracking-widest text-[var(--archive-white)]/30 uppercase">Core Web Vitals</div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            className="rounded-xl p-4"
            style={{ background: "rgba(244,245,247,0.03)" }}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="mb-1 text-[10px] tracking-widest text-[var(--archive-white)]/30 uppercase">{m.label}</div>
            <div className="text-2xl font-light" style={{ color: m.color }}>{m.value}</div>
          </motion.div>
        ))}
      </div>
      <div
        className="mt-4 flex items-center gap-3 rounded-xl p-3"
        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
      >
        <div className="text-green-400">●</div>
        <span className="text-xs text-green-400">All Core Web Vitals passing</span>
      </div>
    </div>
  );
}

function BrandVisual() {
  return (
    <div className="w-full max-w-md space-y-3">
      {[
        { name: "Homepage", status: "Deployed", progress: 100 },
        { name: "Brand System", status: "Active", progress: 100 },
        { name: "Design Tokens", status: "Synced", progress: 100 },
        { name: "Component Library", status: "Built", progress: 100 },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="flex items-center justify-between rounded-xl p-4"
          style={{ background: "rgba(244,245,247,0.03)", border: "1px solid rgba(244,245,247,0.07)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
        >
          <div>
            <div className="text-sm text-[var(--archive-white)]/80">{item.name}</div>
            <div className="text-xs text-[var(--archive-white)]/30">{item.status}</div>
          </div>
          <div className="text-xs font-medium" style={{ color: "var(--norvo-violet)" }}>✓</div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function ImpactStat({ display, label, description }: { display: string; label: string; description: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className="border-b pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8 last:border-r-0"
      style={{ borderColor: "rgba(244,245,247,0.06)" }}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
    >
      <div className="mb-1 text-4xl font-light text-gradient">{display}</div>
      <div className="mb-2 text-xs tracking-widest text-[var(--archive-white)]/40 uppercase">{label}</div>
      <p className="text-sm text-[var(--archive-white)]/40 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

const MODULES = [
  {
    number: "01",
    title: "Custom Website Design",
    tagline: "Built from the ground up, not from templates",
    description: "Every business is unique. We don't use templates or cookie-cutter layouts. Instead, we start with your vision, your brand, and your goals. Our designers craft every pixel, every interaction, every detail specifically for you.",
    capabilities: ["Fully custom visual identity", "Tailored to your brand strategy", "Modern, premium aesthetics", "Competitive advantage through design"],
    visual: <CustomDesignVisual />,
  },
  {
    number: "02",
    title: "Website Redesigns",
    tagline: "From outdated to unforgettable",
    description: "Your website is stuck in the past. It's slow, it's generic, and it's costing you business. We transform outdated websites into premium digital experiences that win clients and stand the test of time.",
    capabilities: ["Modernize your online presence", "Improve user experience significantly", "Faster load times across all devices", "Increased conversion potential"],
    visual: <RedesignVisual />,
  },
  {
    number: "03",
    title: "Mobile Optimization",
    tagline: "Premium on every screen",
    description: "80% of people browse on phones. Most websites treat mobile as an afterthought. We reverse that: we design for mobile first, then adapt to desktop. Your users get a genuine premium experience no matter what device they use.",
    capabilities: ["Mobile-first design philosophy", "Optimized touch interactions", "Fast performance on any connection", "Better conversion on mobile devices"],
    visual: <MobileVisual />,
  },
  {
    number: "04",
    title: "Interactive Experiences",
    tagline: "Motion that tells your story",
    description: "A static website is a missed opportunity. We layer in advanced motion design, scroll-linked animations, and immersive interactions that guide visitors through your story — purposeful interactions that increase engagement.",
    capabilities: ["Scroll-linked storytelling", "Advanced motion design systems", "Guided user journeys", "Higher engagement metrics"],
    visual: <InteractiveVisual />,
  },
  {
    number: "05",
    title: "Performance Optimization",
    tagline: "Luxury at lightning speed",
    description: "Beautiful design means nothing if the site takes 10 seconds to load. We obsess over performance: optimized images, efficient code, smart caching, and strategic loading. Luxury at under 2 seconds.",
    capabilities: ["Sub-2-second load times", "Optimized images and code", "SEO-friendly performance", "Reduced bounce rates"],
    visual: <PerformanceVisual />,
  },
  {
    number: "06",
    title: "Brand Experience Design",
    tagline: "Consistency across every touchpoint",
    description: "A great website needs a foundation: a cohesive visual identity. We design your brand experience — typography, color systems, motion principles, interactive patterns, and design language. Everything works together.",
    capabilities: ["Cohesive visual identity system", "Consistent brand experience", "Scalable design system", "Memorable brand recall"],
    visual: <BrandVisual />,
  },
];

const IMPACT = [
  { display: "50ms", label: "First impression", description: "Users form a judgment about your website before they've read a single word." },
  { display: "75%", label: "Credibility from design", description: "People judge a company's credibility based entirely on its website design." },
  { display: "88%", label: "Won't return after bad UX", description: "There's rarely a second chance to make a first impression online." },
  { display: "2×", label: "Conversion lift", description: "On average, a premium redesign doubles conversion compared to a generic site." },
];

export default function ServicesPageContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -40]);

  return (
    <main className="min-h-screen" style={{ background: "var(--graphite)" }}>

      {/* Hero */}
      <div ref={heroRef} className="relative px-6 pb-16 pt-36 md:px-16 md:pt-44">
        <motion.div style={{ opacity: heroOpacity, y: heroY }}>
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[var(--archive-white)]/30">
            Capability Modules
          </p>
          <h1 className="mb-6 text-5xl font-light leading-tight tracking-tight text-[var(--archive-white)] sm:text-6xl md:text-7xl">
            Transform your
            <br />
            <span className="text-gradient">digital presence.</span>
          </h1>
          <p className="max-w-xl text-base text-[var(--archive-white)]/50 sm:text-lg">
            We don&apos;t build generic websites. We craft immersive digital experiences
            that make your business impossible to ignore.
          </p>
        </motion.div>

        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(ellipse at 60% 60%, rgba(109,93,251,0.06) 0%, transparent 60%)" }}
        />
      </div>

      {/* Impact stats */}
      <div className="border-y px-6 py-12 md:px-16" style={{ borderColor: "rgba(244,245,247,0.06)" }}>
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-4">
          {IMPACT.map((stat) => (
            <ImpactStat key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Capability modules */}
      <div id="services">
        {MODULES.map((mod, i) => (
          <CapabilityModule key={mod.number} index={i} {...mod} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="px-6 py-24 text-center md:px-16">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="mb-3 text-[10px] tracking-[0.4em] text-[var(--archive-white)]/30 uppercase">
              Ready to begin?
            </p>
            <h2 className="mb-8 text-4xl font-light leading-tight text-[var(--archive-white)] md:text-5xl">
              Let&apos;s build something
              <br />
              <span className="text-gradient">the web hasn&apos;t seen.</span>
            </h2>
            <Link
              href="/start"
              className="inline-flex items-center gap-3 rounded-full px-10 py-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(120deg, #6D5DFB, #D8B46A)" }}
            >
              Start a project →
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
