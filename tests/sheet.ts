import { PRESETS, stateFromPreset } from '../src/data/presets';
import { renderTile } from '../src/engine/seamlessRenderer';
import { GEO_STYLES, GEO_MAP } from '../src/engine/geoPattern';
const list = PRESETS.filter((p) => p.tag === 'geometric').map((p) => ({ name: p.name, st: stateFromPreset(p) }));
const base = stateFromPreset(PRESETS.find((p) => p.id === 'geo-harlequin')!);
for (const s of GEO_STYLES) list.push({ name: s.name + ' (accent/outline)', st: { ...base, palette: ['#6E2B33', '#E3A7B4', '#A8C0D2', '#6F7D4C', '#F1E4CE'], background: { ...base.background, color: '#F1E4CE' }, geo: { ...base.geo!, ...GEO_MAP[s.id].defaults, style: s.id, colors: [-1, 0, 2, 3, 1], accent: 'sparkle', outline: true } } });
const root = document.getElementById('out')!; root.textContent = '';
for (const { name, st } of list) {
  const c = document.createElement('canvas'); c.width = 260; c.height = 260;
  const t = document.createElement('canvas'); t.width = 130; t.height = 130; renderTile(t.getContext('2d')!, st, 130, 130);
  const ctx = c.getContext('2d')!; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) ctx.drawImage(t, i * 130, j * 130);
  const d = document.createElement('div'); d.style.cssText = 'display:inline-block;margin:4px;font:11px sans-serif;width:260px'; d.append(c, document.createTextNode(name)); root.append(d);
}
(window as any).__done = true;
