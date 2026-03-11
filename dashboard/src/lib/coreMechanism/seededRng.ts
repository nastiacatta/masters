/** Seeded PRNG (mulberry32) for reproducible DGP and mechanism demo. */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0; // mulberry32
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal CDF approximation (Abramowitz & Stegun). */
export function normCdf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-(x * x) / 2);
  const p = d * t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
  return x > 0 ? 1 - p : p;
}

/** Inverse normal CDF (probit) via approximation. */
export function normPpf(p: number): number {
  p = Math.max(1e-12, Math.min(1 - 1e-12, p));
  const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328, d1 = 1.432788, d2 = 0.189269, d3 = 0.001308;
  const q = p - 0.5;
  if (Math.abs(q) <= 0.425) {
    const a = -39.69683028665376, b = 220.9460984245205, c = -275.9285104469687,
      d = 138.357751867269, e = -30.66479806614716, f = 2.506628277459239;
    const r = 0.180625 - q * q;
    const num = ((((a * r + b) * r + c) * r + d) * r + e) * r + f;
    const den = (((((r * 7 + 15) * r + 105) * r + 420) * r + 756) * r + 900) * r + 252;
    return (q * num * r) / den;
  }
  const r = q < 0 ? p : 1 - p;
  const t = Math.sqrt(-Math.log(r));
  const x = (c2 * t + c1) * t + c0;
  const den = (d3 * t + d2) * t + d1;
  return q < 0 ? -(x * t) / (den * t + 1) : (x * t) / (den * t + 1);
}
