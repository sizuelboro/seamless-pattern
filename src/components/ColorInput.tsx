import { useEffect, useState } from 'react';
import { normalizeHex } from '../utils/colors';
import { cx } from './ui';

/** Swatch (native picker) + HEX text field with validation. */
export function ColorInput({ value, onChange, label, onCommitError, compact }: {
  value: string; onChange: (hex: string, live?: boolean) => void; label: string; onCommitError?: (msg: string) => void; compact?: boolean;
}) {
  const [text, setText] = useState(value.toUpperCase());
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { setText(value.toUpperCase()); setInvalid(false); }, [value]);
  const commit = () => {
    const n = normalizeHex(text);
    if (!n) { setInvalid(true); onCommitError?.(`“${text}” isn’t a valid HEX colour. Use a format like #F6E9D5.`); setText(value.toUpperCase()); return; }
    setInvalid(false);
    if (n !== value.toUpperCase()) onChange(n);
  };
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-black/10 dark:ring-white/10">
        <input type="color" className="pf-color absolute -inset-1 h-10 w-10" aria-label={`${label} colour picker`} value={normalizeHex(value) ?? '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase(), true)} />
      </span>
      {!compact && (
        <input className={cx('input font-mono uppercase tabular-nums', invalid && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20')} aria-label={`${label} HEX value`} aria-invalid={invalid}
          value={text} maxLength={7} spellCheck={false} onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
      )}
    </div>
  );
}
