import { memo, useEffect, useRef } from 'react';
import { Ban, Dices, Shapes } from 'lucide-react';
import type { GeoSettings, GeoStyle, PatternState } from '../types/pattern';
import type { PatternActions } from '../hooks/usePattern';
import { DEFAULT_GEO, GEO_ACCENTS, GEO_MAP, GEO_STYLES, buildGeo, drawGeoOps, geoGrid } from '../engine/geoPattern';
import { Button, Slider, Toggle, cx } from './ui';

const THUMB = 52;

/** Live mini preview of a geometric style in the current palette. */
const GeoThumb = memo(function GeoThumb({ style, palette, bg, colors }: { style: GeoStyle; palette: string[]; bg: string; colors: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = THUMB * dpr; c.height = THUMB * dpr;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const d = GEO_MAP[style].defaults;
    const g: GeoSettings = { ...DEFAULT_GEO, ...d, style, enabled: true, colors, repeat: Math.max(2, Math.round((d.repeat ?? 6) / 2.5)), outline: style === 'plaid' || style === 'scallop' };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, THUMB, THUMB);
    drawGeoOps(ctx, buildGeo(g, palette, THUMB, THUMB));
  }, [style, palette, bg, colors]);
  return <canvas ref={ref} aria-hidden="true" className="h-[52px] w-[52px] rounded-md" style={{ width: THUMB, height: THUMB }} />;
});

