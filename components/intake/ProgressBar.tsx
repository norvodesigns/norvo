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
      <div className="mb-3 flex items-center justify-between text-xs text-black/40">
        <span>
          Step {step + 1} of {total}
        </span>
        <span className="font-medium text-black/60">{labels[step]}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(120deg,#0D7A7A,#D9A441)" }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
