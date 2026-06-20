"use client";

import { useState, useTransition } from "react";
import { submitContact, type ContactResult } from "@/app/contact/actions";
import SubmitSuccess from "@/components/SubmitSuccess";
import Button from "@/components/Button";

const inputCls =
  "w-full rounded-lg border border-black/15 px-4 py-3 text-sm outline-none transition focus:border-[#0D7A7A] focus:ring-2 focus:ring-[#0D7A7A]/20";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ContactResult | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const valid = name.trim() !== "" && EMAIL_RE.test(email) && message.trim() !== "";

  function buildMailto() {
    const body = `From: ${name}\nEmail: ${email}\n\n${message}`;
    return `mailto:norvodesigns@gmail.com?subject=${encodeURIComponent(
      `Website enquiry — ${name || "new message"}`,
    )}&body=${encodeURIComponent(body)}`;
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
      if (res.ok) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setDone(true);
      }
    });
  }

  if (done) {
    return (
      <SubmitSuccess
        heading="Message sent — thank you."
        body={
          <>
            We&apos;ll get back to you at{" "}
            <span className="text-black/80">{email}</span> within 1–2 business days.
          </>
        }
      />
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-black/80">Your name</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-black/80">Email</label>
          <input
            className={inputCls}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-black/80">Message</label>
        <textarea
          className={`${inputCls} min-h-40`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind…"
        />
      </div>

      {result && !result.ok && (
        <div className="rounded-xl border border-[#D9A441] bg-[#FBF3DF] p-4 text-sm text-[#7a5b12]">
          {result.code === "NO_EMAIL_CONFIGURED"
            ? "The form isn't fully connected yet — but your message isn't lost."
            : result.error}{" "}
          <a href={buildMailto()} className="font-medium underline">
            Email us directly →
          </a>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-black/5 pt-6">
        <p className="text-xs text-black/35">We&apos;ll never share your details.</p>
        <Button type="submit" disabled={!valid || pending} noTilt>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
