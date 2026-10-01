import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1400, height: 800 } });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await p.goto('http://localhost:5179/tests/msheet.html' + (process.argv[2] ? '?set=' + process.argv[2] : '')); await p.waitForFunction(() => window.__done === true);
await p.screenshot({ path: process.argv[3] ?? '/tmp/msheet.png', fullPage: true }); await b.close(); process.exit(0);
