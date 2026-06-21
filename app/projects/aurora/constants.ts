// Aurora — Celestial OS colour system
export const G = {
  // Backgrounds
  void:       "#030507",
  voidSoft:   "#081018",
  surface:    "#111827",
  surfaceElv: "#172235",
  // Accents
  primary:    "#E8EDF5",
  secondary:  "#A6C8FF",
  highlight:  "#D4B16A",
  alert:      "#F4F7FA",
  nebula:     "#5A6CFF",
  // Text
  white:      "#FFFFFF",
  silver:     "#A9B3C4",
  iron:       "#6E788A",
  // Cursor aliases
  ice:        "#A6C8FF",
  iceDim:     "#2A4A7A",
  glow:       "#A6C8FF",
  glowSoft:   "#6E788A",
} as const;

export const ease       = [0.22, 1, 0.36, 1] as const;
export const easeIn     = [0.65, 0, 0.35, 1] as const;
export const springFast   = { type: "spring" as const, stiffness: 420, damping: 22 };
export const springSmooth = { type: "spring" as const, stiffness: 220, damping: 28 };
export const springSlip   = { type: "spring" as const, stiffness: 120, damping: 20 };
