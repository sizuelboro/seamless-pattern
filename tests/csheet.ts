import { PRESETS, stateFromPreset } from '../src/data/presets';
import { renderTile } from '../src/engine/seamlessRenderer';
import { GEO_STYLES, GEO_MAP } from '../src/engine/geoPattern';
const list = PRESETS.filter((p) => p.tag === 'chintz').map((p) => ({ name: p.name, st: stateFromPreset(p) }));
const base = stateFromPreset(PRESETS.find((p) => p.id === 'geo-harlequin')!);

const root = document.getElementById('out')!; root.textContent = '';
for (const { name, st } of list) {
  const c = document.createElement('canvas'); c.width = 360; c.height = 360;
  const t = document.createElement('canvas'); t.width = 360; t.height = 360; renderTile(t.getContext('2d')!, st, 360, 360);
  const ctx = c.getContext('2d')!; ctx.drawImage(t, 0, 0);
  const d = document.createElement('div'); d.style.cssText = 'display:inline-block;margin:4px;font:11px sans-serif;width:360px'; d.append(c, document.createTextNode(name)); root.append(d);
}
(window as any).__done = true;
