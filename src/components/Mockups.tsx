import { useEffect, useState, type CSSProperties } from 'react';
import { Shirt, Gift, NotebookPen, Smartphone, ShoppingBag, Sofa } from 'lucide-react';
import type { PatternState } from '../types/pattern';
import { renderTileDataUrl } from '../utils/canvas';
import { Slider, cx } from './ui';

type Surface = 'fabric' | 'wallpaper' | 'giftwrap' | 'notebook' | 'phone' | 'packaging';
const TABS: { id: Surface; label: string; icon: typeof Shirt }[] = [
  { id: 'fabric', label: 'Fabric', icon: Shirt }, { id: 'wallpaper', label: 'Wallpaper', icon: Sofa },
  { id: 'giftwrap', label: 'Gift Wrap', icon: Gift }, { id: 'notebook', label: 'Notebook', icon: NotebookPen },
  { id: 'phone', label: 'Phone Case', icon: Smartphone }, { id: 'packaging', label: 'Packaging', icon: ShoppingBag },
];

/** Generated preview surfaces using the current tile as a repeating texture. */
export function Mockups({ state }: { state: PatternState }) {
  const [surface, setSurface] = useState<Surface>('fabric');
  const [scale, setScale] = useState(30);
  const [url, setUrl] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setUrl(renderTileDataUrl(state, 512)), 120);
    return () => clearTimeout(t);
  }, [state]);
  const size = Math.round(40 + scale * 3.2);
  const ratio = state.settings.tileHeight / state.settings.tileWidth;
  const pat: CSSProperties = { backgroundImage: url ? `url(${url})` : undefined, backgroundSize: `${size}px ${size * ratio}px`, backgroundRepeat: 'repeat' };
  const small: CSSProperties = { ...pat, backgroundSize: `${size * 0.5}px ${size * 0.5 * ratio}px` };

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 pt-16">
        <div role="tablist" aria-label="Mockup surface" className="panel flex flex-wrap gap-0.5 rounded-xl p-1 shadow-panel">
          {TABS.map((t) => (
            <button key={t.id} role="tab" type="button" aria-selected={surface === t.id} onClick={() => setSurface(t.id)}
              className={cx('flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition', surface === t.id ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800')}>
              <t.icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="panel w-48 rounded-xl px-3 py-1.5 shadow-panel"><Slider label="Pattern scale" value={scale} min={0} max={100} format={(v) => `${v}%`} onChange={setScale} /></div>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden p-6">
        <div key={surface} className="animate-pop-in">
          {surface === 'fabric' && (
            <div className="relative h-[min(60vh,440px)] w-[min(70vw,380px)]">
              <div className="absolute inset-x-0 top-0 h-3 rounded-full bg-gradient-to-b from-ink-400 to-ink-600 shadow" />
              <div className="absolute inset-x-1 bottom-0 top-2 shadow-float" style={{ ...pat, clipPath: 'polygon(0 0,100% 0,100% 92%,88% 97%,75% 93%,62% 99%,50% 94%,36% 100%,24% 95%,12% 99%,0 94%)' }}>
                <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(90deg, rgba(0,0,0,.16) 0px, rgba(255,255,255,.10) 30px, rgba(0,0,0,.02) 52px, rgba(0,0,0,.18) 76px)' }} />
              </div>
            </div>
          )}
          {surface === 'wallpaper' && (
            <div className="relative h-[min(60vh,420px)] w-[min(80vw,620px)] overflow-hidden rounded-xl shadow-float">
              <div className="absolute inset-0" style={pat} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/25" />
              <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-b from-[#b08d6c] to-[#8a6a4d]" />
              <div className="absolute bottom-[14%] left-1/2 h-[28%] w-[52%] -translate-x-1/2">
                <div className="absolute inset-x-[6%] top-0 h-[55%] rounded-t-2xl bg-[#5b6b78] shadow-lg" />
                <div className="absolute inset-x-0 bottom-[12%] h-[45%] rounded-2xl bg-[#6b7c8a] shadow-xl" />
                <div className="absolute bottom-0 left-[8%] h-[14%] w-[4%] bg-[#3c3c3c]" /><div className="absolute bottom-0 right-[8%] h-[14%] w-[4%] bg-[#3c3c3c]" />
              </div>
              <div className="absolute right-[9%] top-[22%] h-[26%] w-[16%] rounded-sm border-[6px] border-white bg-[#efe9df] shadow-lg" />
            </div>
          )}
          {surface === 'giftwrap' && (
            <div className="relative h-[300px] w-[340px]" style={{ perspective: 900 }}>
              <div className="absolute left-1/2 top-10 h-[200px] w-[240px] -translate-x-1/2 rounded-md shadow-float" style={{ ...pat, transform: 'rotateX(10deg)' }}>
                <div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-rose-500/90 shadow" />
                <div className="absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 bg-rose-500/90 shadow" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/20" />
              </div>
              <div className="absolute left-1/2 top-[86px] -translate-x-1/2">
                <div className="absolute -left-12 -top-6 h-12 w-12 rotate-[-25deg] rounded-full border-[7px] border-rose-500" />
                <div className="absolute -top-6 left-0 h-12 w-12 rotate-[25deg] rounded-full border-[7px] border-rose-500" />
                <div className="absolute -left-3 -top-2 h-6 w-6 rounded-full bg-rose-600 shadow" />
              </div>
            </div>
          )}
          {surface === 'notebook' && (
            <div className="relative h-[min(58vh,400px)] w-[min(60vw,290px)] rounded-r-xl rounded-l-md shadow-float" style={pat}>
              <div className="absolute inset-y-0 left-0 w-5 bg-black/25" />
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="absolute -left-2 h-2.5 w-6 rounded-full bg-gradient-to-r from-ink-300 to-ink-500" style={{ top: `${6 + i * 8}%` }} />)}
              <div className="absolute left-1/2 top-[38%] w-[56%] -translate-x-1/2 rounded-md bg-white/95 px-3 py-2.5 text-center shadow">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">Notes</div>
                <div className="mt-1 truncate text-sm font-semibold text-ink-800">{state.name}</div>
              </div>
              <div className="absolute inset-0 rounded-r-xl bg-gradient-to-r from-black/10 via-white/5 to-black/15" />
            </div>
          )}
          {surface === 'phone' && (
            <div className="relative h-[min(60vh,440px)] w-[min(50vw,220px)] rounded-[38px] p-[6px] shadow-float ring-1 ring-black/10" style={pat}>
              <div className="absolute left-4 top-4 grid h-[82px] w-[82px] grid-cols-2 gap-1.5 rounded-[22px] bg-black/80 p-2 shadow-lg backdrop-blur">
                {[0, 1, 2].map((i) => <div key={i} className="rounded-full bg-gradient-to-br from-ink-600 to-ink-950 ring-2 ring-ink-700" />)}
                <div className="m-auto h-3 w-3 rounded-full bg-amber-100/80" />
              </div>
              <div className="absolute inset-0 rounded-[38px] bg-gradient-to-br from-white/25 via-transparent to-black/20" />
            </div>
          )}
          {surface === 'packaging' && (
            <div className="relative h-[360px] w-[300px]">
              <div className="absolute left-1/2 top-0 h-20 w-28 -translate-x-1/2 rounded-t-full border-[6px] border-b-0 border-ink-700/80" />
              <div className="absolute inset-x-0 bottom-0 top-14 rounded-md shadow-float" style={pat}>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-black/15 via-white/10 to-black/20" />
                <div className="absolute inset-x-0 top-0 h-6 bg-black/10" />
              </div>
              <div className="absolute -right-16 bottom-0 h-[140px] w-[110px] rounded shadow-xl" style={small}>
                <div className="absolute inset-0 rounded bg-gradient-to-br from-white/20 to-black/25" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
