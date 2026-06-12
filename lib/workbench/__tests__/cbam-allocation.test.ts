import { allocatedCbamSEE, allocatedCbamSEEInfo } from '@/lib/workbench/cbam-allocation';
import { toCbamInputs } from '@/lib/workbench/derive';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';

// Facility (TW): electricity 1,000,000 kWh × 0.474 = 474 t (Scope 2);
//                natural gas 100,000 m³ × 2.1622 = 216.22 t (Scope 1).
function withFacilityInventory(): CompanyProfile {
  const p = emptyProfile();
  p.facilities = [{
    ...p.facilities[0], id: 'f1', countryCode: 'tw', useInventory: true,
    activities: [
      { id: 'e', factorKey: 'electricity', amount: 1_000_000 },
      { id: 'g', factorKey: 'natural_gas', amount: 100_000 },
    ],
  }];
  return p;
}

describe('D3 — CBAM SEE allocated from inventory', () => {
  it('steel = direct-only (Scope 1) ÷ allocated volume', () => {
    const p = withFacilityInventory();
    p.cbamProducts = [{ id: 'c', label: '鋼件', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'allocated', facilityId: 'f1' }];
    // Scope 1 (216.22) ÷ 1000 t = 0.21622 tCO₂e/t
    expect(allocatedCbamSEE(p, p.cbamProducts[0])).toBeCloseTo(0.216, 3);
  });

  it('cement counts indirect → (Scope 1+2) ÷ volume', () => {
    const p = withFacilityInventory();
    p.cbamProducts = [{ id: 'c', label: '水泥', product: 'cement', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'allocated', facilityId: 'f1' }];
    // (216.22 + 474) ÷ 1000 = 0.69022
    expect(allocatedCbamSEE(p, p.cbamProducts[0])).toBeCloseTo(0.690, 3);
  });

  it('splits a facility’s emissions across multiple allocated lines by volume', () => {
    const p = withFacilityInventory();
    p.cbamProducts = [
      { id: 'a', label: '鋼A', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'allocated', facilityId: 'f1' },
      { id: 'b', label: '鋼B', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 500, emissionsSource: 'allocated', facilityId: 'f1' },
    ];
    // Scope 1 216.22 ÷ total 1500 = 0.1441 (same per-tonne for both)
    expect(allocatedCbamSEE(p, p.cbamProducts[0])).toBeCloseTo(0.144, 3);
    expect(allocatedCbamSEE(p, p.cbamProducts[1])).toBeCloseTo(0.144, 3);
  });

  it('undefined without a facility link or inventory', () => {
    const p = withFacilityInventory();
    expect(allocatedCbamSEE(p, { id: 'x', label: '', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'allocated' })).toBeUndefined();
  });

  it('toCbamInputs resolves an allocated line to actual with the derived SEE', () => {
    const p = withFacilityInventory();
    p.cbamProducts = [{ id: 'c', label: '鋼件', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'allocated', facilityId: 'f1' }];
    const input = toCbamInputs(p)[0];
    expect(input.emissionsSource).toBe('actual');
    expect(input.actualSpecificEmissions).toBeCloseTo(0.216, 3);
  });

  it('R4 #3 — facility annual OUTPUT becomes the denominator (activity level, Reg 2023/1773)', () => {
    const p = withFacilityInventory();
    p.cbamProducts = [{ id: 'c', label: '鋼件', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'allocated', facilityId: 'f1', facilityAnnualOutputTonnes: 8000 }];
    const info = allocatedCbamSEEInfo(p, p.cbamProducts[0])!;
    // Scope 1 (216.22) ÷ 8,000 t output = 0.027 — NOT ÷1,000 exports (0.216, ~7× overstated)
    expect(info.see).toBeCloseTo(0.027, 3);
    expect(info.denominatorTonnes).toBe(8000);
    expect(info.exportVolumeFallback).toBe(false);
  });

  it('R4 #3 — missing output falls back to export volume and FLAGS it', () => {
    const p = withFacilityInventory();
    p.cbamProducts = [{ id: 'c', label: '鋼件', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'allocated', facilityId: 'f1' }];
    const info = allocatedCbamSEEInfo(p, p.cbamProducts[0])!;
    expect(info.see).toBeCloseTo(0.216, 3);
    expect(info.exportVolumeFallback).toBe(true);
  });

  it('R4 #3 — an output below the export volume is floored at the export volume (exports ≤ production)', () => {
    const p = withFacilityInventory();
    p.cbamProducts = [{ id: 'c', label: '鋼件', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'allocated', facilityId: 'f1', facilityAnnualOutputTonnes: 500 }];
    const info = allocatedCbamSEEInfo(p, p.cbamProducts[0])!;
    expect(info.denominatorTonnes).toBe(1000);
    expect(info.exportVolumeFallback).toBe(false);
  });
});
