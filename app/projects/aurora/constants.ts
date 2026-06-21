export const G = {
  // Backgrounds
  void:     "#080808",
  void2:    "#0F0F0F",
  gunmetal: "#1C1C1E",
  titanium: "#2C2C2E",
  steel:    "#3A3A3C",
  // Text
  iron:     "#636366",
  silver:   "#8E8E93",
  chrome:   "#AEAEB2",
  platinum: "#C7C7CC",
  frost:    "#E5E5EA",
  white:    "#F5F5F7",
  // Accent — very restrained (active nav, engine glow only)
  ice:      "#64B5D9",
  iceDim:   "#2A6A8A",
  // Aliases so AuroraCursor compiles without changes
  glow:     "#64B5D9",
  glowSoft: "#8E8E93",
} as const;

export const ease = [0.22, 1, 0.36, 1] as const;
export const easeIn = [0.65, 0, 0.35, 1] as const;

export const springFast   = { type: "spring" as const, stiffness: 420, damping: 22 };
export const springSmooth = { type: "spring" as const, stiffness: 220, damping: 28 };
export const springSlip   = { type: "spring" as const, stiffness: 120, damping: 20 };
