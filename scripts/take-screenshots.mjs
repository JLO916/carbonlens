import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'guide');

async function captureCompare(page, prefix) {
  await page.goto('http://localhost:3000/compare', { waitUntil: 'networkidle2' });

  // If English prefix, click EN toggle first
  if (prefix === 'en') {
    // Find and click the language toggle button (shows "EN" when in Chinese)
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await page.evaluate(el => el.textContent.trim(), btn);
      if (text === 'EN') { await btn.click(); break; }
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // 1: Input form
  await page.screenshot({ path: path.join(outDir, `${prefix}-compare-input.png`) });
  console.log(`✓ ${prefix}-compare-input.png`);

  // Click compare button
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text.includes('開始比較') || text.includes('Compare')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));

  // 2: Chart
  await page.evaluate(() => window.scrollTo(0, 370));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, `${prefix}-compare-chart.png`) });
  console.log(`✓ ${prefix}-compare-chart.png`);

  // 3: Table
  await page.evaluate(() => window.scrollTo(0, 850));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(outDir, `${prefix}-compare-table.png`) });
  console.log(`✓ ${prefix}-compare-table.png`);
}

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Chinese screenshots
  await captureCompare(page, 'zh');

  // English screenshots (new page to reset state)
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1280, height: 900 });
  await captureCompare(page2, 'en');

  await browser.close();
  console.log('Done. Both zh and en screenshots saved.');
}

main().catch(e => { console.error(e); process.exit(1); });
