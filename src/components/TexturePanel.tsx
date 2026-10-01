import { memo } from 'react';
import { Dices } from 'lucide-react';
import type { PatternState } from '../types/pattern';
import type { PatternActions } from '../hooks/usePattern';
import { DEFAULT_TEXTURE, TEXTURE_OPTIONS } from '../engine/textureEngine';
import { randomSeed } from '../engine/random';
import { Button, Slider, cx } from './ui';

/** Print texture over the whole pattern: distressed block print, grain, linen, canvas. */
export const TexturePanel = memo(function TexturePanel({ state, actions }: { state: PatternState; actions: PatternActions }) {
  const t = state.texture ?? DEFAULT_TEXTURE;
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Texture" className="grid grid-cols-5 gap-1">
        {TEXTURE_OPTIONS.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={t.type === o.id} title={o.hint} onClick={() => actions.setTexture({ type: o.id })}
            className={cx('rounded-md border px-1 py-1.5 text-[10.5px] font-medium transition',
              t.type === o.id ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200' : 'border-ink-200/80 text-ink-500 hover:border-ink-300 hover:text-ink-800 dark:border-ink-800 dark:text-ink-400')}>
            {o.label}
          </button>
        ))}
      </div>
      {t.type !== 'none' && (
        <>
          <Slider label="Strength" value={t.amount} min={0} max={100} format={(v) => `${v}%`} onChange={(v) => actions.setTexture({ amount: v }, 'texAmount')} />
          <Slider label="Grain size" value={t.scale} min={25} max={300} format={(v) => `${v}%`} onChange={(v) => actions.setTexture({ scale: v }, 'texScale')} />
          <Button variant="secondary" size="sm" onClick={() => actions.setTexture({ seed: randomSeed() })}>
            <Dices className="h-3.5 w-3.5" /> New texture
          </Button>
        </>
      )}
    </div>
  );
});
