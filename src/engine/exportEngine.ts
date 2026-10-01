import type { ExportFormat, PatternState } from '../types/pattern';
import { renderTile, objectRadius, wrappedOffsets, gradientGeometry } from './seamlessRenderer';
import { getMotif, resolvePalette, roleColor } from './motifRenderer';
import { mod } from './random';
import { buildGeo, geoOpsToSvg } from './geoPattern';
import { createCanvas, get2d } from '../utils/canvas';

export const MIN_DIM = 16;
export const MAX_DIM = 12000;
export const MAX_AREA = 64_000_000; // ~ 8000 × 8000 — beyond this most browsers fail to allocate

export class ExportError extends Error {
  constructor(public userMessage: string) {
    super(userMessage);
  }
}

export interface ExportOptions {
  format: ExportFormat;
  width: number;
  height: number;
  quality: number;      // 0.5 – 1
  transparent: boolean;
}

export const MIME: Record<Exclude<ExportFormat, 'svg'>, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };

export function validateDimensions(w: number, h: number): string | null {
  if (!Number.isFinite(w) || !Number.isFinite(h)) return 'Enter a width and height in pixels.';
  if (!Number.isInteger(w) || !Number.isInteger(h)) return 'Width and height must be whole numbers.';
  if (w < MIN_DIM || h < MIN_DIM) return `Minimum size is ${MIN_DIM} × ${MIN_DIM} px.`;
  if (w > MAX_DIM || h > MAX_DIM) return `Maximum size is ${MAX_DIM.toLocaleString()} px per side.`;
  if (w * h > MAX_AREA) return `That's ${(w * h / 1e6).toFixed(0)} megapixels — browsers can't reliably allocate more than ${MAX_AREA / 1e6} MP. Try a smaller size.`;
  return null;
}

function blobFromCanvas(canvas: HTMLCanvasElement | OffscreenCanvas, type: string, quality: number): Promise<Blob> {
  if ('convertToBlob' in canvas) {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob((b) => (b ? resolve(b) : reject(new Error('EMPTY_BLOB'))), type, quality);
  });
}

function makeCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  // Large exports render offscreen so the editor canvas is untouched.
  if (typeof OffscreenCanvas !== 'undefined') {
    try { return new OffscreenCanvas(w, h); } catch { /* fall back */ }
  }
  return createCanvas(w, h);
}

/** Render the exact repeating tile at the requested resolution into an image blob. */
export async function renderRaster(state: PatternState, o: ExportOptions): Promise<Blob> {
  const err = validateDimensions(o.width, o.height);
  if (err) throw new ExportError(err);
  if (o.format === 'svg') throw new ExportError('Use the SVG exporter for vector output.');
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  try {
    canvas = makeCanvas(o.width, o.height);
    const ctx = get2d(canvas);
    const transparent = o.transparent && o.format !== 'jpg';
    if (o.format === 'jpg' && (o.transparent || state.background.type === 'transparent')) {
      // JPG has no alpha channel – flatten onto white.
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, o.width, o.height);
      renderTileOnto(ctx, state, o.width, o.height);
    } else {
      renderTile(ctx, state, o.width, o.height, { transparent });
    }
  } catch {
    throw new ExportError('Your browser ran out of memory rendering this size. Try a smaller resolution.');
  }
  try {
    const blob = await blobFromCanvas(canvas, MIME[o.format], o.quality);
    if (o.format === 'webp' && blob.type !== 'image/webp') {
      throw new ExportError('This browser cannot encode WebP. Choose PNG or JPG instead.');
    }
    return blob;
  } catch (e) {
    if (e instanceof ExportError) throw e;
    throw new ExportError('The image could not be encoded — it may be too large for this browser. Try a smaller resolution.');
  } finally {
    canvas.width = 1; canvas.height = 1; // release memory promptly
  }
}

function renderTileOnto(ctx: ReturnType<typeof get2d>, state: PatternState, w: number, h: number) {
  const tmp = makeCanvas(w, h);
  const tctx = get2d(tmp);
  renderTile(tctx, state, w, h, { transparent: true });
  ctx.drawImage(tmp as CanvasImageSource, 0, 0);
  tmp.width = 1; tmp.height = 1;
}

const n = (v: number) => String(Math.round(v * 1000) / 1000);
const esc = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));

/**
 * Vector export. Uses the same motif paths and the same wrap offsets as the canvas
 * renderer, so the SVG is the identical repeating unit.
 */
