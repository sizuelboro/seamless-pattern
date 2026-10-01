/**
 * Indian heritage motifs — buta/paisley, Mughal flora, lotus, marigold, rangoli, mihrab,
 * royal elephant, peacock, parrot, diya, kalash, Ajrakh star, kolam, bandhani and bell.
 * All drawn in the shared 100×100 box with palette colour roles.
 */
import type { MotifDef, MotifPart } from './motifs';
import { circle, leaf, petals, star } from '../engine/geometry';

type Pt = [number, number];
type Seg = [Pt, Pt, Pt, Pt]; // cubic: p0 c1 c2 p1
const f = (v: number) => String(Math.round(v * 100) / 100);
const m = (id: string, name: string, parts: MotifPart[]): MotifDef => ({ id, name, parts });

const mapSeg = (segs: Seg[], fn: (p: Pt) => Pt): Seg[] => segs.map((s) => s.map(fn) as Seg);
const segPath = (segs: Seg[]) => `M${f(segs[0][0][0])} ${f(segs[0][0][1])}` + segs.map(([, a, b, c]) => `C${f(a[0])} ${f(a[1])} ${f(b[0])} ${f(b[1])} ${f(c[0])} ${f(c[1])}`).join('') + 'Z';
const bez = (s: Seg, t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]) as Pt;
};
const scaleAbout = (cx: number, cy: number, k: number, dx = 0, dy = 0) => ([x, y]: Pt): Pt => [cx + (x - cx) * k + dx, cy + (y - cy) * k + dy];
const dotsAlong = (segs: Seg[], n: number, r: number, skipEnds = 0) => {
  const out: string[] = [];
  const total = segs.length * n;
  for (let i = skipEnds; i < total - skipEnds; i++) {
    const s = segs[Math.floor(i / n)], t = (i % n) / n;
    const [x, y] = bez(s, t);
    out.push(circle(x, y, r));
  }
  return out.join('');
};
const rot = (cx: number, cy: number, deg: number) => ([x, y]: Pt): Pt => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};

// Classic buta silhouette: round belly bottom-left, tip curling up and to the right.
const PAISLEY: Seg[] = [
  [[48, 92], [26, 92], [14, 76], [16, 60]],
  [[16, 60], [18, 42], [34, 34], [48, 30]],
  [[48, 30], [60, 26], [66, 18], [62, 8]],
  [[62, 8], [78, 12], [88, 30], [84, 50]],
  [[84, 50], [80, 74], [66, 92], [48, 92]],
];
const P_IN = mapSeg(PAISLEY, scaleAbout(50, 62, 0.72, -1, 3));
const P_IN2 = mapSeg(PAISLEY, scaleAbout(48, 68, 0.44, -2, 2));

const ring = (cx: number, cy: number, r: number, n: number, dr: number, phase = 0) =>
  Array.from({ length: n }, (_, i) => { const a = ((i * 360) / n + phase - 90) * Math.PI / 180; return circle(cx + r * Math.cos(a), cy + r * Math.sin(a), dr); }).join('');

