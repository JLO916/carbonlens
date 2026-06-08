// Capture guide screenshots for the new features (D/E/F/S) — loads a persona into localStorage,
// computes, then element-screenshots the relevant card. Output PNGs; convert to JPEG separately.
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'guide');
const BASE = process.env.BASE || 'http://localhost:3200';

const tw = (extra) => ({ id: 'tw', label: '台灣廠', countryCode: 'tw', annualEmissionsTonnes: 0, useInventory: true, renewablePct: 0, highCarbonLeakage: false, rateType: 'general', carbonCreditOffset: 0, hasApprovedReductionPlan: false, activities: [], ...extra });

const chemicals = {
  schemaVersion: 1, company: '台塑精密化學', industry: 'chemical', listingType: 'listed', capitalTier: 'over100', hasSustainabilityReport: true, employeeBand: 'over1000', businessModel: 'component', exportsToEU: true, exportSupplyChain: true, customerFrameworks: ['sbti', 'cdp'], etsPrice: 80,
  facilities: [tw({ renewablePct: 15, highCarbonLeakage: true, rateType: 'preferB', hasApprovedReductionPlan: true, activities: [{ id: 'e', factorKey: 'electricity', amount: 20000000, dataQuality: 'invoice', uncertaintyPct: 5 }, { id: 'ng', factorKey: 'natural_gas', amount: 5000000, dataQuality: 'invoice', uncertaintyPct: 8 }] })],
  cbamProducts: [], scope3: [{ id: 's1', category: 1, label: '石化原料', method: 'manual', tonnesDirect: 200000 }],
  year: 2026, baseYear: 2024, baseYearEmissionsTonnes: 60000, targetYear: 2030, targetReductionPct: 42, targetScope: 'scope12', cycleStage: 'review',
  extraTargets: [{ id: 't-s3', label: '近期 Scope 3', scope: 'scope3', baseYear: 2024, baseEmissionsTonnes: 250000, targetYear: 2030, targetReductionPct: 25 }, { id: 't-nz', label: '2050 淨零', scope: 'scope123', baseYear: 2024, baseEmissionsTonnes: 280000, targetYear: 2050, targetReductionPct: 90 }],
};

const metal = {
  schemaVersion: 1, company: '鴻昇精密金屬', industry: 'metals', listingType: 'listed', capitalTier: 'over100', hasSustainabilityReport: true, employeeBand: 'over1000', businessModel: 'component', exportsToEU: true, exportSupplyChain: true, customerFrameworks: ['cdp'], etsPrice: 80,
  facilities: [tw({ highCarbonLeakage: true, rateType: 'preferB', hasApprovedReductionPlan: true, activities: [{ id: 'e', factorKey: 'electricity', amount: 4000000 }, { id: 'ng', factorKey: 'natural_gas', amount: 300000 }] })],
  cbamProducts: [{ id: 'c1', label: '鋼件', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 3000, emissionsSource: 'allocated', facilityId: 'tw' }],
  scope3: [], year: 2026, baseYear: 2024, baseYearEmissionsTonnes: 12000, targetYear: 2030, targetReductionPct: 30, targetScope: 'scope12', cycleStage: 'measure',
};

const sme = {
  schemaVersion: 1, company: '宏昇精密', industry: 'electronics', listingType: 'otc', capitalTier: 'under50', hasSustainabilityReport: false, employeeBand: 'from250to999', businessModel: 'odm_oem', exportsToEU: false, exportSupplyChain: true, customerFrameworks: ['cdp', 'sbti'], etsPrice: 80,
  facilities: [tw({ renewablePct: 10, activities: [{ id: 'e', factorKey: 'electricity', amount: 3000000, dataQuality: 'invoice', uncertaintyPct: 5 }, { id: 'ng', factorKey: 'natural_gas', amount: 500000, dataQuality: 'invoice' }] })],
  cbamProducts: [], scope3: [{ id: 's1', category: 1, label: '採購零件', method: 'spend', spend: 200000000, spendFactor: 0.3 }],
  year: 2026, baseYear: 2024, baseYearEmissionsTonnes: 2000, targetYear: 2030, targetReductionPct: 42, targetScope: 'scope12', cycleStage: 'measure',
  products: [{ id: 'pa', name: '連接器 A', annualUnits: 500000, weightPerUnit: 0.02 }, { id: 'pb', name: '模組 B', annualUnits: 50000, weightPerUnit: 0.5 }], pcfBasis: 'mass', pcfBoundary: 'total',
};

