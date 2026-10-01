import { memo } from 'react';
import { Download, FilePlus2, Keyboard, Moon, PanelRight, Redo2, RotateCcw, Save, Sun, Undo2 } from 'lucide-react';
import type { AppView } from '../types/pattern';
import { Logo } from './Logo';
import { Button, IconButton, MOD, cx } from './ui';

interface Props {
  view: AppView;
  setView: (v: AppView) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onSave: () => void;
  onNew: () => void;
  onExport: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onShortcuts: () => void;
  onToggleSettings: () => void;
  savedCount: number;
}

const NAV: { id: AppView; label: string }[] = [
  { id: 'generator', label: 'Generator' }, { id: 'frames', label: 'Frames' }, { id: 'patterns', label: 'My Patterns' }, { id: 'presets', label: 'Presets' },
];

export const Header = memo(function Header(p: Props) {
  const gen = p.view === 'generator';
  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center gap-2 border-b border-ink-200/80 bg-white px-2.5 dark:border-ink-800 dark:bg-ink-900 sm:px-3">
      <button type="button" onClick={() => p.setView('generator')} className="flex items-center gap-2 rounded-lg pr-1.5" aria-label="PatternForge — go to generator">
        <Logo className="h-7 w-7" />
        <span className="hidden text-[14px] font-semibold tracking-tight text-ink-900 dark:text-white sm:inline">PatternForge</span>
      </button>
      <nav aria-label="Main" className="ml-2 hidden items-center gap-0.5 md:flex">
        {NAV.map((n) => (
          <button key={n.id} type="button" aria-current={p.view === n.id ? 'page' : undefined} onClick={() => p.setView(n.id)}
            className={cx('relative h-8 rounded-lg px-2.5 text-[13px] font-medium transition', p.view === n.id ? 'text-ink-900 dark:text-white' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100')}>
            {n.label}
            {n.id === 'patterns' && p.savedCount > 0 && <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 text-[10px] font-semibold tabular-nums text-ink-600 dark:bg-ink-800 dark:text-ink-300">{p.savedCount}</span>}
            {p.view === n.id && <span className="absolute inset-x-2.5 -bottom-[9px] h-0.5 rounded-full bg-brand-600" />}
          </button>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-0.5">
        <IconButton label="New pattern" onClick={p.onNew} className="hidden sm:inline-flex"><FilePlus2 className="h-4 w-4" /></IconButton>
        {gen && <>
          <span className="mx-1 hidden h-5 w-px bg-ink-200 dark:bg-ink-800 sm:block" />
          <IconButton label="Undo" shortcut={`${MOD}Z`} onClick={p.onUndo} disabled={!p.canUndo}><Undo2 className="h-4 w-4" /></IconButton>
          <IconButton label="Redo" shortcut={`${MOD}⇧Z`} onClick={p.onRedo} disabled={!p.canRedo}><Redo2 className="h-4 w-4" /></IconButton>
          <IconButton label="Reset to original" onClick={p.onReset} className="hidden sm:inline-flex"><RotateCcw className="h-4 w-4" /></IconButton>
        </>}
        <IconButton label="Save" shortcut={`${MOD}S`} onClick={p.onSave}><Save className="h-4 w-4" /></IconButton>
        <span className="mx-1 hidden h-5 w-px bg-ink-200 dark:bg-ink-800 sm:block" />
        <IconButton label={p.theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={p.onToggleTheme}>{p.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</IconButton>
        <IconButton label="Keyboard shortcuts" shortcut="?" onClick={p.onShortcuts} className="hidden lg:inline-flex"><Keyboard className="h-4 w-4" /></IconButton>
        {gen && <IconButton label="Settings panel" onClick={p.onToggleSettings} className="hidden md:inline-flex xl:hidden"><PanelRight className="h-4 w-4" /></IconButton>}
        {p.view !== 'frames' && <Button variant="primary" onClick={p.onExport} className="ml-1.5 hidden sm:inline-flex"><Download className="h-3.5 w-3.5" /> Export</Button>}
      </div>
    </header>
  );
});
