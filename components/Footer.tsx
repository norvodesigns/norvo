"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer
      className="border-t px-6 py-16"
      style={{ borderColor: "var(--border)", background: "rgba(20,22,26,0.98)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">

          <div>
            <div className="text-[var(--archive-white)]">
              <Logo className="text-[2rem]" />
            </div>
            <p className="mt-4 max-w-[220px] text-sm leading-relaxed text-[var(--archive-white)]/30">
              We design the future of the web.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm text-[var(--archive-white)]/35 transition-colors duration-300 hover:text-[var(--archive-white)]/75">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-3">
            <a href="mailto:norvodesigns@gmail.com"
              className="block text-sm text-[var(--archive-white)]/35 transition-colors duration-300 hover:text-[var(--archive-white)]/75">
              norvodesigns@gmail.com
            </a>
            <div className="flex gap-5 text-sm text-[var(--archive-white)]/25">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-[var(--archive-white)]/65">Instagram</a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-[var(--archive-white)]/65">X</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-[var(--archive-white)]/65">Facebook</a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t pt-8 sm:flex-row sm:justify-between"
          style={{ borderColor: "var(--border)" }}>
          <p className="text-xs text-[var(--archive-white)]/18">© 2026 Norvo Designs. All rights reserved.</p>
          <p className="text-xs text-[var(--archive-white)]/18">Designed &amp; built by Norvo.</p>
        </div>
      </div>
    </footer>
  );
}
