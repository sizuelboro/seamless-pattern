import type { Ctx2D } from '../engine/motifRenderer';
import type { PatternState } from '../types/pattern';
import { renderTile } from '../engine/seamlessRenderer';

export function createCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

export function get2d(c: HTMLCanvasElement | OffscreenCanvas): Ctx2D {
  const ctx = c.getContext('2d', { willReadFrequently: false }) as Ctx2D | null;
  if (!ctx) throw new Error('CANVAS_UNAVAILABLE');
  return ctx;
}

export function drawChecker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, size = 10, dark = false) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = dark ? '#2a2a2f' : '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = dark ? '#36363c' : '#e9e9ee';
  const x0 = Math.floor(x / size) * size, y0 = Math.floor(y / size) * size;
  for (let yy = y0; yy < y + h; yy += size) {
    for (let xx = x0; xx < x + w; xx += size) {
      if (((xx / size) + (yy / size)) % 2 === 0) ctx.fillRect(xx, yy, size, size);
    }
  }
  ctx.restore();
}

/** Render a small tiled preview (repeat × repeat) as a data URL — used for thumbnails. */
export function renderThumbnail(state: PatternState, size = 240, repeat = 2, type = 'image/webp'): string {
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  const tileW = Math.max(16, Math.round(size / repeat));
  const tileH = Math.max(16, Math.round((tileW * H) / W));
  const tile = createCanvas(tileW * 2, tileH * 2);
  renderTile(get2d(tile), state, tile.width, tile.height);
  const out = createCanvas(size, size);
  const ctx = out.getContext('2d')!;
  if (state.background.type === 'transparent') drawChecker(ctx, 0, 0, size, size, 8);
  for (let y = 0; y < size; y += tileH) for (let x = 0; x < size; x += tileW) {
    ctx.drawImage(tile, Math.round(x), Math.round(y), tileW, tileH);
  }
  try {
    return out.toDataURL(type, 0.82);
  } catch {
    return out.toDataURL();
  }
}

/** Single tile image as data URL (used by mockups). */
export function renderTileDataUrl(state: PatternState, maxSide = 512): string {
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  const k = maxSide / Math.max(W, H);
  const c = createCanvas(W * k, H * k);
  renderTile(get2d(c), state, c.width, c.height);
  return c.toDataURL('image/png');
}
