import { memo } from 'react';
import type { PatternState } from '../types/pattern';
import type { PatternActions } from '../hooks/usePattern';
import { BACKGROUND_PRESETS } from '../data/palettes';
import { ColorInput } from './ColorInput';
import { Segmented, cx } from './ui';
import { useToast } from './Toast';

export const BackgroundControls = memo(function BackgroundControls({ state, actions }: { state: PatternState; actions: PatternActions }) {
  const toast = useToast();
  const bg = state.background;
  const mode = bg.type === 'linear' || bg.type === 'radial' ? 'gradient' : bg.type;
  const err = (m: string) => toast.show('Invalid colour', 'error', m);
  return (
    <div className="space-y-3">
      <Segmented label="Background type" value={mode} onChange={(v) => actions.setBackground({ type: v === 'gradient' ? 'linear' : v })}
        options={[{ value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Gradient' }, { value: 'transparent', label: 'Transparent' }]} />
      {bg.type !== 'transparent' && (
        <>
          <ColorInput value={bg.color} label={bg.type === 'solid' ? 'Background' : 'Gradient start'} onChange={(c, live) => actions.setBackground({ color: c }, live ? 'bg1' : undefined)} onCommitError={err} />
          {mode === 'gradient' && (
            <>
              <ColorInput value={bg.color2} label="Gradient end" onChange={(c, live) => actions.setBackground({ color2: c }, live ? 'bg2' : undefined)} onCommitError={err} />
              <Segmented size="sm" label="Gradient type" value={bg.type} onChange={(v) => actions.setBackground({ type: v })}
                options={[{ value: 'linear', label: 'Linear' }, { value: 'radial', label: 'Radial' }]} />
              {bg.type === 'linear' && (
                <Segmented size="sm" label="Gradient direction" value={bg.direction} onChange={(v) => actions.setBackground({ direction: v })}
                  options={[{ value: 'horizontal', label: '↔' , title: 'Horizontal' }, { value: 'vertical', label: '↕', title: 'Vertical' }, { value: 'diagonal', label: '⤢', title: 'Diagonal' }]} />
              )}
              <p className="text-[11px] leading-relaxed text-ink-500 dark:text-ink-400">Gradients are mirrored so the tile edges always match — still 100% seamless.</p>
            </>
          )}
          <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Background presets">
            {BACKGROUND_PRESETS.map((p) => (
              <button key={p.name} type="button" title={p.name} aria-label={`${p.name} background`} onClick={() => actions.setBackground({ color: p.color })}
                className={cx('group flex flex-col items-center gap-1')}>
                <span className={cx('h-7 w-full rounded-md ring-1 ring-inset ring-black/10 transition group-hover:scale-105 dark:ring-white/10', bg.color.toUpperCase() === p.color && 'ring-2 ring-brand-500')} style={{ background: p.color }} />
                <span className="text-[10px] text-ink-500 dark:text-ink-400">{p.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {bg.type === 'transparent' && <p className="text-[11px] text-ink-500 dark:text-ink-400">The checkerboard is preview-only. PNG, WebP and SVG exports keep transparency.</p>}
    </div>
  );
});
