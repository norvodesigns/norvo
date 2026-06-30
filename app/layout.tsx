import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import CursorTrail from "@/components/CursorTrail";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { DeviceTiltProvider } from "@/components/DeviceTilt";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Norvo Designs — We Design The Future",
  description: "Norvo Designs is a web design studio that crafts the future. Immersive, conversion-focused websites for brands that demand excellence.",
  openGraph: {
    title: "Norvo Designs — We Design The Future",
    description: "Norvo Designs is a web design studio that crafts the future.",
    url: "https://norvo.vercel.app",
    siteName: "Norvo Designs",
    images: [
      {
        url: "/norvo word.jpg",
        width: 1200,
        height: 630,
        alt: "Norvo Designs",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={geistMono.variable}>
        <DeviceTiltProvider>
          <CursorTrail />
          <Nav />
          {children}
          <Footer />
        </DeviceTiltProvider>
      </body>
    </html>
  );
}
