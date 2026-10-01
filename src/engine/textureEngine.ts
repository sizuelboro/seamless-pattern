/**
 * Print textures drawn over the finished pattern: distressed (worn block print), grain,
 * linen and canvas. Everything is seeded vector geometry that wraps at the tile edges, so
 * the texture repeats with the tile and exports identically to PNG and SVG.
 * "Distressed" specks are painted with the background (or erase to transparency).
 */
import type { TextureSettings } from '../types/pattern';
import { createRng, mod } from './random';

export const DEFAULT_TEXTURE: TextureSettings = { type: 'none', amount: 55, scale: 100, seed: 7 };
export const TEXTURE_OPTIONS: { id: TextureSettings['type']; label: string; hint: string }[] = [
  { id: 'none', label: 'None', hint: 'Clean print' },
  { id: 'distressed', label: 'Distressed', hint: 'Worn block-print specks' },
  { id: 'grain', label: 'Grain', hint: 'Fine paper grain' },
  { id: 'linen', label: 'Linen', hint: 'Woven fabric threads' },
  { id: 'canvas', label: 'Canvas', hint: 'Coarse canvas weave' },
];

export interface TexOp { d: string; fill: string; alpha?: number; bgPaint?: boolean }

const n = (v: number) => String(Math.round(v * 100) / 100);
const MAX_SPECKS = 9000;

let cacheKey = '';
let cacheOps: TexOp[] = [];

export function buildTexture(t: TextureSettings, W: number, H: number, ox = 0, oy = 0): TexOp[] {
  if (t.type === 'none' || t.amount <= 0) return [];
  const key = JSON.stringify([t, W, H, ox, oy]);
  if (key === cacheKey) return cacheOps;
  cacheOps = build(t, W, H, ox, oy); cacheKey = key;
  return cacheOps;
}

