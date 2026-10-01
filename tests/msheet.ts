import { INDIAN_MOTIFS } from '../src/data/indianMotifs';
import { CHINTZ_MOTIFS } from '../src/data/chintzMotifs';
import { BODO_MOTIFS } from '../src/data/bodoMotifs';
const SET = new URLSearchParams(location.search).get('set') === 'chintz' ? CHINTZ_MOTIFS : new URLSearchParams(location.search).get('set') === 'bodo' ? BODO_MOTIFS : INDIAN_MOTIFS;
import { drawMotifAt, resolvePalette } from '../src/engine/motifRenderer';
const pals = [['#B5532F', '#1F5E4A', '#E3A33B', '#2B3A67', '#F3E9D2'], ['#8E1B1B', '#D4A23A', '#1E3F5A', '#C8553D', '#F4E3C1']];
const root = document.getElementById('out')!; root.textContent = '';
for (const pal of pals) for (const mo of SET) {
  const c = document.createElement('canvas'); c.width = 150; c.height = 150; const ctx = c.getContext('2d')!;
  ctx.fillStyle = pal === pals[0] ? '#FBF3E2' : '#2A1416'; ctx.fillRect(0, 0, 150, 150);
  drawMotifAt(ctx, mo.id, 75, 75, 130, 0, false, 0, resolvePalette(pal), 1);
  const d = document.createElement('div'); d.style.cssText = 'display:inline-block;margin:2px;font:10px sans-serif;width:150px'; d.append(c, document.createTextNode(mo.id)); root.append(d);
}
(window as any).__done = true;
