import { memo, useEffect, useState } from 'react';
import { Dices, RotateCw } from 'lucide-react';
import type { GenerationSettings, RotationMode } from '../types/pattern';
import { LAYOUT_OPTIONS } from '../engine/patternGenerator';
import { randomSeed } from '../engine/random';
import { LayoutIcon } from './LayoutIcon';
import { Segmented, Slider, cx } from './ui';

type Update = (patch: Partial<GenerationSettings>, coalesce?: string) => void;

export const LayoutModes = memo(function LayoutModes({ value, stripeDirection, onChange, s, palette }: { value: GenerationSettings['layout']; stripeDirection: GenerationSettings['stripeDirection']; onChange: Update; s?: GenerationSettings; palette?: string[] }) {
  return (
    <div className="space-y-2.5">
      <div role="radiogroup" aria-label="Layout mode" className="grid grid-cols-5 gap-1.5">
        {LAYOUT_OPTIONS.map((l) => (
          <button key={l.id} type="button" role="radio" aria-checked={value === l.id} title={`${l.label} — ${l.hint}`} onClick={() => onChange({ layout: l.id })}
            className={cx('flex flex-col items-center gap-0.5 rounded-lg border py-1.5 transition-all duration-150',
              value === l.id ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200' : 'border-ink-200/80 text-ink-500 hover:border-ink-300 hover:text-ink-800 dark:border-ink-800 dark:text-ink-400 dark:hover:border-ink-600 dark:hover:text-ink-100')}>
            <LayoutIcon mode={l.id} className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">{l.label}</span>
          </button>
        ))}
      </div>
      {value === 'stripe' && (
        <Segmented label="Stripe direction" value={stripeDirection} onChange={(v) => onChange({ stripeDirection: v })}
          options={[{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }]} />
      )}
      {value === 'vine' && s && (
        <div className="space-y-3 rounded-lg border border-ink-200/80 p-2.5 dark:border-ink-800">
          <Slider label="Stem thickness" value={s.vineWidth ?? 40} min={0} max={100} onChange={(v) => onChange({ vineWidth: v }, 'vineWidth')} hint="0 hides the vine stems" />
          <Slider label="Curl" value={s.vineCurl ?? 50} min={0} max={100} onChange={(v) => onChange({ vineCurl: v }, 'vineCurl')} hint="How much the stems bow and curl into tendrils" />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-ink-600 dark:text-ink-300">Stem colour</span>
            <div role="radiogroup" aria-label="Stem colour" className="flex flex-wrap justify-end gap-1">
              <button type="button" role="radio" aria-checked={(s.vineColor ?? -1) < 0} title="Auto (dark ink)" onClick={() => onChange({ vineColor: -1 })}
                className={cx('flex h-6 items-center rounded-md border px-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-600 transition dark:text-ink-300', (s.vineColor ?? -1) < 0 ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-ink-200 dark:border-ink-700')}>Auto</button>
              {(palette ?? []).map((c, i) => (
                <button key={i} type="button" role="radio" aria-checked={s.vineColor === i} title={c} onClick={() => onChange({ vineColor: i })}
                  className={cx('h-6 w-6 rounded-md border transition', s.vineColor === i ? 'border-white ring-2 ring-brand-500' : 'border-black/10 hover:scale-110')} style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const AdjustControls = memo(function AdjustControls({ s, onChange }: { s: GenerationSettings; onChange: Update }) {
  return (
    <div className="space-y-3.5">
      <Slider label="Density" value={s.density} min={10} max={100} format={(v) => `${v}%`} onChange={(v) => onChange({ density: v }, 'density')} hint="How many motifs are placed" />
      <Slider label="Motif scale" value={s.scale} min={10} max={300} format={(v) => `${v}%`} onChange={(v) => onChange({ scale: v }, 'scale')} />
      <Slider label="Spacing" value={s.spacing} min={0} max={300} format={(v) => `${v}`} onChange={(v) => onChange({ spacing: v }, 'spacing')} hint="Extra space between motifs" />
      <Slider label="Variation" value={s.variation} min={0} max={100} format={(v) => `${v}`} onChange={(v) => onChange({ variation: v }, 'variation')} hint="Random size and rotation variation" />
      <Slider label="Opacity" value={s.opacity} min={20} max={100} format={(v) => `${v}%`} onChange={(v) => onChange({ opacity: v }, 'opacity')} />
    </div>
  );
});

const ROTATION_OPTIONS: { value: RotationMode; label: string }[] = [
  { value: 'random', label: 'Random' }, { value: '0', label: '0°' }, { value: '45', label: '45°' },
  { value: '90', label: '90°' }, { value: '180', label: '180°' }, { value: 'custom', label: 'Range' },
];

export const RotationControls = memo(function RotationControls({ s, onChange }: { s: GenerationSettings; onChange: Update }) {
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Rotation" className="grid grid-cols-6 gap-1">
        {ROTATION_OPTIONS.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={s.rotationMode === o.value} onClick={() => onChange({ rotationMode: o.value })}
            title={o.value === 'custom' ? 'Custom range' : o.value === 'random' ? 'Random 0°–360°' : `${o.label} (± variation)`}
            className={cx('h-7 rounded-md text-[11px] font-medium transition', s.rotationMode === o.value ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700')}>
            {o.label}
          </button>
        ))}
      </div>
      {s.rotationMode === 'random' && <p className="text-[11px] text-ink-500 dark:text-ink-400">Each motif gets a random angle between 0° and 360°.</p>}
      {s.rotationMode === 'custom' && (
        <div className="space-y-3 rounded-lg bg-ink-50 p-2.5 dark:bg-ink-850">
          <Slider label="From" value={s.rotationMin} min={-180} max={180} format={(v) => `${v}°`} onChange={(v) => onChange({ rotationMin: v }, 'rotmin')} />
          <Slider label="To" value={s.rotationMax} min={-180} max={180} format={(v) => `${v}°`} onChange={(v) => onChange({ rotationMax: v }, 'rotmax')} />
        </div>
      )}
    </div>
  );
});

export const SeedControl = memo(function SeedControl({ seed, onChange, onRegenerate, edited }: { seed: number; onChange: Update; onRegenerate: () => void; edited: boolean }) {
  const [text, setText] = useState(String(seed));
  useEffect(() => setText(String(seed)), [seed]);
  const commit = () => {
    const v = parseInt(text.replace(/\D/g, ''), 10);
    if (Number.isFinite(v) && v >= 0) onChange({ seed: v % 10_000_000 }); else setText(String(seed));
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-ink-400">Seed:</span>
          <input className="input pl-11 font-mono tabular-nums" inputMode="numeric" aria-label="Random seed" value={text}
            onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
        </label>
        <button type="button" onClick={() => onChange({ seed: randomSeed() })} title="New random seed"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 text-xs font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50 active:scale-95 dark:border-ink-700 dark:bg-ink-850 dark:text-ink-200 dark:hover:bg-ink-800">
          <Dices className="h-3.5 w-3.5" /> Randomize
        </button>
      </div>
      {edited && (
        <button type="button" onClick={onRegenerate} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand-300 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/30">
          <RotateCw className="h-3.5 w-3.5" /> Regenerate pattern (keeps locked motifs)
        </button>
      )}
    </div>
  );
});

const TILE_PRESETS = [512, 1024, 2048, 4096];
export const TileSizeControl = memo(function TileSizeControl({ w, h, onChange }: { w: number; h: number; onChange: Update }) {
  const [tw, setTw] = useState(String(w));
  const [th, setTh] = useState(String(h));
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { setTw(String(w)); setTh(String(h)); }, [w, h]);
  const commit = () => {
    const nw = parseInt(tw, 10), nh = parseInt(th, 10);
    if (!Number.isFinite(nw) || !Number.isFinite(nh) || nw < 64 || nh < 64 || nw > 8192 || nh > 8192) {
      setErr('Tile size must be between 64 and 8192 px.');
      setTw(String(w)); setTh(String(h));
      return;
    }
    setErr(null);
    if (nw !== w || nh !== h) onChange({ tileWidth: nw, tileHeight: nh });
  };
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink-700 dark:text-ink-200">Tile</span>
        <span className="font-mono text-xs tabular-nums text-ink-500">{w} × {h} px</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {TILE_PRESETS.map((p) => (
          <button key={p} type="button" aria-pressed={w === p && h === p} onClick={() => { setErr(null); onChange({ tileWidth: p, tileHeight: p }); }}
            className={cx('h-7 rounded-md text-[11px] font-medium tabular-nums transition', w === p && h === p ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700')}>
            {p}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input className="input text-center font-mono tabular-nums" aria-label="Tile width" inputMode="numeric" value={tw} onChange={(e) => setTw(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} />
        <span className="text-xs text-ink-400">×</span>
        <input className="input text-center font-mono tabular-nums" aria-label="Tile height" inputMode="numeric" value={th} onChange={(e) => setTh(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} />
      </div>
      {err && <p role="alert" className="text-[11px] text-rose-600 dark:text-rose-400">{err}</p>}
    </div>
  );
});
