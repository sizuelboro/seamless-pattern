import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await p.goto('http://localhost:5179/tests/isheet.html'); await p.waitForFunction(() => window.__done === true);
await p.screenshot({ path: '/tmp/indian-sheet.png', fullPage: true }); await b.close(); process.exit(0);
