import { memo } from 'react';
import { getMotif, roleColor, resolvePalette } from '../engine/motifRenderer';

/** Inline SVG rendering of a motif — crisp at any size, same paths as the canvas. */
export const MotifIcon = memo(function MotifIcon({ type, palette, colorIndex = 0, className = 'h-8 w-8' }: { type: string; palette: string[]; colorIndex?: number; className?: string }) {
  const m = getMotif(type);
  const rp = resolvePalette(palette);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {m.parts.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill ? roleColor(p.fill, colorIndex, rp) : 'none'} fillRule={p.rule}
          stroke={p.stroke ? roleColor(p.stroke, colorIndex, rp) : undefined} strokeWidth={p.sw} strokeLinecap={p.cap ?? 'round'}
          strokeLinejoin="round" strokeDasharray={p.dash?.join(' ')} opacity={p.o} />
      ))}
    </svg>
  );
});