const polyStr = (pts: Pt[]) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
const lineStr = (pts: Pt[]) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}`;

/** Pointed petal from base (bx,by) toward angle with length & width — almond shape. */
const almond = (bx: number, by: number, deg: number, len: number, w: number) => {
  const a = (deg * Math.PI) / 180, tx = bx + Math.cos(a) * len, ty = by + Math.sin(a) * len;
  return leaf(bx, by, tx, ty, w);
};

// Mughal arch (cusped ogee) — used by the mihrab motif.
const ARCH = 'M20 94V46C20 32 32 26 40 20C45 16 48 11 50 4C52 11 55 16 60 20C68 26 80 32 80 46V94Z';
const ARCH_IN = 'M27 90V48C27 37 37 31 43 27C47 24 49 20 50 15C51 20 53 24 57 27C63 31 73 37 73 48V90Z';

const kolam = (() => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * Math.PI * 2, r = 34 * Math.abs(Math.cos(2 * t)) + 6;
    pts.push([50 + r * Math.cos(t), 50 + r * Math.sin(t)]);
  }
  return lineStr(pts) + 'Z';
})();

export const INDIAN_MOTIFS: MotifDef[] = [
  m('buta', 'Buta paisley', [
    { d: segPath(PAISLEY), fill: 'main' },
    { d: dotsAlong(PAISLEY, 9, 1.7, 2), fill: 'light' },
    { d: segPath(P_IN), fill: 'light' },
    { d: segPath(P_IN2), fill: 'accent' },
    { d: petals(40, 70, 6, 6, 4.2, 2.6), fill: 'main' },
    { d: circle(40, 70, 2.4), fill: 'light' },
    { d: 'M62 8C70 2 78 6 76 14C74 19 68 18 68 14', stroke: 'main', sw: 3 },
  ]),
  m('kairi', 'Kairi (mango)', [
    { d: segPath(PAISLEY), fill: 'main' },
    { d: segPath(P_IN), stroke: 'light', sw: 2.6 },
    { d: circle(44, 70, 6) + circle(56, 58, 3.4) + circle(64, 44, 2.4), fill: 'accent' },
  ]),
  m('mughalFlower', 'Mughal flower', [
    { d: 'M50 94C50 80 50 66 50 50', stroke: 'alt', sw: 3.4 },
    { d: leaf(50, 86, 22, 72, 9) + leaf(50, 86, 78, 72, 9) + leaf(50, 70, 28, 58, 7.5) + leaf(50, 70, 72, 58, 7.5), fill: 'alt' },
    { d: 'M50 74C46 66 44 60 46 56', stroke: 'alt', sw: 2 },
    { d: 'M50 52C34 52 24 40 26 24C34 30 40 30 42 22C46 28 54 28 58 22C60 30 66 30 74 24C76 40 66 52 50 52Z', fill: 'main' },
    { d: 'M50 48C40 48 34 40 35 31C40 34 44 34 46 29C48 33 52 33 54 29C56 34 60 34 65 31C66 40 60 48 50 48Z', fill: 'accent' },
    { d: almond(50, 30, -90, 22, 8), fill: 'main' },
    { d: circle(50, 40, 3.2) + ring(50, 40, 7, 6, 1.2), fill: 'light' },
  ]),
  m('lotusBloom', 'Lotus bloom', [
    { d: 'M18 82Q50 96 82 82Q50 88 18 82Z', fill: 'alt' },
    { d: almond(50, 80, 200, 38, 11) + almond(50, 80, -20, 38, 11), fill: 'alt' },
    { d: almond(50, 80, 228, 44, 13) + almond(50, 80, -48, 44, 13), fill: 'main' },
    { d: almond(50, 80, 250, 52, 14) + almond(50, 80, -70, 52, 14), fill: 'accent' },
    { d: almond(50, 80, -90, 62, 15), fill: 'main' },
    { d: almond(50, 76, -90, 44, 6), fill: 'light', o: 0.55 },
  ]),
  m('lotusTop', 'Lotus rosette', [
    { d: petals(50, 50, 8, 30, 14, 8, -90), fill: 'alt' },
    { d: petals(50, 50, 8, 22, 12, 7, -67.5), fill: 'main' },
    { d: petals(50, 50, 8, 13, 8, 5, -90), fill: 'accent' },
    { d: circle(50, 50, 6.5), fill: 'light' },
    { d: ring(50, 50, 4, 6, 1.1) + ring(50, 50, 43, 16, 1.6), fill: 'main' },
  ]),
  m('marigold', 'Marigold', [
    { d: petals(50, 50, 18, 31, 8, 6.5), fill: 'main' },
    { d: petals(50, 50, 14, 23, 7, 5.6, -77), fill: 'accent' },
    { d: petals(50, 50, 10, 14, 6, 5, -90), fill: 'main' },
    { d: circle(50, 50, 8), fill: 'accent' },
    { d: ring(50, 50, 4, 5, 1.3), fill: 'ink', o: 0.35 },
  ]),
  m('rangoli', 'Rangoli', [
    { d: star(50, 50, 8, 44, 30, -90), fill: 'main' },
    { d: star(50, 50, 8, 34, 22, -67.5), fill: 'light' },
    { d: petals(50, 50, 8, 18, 9, 5), fill: 'accent' },
    { d: circle(50, 50, 7), fill: 'main' },
    { d: ring(50, 50, 39, 8, 2.2, 22.5) + circle(50, 50, 2.6), fill: 'light' },
  ]),
  m('mihrab', 'Mughal arch', [
    { d: ARCH, fill: 'main' },
    { d: ARCH_IN, fill: 'light' },
    { d: 'M50 86V58', stroke: 'alt', sw: 2.6 },
    { d: leaf(50, 82, 36, 72, 6) + leaf(50, 82, 64, 72, 6) + leaf(50, 70, 39, 62, 5) + leaf(50, 70, 61, 62, 5), fill: 'alt' },
    { d: 'M50 58C42 58 37 52 38 44C42 47 45 46 46 42C48 45 52 45 54 42C55 46 58 47 62 44C63 52 58 58 50 58Z', fill: 'accent' },
    { d: almond(50, 46, -90, 12, 5), fill: 'accent' },
    { d: 'M24 94H76', stroke: 'accent', sw: 3 },
  ]),
  m('royalElephant', 'Royal elephant', [
    { d: 'M17 50C11 54 10 62 13 67', stroke: 'main', sw: 2.6 },
    { d: 'M20 62H31V88H20Z M33 64H44V90H33Z M52 64H63V90H52Z M64 62H75V88H64Z', fill: 'main' },
    { d: 'M14 54C14 38 28 32 46 32C56 32 62 34 66 36C70 32 76 30 80 32C88 36 90 46 86 54C90 62 90 72 86 80C84 84 78 84 78 79C78 76 82 76 82 72C82 66 80 62 78 60C74 66 66 70 50 70C30 70 14 68 14 54Z', fill: 'main' },
    { d: 'M62 40C56 46 58 60 66 62C72 63 74 56 72 48C71 42 67 38 62 40Z', fill: 'alt' },
    { d: 'M26 34H56V58C53 62 50 58 47 62C44 58 41 62 38 58C35 62 32 58 29 62C27 60 26 58 26 58Z', fill: 'accent' },
    { d: 'M26 34H56V39H26Z' + circle(41, 49, 4.2), fill: 'light' },
    { d: 'M78 25L83 31L78 37L73 31Z', fill: 'accent' },
    { d: circle(80, 44, 1.7), fill: 'ink' },
    { d: 'M80 60Q86 64 92 60', stroke: 'light', sw: 2.6 },
    { d: 'M22 88H31M35 90H44M54 90H63M66 88H75', stroke: 'accent', sw: 2.4 },
  ]),
  m('peacock', 'Peacock', [
    { d: Array.from({ length: 7 }, (_, i) => almond(54, 78, 172 + i * 17, 46, 15)).join(''), fill: 'alt' },
    { d: Array.from({ length: 7 }, (_, i) => { const a = ((172 + i * 17) * Math.PI) / 180; return circle(54 + Math.cos(a) * 34, 78 + Math.sin(a) * 34, 5.4); }).join(''), fill: 'accent' },
    { d: Array.from({ length: 7 }, (_, i) => { const a = ((172 + i * 17) * Math.PI) / 180; return circle(54 + Math.cos(a) * 34, 78 + Math.sin(a) * 34, 2.4); }).join(''), fill: 'ink' },
    { d: 'M48 84C40 76 44 62 54 56C60 52 60 40 60 32C60 24 66 20 72 22C78 24 78 30 74 32C68 36 68 46 70 56C72 70 66 82 56 86C53 87 50 86 48 84Z', fill: 'main' },
    { d: 'M72 23L82 26L74 29Z', fill: 'accent' },
    { d: circle(70, 26, 1.6), fill: 'light' },
    { d: 'M66 22L62 12M68 21L68 10M70 21L74 11', stroke: 'main', sw: 1.4 },
    { d: circle(62, 11, 2) + circle(68, 9, 2) + circle(74, 10, 2), fill: 'accent' },
    { d: 'M54 86L52 96M60 85L62 96', stroke: 'ink', sw: 2, o: 0.6 },
  ]),
  m('parrot', 'Parrot', [
    { d: 'M18 78Q50 70 86 80', stroke: 'ink', sw: 3, o: 0.55 },
    { d: leaf(70, 79, 84, 66, 5) + leaf(30, 75, 18, 64, 5), fill: 'alt' },
    { d: 'M44 74C40 90 34 96 26 98C30 92 34 84 36 74Z', fill: 'alt' },
    { d: 'M38 76C32 64 34 46 46 36C52 30 60 28 66 32C72 36 72 46 66 52C62 56 60 64 56 72C52 78 44 80 38 76Z', fill: 'main' },
    { d: 'M44 50C42 60 44 68 50 74C54 66 54 58 50 50Z', fill: 'alt', o: 0.8 },
    { d: 'M66 34C74 34 78 40 76 46C72 44 68 44 66 46Z', fill: 'accent' },
    { d: circle(62, 38, 2.2), fill: 'ink' },
    { d: 'M56 44C60 46 64 46 66 45', stroke: 'accent', sw: 1.8 },
  ]),
  m('diya', 'Diya', [
    { d: 'M50 6C58 18 62 28 56 36C53 40 47 40 44 36C38 28 42 18 50 6Z', fill: 'accent' },
    { d: 'M50 18C54 25 55 31 52 35C50 37 48 36 47 34C45 30 46 24 50 18Z', fill: 'light' },
    { d: 'M50 38V48', stroke: 'ink', sw: 2, o: 0.6 },
    { d: 'M12 52H88C86 70 70 82 50 82C30 82 14 70 12 52Z', fill: 'main' },
    { d: 'M12 52H88C87 56 86 58 84 60H16C14 58 13 56 12 52Z', fill: 'alt' },
    { d: ring(50, 52, 0, 1, 0) + [24, 37, 50, 63, 76].map((x) => circle(x, 69, 2.6)).join(''), fill: 'accent' },
    { d: 'M36 82H64L60 90H40Z', fill: 'alt' },
  ]),
  m('kalash', 'Kalash', [
    { d: leaf(50, 30, 20, 16, 7) + leaf(50, 30, 80, 16, 7) + leaf(50, 30, 30, 8, 6) + leaf(50, 30, 70, 8, 6), fill: 'alt' },
    { d: circle(50, 22, 10), fill: 'accent' },
    { d: 'M36 30H64V36C64 38 60 40 60 42C72 46 80 56 80 68C80 84 66 94 50 94C34 94 20 84 20 68C20 56 28 46 40 42C40 40 36 38 36 36Z', fill: 'main' },
    { d: 'M22 64H78V70H22Z', fill: 'light' },
    { d: [30, 40, 50, 60, 70].map((x) => circle(x, 67, 1.8)).join(''), fill: 'accent' },
    { d: 'M34 33H66', stroke: 'light', sw: 2.4 },
  ]),
  m('ajrakhStar', 'Ajrakh star', [
    { d: star(50, 50, 8, 46, 24, -90), fill: 'main' },
    { d: petals(50, 50, 8, 26, 12, 6, -67.5), fill: 'accent' },
    { d: star(50, 50, 8, 20, 11, -67.5), fill: 'light' },
    { d: circle(50, 50, 7), fill: 'main' },
    { d: circle(50, 50, 2.8), fill: 'light' },
  ]),
  m('kolam', 'Kolam', [
    { d: kolam, stroke: 'main', sw: 3.2 },
    { d: [[30, 30], [70, 30], [30, 70], [70, 70], [50, 50]].map(([x, y]) => circle(x, y, 3.2)).join(''), fill: 'accent' },
  ]),
  m('bandhani', 'Bandhani', [
    { d: ring(50, 50, 30, 12, 4.4), fill: 'main' },
    { d: ring(50, 50, 30, 12, 1.6), fill: 'light' },
    { d: ring(50, 50, 16, 8, 3.4, 22.5), fill: 'accent' },
    { d: circle(50, 50, 5), fill: 'main' },
    { d: circle(50, 50, 1.8), fill: 'light' },
  ]),
  m('templeBell', 'Temple bell', [
    { d: 'M50 4V18', stroke: 'ink', sw: 2.2, o: 0.6 },
    { d: circle(50, 20, 4), fill: 'accent' },
    { d: 'M50 24C36 24 30 36 30 52C30 64 24 70 18 74H82C76 70 70 64 70 52C70 36 64 24 50 24Z', fill: 'main' },
    { d: 'M24 70H76V76H24Z', fill: 'accent' },
    { d: 'M30 46H70', stroke: 'light', sw: 2.4 },
    { d: circle(50, 86, 6), fill: 'accent' },
    { d: 'M50 76V80', stroke: 'ink', sw: 2, o: 0.6 },
    { d: ring(50, 58, 0, 1, 0) + circle(40, 58, 1.8) + circle(50, 58, 1.8) + circle(60, 58, 1.8), fill: 'light' },
  ]),
];
void rot; void polyStr;
