import type { Background, PatternObject, PatternState } from '../types/pattern';
import { drawMotifAt, resolvePalette, type Ctx2D, type ResolvedPalette } from './motifRenderer';
import { mod } from './random';
import { buildGeo, drawGeoOps } from './geoPattern';
import { vinePath } from './vineEngine';
import { buildTexture } from './textureEngine';

export interface RenderOptions {
  /** Skip drawing the background (export "transparent"). */
  transparent?: boolean;
  /** Disable edge wrapping — only used by the Seam Check self-test. */
  wrap?: boolean;
  /** Shift the whole motif field by this many tile pixels (used by Seam Check). */
  offsetX?: number;
  offsetY?: number;
  drawMotifs?: boolean;
  /** Draw the geometric base layer (default true). */
  drawGeo?: boolean;
  /** Replace objects by id without mutating state (live drag preview). */
  override?: PatternObject | null;
}

/** Radius of the circle that fully contains a rotated motif (incl. stroke overhang). */
export function objectRadius(o: PatternObject): number {
  return Math.max(o.width, o.height) * o.scale * 0.5 * Math.SQRT2 * 1.06;
}

/**
 * Every integer tile offset (kx, ky) at which a copy of the object intersects the tile.
 * Generalises the left/right/top/bottom/corner rules: an object crossing the right edge
 * yields kx = -1 (drawn at x - W), crossing the left edge yields kx = +1, and corner
 * crossings produce the diagonal combinations. Objects larger than the tile get as many
 * copies as needed.
 */
export function wrappedOffsets(x: number, y: number, r: number, W: number, H: number, wrap = true): [number, number][] {
  if (!wrap) return [[0, 0]];
  const kx0 = Math.floor((-r - x) / W) + 1, kx1 = Math.ceil((W + r - x) / W) - 1;
  const ky0 = Math.floor((-r - y) / H) + 1, ky1 = Math.ceil((H + r - y) / H) - 1;
  const out: [number, number][] = [];
  for (let ky = ky0; ky <= ky1; ky++) for (let kx = kx0; kx <= kx1; kx++) out.push([kx, ky]);
  return out;
}

/** Render one pattern object and all of its wrapped copies into tile space. */
export function renderPatternObject(ctx: Ctx2D, o: PatternObject, W: number, H: number, rp: ResolvedPalette, opts: { wrap?: boolean; offsetX?: number; offsetY?: number } = {}) {
  const x = mod(o.x + (opts.offsetX ?? 0), W);
  const y = mod(o.y + (opts.offsetY ?? 0), H);
  const r = objectRadius(o);
  const size = Math.max(o.width, o.height) * o.scale;
  for (const [kx, ky] of wrappedOffsets(x, y, r, W, H, opts.wrap ?? true)) {
    drawMotifAt(ctx, o.type, x + kx * W, y + ky * H, size, o.rotation, o.flipX, o.colorIndex, rp, o.opacity);
  }
}

/**
 * Seamless backgrounds. Solid is trivially periodic. Gradients are built so the value
 * at x = 0 equals x = W and y = 0 equals y = H (mirrored linear ramps, centred radial).
 */
export function drawBackground(ctx: Ctx2D, bg: Background, W: number, H: number) {
  if (bg.type === 'transparent') return;
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, W, H);
    return;
  }
  ctx.fillStyle = backgroundGradient(ctx, bg, W, H);
  ctx.fillRect(0, 0, W, H);
}

export function gradientGeometry(bg: Background, W: number, H: number) {
  if (bg.type === 'radial') {
    return { kind: 'radial' as const, cx: W / 2, cy: H / 2, r: Math.hypot(W, H) / 2, stops: [[0, bg.color], [1, bg.color2]] as [number, string][] };
  }
  if (bg.direction === 'horizontal') return { kind: 'linear' as const, x0: 0, y0: 0, x1: W, y1: 0, stops: [[0, bg.color], [0.5, bg.color2], [1, bg.color]] as [number, string][] };
  if (bg.direction === 'vertical') return { kind: 'linear' as const, x0: 0, y0: 0, x1: 0, y1: H, stops: [[0, bg.color], [0.5, bg.color2], [1, bg.color]] as [number, string][] };
  // Diagonal: u = x/W + y/H is periodic with period 1 in both axes; triangle-wave it.
  const k = 2 / (1 / (W * W) + 1 / (H * H));
  return {
    kind: 'linear' as const, x0: 0, y0: 0, x1: k / W, y1: k / H,
    stops: [[0, bg.color], [0.25, bg.color2], [0.5, bg.color], [0.75, bg.color2], [1, bg.color]] as [number, string][],
  };
}

