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

/** Picks the snap point a released gesture should settle on, projecting momentum forward. */
export function projectSnap(position: number, velocity: number, points: number[], decelerationRate = 0.998) {
  const projected = position + (velocity / 1000) * decelerationRate / (1 - decelerationRate);
  return points.reduce((best, p) => (Math.abs(p - projected) < Math.abs(best - projected) ? p : best), points[0]);
}
