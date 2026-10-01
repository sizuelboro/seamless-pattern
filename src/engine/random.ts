/** Deterministic PRNG (mulberry32). Same seed => same sequence. */
export interface Rng {
  (): number;
  range(min: number, max: number): number;
  int(min: number, maxInclusive: number): number;
  pick<T>(arr: readonly T[]): T;
  chance(p: number): boolean;
  shuffle<T>(arr: T[]): T[];
}

export function createRng(seed: number): Rng {
  let a = (Math.floor(seed) ^ 0x9e3779b9) >>> 0;
  const next = (() => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as Rng;
  next.range = (min, max) => min + next() * (max - min);
  next.int = (min, max) => Math.floor(min + next() * (max - min + 1));
  next.pick = (arr) => arr[Math.floor(next() * arr.length) % arr.length];
  next.chance = (p) => next() < p;
  next.shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  return next;
}

export function randomSeed(): number {
  return 100000 + Math.floor(Math.random() * 900000);
}

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
