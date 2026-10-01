import { useEffect, useMemo, useState } from 'react';
import { Check, ClipboardCopy, Download, Link2, Link2Off, Loader2, TriangleAlert } from 'lucide-react';
import type { ExportFormat, PatternState } from '../types/pattern';
import { buildSvg, copyImageToClipboard, estimateFileSize, ExportError, renderRaster, svgSupported, validateDimensions } from '../engine/exportEngine';
import { downloadBlob, exportFileName, formatBytes } from '../utils/download';
import { renderThumbnail } from '../utils/canvas';
import { Modal } from './Modal';
import { Button, Segmented, Slider, cx } from './ui';
import { useToast } from './Toast';

const RES_PRESETS = [1024, 2048, 4096, 6000];

interface Props {
  open: boolean;
  onClose: () => void;
  state: PatternState;
  initialFormat?: ExportFormat;
}

export function ExportModal({ open, onClose, state, initialFormat }: Props) {
  const toast = useToast();
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  const aspect = W / H;
  const [format, setFormat] = useState<ExportFormat>('png');
  const [width, setWidth] = useState(String(W));
  const [height, setHeight] = useState(String(H));
  const [lock, setLock] = useState(true);
  const [quality, setQuality] = useState(90);
  const [bgMode, setBgMode] = useState<'current' | 'transparent'>('current');
  const [estimate, setEstimate] = useState<number | null>(null);
  const [busy, setBusy] = useState<null | 'download' | 'copy'>(null);
  const [thumb, setThumb] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialFormat) setFormat(initialFormat);
    const side = Math.max(W, H);
    const base = RES_PRESETS.includes(side) ? side : 2048;
    setWidth(String(W >= H ? base : Math.round(base * aspect)));
    setHeight(String(H >= W ? base : Math.round(base / aspect)));
    setThumb(renderThumbnail(state, 220, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const w = Number(width), h = Number(height);
  const dimError = validateDimensions(w, h);
  const transparent = bgMode === 'transparent' || state.background.type === 'transparent';
  const jpgFlatten = format === 'jpg' && transparent;
  const fileName = exportFileName(state.name, !!state.presetId, w || 0, h || 0, format);
  const stretched = Math.abs(w / h - aspect) > 0.01;

  const opts = useMemo(() => ({ format, width: w, height: h, quality: quality / 100, transparent: bgMode === 'transparent' }), [format, w, h, quality, bgMode]);

  useEffect(() => {
    if (!open || dimError) { setEstimate(null); return; }
    let alive = true;
    const t = setTimeout(() => {
      estimateFileSize(state, opts).then((n) => alive && setEstimate(n)).catch(() => alive && setEstimate(null));
    }, 280);
    return () => { alive = false; clearTimeout(t); };
  }, [open, state, opts, dimError]);

  const setPreset = (p: number) => {
    if (aspect >= 1) { setWidth(String(p)); setHeight(String(Math.round(p / aspect))); }
    else { setHeight(String(p)); setWidth(String(Math.round(p * aspect))); }
  };
  const onW = (v: string) => { setWidth(v); const n = Number(v); if (lock && n > 0) setHeight(String(Math.round(n / (Number(width) / Number(height) || aspect)))); };
  const onH = (v: string) => { setHeight(v); const n = Number(v); if (lock && n > 0) setWidth(String(Math.round(n * (Number(width) / Number(height) || aspect)))); };

  const download = async () => {
    if (dimError) return;
    setBusy('download');
    await new Promise((r) => setTimeout(r, 30)); // let the spinner paint before heavy work
    try {
      if (format === 'svg') {
        if (!svgSupported(state)) {
          const blob = await renderRaster(state, { ...opts, format: 'png' });
          downloadBlob(blob, fileName.replace(/\.svg$/, '.png'));
          toast.show('PNG exported', 'info', 'Some motifs can’t be vectorised, so a PNG was exported instead.');
        } else {
          const svg = buildSvg(state, opts);
          downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), fileName);
          toast.show('SVG exported');
        }
      } else {
        const blob = await renderRaster(state, opts);
        downloadBlob(blob, fileName);
        toast.show(`${format.toUpperCase()} exported`, 'success', `${fileName} · ${formatBytes(blob.size)}`);
      }
    } catch (e) {
      toast.show('Export failed', 'error', e instanceof ExportError ? e.userMessage : 'The download could not be started. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (dimError) return;
    setBusy('copy');
    try {
      await copyImageToClipboard(state, opts);
      toast.show('Copied to clipboard', 'success', format !== 'png' ? 'Clipboards only accept PNG, so it was copied as PNG.' : undefined);
    } catch (e) {
      toast.show('Copy failed', 'error', e instanceof ExportError ? e.userMessage : 'Clipboard access was blocked.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Pattern" subtitle="Exports the exact repeating tile — it tiles perfectly in any direction." className="sm:max-w-[640px]">
      <div className="grid gap-5 p-5 sm:grid-cols-[200px_1fr]">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-xl ring-1 ring-ink-200 dark:ring-ink-700">
            {thumb ? <img src={thumb} alt="2×2 repeat preview of the export" className="aspect-square w-full" /> : <div className="aspect-square w-full bg-ink-100 dark:bg-ink-800" />}
          </div>
          <p className="text-center text-[11px] text-ink-500">2 × 2 repeat preview</p>
          <div className="rounded-lg bg-ink-50 p-2.5 text-[11px] text-ink-600 dark:bg-ink-850 dark:text-ink-300">
            <div className="truncate font-mono" title={fileName}>{fileName}</div>
            <div className="mt-1 flex justify-between text-ink-500">
              <span>Estimated size</span>
              <span className="font-medium tabular-nums text-ink-700 dark:text-ink-200">{estimate != null ? `≈ ${formatBytes(estimate)}` : dimError ? '—' : '…'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="label mb-2">Format</div>
            <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Format">
              {(['png', 'jpg', 'webp', 'svg'] as ExportFormat[]).map((f) => (
                <button key={f} type="button" role="radio" aria-checked={format === f} onClick={() => setFormat(f)}
                  className={cx('h-10 rounded-lg border text-[13px] font-semibold uppercase transition', format === f ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500 dark:bg-brand-900/30 dark:text-brand-200' : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300 dark:hover:border-ink-600')}>
                  {f}
                </button>
              ))}
            </div>
            {format === 'svg' && <p className="mt-2 text-[11px] text-ink-500">Vector output with exact motif paths, transforms and wrapped copies. Resolution sets the default display size.</p>}
          </div>

          <div>
            <div className="label mb-2">Resolution</div>
            <div className="grid grid-cols-4 gap-1.5">
              {RES_PRESETS.map((p) => {
                const pw = aspect >= 1 ? p : Math.round(p * aspect), ph = aspect >= 1 ? Math.round(p / aspect) : p;
                const active = w === pw && h === ph;
                return (
                  <button key={p} type="button" aria-pressed={active} onClick={() => setPreset(p)}
                    className={cx('h-9 rounded-lg border text-[11px] font-medium tabular-nums transition', active ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200' : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300')}>
                    {pw} × {ph}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="flex-1"><span className="sr-only">Width</span>
                <div className="relative"><input className={cx('input pr-7 font-mono tabular-nums', dimError && 'border-rose-400')} inputMode="numeric" aria-label="Width in pixels" value={width} onChange={(e) => onW(e.target.value.replace(/[^\d]/g, ''))} /><span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-400">W</span></div>
              </label>
              <button type="button" aria-pressed={lock} aria-label={lock ? 'Unlock aspect ratio' : 'Lock aspect ratio'} title={lock ? 'Aspect ratio locked' : 'Aspect ratio unlocked'} onClick={() => setLock(!lock)}
                className={cx('flex h-8 w-8 items-center justify-center rounded-lg transition', lock ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300' : 'text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800')}>
                {lock ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
              </button>
              <label className="flex-1"><span className="sr-only">Height</span>
                <div className="relative"><input className={cx('input pr-7 font-mono tabular-nums', dimError && 'border-rose-400')} inputMode="numeric" aria-label="Height in pixels" value={height} onChange={(e) => onH(e.target.value.replace(/[^\d]/g, ''))} /><span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-400">H</span></div>
              </label>
            </div>
            {dimError && <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400"><TriangleAlert className="h-3 w-3" />{dimError}</p>}
            {!dimError && stretched && <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">Aspect differs from the tile ({W}×{H}) — the tile will be stretched but remains seamless.</p>}
          </div>

          {(format === 'jpg' || format === 'webp') && (
            <Slider label="Quality" value={quality} min={50} max={100} format={(v) => `${v}%`} onChange={setQuality} />
          )}

          <div>
            <div className="label mb-2">Background</div>
            <Segmented label="Export background" value={bgMode} onChange={setBgMode}
              options={[{ value: 'current', label: 'Current' }, { value: 'transparent', label: 'Transparent' }]} />
            {jpgFlatten && <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">JPG doesn’t support transparency — it will be flattened onto white.</p>}
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-ink-100 px-5 py-4 dark:border-ink-800 sm:flex-row sm:justify-end">
        <Button size="lg" onClick={copy} disabled={!!busy || !!dimError}>
          {busy === 'copy' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCopy className="h-4 w-4" />} Copy to Clipboard
        </Button>
        <Button size="lg" variant="primary" onClick={download} disabled={!!busy || !!dimError}>
          {busy === 'download' ? <Loader2 className="h-4 w-4 animate-spin" /> : busy === null ? <Download className="h-4 w-4" /> : <Check className="h-4 w-4" />} Download Pattern
        </Button>
      </div>
    </Modal>
  );
}
