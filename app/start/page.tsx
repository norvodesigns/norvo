import ProjectIntake from "@/components/intake/ProjectIntake";

export const metadata = {
  title: "Start a project — Norvo",
  description:
    "Tell us about your project — whether you have a detailed vision or just a spark of an idea. We'll take it from there.",
};

export default function StartPage() {
  return (
    <main className="px-6 pb-32 pt-36">
      <div className="mx-auto max-w-3xl">
        <header className="mb-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">Start a project</p>
          <h1 className="font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-6xl">
            Tell us about your <span className="text-gradient">project.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-black/55 sm:text-lg">
            Whether you know exactly what you want or you're just starting to dream it up, this
            only takes a few minutes. Skip anything you're unsure about — we'll fill in the gaps
            together.
          </p>
        </header>

        <ProjectIntake />
      </div>
    </main>
  );
}
