"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { submitContact } from "@/app/contact/actions";
import { G, ease } from "../constants";
import type { Nav } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(68,102,255,0.22)",
  color: G.white,
  fontSize: "0.85rem",
  padding: "0.75rem 0",
  outline: "none",
  transition: "border-color 0.25s ease",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(170,192,255,0.38)",
  fontSize: "0.5rem",
  letterSpacing: "0.38em",
  marginBottom: "0.5rem",
};

const VOYAGE_OPTIONS = [
  "Sub-Orbital Arc (ARC-180) — from $450K",
  "Orbital Voyage (ORB-420) — from $2.4M",
  "Lunar Transit (LNR-384) — from $18M",
  "General inquiry / not yet decided",
];

interface Props { navigate: Nav; }

export default function ContactView({ navigate: _navigate }: Props) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [voyage,  setVoyage]  = useState("");
  const [message, setMessage] = useState("");
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");
  const [pending, startTransition] = useTransition();
  const [focused, setFocused] = useState<string | null>(null);

  const valid = name.trim() !== "" && EMAIL_RE.test(email) && message.trim() !== "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("message", `[Aurora Inquiry]\nVoyage interest: ${voyage || "Not specified"}\n\n${message}`);
    startTransition(async () => {
      const res = await submitContact(fd);
      if (res.ok) setDone(true);
      else setErr(res.error ?? "Something went wrong. Please try again.");
    });
  }

  const blue = (f: string): React.CSSProperties => ({
    ...fieldStyle,
    borderBottom: `1px solid ${focused === f ? "rgba(68,102,255,0.70)" : "rgba(68,102,255,0.22)"}`,
  });

  if (done) {
    return (
      <div style={{
        minHeight: "100dvh", background: G.void,
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
            border: `1px solid ${G.glowSoft}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 2rem",
            color: G.glowSoft, fontSize: "1.25rem",
          }}>
            ✓
          </div>
          <div style={{ color: "rgba(100,110,255,0.55)", fontSize: "0.48rem", letterSpacing: "0.32em", marginBottom: "1rem" }}>
            TRANSMISSION RECEIVED
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 200,
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            color: G.white,
            marginBottom: "1rem",
          }}>
            We&apos;ll be in contact.
          </h2>
          <p style={{ color: "rgba(224,224,244,0.40)", fontSize: "0.80rem", maxWidth: 380, margin: "0 auto 2.5rem" }}>
            Our mission team will reach out to <span style={{ color: G.white }}>{email}</span> within 48 hours to discuss availability.
          </p>
          <button
            onClick={() => setDone(false)}
            style={{
              background: "transparent",
              border: "1px solid rgba(68,102,255,0.38)",
              color: "rgba(136,153,255,0.80)",
              padding: "0.65rem 2rem",
              fontSize: "0.55rem",
              letterSpacing: "0.28em",
              cursor: "pointer",
              fontFamily: "inherit",
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
      style={{ minHeight: "100dvh", background: G.void }}
    >
      {/* Header */}
      <div style={{ padding: "9rem 2rem 4rem", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          style={{ color: "rgba(100,110,255,0.60)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1.25rem" }}
        >
          SECURE A DEPARTURE
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
          Begin the Process
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.65, ease }}
          style={{ color: "rgba(224,224,244,0.35)", fontSize: "0.75rem", marginTop: "1.25rem", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}
        >
          All voyages are arranged privately. Our mission team will contact you to discuss availability, passenger requirements, and preparation.
        </motion.p>
      </div>

      {/* Flight classes strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        style={{
          display: "flex", justifyContent: "center", gap: "3rem",
          padding: "1.5rem 2rem 3rem",
          borderBottom: "1px solid rgba(68,102,255,0.10)",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Sub-Orbital",  detail: "90 minutes · from $450K" },
          { label: "Orbital",      detail: "3 days · from $2.4M" },
          { label: "Cislunar",     detail: "8 days · from $18M" },
        ].map(o => (
          <div key={o.label} style={{ textAlign: "center" }}>
            <div style={{ color: G.white, fontSize: "0.70rem", marginBottom: 4, fontWeight: 300 }}>{o.label}</div>
            <div style={{ color: "rgba(224,224,244,0.32)", fontSize: "0.55rem", letterSpacing: "0.10em" }}>{o.detail}</div>
          </div>
        ))}
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.7, ease }}
        style={{ maxWidth: 540, margin: "0 auto", padding: "4rem 2rem 8rem" }}
      >
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          <div>
            <label style={labelStyle}>YOUR NAME</label>
            <input
              style={blue("name")}
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Full name"
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div>
            <label style={labelStyle}>EMAIL ADDRESS</label>
            <input
              style={blue("email")}
              type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@address.com"
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div>
            <label style={labelStyle}>VOYAGE OF INTEREST</label>
            <select
              value={voyage}
              onChange={e => setVoyage(e.target.value)}
              style={{
                ...blue("voyage"),
                appearance: "none",
                WebkitAppearance: "none",
                cursor: "pointer",
                color: voyage ? G.white : "rgba(224,224,244,0.32)",
              }}
              onFocus={() => setFocused("voyage")}
              onBlur={() => setFocused(null)}
            >
              <option value="" style={{ background: G.hull, color: "rgba(224,224,244,0.55)" }}>Select a voyage class…</option>
              {VOYAGE_OPTIONS.map(v => (
                <option key={v} value={v} style={{ background: G.hull, color: G.white }}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>YOUR MESSAGE</label>
            <textarea
              style={{ ...blue("message"), resize: "none", minHeight: 120 }}
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Tell us about yourself and what you're looking for…"
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
            />
          </div>

          {err && (
            <div style={{ color: "rgba(136,153,255,0.80)", fontSize: "0.70rem" }}>{err}</div>
          )}

          <button
            type="submit"
            disabled={!valid || pending}
            style={{
              width: "100%",
              padding: "1rem",
              background: "transparent",
              border: `1px solid ${valid && !pending ? "rgba(68,102,255,0.55)" : "rgba(68,102,255,0.18)"}`,
              color: valid && !pending ? "rgba(136,153,255,0.95)" : "rgba(224,224,244,0.22)",
              fontSize: "0.55rem",
              letterSpacing: "0.3em",
              cursor: valid && !pending ? "pointer" : "not-allowed",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
            }}
          >
            {pending ? "TRANSMITTING…" : "BEGIN THE CONVERSATION"}
          </button>
        </form>

        <p style={{
          marginTop: "3rem",
          color: "rgba(224,224,244,0.18)",
          fontSize: "0.55rem",
          letterSpacing: "0.12em",
          textAlign: "center",
        }}>
          Our mission team responds within 48 hours.
        </p>
      </motion.div>
    </motion.div>
  );
}