function build(t: TextureSettings, W: number, H: number, ox: number, oy: number): TexOp[] {
  const rng = createRng((t.seed * 2654435761) >>> 0 || 1);
  const a = Math.max(0, Math.min(100, t.amount)) / 100;
  const unit = Math.sqrt(W * H) / 1024;
  const r = (t.type === 'distressed' ? 3.6 : 2.6) * unit * (Math.max(25, t.scale) / 100);
  const ops: TexOp[] = [];

  /** Add a closed polygon (tile coords) with every wrapped copy that touches the tile. */
  const polyWrapped = (out: string[], pts: [number, number][]) => {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    for (let kx = Math.ceil(-x1 / W); kx <= Math.floor((W - x0) / W); kx++) for (let ky = Math.ceil(-y1 / H); ky <= Math.floor((H - y0) / H); ky++) {
      out.push(`M${pts.map(([x, y]) => `${n(x + kx * W)} ${n(y + ky * H)}`).join('L')}Z`);
    }
  };
  const blob = (cx: number, cy: number, rad: number): [number, number][] => {
    const k = 5 + Math.floor(rng() * 3), ph = rng() * Math.PI * 2;
    return Array.from({ length: k }, (_, i) => {
      const ang = ph + (i / k) * Math.PI * 2, rr = rad * (0.6 + rng() * 0.6);
      return [cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr] as [number, number];
    });
  };
  const at = (x: number, y: number): [number, number] => [mod(x + ox, W), mod(y + oy, H)];

  if (t.type === 'distressed') {
    const parts: string[] = [];
    const cover = 0.035 + a * 0.13;                       // share of the tile that wears away
    const total = Math.min(MAX_SPECKS, Math.round((cover * W * H) / (Math.PI * (r * 0.9) ** 2)));
    const clustered = Math.round(total * 0.75);
    const clusters = Math.max(1, Math.round(clustered / 45));
    let made = 0;
    for (let c = 0; c < clusters; c++) {
      const [cx, cy] = at(rng() * W, rng() * H);
      const spread = r * (5 + rng() * 14), cnt = Math.round((clustered / clusters) * (0.4 + rng() * 1.2));
      for (let i = 0; i < cnt && made < clustered; i++, made++) {
        const g = Math.sqrt(-2 * Math.log(rng() + 1e-9)) * spread * 0.55, th = rng() * Math.PI * 2;
        polyWrapped(parts, blob(cx + Math.cos(th) * g, cy + Math.sin(th) * g, r * (0.3 + rng() ** 2 * 1.6)));
      }
    }
    for (let i = made; i < total; i++) { const [x, y] = at(rng() * W, rng() * H); polyWrapped(parts, blob(x, y, r * (0.2 + rng() * 0.6))); }
    const scratches = Math.round(((W * H) / (r * 160) ** 2) * a * 3);
    for (let i = 0; i < scratches; i++) {
      const [x, y] = at(rng() * W, rng() * H), L = r * (8 + rng() * 30), th = rng() * Math.PI, w = r * (0.15 + rng() * 0.2);
      const dx = Math.cos(th) * L / 2, dy = Math.sin(th) * L / 2, nx = -Math.sin(th) * w, ny = Math.cos(th) * w;
      polyWrapped(parts, [[x - dx, y - dy], [x + dx + nx * 0.3, y + dy + ny * 0.3], [x + dx + nx, y + dy + ny], [x - dx + nx, y - dy + ny]]);
    }
    if (parts.length) ops.push({ d: parts.join(''), fill: '#000', bgPaint: true });
    return ops;
  }

  const grain = (amt: number) => {
    if (amt <= 0) return;
    const count = Math.min(12000, Math.round(((W * H) / (r * r)) * 0.05));
    for (const [col, al] of [['#000000', 0.05 + amt * 0.13], ['#FFFFFF', 0.05 + amt * 0.12]] as const) {
      const parts: string[] = [];
      for (let i = 0; i < count; i++) {
        const [x, y] = at(rng() * W, rng() * H), s = r * (0.35 + rng() * 0.5);
        polyWrapped(parts, [[x, y], [x + s, y], [x + s, y + s], [x, y + s]]);
      }
      ops.push({ d: parts.join(''), fill: col, alpha: Math.min(0.5, al) });
    }
  };

  if (t.type === 'grain') { grain(a); return ops; }

  // linen / canvas: integer thread counts per tile so the weave repeats exactly
  const sp = r * (t.type === 'canvas' ? 4.2 : 2.2);
  const buckets: Record<string, string[]> = {};
  const add = (col: string, al: number, rect: [number, number, number, number]) => {
    const k = `${col}|${al}`;
    (buckets[k] ??= []);
    const [x, y, w, h] = rect;
    polyWrapped(buckets[k], [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  };
  const levels = [0.04, 0.08, 0.13].map((v) => Math.round(v * (0.4 + a * 1.2) * 1000) / 1000);
  const nH = Math.max(2, Math.round(H / sp)), nV = Math.max(2, Math.round(W / sp));
  for (let k = 0; k < nH; k++) {
    const y = mod((k + 0.5) * (H / nH) + oy, H), th = (H / nH) * (0.3 + rng() * 0.25);
    add(rng() < 0.5 ? '#000000' : '#FFFFFF', levels[Math.floor(rng() * 3)], [0, y - th / 2, W, th]);
  }
  for (let k = 0; k < nV; k++) {
    const x = mod((k + 0.5) * (W / nV) + ox, W), th = (W / nV) * (0.3 + rng() * 0.25);
    add(rng() < 0.5 ? '#000000' : '#FFFFFF', levels[Math.floor(rng() * 3)], [x - th / 2, 0, th, H]);
  }
  for (const [k, parts] of Object.entries(buckets)) { const [col, al] = k.split('|'); ops.push({ d: parts.join(''), fill: col, alpha: Number(al) }); }
  grain(a * (t.type === 'canvas' ? 0.6 : 0.35));
  return ops;
}
