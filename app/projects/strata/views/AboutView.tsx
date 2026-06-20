"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Scramble } from "@/components/TextAnimations";
import ScrollReveal3D from "@/components/ScrollReveal3D";
import { G, ease } from "../constants";
import type { Nav } from "../types";

interface Props {
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const STATS = [
  { value: "IDX",  label: "MLS Integration Built In" },
  { value: "4–6w", label: "Weeks to Launch" },
  { value: "100%", label: "Custom, No Templates" },
  { value: "99+",  label: "Lighthouse Performance" },
];

const PILLARS = [
  {
    number: "01",
    title: "IDX / MLS Integration",
    body: "Live property feeds pulled directly from your MLS board. Every listing auto-synced — new, sold, price-changed. No manual uploads, no stale data.",
  },
  {
    number: "02",
    title: "Custom Design",
    body: "Bespoke visual identity and layout built around your market and clientele. Nothing off-the-shelf. Your brand, your neighbourhood, your site.",
  },
  {
    number: "03",
    title: "Lead Capture",
    body: "Property inquiry flows, valuation request forms, and instant email alerts — all wired to your inbox. No third-party CRM required to get started.",
  },
  {
    number: "04",
    title: "Fast Delivery",
    body: "Four to six weeks from kickoff to live site. Fixed scope, fixed timeline. You keep selling while we build.",
  },
];

export default function AboutView({ navigate: _navigate, containerRef }: Props) {
  const heroRef  = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    container: containerRef,
    offset: ["start start", "end start"],
  });

  const imgY   = useTransform(heroScroll, [0, 1], ["0%", "22%"]);
  const heroOp = useTransform(heroScroll, [0, 0.8], [1, 0]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.01, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease }}
      style={{ background: G.black }}
    >
      {/* Hero */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        style={{ position: "relative", height: "100dvh", overflow: "hidden" }}
      >
        <motion.div style={{ position: "absolute", inset: "-15%", y: imgY }}>
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            alt="Norvo builds real estate sites"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.22)" }}
          />
        </motion.div>

        <motion.div
          style={{
            position: "absolute", inset: 0, opacity: heroOp,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", textAlign: "center", padding: "0 2rem",
          }}
        >
          <div style={{ color: "rgba(196,154,46,0.7)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "2rem" }}>
            <Scramble text="ABOUT THIS DEMO" />
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100,
            fontSize: "clamp(3.5rem, 11vw, 9rem)",
            color: G.white,
            letterSpacing: "0.18em",
            lineHeight: 0.9,
            margin: 0,
          }}>
            {"NORVO".split("").map((l, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: "0.4em", rotateX: -60 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.7, ease }}
                style={{ display: "inline-block", transformStyle: "preserve-3d" }}
              >
                {l}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease }}
            style={{ marginTop: "1.5rem", color: "rgba(250,250,249,0.4)", fontSize: "0.65rem", letterSpacing: "0.2em" }}
          >
            REAL ESTATE WEBSITES · CUSTOM BUILT
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          style={{
            position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}
        >
          <span style={{ color: "rgba(250,250,249,0.3)", fontSize: "0.45rem", letterSpacing: "0.3em" }}>SCROLL</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 1, height: 28, background: "rgba(196,154,46,0.4)" }}
          />
        </motion.div>
      </section>

      {/* Mission + Stats */}
      <section style={{ padding: "10rem 2rem", position: "relative", overflow: "hidden" }}>
        {STATS.map((s, i) => {
          const topOffset = 8 + i * 25;
          return (
            <div key={i} style={{
              position: "absolute",
              top: `${topOffset}%`,
              left: i % 2 === 0 ? "-2%" : "auto",
              right: i % 2 === 1 ? "-2%" : "auto",
              fontFamily: "var(--font-display)",
              fontWeight: 100,
              fontSize: "clamp(6rem,20vw,22rem)",
              color: "rgba(196,154,46,0.05)",
              lineHeight: 1,
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}>
              {s.value}
            </div>
          );
        })}

        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto 8rem" }}>
          <ScrollReveal3D axis="x">
            <div style={{ color: "rgba(196,154,46,0.7)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1.5rem" }}>
              THE PRACTICE
            </div>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 200,
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              color: G.white,
              lineHeight: 1.5,
              margin: 0,
            }}>
              Norvo builds custom real estate websites for independent agents and boutique
              brokerages. Live IDX listings, lead capture, and a site that actually reflects
              your market — designed and shipped in four to six weeks.
            </p>
          </ScrollReveal3D>
        </div>

        <div style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "4rem 3rem",
          maxWidth: 640,
          margin: "0 auto",
        }}>
          {STATS.map((s, i) => (
            <ScrollReveal3D key={i} axis="x" direction={i % 2 === 0 ? 0 : 1}>
              <div style={{ borderTop: "1px solid rgba(196,154,46,0.25)", paddingTop: "1.25rem" }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 100,
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  color: G.gold,
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                }}>
                  {s.value}
                </div>
                <div style={{ color: "rgba(250,250,249,0.45)", fontSize: "0.55rem", letterSpacing: "0.22em" }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            </ScrollReveal3D>
          ))}
        </div>
      </section>

      {/* Quote */}
      <div
        ref={quoteRef}
        style={{
          padding: "10rem 2rem",
          textAlign: "center",
          position: "relative",
          borderTop: "1px solid rgba(224,223,219,0.08)",
        }}
      >
        <div style={{
          position: "absolute", top: "8rem", left: "5%",
          fontFamily: "Georgia, serif",
          fontSize: "clamp(8rem, 18vw, 18rem)",
          color: "rgba(196,154,46,0.08)",
          lineHeight: 1,
          pointerEvents: "none",
        }}>
          &ldquo;
        </div>
        <div style={{
          position: "absolute", bottom: "8rem", right: "5%",
          fontFamily: "Georgia, serif",
          fontSize: "clamp(8rem, 18vw, 18rem)",
          color: "rgba(196,154,46,0.08)",
          lineHeight: 1,
          pointerEvents: "none",
        }}>
          &rdquo;
        </div>

        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 100,
            fontSize: "clamp(1.6rem, 3.8vw, 3.2rem)",
            color: "rgba(250,250,249,0.82)",
            lineHeight: 1.35,
            maxWidth: 800,
            margin: "0 auto",
            position: "relative",
          }}
        >
          Most real estate sites look like they were built in a hurry.
          Yours shouldn&apos;t — because your market deserves better than a template.
        </motion.blockquote>
        <motion.cite
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{
            display: "block",
            marginTop: "2.5rem",
            color: "rgba(196,154,46,0.6)",
            fontSize: "0.55rem",
            letterSpacing: "0.28em",
            fontStyle: "normal",
          }}
        >
          — NORVO · CUSTOM REAL ESTATE BUILDS
        </motion.cite>
      </div>

      {/* What We Build */}
      <section style={{
        padding: "6rem 2rem 10rem",
        borderTop: "1px solid rgba(224,223,219,0.08)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <ScrollReveal3D axis="y">
            <div style={{ color: "rgba(196,154,46,0.7)", fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1rem" }}>
              WHAT WE BUILD
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 200,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: G.white,
              margin: 0,
            }}>
              Every Engagement
            </h2>
          </ScrollReveal3D>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "2.5rem",
          maxWidth: 960,
          margin: "0 auto",
        }}>
          {PILLARS.map((pillar, i) => (
            <ScrollReveal3D key={pillar.number} axis="x" direction={i % 2 === 0 ? 0 : 1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                style={{
                  padding: "2rem",
                  border: "1px solid rgba(196,154,46,0.12)",
                  background: "rgba(196,154,46,0.025)",
                  position: "relative",
                }}
              >
                {/* Gold top accent */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: 1,
                  background: "rgba(196,154,46,0.4)",
                }} />
                <div style={{
                  color: "rgba(196,154,46,0.35)",
                  fontSize: "0.5rem",
                  letterSpacing: "0.28em",
                  marginBottom: "1.25rem",
                }}>
                  {pillar.number}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 200,
                  fontSize: "1.15rem",
                  color: G.white,
                  margin: "0 0 1rem",
                }}>
                  {pillar.title}
                </h3>
                <p style={{
                  color: "rgba(250,250,249,0.45)",
                  fontSize: "0.75rem",
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {pillar.body}
                </p>
              </motion.div>
            </ScrollReveal3D>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
