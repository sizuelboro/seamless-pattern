/**
 * Chintz / Jacobean florals, damask ornaments and tribal (Aztec) shapes.
 * Original drawings in the shared 100×100 box using palette colour roles.
 */
import type { MotifDef, MotifPart } from './motifs';
import { circle, ellipse, leaf, petals, sprig } from '../engine/geometry';
import { PAISLEY, P_IN, P_IN2, almond, bez, dotsAlong, mapSeg, ring, scaleAbout, segPath, type Pt, type Seg } from './indianMotifs';

const f = (v: number) => String(Math.round(v * 100) / 100);
const m = (id: string, name: string, parts: MotifPart[]): MotifDef => ({ id, name, parts });
const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;

/** Map every coordinate pair of an absolute M/L/C/Q/Z path. */
const tf = (d: string, fn: (p: Pt) => Pt) => {
  const nums = d.match(/-?\d*\.?\d+/g) ?? [];
  const cmds = d.match(/[MLCQZ]/g) ?? [];
  // rebuild: split by commands keeping order
  let k = 0;
  return d.replace(/[MLCQ][^MLCQZ]*/g, (seg) => {
    const c = seg[0];
    const vals = seg.slice(1).match(/-?\d*\.?\d+/g) ?? [];
    const out: string[] = [];
    for (let i = 0; i + 1 < vals.length; i += 2) { const [x, y] = fn([Number(vals[i]), Number(vals[i + 1])]); out.push(`${f(x)} ${f(y)}`); }
    k += vals.length;
    return c + out.join(' ');
  }) + (nums.length && cmds.length ? '' : '');
};
const scaleD = (d: string, cx: number, cy: number, k: number, dy = 0) => tf(d, ([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k + dy]);
const mirrorD = (d: string) => tf(d, ([x, y]) => [100 - x, y]);

/** Staircase diamond with `steps` steps per side. */
const stepDiamond = (cx: number, cy: number, rx: number, ry: number, steps: number) => {
  // flat top of half-width h, then `steps` down/right steps ending on the flat right tip
  const h = 1 / (2 * steps + 1), s = (1 - h) / steps;
  const q: Pt[] = [[h, -1]];
  for (let k = 1; k <= steps; k++) { q.push([h + (k - 1) * s, -1 + k * s]); q.push([h + k * s, -1 + k * s]); }
  const pts: Pt[] = [];
  for (let r = 0; r < 4; r++) for (const [x, y] of q) {
    let X = x, Y = y;
    for (let t = 0; t < r; t++) [X, Y] = [-Y, X];
    pts.push([cx + X * rx, cy + Y * ry]);
  }
  return poly(pts);
};

// Exotic layered bulb flower (side view)
const BULB = 'M50 92C30 92 16 78 16 58C16 44 24 34 30 28C32 36 36 38 40 34C42 26 46 18 50 10C54 18 58 26 60 34C64 38 68 36 70 28C76 34 84 44 84 58C84 78 70 92 50 92Z';
// Jacobean curled leaf
const CURL = 'M50 96C34 84 26 62 32 40C38 22 54 12 68 16C78 19 82 30 74 36C68 40 60 34 64 28C58 30 52 40 52 54C52 70 56 84 50 96Z';

const fan = (cx: number, cy: number, n: number, a0: number, a1: number, len: number, w: number) =>
  Array.from({ length: n }, (_, i) => almond(cx, cy, a0 + ((a1 - a0) * i) / (n - 1), len, w)).join('');
const fanLines = (cx: number, cy: number, n: number, a0: number, a1: number, r0: number, r1: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / (n - 1)) * Math.PI) / 180;
    return `M${f(cx + Math.cos(a) * r0)} ${f(cy + Math.sin(a) * r0)}L${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)}`;
  }).join('');
