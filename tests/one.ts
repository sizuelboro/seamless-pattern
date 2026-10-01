import { PRESETS, stateFromPreset } from '../src/data/presets';
import { renderTile } from '../src/engine/seamlessRenderer';
const ids = (new URLSearchParams(location.search).get('ids') ?? '').split(',');
const root = document.getElementById('out')!; root.textContent = '';
for (const id of ids) {
  const st = stateFromPreset(PRESETS.find((p) => p.id === id)!);
  const c = document.createElement('canvas'); c.width = 1000; c.height = 1000; renderTile(c.getContext('2d')!, st, 1000, 1000);
  const big = document.createElement('canvas'); big.width = 1000; big.height = 1000; const b = big.getContext('2d')!;
  b.drawImage(c, 0, 0, 500, 500); b.drawImage(c, 500, 0, 500, 500); b.drawImage(c, 0, 500, 500, 500); b.drawImage(c, 500, 500, 500, 500);
  root.append(big);
}
(window as any).__done = true;
