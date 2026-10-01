import { forwardRef, useId, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  shortcut?: string;
  active?: boolean;
  tooltipSide?: 'top' | 'bottom';
  size?: 'sm' | 'md';
}

/** Icon-only button with an accessible label and a hover/focus tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, shortcut, active, tooltipSide = 'bottom', size = 'md', className, children, ...rest }, ref,
) {
  return (
    <button ref={ref} type="button" aria-label={label} aria-pressed={active}
      className={cx('group relative inline-flex shrink-0 items-center justify-center rounded-lg text-ink-600 transition-all duration-150',
        'hover:bg-ink-100 hover:text-ink-900 active:scale-[0.94] disabled:pointer-events-none disabled:opacity-35',
        'dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white',
        active && 'bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-white',
        size === 'sm' ? 'h-7 w-7' : 'h-8 w-8', className)} {...rest}>
      {children}
      <span role="tooltip" className={cx('pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-float transition-opacity delay-300 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-ink-700',
        tooltipSide === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5')}>
        {label}{shortcut && <span className="ml-1.5 text-white/55">{shortcut}</span>}
      </span>
    </button>
  );
});

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}
export function Button({ variant = 'secondary', size = 'md', className, children, ...rest }: BtnProps) {
  return (
    <button type="button" className={cx('inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
      size === 'sm' && 'h-7 px-2.5 text-xs', size === 'md' && 'h-8 px-3 text-[13px]', size === 'lg' && 'h-10 px-4 text-sm',
      variant === 'primary' && 'bg-brand-600 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-700',
      variant === 'secondary' && 'border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-850 dark:text-ink-100 dark:hover:bg-ink-800',
      variant === 'ghost' && 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white',
      variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700', className)} {...rest}>
      {children}
    </button>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  hint?: string;
}
export function Slider({ label, value, min, max, step = 1, format = (v) => String(v), onChange, hint }: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="group">
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-700 dark:text-ink-200" title={hint}>{label}</label>
        <span className="rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-ink-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700 dark:bg-ink-800 dark:text-ink-300 dark:group-hover:bg-brand-900/40 dark:group-hover:text-brand-200">{format(value)}</span>
      </div>
      <input id={id} type="range" className="pf-range" min={min} max={max} step={step} value={value}
        aria-valuetext={format(value)} style={{ ['--pct' as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function Section({ title, children, defaultOpen = true, action }: { title: string; children: ReactNode; defaultOpen?: boolean; action?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="border-b border-ink-100 px-4 py-3.5 last:border-b-0 dark:border-ink-800/80">
      <div className="flex items-center justify-between">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="-ml-1 flex items-center gap-1 rounded px-1 py-0.5 text-left">
          <span className="label">{title}</span>
          <ChevronDown className={cx('h-3.5 w-3.5 text-ink-400 transition-transform duration-200', !open && '-rotate-90')} />
        </button>
        {action}
      </div>
      {open && <div id={id} className="mt-3 animate-fade-in space-y-3.5">{children}</div>}
    </section>
  );
}

export function Segmented<T extends string | number>({ options, value, onChange, label, size = 'md' }: {
  options: { value: T; label: ReactNode; title?: string }[]; value: T; onChange: (v: T) => void; label: string; size?: 'sm' | 'md';
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-lg bg-ink-100 p-0.5 dark:bg-ink-800">
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value} title={o.title} onClick={() => onChange(o.value)}
          className={cx('flex-1 whitespace-nowrap rounded-md px-2 font-medium transition-all', size === 'sm' ? 'h-6 text-[11px]' : 'h-7 text-xs',
            value === o.value ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-600 dark:text-white' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cx('relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-ink-300 dark:bg-ink-600')}>
      <span className={cx('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[15px]' : 'translate-x-[2px]')} />
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-ink-200 bg-ink-50 px-1 font-sans text-[10px] font-medium text-ink-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">{children}</kbd>;
}

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
export const MOD = isMac ? '⌘' : 'Ctrl';
