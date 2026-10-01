import type { GenerationSettings, PatternObject } from '../types/pattern';
import { createRng, mod, type Rng } from './random';

const MAX_OBJECTS = 1600;

interface Ctx {
  s: GenerationSettings;
  rng: Rng;
  W: number;
  H: number;
  base: number;
  cell: number;
  out: PatternObject[];
}

/** Derived sizes, shared by every layout. All values are tile pixels. */
function metrics(s: GenerationSettings) {
  const W = s.tileWidth, H = s.tileHeight;
  const unit = Math.sqrt(W * H) / 1024;
  const base = 120 * unit * (s.scale / 100);
  const gap = s.spacing * unit;
  let cell = (base * 0.9 + gap) / Math.sqrt(s.density / 100);
  const minCell = Math.sqrt((W * H) / MAX_OBJECTS);
  cell = Math.max(cell, minCell, 4);
  return { W, H, base, cell };
}

function rotation(c: Ctx, forceRandom = false): number {
  const { s, rng } = c;
  const v = s.variation / 100;
  if (forceRandom || s.rotationMode === 'random') return rng.range(0, 360);
  if (s.rotationMode === 'custom') {
    const lo = Math.min(s.rotationMin, s.rotationMax), hi = Math.max(s.rotationMin, s.rotationMax);
    return rng.range(lo, hi);
  }
  const baseAngle = Number(s.rotationMode);
  return baseAngle + (rng() * 2 - 1) * v * 25;
}

function sizeJitter(c: Ctx, amount = 0.5): number {
  const v = c.s.variation / 100;
  return 1 + (c.rng() * 2 - 1) * v * amount;
}

function push(c: Ctx, x: number, y: number, type: string, colorIndex: number, opts: Partial<PatternObject> = {}) {
  const size = opts.width ?? c.base;
  c.out.push({
    id: `g${c.out.length}`,
    type,
    x: mod(x, c.W),
    y: mod(y, c.H),
    width: size,
    height: size,
    rotation: opts.rotation ?? rotation(c),
    scale: opts.scale ?? sizeJitter(c),
    opacity: opts.opacity ?? c.s.opacity / 100,
    colorIndex,
    flipX: opts.flipX ?? false,
    locked: false,
  });
}

/** Toroidal (wrap-around) dart throwing: keeps spacing even across tile edges. */
function poisson(c: Ctx, count: number, minDist: number, attempts = 30): [number, number][] {
  const pts: [number, number][] = [];
  const { W, H, rng } = c;
  const d2 = minDist * minDist;
  for (let i = 0; i < count; i++) {
    let best: [number, number] | null = null;
    let bestScore = -1;
    for (let a = 0; a < attempts; a++) {
      const p: [number, number] = [rng() * W, rng() * H];
      let nearest = Infinity;
      for (const q of pts) {
        let dx = Math.abs(p[0] - q[0]); dx = Math.min(dx, W - dx);
        let dy = Math.abs(p[1] - q[1]); dy = Math.min(dy, H - dy);
        const dd = dx * dx + dy * dy;
        if (dd < nearest) nearest = dd;
        if (nearest < bestScore) break;
      }
      if (nearest >= d2) { best = p; break; }
      if (nearest > bestScore) { bestScore = nearest; best = p; }
    }
    if (best) pts.push(best);
  }
  return pts;
}

const evenCount = (n: number) => Math.max(2, Math.round(n / 2) * 2);
const count = (len: number, cell: number) => Math.max(1, Math.round(len / cell));

