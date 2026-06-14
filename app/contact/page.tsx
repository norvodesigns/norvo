import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact — Norvo",
  description:
    "Get in touch with Norvo — a question, a collaboration, or just to say hello. We reply within 1–2 business days.",
};

export default function ContactPage() {
  return (
    <main className="px-6 pb-32 pt-36">
      <div className="mx-auto max-w-3xl">
        <header className="mb-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/40">Contact</p>
          <h1 className="font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-6xl">
            Let&apos;s start a <span className="text-gradient">conversation.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-black/55 sm:text-lg">
            A question, a collaboration, or just want to say hello? Send us a note and we&apos;ll
            reply within 1–2 business days. Ready to brief a full project?{" "}
            <Link href="/start" className="text-[#0D7A7A] underline-offset-2 hover:underline">
              Start a project →
            </Link>
          </p>
        </header>

        <ContactForm />

        <div className="mt-12 flex flex-col gap-4 border-t border-black/5 pt-8 text-sm text-black/55 sm:flex-row sm:items-center sm:justify-between">
          <a href="mailto:norvodesigns@gmail.com" className="transition-colors hover:text-black">
            norvodesigns@gmail.com
          </a>
          <div className="flex gap-5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-black"
            >
              Instagram
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-black"
            >
              X
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-black"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