const frill = (cx: number, cy: number, n: number, a0: number, a1: number, ro: number, ri: number) => {
  const pts: Pt[] = [];
  for (let i = 0; i <= n * 2; i++) {
    const a = ((a0 + ((a1 - a0) * i) / (n * 2)) * Math.PI) / 180, r = i % 2 ? ri : ro;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  pts.push([cx + 6, cy + 2], [cx - 6, cy + 2]);
  return poly(pts);
};

/** Serrated leaf from base (50,96) to tip (50,6). */
const serrated = (() => {
  const N = 28, L: Pt[] = [], R: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, y = 96 - t * 90;
    const w = 25 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.85) * (1 - t * 0.25) + (i % 2 && i > 1 && i < N - 1 ? 3.2 : 0);
    const bend = Math.sin(t * Math.PI) * 4;
    L.push([50 - w + bend, y]); R.push([50 + w + bend, y]);
  }
  return poly([...L, ...R.reverse()]);
})();
const serratedVeins = Array.from({ length: 6 }, (_, i) => {
  const y = 80 - i * 11, bend = Math.sin(((96 - y) / 90) * Math.PI) * 4;
  return `M${f(50 + bend)} ${f(y)}L${f(34 + bend)} ${f(y - 9)}M${f(50 + bend)} ${f(y)}L${f(66 + bend)} ${f(y - 9)}`;
}).join('');

// Feathered damask paisley: little flames all round the outline
const feathers = (() => {
  const out: string[] = [];
  PAISLEY.forEach((s: Seg, si) => {
    const n = si === 2 || si === 3 ? 3 : 6;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const p = bez(s, t), q = bez(s, Math.min(1, t + 0.01));
      const tx = q[0] - p[0], ty = q[1] - p[1], l = Math.hypot(tx, ty) || 1;
      let nx = ty / l, ny = -tx / l;
      if ((p[0] + nx - 50) ** 2 + (p[1] + ny - 60) ** 2 < (p[0] - 50) ** 2 + (p[1] - 60) ** 2) { nx = -nx; ny = -ny; }
      out.push(almond(p[0] - nx, p[1] - ny, (Math.atan2(ny, nx) * 180) / Math.PI, 8, 2.8));
    }
  });
  return out.join('');
})();

const pomSeeds = (() => {
  const out: string[] = [];
  for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) {
    const x = 38 + i * 6 + (j % 2) * 3, y = 50 + j * 6;
    if ((x - 50) ** 2 / 17 ** 2 + (y - 62) ** 2 / 19 ** 2 < 0.8) out.push(circle(x, y, 2.3));
  }
  return out.join('');
})();

