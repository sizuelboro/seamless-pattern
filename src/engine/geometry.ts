/** Tiny SVG path builders used to author motifs in a 100×100 view box.
 *  All closed primitives are emitted clockwise (screen space) so unions fill correctly. */
type Pt = [number, number];
const f = (n: number) => String(Math.round(n * 100) / 100);
const rad = (d: number) => (d * Math.PI) / 180;
const rot = (x: number, y: number, deg: number): Pt => {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [x * c - y * s, x * s + y * c];
};

export const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 1 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 1 ${f(cx - r)} ${f(cy)}Z`;

export const circles = (list: [number, number, number][]) => list.map(([x, y, r]) => circle(x, y, r)).join('');

export const ellipse = (cx: number, cy: number, rx: number, ry: number, rotation = 0) => {
  const [ax, ay] = rot(-rx, 0, rotation);
  const p1: Pt = [cx + ax, cy + ay];
  const p2: Pt = [cx - ax, cy - ay];
  return `M${f(p1[0])} ${f(p1[1])}A${f(rx)} ${f(ry)} ${f(rotation)} 1 1 ${f(p2[0])} ${f(p2[1])}A${f(rx)} ${f(ry)} ${f(rotation)} 1 1 ${f(p1[0])} ${f(p1[1])}Z`;
};

export const rect = (x: number, y: number, w: number, h: number, r = 0) => {
  if (r <= 0) return `M${f(x)} ${f(y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`;
  r = Math.min(r, w / 2, h / 2);
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
};

export const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
export const polyline = (pts: Pt[]) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}`;

export const regular = (cx: number, cy: number, n: number, r: number, rotation = -90) =>
  poly(Array.from({ length: n }, (_, i) => {
    const a = rad(rotation + (i * 360) / n);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  }));

export const star = (cx: number, cy: number, n: number, ro: number, ri: number, rotation = -90) =>
  poly(Array.from({ length: n * 2 }, (_, i) => {
    const a = rad(rotation + (i * 180) / n);
    const r = i % 2 === 0 ? ro : ri;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  }));

export const petals = (cx: number, cy: number, n: number, dist: number, rx: number, ry: number, rotation = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = rotation + (i * 360) / n;
    return ellipse(cx + dist * Math.cos(rad(a)), cy + dist * Math.sin(rad(a)), rx, ry, a);
  }).join('');

/** Almond leaf from base (x1,y1) to tip (x2,y2) with half-width w. */
export const leaf = (x1: number, y1: number, x2: number, y2: number, w: number) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * w, ny = (dx / len) * w;
  const p = (t: number, s: number): string => `${f(x1 + dx * t + nx * s)} ${f(y1 + dy * t + ny * s)}`;
  return `M${f(x1)} ${f(y1)}C${p(0.2, 1.15)} ${p(0.65, 1)} ${f(x2)} ${f(y2)}C${p(0.65, -1)} ${p(0.2, -1.15)} ${f(x1)} ${f(y1)}Z`;
};

export const line = (x1: number, y1: number, x2: number, y2: number) => `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;

/** Open circular arc from angle a0 to a1 (degrees, screen space, clockwise). */
export const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const s: Pt = [cx + r * Math.cos(rad(a0)), cy + r * Math.sin(rad(a0))];
  const e: Pt = [cx + r * Math.cos(rad(a1)), cy + r * Math.sin(rad(a1))];
  const large = Math.abs(a1 - a0) % 360 > 180 ? 1 : 0;
  return `M${f(s[0])} ${f(s[1])}A${f(r)} ${f(r)} 0 ${large} 1 ${f(e[0])} ${f(e[1])}`;
};

export const wedge = (cx: number, cy: number, r: number, a0: number, a1: number) =>
  `M${f(cx)} ${f(cy)}L${arc(cx, cy, r, a0, a1).slice(1)}Z`;

export const rays = (cx: number, cy: number, n: number, r1: number, r2: number, rotation = -90, sweep = 360) =>
  Array.from({ length: n }, (_, i) => {
    const a = rad(rotation + (sweep === 360 ? (i * 360) / n : (i * sweep) / (n - 1)));
    return line(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a), cx + r2 * Math.cos(a), cy + r2 * Math.sin(a));
  }).join('');

export const spiral = (cx: number, cy: number, r0: number, r1: number, turns: number) => {
  const pts: Pt[] = [];
  const steps = Math.round(turns * 40);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return polyline(pts);
};

/** Crescent: disc (c1,r1) minus disc (c2,r2). c2 should be offset toward upper-right. */
export const crescent = (c1x: number, c1y: number, r1: number, c2x: number, c2y: number, r2: number) => {
  const dx = c2x - c1x, dy = c2y - c1y;
  const d = Math.hypot(dx, dy);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const px = c1x + (a * dx) / d, py = c1y + (a * dy) / d;
  const ux = -dy / d, uy = dx / d;
  const A: Pt = [px - h * ux, py - h * uy];
  const B: Pt = [px + h * ux, py + h * uy];
  const angA = Math.atan2(A[1] - c2y, A[0] - c2x);
  const angB = Math.atan2(B[1] - c2y, B[0] - c2x);
  let span = ((angA - angB) * 180) / Math.PI;
  span = ((span % 360) + 360) % 360;
  return `M${f(A[0])} ${f(A[1])}A${f(r1)} ${f(r1)} 0 1 0 ${f(B[0])} ${f(B[1])}A${f(r2)} ${f(r2)} 0 ${span > 180 ? 1 : 0} 1 ${f(A[0])} ${f(A[1])}Z`;
};

/** Leaves along a quadratic stem p0 -> c -> p1. */
export const sprig = (p0: Pt, c: Pt, p1: Pt, ts: number[], len: number, w: number, angle = 50, tip = true) => {
  const out: string[] = [];
  ts.forEach((t, i) => {
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1];
    const tx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]);
    const ty = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
    const tl = Math.hypot(tx, ty) || 1;
    const side = i % 2 === 0 ? 1 : -1;
    const [vx, vy] = rot(tx / tl, ty / tl, angle * side);
    out.push(leaf(x, y, x + vx * len, y + vy * len, w));
  });
  if (tip) {
    const tx = p1[0] - c[0], ty = p1[1] - c[1];
    const tl = Math.hypot(tx, ty) || 1;
    out.push(leaf(p1[0], p1[1], p1[0] + (tx / tl) * len * 0.9, p1[1] + (ty / tl) * len * 0.9, w * 0.9));
  }
  return out.join('');
};

export const mirrorX = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [100 - x, y] as Pt);
export const snowArms = (cx: number, cy: number, n: number, at: number, len: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = -90 + (i * 360) / n;
    const bx = cx + at * Math.cos(rad(a)), by = cy + at * Math.sin(rad(a));
    return [a - 40, a + 40].map((b) => line(bx, by, bx + len * Math.cos(rad(b)), by + len * Math.sin(rad(b)))).join('');
  }).join('');
