"use client";

// Toggle chip — teal fill + gold ring when selected. Used across every wizard step.
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
          ? "bg-[#0D7A7A] text-white shadow-sm ring-2 ring-[#D9A441] ring-offset-1"
          : "border border-black/15 text-black/65 hover:border-[#0D7A7A] hover:text-black"
      }`}
    >
      {label}
    </button>
  );
}

// "Not sure — help me decide" pill. Gold-toned so it reads as a friendly escape hatch.
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
          ? "bg-[#D9A441] text-[#3a2c08] shadow-sm"
          : "border border-dashed border-[#D9A441]/70 text-[#9a7416] hover:bg-[#D9A441]/10"
      }`}
    >
      {selected ? "✓ We'll guide you on this" : "Not sure — help me decide"}
    </button>
  );
}
