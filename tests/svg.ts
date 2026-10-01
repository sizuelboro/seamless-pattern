import { PRESETS, stateFromPreset } from '../src/data/presets';
import { buildSvg, renderRaster } from '../src/engine/exportEngine';
const out: string[] = [];
(async () => {
  for (const p of PRESETS) {
    const st = stateFromPreset(p);
    st.background = { ...st.background, type: p.id === 'wedding-botanicals' ? 'linear' : st.background.type, direction: 'diagonal', color2: '#DDEEFF' };
    const svg = buildSvg(st, { width: 400, height: 400, transparent: false });
    const img = new Image();
    await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); });
    const a = document.createElement('canvas'); a.width = a.height = 400; const actx = a.getContext('2d')!; actx.drawImage(img, 0, 0, 400, 400);
    const bmp = await createImageBitmap(await renderRaster(st, { format: 'png', width: 400, height: 400, quality: 1, transparent: false }));
    const b = document.createElement('canvas'); b.width = b.height = 400; const bctx = b.getContext('2d')!; bctx.drawImage(bmp, 0, 0);
    const A = actx.getImageData(0, 0, 400, 400).data, B = bctx.getImageData(0, 0, 400, 400).data;
    let bad = 0; for (let i = 0; i < A.length; i += 4) if (Math.max(Math.abs(A[i]-B[i]), Math.abs(A[i+1]-B[i+1]), Math.abs(A[i+2]-B[i+2])) > 60) bad++;
    out.push(`${bad < 400 ? 'PASS' : 'FAIL'} svg-vs-canvas ${p.id.padEnd(22)} diffPx=${bad} (${(bad/1600).toFixed(2)}%) size=${(svg.length/1024).toFixed(0)}KB`);
  }
  document.getElementById('out')!.textContent = out.join('\n');
  (window as any).__done = true;
})();
