import { Download, Eye, FolderOpen, Palette, SlidersHorizontal } from 'lucide-react';
import { cx } from './ui';

export type MobileTab = 'generate' | 'patterns' | 'colors' | 'preview' | 'export';
const ITEMS: { id: MobileTab; label: string; icon: typeof Eye }[] = [
  { id: 'generate', label: 'Generate', icon: SlidersHorizontal }, { id: 'patterns', label: 'Patterns', icon: FolderOpen },
  { id: 'colors', label: 'Colors', icon: Palette }, { id: 'preview', label: 'Preview', icon: Eye }, { id: 'export', label: 'Export', icon: Download },
];

export function MobileNav({ active, onSelect }: { active: MobileTab | null; onSelect: (t: MobileTab) => void }) {
  return (
    <nav aria-label="Mobile" className="relative z-50 flex h-14 shrink-0 items-stretch border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-ink-800 dark:bg-ink-900 md:hidden">
      {ITEMS.map((it) => (
        <button key={it.id} type="button" aria-pressed={active === it.id} onClick={() => onSelect(it.id)}
          className={cx('flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition', active === it.id ? 'text-brand-600 dark:text-brand-300' : 'text-ink-500 dark:text-ink-400')}>
          <it.icon className="h-5 w-5" strokeWidth={active === it.id ? 2.2 : 1.8} />
          {it.label}
        </button>
      ))}
    </nav>
  );
}
