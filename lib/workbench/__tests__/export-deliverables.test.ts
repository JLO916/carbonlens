import { inventorySheetCsv, disclosureReportText, cbamCommunicationCsv } from '@/lib/workbench/export-deliverables';
import { computeWorkbench } from '@/lib/workbench/aggregate';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';

function inventoryProfile(): CompanyProfile {
  const p = emptyProfile();
  p.company = '測試鋼鐵';
  p.facilities = [{
    ...p.facilities[0],
    useInventory: true,
    activities: [
      { id: 'e', factorKey: 'electricity', amount: 1_200_000, dataQuality: 'invoice', evidenceNote: '台電電費單 2025' },
      { id: 'd', factorKey: 'diesel', amount: 5_000 },
    ],
  }];
  return p;
}

describe('P2a deliverables — inventory sheet CSV', () => {
  it('emits a header, one row per activity line with lineage, and Scope 1/2/total', () => {
    const csv = inventorySheetCsv(inventoryProfile(), 'zhTW');
    const lines = csv.split('\n');
    expect(lines[0]).toContain('排放源');
    expect(lines[0]).toContain('排放量(tCO₂e)');
    // electricity line: 1,200,000 kWh × 0.474 = 568.8 t, source 能源署, evidence carried
    const elec = lines.find((l) => l.includes('外購電力'))!;
    expect(elec).toContain('568.8');
    expect(elec).toContain('能源署');
    expect(elec).toContain('台電電費單 2025');
    // totals
    expect(csv).toContain('合計 Scope 2 (tCO₂e)');
    expect(csv).toContain('568.8'); // scope 2 total
    expect(csv).toMatch(/總計 \(tCO₂e\)[^\n]*581\.8/);
  });

  it('escapes commas (evidence text) so columns stay aligned', () => {
    const p = inventoryProfile();
    p.facilities[0].activities![0].evidenceNote = '發票 A, 發票 B';
    const csv = inventorySheetCsv(p, 'zhTW');
    expect(csv).toContain('"發票 A, 發票 B"');
  });
});

describe('P2a deliverables — IFRS S2 disclosure draft', () => {
  it('fills the four pillars with the computed numbers and flags it as a draft', () => {
    const p = emptyProfile(); // typed 50,000 t facility
    p.company = '測試扣件';
    p.baseYear = 2024;
    const result = computeWorkbench(p);
    const text = disclosureReportText(p, result, 'zhTW');
    expect(text).toContain('一、治理');
    expect(text).toContain('二、策略');
    expect(text).toContain('三、風險與機會管理');
    expect(text).toContain('四、指標與目標');
    expect(text).toContain('50,000 tCO₂e'); // total emissions from the typed facility
    expect(text).toContain('基準年:2024');
    expect(text).toContain('〔請設定減量目標。〕'); // no target set → placeholder, not fabricated
    expect(text).toContain('非經第三方查證'); // honest disclaimer
  });
});

describe('P2a deliverables — CBAM communication template', () => {
  it('steel official-default line: direct-only scope + pending SEE (NOT fabricated)', () => {
    const p = emptyProfile(); // default: 1 steel line, official_default
    const csv = cbamCommunicationCsv(p, 'zhTW');
    expect(csv).toContain('CN'); // header
    const row = csv.split('\n').find((l) => l.includes('出口品項 1'))!;
    expect(row).toContain('僅直接(鋼/鋁/氫)'); // steel = direct-only (A2/Annex II)
    expect(row).toContain('官方預設值'); // data basis
    expect(csv).toContain('官方預設值待解鎖'); // pending, not a fabricated number
    expect(csv).toContain('2023/956'); // cites the regulation
  });

  it('actual-data line carries the entered SEE', () => {
    const p = emptyProfile();
    p.cbamProducts[0] = { ...p.cbamProducts[0], emissionsSource: 'actual', actualSpecificEmissions: 1.85 };
    const csv = cbamCommunicationCsv(p, 'zhTW');
    expect(csv.split('\n').find((l) => l.includes('出口品項 1'))).toContain('1.85');
  });
});
