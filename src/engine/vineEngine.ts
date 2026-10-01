/**
 * Chintz / Jacobean vine network. A seeded set of flower nodes is scattered on the torus
 * (the tile with its edges glued), joined by S-curved stems along wrap-aware nearest
 * neighbours, so every stem that leaves one edge re-enters from the opposite edge.
 * The generator hangs flowers on the nodes and leaves / buds / tendrils along the stems;
 * the renderer strokes the stems. Both derive everything from the generation settings.
 */
import type { GenerationSettings } from '../types/pattern';
import { createRng, mod } from './random';

type Pt = [number, number];
export type VSeg = [Pt, Pt, Pt, Pt];

export interface VineLeaf { x: number; y: number; rot: number; flip: boolean; t: number }
export interface VineNet {
  nodes: Pt[];
  stems: VSeg[];
  tendrils: Pt[][];
  leaves: VineLeaf[];
  tips: { x: number; y: number; rot: number }[];
  flower: number;
  leaf: number;
  stemWidth: number;
}

const bez = (s: VSeg, t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]) as Pt;
};
const tangent = (s: VSeg, t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((k) => 3 * u * u * (s[1][k] - s[0][k]) + 6 * u * t * (s[2][k] - s[1][k]) + 3 * t * t * (s[3][k] - s[2][k])) as Pt;
};

let cacheKey = '';
let cacheNet: VineNet | null = null;

export function vineNetwork(s: GenerationSettings): VineNet {
  const key = JSON.stringify([s.seed, s.tileWidth, s.tileHeight, s.density, s.scale, s.spacing, s.variation, s.vineCurl ?? 50, s.vineWidth ?? 40]);
  if (cacheNet && key === cacheKey) return cacheNet;
  cacheNet = build(s); cacheKey = key;
  return cacheNet;
}

function build(s: GenerationSettings): VineNet {
  const W = s.tileWidth, H = s.tileHeight;
  const rng = createRng((s.seed ^ 0x5eed) >>> 0);
  const unit = Math.sqrt(W * H) / 1024;
  const flower = 120 * unit * (s.scale / 100) * 2.1;
  const leafS = flower * 0.44;
  const curl = (s.vineCurl ?? 50) / 100;
  const cell = (flower * 1.3 + s.spacing * unit) / Math.sqrt(Math.max(0.1, s.density / 100));
  const n = Math.max(4, Math.min(160, Math.round((W * H) / (cell * cell))));

  // toroidal dart throwing for flower nodes
  const nodes: Pt[] = [];
  const wd = (a: Pt, b: Pt): Pt => {
    let dx = b[0] - a[0], dy = b[1] - a[1];
    dx -= Math.round(dx / W) * W; dy -= Math.round(dy / H) * H;
    return [dx, dy];
  };
  const minD = cell * 0.78;
  for (let i = 0; i < n; i++) {
    let best: Pt | null = null, bestD = -1;
    for (let a = 0; a < 40; a++) {
      const p: Pt = [rng() * W, rng() * H];
      let near = Infinity;
      for (const q of nodes) { const [dx, dy] = wd(p, q); near = Math.min(near, dx * dx + dy * dy); }
      if (near >= minD * minD) { best = p; break; }
      if (near > bestD) { bestD = near; best = p; }
    }
    if (best) nodes.push(best);
  }

  // edges: each node links to its nearest neighbour in the "right" and "down" sectors, looking at
  // every periodic copy (so even a lone node links to itself across the seam). The result is a
  // lattice-like web that always wraps around the tile in both directions.
  const links: { i: number; d: Pt }[] = [];
  const deg = new Array(nodes.length).fill(0);
  nodes.forEach((p, i) => {
    for (const [lo, hi] of [[-50, 40], [40, 130]] as const) {
      let best: { j: number; d: Pt; l: number } | null = null;
      nodes.forEach((q, j) => {
        for (let kx = -1; kx <= 1; kx++) for (let ky = -1; ky <= 1; ky++) {
          const d: Pt = [q[0] + kx * W - p[0], q[1] + ky * H - p[1]];
          const l = Math.hypot(d[0], d[1]);
          if (l < 1e-6) continue;
          const ang = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
          if (ang < lo || ang >= hi) continue;
          if (!best || l < best.l) best = { j, d, l };
        }
      });
      if (best) { const b = best as { j: number; d: Pt; l: number }; links.push({ i, d: b.d }); deg[i]++; deg[b.j]++; }
    }
  });
  // thin out a few links where both ends stay well connected, for a looser, hand-drawn web
  const edges: { i: number; d: Pt }[] = [];
  for (const e of links) {
    const j = nodes.findIndex((q) => Math.abs(mod(nodes[e.i][0] + e.d[0] - q[0] + W / 2, W) - W / 2) < 1e-6 && Math.abs(mod(nodes[e.i][1] + e.d[1] - q[1] + H / 2, H) - H / 2) < 1e-6);
    if (j >= 0 && deg[e.i] > 3 && deg[j] > 3 && rng() < 0.3) { deg[e.i]--; deg[j]--; continue; }
    edges.push(e);
  }

  const stems: VSeg[] = [];
  const tendrils: Pt[][] = [];
  const leaves: VineLeaf[] = [];
  const tips: VineNet['tips'] = [];
  const stemWidth = Math.max(0.6, ((s.vineWidth ?? 40) / 100) * 15 * unit);
  for (const { i, d } of edges) {
    const a = nodes[i];
    const b: Pt = [a[0] + d[0], a[1] + d[1]];
    const len = Math.hypot(d[0], d[1]) || 1;
    const nx = -d[1] / len, ny = d[0] / len;
    const bow = len * (0.18 + curl * 0.32);
    const s1 = rng() < 0.5 ? 1 : -1, s2 = rng() < 0.65 ? -s1 : s1;
    const seg: VSeg = [a, [a[0] + d[0] / 3 + nx * bow * s1, a[1] + d[1] / 3 + ny * bow * s1], [a[0] + (2 * d[0]) / 3 + nx * bow * s2, a[1] + (2 * d[1]) / 3 + ny * bow * s2], b];
    stems.push(seg);

    // leaves along the stem, alternating sides, clear of the flowers at both ends
    const steps = 40;
    let arc = 0, prev = bez(seg, 0), next = leafS * (0.9 + rng() * 0.4), side = rng() < 0.5 ? 1 : -1;
    const total = (() => { let L = 0, q = prev; for (let k = 1; k <= steps; k++) { const p = bez(seg, k / steps); L += Math.hypot(p[0] - q[0], p[1] - q[1]); q = p; } return L; })();
    const clear = flower * 0.5;
    for (let k = 1; k <= steps; k++) {
      const t = k / steps, p = bez(seg, t);
      arc += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p;
      if (arc < next) continue;
      next = arc + leafS * (0.55 + rng() * 0.35);
      if (arc < clear || total - arc < clear) continue;
      const tg = tangent(seg, t), ang = Math.atan2(tg[1], tg[0]);
      const out = ang + side * (0.9 + rng() * 0.35);
      if (rng() < 0.08 + curl * 0.14) {
        // tendril: short side shoot curling into a spiral
        const pts: Pt[] = [];
        let x = p[0], y = p[1], th = out, step = leafS * 0.09;
        for (let q = 0; q < 34; q++) { pts.push([x, y]); x += Math.cos(th) * step; y += Math.sin(th) * step; th += side * (0.03 + q * 0.012) * (0.6 + curl); step *= 0.965; }
        tendrils.push(pts);
      } else if (rng() < 0.22) {
        // short shoot ending in a bud / berry
        const L = leafS * 0.9, ex = p[0] + Math.cos(out) * L, ey = p[1] + Math.sin(out) * L;
        tendrils.push([[p[0], p[1]], [p[0] + Math.cos(out - side * 0.3) * L * 0.5, p[1] + Math.sin(out - side * 0.3) * L * 0.5], [ex, ey]]);
        tips.push({ x: ex, y: ey, rot: (out * 180) / Math.PI + 90 });
      } else {
        leaves.push({ x: p[0] + Math.cos(out) * leafS * 0.46, y: p[1] + Math.sin(out) * leafS * 0.46, rot: (out * 180) / Math.PI + 90, flip: side < 0, t });
      }
      side = -side;
    }
  }
  return { nodes, stems, tendrils, leaves, tips, flower, leaf: leafS, stemWidth };
}

