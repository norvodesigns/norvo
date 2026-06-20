"use client";

import { useRef, useState, useTransition } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import ScrollReveal3D from "@/components/ScrollReveal3D";
import { submitContact } from "@/app/contact/actions";
import { G, ease } from "../constants";
import type { Nav } from "../types";
import { PROPERTIES, AGENTS } from "../data";

interface Props {
  id: string;
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Annotation corners — L-shaped bracket decorations
function Corner({ x, y, flip = false }: { x: string; y: string; flip?: boolean }) {
  const sx = flip ? -1 : 1;
  return (
    <motion.path
      d={`M ${x} ${y} l ${16 * sx} 0 M ${x} ${y} l 0 16`}
      stroke={G.gold}
      strokeWidth="0.8"
      strokeOpacity="0.35"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay: 1.3, duration: 0.7, ease }}
    />
  );
}

export default function PropertyDetailView({ id, navigate, containerRef }: Props) {
  const p = PROPERTIES.find(x => x.id === id) ?? PROPERTIES[0];
  const agent = AGENTS.find(a => a.id === p.agentId) ?? AGENTS[0];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    container: containerRef,
    offset: ["start start", "end start"],
  });

  const imgScale  = useTransform(heroScroll, [0, 1], [1.0, 1.12]);
  const overlayOp = useTransform(heroScroll, [0, 0.6], [0, 0.6]);
  const annoOp    = useTransform(heroScroll, [0, 0.3], [0.35, 0]);
  const titleY    = useTransform(heroScroll, [0, 1], ["0%", "20%"]);

  // Contact form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMsg, setFormMsg] = useState("I'm interested in " + p.name + ".");
  const [formDone, setFormDone] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [pending, startTransition] = useTransition();
  const [focused, setFocused] = useState<string | null>(null);

  const formValid = formName.trim() !== "" && EMAIL_RE.test(formEmail) && formMsg.trim() !== "";

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid || pending) return;
    const fd = new FormData();
    fd.append("name", formName);
    fd.append("email", formEmail);
    fd.append("message", `[${p.name}] ${formMsg}`);
    startTransition(async () => {
      const res = await submitContact(fd);
      if (res.ok) setFormDone(true);
      else setFormErr(res.error ?? "Something went wrong. Please try again.");
    });
  }

  const fieldBase: React.CSSProperties = {
    width: "100%", background: "transparent", border: "none",
    borderBottom: "1px solid rgba(224,223,219,0.2)",
    color: G.white, fontSize: "0.85rem", padding: "0.75rem 0",
    outline: "none", transition: "border-color 0.25s ease", fontFamily: "inherit",
  };
  const field = (f: string): React.CSSProperties => ({
    ...fieldBase,
    borderBottom: `1px solid ${focused === f ? "rgba(196,154,46,0.7)" : "rgba(224,223,219,0.2)"}`,
  });
  const label: React.CSSProperties = {
    display: "block", color: "rgba(250,250,249,0.4)",
    fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "0.5rem",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.01, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease }}
      style={{ background: G.black }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div ref={heroRef} style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>
        {/* Image + Ken Burns */}
        <motion.div style={{ position: "absolute", inset: "-8%", scale: imgScale }}>
          <img
            src={p.heroImage}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>

        {/* Overlay gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(13,13,11,0.5) 0%, transparent 30%, rgba(13,13,11,0.75) 80%, rgba(13,13,11,1) 100%)",
        }} />
        <motion.div style={{ position: "absolute", inset: 0, opacity: overlayOp, background: "rgba(13,13,11,1)" }} />

        {/* SVG annotation overlay */}
        <motion.svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: annoOp }}
        >
          {/* Corner brackets */}
          <Corner x="3" y="3" />
          <Corner x="97" y="3" flip />
          <Corner x="3" y="97" />
          <Corner x="97" y="97" flip />

          {/* Dashed annotation lines */}
          <motion.line
            x1="20" y1="35" x2="35" y2="35"
            stroke={G.gold} strokeWidth="0.4" strokeDasharray="2 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          />
          <motion.line
            x1="80" y1="55" x2="65" y2="55"
            stroke={G.gold} strokeWidth="0.4" strokeDasharray="2 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          />
        </motion.svg>

        {/* Annotation text labels */}
        <motion.div
          style={{ position: "absolute", opacity: annoOp }}
          className="hidden md:block"
        >
          <div style={{
            position: "absolute", top: "33%", left: "4%",
            color: "rgba(250,250,249,0.5)", fontSize: "0.42rem", letterSpacing: "0.22em",
          }}>
            <div style={{ color: "rgba(196,154,46,0.6)", marginBottom: 2 }}>FLOOR AREA</div>
            <div>{p.sqft} SQ FT</div>
          </div>
          <div style={{
            position: "absolute", top: "53%", right: "4%", textAlign: "right",
            color: "rgba(250,250,249,0.5)", fontSize: "0.42rem", letterSpacing: "0.22em",
          }}>
            <div style={{ color: "rgba(196,154,46,0.6)", marginBottom: 2 }}>ELEVATION</div>
            <div>{p.elevation}</div>
          </div>
        </motion.div>

        {/* Property name */}
        <motion.div
          style={{
            position: "absolute", left: 0, right: 0, top: "55%",
            textAlign: "center", y: titleY,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease }}
            style={{ color: "rgba(196,154,46,0.7)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "0.75rem" }}
          >
            {p.location.toUpperCase()} · {p.status.toUpperCase()}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.75, ease }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 100,
              fontSize: "clamp(2.2rem, 7vw, 6rem)",
              color: G.white,
              letterSpacing: "0.06em",
              margin: 0,
            }}
          >
            {p.name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            style={{ color: "rgba(196,154,46,0.85)", fontSize: "1rem", marginTop: "0.75rem", letterSpacing: "0.08em" }}
          >
            {p.priceRange}
          </motion.div>
        </motion.div>

        {/* Back nav */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          onClick={() => navigate({ view: "properties" })}
          style={{
            position: "absolute", top: 88, left: 24,
            background: "transparent",
            border: "1px solid rgba(224,223,219,0.2)",
            color: "rgba(250,250,249,0.6)",
            padding: "0.4rem 1rem",
            fontSize: "0.48rem",
            letterSpacing: "0.24em",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← PROPERTIES
        </motion.button>
      </div>

      {/* ── Content Body ──────────────────────────────────────────────── */}
      <div style={{
        background: G.black,
        backgroundImage: "radial-gradient(circle, rgba(196,154,46,0.025) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        padding: "0 2rem",
      }}>

        {/* Specs bar */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "2rem",
          padding: "3rem 0",
          borderBottom: "1px solid rgba(224,223,219,0.1)",
          maxWidth: 860, margin: "0 auto",
        }}>
          {[
            { l: "BEDS",       v: p.beds },
            { l: "BATHS",      v: p.baths },
            { l: "SQ FT",      v: p.sqft },
            { l: "YEAR BUILT", v: p.yearBuilt },
            { l: "LOT",        v: p.lot },
          ].map(x => (
            <div key={x.l}>
              <div style={{ color: "rgba(196,154,46,0.6)", fontSize: "0.45rem", letterSpacing: "0.28em", marginBottom: 4 }}>{x.l}</div>
              <div style={{ color: G.white, fontSize: "0.85rem" }}>{x.v}</div>
            </div>
          ))}
        </div>

        {/* Environmental data */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "1.5rem",
          padding: "2rem 0",
          borderBottom: "1px solid rgba(224,223,219,0.07)",
          maxWidth: 860, margin: "0 auto",
        }}>
          {[
            { l: "COORDINATES",   v: p.coordinates },
            { l: "ELEVATION",     v: p.elevation },
            { l: "DISTRICT",      v: p.district },
            { l: "ARCHITECTURE",  v: p.architecturalStyle },
            { l: "ORIENTATION",   v: p.orientation },
          ].map(x => (
            <div key={x.l} style={{ minWidth: 160 }}>
              <div style={{ color: "rgba(196,154,46,0.5)", fontSize: "0.42rem", letterSpacing: "0.24em", marginBottom: 3 }}>{x.l}</div>
              <div style={{ color: "rgba(250,250,249,0.55)", fontSize: "0.65rem" }}>{x.v}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ maxWidth: 720, margin: "5rem auto 0", padding: "0 0 4rem" }}>
          <ScrollReveal3D axis="x">
            <div style={{
              borderLeft: `2px solid rgba(196,154,46,0.3)`,
              paddingLeft: "1.5rem",
            }}>
              <p style={{
                color: "rgba(250,250,249,0.7)",
                fontSize: "0.9rem",
                lineHeight: 1.8,
                margin: 0,
                fontWeight: 300,
              }}>
                {p.description}
              </p>
            </div>
          </ScrollReveal3D>
        </div>

        {/* Features */}
        <div style={{ maxWidth: 720, margin: "0 auto 6rem" }}>
          <div style={{ color: "rgba(196,154,46,0.65)", fontSize: "0.5rem", letterSpacing: "0.32em", marginBottom: "2rem" }}>
            PROPERTY FEATURES
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "0.75rem 2rem",
          }}>
            {p.features.map((f, i) => (
              <ScrollReveal3D key={i} axis="x" direction={i % 2 === 0 ? 0 : 1}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  color: "rgba(250,250,249,0.6)",
                  fontSize: "0.75rem",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid rgba(224,223,219,0.07)",
                }}>
                  <span style={{ color: "rgba(196,154,46,0.5)", fontSize: "0.55rem" }}>—</span>
                  {f}
                </div>
              </ScrollReveal3D>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div style={{ maxWidth: 860, margin: "0 auto 6rem" }}>
          <div style={{ color: "rgba(196,154,46,0.65)", fontSize: "0.5rem", letterSpacing: "0.32em", marginBottom: "2rem" }}>
            GALLERY
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.75rem" }}>
            {p.gallery.map((img, i) => (
              <ScrollReveal3D key={i} axis="x" direction={i % 2 === 0 ? 0 : 1}>
                <motion.div
                  style={{ aspectRatio: "4/3", overflow: "hidden" }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    src={img}
                    alt={`${p.name} gallery ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    loading="lazy"
                  />
                </motion.div>
              </ScrollReveal3D>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div style={{ maxWidth: 720, margin: "0 auto 6rem" }}>
          <ScrollReveal3D axis="y">
            <div style={{ borderTop: "1px solid rgba(196,154,46,0.18)", paddingTop: "2rem" }}>
              <div style={{ color: "rgba(196,154,46,0.6)", fontSize: "0.45rem", letterSpacing: "0.28em", marginBottom: "0.75rem" }}>
                PRIMARY MATERIALS
              </div>
              <p style={{ color: "rgba(250,250,249,0.55)", fontSize: "0.8rem", margin: 0, lineHeight: 1.7 }}>
                {p.primaryMaterial}
              </p>
              <div style={{ marginTop: "1rem", color: "rgba(250,250,249,0.35)", fontSize: "0.65rem" }}>
                {p.proximityNote}
              </div>
            </div>
          </ScrollReveal3D>
        </div>

        {/* Agent */}
        <div style={{ maxWidth: 720, margin: "0 auto 6rem", borderTop: "1px solid rgba(224,223,219,0.08)", paddingTop: "3rem" }}>
          <div style={{ color: "rgba(196,154,46,0.6)", fontSize: "0.45rem", letterSpacing: "0.28em", marginBottom: "1.5rem" }}>
            YOUR ADVISOR
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <img
              src={agent.avatar}
              alt={agent.name}
              style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }}
            />
            <div>
              <div style={{ color: G.white, fontSize: "0.9rem", marginBottom: 2 }}>{agent.name}</div>
              <div style={{ color: "rgba(196,154,46,0.65)", fontSize: "0.55rem", letterSpacing: "0.14em", marginBottom: 6 }}>{agent.title}</div>
              <div style={{ color: "rgba(250,250,249,0.45)", fontSize: "0.6rem" }}>{agent.phone} · {agent.email}</div>
            </div>
          </div>
        </div>

        {/* ── Enquiry Form ────────────────────────────────────────────── */}
        <div style={{ maxWidth: 540, margin: "0 auto", paddingBottom: "10rem" }}>
          <div style={{ color: "rgba(196,154,46,0.65)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1rem" }}>
            REGISTER INTEREST
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 200,
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            color: G.white, margin: "0 0 2.5rem",
          }}>
            Enquire about {p.name}
          </h2>

          {formDone ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "3rem 0" }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: `1px solid ${G.gold}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.5rem", color: G.gold,
              }}>
                ✓
              </div>
              <p style={{ color: "rgba(250,250,249,0.6)", fontSize: "0.8rem" }}>
                Thank you. An advisor will be in touch shortly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={submitForm} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div>
                <label style={label}>YOUR NAME</label>
                <input style={field("name")} value={formName} onChange={e => setFormName(e.target.value)}
                  placeholder="Jane Doe"
                  onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <label style={label}>EMAIL</label>
                <input style={field("email")} type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                  placeholder="jane@company.com"
                  onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <label style={label}>MESSAGE</label>
                <textarea
                  style={{ ...field("msg"), resize: "none", minHeight: 100 }}
                  value={formMsg} onChange={e => setFormMsg(e.target.value)}
                  onFocus={() => setFocused("msg")} onBlur={() => setFocused(null)}
                />
              </div>
              {formErr && (
                <div style={{ color: "rgba(196,154,46,0.8)", fontSize: "0.7rem" }}>{formErr}</div>
              )}
              <button
                type="submit" disabled={!formValid || pending}
                style={{
                  width: "100%", padding: "1rem",
                  background: "transparent",
                  border: `1px solid ${formValid && !pending ? "rgba(196,154,46,0.55)" : "rgba(224,223,219,0.18)"}`,
                  color:  formValid && !pending ? "rgba(196,154,46,0.9)" : "rgba(250,250,249,0.25)",
                  fontSize: "0.55rem", letterSpacing: "0.3em",
                  cursor: formValid && !pending ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "all 0.3s ease",
                }}
              >
                {pending ? "SENDING…" : "SUBMIT ENQUIRY"}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
