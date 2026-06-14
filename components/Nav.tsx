"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import Logo from "./Logo";
import Button from "./Button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const item = {
  hidden: { opacity: 0, y: 60, rotate: 7 },
  show: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring" as const, stiffness: 130, damping: 15 } },
  exit: { opacity: 0, y: 40, rotate: -5, transition: { duration: 0.4, ease: [0.65, 0, 0.35, 1] as const } },
};

export default function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ y: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.6, delay: 0.15 } }}
        className="fixed inset-x-0 top-0 z-50"
      >
        {/* Background layer — pulled UP past top:0 to fill the safe-area strip
            and the rounded-corner gaps flanking the Dynamic Island. On iOS 26/27
            Safari a fixed top:0 sits at the island's bottom edge, so padding-top
            alone (which only grows downward) leaves those corners exposed and
            page content scrolls through them. Anchored to the bar's bottom and
            extended upward by max(env(safe-area-inset-top), 100px); the overshoot
            above the physical screen top is clipped by the viewport, so it stays
            correct even if iOS 27 beta under-reports env(safe-area-inset-top). */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 transition-colors duration-500 ${
            scrolled && !open ? "border-b border-black/5 bg-white/70 backdrop-blur-xl" : ""
          }`}
          style={{ top: "calc(max(env(safe-area-inset-top, 0px), 100px) * -1)" }}
        />
        <div
          style={{ paddingTop: "env(safe-area-inset-top)" }}
          className="relative z-10"
        >
          <motion.div
            animate={{ height: scrolled ? 52 : 80 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex max-w-7xl items-center justify-between px-6"
          >
          <Link href="/" aria-label="Norvo home" className="relative z-50">
            <Logo className="text-[1.7rem]" />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative text-sm text-black/70 transition-colors duration-300 hover:text-black"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-[var(--norvo-gradient)] transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
            <Button href="/start" variant="primary" size="sm">Start a project</Button>
          </nav>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <motion.span
              className="block h-0.5 w-6 rounded-full bg-black"
              animate={open ? { y: 4, rotate: 45 } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.span
              className="block h-0.5 w-6 rounded-full bg-black"
              animate={open ? { y: -4, rotate: -45 } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
            />
          </button>
          </motion.div>
        </div>
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute bottom-0 left-0 h-px w-full origin-left bg-[var(--norvo-gradient)]"
        />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white px-8 md:hidden"
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
              exit: { opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], when: "afterChildren" } },
            }}
          >
            <motion.nav
              className="flex flex-col items-center gap-9"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                exit: { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
              }}
            >
              {LINKS.map((l) => (
                <motion.div key={l.href} variants={item} style={{ transformOrigin: "0% 100%" }}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block font-display text-[2.5rem] font-light leading-none tracking-tight text-black transition-opacity duration-300 hover:opacity-50"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div className="mt-8" variants={item} style={{ transformOrigin: "0% 100%" }}>
                <Button href="/start" variant="primary" withArrow>Start a project</Button>
              </motion.div>
            </motion.nav>

            <motion.div
              className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3 text-[0.7rem] uppercase tracking-[0.25em] text-black/40"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { delay: 0.3, duration: 0.5 } },
                exit: { opacity: 0, transition: { duration: 0.3 } },
              }}
            >
              <a href="mailto:norvodesigns@gmail.com" className="transition-colors hover:text-black">norvodesigns@gmail.com</a>
              <span>Instagram · X · Facebook</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}