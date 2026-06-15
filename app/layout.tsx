import type { Metadata, Viewport } from "next";
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

// viewport-fit=cover lets the page extend edge-to-edge into the device safe
// areas (e.g. behind the iPhone dynamic island) so the fixed nav can sit at the
// true top of the screen. Merged on top of Next's defaults (width=device-width,
// initial-scale=1), which are preserved.
export const viewport: Viewport = {
  viewportFit: "cover",
};

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