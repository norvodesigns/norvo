// ─────────────────────────────────────────────────────────────────────────────
// Aurora Space Tourism — Concept Demo Data
// All content is entirely fictional. Not a real company or flight operator.
// ─────────────────────────────────────────────────────────────────────────────

export type VoyageClass = "Sub-Orbital" | "Orbital" | "Cislunar";

export type Voyage = {
  id: string;
  designation: string;
  name: string;
  class: VoyageClass;
  tagline: string;
  duration: string;
  altitude: string;
  capacity: number;
  maxG: string;
  peakVelocity: string;
  microgravity: string;
  price: string;
  // CSS gradient — stands in for a hero image
  envGradient: string;
  // accent colour for this voyage
  envAccent: string;
  description: string;
  highlights: string[];
  stats: { label: string; value: string }[];
};

export type Vehicle = {
  id: string;
  designation: string;
  name: string;
  type: string;
  capacity: number;
  maxAlt: string;
  maxVelocity: string;
  hull: string;
  propulsion: string;
  firstFlight: string;
  description: string;
};

// ─── Voyages ─────────────────────────────────────────────────────────────────

export const VOYAGES: Voyage[] = [
  {
    id: "arc",
    designation: "ARC-180",
    name: "Sub-Orbital Arc",
    class: "Sub-Orbital",
    tagline: "The edge of everything",
    duration: "90 minutes",
    altitude: "180 km",
    capacity: 6,
    maxG: "3.2g",
    peakVelocity: "7,400 km/h",
    microgravity: "14 minutes",
    price: "From $450,000 per seat",
    envGradient:
      "linear-gradient(to bottom, #020209 0%, #04042A 28%, #080860 50%, #103090 65%, #204AB0 80%, #3068C0 92%, #4882C8 100%)",
    envAccent: "#5A90D8",
    description:
      "Pierce the Kármán line and cross into the silence above. An arc through the highest reaches of the sky — brief, transformative, and utterly unlike anything on the surface. Earth curves below. The atmosphere thins to a luminous thread. Then silence.",
    highlights: [
      "Kármán Line crossing (official certification)",
      "14 minutes of microgravity",
      "360° panoramic viewports",
      "Private pre-flight preparation suite",
      "Mission debrief with lead pilot",
      "Aurora flight logbook and documentation",
    ],
    stats: [
      { label: "Altitude", value: "180 km" },
      { label: "Duration", value: "90 min" },
      { label: "Microgravity", value: "14 min" },
      { label: "Peak velocity", value: "7,400 km/h" },
      { label: "Peak G-force", value: "3.2g" },
      { label: "Passengers", value: "6 max" },
    ],
  },
  {
    id: "orbit",
    designation: "ORB-420",
    name: "Orbital Voyage",
    class: "Orbital",
    tagline: "72 hours above the world",
    duration: "3 days",
    altitude: "420 km",
    capacity: 8,
    maxG: "2.1g",
    peakVelocity: "27,580 km/h",
    microgravity: "70 hours",
    price: "From $2.4M per seat",
    envGradient:
      "radial-gradient(ellipse 140% 50% at 50% 115%, #1840A8 0%, #0A1880 18%, #040430 45%, #020209 100%)",
    envAccent: "#4468CC",
    description:
      "Three days in low Earth orbit aboard the Aurora II cruiser. Watch 48 sunrises through triple-paned viewports. Dine in zero gravity. Sleep floating two millimetres above your berth as continents drift silently beneath you. Rendezvous with Nexus Station on day two.",
    highlights: [
      "48 orbital sunrises observed",
      "Zero-gravity dining experience",
      "Private Aurora II cabin assignment",
      "Rendezvous and docking with Nexus Station",
      "Orbital photography session with specialist",
      "Earth observation with annotated overpass schedule",
    ],
    stats: [
      { label: "Altitude", value: "420 km" },
      { label: "Duration", value: "3 days" },
      { label: "Microgravity", value: "70 hours" },
      { label: "Orbital velocity", value: "27,580 km/h" },
      { label: "Sunrises", value: "48" },
      { label: "Passengers", value: "8 max" },
    ],
  },
  {
    id: "transit",
    designation: "LNR-384",
    name: "Lunar Transit",
    class: "Cislunar",
    tagline: "The far side of the Moon",
    duration: "8 days",
    altitude: "384,400 km",
    capacity: 4,
    maxG: "1.8g",
    peakVelocity: "39,000 km/h",
    microgravity: "7 days",
    price: "From $18M per seat",
    envGradient:
      "radial-gradient(ellipse 60% 60% at 72% 28%, #141428 0%, #0A0A18 35%, #020209 100%)",
    envAccent: "#3855BB",
    description:
      "Travel further from Earth than any human has since Apollo. A circumlunar free-return trajectory carries you around the far side of the Moon — the face no one on the surface has ever seen — before returning you across 384,400 kilometres of absolute void. Earth becomes a marble. Then a point of light.",
    highlights: [
      "Far side lunar flyby — the un-seen hemisphere",
      "Maximum cislunar distance record eligible",
      "Private cislunar suite aboard Aurora II",
      "Earthrise photographed at lunar distance",
      "Daily mission specialist briefings",
      "Aurora Cislunar Pioneer documentation",
    ],
    stats: [
      { label: "Distance", value: "384,400 km" },
      { label: "Duration", value: "8 days" },
      { label: "Microgravity", value: "7 days" },
      { label: "Peak velocity", value: "39,000 km/h" },
      { label: "Peak G-force", value: "1.8g" },
      { label: "Passengers", value: "4 max" },
    ],
  },
];

// ─── Fleet ────────────────────────────────────────────────────────────────────

export const FLEET: Vehicle[] = [
  {
    id: "aurora-i",
    designation: "AV-001",
    name: "Aurora I",
    type: "Sub-Orbital Ascent Vehicle",
    capacity: 6,
    maxAlt: "180 km (apogee)",
    maxVelocity: "Mach 6.2",
    hull: "Carbon-titanium composite",
    propulsion: "LOX / kerosene staged combustion",
    firstFlight: "2029",
    description:
      "Single-stage ballistic ascent vehicle. A pressurised passenger capsule with retractable aeroshell. Recovers under powered vertical descent. Designed for the Sub-Orbital Arc experience.",
  },
  {
    id: "aurora-ii",
    designation: "AV-002",
    name: "Aurora II",
    type: "Orbital Cruiser",
    capacity: 8,
    maxAlt: "420 km (operational orbit)",
    maxVelocity: "Mach 25 (orbital)",
    hull: "Ceramic-thermal composite / titanium frame",
    propulsion: "LOX / methane main engines + RCS",
    firstFlight: "2030",
    description:
      "Aurora's orbital flagship. A pressurised vehicle with a forward observation lounge, eight private berths, and a galley designed for zero-gravity dining. Rendezvous-capable with Nexus Station. Also used for cislunar transit.",
  },
  {
    id: "nexus",
    designation: "NS-001",
    name: "Nexus Station",
    type: "Orbital Habitat",
    capacity: 12,
    maxAlt: "420 km (fixed orbit)",
    maxVelocity: "Station-keeping",
    hull: "Aluminium alloy pressure vessels + radiation shielding",
    propulsion: "Ion thrusters (station-keeping only)",
    firstFlight: "2031",
    description:
      "Aurora's permanent orbital habitat. Twelve berths across two habitation rings, a full-circumference observation deck, two docking bays, and a zero-gravity recreation area. A destination in itself.",
  },
];
