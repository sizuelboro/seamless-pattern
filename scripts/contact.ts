import { MOTIFS } from '../src/data/motifs';
import { resolvePalette, roleColor } from '../src/engine/motifRenderer';
import { writeFileSync } from 'fs';
const rp = resolvePalette(['#6B8E72', '#E8A598', '#F2C66D', '#3F5B47', '#A9C2A0']);
const cols = 12; const cell = 110;
let out = '';
MOTIFS.forEach((m, i) => {
  const x = (i % cols) * cell, y = Math.floor(i / cols) * (cell + 16);
  const parts = m.parts.map(p => `<path d="${p.d}" fill="${p.fill ? roleColor(p.fill, 0, rp) : 'none'}" ${p.rule ? `fill-rule="${p.rule}"` : ''} ${p.stroke ? `stroke="${roleColor(p.stroke, 0, rp)}" stroke-width="${p.sw ?? 2}" stroke-linecap="${p.cap ?? 'round'}" stroke-linejoin="round" ${p.dash ? `stroke-dasharray="${p.dash.join(' ')}"` : ''}` : ''} opacity="${p.o ?? 1}"/>`).join('');
  out += `<g transform="translate(${x + 5} ${y + 5})"><rect width="100" height="100" fill="#FBF4E6"/>${parts}<text x="50" y="114" font-size="10" text-anchor="middle" font-family="sans-serif">${m.id}</text></g>`;
});
const rows = Math.ceil(MOTIFS.length / cols);
writeFileSync('/tmp/contact.html', `<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${cols * cell}" height="${rows * (cell + 16)}">${out}</svg></body></html>`);
console.log(MOTIFS.length, rows);
