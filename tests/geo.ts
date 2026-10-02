import { PRESETS, stateFromPreset } from '../src/data/presets';
import { renderRaster, buildSvg } from '../src/engine/exportEngine';
import { runSeamCheck } from '../src/engine/seamCheck';
import { drawBackground } from '../src/engine/seamlessRenderer';
import { drawMotifAt, resolvePalette } from '../src/engine/motifRenderer';
import { GEO_STYLES, GEO_MAP, buildGeo, drawGeoOps, geoGrid } from '../src/engine/geoPattern';
import type { PatternState, GeoSettings } from '../src/types/pattern';
import { vineNetwork, stemPoints } from '../src/engine/vineEngine';
import { buildTexture } from '../src/engine/textureEngine';
import { vineColor } from '../src/engine/seamlessRenderer';
import { generatePattern } from '../src/engine/patternGenerator';

const out: string[] = [];
const log = (s: string) => { out.push(s); document.getElementById('out')!.textContent = out.join('\n'); };

/** Ground truth: one big 3W×3H field generated with 3× the cells, no tile wrapping involved. */
function bruteForce(state: PatternState, px: number, pxH: number): Uint8ClampedArray {
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  const c = new OffscreenCanvas(px * 3, pxH * 3); const ctx = c.getContext('2d')!;
  ctx.setTransform(px / W, 0, 0, pxH / H, 0, 0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { ctx.save(); ctx.translate(i * W, j * H); drawBackground(ctx, state.background, W, H); ctx.restore(); }
  const g = state.geo!;
  if (g.enabled) {
    const gr = geoGrid(g, W, H);
    const big: GeoSettings = { ...g, repeat: gr.cols * 3, aspect: g.style === 'hajw' ? g.aspect : gr.ch / gr.cw, rowsOverride: gr.rows * 3 };
    const bg = geoGrid(big, W * 3, H * 3);
    if (bg.rows !== gr.rows * 3) throw new Error('grid mismatch');
    drawGeoOps(ctx, buildGeo(big, state.palette, W * 3, H * 3));
  }
  if (state.showMotifs !== false && state.settings.layout === 'vine' && (state.settings.vineWidth ?? 40) > 0) {
    // raw vine network drawn at every lattice offset (no wrap logic)
    const net = vineNetwork(state.settings);
    const stems = net.stems.map((sg) => `M${stemPoints(sg).map((p) => p.join(' ')).join('L')}`).join('');
    const tend = net.tendrils.map((t) => `M${t.map((p) => p.join(' ')).join('L')}`).join('');
    ctx.strokeStyle = vineColor(state, resolvePalette(state.palette).ink); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let kx = -1; kx <= 4; kx++) for (let ky = -1; ky <= 4; ky++) {
      ctx.save(); ctx.translate(kx * W, ky * H);
      ctx.lineWidth = net.stemWidth; ctx.stroke(new Path2D(stems));
      if (tend) { ctx.lineWidth = net.stemWidth * 0.6; ctx.stroke(new Path2D(tend)); }
      ctx.restore();
    }
  }
  if (state.showMotifs !== false) {
    const rp = resolvePalette(state.palette);
    for (const o of state.objects) for (let kx = -1; kx <= 4; kx++) for (let ky = -1; ky <= 4; ky++)
      drawMotifAt(ctx, o.type, o.x + kx * W, o.y + ky * H, Math.max(o.width, o.height) * o.scale, o.rotation, o.flipX, o.colorIndex, rp, o.opacity);
  }
  if (state.texture && state.texture.type !== 'none') {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      ctx.save(); ctx.translate(i * W, j * H); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      for (const op of buildTexture(state.texture, W, H)) {
        ctx.globalAlpha = op.alpha ?? 1;
        ctx.fillStyle = op.bgPaint ? (state.background.type === 'solid' ? state.background.color : '#000') : op.fill;
        ctx.fill(new Path2D(op.d));
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }
  }
  return ctx.getImageData(0, 0, c.width, c.height).data;
}

