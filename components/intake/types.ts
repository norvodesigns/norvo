// Shared shape + option sets for the /start project-intake wizard.
// Imported by the wizard (components/intake/ProjectIntake.tsx) and the
// server action (app/start/actions.ts) so both agree on the data.

export type Answers = {
  // Step 1 — Project
  name: string;
  email: string;
  company: string;
  projectType: string[];
  readiness: string;
  // Step 2 — Vision
  goals: string[];
  visionNotes: string;
  // Step 3 — Style & branding
  styles: string[];
  hasBranding: string;
  brandColors: string;
  references: string[];
  // Step 4 — Structure & pages
  pages: string[];
  features: string[];
  structureNotes: string;
  // Step 5 — Budget & timeline
  budget: string;
  timeline: string;
  hearAbout: string;
  // Meta — areas where they asked us to guide them
  needsGuidance: string[];
};

export const emptyAnswers = (): Answers => ({
  name: "",
  email: "",
  company: "",
  projectType: [],
  readiness: "",
  goals: [],
  visionNotes: "",
  styles: [],
  hasBranding: "",
  brandColors: "",
  references: [""],
  pages: [],
  features: [],
  structureNotes: "",
  budget: "",
  timeline: "",
  hearAbout: "",
  needsGuidance: [],
});

export const PROJECT_TYPES = ["New website", "Redesign", "Web app", "Not sure yet"];
export const READINESS = ["Just exploring", "Planning ahead", "Ready to start", "Need it ASAP"];
export const GOALS = [
  "Look more premium",
  "Get more leads",
  "Sell products online",
  "Showcase my work",
  "Launch a new brand",
  "Replace an outdated site",
];
export const STYLES = [
  "Minimal",
  "Bold",
  "Playful",
  "Luxury",
  "Editorial",
  "Techy / futuristic",
  "Warm / organic",
  "Corporate",
  "Artistic",
];
export const BRANDING = [
  "Yes — I have full branding",
  "Some pieces (logo / colours)",
  "No — we'll create it together",
];
export const PAGES = [
  "Home",
  "About",
  "Services",
  "Work / Portfolio",
  "Shop",
  "Blog",
  "Contact",
  "Booking",
  "Pricing",
  "FAQ",
  "Team",
];
export const FEATURES = [
  "Content management (CMS)",
  "E-commerce",
  "Booking / scheduling",
  "Blog / articles",
  "Multi-language",
  "3D / animation",
  "Member login",
  "Newsletter signup",
];
export const BUDGETS = [
  "Under $2k",
  "$2k–$5k",
  "$5k–$10k",
  "$10k–$25k",
  "$25k+",
  "Not sure / need guidance",
];
export const TIMELINES = ["ASAP", "1–3 months", "3–6 months", "Flexible / no rush"];

// Areas a user can flag "help me decide" on — surfaced prominently to Norvo.
export const GUIDANCE_AREAS = ["goals", "style", "pages", "budget"] as const;
