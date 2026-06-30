"use client";

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${
        selected
          ? "text-white"
          : "text-[var(--archive-white)]/50 hover:text-[var(--archive-white)]/80"
      }`}
      style={
        selected
          ? {
              background: "linear-gradient(120deg, #6D5DFB, #D8B46A)",
              boxShadow: "0 0 20px rgba(109,93,251,0.3)",
            }
          : {
              border: "1px solid rgba(244,245,247,0.15)",
            }
      }
    >
      {label}
    </button>
  );
}

export function GuidanceChip({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${
        selected
          ? "text-[#14161A]"
          : "text-[var(--observatory-gold)]/70 hover:text-[var(--observatory-gold)]"
      }`}
      style={
        selected
          ? { background: "var(--observatory-gold)" }
          : {
              border: "1px dashed rgba(216,180,106,0.4)",
            }
      }
    >
      {selected ? "✓ We'll guide you on this" : "Not sure — help me decide"}
    </button>
  );
}
