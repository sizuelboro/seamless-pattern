import { memo, useMemo, useState, type ReactNode } from 'react';
import { Dices, Download, FileCode2, RotateCcw, Wand2 } from 'lucide-react';
import type { BorderStyle, FrameColors, FrameFont, FrameSettings, Ornament } from '../types/frame';
import { FONT_STACK, FRAME_SHAPES, FRAME_SHAPE_IDS, buildFrame, frameToPng, frameToSvg } from '../engine/frameEngine';
import { DEFAULT_FRAME, FRAME_PRESETS, FRAME_SIZES, colorsFromPalette } from '../data/frames';
import { PALETTES } from '../data/palettes';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { downloadBlob, slugify, todayStamp } from '../utils/download';
import { useToast } from './Toast';
import { ColorInput } from './ColorInput';
import { Button, Section, Segmented, Slider, Toggle, cx } from './ui';

const BORDER_STYLES: { id: BorderStyle; label: string }[] = [
  { id: 'checks', label: 'Checks' }, { id: 'blocks', label: 'Blocks' }, { id: 'diamonds', label: 'Diamonds' },
  { id: 'dots', label: 'Dots' }, { id: 'scallop', label: 'Scallop' }, { id: 'bunting', label: 'Bunting' }, { id: 'stripes', label: 'Stripes' },
];
const ORNAMENTS: { id: Ornament; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'sparkle', label: 'Sparkle' }, { id: 'star', label: 'Star' }, { id: 'dot', label: 'Dot' }, { id: 'rule', label: 'Rule' },
];
const COLOR_ROLES: { key: keyof FrameColors; label: string; mode: 'label' | 'border' | 'both' }[] = [
  { key: 'fill', label: 'Fill', mode: 'both' }, { key: 'outline', label: 'Outline', mode: 'both' }, { key: 'inner', label: 'Inner line', mode: 'both' },
  { key: 'text', label: 'Text', mode: 'both' }, { key: 'shadow', label: 'Shadow', mode: 'both' }, { key: 'accent', label: 'Accent', mode: 'both' },
  { key: 'page', label: 'Page', mode: 'border' }, { key: 'band', label: 'Band', mode: 'border' }, { key: 'band2', label: 'Band 2', mode: 'border' },
];

