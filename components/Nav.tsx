"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import Logo from "./Logo";
import Button from "./Button";
import { useDeviceTilt } from "./DeviceTilt";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: 16, transition: { duration: 0.22, ease: [0.65, 0, 0.35, 1] as const } },
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

  // Gyro-driven 3D tilt for the open mobile menu — the whole panel reads like a
  // floating pane of glass you steer by tilting the phone.
  const tilt = useDeviceTilt();
  const reduceMotion = useReducedMotion();
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  // Balanced axes + snappy springs → tilts cleanly toward where you point the
  // phone instead of lagging/overshooting toward a corner.
  const menuRotX = useSpring(useTransform(gy, [-1, 1], [15, -15]), { stiffness: 150, damping: 20 });
  const menuRotY = useSpring(useTransform(gx, [-1, 1], [-15, 15]), { stiffness: 150, damping: 20 });
  useEffect(() => {
    if (reduceMotion || !open || !tilt?.enabled) return;
    const apply = () => { gx.set(tilt.tiltX.get()); gy.set(tilt.tiltY.get()); };
    apply();
    const ux = tilt.tiltX.on("change", apply);
    const uy = tilt.tiltY.on("change", apply);
    return () => { ux(); uy(); gx.set(0); gy.set(0); };
  }, [reduceMotion, open, tilt, gx, gy]);

  return (
    <>
      <motion.header
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ y: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.6, delay: 0.15 } }}
        className="fixed inset-x-0 top-0 z-50 hidden md:block"
      >
        <div
          className={`transition-colors duration-500 ${
            scrolled && !open ? "border-b border-black/5 bg-white/70 backdrop-blur-xl" : ""
          }`}
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
          </motion.div>
        </div>
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute bottom-0 left-0 h-px w-full origin-left bg-[var(--norvo-gradient)]"
        />
      </motion.header>

      {/* Mobile: floating wordmark (no background) top-left + hamburger circle
          top-right. No full-width bar, so nothing has to cover the strip beside
          the Dynamic Island. Both sit just below the safe-area inset. */}
      <Link
        href="/"
        aria-label="Norvo home"
        onClick={() => setOpen(false)}
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
        className="fixed left-5 z-50 flex h-11 items-center md:hidden"
      >
        <Logo className="text-[1.7rem]" />
      </Link>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
        className="fixed right-4 z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white/70 shadow-sm backdrop-blur-xl md:hidden"
      >
        <motion.span
          className="block h-0.5 w-5 rounded-full bg-black"
          animate={open ? { y: 4, rotate: 45 } : { y: 0, rotate: 0 }}
          transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
        />
        <motion.span
          className="block h-0.5 w-5 rounded-full bg-black"
          animate={open ? { y: -4, rotate: -45 } : { y: 0, rotate: 0 }}
          transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
        />
      </button>

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
              // NOTE: no preserve-3d here — it was rendering the staggered items
              // in 3D space and breaking the fade/stagger. A flat plane that tilts
              // is what we want. Lower perspective = a more pronounced 3D tip.
              style={{ rotateX: menuRotX, rotateY: menuRotY, transformPerspective: 800 }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                exit: { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
              }}
            >
              {LINKS.map((l) => (
                <motion.div key={l.href} variants={item}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block font-display text-[2.5rem] font-light leading-none tracking-tight text-black transition-opacity duration-300 hover:opacity-50"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              {/* noTilt: the panel already tilts as one plane — its own tilt would
                  double up and make it move out of sync with the links */}
              <motion.div className="mt-8" variants={item}>
                <Button href="/start" variant="primary" withArrow noTilt onClick={() => setOpen(false)}>Start a project</Button>
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