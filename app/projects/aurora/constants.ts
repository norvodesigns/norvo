export const G = {
  void:     "#020209",
  deep:     "#06060F",
  hull:     "#0C0C1C",
  panel:    "#111122",
  seam:     "#1C1C30",
  dim:      "#383858",
  silver:   "#68688A",
  chrome:   "#A8A8C4",
  white:    "#E0E0F4",
  glow:     "#4466FF",
  glowSoft: "#8899FF",
  accent:   "#AAC0FF",
} as const;

export const ease = [0.22, 1, 0.36, 1] as const;
export const easeIn = [0.65, 0, 0.35, 1] as const;

export const springFast   = { type: "spring" as const, stiffness: 420, damping: 22 };
export const springSmooth = { type: "spring" as const, stiffness: 220, damping: 28 };
export const springSlip   = { type: "spring" as const, stiffness: 120, damping: 20 };
