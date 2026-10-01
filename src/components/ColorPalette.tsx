import { memo } from 'react';
import { Plus, Shuffle, Sparkles, Trash2 } from 'lucide-react';
import type { PatternState } from '../types/pattern';
import type { PatternActions } from '../hooks/usePattern';
import { PALETTES } from '../data/palettes';
import { randomPalette } from '../utils/colors';
import { ColorInput } from './ColorInput';
import { Button, IconButton, Segmented, cx } from './ui';
import { useToast } from './Toast';

const MAX_COLORS = 8;

export const ColorPalette = memo(function ColorPalette({ state, actions }: { state: PatternState; actions: PatternActions }) {
  const toast = useToast();
  const pal = state.palette;
  const setAt = (i: number, hex: string, live?: boolean) => {
    const next = [...pal]; next[i] = hex;
    actions.setPalette(next, live ? `pal-${i}` : undefined);
  };
  const matching = PALETTES.find((p) => p.colors.join() === pal.join())?.id;
  return (
    <div className="space-y-3">
      <ul className="space-y-1.5">
        {pal.map((c, i) => (
          <li key={i} className="group flex items-center gap-1.5 animate-fade-in">
            <ColorInput value={c} label={`Palette colour ${i + 1}`} onChange={(hex, live) => setAt(i, hex, live)} onCommitError={(m) => toast.show('Invalid colour', 'error', m)} />
            <IconButton label="Delete colour" size="sm" disabled={pal.length <= 1} onClick={() => actions.setPalette(pal.filter((_, j) => j !== i))} tooltipSide="top"
              className="opacity-60 group-hover:opacity-100">
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" disabled={pal.length >= MAX_COLORS} onClick={() => actions.setPalette([...pal, randomPalette(Math.random, 1)[0]])}><Plus className="h-3.5 w-3.5" /> Add color</Button>
        <Button size="sm" onClick={() => actions.setPalette(randomPalette(Math.random, Math.max(3, pal.length)))}><Sparkles className="h-3.5 w-3.5" /> Randomize</Button>
        <Button size="sm" disabled={pal.length < 2} onClick={() => { actions.shuffleColors(); toast.show('Colors shuffled'); }}><Shuffle className="h-3.5 w-3.5" /> Shuffle colors</Button>
      </div>
      <div>
        <div className="mb-1.5 text-[11px] font-medium text-ink-500 dark:text-ink-400">Color assignment</div>
        <Segmented size="sm" label="Color assignment" value={state.settings.colorMode} onChange={(v) => actions.updateSettings({ colorMode: v })}
          options={[{ value: 'mixed', label: 'Mixed', title: 'Each motif picks a random palette colour' }, { value: 'byMotif', label: 'Per motif', title: 'Each motif type keeps a consistent colour' }]} />
      </div>
      <div>
        <div className="mb-1.5 text-[11px] font-medium text-ink-500 dark:text-ink-400">Preset palettes</div>
        <div className="grid grid-cols-2 gap-1.5">
          {PALETTES.filter((p) => p.id !== 'meadow').map((p) => (
            <button key={p.id} type="button" onClick={() => actions.setPalette([...p.colors])} aria-pressed={matching === p.id}
              className={cx('group rounded-lg border p-1.5 text-left transition hover:-translate-y-px', matching === p.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-ink-200/80 hover:border-ink-300 dark:border-ink-800 dark:hover:border-ink-600')}>
              <div className="flex h-4 overflow-hidden rounded">
                {p.colors.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
              </div>
              <div className="mt-1 text-[11px] font-medium text-ink-600 dark:text-ink-300">{p.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