const Svg = memo(function Svg({ f, className }: { f: FrameSettings; className?: string }) {
  const svg = useMemo(() => frameToSvg(buildFrame(f), { width: 0, height: 0 }).replace('width="0" height="0"', 'width="100%" height="100%" preserveAspectRatio="xMidYMid meet"'), [f]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
});

function Chip({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button type="button" role="radio" aria-checked={active} title={title} onClick={onClick}
      className={cx('h-7 rounded-md px-2 text-[11px] font-medium transition', active ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700')}>
      {children}
    </button>
  );
}

export function FramesView({ patternPalette }: { patternPalette: string[] }) {
  const [stored, setStored] = useLocalStorage<FrameSettings>('patternforge:frame', DEFAULT_FRAME);
  const f: FrameSettings = useMemo(() => ({ ...DEFAULT_FRAME, ...stored, border: { ...DEFAULT_FRAME.border, ...stored.border }, colors: { ...DEFAULT_FRAME.colors, ...stored.colors } }), [stored]);
  const set = (patch: Partial<FrameSettings>) => setStored((p) => ({ ...DEFAULT_FRAME, ...p, ...patch }));
  const setBorder = (patch: Partial<FrameSettings['border']>) => set({ border: { ...f.border, ...patch } });
  const setColor = (key: keyof FrameColors, v: string) => set({ colors: { ...f.colors, [key]: v } });
  const toast = useToast();
  const [scale, setScale] = useState(2);
  const [transparent, setTransparent] = useState(true);
  const [busy, setBusy] = useState(false);
  const shape = FRAME_SHAPES[f.shape];
  const showLabel = f.mode === 'label' || f.border.label;
  const fileBase = `patternforge-frame-${slugify(f.title.replace(/\n/g, ' ') || f.shape)}-${todayStamp()}`;

  const exportPng = async () => {
    const W = Math.round(f.width * scale), H = Math.round(f.height * scale);
    if (W * H > 64e6 || W > 12000 || H > 12000) { toast.show('That size is too large', 'error', `${W} × ${H} px — choose a smaller scale.`); return; }
    setBusy(true);
    try {
      const blob = await frameToPng(buildFrame(f), scale, f.mode === 'label' && !transparent ? '#FFFFFF' : undefined);
      downloadBlob(blob, `${fileBase}-${W}x${H}.png`);
      toast.show('PNG downloaded', 'success', `${W} × ${H} px`);
    } catch { toast.show('Export failed', 'error', 'Your browser could not render this size. Try a smaller scale.'); }
    finally { setBusy(false); }
  };
  const exportSvg = () => {
    const svg = frameToSvg(buildFrame(f));
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${fileBase}.svg`);
    toast.show('SVG downloaded', 'success', 'Text stays editable; it uses Google Fonts.');
  };
  const randomize = () => {
    const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    const s = pick(FRAME_SHAPE_IDS);
    const pal = pick(PALETTES).colors;
    set({ shape: s, ...FRAME_SHAPES[s].defaults, depth: r(10, 45), count: r(3, 10), doubleLine: Math.random() < 0.7, shadow: Math.random() < 0.5, ornament: pick(ORNAMENTS).id, colors: colorsFromPalette(pal), border: { ...f.border, style: pick(BORDER_STYLES).id, band: r(60, 130) } });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside aria-label="Frame controls" className="scroll-thin order-2 min-h-0 overflow-y-auto border-ink-200/80 bg-white dark:border-ink-800 dark:bg-ink-900 md:order-1 md:w-[320px] md:shrink-0 md:border-r">
        <Section title="Presets">
          <div className="grid grid-cols-3 gap-1.5">
            {FRAME_PRESETS.map((p) => {
              const ps: FrameSettings = { ...DEFAULT_FRAME, ...p.settings, border: { ...DEFAULT_FRAME.border, ...p.settings.border }, width: p.settings.width ?? (p.settings.mode === 'border' ? 1500 : 1200), height: p.settings.height ?? (p.settings.mode === 'border' ? 2100 : 800) };
              return (
                <button key={p.id} type="button" onClick={() => setStored(ps)} title={p.name}
                  className="flex flex-col items-center gap-1 rounded-lg border border-ink-200/80 p-1.5 text-[10px] font-medium text-ink-600 transition hover:border-brand-400 dark:border-ink-800 dark:text-ink-300">
                  <Svg f={ps} className="checker-bg h-12 w-full rounded" />
                  <span className="w-full truncate text-center">{p.name}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Type & size">
          <Segmented label="Frame type" value={f.mode} onChange={(mode) => {
            const size = mode === 'border' ? { width: 1500, height: 2100 } : { width: 1200, height: 800 };
            set({ mode, ...size });
          }} options={[{ value: 'label', label: 'Label frame' }, { value: 'border', label: 'Page border' }]} />
          <div role="radiogroup" aria-label="Size" className="flex flex-wrap gap-1">
            {FRAME_SIZES.filter((s) => s.mode === 'any' || s.mode === f.mode).map((s) => (
              <Chip key={s.label} active={f.width === s.w && f.height === s.h} onClick={() => set({ width: s.w, height: s.h })}>{s.label}</Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(['width', 'height'] as const).map((k) => (
              <label key={k} className="flex flex-1 items-center gap-1.5 text-[12px] text-ink-500">
                {k === 'width' ? 'W' : 'H'}
                <input type="number" min={200} max={6000} className="input h-8 font-mono tabular-nums" value={f[k]} aria-label={`Frame ${k} in pixels`}
                  onChange={(e) => { const v = Math.round(Number(e.target.value)); if (Number.isFinite(v) && v >= 200 && v <= 6000) set({ [k]: v } as Partial<FrameSettings>); }} />
              </label>
            ))}
          </div>
        </Section>

        {f.mode === 'border' && (
          <Section title="Border">
            <div role="radiogroup" aria-label="Border style" className="flex flex-wrap gap-1">
              {BORDER_STYLES.map((b) => <Chip key={b.id} active={f.border.style === b.id} onClick={() => setBorder({ style: b.id })}>{b.label}</Chip>)}
            </div>
            <Slider label="Band size" value={f.border.band} min={30} max={240} onChange={(v) => setBorder({ band: v })} format={(v) => `${v}px`} hint="Rounded so a whole number of units fits each side" />
            {([['innerLine', 'Inner line'], ['corners', 'Corner blocks'], ['label', 'Centre label']] as const).map(([k, l]) => (
              <label key={k} className="flex items-center justify-between text-[13px] font-medium text-ink-700 dark:text-ink-200">{l}<Toggle checked={f.border[k]} onChange={(v) => setBorder({ [k]: v })} label={l} /></label>
            ))}
          </Section>
        )}

        {showLabel && (
          <Section title="Shape">
            <div role="radiogroup" aria-label="Frame shape" className="grid grid-cols-4 gap-1.5">
              {FRAME_SHAPE_IDS.map((id) => {
                const ps: FrameSettings = { ...f, mode: 'label', shape: id, ...FRAME_SHAPES[id].defaults, width: 300, height: 200, stroke: 12, gap: 12, title: '', subtitle: '', ornament: 'none', shadow: false };
                return (
                  <button key={id} type="button" role="radio" aria-checked={f.shape === id} onClick={() => set({ shape: id, ...FRAME_SHAPES[id].defaults })}
                    className={cx('flex flex-col items-center gap-0.5 rounded-lg border p-1 text-[10px] font-medium transition', f.shape === id ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200' : 'border-ink-200/80 text-ink-600 hover:border-ink-300 dark:border-ink-800 dark:text-ink-300')}>
                    <Svg f={ps} className="h-9 w-full" />
                    {FRAME_SHAPES[id].name}
                  </button>
                );
              })}
            </div>
            {shape.edge !== 'plain' && <Slider label="Edge depth" value={f.depth} min={0} max={100} onChange={(v) => set({ depth: v })} />}
            {['wave', 'scallop', 'stamp', 'zigzag'].includes(shape.edge) && <Slider label="Bumps" value={f.count} min={2} max={24} onChange={(v) => set({ count: v })} />}
            {!shape.ellipse && shape.corner !== 'square' && <Slider label="Corner" value={f.corner} min={0} max={100} onChange={(v) => set({ corner: v })} />}
            <Slider label="Outline" value={f.stroke} min={0} max={40} onChange={(v) => set({ stroke: v })} format={(v) => `${v}px`} />
            <label className="flex items-center justify-between text-[13px] font-medium text-ink-700 dark:text-ink-200">Double line<Toggle checked={f.doubleLine} onChange={(v) => set({ doubleLine: v })} label="Double line" /></label>
            {f.doubleLine && <Slider label="Line gap" value={f.gap} min={4} max={60} onChange={(v) => set({ gap: v })} format={(v) => `${v}px`} />}
            <label className="flex items-center justify-between text-[13px] font-medium text-ink-700 dark:text-ink-200">Offset shadow<Toggle checked={f.shadow} onChange={(v) => set({ shadow: v })} label="Offset shadow" /></label>
          </Section>
        )}

        <Section title="Text">
          <textarea className="input min-h-[56px] resize-y py-1.5 leading-snug" rows={2} value={f.title} aria-label="Title (Enter for a new line)" placeholder="Title" onChange={(e) => set({ title: e.target.value.slice(0, 80) })} />
          {showLabel && <input className="input" value={f.subtitle} aria-label="Subtitle" placeholder="Subtitle (optional)" onChange={(e) => set({ subtitle: e.target.value.slice(0, 60) })} />}
          <div role="radiogroup" aria-label="Font" className="grid grid-cols-5 gap-1">
            {(Object.keys(FONT_STACK) as FrameFont[]).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={f.font === k} onClick={() => set({ font: k })} title={FONT_STACK[k].label}
                className={cx('h-9 rounded-md text-[15px] transition', f.font === k ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200')}
                style={{ fontFamily: FONT_STACK[k].family, fontWeight: FONT_STACK[k].weight, fontStyle: FONT_STACK[k].italic ? 'italic' : undefined }}>Aa</button>
            ))}
          </div>
          <Slider label="Text size" value={f.textSize} min={20} max={100} onChange={(v) => set({ textSize: v })} format={(v) => `${v}%`} hint="Text also shrinks automatically to fit" />
          <label className="flex items-center justify-between text-[13px] font-medium text-ink-700 dark:text-ink-200">Uppercase<Toggle checked={f.uppercase} onChange={(v) => set({ uppercase: v })} label="Uppercase" /></label>
          {showLabel && (
            <div>
              <div className="mb-1.5 text-[13px] font-medium text-ink-700 dark:text-ink-200">Ornament</div>
              <div role="radiogroup" aria-label="Ornament" className="flex flex-wrap gap-1">
                {ORNAMENTS.map((o) => <Chip key={o.id} active={f.ornament === o.id} onClick={() => set({ ornament: o.id })}>{o.label}</Chip>)}
              </div>
            </div>
          )}
        </Section>

        <Section title="Colours">
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => set({ colors: colorsFromPalette(patternPalette) })} title="Use the palette from the pattern generator"
              className="flex h-7 items-center gap-1 rounded-md border border-brand-300 px-1.5 text-[11px] font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-200 dark:hover:bg-brand-900/30">
              <Wand2 className="h-3 w-3" /> From pattern
            </button>
            {PALETTES.map((p) => (
              <button key={p.id} type="button" title={p.name} aria-label={`Apply ${p.name} palette`} onClick={() => set({ colors: colorsFromPalette(p.colors) })}
                className="flex h-7 overflow-hidden rounded-md ring-1 ring-black/10 transition hover:scale-105">
                {p.colors.slice(0, 5).map((c, i) => <span key={i} className="h-full w-2.5" style={{ background: c }} />)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {COLOR_ROLES.filter((r) => r.mode === 'both' || r.mode === f.mode).map((r) => (
              <div key={r.key} className="flex items-center gap-2">
                <ColorInput compact value={f.colors[r.key]} label={r.label} onChange={(v) => setColor(r.key, v)} />
                <span className="text-[12px] text-ink-600 dark:text-ink-300">{r.label}</span>
              </div>
            ))}
          </div>
        </Section>
      </aside>

      <main className="order-1 flex min-h-[46vh] flex-1 flex-col bg-ink-100/70 dark:bg-ink-950 md:order-2">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-200/80 bg-white/80 px-3 py-2 backdrop-blur dark:border-ink-800 dark:bg-ink-900/80">
          <div className="mr-auto text-[13px] font-semibold text-ink-800 dark:text-ink-100">
            {f.mode === 'label' ? 'Label frame' : 'Page border'} <span className="font-normal text-ink-500">· {f.width} × {f.height}px</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setStored(DEFAULT_FRAME)}><RotateCcw className="h-3.5 w-3.5" /> Reset</Button>
          <Button size="sm" onClick={randomize}><Dices className="h-3.5 w-3.5" /> Surprise me</Button>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
          <div className="checker-bg flex h-full max-h-[78vh] w-full items-center justify-center rounded-xl p-3 shadow-inner" style={{ aspectRatio: `${f.width} / ${f.height}`, maxWidth: `min(100%, calc(78vh * ${f.width / f.height}))` }}>
            <Svg f={f} className="h-full w-full" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-ink-200/80 bg-white px-3 py-2.5 dark:border-ink-800 dark:bg-ink-900">
          <span className="text-[12px] font-medium text-ink-500">Scale</span>
          <Segmented size="sm" label="Export scale" value={scale} onChange={setScale} options={[1, 2, 3, 4].map((v) => ({ value: v, label: `${v}×` }))} />
          <span className="font-mono text-[11px] tabular-nums text-ink-500">{Math.round(f.width * scale)} × {Math.round(f.height * scale)}</span>
          {f.mode === 'label' && (
            <label className="ml-1 flex items-center gap-1.5 text-[12px] font-medium text-ink-600 dark:text-ink-300"><Toggle checked={transparent} onChange={setTransparent} label="Transparent background" /> Transparent</label>
          )}
          <div className="ml-auto flex gap-2">
            <Button onClick={exportSvg}><FileCode2 className="h-3.5 w-3.5" /> SVG</Button>
            <Button variant="primary" onClick={exportPng} disabled={busy}><Download className="h-3.5 w-3.5" /> {busy ? 'Rendering…' : 'Download PNG'}</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
