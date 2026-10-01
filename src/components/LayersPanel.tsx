import { memo, useMemo } from 'react';
import { Eye, EyeOff, Lock, Square } from 'lucide-react';
import type { PatternState } from '../types/pattern';
import type { PatternActions } from '../hooks/usePattern';
import { MOTIF_MAP } from '../data/motifs';
import { MotifIcon } from './MotifIcon';
import { IconButton, cx } from './ui';

export const LayersPanel = memo(function LayersPanel({ state, actions, onSelect }: { state: PatternState; actions: PatternActions; onSelect: (id: string | null) => void }) {
  const groups = useMemo(() => {
    const m = new Map<string, { count: number; locked: number; first: string }>();
    for (const o of state.objects) {
      const g = m.get(o.type) ?? { count: 0, locked: 0, first: o.id };
      g.count++; if (o.locked) g.locked++;
      m.set(o.type, g);
    }
    return [...m.entries()].reverse();
  }, [state.objects]);
  const bgLabel = state.background.type === 'transparent' ? 'Transparent' : state.background.type === 'solid' ? state.background.color : `${state.background.type} gradient`;
  return (
    <ul className="space-y-0.5">
      {groups.map(([type, g]) => {
        const hidden = state.hiddenTypes.includes(type);
        return (
          <li key={type} className={cx('group flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink-50 dark:hover:bg-ink-850', hidden && 'opacity-50')}>
            <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => !hidden && onSelect(g.first)} title="Select a motif of this type">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-100 dark:bg-ink-800"><MotifIcon type={type} palette={state.palette} className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink-800 dark:text-ink-100">{MOTIF_MAP[type]?.name ?? type}</span>
              {g.locked > 0 && <span className="flex items-center gap-0.5 text-[10px] text-amber-600"><Lock className="h-3 w-3" />{g.locked}</span>}
              <span className="font-mono text-[11px] tabular-nums text-ink-400">{g.count}</span>
            </button>
            <IconButton size="sm" label={hidden ? 'Show layer' : 'Hide layer'} tooltipSide="top" onClick={() => actions.toggleHidden(type)}>
              {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </IconButton>
          </li>
        );
      })}
      <li className="flex items-center gap-2 rounded-lg px-1.5 py-1">
        <span className={cx('flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset ring-black/10 dark:ring-white/10', state.background.type === 'transparent' && 'checker-bg')}
          style={state.background.type === 'transparent' ? undefined : { background: state.background.color }}>
          {state.background.type === 'transparent' && <Square className="h-3 w-3 text-ink-400" />}
        </span>
        <span className="flex-1 text-[13px] text-ink-800 dark:text-ink-100">Background</span>
        <span className="font-mono text-[11px] uppercase text-ink-400">{bgLabel}</span>
      </li>
    </ul>
  );
});
