"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { submitContact, type ContactResult } from "@/app/contact/actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function inputClass(focused: boolean) {
  return `w-full rounded-xl border bg-transparent px-4 py-3.5 text-sm text-[var(--archive-white)] outline-none transition-all duration-300 placeholder:text-[var(--archive-white)]/20 ${
    focused
      ? "border-[var(--norvo-violet)] ring-2 ring-[var(--norvo-violet)]/10"
      : "border-[rgba(244,245,247,0.12)] hover:border-[rgba(244,245,247,0.2)]"
  }`;
}

function SuccessState({ email }: { email: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="py-16 text-center"
    >
      <div
        className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl"
        style={{ background: "rgba(109,93,251,0.15)", border: "1px solid rgba(109,93,251,0.3)" }}
      >
        ✓
      </div>
      <h3 className="mb-3 text-2xl font-light text-[var(--archive-white)]">
        Transmission received.
      </h3>
      <p className="text-sm text-[var(--archive-white)]/50">
        We&apos;ll respond to{" "}
        <span className="text-[var(--archive-white)]/80">{email}</span>{" "}
        within 1–2 business days.
      </p>
    </motion.div>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [result, setResult] = useState<ContactResult | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const valid = name.trim() !== "" && EMAIL_RE.test(email) && message.trim() !== "";

  function buildMailto() {
    const body = `From: ${name}\nEmail: ${email}\n\n${message}`;
    return `mailto:norvodesigns@gmail.com?subject=${encodeURIComponent(`Website enquiry — ${name || "new message"}`)}&body=${encodeURIComponent(body)}`;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("message", message);
    startTransition(async () => {
      const res = await submitContact(fd);
      setResult(res);
      if (res.ok) { setDone(true); }
    });
  }

  if (done) return <SuccessState email={email} />;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] tracking-[0.3em] text-[var(--archive-white)]/30 uppercase">
            Name
          </label>
          <input
            className={inputClass(focused === "name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] tracking-[0.3em] text-[var(--archive-white)]/30 uppercase">
            Email
          </label>
          <input
            className={inputClass(focused === "email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            placeholder="jane@company.com"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[10px] tracking-[0.3em] text-[var(--archive-white)]/30 uppercase">
          Message
        </label>
        <textarea
          className={`${inputClass(focused === "message")} min-h-36`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setFocused("message")}
          onBlur={() => setFocused(null)}
          placeholder="Tell us what's on your mind…"
        />
      </div>

      {result && !result.ok && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: "rgba(216,180,106,0.08)", border: "1px solid rgba(216,180,106,0.2)", color: "#D8B46A" }}
        >
          {result.code === "NO_EMAIL_CONFIGURED"
            ? "Form not yet connected — "
            : result.error + " — "}
          <a href={buildMailto()} className="underline">
            email us directly →
          </a>
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-5" style={{ borderColor: "rgba(244,245,247,0.08)" }}>
        <p className="text-xs text-[var(--archive-white)]/25">We&apos;ll never share your details.</p>
        <motion.button
          type="submit"
          disabled={!valid || pending}
          className="rounded-full px-8 py-3.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "linear-gradient(120deg, #6D5DFB, #D8B46A)" }}
          whileHover={valid && !pending ? { scale: 1.02 } : {}}
          whileTap={valid && !pending ? { scale: 0.97 } : {}}
        >
          {pending ? "Transmitting…" : "Initiate →"}
        </motion.button>
      </div>
    </form>
  );
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen px-6 pb-32 pt-36 md:px-16 md:pt-40" style={{ background: "var(--graphite)" }}>

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse at 40% 30%, rgba(109,93,251,0.06) 0%, transparent 60%)" }}
      />

      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[var(--archive-white)]/30">
            Contact
          </p>
          <h1 className="mb-5 text-4xl font-light leading-tight tracking-tight text-[var(--archive-white)] sm:text-5xl md:text-6xl">
            Initiate collaboration
            <br />
            <span className="text-gradient">protocol.</span>
          </h1>
          <p className="max-w-lg text-base text-[var(--archive-white)]/50">
            A question, a brief, or just want to connect? Send a transmission and we&apos;ll
            respond within 1–2 business days. Ready to brief a full project?{" "}
            <Link href="/start" className="text-[var(--norvo-violet)] transition-opacity hover:opacity-70">
              Start a project →
            </Link>
          </p>
        </motion.header>

        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: "rgba(244,245,247,0.03)",
            border: "1px solid rgba(244,245,247,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--norvo-violet)", boxShadow: "0 0 6px var(--norvo-violet)" }}
            />
            <span className="text-[10px] tracking-[0.3em] text-[var(--archive-white)]/30 uppercase">
              Transmission channel
            </span>
          </div>

          <ContactForm />
        </motion.div>

        {/* Footer details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col gap-4 border-t pt-8 text-sm sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "rgba(244,245,247,0.06)" }}
        >
          <a
            href="mailto:norvodesigns@gmail.com"
            className="text-[var(--archive-white)]/40 transition-colors hover:text-[var(--archive-white)]/80"
          >
            norvodesigns@gmail.com
          </a>
          <div className="flex gap-5 text-[var(--archive-white)]/30">
            {["Instagram", "X", "Facebook"].map((social) => (
              <a
                key={social}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--archive-white)]/70"
              >
                {social}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
