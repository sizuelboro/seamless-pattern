import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:5179' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
await page.goto('http://localhost:5179/');
await page.getByRole('button', { name: 'Start Creating' }).click();
const zoomText = () => page.locator('footer button[aria-haspopup=menu]').textContent();
const z0 = await zoomText();
const box = await page.locator('canvas').first().boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.wheel(0, -400); await page.waitForTimeout(200);
console.log('wheel zoom', z0, '->', await zoomText());
await page.keyboard.press('0'); await page.waitForTimeout(100);
console.log('fit ->', await zoomText());
// zoom menu 200%
await page.locator('footer button[aria-haspopup=menu]').click();
await page.getByRole('menuitem', { name: '200%' }).click();
console.log('menu 200% ->', await zoomText());
await page.keyboard.press('0');
// space pan
await page.keyboard.down('Space');
await page.mouse.move(box.x + 300, box.y + 300); await page.mouse.down(); await page.mouse.move(box.x + 420, box.y + 360, { steps: 5 }); await page.mouse.up();
await page.keyboard.up('Space');
// select + drag move
let sel = false, pt;
for (let i = 0; i < 40 && !sel; i++) {
  pt = [box.x + 120 + (i * 53) % (box.width - 240), box.y + 120 + (i * 37) % (box.height - 240)];
  await page.mouse.click(pt[0], pt[1]); await page.waitForTimeout(60);
  sel = (await page.getByRole('toolbar', { name: 'Selected motif' }).count()) > 0;
}
console.log('selected', sel);
const undoBtn = page.getByRole('button', { name: 'Undo' });
await page.mouse.move(pt[0], pt[1]); await page.mouse.down(); await page.mouse.move(pt[0] + 60, pt[1] + 40, { steps: 6 }); await page.mouse.up();
await page.waitForTimeout(200);
console.log('drag committed, undo enabled:', await undoBtn.isEnabled(), ' status:', await page.locator('text=Not saved').count() ? 'Not saved' : '?');
await page.keyboard.press('ArrowRight'); await page.keyboard.press('l');
await page.waitForTimeout(150);
console.log('locked:', await page.getByRole('button', { name: 'Unlock' }).count() === 1);
await page.getByRole('button', { name: /Regenerate pattern/ }).click().catch(() => console.log('no regenerate button'));
await page.waitForTimeout(200);
console.log('selection survives regenerate (locked):', await page.getByRole('toolbar', { name: 'Selected motif' }).count() === 1);
await page.keyboard.press('Escape');
// palette edits
await page.getByLabel('Palette colour 1 HEX value').fill('#zzz'); await page.keyboard.press('Enter');
await page.waitForTimeout(150);
console.log('invalid hex toast:', await page.locator('text=Invalid colour').count() > 0);
await page.getByLabel('Palette colour 1 HEX value').fill('#F6E9D5'); await page.keyboard.press('Enter');
await page.getByRole('button', { name: /Add color/ }).click();
console.log('palette size', await page.locator('[aria-label^="Palette colour"][aria-label$="HEX value"]').count());
// empty motif selection
const chips = page.locator('button[aria-label^="Remove "]');
while (await chips.count()) await chips.first().click();
console.log('empty motif warning:', await page.locator('text=No motifs selected').count() > 0);
await page.getByRole('radio', { name: 'Floral' }).first().click();
// tile size invalid
await page.getByLabel('Tile width').fill('20'); await page.getByLabel('Tile width').press('Enter');
console.log('tile error:', await page.locator('text=Tile size must be between').count() > 0);
// export 6000
await page.keyboard.press('Control+e');
await page.getByRole('button', { name: '6000 × 6000' }).click();
const t = Date.now();
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.getByRole('button', { name: 'Download Pattern' }).click()]);
const path = '/tmp/big.png'; await dl.saveAs(path);
console.log('6000 export', dl.suggestedFilename(), 'in', Date.now() - t, 'ms');
await page.getByRole('radio', { name: 'jpg' }).click();
await page.getByRole('button', { name: '2048 × 2048' }).click();
await page.waitForTimeout(800);
console.log('jpg estimate:', await page.locator('text=Estimated size').locator('..').textContent());
await page.getByRole('button', { name: 'Copy to Clipboard' }).click();
await page.waitForTimeout(1500);
console.log('clipboard toast:', await page.locator('text=Copied to clipboard').count() > 0 ? 'copied' : (await page.locator('text=Copy failed').count() ? 'failed (handled)' : 'none'));
await page.keyboard.press('Escape');
// save, then my patterns actions
await page.keyboard.press('Control+s'); await page.waitForTimeout(300);
await page.getByRole('button', { name: /My Patterns/ }).first().click();
await page.getByRole('button', { name: 'Duplicate' }).first().click();
console.log('cards after duplicate:', await page.locator('img[alt=""]').count());
await page.getByRole('button', { name: 'Delete' }).first().click();
await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
console.log('cards after delete:', await page.locator('img[alt=""]').count());
// reload persistence
await page.reload(); await page.waitForTimeout(800);
console.log('after reload view has canvas:', await page.locator('canvas').count(), 'welcome hidden:', await page.locator('text=Create your first seamless pattern').count() === 0);
// tablet drawer
await page.setViewportSize({ width: 1024, height: 768 }); await page.waitForTimeout(300);
await page.getByRole('button', { name: 'Settings panel' }).click(); await page.waitForTimeout(350);
await page.screenshot({ path: '/tmp/ui-tablet-drawer.png' });
await page.mouse.click(400, 400); await page.waitForTimeout(200);
await page.setViewportSize({ width: 1280, height: 800 }); await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/ui-1280.png' });
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close(); process.exit(0);