/** Stroke path for the stems (tile space, with every wrapped copy that touches the tile). */
export function vinePath(s: GenerationSettings, ox = 0, oy = 0): { d: string; sw: number; tw: number } {
  const net = vineNetwork(s);
  const W = s.tileWidth, H = s.tileHeight;
  const P = (p: Pt, kx: number, ky: number) => `${r2(p[0] + kx * W + ox)} ${r2(p[1] + ky * H + oy)}`;
  const parts: string[] = [], tparts: string[] = [];
  const copies = (pts: Pt[], pad: number) => {
    const xs = pts.map((p) => p[0] + ox), ys = pts.map((p) => p[1] + oy);
    const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    const out: [number, number][] = [];
    for (let kx = Math.ceil(-x1 / W); kx <= Math.floor((W - x0) / W); kx++) for (let ky = Math.ceil(-y1 / H); ky <= Math.floor((H - y0) / H); ky++) out.push([kx, ky]);
    return out;
  };
  // stems are flattened to short lines: curve rasterisation varies with absolute position, lines don't
  for (const seg of net.stems) {
    const pts = stemPoints(seg);
    for (const [kx, ky] of copies(seg, net.stemWidth)) parts.push(`M${pts.map((p) => P(p, kx, ky)).join('L')}`);
  }
  for (const t of net.tendrils) for (const [kx, ky] of copies(t, net.stemWidth)) tparts.push(`M${t.map((p) => P(p, kx, ky)).join('L')}`);
  return { d: parts.join('') + '|' + tparts.join(''), sw: net.stemWidth, tw: net.stemWidth * 0.6 };
}
/** The polyline every stem is drawn as. */
export const stemPoints = (seg: VSeg): Pt[] => Array.from({ length: 41 }, (_, k) => bez(seg, k / 40));
const r2 = (v: number) => String(Math.round(v * 100) / 100);

export const wrapPt = (p: Pt, W: number, H: number): Pt => [mod(p[0], W), mod(p[1], H)];
