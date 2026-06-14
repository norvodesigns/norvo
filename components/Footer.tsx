"use client";

import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#061212] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">

          {/* wordmark + tagline */}
          <div>
            <img
              src="/norvo word.png"
              alt="Norvo"
              style={{ height: "100px", width: "auto", filter: "brightness(0) invert(1)", opacity: 0.85, marginTop: "-28px" }}
            />
            <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-white/30">
              3D-feeling web spaces for organizations that want to stand out.
            </p>
          </div>

          {/* nav */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm text-white/35 transition-colors duration-300 hover:text-white/75">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* contact */}
          <div className="space-y-3">
            <a href="mailto:norvodesigns@gmail.com"
              className="block text-sm text-white/35 transition-colors duration-300 hover:text-white/75">
              norvodesigns@gmail.com
            </a>
            <div className="flex gap-5 text-sm text-white/25">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-white/65">Instagram</a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-white/65">X</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-white/65">Facebook</a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/[0.06] pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-white/18">© {new Date().getFullYear()} Norvo. All rights reserved.</p>
          <p className="text-xs text-white/18">Designed &amp; built by Norvo.</p>
        </div>
      </div>
    </footer>
  );
}