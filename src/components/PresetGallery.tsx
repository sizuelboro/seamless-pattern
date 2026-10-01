import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { GALLERY_PRESETS, stateFromPreset, type PresetDef } from '../data/presets';
import { useThumbnail } from '../hooks/useThumbnail';
import { cx } from './ui';

export const PresetCard = memo(function PresetCard({ preset, onUse, compact }: { preset: PresetDef; onUse: (p: PresetDef) => void; compact?: boolean }) {
  const url = useThumbnail(`preset:${preset.id}`, () => stateFromPreset(preset, { tileWidth: 1024, tileHeight: 1024 }), compact ? 200 : 360, compact ? 2 : 2);
  return (
    <button type="button" onClick={() => onUse(preset)} aria-label={`Use preset ${preset.name}`}
      className={cx('group overflow-hidden rounded-xl border border-ink-200/80 bg-white text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-float dark:border-ink-800 dark:bg-ink-900 dark:hover:border-ink-600')}>
      <div className="relative aspect-square overflow-hidden" style={{ background: preset.background.color }}>
        {url && <img src={url} alt="" className="h-full w-full animate-fade-in object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
        {!compact && (
          <span className="absolute bottom-2 right-2 flex translate-y-1 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink-900 opacity-0 shadow transition-all group-hover:translate-y-0 group-hover:opacity-100">
            Use preset <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>
      <div className={compact ? 'px-2 py-1.5' : 'px-3 py-2.5'}>
        <div className={cx('font-semibold text-ink-900 dark:text-white', compact ? 'truncate text-[11px]' : 'text-[13px]')}>{preset.name}</div>
        {!compact && <div className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{preset.description}</div>}
      </div>
    </button>
  );
});

export function PresetGallery({ onUse }: { onUse: (p: PresetDef) => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-ink-900 dark:text-white">Presets</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Start from a curated seamless pattern, then make it yours.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {GALLERY_PRESETS.map((p) => <PresetCard key={p.id} preset={p} onUse={onUse} />)}
      </div>
    </div>
  );
}