export function buildSvg(state: PatternState, o: Pick<ExportOptions, 'width' | 'height' | 'transparent'>): string {
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  const rp = resolvePalette(state.palette);
  const hidden = new Set(state.hiddenTypes);
  const defs: string[] = [];
  const body: string[] = [];
  const used = new Set<string>();

  const bg = state.background;
  if (!o.transparent && bg.type !== 'transparent') {
    if (bg.type === 'solid') {
      body.push(`<rect width="${W}" height="${H}" fill="${bg.color}"/>`);
    } else {
      const g = gradientGeometry(bg, W, H);
      const stops = g.stops.map(([t, c]) => `<stop offset="${t}" stop-color="${c}"/>`).join('');
      defs.push(g.kind === 'radial'
        ? `<radialGradient id="bg" gradientUnits="userSpaceOnUse" cx="${n(g.cx)}" cy="${n(g.cy)}" r="${n(g.r)}">${stops}</radialGradient>`
        : `<linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="${n(g.x0)}" y1="${n(g.y0)}" x2="${n(g.x1)}" y2="${n(g.y1)}">${stops}</linearGradient>`);
      body.push(`<rect width="${W}" height="${H}" fill="url(#bg)"/>`);
    }
  }

  if (state.geo?.enabled) body.push(geoOpsToSvg(buildGeo(state.geo, state.palette, W, H)));

  for (const obj of state.showMotifs === false ? [] : state.objects) {
    if (hidden.has(obj.type)) continue;
    const motif = getMotif(obj.type);
    const nCol = rp.colors.length;
    const ci = ((obj.colorIndex % nCol) + nCol) % nCol;
    const symId = `m-${motif.id}-${ci}`;
    if (!used.has(symId)) {
      used.add(symId);
      const parts = motif.parts.map((p) => {
        const attrs: string[] = [`d="${p.d}"`];
        attrs.push(`fill="${p.fill ? roleColor(p.fill, ci, rp) : 'none'}"`);
        if (p.rule) attrs.push(`fill-rule="${p.rule}"`);
        if (p.stroke) {
          attrs.push(`stroke="${roleColor(p.stroke, ci, rp)}"`, `stroke-width="${p.sw ?? 2}"`, `stroke-linecap="${p.cap ?? 'round'}"`, 'stroke-linejoin="round"');
          if (p.dash) attrs.push(`stroke-dasharray="${p.dash.join(' ')}"`);
        }
        if (p.o != null && p.o < 1) attrs.push(`opacity="${p.o}"`);
        return `<path ${attrs.join(' ')}/>`;
      }).join('');
      defs.push(`<g id="${symId}">${parts}</g>`);
    }
    const x = mod(obj.x, W), y = mod(obj.y, H);
    const size = Math.max(obj.width, obj.height) * obj.scale;
    const s = size / 100;
    for (const [kx, ky] of wrappedOffsets(x, y, objectRadius(obj), W, H)) {
      const t = `translate(${n(x + kx * W)} ${n(y + ky * H)}) rotate(${n(obj.rotation)})${obj.flipX ? ' scale(-1 1)' : ''} scale(${n(s)}) translate(-50 -50)`;
      const op = obj.opacity < 0.999 ? ` opacity="${n(obj.opacity)}"` : '';
      body.push(`<use href="#${symId}" xlink:href="#${symId}" transform="${t}"${op}/>`);
    }
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${o.width}" height="${o.height}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`,
    `<title>${esc(state.name)} — PatternForge seamless tile</title>`,
    `<defs><clipPath id="tile"><rect width="${W}" height="${H}"/></clipPath>${defs.join('')}</defs>`,
    `<g clip-path="url(#tile)">${body.join('')}</g>`,
    `</svg>`,
  ].join('\n');
}

export function svgSupported(state: PatternState): boolean {
  // Every built-in motif is vector. Unknown motif types (e.g. future raster assets) fall back.
  return state.objects.every((o) => getMotif(o.type).id === o.type || o.type === 'dot');
}

/** Rough output-size estimate: encode a small sample, extrapolate by pixel area. */
export async function estimateFileSize(state: PatternState, o: ExportOptions): Promise<number> {
  if (o.format === 'svg') return new Blob([buildSvg(state, o)]).size;
  const sampleSide = 384;
  const k = Math.min(1, sampleSide / Math.max(o.width, o.height));
  const sw = Math.max(16, Math.round(o.width * k)), sh = Math.max(16, Math.round(o.height * k));
  const c = createCanvas(sw, sh);
  const ctx = get2d(c);
  if (o.format === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh); }
  renderTile(ctx, state, sw, sh, { transparent: o.transparent && o.format !== 'jpg' });
  const blob = await blobFromCanvas(c, MIME[o.format], o.quality);
  const areaRatio = (o.width * o.height) / (sw * sh);
  // Detail density per pixel drops as resolution grows (motifs become smoother).
  const factor = areaRatio <= 1 ? 1 : Math.pow(areaRatio, 0.82);
  return Math.round(blob.size * factor);
}

export async function copyImageToClipboard(state: PatternState, o: ExportOptions): Promise<void> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new ExportError('Your browser does not support copying images. Use Download instead.');
  }
  const blobPromise = renderRaster(state, { ...o, format: 'png' });
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
  } catch (e) {
    if (e instanceof ExportError) throw e;
    throw new ExportError('Clipboard access was blocked by the browser. Use Download instead.');
  }
}
