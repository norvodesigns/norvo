import type { Destination, DestinationId } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Aurora — Interplanetary Navigation Data
// All content is entirely fictional. Not a real company or flight operator.
// ─────────────────────────────────────────────────────────────────────────────

export const DESTINATIONS: Destination[] = [
  // ─── Earth — Home ────────────────────────────────────────────────────────────
  {
    id: "earth",
    name: "Earth",
    designation: "SOL-III",
    classification: "Terrestrial Origin World",
    role: "DEPARTURE ORIGIN",
    tagline: "Every journey begins with a last breath of atmosphere",
    description:
      "All Aurora missions originate from a classified ground facility — accessible only by verified passenger manifest. Your last contact with gravity as you know it occurs here. This node marks the threshold. Beyond this entry point, you are committed.",
    distance: "0 km",
    travelTime: "Departure in T-minus 72 hours",
    gravity: "1.0g",
    status: "ORIGIN NODE · ACTIVE",
    highlights: [
      "Pre-flight medical screening and certification",
      "Private mission briefing with lead pilot",
      "Pressure suit fitting and calibration",
      "Final transmission suite — encrypted personal messages",
      "Departure dinner at altitude +4,200m",
      "Ground crew escort to launch vehicle",
    ],
    stats: [
      { label: "Altitude", value: "0 km" },
      { label: "Gravity", value: "1.0g" },
      { label: "Atmosphere", value: "N₂/O₂ Standard" },
      { label: "Node type", value: "Origin" },
      { label: "Departure window", value: "Monthly" },
      { label: "Clearance level", value: "AURORA-1" },
    ],
    worldX: 0,
    worldY: 0,
    radius: 0.36,
    glowColor: "#4488FF",
    planetType: 0,
  },

  // ─── Luna — About ─────────────────────────────────────────────────────────────
  {
    id: "luna",
    name: "Luna",
    designation: "LUNA-001",
    classification: "Natural Satellite · Sol",
    role: "THE FIRST HORIZON",
    tagline: "Silence at 384,400 kilometres",
    description:
      "Humanity's first stepping stone. Aurora operates a cislunar transit route with a 3-day approach phase and optional low-orbit pass over the far side — a hemisphere no surface observer has ever seen directly. The regolith here has not shifted in four billion years. You will leave footprints that outlast civilisations.",
    distance: "384,400 km",
    travelTime: "3 days",
    gravity: "0.165g",
    status: "AVAILABLE · NEXT WINDOW 14 DAYS",
    highlights: [
      "Far-side flyover — the hemisphere Earth never sees",
      "Earthrise observation from lunar orbit",
      "Low-gravity surface excursion (EVA-certified passengers)",
      "Regolith sample collection under mission geologist",
      "Silence protocol: 24-hour communication blackout option",
      "Aurora Cislunar documentation package",
    ],
    stats: [
      { label: "Distance", value: "384,400 km" },
      { label: "Transit", value: "3 days" },
      { label: "Gravity", value: "0.165g" },
      { label: "Temperature", value: "-173°C / +127°C" },
      { label: "Orbit altitude", value: "100 km" },
      { label: "Passengers", value: "4 max" },
    ],
    worldX: 3.2,
    worldY: 1.6,
    radius: 0.18,
    glowColor: "#A0A8B8",
    planetType: 1,
  },

  // ─── Mars — Destinations ──────────────────────────────────────────────────────
  {
    id: "mars",
    name: "Mars",
    designation: "SOL-IV",
    classification: "Terrestrial Planet · Inner System",
    role: "THE RED FRONTIER",
    tagline: "Six months of void. A lifetime of perspective",
    description:
      "Aurora's most ambitious current destination. The Valles Marineris canyon system is 4,000 kilometres long and drops 7 kilometres in depth — no other canyon in the solar system compares. Olympus Mons rises 22 kilometres above the surrounding plain. A world of extremes, absolute quiet, and the most violent dust storms ever measured.",
    distance: "54.6M – 401.3M km",
    travelTime: "6–9 months",
    gravity: "0.376g",
    status: "EXPEDITION · APPLICATION REQUIRED",
    highlights: [
      "Valles Marineris canyon rim observation (EVA protocol)",
      "Olympus Mons approach — highest known volcano in the solar system",
      "Martian sunset photography — blue twilight phenomenon",
      "Private pressurised habitat at Aurora Base Ares",
      "Areology field sessions with mission geologist",
      "Dust storm monitoring — classified as extreme experience",
    ],
    stats: [
      { label: "Distance", value: "54.6M – 401.3M km" },
      { label: "Transit", value: "6–9 months" },
      { label: "Gravity", value: "0.376g" },
      { label: "Temperature", value: "-87°C / -5°C" },
      { label: "Day length", value: "24h 37m" },
      { label: "Passengers", value: "6 max" },
    ],
    worldX: 7.0,
    worldY: -2.0,
    radius: 0.24,
    glowColor: "#CC4422",
    planetType: 2,
  },

  // ─── Europa — Experiences ─────────────────────────────────────────────────────
  {
    id: "europa",
    name: "Europa",
    designation: "JUP-II",
    classification: "Galilean Moon · Jupiter",
    role: "SUBSURFACE OCEANS",
    tagline: "An alien sea beneath 25 kilometres of ice",
    description:
      "Europa is cracked like a broken mirror — fracture lines running thousands of kilometres across its icy shell, stained rust-red where the subsurface ocean bleeds through. Aurora operates an orbital platform above the chaos terrain. The ocean beneath contains twice the liquid water of all of Earth's oceans combined. You will be the closest human to an alien sea.",
    distance: "628.3M km",
    travelTime: "2.5–3 years",
    gravity: "0.134g",
    status: "ULTRA-DISTANCE · PRIVATE CHARTER",
    highlights: [
      "Jupiter orbital observation from the Jovian system",
      "Europa surface approach — chaos terrain flyover",
      "Thermal plume detection observation (subsurface activity)",
      "Aurora Europa Platform — permanent orbital station",
      "Ice spectroscopy session with astrobiology specialist",
      "Classified proximity: highest likelihood of life detection site",
    ],
    stats: [
      { label: "Distance", value: "628.3M km" },
      { label: "Transit", value: "2.5–3 years" },
      { label: "Gravity", value: "0.134g" },
      { label: "Ice shell depth", value: "~25 km" },
      { label: "Ocean depth", value: "100+ km" },
      { label: "Passengers", value: "2 max" },
    ],
    worldX: -4.5,
    worldY: 3.0,
    radius: 0.20,
    glowColor: "#55AAFF",
    planetType: 3,
  },

  // ─── Titan — Fleet ────────────────────────────────────────────────────────────
  {
    id: "titan",
    name: "Titan",
    designation: "SAT-VI",
    classification: "Nitrogen-world Moon · Saturn",
    role: "GOLDEN ATMOSPHERE",
    tagline: "The only moon with weather",
    description:
      "Titan is the only moon in the solar system with a dense, breathable-pressure atmosphere — though you would not want to breathe it. Nitrogen and methane lakes fill its lowlands. Saturn looms above the haze, its rings visible through the amber sky. Aurora's fleet maintenance base operates here — the sector's only facility capable of hypersonic atmospheric insertion and full vehicle service.",
    distance: "1.28B km",
    travelTime: "3–4 years",
    gravity: "0.14g",
    status: "FLEET BASE · RESTRICTED ACCESS",
    highlights: [
      "Aurora fleet operations centre — observation access",
      "Saturn ring plane transit from the Saturnian system",
      "Atmospheric insertion aboard the Aurora III — classified as extreme",
      "Methane lake radar mapping session",
      "Titan haze: the only world where you can walk in open air with only an oxygen mask",
      "AURORA-3 clearance personnel only",
    ],
    stats: [
      { label: "Distance", value: "1.28B km" },
      { label: "Transit", value: "3–4 years" },
      { label: "Gravity", value: "0.14g" },
      { label: "Atmosphere", value: "1.45 atm N₂/CH₄" },
      { label: "Surface temp", value: "-179°C" },
      { label: "Passengers", value: "2 max" },
    ],
    worldX: -7.5,
    worldY: -2.5,
    radius: 0.28,
    glowColor: "#D4A030",
    planetType: 4,
  },

  // ─── Kepler — Technology ──────────────────────────────────────────────────────
  {
    id: "kepler",
    name: "Kepler-442b",
    designation: "KOI-4742.01",
    classification: "Super-Earth · Habitable Zone",
    role: "INTERSTELLAR THRESHOLD",
    tagline: "1,200 light-years. The destination Aurora is building toward",
    description:
      "A super-Earth 1,206 light-years from Sol, orbiting a K-type star in the habitable zone with a 112-day year. Surface gravity is estimated at 1.34g. Atmospheric conditions are unknown. Aurora's long-range propulsion research is oriented toward a single destination: the first crewed interstellar mission. This node is where that ambition is documented and developed. No human has gone. Yet.",
    distance: "1,206 light-years",
    travelTime: "Interstellar — not yet available",
    gravity: "~1.34g (estimated)",
    status: "RESEARCH NODE · ACCEPTING RESERVATIONS",
    highlights: [
      "Interstellar mission research facility — open to reservation holders",
      "Drive technology briefing: current propulsion development",
      "Kepler-442 system simulation — full immersive environment",
      "Mission timeline projection: provisional 2090–2110 launch window",
      "Priority reservation for Aurora Interstellar Founding Series",
      "Personal mission file opened upon clearance",
    ],
    stats: [
      { label: "Distance", value: "1,206 ly" },
      { label: "Planet type", value: "Super-Earth" },
      { label: "Star type", value: "K-type" },
      { label: "Orbital period", value: "112 days" },
      { label: "Est. gravity", value: "~1.34g" },
      { label: "Reservation", value: "Open" },
    ],
    worldX: 12.0,
    worldY: 3.5,
    radius: 0.30,
    glowColor: "#5A6CFF",
    planetType: 5,
  },

  // ─── Orion Station — Contact ──────────────────────────────────────────────────
  {
    id: "orion",
    name: "Orion Station",
    designation: "AURO-NS-001",
    classification: "Permanent Orbital Habitat · L2",
    role: "DEEP SPACE HUB",
    tagline: "The only address that changes orbit every 72 hours",
    description:
      "Positioned at the Earth-Sun L2 Lagrange point. Aurora's primary orbital facility and routing hub. All ultra-distance voyage enquiries are processed here. Mission control operates from Orion Station's navigation tier. Twelve permanent berths. A full-circumference observation deck. Two docking bays. This is where you begin the conversation that could put you into the deep solar system.",
    distance: "1.5M km (L2 point)",
    travelTime: "4–5 days",
    gravity: "0g (orbital)",
    status: "ACCEPTING ENQUIRIES",
    highlights: [
      "Aurora mission coordination — direct access to flight operations",
      "Full-circumference observation deck — 360° orbital view",
      "Ultra-distance voyage consultation with senior flight planner",
      "Station tour: navigation tier, docking bays, habitat ring",
      "Zero-gravity orientation and acclimatisation programme",
      "Medical clearance processing for long-duration missions",
    ],
    stats: [
      { label: "Position", value: "L2 Lagrange" },
      { label: "Transit", value: "4–5 days" },
      { label: "Gravity", value: "0g" },
      { label: "Berths", value: "12" },
      { label: "Docking bays", value: "2" },
      { label: "Status", value: "Operational" },
    ],
    worldX: 1.5,
    worldY: -5.5,
    radius: 0.16,
    glowColor: "#C0D0F0",
    planetType: 6,
  },
];

// ─── Travel routes ────────────────────────────────────────────────────────────

export type Route = { from: DestinationId; to: DestinationId };

export const ROUTES: Route[] = [
  { from: "earth", to: "luna" },
  { from: "earth", to: "mars" },
  { from: "earth", to: "orion" },
  { from: "luna",  to: "europa" },
  { from: "mars",  to: "europa" },
  { from: "europa", to: "titan" },
  { from: "titan",  to: "kepler" },
  { from: "orion",  to: "kepler" },
];
