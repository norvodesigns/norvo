"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "motion/react";
import Button from "./Button";
import { PROJECTS } from "./projectsData";
import { ProjectCard } from "./ProjectCard";
import ScrollReveal3D from "./ScrollReveal3D";

export default function Projects() {
  const featured = PROJECTS.filter((p) => p.featured);
  const sectionRef = useRef<HTMLElement>(null);

  // Cursor-reactive ambient glow that drifts across the section
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 35, damping: 18 });
  const sy = useSpring(my, { stiffness: 35, damping: 18 });
  const glowX = useTransform(sx, (v) => `${v * 100}%`);
  const glowY = useTransform(sy, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(700px at ${glowX} ${glowY}, rgba(13,122,122,0.09) 0%, rgba(217,164,65,0.05) 40%, transparent 75%)`;

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      id="projects"
      className="relative px-6 py-28 sm:py-40"
    >
      {/* cursor-reactive ambient light */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: glow }}
      />

      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal3D className="mb-16 max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">Selected Work</p>
          <h2 className="font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-6xl">
            Real projects, <span className="text-gradient">live experiments.</span>
          </h2>
          <p className="mt-6 text-base text-black/55 sm:text-lg">
            A client site we&apos;ve shipped, and an interactive prototype you can play with right
            here — a taste of what a Norvo build can really do.
          </p>
        </ScrollReveal3D>

        <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16">
          {featured.map((p, i) => (
            <ScrollReveal3D key={p.name} axis="y" direction={i % 2 as 0 | 1}>
              <ProjectCard p={p} index={i} noReveal />
            </ScrollReveal3D>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mt-16 flex justify-center"
        >
          <Button href="/projects" variant="secondary">View all projects</Button>
        </motion.div>
      </div>
    </section>
  );
}