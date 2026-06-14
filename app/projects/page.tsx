"use client";

import { PROJECTS } from "@/components/projectsData";
import { ProjectCard } from "@/components/ProjectCard";

export default function ProjectsPage() {
  return (
    <main className="px-6 pb-32 pt-36">
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">Projects</p>
          <h1 className="font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-6xl">
            Client work &amp;{" "}
            <span className="text-gradient">live experiments.</span>
          </h1>
          <p className="mt-6 text-base text-black/55 sm:text-lg">
            Real sites we&apos;ve shipped, plus interactive prototypes you can play with — each one
            a demonstration of what a Norvo build can do.
          </p>
        </header>
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.name} p={p} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}