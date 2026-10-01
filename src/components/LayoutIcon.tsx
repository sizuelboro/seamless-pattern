import type { LayoutMode } from '../types/pattern';

const dots: Record<LayoutMode, [number, number, number?][]> = {
  random: [[5, 6], [14, 4], [21, 9], [9, 13], [18, 17], [4, 20], [12, 21]],
  tossed: [[6, 5, 30], [16, 6, -20], [10, 13, 60], [20, 15, 10], [5, 19, -40], [15, 21, 80]],
  grid: [[5, 5], [12, 5], [19, 5], [5, 12], [12, 12], [19, 12], [5, 19], [12, 19], [19, 19]],
  brick: [[5, 5], [12, 5], [19, 5], [8.5, 12], [15.5, 12], [5, 19], [12, 19], [19, 19]],
  hex: [[4, 5], [12, 5], [20, 5], [8, 12], [16, 12], [4, 19], [12, 19], [20, 19]],
  halfdrop: [[5, 5], [5, 12], [5, 19], [12, 8.5], [12, 15.5], [19, 5], [19, 12], [19, 19]],
  mirror: [[6, 6], [18, 6], [6, 18], [18, 18]],
  radial: [[12, 12], [12, 5], [18, 9], [18, 15], [12, 19], [6, 15], [6, 9]],
  stripe: [[4, 6], [9, 6], [14, 6], [19, 6], [6.5, 12], [11.5, 12], [16.5, 12], [4, 18], [9, 18], [14, 18], [19, 18]],
  checker: [[6, 6], [18, 6], [12, 12], [6, 18], [18, 18]],
  cells: [[7, 7], [17, 7], [7, 17], [17, 17]],
  vine: [[6, 7], [17, 12], [8, 19]],
  damask: [[12, 11], [6, 12], [18, 12], [12, 4]],
};

export function LayoutIcon({ mode, className = 'h-6 w-6' }: { mode: LayoutMode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      {mode === 'vine' && <path d="M2 9C8 2 12 16 17 12S22 4 22 4M6 7C4 14 10 15 8 19" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55" />}
      {mode === 'damask' && <path d="M12 2v20M7 18c-4-3-4-8 0-10M17 18c4-3 4-8 0-10" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".45" />}
      {mode === 'cells' && <path d="M2 2h20v20H2zM12 2v20M2 12h20" fill="none" stroke="currentColor" strokeWidth="1" opacity=".35" />}
      {mode === 'checker' && [[3, 3], [15, 3], [9, 9], [3, 15], [15, 15]].map(([x, y], i) => <rect key={`c${i}`} x={x} y={y} width="6" height="6" rx="1" opacity=".25" />)}
      {mode === 'mirror'
        ? dots.mirror.map(([x, y], i) => <path key={i} d={`M${x} ${y - 3}l${i % 2 ? -3 : 3} 3l${i % 2 ? 3 : -3} 3z`} />)
        : mode === 'tossed'
          ? dots.tossed.map(([x, y, r], i) => <rect key={i} x={x - 2} y={y - 1} width="4" height="2" rx="1" transform={`rotate(${r} ${x} ${y})`} />)
          : dots[mode].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={mode === 'radial' && i === 0 ? 2.4 : 1.6} />)}
    </svg>
  );
}
