import type { PatternState, SeamReport } from '../types/pattern';
import { renderTile } from './seamlessRenderer';
import { createCanvas, get2d } from '../utils/canvas';

/**
 * Seam Check — two independent tests, neither of which assumes the renderer is correct.
 *
 * 1. Wrap test (motif layer). Render the tile A. Render the same pattern again with every
 *    object shifted by half a tile (B). If the tile truly repeats, B must equal A rolled by
 *    half a tile, pixel for pixel. Objects that were cut at an edge in A sit whole in the
 *    middle of B, so any missing wrapped copy shows up as a mismatch.
 * 2. Edge-continuity test (background layer). Compares the left/right and top/bottom edge
 *    pixels against the local gradient next to them; a jump across the seam is flagged.
 */
export function runSeamCheck(state: PatternState, opts: { wrap?: boolean; resolution?: number } = {}): SeamReport {
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  const res = opts.resolution ?? 512;
  const w = Math.max(64, Math.round((W >= H ? res : (res * W) / H) / 2) * 2);
  const h = Math.max(64, Math.round((H >= W ? res : (res * H) / W) / 2) * 2);

  const a = createCanvas(w, h), b = createCanvas(w, h), bg = createCanvas(w, h);
  const actx = get2d(a), bctx = get2d(b), gctx = get2d(bg);
  renderTile(actx, state, w, h, { transparent: true, wrap: opts.wrap });
  renderTile(bctx, state, w, h, { transparent: true, wrap: opts.wrap, offsetX: W / 2, offsetY: H / 2 });
  renderTile(gctx, state, w, h, { drawMotifs: false });

  const A = actx.getImageData(0, 0, w, h).data;
  const B = bctx.getImageData(0, 0, w, h).data;
  const hw = w / 2, hh = h / 2;
  const bins = 96;
  const rowBins = new Set<number>(), colBins = new Set<number>();
  let mismatches = 0;
  for (let y = 0; y < h; y++) {
    const ay = (y + hh) % h;
    for (let x = 0; x < w; x++) {
      const ax = (x + hw) % w;
      const i = (y * w + x) * 4, j = (ay * w + ax) * 4;
      const aa = A[j + 3] / 255, ba = B[i + 3] / 255;
      const d = Math.max(
        Math.abs(A[j] * aa - B[i] * ba), Math.abs(A[j + 1] * aa - B[i + 1] * ba),
        Math.abs(A[j + 2] * aa - B[i + 2] * ba), Math.abs(A[j + 3] - B[i + 3]),
      );
      if (d > 48) {
        mismatches++;
        const dx = Math.min(ax, w - ax), dy = Math.min(ay, h - ay);
        if (dx <= dy) rowBins.add(Math.floor((ay / h) * bins));
        else colBins.add(Math.floor((ax / w) * bins));
      }
    }
  }

  // Background edge continuity
  const G = gctx.getImageData(0, 0, w, h).data;
  const px = (x: number, y: number) => (y * w + x) * 4;
  const diff = (p: number, q: number) => Math.max(Math.abs(G[p] - G[q]), Math.abs(G[p + 1] - G[q + 1]), Math.abs(G[p + 2] - G[q + 2]), Math.abs(G[p + 3] - G[q + 3]));
  let bgBreaks = 0;
  const jump = (seam: number, inner: number) => seam > 6 && seam > inner * 3 + 4;
  for (let y = 0; y < h; y++) {
    const s = diff(px(w - 1, y), px(0, y));
    const inner = Math.max(diff(px(w - 2, y), px(w - 1, y)), diff(px(0, y), px(1, y)));
    if (jump(s, inner)) { bgBreaks++; rowBins.add(Math.floor((y / h) * bins)); }
  }
  for (let x = 0; x < w; x++) {
    const s = diff(px(x, h - 1), px(x, 0));
    const inner = Math.max(diff(px(x, h - 2), px(x, h - 1)), diff(px(x, 0), px(x, 1)));
    if (jump(s, inner)) { bgBreaks++; colBins.add(Math.floor((x / w) * bins)); }
  }

  const tolerance = Math.max(6, w * h * 0.00015);
  return {
    ok: mismatches <= tolerance && bgBreaks === 0,
    checkedAt: Date.now(),
    wrapMismatchPixels: mismatches,
    backgroundBreaks: bgBreaks,
    rowsFlagged: mismatches > tolerance || bgBreaks ? [...rowBins].sort((p, q) => p - q).map((v) => (v + 0.5) / bins) : [],
    colsFlagged: mismatches > tolerance || bgBreaks ? [...colBins].sort((p, q) => p - q).map((v) => (v + 0.5) / bins) : [],
    totalPixels: w * h,
  };
}
