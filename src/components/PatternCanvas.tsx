import { memo, useCallback, useEffect, useRef } from 'react';
import type { Backdrop, PatternObject, PatternState, RepeatMode, SeamReport } from '../types/pattern';
import { hitTest, objectRadius, renderTile } from '../engine/seamlessRenderer';
import { mod } from '../engine/random';
import { viewStore } from '../hooks/viewStore';
import { createCanvas, drawChecker, get2d } from '../utils/canvas';

interface Props {
  state: PatternState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  repeat: RepeatMode;
  showBoundary: boolean;
  seam: SeamReport | null;
  backdrop: Backdrop;
  transitionKey: string;
}

const MIN_ZOOM = 0.02, MAX_ZOOM = 8;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

/**
 * The editor viewport. The tile is rendered once into an offscreen bitmap at a
 * resolution matched to the current zoom, then repeated with a canvas pattern —
 * preview resolution is independent from export resolution.
 */
function PatternCanvasImpl({ state, selectedId, onSelect, onMove, repeat, showBoundary, seam, backdrop, transitionKey }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const r = useRef({
    state, selectedId, repeat, showBoundary, seam, backdrop, transitionKey,
    cw: 0, ch: 0, dpr: 1,
    tile: null as HTMLCanvasElement | null, tileRes: 0, tileDirty: true, tileKey: '',
    prevTile: null as HTMLCanvasElement | null, fadeStart: 0,
    raf: 0, space: false,
    drag: null as null | { mode: 'pan' | 'move' | 'pending' | 'pinch'; sx: number; sy: number; panX: number; panY: number; obj?: PatternObject; hit?: PatternObject | null; moved: boolean; pinchDist?: number; pinchZoom?: number; midX?: number; midY?: number },
    override: null as PatternObject | null,
    pointers: new Map<number, { x: number; y: number }>(),
    hasFit: false,
  });

  // keep latest props in the ref (no re-render needed inside handlers)
  const prevKey = r.current.transitionKey;
  Object.assign(r.current, { selectedId, repeat, showBoundary, seam, backdrop, transitionKey });
  if (r.current.state !== state) {
    r.current.state = state;
    r.current.tileDirty = true;
    if (prevKey !== transitionKey && r.current.tile) {
      r.current.prevTile = r.current.tile;
      r.current.tile = null;
      r.current.fadeStart = performance.now();
    }
  }

  const geom = useCallback(() => {
    const s = r.current;
    const W = s.state.settings.tileWidth, H = s.state.settings.tileHeight;
    const n = s.repeat === 'infinite' ? 1 : s.repeat;
    const { zoom, panX, panY } = viewStore.get();
    const ox = s.cw / 2 + panX, oy = s.ch / 2 + panY;
    const cornerX = (-n * W) / 2, cornerY = (-n * H) / 2;
    return { W, H, n, zoom, ox, oy, cornerX, cornerY, infinite: s.repeat === 'infinite' };
  }, []);

  const draw = useCallback(() => {
    const s = r.current;
    s.raf = 0;
    const canvas = canvasRef.current;
    if (!canvas || !s.cw) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const g = geom();
    const { W, H, zoom, ox, oy, cornerX, cornerY, n, infinite } = g;

    // 1. (Re)render the tile bitmap when the pattern or needed resolution changed.
    const longest = Math.max(W, H);
    const want = Math.min(2048, Math.max(64, longest * zoom * s.dpr));
    const res = Math.round(Math.pow(2, Math.ceil(Math.log2(want) * 3) / 3));
    if (s.tileDirty || !s.tile || Math.abs(res - s.tileRes) > 1) {
      const tw = Math.max(8, Math.round((res * W) / longest)), th = Math.max(8, Math.round((res * H) / longest));
      const tile = s.tile && s.tile !== s.prevTile ? s.tile : createCanvas(tw, th);
      if (tile.width !== tw || tile.height !== th) { tile.width = tw; tile.height = th; }
      renderTile(get2d(tile), s.state, tw, th, { override: s.override });
      s.tile = tile; s.tileRes = res; s.tileDirty = false;
    }

    // 2. Draw the repeated preview.
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    ctx.clearRect(0, 0, s.cw, s.ch);
    const rx = infinite ? 0 : ox + cornerX * zoom;
    const ry = infinite ? 0 : oy + cornerY * zoom;
    const rw = infinite ? s.cw : n * W * zoom;
    const rh = infinite ? s.ch : n * H * zoom;
    const px0 = ox + cornerX * zoom, py0 = oy + cornerY * zoom; // screen pos of a tile corner

    if (!infinite) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#fff';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.restore();
    }
    if (s.state.background.type === 'transparent') drawChecker(ctx, rx, ry, rw, rh, 10, s.backdrop === 'dark');

    const paint = (tile: HTMLCanvasElement, alpha: number) => {
      const pat = ctx.createPattern(tile, 'repeat');
      if (!pat) return;
      pat.setTransform(new DOMMatrix().translateSelf(px0, py0).scaleSelf((W * zoom) / tile.width, (H * zoom) / tile.height));
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = pat;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.globalAlpha = 1;
    };
    let fading = false;
    if (s.prevTile) {
      const t = Math.min(1, (performance.now() - s.fadeStart) / 220);
      if (t < 1) { paint(s.prevTile, 1); paint(s.tile!, t); fading = true; }
      else { s.prevTile = null; paint(s.tile!, 1); }
    } else paint(s.tile!, 1);

    // visible tile index range
    const kx0 = Math.floor((rx - px0) / (W * zoom)), kx1 = Math.ceil((rx + rw - px0) / (W * zoom));
    const ky0 = Math.floor((ry - py0) / (H * zoom)), ky1 = Math.ceil((ry + rh - py0) / (H * zoom));

    // 3. Tile boundaries
    if (s.showBoundary) {
      ctx.save();
      ctx.beginPath();
      for (let k = kx0; k <= kx1; k++) { const x = Math.round(px0 + k * W * zoom) + 0.5; ctx.moveTo(x, ry); ctx.lineTo(x, ry + rh); }
      for (let k = ky0; k <= ky1; k++) { const y = Math.round(py0 + k * H * zoom) + 0.5; ctx.moveTo(rx, y); ctx.lineTo(rx + rw, y); }
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(93,71,230,0.95)';
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Seam check highlights along every visible seam
    if (s.seam && !s.seam.ok) {
      ctx.save();
      ctx.fillStyle = 'rgba(244,63,94,0.85)';
      const segH = Math.max(4, (H * zoom) / 96), segW = Math.max(4, (W * zoom) / 96);
      for (let kx = kx0; kx <= kx1; kx++) for (let ky = ky0; ky <= ky1; ky++) {
        const x = px0 + kx * W * zoom, y = py0 + ky * H * zoom;
        for (const f of s.seam.rowsFlagged) ctx.fillRect(x - 3, y + f * H * zoom - segH / 2, 6, segH);
        for (const f of s.seam.colsFlagged) ctx.fillRect(x + f * W * zoom - segW / 2, y - 3, segW, 6);
      }
      ctx.restore();
    }

    // 5. Selection ring on every visible instance of the selected motif
    const sel = s.selectedId ? (s.override?.id === s.selectedId ? s.override : s.state.objects.find((o) => o.id === s.selectedId)) : null;
    if (sel) {
      const rad = objectRadius(sel) * 0.82 * zoom;
      ctx.save();
      ctx.lineWidth = 1.5;
      for (let kx = kx0 - 1; kx <= kx1; kx++) for (let ky = ky0 - 1; ky <= ky1; ky++) {
        const x = px0 + (kx * W + sel.x) * zoom, y = py0 + (ky * H + sel.y) * zoom;
        if (x < rx - rad || x > rx + rw + rad || y < ry - rad || y > ry + rh + rad) continue;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = sel.locked ? '#f59e0b' : '#6f5cf6';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (fading) s.raf = requestAnimationFrame(draw);
  }, [geom]);

  const schedule = useCallback(() => {
    if (!r.current.raf) r.current.raf = requestAnimationFrame(draw);
  }, [draw]);

  const fit = useCallback(() => {
    const s = r.current;
    if (!s.cw) return;
    const W = s.state.settings.tileWidth, H = s.state.settings.tileHeight;
    const n = s.repeat === 'infinite' ? 2 : s.repeat;
    const pad = s.cw < 640 ? 24 : 72;
    const zoom = clampZoom(Math.min((s.cw - pad) / (n * W), (s.ch - pad) / (n * H)));
    viewStore.set({ zoom, panX: 0, panY: 0 });
    schedule();
  }, [schedule]);

  const zoomAt = useCallback((factor: number, sx?: number, sy?: number) => {
    const s = r.current;
    const { zoom, panX, panY } = viewStore.get();
    const nz = clampZoom(zoom * factor);
    const cx = sx ?? s.cw / 2, cy = sy ?? s.ch / 2;
    const ox = s.cw / 2 + panX, oy = s.ch / 2 + panY;
    const k = nz / zoom;
    viewStore.set({ zoom: nz, panX: cx - (cx - ox) * k - s.cw / 2, panY: cy - (cy - oy) * k - s.ch / 2 });
    schedule();
  }, [schedule]);

  useEffect(() => {
    viewStore.register({ fit, zoomBy: (f) => zoomAt(f), setZoom: (z) => zoomAt(z / viewStore.get().zoom) });
    return () => viewStore.register(null);
  }, [fit, zoomAt]);

  // redraw on prop changes
  useEffect(() => { schedule(); }, [state, selectedId, showBoundary, seam, backdrop, schedule]);
  // re-fit when the framing changes
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  useEffect(() => { if (r.current.hasFit) fit(); }, [repeat, W, H, fit]);

  // size tracking
  useEffect(() => {
    const el = wrapRef.current, canvas = canvasRef.current;
    if (!el || !canvas) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const s = r.current;
      s.dpr = Math.min(2, window.devicePixelRatio || 1);
      s.cw = rect.width; s.ch = rect.height;
      canvas.width = Math.max(1, Math.round(rect.width * s.dpr));
      canvas.height = Math.max(1, Math.round(rect.height * s.dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (!s.hasFit && rect.width > 0) { s.hasFit = true; fit(); }
      draw();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw, fit]);

  // wheel zoom (non-passive so we can preventDefault)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(Math.exp(-delta * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX - rect.left, e.clientY - rect.top);
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  // space-to-pan
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) => e.target instanceof HTMLElement && (e.target.closest('input, textarea, select, [contenteditable="true"]') !== null);
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping(e)) {
        e.preventDefault();
        if (!r.current.space) { r.current.space = true; if (canvasRef.current) canvasRef.current.style.cursor = 'grab'; }
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') { r.current.space = false; if (canvasRef.current) canvasRef.current.style.cursor = ''; }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const toTile = (sx: number, sy: number) => {
    const g = geom();
    const wx = (sx - g.ox) / g.zoom, wy = (sy - g.oy) / g.zoom;
    if (!g.infinite) {
      const half = (g.n * g.W) / 2, halfH = (g.n * g.H) / 2;
      if (wx < -half || wx > half || wy < -halfH || wy > halfH) return null;
    }
    return { tx: mod(wx - g.cornerX, g.W), ty: mod(wy - g.cornerY, g.H) };
  };

  const local = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = r.current;
    const p = local(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
    s.pointers.set(e.pointerId, p);
    const { panX, panY, zoom } = viewStore.get();
    if (s.pointers.size === 2) {
      const [a, b] = [...s.pointers.values()];
      s.override = null;
      s.drag = { mode: 'pinch', sx: 0, sy: 0, panX, panY, moved: true, pinchDist: Math.hypot(a.x - b.x, a.y - b.y), pinchZoom: zoom, midX: (a.x + b.x) / 2, midY: (a.y + b.y) / 2 };
      return;
    }
    if (s.space || e.button === 1) {
      s.drag = { mode: 'pan', sx: p.x, sy: p.y, panX, panY, moved: false };
      canvasRef.current!.style.cursor = 'grabbing';
      return;
    }
    if (e.button !== 0) return;
    const t = toTile(p.x, p.y);
    const hit = t ? hitTest(s.state, t.tx, t.ty) : null;
    if (hit && hit.id === s.selectedId && !hit.locked) {
      s.drag = { mode: 'move', sx: p.x, sy: p.y, panX, panY, obj: hit, moved: false };
    } else {
      s.drag = { mode: 'pending', sx: p.x, sy: p.y, panX, panY, hit, moved: false };
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = r.current;
    const p = local(e);
    if (s.pointers.has(e.pointerId)) s.pointers.set(e.pointerId, p);
    const d = s.drag;
    if (!d) {
      // hover cursor
      if (!s.space && canvasRef.current) {
        const t = toTile(p.x, p.y);
        const hit = t ? hitTest(s.state, t.tx, t.ty) : null;
        canvasRef.current.style.cursor = hit ? (hit.id === s.selectedId && !hit.locked ? 'move' : 'pointer') : '';
      }
      return;
    }
    if (d.mode === 'pinch') {
      if (s.pointers.size < 2) return;
      const [a, b] = [...s.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const nz = clampZoom(d.pinchZoom! * (dist / d.pinchDist!));
      const k = nz / d.pinchZoom!;
      const ox = s.cw / 2 + d.panX, oy = s.ch / 2 + d.panY;
      viewStore.set({ zoom: nz, panX: mx - (d.midX! - ox) * k - s.cw / 2, panY: my - (d.midY! - oy) * k - s.ch / 2 });
      schedule();
      return;
    }
    const dx = p.x - d.sx, dy = p.y - d.sy;
    if (!d.moved && Math.hypot(dx, dy) > 4) d.moved = true;
    if (!d.moved) return;
    if (d.mode === 'pending') { d.mode = 'pan'; canvasRef.current!.style.cursor = 'grabbing'; }
    if (d.mode === 'pan') {
      viewStore.set({ panX: d.panX + dx, panY: d.panY + dy });
      schedule();
    } else if (d.mode === 'move' && d.obj) {
      const { zoom } = viewStore.get();
      const W = s.state.settings.tileWidth, H = s.state.settings.tileHeight;
      s.override = { ...d.obj, x: mod(d.obj.x + dx / zoom, W), y: mod(d.obj.y + dy / zoom, H) };
      s.tileDirty = true;
      schedule();
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = r.current;
    s.pointers.delete(e.pointerId);
    const d = s.drag;
    if (d?.mode === 'pinch') { if (s.pointers.size === 0) s.drag = null; return; }
    s.drag = null;
    if (canvasRef.current) canvasRef.current.style.cursor = s.space ? 'grab' : '';
    if (!d) return;
    if (d.mode === 'move' && d.moved && s.override) {
      const o = s.override;
      onMove(o.id, o.x, o.y);
      // keep override until the new state arrives to avoid a flicker
      setTimeout(() => { s.override = null; }, 0);
      return;
    }
    if (!d.moved && (d.mode === 'pending' || d.mode === 'move')) {
      onSelect(d.mode === 'move' ? d.obj!.id : d.hit ? d.hit.id : null);
    }
  };

  return (
    <div ref={wrapRef} className="absolute inset-0 touch-none select-none">
      <canvas ref={canvasRef} role="img"
        aria-label={`Pattern preview: ${state.name}. Scroll to zoom, hold Space and drag to pan, click a motif to select it.`}
        className="block h-full w-full"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()} />
    </div>
  );
}

export const PatternCanvas = memo(PatternCanvasImpl);
