import { ArrowRight, LayoutGrid, Sparkles } from 'lucide-react';
import { GALLERY_PRESETS, type PresetDef } from '../data/presets';
import { PresetCard } from './PresetGallery';
import { Button } from './ui';

const FEATURED = ['floral-meadow', 'cute-strawberry', 'tropical-paradise', 'scandinavian-shapes', 'halloween-night', 'boho-desert'];

/** First-run welcome over the live sample pattern. */
export function EmptyState({ onStart, onExplore, onUse }: { onStart: () => void; onExplore: () => void; onUse: (p: PresetDef) => void }) {
  const featured = FEATURED.map((id) => GALLERY_PRESETS.find((p) => p.id === id)!).filter(Boolean);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-ink-50/70 p-4 backdrop-blur-[6px] animate-fade-in dark:bg-ink-950/70">
      <div className="panel w-full max-w-[560px] animate-pop-in rounded-2xl p-6 shadow-float sm:p-8">
        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          <Sparkles className="h-3 w-3" /> PatternForge
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">Create your first seamless pattern</h1>
        <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">Choose a style, pick your motifs, and start designing.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="primary" size="lg" onClick={onStart}>Start Creating <ArrowRight className="h-4 w-4" /></Button>
          <Button size="lg" onClick={onExplore}><LayoutGrid className="h-4 w-4" /> Explore Presets</Button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {featured.map((p) => <PresetCard key={p.id} preset={p} onUse={onUse} compact />)}
        </div>
      </div>
    </div>
  );
}
