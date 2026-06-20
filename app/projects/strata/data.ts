// ─────────────────────────────────────────────────────────────────────────────
// Strata Real Estate — Concept Demo Data
// All content is entirely fictional. Not a real brokerage or listing service.
// ─────────────────────────────────────────────────────────────────────────────

export type PropertyStatus = "Pre-Sale" | "Available" | "Coming Soon" | "Sold Out";

export type Agent = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  phone: string;
  email: string;
};

export type Property = {
  id: string;
  name: string;
  label: string;
  location: string;
  city: string;
  priceRange: string;
  beds: string;
  baths: string;
  sqft: string;
  status: PropertyStatus;
  image: string;
  heroImage: string;
  gallery: string[];
  tag: string;
  description: string;
  features: string[];
  agentId: string;
  listed: string;
  yearBuilt: string;
  lot: string;
  coordinates: string;
  elevation: string;
  district: string;
  siteArea: string;
  primaryMaterial: string;
  architecturalStyle: string;
  orientation: string;
  proximityNote: string;
};

// ─── Agents ──────────────────────────────────────────────────────────────────

export const AGENTS: Agent[] = [
  {
    id: "alexandra-reed",
    name: "Alexandra Reed",
    title: "Principal Broker",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    phone: "(555) 204-1140",
    email: "a.reed@stratarealty.com",
  },
  {
    id: "daniel-park",
    name: "Daniel Park",
    title: "Senior Property Advisor",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    phone: "(555) 204-1141",
    email: "d.park@stratarealty.com",
  },
  {
    id: "sofia-monteiro",
    name: "Sofia Monteiro",
    title: "Luxury Developments Director",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    phone: "(555) 204-1142",
    email: "s.monteiro@stratarealty.com",
  },
];

// ─── Properties ──────────────────────────────────────────────────────────────