const LAYOUTS: Record<GenerationSettings['layout'], (c: Ctx) => void> = {
  random(c) {
    const n = Math.max(1, Math.round((c.W * c.H) / (c.cell * c.cell)));
    const pts = poisson(c, n, c.cell * 0.82);
    const m = c.s.motifs;
    pts.forEach(([x, y]) => push(c, x, y, m[c.rng.int(0, m.length - 1)], c.rng.int(0, 99)));
  },
  tossed(c) {
    const n = Math.max(1, Math.round((c.W * c.H) / (c.cell * c.cell)));
    const pts = poisson(c, n, c.cell * 0.6, 12);
    const m = c.s.motifs;
    const custom = c.s.rotationMode === 'custom';
    pts.forEach(([x, y]) => push(c, x, y, c.rng.pick(m), c.rng.int(0, 99), { rotation: rotation(c, !custom), scale: sizeJitter(c, 0.6) }));
  },
  grid(c) {
    const nx = count(c.W, c.cell), ny = count(c.H, c.cell);
    const m = c.s.motifs;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      push(c, ((i + 0.5) * c.W) / nx, ((j + 0.5) * c.H) / ny, m[(i + j * 2) % m.length], i + j);
    }
  },
  brick(c) {
    const nx = count(c.W, c.cell), ny = evenCount(c.H / c.cell);
    const m = c.s.motifs;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const off = j % 2 ? 0.5 : 0;
      push(c, ((i + 0.5 + off) * c.W) / nx, ((j + 0.5) * c.H) / ny, m[(i + j) % m.length], i * 2 + j);
    }
  },
  hex(c) {
    const nx = count(c.W, c.cell), ny = evenCount(c.H / (c.cell * 0.866));
    const m = c.s.motifs;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const off = j % 2 ? 0.5 : 0;
      push(c, ((i + off) * c.W) / nx, (j * c.H) / ny, m[(i + (j >> 1)) % m.length], i + j * 2);
    }
  },
  halfdrop(c) {
    const nx = evenCount(c.W / c.cell), ny = count(c.H, c.cell);
    const m = c.s.motifs;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const off = i % 2 ? 0.5 : 0;
      push(c, ((i + 0.5) * c.W) / nx, ((j + 0.5 + off) * c.H) / ny, m[(j + i * 2) % m.length], j + i);
    }
  },
  mirror(c) {
    const nx = evenCount(c.W / c.cell), ny = evenCount(c.H / c.cell);
    const m = c.s.motifs;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i += 2) {
        const type = m[((i >> 1) + j) % m.length];
        const r = rotation(c);
        const sc = sizeJitter(c);
        const ci = (i >> 1) + j;
        push(c, ((i + 0.5) * c.W) / nx, ((j + 0.5) * c.H) / ny, type, ci, { rotation: r, scale: sc });
        push(c, ((i + 1.5) * c.W) / nx, ((j + 0.5) * c.H) / ny, type, ci, { rotation: -r, scale: sc, flipX: true });
      }
    }
  },
  radial(c) {
    const cluster = c.cell * 3;
    const nx = count(c.W, cluster), ny = count(c.H, cluster);
    const cw = c.W / nx, ch = c.H / ny;
    const m = c.s.motifs;
    const ringR = Math.min(cw, ch) * 0.3;
    const k = Math.max(5, Math.min(12, Math.round((2 * Math.PI * ringR) / (c.base * 1.05))));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const cx = (i + 0.5) * cw, cy = (j + 0.5) * ch;
      const centerType = m[0];
      const ringType = m[1 % m.length];
      const cornerType = m[2 % m.length];
      push(c, cx, cy, centerType, 0, { rotation: 0, scale: 1.25 });
      const phase = c.rng.range(0, 360 / k) * (c.s.variation / 100);
      for (let t = 0; t < k; t++) {
        const a = phase + (t * 360) / k;
        const ar = (a * Math.PI) / 180;
        push(c, cx + Math.cos(ar) * ringR, cy + Math.sin(ar) * ringR, ringType, 1, { rotation: a + 90, scale: 0.75 * sizeJitter(c, 0.2) });
      }
      push(c, i * cw, j * ch, cornerType, 2, { rotation: 45, scale: 0.7 });
    }
  },
  stripe(c) {
    const vertical = c.s.stripeDirection === 'vertical';
    const along = vertical ? c.H : c.W;
    const across = vertical ? c.W : c.H;
    const rows = count(across, c.cell * 1.25);
    const perRow = count(along, c.cell * 0.8);
    const m = c.s.motifs;
    for (let r = 0; r < rows; r++) {
      const type = m[r % m.length];
      const off = r % 2 ? 0.5 : 0;
      for (let i = 0; i < perRow; i++) {
        const a = ((i + 0.5 + off) * along) / perRow;
        const b = ((r + 0.5) * across) / rows;
        const rot = c.s.rotationMode === 'random' ? rotation(c) : (vertical ? 90 : 0) + rotation(c);
        push(c, vertical ? b : a, vertical ? a : b, type, r, { rotation: rot, scale: 0.85 * sizeJitter(c, 0.3) });
      }
    }
  },
  checker(c) {
    const nx = evenCount(c.W / c.cell), ny = evenCount(c.H / c.cell);
    const m = c.s.motifs;
    const others = m.length > 1 ? m.slice(1) : m;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const even = (i + j) % 2 === 0;
      const type = even ? m[0] : others[((i >> 1) + j) % others.length];
      const isTile = type === 'tile';
      const cellW = c.W / nx, cellH = c.H / ny;
      push(c, ((i + 0.5) * c.W) / nx, ((j + 0.5) * c.H) / ny, type, even ? 0 : 1 + ((i + j) >> 1), isTile
        ? { width: Math.max(cellW, cellH), rotation: 0, scale: 1 }
        : {});
    }
  },
};

/** Deterministically generate motif instances. Same settings (incl. seed) => same output. */
export function generatePattern(s: GenerationSettings, keep: PatternObject[] = []): PatternObject[] {
  const motifs = s.motifs.length ? s.motifs : ['dot'];
  const settings = { ...s, motifs };
  const { W, H, base, cell } = metrics(settings);
  const c: Ctx = { s: settings, rng: createRng(s.seed), W, H, base, cell, out: [] };
  LAYOUTS[s.layout](c);
  // 'tile' squares (gingham) should sit behind everything else
  c.out.sort((a, b) => (a.type === 'tile' ? 0 : 1) - (b.type === 'tile' ? 0 : 1));
  if (s.colorMode === 'byMotif') {
    const colorRng = createRng(s.seed * 7 + 13);
    for (const o of c.out) {
      const list = s.motifColors?.[o.type];
      o.colorIndex = list && list.length ? colorRng.pick(list) : Math.max(0, motifs.indexOf(o.type));
    }
  }
  const locked = keep.filter((o) => o.locked);
  return [...c.out, ...locked];
}

export const LAYOUT_OPTIONS: { id: GenerationSettings['layout']; label: string; hint: string }[] = [
  { id: 'random', label: 'Random', hint: 'Organic, evenly scattered' },
  { id: 'grid', label: 'Grid', hint: 'Regular rows and columns' },
  { id: 'brick', label: 'Brick', hint: 'Rows offset by half' },
  { id: 'hex', label: 'Hex', hint: 'Hexagonal packing' },
  { id: 'halfdrop', label: 'Half drop', hint: 'Columns dropped by half' },
  { id: 'mirror', label: 'Mirror', hint: 'Mirrored motif pairs' },
  { id: 'radial', label: 'Radial', hint: 'Rosette clusters' },
  { id: 'tossed', label: 'Tossed', hint: 'Random rotation, tossed look' },
  { id: 'stripe', label: 'Stripe', hint: 'Motif bands' },
  { id: 'checker', label: 'Checker', hint: 'Alternating cells' },
];