const semi = {
  schemaVersion: 1, company: '鴻翔半導體', industry: 'electronics', listingType: 'listed', capitalTier: 'over100', hasSustainabilityReport: true, employeeBand: 'over1000', businessModel: 'odm_oem', exportsToEU: false, exportSupplyChain: true, customerFrameworks: ['sbti', 're100', 'cdp'], etsPrice: 80,
  facilities: [tw({ label: '台灣晶圓廠', renewablePct: 25, activities: [{ id: 'e', factorKey: 'electricity', amount: 800000000, dataQuality: 'invoice', uncertaintyPct: 3 }, { id: 'nf3', factorKey: 'nf3', amount: 5000, dataQuality: 'measured', uncertaintyPct: 10, abatementPct: 95 }, { id: 'cf4', factorKey: 'cf4', amount: 3000, dataQuality: 'measured', uncertaintyPct: 12, abatementPct: 90 }] })],
  cbamProducts: [], scope3: [{ id: 's1', category: 1, label: '矽晶圓', method: 'spend', spend: 8000000000, spendFactor: 0.3 }],
  year: 2026, baseYear: 2024, baseYearEmissionsTonnes: 500000, targetYear: 2030, targetReductionPct: 42, targetScope: 'scope12', cycleStage: 'measure',
};

// jobs: [filename, persona, markerText, {compute, climbCard}]
const jobs = [
  ['g-target', chemicals, '減量目標管理', { compute: true, card: true }],
  ['g-deduction', metal, '交叉抵扣', { compute: true, card: true }],
  ['g-pcf', sme, '產品碳足跡（每料號）', { compute: true, card: true }],
  ['g-questionnaire', sme, '客戶問卷回覆', { compute: true, card: true }],
  ['g-fgas', semi, '查證就緒度', { compute: false, card: false }],
];

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1200, deviceScaleFactor: 2 });
  // establish origin once
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });

  for (const [name, persona, marker, opts] of jobs) {
    await page.evaluate((p) => localStorage.setItem('recc:workbench:profile', JSON.stringify(p)), persona);
    await page.goto(`${BASE}/workbench`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));
    if (page.url().endsWith('/')) { await page.goto(`${BASE}/workbench`, { waitUntil: 'networkidle2' }); await new Promise((r) => setTimeout(r, 600)); }

    if (opts.compute) {
      const btns = await page.$$('button');
      for (const b of btns) { const tx = await page.evaluate((e) => e.textContent || '', b); if (tx.includes('計算我的合規全貌')) { await b.click(); break; } }
      await new Promise((r) => setTimeout(r, 1800));
    }

    const handle = await page.evaluateHandle((marker, climbCard) => {
      if (climbCard) {
        // the card TITLE: a short, leaf-ish element containing the marker — NOT an export link/button
        const titles = [...document.querySelectorAll('h1,h2,h3,h4,p,span,div')].filter((el) => {
          if (el.tagName === 'A' || el.tagName === 'BUTTON') return false;
          if (typeof el.className === 'string' && /underline/.test(el.className)) return false;
          const t = (el.textContent || '').trim();
          const r = el.getBoundingClientRect();
          return t.includes(marker) && r.height > 0 && r.height < 70 && el.children.length <= 2;
        });
        const hit = titles[titles.length - 1]; // results card is LAST in DOM (form same-name card is earlier)
        if (!hit) return null;
        // climb to the OUTERMOST rounded+border ancestor = the Card (skip inner bordered blocks)
        let el = hit, card = null;
        while (el && el !== document.body) {
          if (typeof el.className === 'string' && /rounded-(xl|2xl)/.test(el.className) && /(^|\s|:)border(\s|-|$)/.test(el.className)) card = el;
          el = el.parentElement;
        }
        return card || hit;
      }
      // fgas: smallest div containing BOTH the assurance rollup and an F-gas line
      const cands = [...document.querySelectorAll('div')].filter((d) => { const tx = d.textContent || ''; return tx.includes(marker) && /NF₃|×（1−/.test(tx); });
      cands.sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height);
      return cands.find((d) => d.getBoundingClientRect().height > 220) || cands[0] || null;
    }, marker, opts.card);

    const el = handle.asElement();
    if (!el) { console.log(`✗ ${name}: element not found`); continue; }
    await el.evaluate((n) => n.scrollIntoView({ block: 'center' }));
    await new Promise((r) => setTimeout(r, 300));
    await el.screenshot({ path: path.join(outDir, `${name}.png`) });
    console.log(`✓ ${name}.png`);
  }
  await browser.close();
}
run().catch((e) => { console.error(e); process.exit(1); });
