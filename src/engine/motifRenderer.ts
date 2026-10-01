import { MOTIF_MAP, type ColorRole, type MotifDef } from '../data/motifs';
import { luminance, mix } from '../utils/colors';

export type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export interface ResolvedPalette {
  colors: string[];
  ink: string;
  light: string;
}

const paletteCache = new Map<string, ResolvedPalette>();

export function resolvePalette(palette: string[]): ResolvedPalette {
  const key = palette.join(',');
  const hit = paletteCache.get(key);
  if (hit) return hit;
  const colors = palette.length ? palette : ['#333333'];
  const sorted = [...colors].sort((a, b) => luminance(a) - luminance(b));
  let ink = sorted[0];
  if (luminance(ink) > 0.12) ink = mix(ink, '#17171A', 0.65);
  const light = mix(sorted[sorted.length - 1], '#FFFFFF', 0.6);
  const rp = { colors, ink, light };
  paletteCache.set(key, rp);
  return rp;
}

export function roleColor(role: ColorRole, colorIndex: number, rp: ResolvedPalette): string {
  const n = rp.colors.length;
  const i = ((colorIndex % n) + n) % n;
  const main = rp.colors[i];
  switch (role) {
    case 'main': return main;
    case 'alt': return n > 1 ? rp.colors[(i + 1) % n] : mix(main, '#000000', 0.25);
    case 'accent': return n > 2 ? rp.colors[(i + 2) % n] : mix(main, n > 1 ? rp.ink : '#FFFFFF', 0.4);
    case 'ink': return rp.ink;
    case 'light': return rp.light;
  }
}

const pathCache = new Map<string, Path2D>();
function path2d(d: string): Path2D {
  let p = pathCache.get(d);
  if (!p) { p = new Path2D(d); pathCache.set(d, p); }
  return p;
}

export function getMotif(type: string): MotifDef {
  return MOTIF_MAP[type] ?? MOTIF_MAP.dot;
}

/** Draws a motif in its 100×100 local space (caller sets the transform). */
export function drawMotifLocal(ctx: Ctx2D, motif: MotifDef, colorIndex: number, rp: ResolvedPalette, alpha = 1) {
  for (const part of motif.parts) {
    const p = path2d(part.d);
    ctx.globalAlpha = alpha * (part.o ?? 1);
    if (part.fill) {
      ctx.fillStyle = roleColor(part.fill, colorIndex, rp);
      ctx.fill(p, part.rule ?? 'nonzero');
    }
    if (part.stroke) {
      ctx.strokeStyle = roleColor(part.stroke, colorIndex, rp);
      ctx.lineWidth = part.sw ?? 2;
      ctx.lineCap = part.cap ?? 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash(part.dash ?? []);
      ctx.stroke(p);
      if (part.dash) ctx.setLineDash([]);
    }
  }
  ctx.globalAlpha = 1;
}

let scratch: HTMLCanvasElement | OffscreenCanvas | null = null;
function getScratch(size: number) {
  if (!scratch) {
    scratch = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(size, size) : document.createElement('canvas');
  }
  if (scratch.width < size || scratch.height < size) {
    scratch.width = Math.max(scratch.width, size);
    scratch.height = Math.max(scratch.height, size);
  }
  return scratch;
}

/**
 * Draw one motif instance centred at (cx, cy) in the current coordinate space.
 * Partially transparent motifs are composited as a group (like SVG <g opacity>)
 * so overlapping parts don't double up.
 */
export function drawMotifAt(
  ctx: Ctx2D, type: string, cx: number, cy: number, size: number, rotationDeg: number,
  flipX: boolean, colorIndex: number, rp: ResolvedPalette, opacity: number,
) {
  const motif = getMotif(type);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  if (flipX) ctx.scale(-1, 1);
  if (opacity >= 0.999) {
    ctx.scale(size / 100, size / 100);
    ctx.translate(-50, -50);
    drawMotifLocal(ctx, motif, colorIndex, rp);
  } else {
    const t = ctx.getTransform();
    const devScale = Math.hypot(t.a, t.b);
    const pad = 1.2;
    const px = Math.min(2048, Math.max(8, Math.ceil(size * pad * devScale)));
    const sc = getScratch(px);
    const sctx = sc.getContext('2d') as Ctx2D;
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    // clear a 2px margin too: bilinear sampling at the sub-rect edge must not pick up stale pixels
    sctx.clearRect(0, 0, Math.min(sc.width, px + 2), Math.min(sc.height, px + 2));
    const k = px / (100 * pad);
    sctx.setTransform(k, 0, 0, k, (px - 100 * k) / 2, (px - 100 * k) / 2);
    drawMotifLocal(sctx, motif, colorIndex, rp);
    ctx.globalAlpha = opacity;
    const half = (size * pad) / 2;
    ctx.drawImage(sc as CanvasImageSource, 0, 0, px, px, -half, -half, half * 2, half * 2);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** Renders a motif icon at a given pixel size for UI thumbnails. */
export function renderMotifIcon(canvas: HTMLCanvasElement, type: string, palette: string[], colorIndex = 0) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const s = canvas.clientWidth || 40;
  canvas.width = s * dpr; canvas.height = s * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr * s / 100, 0, 0, dpr * s / 100, 0, 0);
  drawMotifLocal(ctx, getMotif(type), colorIndex, resolvePalette(palette));
}
