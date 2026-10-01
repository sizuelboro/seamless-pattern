import { memo, useEffect, useRef, useState } from 'react';
import { ChevronDown, Grid2x2, Maximize, Minus, Plus, ScanLine } from 'lucide-react';
import type { Backdrop, RepeatMode, SeamReport } from '../types/pattern';
import { useZoom, viewStore } from '../hooks/viewStore';
import { IconButton, Toggle, cx } from './ui';

interface Props {
  repeat: RepeatMode;
  setRepeat: (r: RepeatMode) => void;
  showBoundary: boolean;
  setShowBoundary: (v: boolean) => void;
  seamCheck: boolean;
  setSeamCheck: (v: boolean) => void;
  seam: SeamReport | null;
  backdrop: Backdrop;
  setBackdrop: (b: Backdrop) => void;
  tileW: number;
  tileH: number;
}

export const REPEATS: { value: RepeatMode; label: string }[] = [
  { value: 1, label: '1×1' }, { value: 2, label: '2×2' }, { value: 3, label: '3×3' }, { value: 4, label: '4×4' }, { value: 'infinite', label: '∞' },
];

export function ZoomControls({ compact }: { compact?: boolean }) {
  const zoom = useZoom();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div ref={ref} className="relative flex items-center gap-0.5">
      <IconButton size="sm" label="Zoom out" shortcut="−" tooltipSide="top" onClick={() => viewStore.zoomBy(1 / 1.25)}><Minus className="h-3.5 w-3.5" /></IconButton>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex h-7 min-w-[64px] items-center justify-center gap-0.5 rounded-md px-1.5 font-mono text-xs tabular-nums text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800">
        {Math.round(zoom * 100)}%<ChevronDown className="h-3 w-3 text-ink-400" />
      </button>
      <IconButton size="sm" label="Zoom in" shortcut="+" tooltipSide="top" onClick={() => viewStore.zoomBy(1.25)}><Plus className="h-3.5 w-3.5" /></IconButton>
      {!compact && <IconButton size="sm" label="Fit to screen" shortcut="0" tooltipSide="top" onClick={() => viewStore.fit()}><Maximize className="h-3.5 w-3.5" /></IconButton>}
      {open && (
        <div role="menu" className="panel absolute bottom-full left-0 z-50 mb-2 w-36 animate-pop-in rounded-xl p-1 shadow-float">
          {[['Fit', 0], ['25%', 0.25], ['50%', 0.5], ['100%', 1], ['200%', 2], ['400%', 4]].map(([l, z]) => (
            <button key={l} role="menuitem" type="button" onClick={() => { if (z === 0) viewStore.fit(); else viewStore.setZoom(z as number); setOpen(false); }}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800">
              {l}{l === 'Fit' && <span className="text-ink-400">0</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const Sep = () => <span className="h-5 w-px bg-ink-200 dark:bg-ink-800" />;

export const CanvasFooter = memo(function CanvasFooter(p: Props) {
  return (
    <footer className="flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap border-t border-ink-200/80 bg-white px-3 text-xs dark:border-ink-800 dark:bg-ink-900">
      <ZoomControls />
      <Sep />
      <div className="flex items-center gap-2">
        <span className="hidden text-ink-500 2xl:inline">Preview</span>
        <div role="radiogroup" aria-label="Preview repeat" className="flex rounded-lg bg-ink-100 p-0.5 dark:bg-ink-800">
          {REPEATS.map((r) => (
            <button key={String(r.value)} type="button" role="radio" aria-checked={p.repeat === r.value} onClick={() => p.setRepeat(r.value)}
              title={r.value === 1 ? 'Tile preview' : r.value === 'infinite' ? 'Infinite preview' : `${r.label} repeat`}
              className={cx('h-6 rounded-md px-2 text-[11px] font-medium tabular-nums transition', p.repeat === r.value ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-600 dark:text-white' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100')}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <Sep />
      <label title="Show tile boundary" className="flex shrink-0 cursor-pointer items-center gap-2 text-ink-600 dark:text-ink-300">
        <Grid2x2 className="h-3.5 w-3.5 text-ink-400" /><span className="hidden 2xl:inline">Tile boundary</span>
        <Toggle checked={p.showBoundary} onChange={p.setShowBoundary} label="Show tile boundary" />
      </label>
      <label title="Seam check" className="flex shrink-0 cursor-pointer items-center gap-2 text-ink-600 dark:text-ink-300">
        <ScanLine className="h-3.5 w-3.5 text-ink-400" /><span className="hidden 2xl:inline">Seam check</span>
        <Toggle checked={p.seamCheck} onChange={p.setSeamCheck} label="Seam check" />
        {p.seamCheck && p.seam && (
          <span className={cx('rounded-full px-2 py-0.5 text-[11px] font-semibold', p.seam.ok ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300')}>
            {p.seam.ok ? '✓' : '⚠'}<span className="hidden lg:inline">{p.seam.ok ? ' Seamless' : ' Seams'}</span>
          </span>
        )}
      </label>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden font-mono text-[11px] tabular-nums text-ink-400 2xl:inline">Tile {p.tileW} × {p.tileH} px</span>
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Workspace background">
          <span className="hidden text-ink-500 2xl:inline">Background</span>
          {(['light', 'dark', 'checker'] as Backdrop[]).map((b) => (
            <button key={b} type="button" role="radio" aria-checked={p.backdrop === b} aria-label={`${b} workspace`} title={`${b[0].toUpperCase()}${b.slice(1)} workspace`} onClick={() => p.setBackdrop(b)}
              className={cx('h-5 w-5 rounded-full ring-1 ring-inset ring-black/15 transition hover:scale-110 dark:ring-white/20', p.backdrop === b && 'ring-2 ring-brand-500 ring-offset-1 ring-offset-white dark:ring-offset-ink-900',
                b === 'light' && 'bg-[#E9E9EC]', b === 'dark' && 'bg-[#141416]', b === 'checker' && 'checker-bg')} />
          ))}
        </div>
      </div>
    </footer>
  );
});
