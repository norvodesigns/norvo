import { Metadata } from "next";
import ProjectIntake from "@/components/intake/ProjectIntake";

export const metadata: Metadata = {
  title: "Start a project — Norvo Designs",
  description: "Tell us about your project. Whether you have a detailed vision or just a spark of an idea, we'll take it from there.",
};

export default function StartPage() {
  return (
    <main
      className="relative min-h-screen px-6 pb-32 pt-36 md:px-16 md:pt-44"
      style={{ background: "var(--graphite)" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse at 60% 20%, rgba(109,93,251,0.07) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-2xl">
        <header className="mb-14">
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[var(--archive-white)]/30">
            New Project
          </p>
          <h1 className="mb-5 text-4xl font-light leading-tight tracking-tight text-[var(--archive-white)] sm:text-5xl md:text-6xl">
            Tell us about your
            <br />
            <span className="text-gradient">project.</span>
          </h1>
          <p className="max-w-lg text-base text-[var(--archive-white)]/50">
            Whether you know exactly what you want or you&apos;re just starting to dream it up,
            this only takes a few minutes. Skip anything you&apos;re unsure about — we&apos;ll
            fill in the gaps together.
          </p>
        </header>

        <ProjectIntake />
      </div>
    </main>
  );
}