export const CHINTZ_MOTIFS: MotifDef[] = [
  m('chintzFan', 'Chintz fan flower', [
    { d: 'M50 98C50 90 50 84 50 76', stroke: 'alt', sw: 3 },
    { d: leaf(50, 82, 34, 92, 5) + leaf(50, 82, 66, 92, 5), fill: 'alt' },
    { d: fan(50, 70, 9, -172, -8, 42, 9.5), fill: 'main' },
    { d: fanLines(50, 70, 9, -172, -8, 12, 36), stroke: 'light', sw: 1.3 },
    { d: fan(50, 70, 8, -160, -20, 26, 7), fill: 'accent' },
    { d: 'M30 68Q50 92 70 68Q50 76 30 68Z', fill: 'alt' },
    { d: ring(50, 70, 14, 7, 1.5, -90), fill: 'light' },
  ]),
  m('chintzPeony', 'Chintz peony', [
    { d: petals(50, 50, 9, 28, 15, 11), fill: 'main' },
    { d: petals(50, 50, 9, 20, 11, 8, -70), fill: 'alt' },
    { d: petals(50, 50, 7, 12, 8, 6), fill: 'accent' },
    { d: circle(50, 50, 7), fill: 'light' },
    { d: ring(50, 50, 10.5, 10, 1.3), fill: 'main' },
    { d: ring(50, 50, 38, 9, 1.6, 20), fill: 'light' },
  ]),
  m('chintzRosette', 'Exotic bloom', [
    { d: 'M38 90Q50 102 62 90Z', fill: 'alt' },
    { d: BULB, fill: 'main' },
    { d: scaleD(BULB, 50, 90, 0.8), fill: 'light' },
    { d: scaleD(BULB, 50, 90, 0.64), fill: 'accent' },
    { d: scaleD(BULB, 50, 90, 0.44), fill: 'main' },
    { d: ring(50, 70, 0, 1, 0) + circle(50, 74, 4), fill: 'light' },
    { d: 'M50 22V40M36 40L40 52M64 40L60 52', stroke: 'light', sw: 1.2, o: 0.7 },
  ]),
  m('pomegranate', 'Pomegranate', [
    { d: leaf(50, 26, 24, 12, 7) + leaf(50, 26, 76, 12, 7), fill: 'alt' },
    { d: circle(50, 60, 30), fill: 'main' },
    { d: poly([[39, 34], [41, 18], [46, 27], [50, 13], [54, 27], [59, 18], [61, 34]]), fill: 'main' },
    { d: ellipse(50, 62, 18, 20), fill: 'light' },
    { d: pomSeeds, fill: 'accent' },
  ]),
  m('carnation', 'Carnation', [
    { d: 'M50 98V64', stroke: 'alt', sw: 3 },
    { d: leaf(50, 88, 28, 78, 4) + leaf(50, 88, 72, 78, 4), fill: 'alt' },
    { d: poly([[40, 68], [43, 52], [57, 52], [60, 68]]), fill: 'alt' },
    { d: frill(50, 52, 9, -175, -5, 38, 27), fill: 'main' },
    { d: frill(50, 52, 7, -165, -15, 24, 16), fill: 'accent' },
    { d: fanLines(50, 52, 7, -160, -20, 8, 30), stroke: 'light', sw: 1.2, o: 0.8 },
  ]),
  m('chintzLeaf', 'Serrated leaf', [
    { d: serrated, fill: 'main' },
    { d: 'M50 94C53 70 54 40 50 10', stroke: 'light', sw: 1.8 },
    { d: serratedVeins, stroke: 'light', sw: 1.1, o: 0.8 },
  ]),
  m('curlLeaf', 'Jacobean curl leaf', [
    { d: CURL, fill: 'main' },
    { d: scaleD(CURL, 50, 70, 0.62, 4), fill: 'accent', o: 0.9 },
    { d: 'M50 92C42 74 40 56 46 40', stroke: 'light', sw: 1.5 },
  ]),
  m('berrySprig', 'Berry sprig', [
    { d: 'M50 96C46 70 56 46 44 14M48 60C40 54 32 54 26 48M51 44C58 38 66 38 72 32M48 76C56 72 64 72 70 66', stroke: 'alt', sw: 2 },
    { d: leaf(49, 86, 36, 80, 4.5) + leaf(51, 30, 62, 22, 4) + leaf(48, 66, 38, 68, 3.5), fill: 'alt' },
    { d: circle(26, 48, 4.5) + circle(21, 41, 4) + circle(30, 41, 4) + circle(72, 32, 4.5) + circle(77, 25, 4) + circle(68, 25, 4) + circle(70, 66, 4.5) + circle(77, 61, 4) + circle(73, 73, 4) + circle(44, 14, 4.5) + circle(39, 7, 4) + circle(49, 7, 4), fill: 'main' },
    { d: circle(25, 47, 1.3) + circle(71, 31, 1.3) + circle(69, 65, 1.3) + circle(43, 13, 1.3), fill: 'light' },
  ]),
  m('chintzBud', 'Chintz bud', [
    { d: 'M50 98C50 84 48 74 50 62', stroke: 'alt', sw: 3 },
    { d: leaf(50, 86, 34, 80, 5), fill: 'alt' },
    { d: 'M50 64C36 64 32 48 38 34C42 26 48 20 50 8C52 20 58 26 62 34C68 48 64 64 50 64Z', fill: 'main' },
    { d: almond(50, 62, -90, 40, 7), fill: 'accent' },
    { d: leaf(50, 68, 32, 52, 7) + leaf(50, 68, 68, 52, 7), fill: 'alt' },
  ]),
  m('fernSprig', 'Fern sprig', [
    { d: 'M50 98C48 70 52 40 50 8', stroke: 'alt', sw: 2 },
    { d: sprig([50, 96], [48, 52], [50, 8], [0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84], 18, 4.2, 55), fill: 'main' },
  ]),
  m('damaskPaisley', 'Damask paisley', [
    { d: feathers, fill: 'main' },
    { d: segPath(PAISLEY), fill: 'main' },
    { d: segPath(P_IN), fill: 'light' },
    { d: dotsAlong(P_IN, 7, 1.6, 1), fill: 'main' },
    { d: segPath(mapSeg(PAISLEY, scaleAbout(50, 64, 0.56, -1, 4))), fill: 'accent' },
    { d: segPath(P_IN2), fill: 'light' },
    { d: petals(42, 70, 6, 5.5, 4.2, 2.4), fill: 'main' },
    { d: circle(42, 70, 2.2), fill: 'accent' },
    { d: 'M62 8C70 2 78 6 76 14C74 19 68 18 68 14', stroke: 'main', sw: 3 },
  ]),
  m('damaskLotus', 'Damask lotus', [
    { d: 'M50 98V72', stroke: 'alt', sw: 3.4 },
    { d: leaf(50, 92, 14, 76, 9) + mirrorD(leaf(50, 92, 14, 76, 9)), fill: 'alt' },
    { d: 'M14 76C6 72 6 62 14 62C20 62 20 70 14 70M86 76C94 72 94 62 86 62C80 62 80 70 86 70', stroke: 'alt', sw: 2.4 },
    { d: almond(50, 70, -155, 40, 11) + almond(50, 70, -25, 40, 11), fill: 'main' },
    { d: almond(50, 70, -125, 48, 13) + almond(50, 70, -55, 48, 13), fill: 'accent' },
    { d: almond(50, 70, -125, 30, 6) + almond(50, 70, -55, 30, 6) + almond(50, 70, -155, 26, 5) + almond(50, 70, -25, 26, 5), fill: 'light' },
    { d: almond(50, 72, -90, 62, 14), fill: 'main' },
    { d: almond(50, 70, -90, 44, 7), fill: 'light' },
    { d: almond(50, 68, -90, 28, 3.5), fill: 'accent' },
    { d: 'M30 68C32 80 68 80 70 68C62 72 38 72 30 68Z', fill: 'alt' },
    { d: circle(50, 6, 3), fill: 'accent' },
  ]),
  m('aztecDiamond', 'Aztec diamond', [
    { d: stepDiamond(50, 50, 46, 46, 6), fill: 'main' },
    { d: stepDiamond(50, 50, 34, 34, 5), fill: 'light' },
    { d: stepDiamond(50, 50, 24, 24, 4), fill: 'main' },
    { d: stepDiamond(50, 50, 13, 13, 3), fill: 'accent' },
    { d: poly([[50, 44], [56, 50], [50, 56], [44, 50]]), fill: 'light' },
  ]),
  m('aztecArrow', 'Aztec arrow', [
    { d: 'M14 47H80V53H14Z', fill: 'main' },
    { d: poly([[76, 36], [96, 50], [76, 64], [80, 50]]), fill: 'main' },
    { d: poly([[4, 34], [16, 34], [30, 50], [16, 66], [4, 66], [18, 50]]) + poly([[20, 38], [28, 38], [40, 50], [28, 62], [20, 62], [30, 50]]), fill: 'accent' },
    { d: poly([[52, 44], [58, 50], [52, 56], [46, 50]]), fill: 'light' },
  ]),
  m('aztecCross', 'Aztec cross', [
    { d: poly([[38, 6], [62, 6], [62, 24], [76, 24], [76, 38], [94, 38], [94, 62], [76, 62], [76, 76], [62, 76], [62, 94], [38, 94], [38, 76], [24, 76], [24, 62], [6, 62], [6, 38], [24, 38], [24, 24], [38, 24]]), fill: 'main' },
    { d: poly([[44, 16], [56, 16], [56, 32], [68, 32], [68, 44], [84, 44], [84, 56], [68, 56], [68, 68], [56, 68], [56, 84], [44, 84], [44, 68], [32, 68], [32, 56], [16, 56], [16, 44], [32, 44], [32, 32], [44, 32]]), fill: 'light' },
    { d: poly([[50, 34], [66, 50], [50, 66], [34, 50]]), fill: 'accent' },
    { d: poly([[50, 44], [56, 50], [50, 56], [44, 50]]), fill: 'main' },
  ]),
];

/** Motif roles used by the vine (chintz) layout. */
export const LEAF_TYPES = new Set(['chintzLeaf', 'curlLeaf', 'leaf', 'monstera', 'palmLeaf', 'fernSprig']);
export const SMALL_TYPES = new Set(['berrySprig', 'chintzBud', 'smallFlower', 'dot', 'sparkle', 'triDots', 'star', 'heart', 'fernSprig']);
