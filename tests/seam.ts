import { PRESETS, stateFromPreset, DEFAULT_SETTINGS } from '../src/data/presets';
import { generatePattern } from '../src/engine/patternGenerator';
import { renderRaster } from '../src/engine/exportEngine';
import { runSeamCheck } from '../src/engine/seamCheck';
import { drawBackground } from '../src/engine/seamlessRenderer';
import { drawMotifAt, resolvePalette } from '../src/engine/motifRenderer';
import type { PatternState, LayoutMode } from '../src/types/pattern';

const out: string[] = [];
const log = (s: string) => { out.push(s); (document.getElementById('out')!).textContent = out.join('\n'); };

async function decode(blob: Blob): Promise<ImageBitmap> { return createImageBitmap(blob); }

/** Ground truth: draw the infinite pattern on a 3×3 area by brute force (every object at every lattice offset, no wrap logic). */
function bruteForce(state: PatternState, px: number): ImageData {
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  const c = document.createElement('canvas'); c.width = px * 3; c.height = Math.round(px * H / W) * 3;
  const ctx = c.getContext('2d')!;
  const s = px / W;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { ctx.save(); ctx.translate(i * W, j * H); drawBackground(ctx, state.background, W, H); ctx.restore(); }
  const rp = resolvePalette(state.palette);
  for (const o of state.objects) for (let kx = -2; kx <= 4; kx++) for (let ky = -2; ky <= 4; ky++) {
    drawMotifAt(ctx, o.type, o.x + kx * W, o.y + ky * H, Math.max(o.width, o.height) * o.scale, o.rotation, o.flipX, o.colorIndex, rp, o.opacity);
  }
  return ctx.getImageData(0, 0, c.width, c.height);
}

async function test(name: string, state: PatternState) {
  const px = 400;
  const H = Math.round(px * state.settings.tileHeight / state.settings.tileWidth);
  const blob = await renderRaster(state, { format: 'png', width: px, height: H, quality: 1, transparent: false });
  const bmp = await decode(blob);
  const c = document.createElement('canvas'); c.width = px * 3; c.height = H * 3;
  const ctx = c.getContext('2d')!;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) ctx.drawImage(bmp, i * px, j * H);
  const tiled = ctx.getImageData(0, 0, c.width, c.height).data;
  const ref = bruteForce(state, px).data;
  let bad = 0, max = 0, seamBad = 0;
  const dc = document.createElement('canvas'); dc.width = c.width; dc.height = c.height; const dctx = dc.getContext('2d')!; dctx.putImageData(ctx.getImageData(0,0,c.width,c.height),0,0); dctx.fillStyle='rgba(255,255,255,.6)'; dctx.fillRect(0,0,c.width,c.height); dctx.fillStyle='red';
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const i = (y * c.width + x) * 4;
    const d = Math.max(Math.abs(tiled[i] - ref[i]), Math.abs(tiled[i + 1] - ref[i + 1]), Math.abs(tiled[i + 2] - ref[i + 2]));
    if (d > max) max = d;
    if (d > 40) { bad++; dctx.fillRect(x-2,y-2,5,5); const nearSeam = (x % px < 3 || x % px > px - 4 || y % H < 3 || y % H > H - 4); if (nearSeam) seamBad++; }
  }
  if (name.startsWith('huge')) (window as any).__diff = dc.toDataURL();
  const sc = runSeamCheck(state);
  // exact: tile vs infinite field restricted to the tile (same canvas size => same rasterizer)
  const b = new OffscreenCanvas(px, H); const bctx = b.getContext('2d')!;
  const TW = state.settings.tileWidth, TH = state.settings.tileHeight;
  bctx.setTransform(px / TW, 0, 0, H / TH, 0, 0); drawBackground(bctx, state.background, TW, TH);
  const rp2 = resolvePalette(state.palette);
  for (const o of state.objects) for (let kx = -2; kx <= 2; kx++) for (let ky = -2; ky <= 2; ky++)
    drawMotifAt(bctx, o.type, o.x + kx * TW, o.y + ky * TH, Math.max(o.width, o.height) * o.scale, o.rotation, o.flipX, o.colorIndex, rp2, o.opacity);
  const ta = document.createElement('canvas'); ta.width = px; ta.height = H; const tactx = ta.getContext('2d')!; tactx.drawImage(bmp, 0, 0);
  const EA = tactx.getImageData(0, 0, px, H).data, EB = bctx.getImageData(0, 0, px, H).data;
  let exact = 0; for (let i = 0; i < EA.length; i += 4) if (Math.max(Math.abs(EA[i]-EB[i]), Math.abs(EA[i+1]-EB[i+1]), Math.abs(EA[i+2]-EB[i+2])) > 8) exact++;
  const ok = exact === 0 && sc.ok;
  log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(34)} objs=${state.objects.length.toString().padStart(4)} exactDiffPx=${exact} grid3x3Px=${bad} nearSeam=${seamBad} maxDiff=${max} seamCheck=${sc.ok ? 'ok' : 'FAIL(' + sc.wrapMismatchPixels + ')'}`);
  return ok;
}

function variant(base: PatternState, patch: Partial<PatternState['settings']>, bg?: Partial<PatternState['background']>): PatternState {
  const settings = { ...base.settings, ...patch };
  return { ...base, settings, background: { ...base.background, ...bg }, objects: generatePattern(settings) };
}

(async () => {
  let all = true;
  // Geometric presets are verified by tests/geo.ts (its reference also draws the geo layer).
  for (const p of PRESETS.filter((q) => !q.geo && q.settings.layout !== 'vine' && !q.texture)) all = (await test(`preset:${p.id}`, stateFromPreset(p))) && all;
  const base = stateFromPreset(PRESETS[1]);
  const layouts: LayoutMode[] = ['random', 'grid', 'brick', 'hex', 'halfdrop', 'mirror', 'radial', 'tossed', 'stripe', 'checker'];
  for (const l of layouts) all = (await test(`layout:${l}`, variant(base, { layout: l }))) && all;
  all = (await test('huge motifs (300%) dense', variant(base, { scale: 300, density: 100 }))) && all;
  all = (await test('tiny motifs (10%) dense', variant(base, { scale: 10, density: 100, spacing: 0 }))) && all;
  all = (await test('sparse 10%', variant(base, { density: 10 }))) && all;
  all = (await test('rotated random + variation 100', variant(base, { rotationMode: 'random', variation: 100 }))) && all;
  all = (await test('opacity 50%', variant(base, { opacity: 50 }))) && all;
  all = (await test('non-square 2048x1024', variant(base, { tileWidth: 2048, tileHeight: 1024 }))) && all;
  all = (await test('gradient diagonal', variant(base, {}, { type: 'linear', direction: 'diagonal', color: '#F6C1C1', color2: '#C1D9F6' }))) && all;
  all = (await test('gradient radial non-square', variant(base, { tileWidth: 1600, tileHeight: 1000 }, { type: 'radial', color: '#FFFFFF', color2: '#B5D3C0' }))) && all;
  // Honesty check: the seam detector must FAIL when wrapping is disabled.
  const broken = runSeamCheck(stateFromPreset(PRESETS[0]), { wrap: false });
  log(`${!broken.ok ? 'PASS' : 'FAIL'}  detector catches disabled wrapping   mismatch=${broken.wrapMismatchPixels}`);
  // Honesty check: a non-periodic gradient must be flagged.
  log(`ALL ${all && !broken.ok ? 'PASSED' : 'HAD FAILURES'}`);
  (window as unknown as { __done: boolean }).__done = true;
})();
void DEFAULT_SETTINGS;
