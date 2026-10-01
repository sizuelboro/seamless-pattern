import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await page.goto('http://localhost:5179/');
await page.getByRole('button', { name: 'Start Creating' }).click();
await page.waitForTimeout(400);
// Chintz category switches to the vine layout and shows vine controls
await page.getByRole('button', { name: /Chintz & Damask/ }).first().click().catch(async () => page.getByText('Chintz & Damask').first().click());
await page.waitForTimeout(600);
console.log('vine checked:', await page.getByRole('radio', { name: /^Vine/ }).getAttribute('aria-checked'));
console.log('stem slider:', await page.getByText('Stem thickness').count());
await page.getByText('Stem thickness').scrollIntoViewIfNeeded();
await page.screenshot({ path: '/tmp/u4-1-vine.png' });
// Texture
await page.getByRole('radio', { name: 'Distressed' }).click();
await page.waitForTimeout(500);
console.log('strength slider:', await page.getByText('Strength').count());
await page.getByRole('radio', { name: /^Damask/ }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/u4-2-damask.png' });
// Presets
await page.getByRole('button', { name: 'Presets' }).first().click();
await page.waitForTimeout(800);
console.log('section:', await page.getByText('Chintz, damask & tribal').count());
await page.getByRole('button', { name: 'Use preset Chintz Garden' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/u4-3-chintz.png' });
await page.getByRole('banner').getByRole('button', { name: 'Export' }).click();
await page.getByRole('radio', { name: 'svg' }).click();
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download Pattern' }).click()]);
console.log('svg:', dl.suggestedFilename());
await page.keyboard.press('Escape');
console.log(errs.length ? errs.join('\n') : 'no errors');
await b.close(); process.exit(0);