function SlotPicker({ label, value, palette, allowBg, bg, onChange }: { label: string; value: number; palette: string[]; allowBg: boolean; bg: string; onChange: (i: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="w-20 shrink-0 text-[12px] font-medium text-ink-600 dark:text-ink-300">{label}</span>
      <div role="radiogroup" aria-label={`${label} colour`} className="flex flex-wrap justify-end gap-1">
        {allowBg && (
          <button type="button" role="radio" aria-checked={value === -1} title="Use background" onClick={() => onChange(-1)}
            className={cx('flex h-6 items-center rounded-md border px-1.5 text-[10px] font-semibold uppercase tracking-wide transition', value === -1 ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-ink-200 dark:border-ink-700')}
            style={{ background: bg, color: '#555' }}>BG</button>
        )}
        {palette.map((c, i) => (
          <button key={i} type="button" role="radio" aria-checked={value === i} title={c} onClick={() => onChange(i)}
            className={cx('h-6 w-6 rounded-md border transition', value === i ? 'border-white ring-2 ring-brand-500' : 'border-black/10 hover:scale-110')}
            style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

const HAJW_CENTRES = [
  { id: 'eye', label: 'Eye' }, { id: 'rosette', label: 'Rosette' }, { id: 'oval', label: 'Oval' },
  { id: 'diamonds', label: 'Diamonds' }, { id: 'zigzag', label: 'Zigzag' }, { id: 'jaali', label: 'Jaali' },
] as const;
const HAJW_HILLS = [
  { id: 'herringbone', label: 'Herringbone' }, { id: 'jaali', label: 'Jaali net' }, { id: 'leaf', label: 'Bold leaf' }, { id: 'dotted', label: 'Dotted' },
] as const;

export const GeoPanel = memo(function GeoPanel({ state, actions }: { state: PatternState; actions: PatternActions }) {
  const g = state.geo ?? DEFAULT_GEO;
  const meta = GEO_MAP[g.style];
  const bg = state.background.type === 'transparent' ? '#FFFFFF' : state.background.color;
  const W = state.settings.tileWidth, H = state.settings.tileHeight;
  const grid = geoGrid(g, W, H);
  const set = actions.setGeo;
  const showMotifs = state.showMotifs !== false;
  // Turning the base off must never leave an empty canvas.
  const removeBase = () => { set({ enabled: false }); if (!showMotifs) actions.setShowMotifs(true); };

  if (!g.enabled) {
    return (
      <div className="space-y-2.5">
        <p className="text-[12px] leading-relaxed text-ink-500 dark:text-ink-400">Stripes, checks, gingham, plaid, harlequin and more — drawn under your motifs and always seamless.</p>
        <div className="grid grid-cols-4 gap-1.5">
          {GEO_STYLES.slice(0, 8).map((s) => (
            <button key={s.id} type="button" onClick={() => actions.setGeoStyle(s.id)} title={s.hint}
              className="flex flex-col items-center gap-1 rounded-lg border border-ink-200/80 p-1 text-[10px] font-medium text-ink-600 transition hover:border-brand-400 dark:border-ink-800 dark:text-ink-300">
              <GeoThumb style={s.id} palette={state.palette} bg={bg} colors={g.colors} />
              {s.name}
            </button>
          ))}
        </div>
        <Button className="w-full" onClick={() => actions.setGeo({ enabled: true })}><Shapes className="h-3.5 w-3.5" /> Add geometric base</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div role="radiogroup" aria-label="Geometric style" className="grid grid-cols-4 gap-1.5">
        <button type="button" role="radio" aria-checked={false} title="No geometric base — motifs only" onClick={removeBase}
          className="flex flex-col items-center gap-1 rounded-lg border border-ink-200/80 p-1 text-[10px] font-medium text-ink-600 transition hover:border-ink-300 dark:border-ink-800 dark:text-ink-300">
          <span aria-hidden="true" className="flex h-[52px] w-[52px] items-center justify-center rounded-md border border-dashed border-ink-300 dark:border-ink-600">
            <Ban className="h-5 w-5 text-ink-400" />
          </span>
          None
        </button>
        {GEO_STYLES.map((s) => (
          <button key={s.id} type="button" role="radio" aria-checked={g.style === s.id} onClick={() => actions.setGeoStyle(s.id)} title={s.hint}
            className={cx('flex flex-col items-center gap-1 rounded-lg border p-1 text-[10px] font-medium transition',
              g.style === s.id ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200' : 'border-ink-200/80 text-ink-600 hover:border-ink-300 dark:border-ink-800 dark:text-ink-300')}>
            <GeoThumb style={s.id} palette={state.palette} bg={bg} colors={g.colors} />
            {s.name}
          </button>
        ))}
      </div>

      <Slider label="Repeats across" value={g.repeat} min={1} max={32} onChange={(v) => set({ repeat: v }, 'geo-repeat')}
        format={(v) => `${v} × ${grid.rows}`} hint="Whole cells per tile — keeps the layer seamless" />
      <Slider label={g.style === 'hajw' ? 'Band height' : 'Cell ratio'} value={g.aspect} min={g.style === 'hajw' ? 1 : 0.25} max={g.style === 'hajw' ? 10 : 6} step={0.05} onChange={(v) => set({ aspect: v }, 'geo-aspect')}
        format={(v) => `1 : ${v.toFixed(2)}`} hint={g.style === 'hajw' ? 'One band per tile — taller fills more of the tile' : 'Stretch cells taller or wider'} />
      <Slider label="Weight" value={g.weight} min={5} max={100} onChange={(v) => set({ weight: v }, 'geo-weight')} format={(v) => `${v}%`} hint="Band width / shape size" />

      {(meta.outline || meta.rotate) && (
        <div className="space-y-2">
          {meta.outline && (
            <label className="flex items-center justify-between text-[13px] font-medium text-ink-700 dark:text-ink-200">
              {meta.outline}<Toggle checked={g.outline} onChange={(v) => set({ outline: v })} label={meta.outline} />
            </label>
          )}
          {meta.rotate && (
            <label className="flex items-center justify-between text-[13px] font-medium text-ink-700 dark:text-ink-200">
              {meta.rotate === 'mirror' ? 'Flip direction' : 'Rotate 90°'}<Toggle checked={g.rotate} onChange={(v) => set({ rotate: v })} label="Rotate" />
            </label>
          )}
        </div>
      )}

      {g.style === 'hajw' && ([
        ['Centre design', 'centre', HAJW_CENTRES, g.centre ?? 'eye'],
        ['Hill design', 'hills', HAJW_HILLS, g.hills ?? 'herringbone'],
      ] as const).map(([title, key, opts, cur]) => (
        <div key={key}>
          <div className="mb-1.5 text-[13px] font-medium text-ink-700 dark:text-ink-200">{title}</div>
          <div role="radiogroup" aria-label={title} className="grid grid-cols-3 gap-1">
            {opts.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={cur === o.id} onClick={() => set({ [key]: o.id })}
                className={cx('h-7 rounded-md text-[10px] font-medium transition', cur === o.id ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300')}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {meta.accent && (
        <div>
          <div className="mb-1.5 text-[13px] font-medium text-ink-700 dark:text-ink-200">Accent</div>
          <div role="radiogroup" aria-label="Accent" className="grid grid-cols-6 gap-1">
            {GEO_ACCENTS.map((a) => (
              <button key={a.id} type="button" role="radio" aria-checked={g.accent === a.id} onClick={() => set({ accent: a.id })}
                className={cx('h-7 rounded-md text-[10px] font-medium transition', g.accent === a.id ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300')}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="text-[13px] font-medium text-ink-700 dark:text-ink-200">Colours</div>
        {meta.roles.filter(([slot]) => slot !== 3 || !meta.accent || g.accent !== 'none' || g.style === 'plaid')
          .filter(([slot]) => slot !== 4 || g.outline)
          .map(([slot, label]) => (
            <SlotPicker key={slot} label={label} value={g.colors[slot] ?? 0} palette={state.palette} allowBg={slot === 0} bg={bg}
              onChange={(i) => { const colors = [...g.colors]; colors[slot] = i; set({ colors }); }} />
          ))}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-ink-50 px-2.5 py-2 dark:bg-ink-800/60">
        <span className="text-[13px] font-medium text-ink-700 dark:text-ink-200">Show motifs on top</span>
        <Toggle checked={showMotifs} onChange={actions.setShowMotifs} label="Show motifs on top" />
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={actions.randomizeGeo}><Dices className="h-3.5 w-3.5" /> Surprise me</Button>
        <Button variant="ghost" onClick={removeBase}>Remove</Button>
      </div>
    </div>
  );
});
