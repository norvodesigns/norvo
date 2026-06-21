export type DestinationId =
  | "earth" | "luna" | "mars" | "europa"
  | "titan" | "kepler" | "orion";

export type Destination = {
  id: DestinationId;
  name: string;
  designation: string;
  classification: string;
  role: string;
  tagline: string;
  description: string;
  distance: string;
  travelTime: string;
  gravity: string;
  status: string;
  highlights: string[];
  stats: { label: string; value: string }[];
  // Map positioning
  worldX: number;
  worldY: number;
  radius: number;       // world-unit radius of planet mesh
  glowColor: string;   // CSS hex, used for glow + orbit ring
  planetType: number;  // 0–6, selects shader appearance
};

export type NavPhase = "map" | "flying" | "viewing";

export type NavState = {
  phase: NavPhase;
  targetId: DestinationId | null;
};
