"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Scramble } from "@/components/TextAnimations";
import ScrollReveal3D from "@/components/ScrollReveal3D";
import { G, ease } from "../constants";
import type { Nav } from "../types";
import { AGENTS } from "../data";

interface Props {
  navigate: Nav;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const STATS = [
  { value: "847+", label: "Residences Placed" },
  { value: "$4.2B", label: "Portfolio Volume" },
  { value: "17", label: "Years of Practice" },
  { value: "98%", label: "Client Satisfaction" },
];

export default function AboutView({ navigate: _navigate, containerRef }: Props) {
  const heroRef  = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    container: containerRef,
    offset: ["start start", "end start"],
  });

  const imgY    = useTransform(heroScroll, [0, 1], ["0%", "22%"]);
  const heroOp  = useTransform(heroScroll, [0, 0.8], [1, 0]);

  const { scrollYProgress: quoteScroll } = useScroll({
    target: quoteRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

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
            alt="Strata Architecture"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.22)" }}
          />
        </motion.div>

        <motion.div
          style={{ position: "absolute", inset: 0, opacity: heroOp,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", textAlign: "center", padding: "0 2rem",
          }}
        >
          <div style={{ color: `rgba(196,154,46,0.7)`, fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "2rem" }}>
            <Scramble text="ABOUT STRATA" />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 100,
              fontSize: "clamp(3.5rem, 11vw, 9rem)",
              color: G.white,
              letterSpacing: "0.18em",
              lineHeight: 0.9,
              margin: 0,
            }}
          >
            {"ABOUT".split("").map((l, i) => (
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
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          style={{
            position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}
        >
          <span style={{ color: `rgba(250,250,249,0.3)`, fontSize: "0.45rem", letterSpacing: "0.3em" }}>SCROLL</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 1, height: 28, background: `rgba(196,154,46,0.4)` }}
          />
        </motion.div>
      </section>

      {/* Mission + Stats */}
      <section style={{ padding: "10rem 2rem", position: "relative", overflow: "hidden" }}>
        {/* Giant background numbers */}
        {STATS.map((s, i) => {
          const topOffset = 8 + i * 25;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${topOffset}%`,
                left: i % 2 === 0 ? "-2%" : "auto",
                right: i % 2 === 1 ? "-2%" : "auto",
                fontFamily: "var(--font-display)",
                fontWeight: 100,
                fontSize: "clamp(6rem,20vw,22rem)",
                color: `rgba(196,154,46,0.05)`,
                lineHeight: 1,
                pointerEvents: "none",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              {s.value}
            </div>
          );
        })}

        {/* Mission text */}
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto 8rem" }}>
          <ScrollReveal3D axis="x">
            <div style={{ color: `rgba(196,154,46,0.7)`, fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1.5rem" }}>
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
              We are a different kind of real estate practice. Where others sell properties,
              we broker the relationship between client and place — attending to architecture,
              material, light, and the long arc of how a residence will age into its landscape.
            </p>
          </ScrollReveal3D>
        </div>

        {/* Stat grid */}
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
              <div style={{ borderTop: `1px solid rgba(196,154,46,0.25)`, paddingTop: "1.25rem" }}>
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
                <div style={{ color: `rgba(250,250,249,0.45)`, fontSize: "0.55rem", letterSpacing: "0.22em" }}>
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
          borderTop: `1px solid rgba(224,223,219,0.08)`,
        }}
      >
        {/* Decorative quote marks */}
        <div style={{
          position: "absolute", top: "8rem", left: "5%",
          fontFamily: "Georgia, serif",
          fontSize: "clamp(8rem, 18vw, 18rem)",
          color: `rgba(196,154,46,0.08)`,
          lineHeight: 1,
          pointerEvents: "none",
        }}>
          &ldquo;
        </div>
        <div style={{
          position: "absolute", bottom: "8rem", right: "5%",
          fontFamily: "Georgia, serif",
          fontSize: "clamp(8rem, 18vw, 18rem)",
          color: `rgba(196,154,46,0.08)`,
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
            color: `rgba(250,250,249,0.82)`,
            lineHeight: 1.35,
            maxWidth: 800,
            margin: "0 auto",
            position: "relative",
          }}
        >
          Architecture is the thoughtful making of space.
          We ensure that every space we place you in
          was made with that kind of thought.
        </motion.blockquote>
        <motion.cite
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{
            display: "block",
            marginTop: "2.5rem",
            color: `rgba(196,154,46,0.6)`,
            fontSize: "0.55rem",
            letterSpacing: "0.28em",
            fontStyle: "normal",
          }}
        >
          — STRATA ADVISORY, SINCE 2008
        </motion.cite>
      </div>

      {/* Team */}
      <section style={{
        padding: "6rem 2rem 10rem",
        borderTop: `1px solid rgba(224,223,219,0.08)`,
      }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <ScrollReveal3D axis="y">
            <div style={{ color: `rgba(196,154,46,0.7)`, fontSize: "0.5rem", letterSpacing: "0.36em", marginBottom: "1rem" }}>
              THE TEAM
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 200,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: G.white,
              margin: 0,
            }}>
              Your Advisors
            </h2>
          </ScrollReveal3D>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem",
          maxWidth: 960,
          margin: "0 auto",
        }}>
          {AGENTS.map((a, i) => (
            <ScrollReveal3D key={a.id} axis="x" direction={i % 2 === 0 ? 0 : 1}>
              <motion.div
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.45 }}
              >
                <motion.img
                  src={a.avatar}
                  alt={a.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  whileHover={{ filter: "saturate(0.55)", scale: 1.04 }}
                  transition={{ duration: 0.45 }}
                />
                {/* Gradient overlay — always visible name */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "2rem 1.25rem 1.25rem",
                  background: "linear-gradient(to top, rgba(13,13,11,0.95) 0%, transparent 100%)",
                }}>
                  <div style={{ color: G.white, fontWeight: 400, fontSize: "0.9rem", marginBottom: 2 }}>{a.name}</div>
                  <div style={{ color: `rgba(196,154,46,0.7)`, fontSize: "0.55rem", letterSpacing: "0.16em" }}>{a.title}</div>
                </div>
              </motion.div>
            </ScrollReveal3D>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
