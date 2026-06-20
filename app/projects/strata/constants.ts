export const G = {
  gold:   "#C49A2E",
  black:  "#0D0D0B",
  white:  "#FAFAF9",
  gray:   "#5C5C58",
  light:  "#F2F1EE",
  border: "#E0DFDB",
} as const;

export const ease = [0.22, 1, 0.36, 1] as const;

export const springFast  = { type: "spring" as const, stiffness: 420, damping: 22 };
export const springSmooth = { type: "spring" as const, stiffness: 280, damping: 28 };
