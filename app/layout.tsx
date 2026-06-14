import type { Metadata } from "next";
import { Geist, Sora } from "next/font/google";
import "./globals.css";
import CursorTrail from "@/components/CursorTrail";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["100", "200", "300", "400", "600", "700"] });

export const metadata: Metadata = {
  title: "Norvo — 3D-feeling web spaces",
  description: "We create beautiful 3D-feeling web spaces for small businesses and organizations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${sora.variable}`}>
        <CursorTrail />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}