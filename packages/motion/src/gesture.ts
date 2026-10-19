/** Velocity tracker over the last ~100 ms of pointer samples (px/s). Robust to uneven event timing. */
export function createVelocityTracker(windowMs = 100) {
  const samples: { t: number; x: number }[] = [];
  return {
    add(x: number, t = performance.now()) { samples.push({ t, x }); while (samples.length > 2 && t - samples[0].t > windowMs) samples.shift(); },
    velocity() {
      if (samples.length < 2) return 0;
      const a = samples[0], b = samples[samples.length - 1];
      const dt = (b.t - a.t) / 1000;
      return dt > 0 ? (b.x - a.x) / dt : 0;
    },
    reset() { samples.length = 0; },
  };
}

/** Rubber-band resistance past a limit (iOS-like): grows ever slower the further you pull. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (1 - 1 / ((overshoot * constant) / dimension + 1)) * dimension;
}

/**
 * Logarithmic bounded edge-resistance model using clamped and normalized log1p.
 * On continued outward pull near an edge, additional pointer travel results in progressively
 * smaller displacement bounded strictly by maxDisplacement, creating a natural physical cushion.
 *
 * @param pull Raw pointer pull distance past the boundary in pixels (must be >= 0)
 * @param maxDisplacement Maximum allowed visual displacement in pixels (default 64)
 * @param coefficient Resistance scaling coefficient; tuned for natural responsiveness (default 0.35)
 */
export function elasticResistance(pull: number, maxDisplacement = 64, coefficient = 0.35): number {
  if (pull <= 0) return 0;
  const normalized = (pull * coefficient) / maxDisplacement;
  return maxDisplacement * (1 - 1 / (1 + Math.log1p(normalized)));
}

/** Picks the snap point a released gesture should settle on, projecting momentum forward. */
export function projectSnap(position: number, velocity: number, points: number[], decelerationRate = 0.998) {
  const projected = position + (velocity / 1000) * decelerationRate / (1 - decelerationRate);
  return points.reduce((best, p) => (Math.abs(p - projected) < Math.abs(best - projected) ? p : best), points[0]);
}
