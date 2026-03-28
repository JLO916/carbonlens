import { CBAMInput, CBAMResult, CostBreakdown } from '@/lib/types';
import {
  CBAM_PHASE_OUT_FACTORS,
  DEFAULT_EMISSION_SURCHARGES,
  DEFAULT_EMBEDDED_EMISSIONS,
  EU_BENCHMARKS,
  DE_MINIMIS_THRESHOLD,
} from '@/lib/data/cbam-defaults';
import { DEFAULT_EXCHANGE_RATES } from '@/lib/data/exchange-rates';

/**
 * CBAM cost = (grossEmissions - freeAllocation) × EU_ETS_price - domesticDeduction
 *
 * Where:
 *   grossEmissions  = importVolume × specificEmbeddedEmissions
 *   freeAllocation  = EU_benchmark × phaseOutFactor × importVolume
 *   phaseOutFactor  = CBAM_PHASE_OUT_FACTORS[year]  (the % of free allowances still given)
 */
export function calculateCBAM(input: CBAMInput): CBAMResult {
  const {
    productType,
    importVolume,
    specificEmbeddedEmissions,
    useDefaultEmissions,
    year,
    euEtsPrice,
    domesticCarbonPricePaid,
  } = input;

  const breakdown: CostBreakdown[] = [];
  const notes: string[] = [];

  // Step 1: De minimis exemption
  if (importVolume <= DE_MINIMIS_THRESHOLD && productType !== 'electricity' && productType !== 'hydrogen_smr') {
    return {
      totalCBAMCost: 0,
      totalCBAMCostUSD: 0,
      grossEmissions: 0,
      freeAllocation: 0,
      netEmissions: 0,
      cbamFactor: 0,
      cbamCertificatePrice: euEtsPrice,
      domesticCreditDeduction: 0,
      netCBAMCost: 0,
      breakdown: [{
        step: 'cbam_de_minimis',
        value: importVolume,
        unit: 'tonnes',
        explanation: 'cbam_de_minimis_exempt',
      }],
      notes: ['cbam_de_minimis_note'],
      isExempt: true,
    };
  }

  // Step 2: Determine specific embedded emissions
  let emissions = specificEmbeddedEmissions;
  if (useDefaultEmissions) {
    emissions = DEFAULT_EMBEDDED_EMISSIONS[productType] ?? 1.85;
    const surchargeYear = Math.min(year, 2028);
    const surcharge = DEFAULT_EMISSION_SURCHARGES[surchargeYear] ?? 0.30;
    emissions = emissions * (1 + surcharge);
    notes.push('cbam_default_emissions_note');
  }

  // Step 3: Gross embedded emissions
  const grossEmissions = importVolume * emissions;

  breakdown.push(
    { step: 'cbam_step_import_volume', value: importVolume, unit: 'tonnes', explanation: 'cbam_step_import_volume_desc' },
    { step: 'cbam_step_specific_emissions', value: emissions, unit: 'tCO₂e/t', explanation: useDefaultEmissions ? 'cbam_step_default_emissions_desc' : 'cbam_step_actual_emissions_desc' },
    { step: 'cbam_step_gross_emissions', value: grossEmissions, unit: 'tCO₂e', explanation: 'cbam_step_gross_emissions_desc' },
  );

  // Step 4: EU benchmark & free allocation
  const euBenchmark = input.euBenchmark ?? EU_BENCHMARKS[productType] ?? 0;
  const phaseOutYear = Math.min(Math.max(year, 2026), 2034);
  const phaseOutFactor = CBAM_PHASE_OUT_FACTORS[phaseOutYear] ?? 0;
  const freeAllocation = euBenchmark * phaseOutFactor * importVolume;

  breakdown.push(
    { step: 'cbam_step_eu_benchmark', value: euBenchmark, unit: 'tCO₂e/t', explanation: 'cbam_step_eu_benchmark_desc' },
    { step: 'cbam_step_phase_out_factor', value: phaseOutFactor, unit: '', explanation: 'cbam_step_phase_out_factor_desc' },
    { step: 'cbam_step_free_allocation', value: freeAllocation, unit: 'tCO₂e', explanation: 'cbam_step_free_allocation_desc' },
  );

  // Step 5: Net emissions = gross - free allocation (floor at 0)
  const netEmissions = Math.max(0, grossEmissions - freeAllocation);

  breakdown.push(
    { step: 'cbam_step_net_emissions', value: netEmissions, unit: 'tCO₂e', explanation: 'cbam_step_net_emissions_desc' },
  );

  // Step 6: Gross CBAM cost
  const cbamCertificatePrice = euEtsPrice;
  const grossCBAMCost = netEmissions * cbamCertificatePrice;

  breakdown.push(
    { step: 'cbam_step_certificate_price', value: cbamCertificatePrice, unit: 'EUR/tCO₂e', explanation: 'cbam_step_certificate_price_desc' },
    { step: 'cbam_step_gross_cost', value: grossCBAMCost, unit: 'EUR', explanation: 'cbam_step_gross_cost_desc' },
  );

  // Step 7: Domestic carbon price deduction (EUR total)
  const domesticDeduction = domesticCarbonPricePaid;

  breakdown.push(
    { step: 'cbam_step_domestic_deduction', value: domesticDeduction, unit: 'EUR', explanation: 'cbam_step_domestic_deduction_desc' },
  );

  // Step 8: Net CBAM cost
  const netCBAMCost = Math.max(0, grossCBAMCost - domesticDeduction);

  breakdown.push(
    { step: 'cbam_step_net_cost', value: netCBAMCost, unit: 'EUR', explanation: 'cbam_step_net_cost_desc' },
  );

  return {
    totalCBAMCost: grossCBAMCost,
    totalCBAMCostUSD: grossCBAMCost / DEFAULT_EXCHANGE_RATES.EUR,
    grossEmissions,
    freeAllocation,
    netEmissions,
    cbamFactor: phaseOutFactor,
    cbamCertificatePrice,
    domesticCreditDeduction: domesticDeduction,
    netCBAMCost,
    breakdown,
    notes,
    isExempt: false,
  };
}
