import type { Metadata } from "next";
import { Geist, Sora } from "next/font/google";
import "./globals.css";
import CursorTrail from "@/components/CursorTrail";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SafeAreaDebug from "@/components/SafeAreaDebug";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["100", "200", "300", "400", "600", "700"] });

export const metadata: Metadata = {
  title: "Norvo — 3D-feeling web spaces",
  description: "We create beautiful 3D-feeling web spaces for small businesses and organizations.",
  openGraph: {
    title: "Norvo — 3D-feeling web spaces",
    description: "We create beautiful 3D-feeling web spaces for small businesses and organizations.",
    url: "https://norvo.vercel.app",
    siteName: "Norvo",
    images: [
      {
        url: "/norvo word.jpg",
        width: 1200,
        height: 630,
        alt: "Norvo",
      },
    ],
    type: "website",
  },
};

// NOTE: deliberately NO viewport-fit=cover. On iOS the layout viewport then
// insets below the Dynamic Island, so the fixed nav sits right under the island
// (the highest spot iOS will render a fixed element) and page content can't
// scroll up into the strip beside/above the island. That strip is filled by the
// root background-color instead — see html { background } in globals.css.

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${sora.variable}`}>
        <CursorTrail />
        <Nav />
        {children}
        <Footer />
        <SafeAreaDebug />
      </body>
    </html>
  );
}