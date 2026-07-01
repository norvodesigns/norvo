"use client";

import { useRef, useState, useEffect } from "react";
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
                {number}
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
            <p className="mb-8 max-w-lg text-base leading-relaxed text-[var(--archive-white)]/60">
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

// ── Before / After slider (real client redesigns) ─────────────────────────────

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

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Attach touch listener as non-passive so preventDefault works (blocks the page
  // from scrolling while you drag the handle on mobile).
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
      <div className="text-xs font-light tracking-widest text-[var(--archive-white)]/40 uppercase">{label}</div>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full cursor-col-resize select-none overflow-hidden rounded-xl shadow-md ring-1 ring-white/10"
        style={{ aspectRatio: "16/9" }}
      >
        {/* After — full background (right side) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterSrc}
          alt="After the Norvo redesign"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />

        {/* Before — clipped to the left of the slider */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeSrc}
            alt="Before the redesign"
            className="absolute inset-0 h-full object-cover object-top"
            style={{ width: containerRef.current?.offsetWidth ?? "100%" }}
          />
        </div>

        {/* Divider line + handle (Signature Gradient) */}
        <div
          className="absolute inset-y-0 w-px bg-white shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          <div
            className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-xl"
            style={{ background: "linear-gradient(120deg, #6D5DFB, #D8B46A)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 8L2 5M2 5L5 2M2 5h12M11 8l3 3M14 11l-3 3M14 11H2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

function WebsiteRedesignVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-lg space-y-6"
    >
      <BeforeAfterSlider
        beforeSrc="/mozartlaser-hero/before.jpeg"
        afterSrc="/mozartlaser-hero/after.jpeg"
        label="Mozart Laser · Home"
      />
      <BeforeAfterSlider
        beforeSrc="/mozartlaser-products/before.jpeg"
        afterSrc="/mozartlaser-products/after.jpeg"
        label="Mozart Laser · Products"
      />
      <p className="text-xs font-light leading-relaxed text-[var(--archive-white)]/40">
        A real redesign — drag to compare. Same business, a first impression that finally does it justice.
      </p>
    </motion.div>
  );
}

// ── Mobile: a demo site (Harborview Estates) auto-scrolling inside a phone ────

function MobileExperienceVisual() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const dirRef = useRef(1); // 1 = scrolling down, -1 = scrolling up
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);

  const SCREEN_W = 204;
  const IFRAME_W = 390;
  const IFRAME_H = 844;
  const scale = SCREEN_W / IFRAME_W;
  const NOTCH_H = 20;
  const MAX_SCROLL = 3200;
  const SPEED = 2.5;

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

    // Only run while it's on screen — no wasted frames scrolling an unseen iframe.
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
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Phone frame */}
      <div className="relative w-56 rounded-[2.8rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl ring-1 ring-white/10">
        {/* Screen */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white" style={{ aspectRatio: "9/19.5" }}>
          {/* Bar covering the notch area — matches the site's navbar color so the corners read cleanly */}
          <div className="absolute left-0 right-0 top-0 z-10" style={{ height: NOTCH_H, background: "#f5f3ef" }} />

          {/* Demo site, scaled to fit the phone screen and auto-scrolling */}
          <iframe
            ref={iframeRef}
            src="/norvo-example-site.html"
            title="Norvo — a demo site on mobile"
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

          {/* Interaction blocker — keeps touch/scroll out of the iframe */}
          <div className="absolute inset-0 z-20" style={{ touchAction: "none" }} />
        </div>

        {/* Home bar */}
        <div className="mt-2 flex justify-center pb-1">
          <div className="h-1 w-24 rounded-full bg-gray-600" />
        </div>
      </div>

      <p className="text-center text-xs font-light tracking-widest text-[var(--archive-white)]/40 uppercase">
        A demo we built — Harborview Estates
      </p>
    </motion.div>
  );
}

// ── Graphic design / brand visual ─────────────────────────────────────────────

function BrandDesignVisual() {
  return (
    <div
      className="relative h-72 w-full max-w-md rounded-2xl border p-6"
      style={{ background: "rgba(244,245,247,0.03)", borderColor: "rgba(244,245,247,0.08)" }}
    >
      <div className="mb-4 text-xs tracking-widest text-[var(--archive-white)]/30 uppercase">Brand system</div>

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
        <div className="text-sm text-[var(--archive-white)]/40">One typeface, one voice, everywhere</div>
      </div>

      {/* Component preview */}
      <div className="flex gap-3">
        <div
          className="rounded-full px-4 py-2 text-xs font-medium text-white"
          style={{ background: "linear-gradient(120deg, #6D5DFB, #D8B46A)" }}
        >
          Primary
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
        Holds together
        <br />
        everywhere
      </motion.div>
    </div>
  );
}

