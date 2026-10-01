import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
const shot = (n) => page.screenshot({ path: `/tmp/ui-${n}.png` });
await page.goto('http://localhost:5179/');
await page.waitForTimeout(1500);
await shot('1-welcome');
await page.getByRole('button', { name: 'Start Creating' }).click();
await page.waitForTimeout(500);
await shot('2-editor');
// click on canvas center to select a motif (try several points)
const box = await page.locator('canvas').first().boundingBox();
let selected = false;
for (const [fx, fy] of [[0.5,0.5],[0.45,0.4],[0.55,0.6],[0.4,0.55],[0.6,0.4],[0.35,0.35],[0.65,0.65]]) {
  await page.mouse.click(box.x + box.width*fx, box.y + box.height*fy);
  await page.waitForTimeout(120);
  if (await page.getByRole('toolbar', { name: 'Selected motif' }).count()) { selected = true; break; }
}
console.log('selected motif:', selected);
if (selected) { await page.getByRole('button', { name: 'Rotate +15°' }).click(); await page.getByRole('button', { name: /^Duplicate/ }).first().click(); await page.waitForTimeout(200); await shot('3-selected'); await page.keyboard.press('Escape'); }
await page.getByRole('button', { name: 'Randomize', exact: true }).first().click();
await page.waitForTimeout(400);
await page.keyboard.press('Control+z');
// seam check toggle in footer
await page.getByRole('switch', { name: 'Seam check' }).first().click();
await page.waitForTimeout(800);
console.log('seam badge:', await page.locator('text=✓ Seamless').count() > 0 ? 'Seamless shown' : 'missing');
await page.getByRole('radio', { name: '3×3' }).click();
await page.waitForTimeout(300);
await shot('4-3x3-seam');
// export modal
await page.getByRole('banner').getByRole('button', { name: 'Export' }).click();
await page.waitForTimeout(800);
await shot('5-export');
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download Pattern' }).click()]);
console.log('download:', dl.suggestedFilename());
await page.getByRole('radio', { name: 'svg' }).click();
const [dl2] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download Pattern' }).click()]);
console.log('download:', dl2.suggestedFilename());
await dl2.saveAs('/tmp/out.svg');
await page.getByLabel('Width in pixels').fill('99999');
console.log('dim error shown:', await page.locator('[role=alert]').first().textContent());
await page.keyboard.press('Escape');
// save
await page.keyboard.press('Control+s');
await page.waitForTimeout(400);
// presets
await page.getByRole('button', { name: 'Presets' }).first().click();
await page.waitForTimeout(1500);
await shot('6-presets');
await page.getByRole('button', { name: 'Use preset Halloween Night' }).click();
await page.waitForTimeout(600);
await shot('7-halloween');
await page.getByRole('button', { name: /My Patterns/ }).first().click();
await page.waitForTimeout(500);
await shot('8-mypatterns');
await page.getByRole('button', { name: 'Generator', exact: true }).click();
await page.getByRole('radio', { name: 'Mockups' }).first().click();
await page.waitForTimeout(600);
await shot('9-mockups');
await page.getByRole('tab', { name: /Wallpaper/ }).click(); await page.waitForTimeout(400); await shot('9b-wallpaper');
await page.getByRole('radio', { name: 'Editor' }).first().click();
await page.getByRole('button', { name: 'Dark mode' }).click();
await page.waitForTimeout(400);
await shot('10-dark');
await page.setViewportSize({ width: 1024, height: 768 }); await page.waitForTimeout(400); await shot('11-tablet');
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400); await shot('12-mobile');
await page.getByRole('button', { name: 'Generate' }).click(); await page.waitForTimeout(400); await shot('13-mobile-sheet');
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close(); process.exit(0);
