import { PRESETS, stateFromPreset } from '../src/data/presets';
import { generatePattern } from '../src/engine/patternGenerator';
import { renderRaster } from '../src/engine/exportEngine';
import { drawBackground } from '../src/engine/seamlessRenderer';
import { drawMotifAt, resolvePalette } from '../src/engine/motifRenderer';
import type { PatternState } from '../src/types/pattern';
const out: string[] = [];
async function cmp(name: string, st: PatternState) {
  const px = 400, W = st.settings.tileWidth, H = st.settings.tileHeight, ph = Math.round(px * H / W);
  const bmp = await createImageBitmap(await renderRaster(st, { format: 'png', width: px, height: ph, quality: 1, transparent: false }));
  const a = document.createElement('canvas'); a.width = px; a.height = ph; const actx = a.getContext('2d')!; actx.drawImage(bmp, 0, 0);
  const b = document.createElement('canvas'); b.width = px; b.height = ph; const ctx = b.getContext('2d')!;
  ctx.setTransform(px / W, 0, 0, ph / H, 0, 0); drawBackground(ctx, st.background, W, H);
  const rp = resolvePalette(st.palette);
  for (const o of st.objects) for (let kx = -2; kx <= 2; kx++) for (let ky = -2; ky <= 2; ky++)
    drawMotifAt(ctx, o.type, o.x + kx * W, o.y + ky * H, Math.max(o.width, o.height) * o.scale, o.rotation, o.flipX, o.colorIndex, rp, o.opacity);
  const A = actx.getImageData(0, 0, px, ph).data, B = ctx.getImageData(0, 0, px, ph).data;
  let bad = 0, max = 0;
  for (let i = 0; i < A.length; i += 4) { const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2])); max = Math.max(max, d); if (d > 40) bad++; }
  // edge continuity: compare the last column of the tile to what the brute-force infinite field has just past the edge (= first column)
  out.push(`${name.padEnd(28)} tile-vs-infinite mismatchPx=${bad} maxDiff=${max}`);
}
(async () => {
  const base = stateFromPreset(PRESETS[1]);
  const v = (p: Partial<PatternState['settings']>) => { const s = { ...base.settings, ...p }; return { ...base, settings: s, objects: generatePattern(s) }; };
  await cmp('huge 300% dense', v({ scale: 300, density: 100 }));
  await cmp('tropical preset', stateFromPreset(PRESETS[5]));
  await cmp('boho preset', stateFromPreset(PRESETS[10]));
  await cmp('tossed', v({ layout: 'tossed' }));
  document.getElementById('out')!.textContent = out.join('\n');
  (window as any).__done = true;
})();
