// The Ascent — canonical scroll timeline.
//
// Derived from File 17 (Pacing). The Threshold (~5% of the journey) is a
// pre-scroll overlay; the scroll driver covers the remaining beats, with each
// beat's share renormalized over that 95%. Every component on the homepage —
// the DOM eras AND the WebGL canvas — reads these constants so the journey
// stays in lockstep. A "Shift" (File 01 §1.3) is the witnessed cross-dissolve
// at every boundary; SEAM is its width in scroll-progress.

export type Beat = [start: number, end: number];

// Beat widths are the File 17 §17.2 budget renormalized over the 95% the scroll
// driver owns (the Threshold ~5% is the pre-scroll overlay): Documents ~12.6%,
// Pages ~12.6%, Interfaces ~13.7%, Experiences ~21.1%, Warp ~8.4%,
// Observatory ~23.2%, Call to Act ~8.4%. Era4+Warp+Observatory ≈ half the
// journey; the Warp is the least-padded beat (it is the peak, not a plateau).
export const BEATS = {
  era1: [0.0, 0.126] as Beat, // Documents — the held breath
  era2: [0.126, 0.253] as Beat, // Pages — first warmth
  era3: [0.253, 0.389] as Beat, // Interfaces — quickening
  era4: [0.389, 0.56] as Beat, // Experiences — rising awe
  warp: [0.56, 0.71] as Beat, // The Time Warp — widened (~2¼ screens) so the
  // photoreal rush scrubs slowly and deliberately, not in a blink
  observatory: [0.71, 0.91] as Beat, // The Observatory — arrival & dwell
  cta: [0.91, 1.0] as Beat, // Start a project — the open door
} as const;

// Width of a Shift cross-dissolve, in scroll progress. Scenes overlap by this
// much at their seams so nothing ever hard-cuts.
export const SEAM = 0.03;

// Total scroll height of the driver, in viewport heights. Tuned for the File 17
// "two to three unhurried minutes": longer travel lets Experiences (immersion)
// and the Observatory (the dwell) breathe instead of rushing past.
export const SCROLL_VH = 1500;

// Map a beat to the [in, hold-start, hold-end, out] keyframe quad used to drive
// a scene's opacity/visibility with overlapping Shift seams.
export function sceneKeyframes([start, end]: Beat): [number, number, number, number] {
  return [start - SEAM, start + SEAM, end - SEAM, end + SEAM];
}

// Normalize a scroll value to local 0..1 progress within a beat.
export function within(v: number, [start, end]: Beat): number {
  if (end === start) return 0;
  return Math.max(0, Math.min(1, (v - start) / (end - start)));
}
