import { memo } from 'react';
import { CheckCircle2, Download, ScanLine, TriangleAlert } from 'lucide-react';
import type { ExportFormat, PatternState, SeamReport } from '../types/pattern';
import type { PatternActions } from '../hooks/usePattern';
import { Section, Toggle, cx } from './ui';
import { ColorPalette } from './ColorPalette';
import { BackgroundControls } from './BackgroundControls';
import { LayersPanel } from './LayersPanel';

interface Props {
  state: PatternState;
  actions: PatternActions;
  onSelect: (id: string | null) => void;
  onExport: (format?: ExportFormat) => void;
  seamCheck: boolean;
  setSeamCheck: (v: boolean) => void;
  seam: SeamReport | null;
}

export function SeamStatus({ seamCheck, setSeamCheck, seam }: Pick<Props, 'seamCheck' | 'setSeamCheck' | 'seam'>) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] font-medium text-ink-700 dark:text-ink-200"><ScanLine className="h-4 w-4 text-ink-400" /> Seam check</span>
        <Toggle checked={seamCheck} onChange={setSeamCheck} label="Seam check" />
      </div>
      {seamCheck && seam && (
        <div className={cx('rounded-lg px-2.5 py-2 text-xs', seam.ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/25 dark:text-emerald-200' : 'bg-rose-50 text-rose-800 dark:bg-rose-900/25 dark:text-rose-200')}>
          <div className="flex items-center gap-1.5 font-semibold">
            {seam.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
            {seam.ok ? 'Seamless' : 'Discontinuities found'}
          </div>
          <p className="mt-1 leading-relaxed opacity-80">
            {seam.ok
              ? 'Left ↔ right and top ↔ bottom edges match the half-tile-shifted render.'
              : `${seam.wrapMismatchPixels.toLocaleString()} mismatched px across seams${seam.backgroundBreaks ? `, ${seam.backgroundBreaks} background breaks` : ''}. Highlighted in red on the canvas.`}
          </p>
        </div>
      )}
      {seamCheck && !seam && <p className="text-xs text-ink-500">Checking…</p>}
    </div>
  );
}

/** Right panel: colour, background, layers and export. */
export const SettingsPanel = memo(function SettingsPanel({ state, actions, onSelect, onExport, seamCheck, setSeamCheck, seam }: Props) {
  return (
    <div className="pb-6">
      <Section title="Palette">
        <ColorPalette state={state} actions={actions} />
      </Section>
      <Section title="Background">
        <BackgroundControls state={state} actions={actions} />
      </Section>
      <Section title={`Layers · ${state.objects.length}`} defaultOpen={false}>
        <LayersPanel state={state} actions={actions} onSelect={onSelect} />
      </Section>
      <Section title="Quality">
        <SeamStatus seamCheck={seamCheck} setSeamCheck={setSeamCheck} seam={seam} />
      </Section>
      <Section title="Export">
        <div className="grid grid-cols-4 gap-1.5">
          {(['png', 'jpg', 'webp', 'svg'] as ExportFormat[]).map((f) => (
            <button key={f} type="button" onClick={() => onExport(f)}
              className="h-8 rounded-lg border border-ink-200 text-[11px] font-semibold uppercase tracking-wide text-ink-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-700 dark:text-ink-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-200">
              {f}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onExport()} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-[13px] font-medium text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]">
          <Download className="h-4 w-4" /> Export pattern…
        </button>
      </Section>
    </div>
  );
});
