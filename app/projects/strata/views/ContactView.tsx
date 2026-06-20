"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { submitContact } from "@/app/contact/actions";
import { G, ease } from "../constants";
import type { Nav } from "../types";
import { AGENTS } from "../data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid rgba(224,223,219,0.22)`,
  color: G.white,
  fontSize: "0.85rem",
  padding: "0.75rem 0",
  outline: "none",
  transition: "border-color 0.25s ease",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: `rgba(250,250,249,0.4)`,
  fontSize: "0.5rem",
  letterSpacing: "0.38em",
  marginBottom: "0.5rem",
};

interface Props { navigate: Nav; }

export default function ContactView({ navigate: _navigate }: Props) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");
  const [pending, startTransition] = useTransition();

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const valid = name.trim() !== "" && EMAIL_RE.test(email) && message.trim() !== "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("message", message);
    startTransition(async () => {
      const res = await submitContact(fd);
      if (res.ok) {
        setDone(true);
      } else {
        setErr(res.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  const gold = (f: string): React.CSSProperties => ({
    ...fieldStyle,
    borderBottom: `1px solid ${focusedField === f ? `rgba(196,154,46,0.7)` : `rgba(224,223,219,0.22)`}`,
  });

  if (done) {
    return (
      <div style={{
        minHeight: "100dvh", background: G.black,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", textAlign: "center", padding: "4rem 2rem",
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            border: `1px solid ${G.gold}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 2rem",
            color: G.gold, fontSize: "1.25rem",
          }}>
            ✓
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 200,
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            color: G.white,
            marginBottom: "1rem",
          }}>
            Message received.
          </h2>
          <p style={{ color: `rgba(250,250,249,0.45)`, fontSize: "0.85rem", maxWidth: 380, margin: "0 auto 2.5rem" }}>
            We&apos;ll be in touch at <span style={{ color: G.white }}>{email}</span> within 1–2 business days.
          </p>
          <button
            onClick={() => setDone(false)}
            style={{
              background: "transparent",
              border: `1px solid rgba(196,154,46,0.4)`,
              color: `rgba(196,154,46,0.8)`,
              padding: "0.65rem 2rem",
              fontSize: "0.55rem",
              letterSpacing: "0.28em",
              cursor: "pointer",
            }}
          >
            SEND ANOTHER
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.01, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease }}
      style={{ minHeight: "100dvh", background: G.black }}
    >
      {/* Header */}
      <div style={{ padding: "9rem 2rem 4rem", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          style={{ color: `rgba(196,154,46,0.7)`, fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1.25rem" }}
        >
          PRIVATE ENQUIRIES
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100,
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            color: G.white,
            letterSpacing: "0.06em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          Contact Strata
        </motion.h1>
      </div>

      {/* Advisors */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        style={{
          display: "flex", justifyContent: "center", gap: "3rem",
          padding: "0 2rem 3rem",
          borderBottom: `1px solid rgba(224,223,219,0.1)`,
          flexWrap: "wrap",
        }}
      >
        {AGENTS.map(a => (
          <div key={a.id} style={{ textAlign: "center" }}>
            <div style={{ color: G.white, fontSize: "0.7rem", marginBottom: 2 }}>{a.name}</div>
            <div style={{ color: `rgba(250,250,249,0.4)`, fontSize: "0.55rem", letterSpacing: "0.12em" }}>{a.title}</div>
          </div>
        ))}
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease }}
        style={{ maxWidth: 540, margin: "0 auto", padding: "4rem 2rem 8rem" }}
      >
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          <div>
            <label style={labelStyle}>YOUR NAME</label>
            <input
              style={gold("name")}
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Jane Doe"
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div>
            <label style={labelStyle}>EMAIL ADDRESS</label>
            <input
              style={gold("email")}
              type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="jane@company.com"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div>
            <label style={labelStyle}>YOUR MESSAGE</label>
            <textarea
              style={{ ...gold("message"), resize: "none", minHeight: 120 }}
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Tell us about your interest…"
              onFocus={() => setFocusedField("message")}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          {err && (
            <div style={{ color: `rgba(196,154,46,0.8)`, fontSize: "0.7rem" }}>{err}</div>
          )}

          <button
            type="submit"
            disabled={!valid || pending}
            style={{
              width: "100%",
              padding: "1rem",
              background: "transparent",
              border: `1px solid ${valid && !pending ? `rgba(196,154,46,0.55)` : `rgba(224,223,219,0.18)`}`,
              color: valid && !pending ? `rgba(196,154,46,0.9)` : `rgba(250,250,249,0.25)`,
              fontSize: "0.55rem",
              letterSpacing: "0.3em",
              cursor: valid && !pending ? "pointer" : "not-allowed",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
            }}
          >
            {pending ? "SENDING…" : "SUBMIT ENQUIRY"}
          </button>
        </form>

        <p style={{
          marginTop: "3rem",
          color: `rgba(250,250,249,0.2)`,
          fontSize: "0.55rem",
          letterSpacing: "0.12em",
          textAlign: "center",
        }}>
          All communications are strictly confidential.
        </p>
      </motion.div>
    </motion.div>
  );
}
