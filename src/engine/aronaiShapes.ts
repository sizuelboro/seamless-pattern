/**
 * Bodo Aronai shapes (original interpretations): fishbone arrow teeth, sunburst medallion,
 * paisley curl and star flower. All return plain polygons in pixel space so they can feed
 * both the geometric base (PathBuilder) and motif paths.
 */
export type Pt = [number, number];
export type Poly = Pt[];

const TAU = Math.PI * 2;
const at = (cx: number, cy: number, r: number, a: number): Pt => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

/**
 * Fishbone tooth: a triangle with its tip at (tx, yc) and base on x = bx, cut into k nested
 * chevrons "<<<" that all end on the triangle edges. tf = chevron thickness / pitch.
 */
export function fishbone(tx: number, bx: number, yc: number, hh: number, k: number, tf: number): Poly[] {
  const dir = Math.sign(bx - tx) || 1, L = Math.abs(bx - tx);
  if (L <= 0 || hh <= 0) return [];
  const m = hh / L, sv = m * 2.4;
  const end = (a0: number): { a: number; h: number; base: boolean } => {
    const a = (sv * a0) / (sv - m);
    return a >= L ? { a: L, h: Math.max(0, sv * (L - a0)), base: true } : { a, h: m * a, base: false };
  };
  const P = (a: number, h: number): Pt => [tx + dir * a, yc - h];
  const out: Poly[] = [];
  const pitch = L / k, tk = pitch * Math.min(0.85, Math.max(0.2, tf));
  for (let i = 0; i < k; i++) {
    const a0 = i * pitch, a1 = Math.min(L, a0 + tk);
    const e0 = end(a0), e1 = end(a1);
    const up: Pt[] = [P(e0.a, e0.h)];
    if (!e0.base && e1.base) up.push(P(L, hh));
    up.push(P(e1.a, e1.h));
    const down = up.map(([x, y]) => [x, 2 * yc - y] as Pt).reverse();
    out.push([P(a0, 0), ...up, P(a1, 0), ...down]);
  }
  return out;
}

/** Ring made of quads (no even-odd needed). */
export function ring(cx: number, cy: number, r0: number, r1: number, seg = 48): Poly[] {
  const out: Poly[] = [];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * TAU, b = ((i + 1.04) / seg) * TAU;
    out.push([at(cx, cy, r0, a), at(cx, cy, r1, a), at(cx, cy, r1, b), at(cx, cy, r0, b)]);
  }
  return out;
}

/** Radiating rays between r0 and r1. */
export function rays(cx: number, cy: number, r0: number, r1: number, n: number, w0: number, w1: number, rot = 0): Poly[] {
  const out: Poly[] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU, s = TAU / n;
    out.push([at(cx, cy, r0, a - s * w0 / 2), at(cx, cy, r1, a - s * w1 / 2), at(cx, cy, r1, a + s * w1 / 2), at(cx, cy, r0, a + s * w0 / 2)]);
  }
  return out;
}

export function ngon(cx: number, cy: number, r: number, n = 20, rot = 0): Poly {
  return Array.from({ length: n }, (_, i) => at(cx, cy, r, rot + (i / n) * TAU));
}

/** Star flower: n lens petals from r0 to r1. */
export function starFlower(cx: number, cy: number, r1: number, n = 8, r0 = r1 * 0.18, wd = 0.28, rot = -Math.PI / 2): Poly[] {
  const out: Poly[] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU, c = Math.cos(a), s = Math.sin(a), w = r1 * wd;
    const L = (t: number, o: number): Pt => [cx + c * t - s * o, cy + s * t + c * o];
    const mid = r0 + (r1 - r0) * 0.45;
    out.push([L(r0, 0), L(mid, w / 2), L(r1, 0), L(mid, -w / 2)]);
  }
  out.push(ngon(cx, cy, r0 * 1.05, 12));
  return out;
}

/** Sunburst medallion: outer rays, ring, inner rays, ring. Flower centre is separate. */
export function sunburst(cx: number, cy: number, R: number, wt: number): { main: Poly[]; flower: Poly[] } {
  const main = [
    ...rays(cx, cy, R * 0.7, R, 24, 0.5 + wt * 0.2, 0.62 + wt * 0.2),
    ...ring(cx, cy, R * 0.58, R * 0.65),
    ...rays(cx, cy, R * 0.4, R * 0.53, 16, 0.42, 0.55, Math.PI / 16),
    ...ring(cx, cy, R * 0.33, R * 0.37, 36),
  ];
  return { main, flower: starFlower(cx, cy, R * 0.29, 8, R * 0.06, 0.34) };
}

function quad(a: Pt, c: Pt, b: Pt, steps = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return out;
}

/** Paisley outline in unit space (body radius 1 at the origin, tail curling up-right). */
function paisleyUnit(): Pt[] {
  const pts: Pt[] = [];
  const a0 = (-100 * Math.PI) / 180, a1 = (-15 * Math.PI) / 180;
  // body arc from the top, round the left, bottom and right sides
  for (let i = 0; i <= 28; i++) {
    const a = a0 - (i / 28) * (TAU - (a1 - a0));
    pts.push([Math.cos(a), Math.sin(a)]);
  }
  const p1 = pts[pts.length - 1], tip: Pt = [1.05, -2.05];
  pts.push(...quad(p1, [1.55, -1.0], tip));
  pts.push(...quad(tip, [0.45, -1.75], [Math.cos(a0), Math.sin(a0)]).slice(0, -1));
  return pts;
}
const PAISLEY = paisleyUnit();

/** Paisley outline (outer + inner hole for even-odd) and its eye. */
export function paisley(cx: number, cy: number, s: number, fx = 1, fy = 1): { body: Poly[]; eye: Poly } {
  const T = (k: number, ox: number, oy: number) => PAISLEY.map(([x, y]) => [cx + (x * k + ox) * s * fx, cy + (y * k + oy) * s * fy] as Pt);
  return { body: [T(1, 0, 0), T(0.6, 0.06, -0.08)], eye: ngon(cx + 0.02 * s * fx, cy + 0.05 * s * fy, s * 0.26, 14) };
}

export const polyD = (polys: Poly[], f = (v: number) => String(Math.round(v * 100) / 100)) =>
  polys.map((p) => `M${p.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`).join('');