export const PROPERTIES: Property[] = [
  {
    id: "meridian-heights",
    name: "Meridian Heights",
    label: "Residential Concept",
    location: "Riverside District",
    city: "Sample City, CA",
    priceRange: "$2.8M – $5.2M",
    beds: "3–5",
    baths: "3–4",
    sqft: "3,200 – 5,800",
    status: "Pre-Sale",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80",
    ],
    tag: "New Development",
    description:
      "An architectural statement set within the prestigious Riverside District. Meridian Heights blends California modernism with enduring materiality — floor-to-ceiling glazing, poured concrete volumes, and a seamless indoor-outdoor flow that captures both canyon and city views. Units range from three-bedroom residences to full-floor penthouses, each delivered with bespoke finish packages selected by a dedicated interior consultant.",
    features: [
      "Private infinity pool & spa",
      "Smart home automation (Savant)",
      "Chef's kitchen with La Cornue range",
      "Wine cellar (400-bottle capacity)",
      "Home theater with Dolby Atmos",
      "3-car garage with EV charging",
      "Guest suite with private entrance",
      "Landscaped terraces on all levels",
    ],
    agentId: "alexandra-reed",
    listed: "Listed 3 weeks ago",
    yearBuilt: "2024–2025 (Est.)",
    lot: "0.42 acres",
    coordinates: "34°03'N  118°14'W",
    elevation: "680 FT",
    district: "DISTRICT II — RIVERSIDE",
    siteArea: "1,854 M²",
    primaryMaterial: "Poured concrete · White oak · Structural glass",
    architecturalStyle: "California Modernism",
    orientation: "South-southwest, canyon views",
    proximityNote: "4 min to Riverside Boulevard",
  },
  {
    id: "aria-residences",
    name: "Aria Residences",
    label: "Luxury Condo Concept",
    location: "The Platinum Quarter",
    city: "Sample City, CA",
    priceRange: "$1.2M – $3.4M",
    beds: "1–3",
    baths: "1–3",
    sqft: "980 – 3,100",
    status: "Available",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80",
      "https://images.unsplash.com/photo-1583845112203-29329902332e?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80",
    ],
    tag: "Featured",
    description:
      "Occupying three full floors at the apex of The Platinum Quarter, Aria Residences redefines vertical living with an art-hotel sensibility. Each residence is a finished masterwork — curated finishes, bespoke millwork, and uninterrupted skyline panoramas delivered with white-glove concierge service twenty-four hours a day.",
    features: [
      "24/7 concierge & doorman service",
      "Private rooftop terrace per unit",
      "Valet parking (2 spaces included)",
      "Residents' lounge & private dining",
      "Temperature-controlled wine storage",
      "In-building gym & wellness spa",
      "Pet-friendly with grooming suite",
      "Direct elevator access to all units",
    ],
    agentId: "daniel-park",
    listed: "Listed 6 days ago",
    yearBuilt: "2023",
    lot: "N/A (High-Rise)",
    coordinates: "34°04'N  118°15'W",
    elevation: "1,142 FT",
    district: "DISTRICT I — PLATINUM QUARTER",
    siteArea: "614 M²",
    primaryMaterial: "Reflective glass · Brushed stainless · Italian marble",
    architecturalStyle: "High-Rise Luxury Contemporary",
    orientation: "360° panoramic upper floors",
    proximityNote: "Direct access to Platinum Avenue",
  },
  {
    id: "the-ellison",
    name: "The Ellison",
    label: "Estate Concept",
    location: "North Ridge",
    city: "Lakeview, CA",
    priceRange: "$6.5M – $9.8M",
    beds: "5–7",
    baths: "5–6",
    sqft: "7,200 – 12,400",
    status: "Coming Soon",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1200&q=80",
      "https://images.unsplash.com/photo-1583845112203-29329902332e?w=1200&q=80",
    ],
    tag: "Ultra Luxury",
    description:
      "Positioned at the highest point in North Ridge, The Ellison is an estate of rare provenance. Its seven acres of manicured grounds yield views across three counties. Designed by an award-winning studio, the structure balances baronial scale with intimate livability — a property that appears once in a generation.",
    features: [
      "7-acre private manicured grounds",
      "Olympic-length lap pool",
      "Tennis court (hard & clay surfaces)",
      "Detached guest house (2 bed/2 bath)",
      "Full staff quarters",
      "4-stall horse stable & tack room",
      "Private vineyard (Cabernet plantings)",
      "Helicopter pad (FAA compliant)",
    ],
    agentId: "sofia-monteiro",
    listed: "Preview available soon",
    yearBuilt: "2025 (Est.)",
    lot: "7.1 acres",
    coordinates: "34°09'N  117°58'W",
    elevation: "1,960 FT",
    district: "DISTRICT V — NORTH RIDGE ESTATES",
    siteArea: "28,734 M²",
    primaryMaterial: "Limestone · Wrought iron · Hand-hewn timber",
    architecturalStyle: "Contemporary English Manor",
    orientation: "North-facing, mountain and valley views",
    proximityNote: "9 min to Lakeview Village",
  },
  {
    id: "park-meridian",
    name: "Park Meridian",
    label: "Townhome Concept",
    location: "Greenway Commons",
    city: "Hillcrest, CA",
    priceRange: "$890K – $1.6M",
    beds: "3–4",
    baths: "2–3",
    sqft: "2,100 – 3,600",
    status: "Available",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80",
      "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80",
    ],
    tag: "Popular",
    description:
      "Thoughtfully scaled townhomes within the walkable Greenway Commons neighborhood. Park Meridian was designed for the discerning buyer who values community, craftsmanship, and proximity to the city's finest dining — without any compromise on quality of finish or architectural ambition.",
    features: [
      "Private rooftop deck on every unit",
      "Open-plan main living level",
      "Calacatta marble kitchen surfaces",
      "In-unit laundry (Miele)",
      "2-car attached garage with storage",
      "Private courtyard gardens",
      "Energy Star certified",
      "HOA includes exterior maintenance",
    ],
    agentId: "daniel-park",
    listed: "Listed 2 months ago",
    yearBuilt: "2022–2023",
    lot: "0.08–0.12 acres",
    coordinates: "34°01'N  118°17'W",
    elevation: "340 FT",
    district: "DISTRICT III — GREENWAY COMMONS",
    siteArea: "364–485 M²",
    primaryMaterial: "Board-formed concrete · Reclaimed oak · Bronze hardware",
    architecturalStyle: "Urban Contemporary",
    orientation: "East-facing courtyard gardens",
    proximityNote: "2 min walk to Greenway Park",
  },
  {
    id: "solara-villas",
    name: "Solara Villas",
    label: "Villa Concept",
    location: "Suncoast Estates",
    city: "Marina Bay, CA",
    priceRange: "$3.1M – $5.7M",
    beds: "4–6",
    baths: "4–5",
    sqft: "4,400 – 7,800",
    status: "Pre-Sale",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1200&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      "https://images.unsplash.com/photo-1583845112203-29329902332e?w=1200&q=80",
    ],
    tag: "New Listing",
    description:
      "Twelve oceanfront villas at the water's edge of Suncoast Estates, each oriented to capture the Pacific horizon. Solara is a collaboration between a Pritzker Prize-shortlisted architect and an interior studio celebrated for their Amalfi Coast residential projects. Pre-sale units are now available.",
    features: [
      "Direct private beach access",
      "Private pool on every villa",
      "Outdoor kitchen & poolside cabana",
      "Full-retraction glass walls",
      "Radiant floor heating throughout",
      "Hurricane-rated impact glazing",
      "Solar + Powerwall battery backup",
      "Private boat dock (select units)",
    ],
    agentId: "alexandra-reed",
    listed: "Listed 1 week ago",
    yearBuilt: "2025–2026 (Est.)",
    lot: "0.28–0.55 acres",
    coordinates: "33°56'N  118°26'W",
    elevation: "SEA LEVEL",
    district: "DISTRICT VI — SUNCOAST WATERFRONT",
    siteArea: "1,133–2,226 M²",
    primaryMaterial: "Coral stone · Teak · Hurricane glass",
    architecturalStyle: "Mediterranean Contemporary",
    orientation: "Due west, Pacific Ocean frontage",
    proximityNote: "Direct private beach access",
  },
  {
    id: "haven-ridge",
    name: "Haven on the Ridge",
    label: "Single Family Concept",
    location: "Hilltop Reserve",
    city: "Summit Park, CA",
    priceRange: "$1.9M – $2.8M",
    beds: "4",
    baths: "3",
    sqft: "3,800",
    status: "Available",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1200&q=80",
    ],
    tag: "Reduced",
    description:
      "Perched at 2,400 feet within the Hilltop Reserve, this single-level residence enjoys 270-degree panoramic views and a serenity that few properties at any price point can replicate. Meticulously renovated in 2023 with a Thermador kitchen, spa-grade bathroom, and professional drought-tolerant landscaping.",
    features: [
      "270° panoramic ridge-to-ocean views",
      "Full Thermador kitchen suite",
      "Soaking tub & steam shower (primary)",
      "3-car detached garage + workshop",
      "Fire-rated composite decking",
      "Propane whole-home backup generator",
      "Mature citrus grove (12 trees)",
      "Private trailhead access (HOA)",
    ],
    agentId: "sofia-monteiro",
    listed: "Listed 4 months ago",
    yearBuilt: "2017 (Renovated 2023)",
    lot: "1.2 acres",
    coordinates: "34°17'N  118°04'W",
    elevation: "2,400 FT",
    district: "DISTRICT IV — HILLTOP RESERVE",
    siteArea: "4,856 M²",
    primaryMaterial: "Fire-rated composite · Ipe wood · Steel",
    architecturalStyle: "Mountain Modern",
    orientation: "270° south & westward, ridge to ocean",
    proximityNote: "Trail access to Summit Reserve",
  },
];