// ── Advertising visual (campaign metrics) ─────────────────────────────────────

function AdvertisingVisual() {
  const metrics = [
    { label: "People reached", value: "48.2K", fill: 0.9 },
    { label: "Click-through", value: "6.4%", fill: 0.64 },
    { label: "Return on ad spend", value: "4.1×", fill: 0.82 },
  ];
  return (
    <div className="relative w-full max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs tracking-widest text-[var(--archive-white)]/30 uppercase">Campaign snapshot</span>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest text-[var(--archive-white)]/40"
          style={{ border: "1px solid rgba(244,245,247,0.12)" }}
        >
          Illustrative
        </span>
      </div>
      {metrics.map((metric, i) => (
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
            <span className="text-sm font-light text-[var(--archive-white)]">{metric.value}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(244,245,247,0.08)" }}>
            <motion.div
              className="h-full origin-left rounded-full"
              style={{ background: "linear-gradient(to right, #6D5DFB, #D8B46A)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: metric.fill }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: i * 0.1 + 0.3 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Business & product visual (a plan taking shape) ───────────────────────────

function BusinessVisual() {
  const items = [
    { name: "Who it's for", status: "Clear" },
    { name: "The offer & pricing", status: "Sharpened" },
    { name: "Product roadmap", status: "Mapped" },
    { name: "How you'll grow", status: "Planned" },
  ];
  return (
    <div className="w-full max-w-md space-y-3">
      {items.map((item, i) => (
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

// ── Content ───────────────────────────────────────────────────────────────────

const MODULES = [
  {
    number: "Web design & development",
    title: "A site worth returning to",
    tagline: "The first handshake — and often the only one.",
    description:
      "Your website is where most people meet your business for the first time. We design and build it from scratch, around you and the people you want to reach — never a template with your logo dropped in. The goal is simple: earn trust in the first second, and turn a visitor into an inquiry. Drag the slider to see a real redesign, before and after.",
    capabilities: [
      "Custom-designed and built, not templated",
      "Fast, and yours alone",
      "Turns first impressions into inquiries",
      "Real client work — see it right here",
    ],
    visual: <WebsiteRedesignVisual />,
  },
  {
    number: "Mobile experience",
    title: "Premium on every screen",
    tagline: "Because most of your visitors are holding a phone.",
    description:
      "Too many sites treat mobile as an afterthought — a desktop layout squeezed until it fits. We start on the phone and build up from there, so every tap and every scroll feels considered. The phone beside this is a demo we built to show the idea — scrolling on its own.",
    capabilities: [
      "Designed mobile-first, not shrunk down",
      "Smooth on any connection",
      "Built for thumbs, not just clicks",
      "A working demo, scrolling right here",
    ],
    visual: <MobileExperienceVisual />,
  },
  {
    number: "Advertising & marketing",
    title: "Getting the right people to it",
    tagline: "A beautiful site no one sees isn't doing its job.",
    description:
      "Once the work is ready, people need to find it. We run the ads and campaigns that reach the right customers — not just more eyes, the right ones. We treat your budget like our own, watch what actually performs, and tell you the truth about it in plain language.",
    capabilities: [
      "Paid ads that respect your budget",
      "Campaigns aimed at real customers",
      "Copy and creative that earns the click",
      "Honest reporting — what's working, what isn't",
    ],
    visual: <AdvertisingVisual />,
  },
  {
    number: "Graphic design & brand",
    title: "One brand, one voice, everywhere",
    tagline: "A logo is the start, not the finish.",
    description:
      "Your business should look like itself wherever it shows up — the website, an ad, a business card, the sign on the door. We build the whole visual identity: the colors, the type, the way it all feels. So everything holds together, and everything feels like you.",
    capabilities: [
      "Logos and full identity systems",
      "Consistent across every touchpoint",
      "Print, social, and packaging",
      "A brand that actually feels like you",
    ],
    visual: <BrandDesignVisual />,
  },
  {
    number: "Business & product",
    title: "A partner to think it through with",
    tagline: "Sometimes the hard part isn't the design.",
    description:
      "It's deciding what to offer, who it's for, and how to charge for it. We've helped owners shape products, sharpen an offer, and plan the next move — not from a textbook, but from having built the real thing ourselves. Consider us a sounding board that also knows how to make it.",
    capabilities: [
      "Straight, useful advice when you ask for it",
      "Shaping your offer and your pricing",
      "Product and go-to-market planning",
      "A steady partner as you grow",
    ],
    visual: <BusinessVisual />,
  },
];

const IMPACT = [
  { display: "50ms", label: "First impression", description: "People judge your website before they've read a single word." },
  { display: "75%", label: "Credibility from design", description: "Most people decide whether to trust a company by how its site looks." },
  { display: "88%", label: "Won't return after bad UX", description: "There's rarely a second chance to make a first impression online." },
  { display: "2×", label: "Conversion lift", description: "A thoughtful redesign often doubles the inquiries a site brings in." },
];

const TRUST = [
  {
    title: "One team, start to finish",
    body: "The people who design your work are the people who answer your emails. No handoffs, no account manager reading from a script.",
  },
  {
    title: "Built for you, not from a template",
    body: "Every project starts from your business and your goals — a blank canvas, not a theme with your name swapped in.",
  },
  {
    title: "We care how it does, not just how it looks",
    body: "A beautiful site that brings you no work is a failure. We measure success the way you do — in inquiries, customers, and growth.",
  },
  {
    title: "Work you can see for yourself",
    body: "Drag the sliders — a real client redesign. Watch the phone — a demo we built to show what's possible. Then let's talk about yours.",
  },
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
            What we do
          </p>
          <h1 className="mb-6 text-5xl font-light leading-tight tracking-tight text-[var(--archive-white)] sm:text-6xl md:text-7xl">
            We don&apos;t just build websites.
            <br />
            <span className="text-gradient">We help you grow.</span>
          </h1>
          <p className="max-w-xl text-base text-[var(--archive-white)]/55 sm:text-lg">
            Norvo is a design and growth partner for small businesses and organizations.
            Web, advertising, brand, and the strategy to connect them — built by people who
            care how your business does, not just how it looks.
          </p>
        </motion.div>

        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(ellipse at 60% 60%, rgba(109,93,251,0.06) 0%, transparent 60%)" }}
        />
      </div>

      {/* Positioning — the reframe */}
      <div className="border-t px-6 py-20 md:px-16 md:py-28" style={{ borderColor: "rgba(244,245,247,0.06)" }}>
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em]" style={{ color: "var(--norvo-violet)" }}>
            How we help
          </p>
          <h2 className="mb-8 text-3xl font-light leading-snug tracking-tight text-[var(--archive-white)] md:text-4xl">
            A partner for the whole business — not just the website.
          </h2>
          <div className="space-y-5 text-base leading-relaxed text-[var(--archive-white)]/60 md:text-lg">
            <p>
              Norvo started in web design, and it&apos;s still where we&apos;re happiest. But a
              great website is one piece of a bigger picture. So we grew with our clients:
              the ads that bring people in, the brand that ties it all together, and the
              thinking behind the offer itself.
            </p>
            <p>
              You get one small team that learns your business and stays with it. One point
              of contact. Real opinions when you ask for them. And work that&apos;s made for
              you, from the first idea to the thing that ships.
            </p>
          </div>
        </div>
      </div>

      {/* Impact stats */}
      <div className="border-y px-6 py-12 md:px-16" style={{ borderColor: "rgba(244,245,247,0.06)" }}>
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-4">
          {IMPACT.map((stat) => (
            <ImpactStat key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Service pillars */}
      <div id="services">
        {MODULES.map((mod, i) => (
          <CapabilityModule key={mod.number} index={i} {...mod} />
        ))}
      </div>

      {/* Trust — why work with Norvo */}
      <div className="border-b px-6 py-20 md:px-16 md:py-28" style={{ borderColor: "rgba(244,245,247,0.06)" }}>
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em]" style={{ color: "var(--norvo-violet)" }}>
            Why Norvo
          </p>
          <h2 className="mb-12 max-w-2xl text-3xl font-light leading-snug tracking-tight text-[var(--archive-white)] md:text-4xl">
            Boutique means you&apos;re never just a ticket in a queue.
          </h2>
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {TRUST.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-1 w-6 rounded-full" style={{ background: "var(--norvo-gradient)" }} />
                  <h3 className="text-lg font-light text-[var(--archive-white)]">{point.title}</h3>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-[var(--archive-white)]/55">{point.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
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
              Ready when you are
            </p>
            <h2 className="mb-8 text-4xl font-light leading-tight text-[var(--archive-white)] md:text-5xl">
              Let&apos;s build something
              <br />
              <span className="text-gradient">worth returning to.</span>
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