async function test(name: string, state: PatternState) {
  const px = 400, pxH = Math.round(px * state.settings.tileHeight / state.settings.tileWidth);
  const bmp = await createImageBitmap(await renderRaster(state, { format: 'png', width: px, height: pxH, quality: 1, transparent: false }));
  const c = new OffscreenCanvas(px * 3, pxH * 3); const ctx = c.getContext('2d')!;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) ctx.drawImage(bmp, i * px, j * pxH);
  const A = ctx.getImageData(0, 0, c.width, c.height).data, B = bruteForce(state, px, pxH);
  let bad = 0, seamBad = 0;
  // Skip the reference field's own outer 1px border; every internal seam is compared.
  for (let y = 1; y < c.height - 1; y++) for (let x = 1; x < c.width - 1; x++) {
    const i = (y * c.width + x) * 4;
    if (Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2])) > 40) {
      bad++; if (x % px < 2 || x % px > px - 3 || y % pxH < 2 || y % pxH > pxH - 3) seamBad++;
    }
  }
  // SVG must match canvas
  const svg = buildSvg(state, { width: px, height: pxH, transparent: false });
  const img = new Image();
  await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); });
  const s1 = document.createElement('canvas'); s1.width = px; s1.height = pxH; const s1c = s1.getContext('2d')!; s1c.drawImage(img, 0, 0, px, pxH);
  const s2 = document.createElement('canvas'); s2.width = px; s2.height = pxH; const s2c = s2.getContext('2d')!; s2c.drawImage(bmp, 0, 0);
  const SA = s1c.getImageData(0, 0, px, pxH).data, SB = s2c.getImageData(0, 0, px, pxH).data;
  let svgBad = 0; for (let i = 0; i < SA.length; i += 4) if (Math.max(Math.abs(SA[i] - SB[i]), Math.abs(SA[i + 1] - SB[i + 1]), Math.abs(SA[i + 2] - SB[i + 2])) > 60) svgBad++;
  const sc = runSeamCheck(state);
  // tolerance: anti-aliased edge pixels may differ by rounding between the two rasterisations
  // A motif sitting exactly on a seam may differ by one AA edge pixel per crossing stroke (path clipped at the canvas edge).
  const ok = seamBad <= Math.max(3, (c.width + c.height) * 0.015) && bad <= c.width * 0.5 && sc.ok && svgBad < px * pxH * 0.0025;
  log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(36)} field3x3Diff=${bad} atSeams=${seamBad} svgDiff=${svgBad} seamCheck=${sc.ok ? 'ok' : 'FAIL(' + sc.wrapMismatchPixels + '/' + sc.backgroundBreaks + ')'}`);
  return ok;
}

(async () => {
  let all = true;
  for (const p of PRESETS.filter((p) => !!p.geo || p.settings.layout === 'vine' || !!p.texture)) all = (await test(`preset:${p.id}`, stateFromPreset(p))) && all;
  const base = stateFromPreset(PRESETS.find((p) => p.id === 'geo-harlequin')!);
  for (const st of GEO_STYLES) {
    const g = { ...base.geo!, ...GEO_MAP[st.id].defaults, style: st.id, colors: [-1, 1, 0, 3, 2] } as GeoSettings;
    all = (await test(`style:${st.id}`, { ...base, geo: g })) && all;
    all = (await test(`style:${st.id} +outline+accent+rotate`, { ...base, geo: { ...g, outline: true, accent: 'star', rotate: true } })) && all;
    all = (await test(`style:${st.id} non-square 1600x1000 r=5 a=1.7`, { ...base, settings: { ...base.settings, tileWidth: 1600, tileHeight: 1000 }, geo: { ...g, repeat: 5, aspect: 1.7, accent: 'flower', outline: true } })) && all;
  }
  // vine layout on a non-square tile, with every texture type
  const vb = stateFromPreset(PRESETS.find((p) => p.id === 'ch-chintz-garden')!);
  const vs = { ...vb.settings, tileWidth: 1600, tileHeight: 1000, seed: 99 };
  all = (await test('vine non-square 1600x1000', { ...vb, settings: vs, objects: generatePattern(vs) })) && all;
  for (const type of ['distressed', 'grain', 'linen', 'canvas'] as const) {
    all = (await test(`texture:${type} non-square`, { ...vb, settings: vs, objects: generatePattern(vs), texture: { type, amount: 70, scale: 140, seed: 3 } })) && all;
  }
  log(`ALL ${all ? 'PASSED' : 'HAD FAILURES'}`);
  (window as unknown as { __done: boolean }).__done = true;
})();
