import { memo, useEffect, useRef } from 'react';
import type { PatternState } from '../types/pattern';
import { renderTile } from '../engine/seamlessRenderer';
import { createCanvas, get2d } from '../utils/canvas';

/**
 * Lightweight, non-interactive infinite repeat of the current tile, filling its box.
 * Used for previews outside the editor (welcome screen, mobile preview sheet).
 */
export const InfinitePreview = memo(function InfinitePreview({ state, tilePx = 180, className, showBoundary }: { state: PatternState; tilePx?: number; className?: string; showBoundary?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    const paint = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = w * dpr; canvas.height = h * dpr;
      const W = state.settings.tileWidth, H = state.settings.tileHeight;
      const tw = tilePx, th = (tilePx * H) / W;
      const tile = createCanvas(tw * dpr, th * dpr);
      renderTile(get2d(tile), state, tile.width, tile.height);
      const ctx = canvas.getContext('2d')!;
      const pat = ctx.createPattern(tile, 'repeat');
      if (!pat) return;
      const ox = (w / 2 - tw / 2) * dpr, oy = (h / 2 - th / 2) * dpr;
      pat.setTransform(new DOMMatrix().translateSelf(ox, oy));
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (showBoundary) {
        ctx.strokeStyle = 'rgba(93,71,230,.8)'; ctx.setLineDash([5 * dpr, 4 * dpr]); ctx.lineWidth = dpr;
        ctx.beginPath();
        for (let x = ox % (tw * dpr); x < canvas.width; x += tw * dpr) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for (let y = oy % (th * dpr); y < canvas.height; y += th * dpr) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(paint);
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [state, tilePx, showBoundary]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
});
