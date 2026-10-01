/**
 * Woven-grid helpers for Bodo Agor. Designs are counted on a thread grid like on the loom:
 * every lit cell is one "float". Cells are merged into horizontal runs, and each run
 * overlaps the row below by a hair so adjacent rows never show anti-aliasing seams.
 */
export type Lit = (x: number, y: number) => string | null;

/** Group lit cells into runs per key: [x, y, length]. */
export function runs(lit: Lit, x0: number, y0: number, x1: number, y1: number): Map<string, [number, number, number][]> {
  const out = new Map<string, [number, number, number][]>();
  for (let y = y0; y < y1; y++) {
    let x = x0;
    while (x < x1) {
      const k = lit(x, y);
      if (!k) { x++; continue; }
      let e = x + 1;
      while (e < x1 && lit(e, y) === k) e++;
      (out.get(k) ?? out.set(k, []).get(k)!).push([x, y, e - x]);
      x = e;
    }
  }
  return out;
}

/** SVG path for runs on a grid of cell size `u` with origin (ox, oy). */
export function runsPath(list: [number, number, number][], u: number, ox = 0, oy = 0, bleed = 0.04, uy = u): string {
  const f = (v: number) => String(Math.round(v * 100) / 100);
  return list.map(([x, y, l]) => {
    const X = ox + x * u, Y = oy + y * uy, w = l * u + u * bleed, h = uy * (1 + bleed);
    return `M${f(X)} ${f(Y)}H${f(X + w)}V${f(Y + h)}H${f(X)}Z`;
  }).join('');
}

/** Manhattan ("diamond") distance — the natural metric of woven diamonds. */
export const dd = (x: number, y: number) => Math.abs(x) + Math.abs(y);
