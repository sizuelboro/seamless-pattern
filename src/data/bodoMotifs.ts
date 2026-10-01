/**
 * Bodo Agor — motifs counted on a thread grid, the way they are woven into dokhona,
 * aronai and gamsa borders. Original interpretations, not copies of any one textile.
 * Keys: '#' main, '+' accent, 'o' alt, '*' light.
 */
import type { ColorRole, MotifDef, MotifPart } from './motifs';
import { dd, runs, runsPath, type Lit } from '../engine/pixelGrid';
import { fishbone, paisley, polyD, starFlower, sunburst } from '../engine/aronaiShapes';

const ROLE: Record<string, ColorRole> = { '#': 'main', '+': 'accent', o: 'alt', '*': 'light' };

/** Build a motif from a lit-function on an N×N grid centred at (0,0) (N odd). */
function woven(id: string, name: string, n: number, lit: Lit): MotifDef {
  const r = (n - 1) / 2, u = 96 / n;
  const map = runs((x, y) => lit(x - r, y - r), 0, 0, n, n);
  const parts: MotifPart[] = [];
  for (const k of ['#', 'o', '+', '*']) { const l = map.get(k); if (l?.length) parts.push({ d: runsPath(l, u, 2, 2), fill: ROLE[k] }); }
  return { id, name, parts };
}

export const BODO_MOTIFS: MotifDef[] = [
  // Pharwo megon — "pigeon's eye": concentric diamonds with a bright eye
  woven('pharwoMegon', 'Pharwo megon (pigeon eye)', 17, (x, y) => {
    const d = dd(x, y);
    if (d === 8 || d === 7) return '#';
    if (d === 5) return '+';
    if (d === 3 || d === 2) return '#';
    if (d === 0) return '*';
    return null;
  }),
  // Hajw agor — hills: a big stepped peak over a row of small peaks
  woven('hajwAgor', 'Hajw agor (hills)', 17, (x, y) => {
    const ty = y + 8; // 0..16 from the top
    if (ty <= 8 && Math.abs(x) <= ty && Math.abs(x) >= ty - 1) return '#';
    if (ty <= 8 && ty >= 4 && Math.abs(x) <= ty - 4) return '+';
    if (ty === 10) return '#';
    if (ty >= 12) { const px = ((x + 8) % 6 + 6) % 6 - 2.5; if (Math.abs(px) <= ty - 12.5) return 'o'; }
    return null;
  }),
  // Bwigri bibar — plum blossom: four diamond petals round a centre
  woven('bwigriBibar', 'Bwigri bibar (plum flower)', 17, (x, y) => {
    for (const [cx, cy] of [[0, -5], [0, 5], [-5, 0], [5, 0]]) { const d = dd(x - cx, y - cy); if (d <= 3) return d === 0 ? '*' : '#'; }
    const d = dd(x, y);
    if (d <= 1) return '+';
    if (Math.abs(x) === Math.abs(y) && Math.abs(x) >= 4 && Math.abs(x) <= 6) return 'o';
    return null;
  }),
  // Daorai — peacock: stepped body, crest and a striped fan tail
  woven('daoraiAgor', 'Daorai agor (peacock)', 17, (x, y) => {
    const ty = y + 8;
    if (ty <= 3 && x === 0) return 'o';
    if (ty === 1 && Math.abs(x) === 1) return 'o';
    const d = dd(x, y + 2);
    if (d <= 4) return d === 0 ? '*' : d === 1 ? '+' : '#';
    if (ty >= 10 && Math.abs(x) <= ty - 7) return (ty % 2 === 0 ? '+' : '#');
    return null;
  }),
  // Thaigir — star/flower of eight points
  woven('agorStar', 'Agor star', 15, (x, y) => {
    const d = dd(x, y), ax = Math.abs(x), ay = Math.abs(y);
    if (d <= 1) return '*';
    if (d <= 3) return '+';
    if ((ax === 0 || ay === 0) && d <= 7) return '#';
    if (ax === ay && ax <= 5) return '#';
    if ((ax === 1 || ay === 1) && d <= 6 && d >= 4) return '#';
    return null;
  }),
  // Small buti scattered over the dokhona field
  woven('agorButi', 'Agor buti', 9, (x, y) => {
    const d = dd(x, y);
    if (d === 0) return '*';
    if (d === 1) return '+';
    if ((x === 0 || y === 0) && d <= 4) return '#';
    if (Math.abs(x) === 2 && Math.abs(y) === 2) return 'o';
    return null;
  }),
  // Double diamond chain (a border unit that also works as a buti)
  woven('agorChain', 'Agor chain', 17, (x, y) => {
    const a = dd(x + 4, y), b = dd(x - 4, y);
    if (a === 4 || b === 4) return '#';
    if (a <= 1 || b <= 1) return '+';
    if (dd(x, y) === 0 || (x === 0 && Math.abs(y) <= 2)) return 'o';
    return null;
  }),
  // Aronai sunburst — the big printed medallion: rays, rings and a star flower
  (() => { const sb = sunburst(50, 50, 47, 0.6); return { id: 'aronaiSun', name: 'Aronai sunburst', parts: [{ d: polyD(sb.main), fill: 'main' as ColorRole }, { d: polyD(sb.flower), fill: 'accent' as ColorRole }] }; })(),
  // Aronai paisley — curled leaf with an eye
  (() => { const p = paisley(44, 64, 27); return { id: 'aronaiPaisley', name: 'Aronai paisley', parts: [{ d: polyD(p.body), fill: 'main' as ColorRole, rule: 'evenodd' as const }, { d: polyD([p.eye]), fill: 'accent' as ColorRole }] }; })(),
  // Aronai arrow — star flower between two fishbone leaves
  { id: 'aronaiArrow', name: 'Aronai arrows', parts: [
    { d: polyD([...fishbone(3, 36, 50, 20, 5, 0.55), ...fishbone(97, 64, 50, 20, 5, 0.55)]), fill: 'main' },
    { d: polyD(starFlower(50, 50, 13, 8, 2.6, 0.34)), fill: 'accent' },
  ] },
];
