import { memo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { MOTIF_GROUPS, MOTIF_MAP } from '../data/motifs';
import { MotifIcon } from './MotifIcon';
import { cx } from './ui';

interface Props {
  selected: string[];
  palette: string[];
  onToggle: (type: string) => void;
  onClear: () => void;
}

export const MotifLibrary = memo(function MotifLibrary({ selected, palette, onToggle, onClear }: Props) {
  const [group, setGroup] = useState(MOTIF_GROUPS[0].id);
  const current = MOTIF_GROUPS.find((g) => g.id === group) ?? MOTIF_GROUPS[0];
  return (
    <div className="space-y-2.5">
      <div className="flex min-h-[28px] flex-wrap gap-1">
        {selected.length === 0 && (
          <p className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-200">
            No motifs selected — pick at least one below. Showing dots for now.
          </p>
        )}
        {selected.map((id, i) => (
          <button key={id} type="button" onClick={() => onToggle(id)} aria-label={`Remove ${MOTIF_MAP[id]?.name ?? id}`}
            className="group flex h-7 items-center gap-1 rounded-full border border-ink-200 bg-white py-0.5 pl-0.5 pr-1.5 text-[11px] font-medium text-ink-700 transition hover:border-rose-300 hover:bg-rose-50 dark:border-ink-700 dark:bg-ink-850 dark:text-ink-200 dark:hover:border-rose-800 dark:hover:bg-rose-950/40">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-50 dark:bg-ink-800"><MotifIcon type={id} palette={palette} colorIndex={i} className="h-5 w-5" /></span>
            {MOTIF_MAP[id]?.name ?? id}
            <X className="h-3 w-3 text-ink-400 group-hover:text-rose-500" />
          </button>
        ))}
        {selected.length > 1 && <button type="button" onClick={onClear} className="h-7 px-1.5 text-[11px] font-medium text-ink-400 hover:text-ink-700 dark:hover:text-ink-200">Clear</button>}
      </div>
      <div className="scroll-thin -mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Motif groups">
        {MOTIF_GROUPS.map((g) => (
          <button key={g.id} type="button" role="tab" aria-selected={g.id === group} onClick={() => setGroup(g.id)}
            className={cx('h-6 shrink-0 rounded-md px-2 text-[11px] font-medium transition', g.id === group ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800')}>
            {g.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5" role="group" aria-label={`${current.label} motifs`}>
        {current.motifs.map((id) => {
          const on = selected.includes(id);
          const m = MOTIF_MAP[id];
          return (
            <button key={id} type="button" aria-pressed={on} onClick={() => onToggle(id)} title={m.name}
              className={cx('relative flex aspect-square items-center justify-center rounded-lg border transition-all duration-150 hover:scale-[1.04]',
                on ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-ink-200/80 bg-ink-50/60 hover:border-ink-300 dark:border-ink-800 dark:bg-ink-850 dark:hover:border-ink-600')}>
              <MotifIcon type={id} palette={palette} className="h-[70%] w-[70%]" />
              <span className="sr-only">{m.name}</span>
              {on && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white shadow"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
});
