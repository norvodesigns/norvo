"use client";

import { motion } from "motion/react";

export function ProgressBar({
  step,
  total,
  labels,
}: {
  step: number;
  total: number;
  labels: string[];
}) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center justify-between text-xs text-[var(--archive-white)]/30">
        <span>
          Step {step + 1} of {total}
        </span>
        <span className="font-medium text-[var(--archive-white)]/50">{labels[step]}</span>
      </div>
      <div
        className="h-px w-full overflow-hidden"
        style={{ background: "rgba(244,245,247,0.08)" }}
      >
        <motion.div
          className="h-full"
          style={{ background: "linear-gradient(120deg, #6D5DFB, #D8B46A)" }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
