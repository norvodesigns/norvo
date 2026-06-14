export type Project = {
  name: string;
  category: string;
  description: string;
  gradient: string;
  kind: "live" | "prototype";
  url?: string;
  href?: string;
  shot?: string;
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    name: "Mozart Laser",
    category: "Laser Engraving · E-commerce",
    description:
      "A personalized-gift storefront with a guided custom-design flow, built so ordering a one-of-a-kind engraved piece feels effortless.",
    gradient: "linear-gradient(135deg,#2f6bed,#7b2ff7)",
    kind: "live",
    url: "https://mozartlaser.com",
    shot: "/mozart-laser.jpeg",
    featured: true,
  },
  {
    name: "Amtex Marine",
    category: "Marine Manufacturing · Brand Site",
    description:
      "A modern, credible presence for a California marine manufacturer — capabilities and product range, structured to build trust at a glance.",
    gradient: "linear-gradient(135deg,#1e3a8a,#2f6bed)",
    kind: "live",
    url: "https://amtexmarine.com",
    shot: "/amtexmarine.jpeg",
  },
  {
    name: "Aurora",
    category: "Interactive Concept",
    description:
      "A living gradient field that stirs under your cursor — proof a background can feel alive without ever dropping a frame.",
    gradient: "linear-gradient(135deg,#7b2ff7,#a31bbf)",
    kind: "prototype",
    href: "/projects/aurora",
    featured: true,
  },
  {
    name: "Strata",
    category: "Interactive Concept",
    description:
      "Layered scenes that drift through real depth as you move — the 3D-feeling technique, isolated so you can play with it.",
    gradient: "linear-gradient(135deg,#2f6bed,#a31bbf)",
    kind: "prototype",
    href: "/projects/strata",
  },
];