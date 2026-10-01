import { memo } from 'react';
import { Ban } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PALETTES } from '../data/palettes';
import type { CategoryId } from '../types/pattern';
import { MotifIcon } from './MotifIcon';
import { cx } from './ui';

const paletteOf = (id: string) => PALETTES.find((p) => p.id === id)?.colors ?? PALETTES[0].colors;

/** `none` = motifs hidden (only the background / geometric base shows). */
export const CategoryGrid = memo(function CategoryGrid({ value, onChange, none, onNone }: { value: CategoryId; onChange: (id: CategoryId) => void; none?: boolean; onNone?: () => void }) {
  return (
    <div role="radiogroup" aria-label="Pattern type" className="grid grid-cols-4 gap-1.5">
      {onNone && (
        <button type="button" role="radio" aria-checked={!!none} onClick={onNone} title="No motifs — only the background and geometric base"
          className={cx('group flex flex-col items-center gap-1 rounded-lg border p-1 pb-1.5 transition-all duration-150 hover:-translate-y-px',
            none ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-500 dark:bg-brand-900/25' : 'border-ink-200/80 hover:border-ink-300 dark:border-ink-800 dark:hover:border-ink-600')}>
          <div className="flex h-10 w-full items-center justify-center rounded-md border border-dashed border-ink-300 dark:border-ink-600">
            <Ban className="h-5 w-5 text-ink-400" />
          </div>
          <span className={cx('w-full truncate text-center text-[10.5px] font-medium', none ? 'text-brand-700 dark:text-brand-200' : 'text-ink-600 dark:text-ink-300')}>None</span>
        </button>
      )}
      {CATEGORIES.map((c) => {
        const pal = paletteOf(c.palette);
        const active = !none && c.id === value;
        return (
          <button key={c.id} type="button" role="radio" aria-checked={active} onClick={() => onChange(c.id)} title={c.name}
            className={cx('group flex flex-col items-center gap-1 rounded-lg border p-1 pb-1.5 transition-all duration-150 hover:-translate-y-px',
              active ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-500 dark:bg-brand-900/25' : 'border-ink-200/80 hover:border-ink-300 dark:border-ink-800 dark:hover:border-ink-600')}>
            <div className="relative h-10 w-full overflow-hidden rounded-md" style={{ background: c.background }}>
              <MotifIcon type={c.motifs[0]} palette={pal} className="absolute left-0.5 top-0.5 h-6 w-6" />
              <MotifIcon type={c.motifs[1] ?? c.motifs[0]} palette={pal} colorIndex={1} className="absolute bottom-0 right-0.5 h-5 w-5 rotate-12" />
              <MotifIcon type={c.motifs[2] ?? c.motifs[0]} palette={pal} colorIndex={2} className="absolute bottom-0.5 left-3 h-3.5 w-3.5 -rotate-12" />
            </div>
            <span className={cx('w-full truncate text-center text-[10.5px] font-medium', active ? 'text-brand-700 dark:text-brand-200' : 'text-ink-600 dark:text-ink-300')}>{c.name}</span>
          </button>
        );
      })}
    </div>
  );
});
