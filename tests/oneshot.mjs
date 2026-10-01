import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto('http://localhost:5179/tests/one.html?ids=' + process.argv[2]); await p.waitForFunction(() => window.__done === true);
await p.screenshot({ path: process.argv[3], fullPage: true }); await b.close(); process.exit(0);
