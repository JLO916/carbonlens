// Capture g-scorecard.jpg for the guide — loads a scorecard persona, computes, element-screenshots
// the customer-scorecard card. Outputs PNG; convert to JPEG separately.
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'guide');
const B = process.env.BASE || 'http://localhost:3200';
const rq = (d, k, x = {}) => ({ id: d + k + Math.random(), dimension: d, kind: k, ...x });
const ev = (name) => ({ id: name, name, importance: 'major', requirements: [rq('ecovadis', 'gate', { tier: 'gold' }), rq('scope12', 'gate'), rq('scope3', 'gate'), rq('target', 'scored', { minPct: 30, byYear: 2030 })] });
const p = {
  schemaVersion: 1, company: '宏昇精密', industry: 'electronics', listingType: 'otc', capitalTier: 'under50', hasSustainabilityReport: false, employeeBand: 'from250to999', businessModel: 'odm_oem', exportsToEU: false, exportSupplyChain: true, customerFrameworks: ['cdp', 'sbti'],
  facilities: [{ id: 'tw', label: '台灣廠', countryCode: 'tw', annualEmissionsTonnes: 0, useInventory: true, renewablePct: 40, activities: [{ id: 'e', factorKey: 'electricity', amount: 10000000 }], highCarbonLeakage: false, rateType: 'general', carbonCreditOffset: 0, hasApprovedReductionPlan: false }],
  cbamProducts: [], scope3: [{ id: 's1', category: 1, label: 'mat', method: 'manual', tonnesDirect: 50000 }, { id: 's11', category: 11, label: 'use', method: 'manual', tonnesDirect: 80000 }],
  year: 2026, baseYear: 2024, baseYearEmissionsTonnes: 6000, targetYear: 2030, targetReductionPct: 30, targetScope: 'scope12', cycleStage: 'assured', products: [{ id: 'pp', name: 'A', annualUnits: 1000 }],
  selfRatings: { cdp: 'C', ecovadis: 'bronze' },
  scorecardCustomers: [ev('蘋果系客戶'), ev('歐系品牌'), { id: 'g', name: '通用客戶', importance: 'major', requirements: [rq('target', 'gate', { minPct: 30, byYear: 2030 }), rq('scope12', 'gate'), rq('scope3', 'gate'), rq('renewable', 'scored', { minPct: 30, points: 2 }), rq('cdp', 'scored', { tier: 'C' })] }],
};

const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const pg = await br.newPage();
await pg.setViewport({ width: 1280, height: 1200, deviceScaleFactor: 2 });
await pg.goto(`${B}/`, { waitUntil: 'networkidle2' });
await pg.evaluate((x) => localStorage.setItem('recc:workbench:profile', JSON.stringify(x)), p);
await pg.goto(`${B}/workbench`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 800));
if (pg.url().endsWith('/')) { await pg.goto(`${B}/workbench`, { waitUntil: 'networkidle2' }); await new Promise((r) => setTimeout(r, 600)); }
for (const b of await pg.$$('button')) { const t = await pg.evaluate((e) => e.textContent || '', b); if (t.includes('計算我的合規全貌')) { await b.click(); break; } }
await new Promise((r) => setTimeout(r, 2600));
const handle = await pg.evaluateHandle(() => {
  const titles = [...document.querySelectorAll('h1,h2,h3,h4,p,span,div')].filter((el) => {
    if (el.tagName === 'A' || el.tagName === 'BUTTON') return false;
    const t = (el.textContent || '').trim(); const r = el.getBoundingClientRect();
    return t.includes('客戶記分卡') && r.height > 0 && r.height < 70 && el.children.length <= 2;
  });
  const hit = titles[titles.length - 1]; if (!hit) return null;
  let el = hit, card = null;
  while (el && el !== document.body) { if (typeof el.className === 'string' && /rounded-(xl|2xl)/.test(el.className) && /(^|\s|:)border(\s|-|$)/.test(el.className)) card = el; el = el.parentElement; }
  return card || hit;
});
const el = handle.asElement();
if (!el) { console.log('✗ scorecard card not found'); process.exit(1); }
await el.evaluate((n) => n.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 300));
await el.screenshot({ path: path.join(outDir, 'g-scorecard.png') });
console.log('✓ g-scorecard.png');
await br.close();
