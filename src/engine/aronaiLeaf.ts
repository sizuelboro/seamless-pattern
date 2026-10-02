/**
 * Aronai Hajw leaf — one woven Aronai section on a counted thread grid:
 * selvedge stripes, a narrow diamond strip, a narrow diamond-chain band with green
 * four-petal flowers, and pointed woven leaf projections growing from the band's right
 * edge (optionally both sides, as on many aronai). Each leaf is built row by row: every
 * weft row starts at the band and stops a little short of its neighbour, so the upper and
 * lower contours both step in to one tip; diagonal pattern threads run toward the tip with
 * base cloth between them. Handmade 1–2 thread variation is seeded, so the cell still tiles.
 * Keys: '#' leaves, '+' band & borders, 'o' green details, '*' red centres.
 */
import { createRng } from './random';

export const LEAF_G = 140, LEAF_P = 18, LEAF_N = 4, LEAF_R = LEAF_P * LEAF_N;
type K = '#' | '+' | 'o' | '*' | null;

const cache = new Map<string, K[][]>();

export function aronaiLeafGrid(bothSides: boolean, wt: number): K[][] {
  const key = `${bothSides}|${Math.round(wt * 20)}`;
  const hit = cache.get(key); if (hit) return hit;
  const G = LEAF_G, R = LEAF_R;
  const g: K[][] = Array.from({ length: R }, () => Array<K>(G).fill(null));
  const put = (x: number, y: number, k: K) => { if (x >= 0 && x < G) g[((y % R) + R) % R][x] = k; };
  const col = (x: number, k: K, every = 1) => { for (let y = 0; y < R; y++) if (y % every === 0) put(x, y, k); };
  const rng = createRng(4113);

  // selvedge stripes
  col(3, '+'); col(6, 'o'); col(G - 4, '+'); col(G - 7, 'o');

  const B0 = bothSides ? 54 : 34, B1 = B0 + 20, cx = B0 + 10;
  if (!bothSides) {
    // left: a different, narrow strip of small diamonds
    const LB0 = 18, LB1 = 30, lc = 24;
    col(LB0, '+'); col(LB1, '+'); col(LB0 + 1, 'o', 3); col(LB1 - 1, 'o', 3);
    for (let cy = 4; cy < R; cy += 9) for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.abs(dx) + Math.abs(dy);
      if (d === 4) put(lc + dx, cy + dy, 'o'); else if (d === 1) put(lc + dx, cy + dy, '+'); else if (d === 0) put(lc, cy, '*');
    }
  }
  // narrow central band: diamond chain, green four-petal flowers, half-motifs on the edges
  col(B0, '+'); col(B1, '+'); col(B0 + 2, 'o', 2); col(B1 - 2, 'o', 2);
  const PER = LEAF_P, H2 = PER / 2;
  for (let y = 0; y < R; y++) { const t = y % PER, off = t <= H2 ? t : PER - t; put(cx - 8 + Math.round(off * 8 / H2), y, '+'); put(cx + 8 - Math.round(off * 8 / H2), y, '+'); }
  for (let k = 0; k < R / PER; k++) {
    const cy = k * PER + H2;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const ax = Math.abs(dx), ay = Math.abs(dy);
      if (ax + ay === 0) put(cx, cy, '*');
      else if ((ax === 0 && ay >= 2) || (ay === 0 && ax >= 2) || (ax === 1 && ay === 1)) put(cx + dx, cy + dy, 'o');
    }
    for (const sx of [-1, 1]) for (let dy = -2; dy <= 2; dy++) for (let dx = 0; dx <= 2; dx++)
      if (Math.abs(dy) + dx <= 2 && (Math.abs(dy) + dx) % 2 === 0) put(cx + sx * (9 - dx), k * PER + dy, 'o');
    put(cx, k * PER, '*');
  }

  // pointed woven leaves
  const Lbase = Math.round(26 + wt * 14);
  const leaf = (L0: number, dir: 1 | -1, k: number, yb: number) => {
    const H = 15 + rng.int(0, 1), c = Math.round(H * 0.55) + rng.int(-1, 0), Lmax = Lbase + rng.int(-2, 2);
    const Lr: number[] = [];
    for (let r = 0; r < H; r++) {
      const span = r < c ? c : H - 1 - c, t = Math.abs(r - c) / Math.max(span, 1);
      Lr.push(r === c ? Lmax : Math.max(1, Math.round(Lmax * Math.pow(1 - t, 0.8)) + rng.int(-1, 1)));
    }
    Lr[0] = Math.min(Lr[0], 3); Lr[H - 1] = Math.min(Lr[H - 1], 3);
    const top = (s: number) => { for (let r = 0; r < H; r++) if (Lr[r] >= s) return r; return c; };
    const bot = (s: number) => { for (let r = H - 1; r >= 0; r--) if (Lr[r] >= s) return r; return c; };
    for (let r = 0; r < H; r++) for (let s = 0; s <= Lr[r]; s++) {
      const x = L0 + dir * s, y = yb + r;
      if (s === 0) { put(x, y, '#'); continue; }
      const d = r < c ? r - top(s) : r > c ? bot(s) - r : Math.min(r - top(s), bot(s) - r);
      if (d === 0) { put(x, y, '#'); continue; }
      if (r === c) continue;
      const ph = r < c ? s - 2 * r + k : s + 2 * r + k;
      if (((ph % 5) + 5) % 5 <= 1) put(x, y, '#');
      else if (((ph % 5) + 5) % 5 === 3 && (s + r + k) % 9 === 0) put(x, y, 'o');
    }
    const tail = 1 + rng.int(0, 2);
    for (let t = 1; t <= tail; t++) put(L0 + dir * (Lmax + t), yb + c + (t === tail && rng() < 0.4 ? 1 : 0), '#');
  };
  for (let k = 0; k < LEAF_N; k++) {
    leaf(B1 + 1, 1, k, k * LEAF_P + 1);
    if (bothSides) leaf(B0 - 1, -1, k + 2, k * LEAF_P + 1 + H2);   // outer side, same lean, offset half a step
  }

  // a few tiny accent marks in the open cloth
  const ax0 = bothSides ? 0 : 118;
  if (!bothSides) for (const [dx, dy, k] of [[0, 0, '*'], [-1, 0, 'o'], [1, 0, 'o'], [0, -1, 'o'], [0, 1, 'o']] as const) put(ax0 + dx, 30 + dy, k);
  cache.set(key, g);
  return g;
}
