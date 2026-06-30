"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { PROJECTS, type Project } from "@/components/projectsData";

function ArtifactCard({ p, index }: { p: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  // Alternating depth offsets to create floating grid feel
  const yOffset = [0, -24, 12, -16][index % 4];

  const isLink = p.href || p.url;
  const href = p.href ?? p.url;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 + yOffset }}
      animate={inView ? { opacity: 1, y: yOffset } : { opacity: 0, y: 60 + yOffset }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: (index % 2) * 0.12 }}
      className="group relative"
    >
      <div
        className="relative overflow-hidden rounded-2xl border transition-all duration-500 group-hover:-translate-y-2"
        style={{
          background: "rgba(244,245,247,0.03)",
          borderColor: "rgba(244,245,247,0.08)",
        }}
      >
        {/* Violet glow border on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(109,93,251,0.5), 0 0 40px rgba(109,93,251,0.1)",
          }}
        />

        {/* Image / gradient preview */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {p.shot ? (
            <>
              <img
                src={p.shot}
                alt={p.name}
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14161A] via-[#14161A]/20 to-transparent" />
            </>
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              style={{ background: p.gradient }}
            >
              {/* Depth indicator dots */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-center text-white/20 transition-opacity duration-500 group-hover:text-white/40"
                >
                  <div className="text-4xl font-light tracking-widest">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kind badge */}
          <div className="absolute left-4 top-4 z-10">
            <span
              className="rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-widest"
              style={{
                background: p.kind === "live"
                  ? "rgba(109,93,251,0.2)"
                  : "rgba(216,180,106,0.2)",
                color: p.kind === "live" ? "#A89DFF" : "#D8B46A",
                border: `1px solid ${p.kind === "live" ? "rgba(109,93,251,0.3)" : "rgba(216,180,106,0.3)"}`,
              }}
            >
              {p.kind === "live" ? "Live" : "Prototype"}
            </span>
          </div>

          {/* Featured badge */}
          {p.featured && (
            <div className="absolute right-4 top-4 z-10">
              <span
                className="rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-widest"
                style={{
                  background: "rgba(216,180,106,0.15)",
                  color: "#D8B46A",
                  border: "1px solid rgba(216,180,106,0.2)",
                }}
              >
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-6">
          <div className="mb-1 text-[10px] tracking-[0.3em] text-[var(--archive-white)]/30 uppercase">
            {p.category}
          </div>
          <h3 className="mb-3 text-xl font-light tracking-tight text-[var(--archive-white)]">
            {p.name}
          </h3>
          <p className="mb-5 text-sm leading-relaxed text-[var(--archive-white)]/50">
            {p.description}
          </p>

          {/* CTA */}
          {isLink && (
            <div className="flex items-center gap-2 text-sm text-[var(--norvo-violet)] transition-all duration-300 group-hover:gap-3">
              <span>{p.kind === "live" ? "Visit site" : "View project"}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          )}
        </div>
      </div>

      {/* Wrapping with link if available */}
      {href && (
        <Link
          href={href}
          target={p.url ? "_blank" : undefined}
          rel={p.url ? "noopener noreferrer" : undefined}
          className="absolute inset-0"
          aria-label={p.name}
        />
      )}
    </motion.div>
  );
}

export default function ProjectsPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"],
  });
  const headerOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.8], [0, -40]);

  return (
    <main className="min-h-screen" style={{ background: "var(--graphite)" }}>

      {/* Hero header */}
      <div ref={headerRef} className="relative px-6 pb-16 pt-36 md:px-16 md:pt-44">
        <motion.div style={{ opacity: headerOpacity, y: headerY }}>
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[var(--archive-white)]/30">
            Archive · Projects
          </p>
          <h1 className="mb-6 text-5xl font-light leading-tight tracking-tight text-[var(--archive-white)] sm:text-6xl md:text-7xl">
            Client work &amp;
            <br />
            <span className="text-gradient">live experiments.</span>
          </h1>
          <p className="max-w-xl text-base text-[var(--archive-white)]/50 sm:text-lg">
            Real sites we&apos;ve shipped, plus interactive prototypes — each one a
            demonstration of what a Norvo build can do.
          </p>
        </motion.div>

        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(ellipse at 20% 60%, rgba(109,93,251,0.06) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Archive artifact grid */}
      <div className="px-6 pb-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          {/* Perspective wrapper for depth */}
          <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
            {PROJECTS.map((p, i) => (
              <ArtifactCard key={p.name} p={p} index={i} />
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-24 text-center"
          >
            <div
              className="inline-block rounded-2xl p-8 text-center"
              style={{
                background: "rgba(244,245,247,0.03)",
                border: "1px solid rgba(244,245,247,0.08)",
              }}
            >
              <p className="mb-2 text-[10px] tracking-[0.3em] text-[var(--archive-white)]/30 uppercase">
                Your project here
              </p>
              <h3 className="mb-4 text-2xl font-light text-[var(--archive-white)]">
                Ready to build something great?
              </h3>
              <Link
                href="/start"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(120deg, #6D5DFB, #D8B46A)" }}
              >
                Start a project →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
