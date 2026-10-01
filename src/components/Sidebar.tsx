import { memo } from 'react';
import type { PatternState } from '../types/pattern';
import type { PatternActions } from '../hooks/usePattern';
import { Section } from './ui';
import { CategoryGrid } from './CategoryGrid';
import { MotifLibrary } from './MotifLibrary';
import { GeoPanel } from './GeoPanel';
import { AdjustControls, LayoutModes, RotationControls, SeedControl, TileSizeControl } from './PatternControls';

/** Left control panel: what the pattern is made of and how it's arranged. */
export const Sidebar = memo(function Sidebar({ state, actions }: { state: PatternState; actions: PatternActions }) {
  const s = state.settings;
  return (
    <div className="pb-6">
      <Section title="Pattern type">
        <CategoryGrid value={s.category} onChange={actions.selectCategory} />
      </Section>
      <Section title={state.geo?.enabled ? `Geometric base · ${state.geo.style}` : 'Geometric base'}>
        <GeoPanel state={state} actions={actions} />
      </Section>
      <Section title={`Motifs · ${s.motifs.length}`}>
        <MotifLibrary selected={s.motifs} palette={state.palette} onToggle={actions.toggleMotif} onClear={() => actions.setMotifs([s.motifs[0]])} />
      </Section>
      <Section title="Layout">
        <LayoutModes value={s.layout} stripeDirection={s.stripeDirection} onChange={actions.updateSettings} />
      </Section>
      <Section title="Adjust">
        <AdjustControls s={s} onChange={actions.updateSettings} />
      </Section>
      <Section title="Rotation">
        <RotationControls s={s} onChange={actions.updateSettings} />
      </Section>
      <Section title="Random seed">
        <SeedControl seed={s.seed} onChange={actions.updateSettings} onRegenerate={actions.regenerate} edited={state.edited} />
      </Section>
      <Section title="Tile size">
        <TileSizeControl w={s.tileWidth} h={s.tileHeight} onChange={actions.updateSettings} />
      </Section>
    </div>
  );
});
