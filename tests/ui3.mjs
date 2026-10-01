import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
const shot = (n) => page.screenshot({ path: `/tmp/g-${n}.png` });
await page.goto('http://localhost:5179/');
await page.getByRole('button', { name: 'Start Creating' }).click();
await page.waitForTimeout(400);
// Add geometric base from sidebar
await page.getByRole('button', { name: 'Add geometric base' }).click();
await page.waitForTimeout(500);
await shot('1-geo-on');
await page.getByRole('radio', { name: 'Gingham' }).click();
await page.getByRole('switch', { name: 'Show motifs on top' }).click();
await page.waitForTimeout(500);
await shot('2-gingham');
await page.getByRole('button', { name: 'Surprise me' }).first().click();
await page.waitForTimeout(300);
await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z');
await page.waitForTimeout(300);
// seam badge
const seam = await page.getByText(/Seamless/).first().textContent().catch(() => 'n/a');
console.log('seam badge:', seam);
// Presets page – geometric preset
await page.getByRole('button', { name: 'Presets' }).first().click();
await page.waitForTimeout(800);
await shot('3-presets');
await page.getByRole('button', { name: 'Use preset Harlequin Parlour' }).click();
await page.waitForTimeout(600);
await shot('4-harlequin');
// export SVG of geo
await page.getByRole('banner').getByRole('button', { name: 'Export' }).click();
await page.getByRole('radio', { name: 'svg' }).click();
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download Pattern' }).click()]);
console.log('geo svg:', dl.suggestedFilename());
await page.keyboard.press('Escape');
// Frames
await page.getByRole('button', { name: 'Frames', exact: true }).first().click();
await page.waitForTimeout(800);
await shot('5-frames');
const [d2] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PNG' }).click()]);
console.log('frame png:', d2.suggestedFilename());
const [d3] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'SVG', exact: true }).click()]);
console.log('frame svg:', d3.suggestedFilename()); await d3.saveAs('/tmp/frame.svg'); await d2.saveAs('/tmp/frame.png');
await page.getByRole('button', { name: 'Checkered card' }).click(); await page.waitForTimeout(500); await shot('6-border');
await page.getByRole('button', { name: 'Diamond menu' }).click(); await page.waitForTimeout(500); await shot('7-diamond');
for (const n of ['Wavy tag', 'Bakery stamp', 'Cinema ticket', 'Scallop badge', 'Arch window', 'Cloud bubble', 'Scallop invite', 'Party bunting']) {
  await page.getByRole('button', { name: n }).click(); await page.waitForTimeout(250); await shot('8-' + n.replace(/ /g, '_'));
}
// mobile
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(500); await shot('9-mobile-frames');
await page.getByRole('navigation', { name: 'Mobile' }).getByRole('button', { name: 'Generate' }).click(); await page.waitForTimeout(500); await shot('10-mobile-gen');
console.log(errs.length ? errs.join('\n') : 'no errors');
await b.close(); process.exit(0);
