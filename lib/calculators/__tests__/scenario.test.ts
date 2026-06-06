import { generateScenario } from '@/lib/calculators/scenario';
import { cbamFactorForYear } from '@/lib/diagnose/data/cbam';

// Regression pin: the CBAM ramp migrated from the old CBAM_EFFECTIVE_RATE table to the sourced
// cbamFactorForYear (Directive 2003/87/EC 10a(1a)). Values CHANGE at 2029–2033 — this locks the
// corrected numbers so /tw and /compare can't silently drift back.
describe('generateScenario — CBAM cost on the sourced factor', () => {
  const s = generateScenario('tw', 100_000, 32.5);
  const at = (y: number) => s.find((p) => p.year === y)!;

  it('2025 transitional → no CBAM cost', () => {
    expect(at(2025).cbamCostEUR).toBe(0);
  });
  it('2026 factor 2.5% → €200,000 (unchanged)', () => {
    expect(at(2026).cbamCostEUR).toBe(100_000 * 80 * 0.025);
  });
  it('2030 factor corrected 0.25 → 0.485 → €3,880,000 (was €2,000,000)', () => {
    expect(at(2030).cbamCostEUR).toBe(100_000 * 80 * 0.485);
    expect(at(2030).cbamCostEUR).toBe(3_880_000);
  });
  it('2034 full → €8,000,000', () => {
    expect(at(2034).cbamCostEUR).toBe(100_000 * 80 * 1.0);
  });
  it('cbamFactorForYear boundary: <2026 = 0, ≥2034 = 1', () => {
    expect(cbamFactorForYear(2025)).toBe(0);
    expect(cbamFactorForYear(2035)).toBe(1);
  });
});