function backgroundGradient(ctx: Ctx2D, bg: Background, W: number, H: number): CanvasGradient {
  const g = gradientGeometry(bg, W, H);
  const grad = g.kind === 'radial' ? ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.r) : ctx.createLinearGradient(g.x0, g.y0, g.x1, g.y1);
  g.stops.forEach(([t, c]) => grad.addColorStop(t, c));
  return grad;
}

/** Stem colour for the vine layout. */
export function vineColor(state: PatternState, ink: string): string {
  const i = state.settings.vineColor ?? -1;
  return i >= 0 && state.palette.length ? state.palette[i % state.palette.length] : ink;
}

/** Render the exact repeating unit at any output resolution. */
export function renderTile(ctx: Ctx2D, state: PatternState, outW: number, outH: number, opts: RenderOptions = {}) {
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, outW, outH);
  ctx.setTransform(outW / W, 0, 0, outH / H, 0, 0);
  ctx.imageSmoothingEnabled = true;
  if (!opts.transparent) drawBackground(ctx, state.background, W, H);
  if (state.geo?.enabled && opts.drawGeo !== false) {
    drawGeoOps(ctx, buildGeo(state.geo, state.palette, W, H, opts.offsetX ?? 0, opts.offsetY ?? 0));
  }
  if (opts.drawMotifs !== false && state.showMotifs !== false) {
    const rp = resolvePalette(state.palette);
    if (state.settings.layout === 'vine' && (state.settings.vineWidth ?? 40) > 0) {
      const v = vinePath(state.settings, opts.offsetX ?? 0, opts.offsetY ?? 0);
      const [stems, tendrils] = v.d.split('|');
      ctx.strokeStyle = vineColor(state, rp.ink);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (stems) { ctx.lineWidth = v.sw; ctx.stroke(new Path2D(stems)); }
      if (tendrils) { ctx.lineWidth = v.tw; ctx.stroke(new Path2D(tendrils)); }
    }
    const hidden = state.hiddenTypes.length ? new Set(state.hiddenTypes) : null;
    for (const raw of state.objects) {
      const o = opts.override && opts.override.id === raw.id ? opts.override : raw;
      if (hidden?.has(o.type)) continue;
      renderPatternObject(ctx, o, W, H, rp, { wrap: opts.wrap, offsetX: opts.offsetX, offsetY: opts.offsetY });
    }
  }
  if (state.texture && state.texture.type !== 'none' && opts.drawMotifs !== false) {
    const erase = !!opts.transparent || state.background.type === 'transparent';
    for (const op of buildTexture(state.texture, W, H, opts.offsetX ?? 0, opts.offsetY ?? 0)) {
      const p = new Path2D(op.d);
      if (op.bgPaint) {
        if (erase) { ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; }
        else ctx.fillStyle = state.background.type === 'solid' ? state.background.color : backgroundGradient(ctx, state.background, W, H);
      } else { ctx.fillStyle = op.fill; ctx.globalAlpha = op.alpha ?? 1; }
      ctx.fill(p);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

/** Find the top-most object under a tile-space point (accounts for wrapping). */
export function hitTest(state: PatternState, tx: number, ty: number): PatternObject | null {
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  const hidden = new Set(state.hiddenTypes);
  for (let i = state.objects.length - 1; i >= 0; i--) {
    const o = state.objects[i];
    if (hidden.has(o.type) || o.type === 'tile') continue;
    const r = Math.max(o.width, o.height) * o.scale * 0.42;
    let dx = Math.abs(tx - o.x); dx = Math.min(dx, W - dx);
    let dy = Math.abs(ty - o.y); dy = Math.min(dy, H - dy);
    if (dx * dx + dy * dy <= r * r) return o;
  }
  return null;
}
