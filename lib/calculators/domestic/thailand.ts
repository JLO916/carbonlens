import { FormFieldConfig } from '@/lib/types';
import { convertToUSD, convertToEUR } from '@/lib/data/exchange-rates';
import { DomesticCarbonPriceCalculator, DomesticInput, DomesticResult } from './types';

const CARBON_TAX_RATE = 200; // THB/tCO₂e

// Emission factors by fuel type (tCO₂ per litre)
const FUEL_EMISSION_FACTORS: Record<string, number> = {
  diesel: 0.0026,
  gasoline: 0.0023,
  lpg: 0.0016,
  fuel_oil: 0.0031,
};

// Electricity emission factor (tCO₂ per kWh)
const ELECTRICITY_EMISSION_FACTOR = 0.000519; // 0.519 kgCO₂/kWh

export const thailandCalculator: DomesticCarbonPriceCalculator = {
  countryCode: 'th',
  countryName: { zhTW: '泰國', en: 'Thailand' },
  mechanismType: 'carbon_tax',

  calculate(input: DomesticInput): DomesticResult {
    const {
      inputMode = 'direct', // 'direct' or 'fuel'
      dieselLitres = 0,
      gasolineLitres = 0,
      lpgLitres = 0,
      fuelOilLitres = 0,
      electricityKwh = 0,
    } = input.countrySpecific;

    const notes: string[] = ['th_excise_embedded', 'th_cbam_deduction_uncertain'];

    let totalEmissions: number;

    if (inputMode === 'fuel') {
      const fuelEmissions =
        dieselLitres * FUEL_EMISSION_FACTORS.diesel +
        gasolineLitres * FUEL_EMISSION_FACTORS.gasoline +
        lpgLitres * FUEL_EMISSION_FACTORS.lpg +
        fuelOilLitres * FUEL_EMISSION_FACTORS.fuel_oil;
      const elecEmissions = electricityKwh * ELECTRICITY_EMISSION_FACTOR;
      totalEmissions = fuelEmissions + elecEmissions;
    } else {
      totalEmissions = input.annualEmissions;
    }

    const totalCarbonCost = totalEmissions * CARBON_TAX_RATE;
    const effectiveRate = totalEmissions > 0 ? CARBON_TAX_RATE : 0;
    const totalCarbonCostUSD = convertToUSD(totalCarbonCost, 'THB');
    const effectiveRateUSD = convertToUSD(effectiveRate, 'THB');
    const deductibleForCBAM = convertToEUR(totalCarbonCost, 'THB');

    const breakdown = [
      { step: 'th_step_emissions', value: totalEmissions, unit: 'tCO₂e', explanation: 'th_step_emissions_desc' },
      { step: 'th_step_rate', value: CARBON_TAX_RATE, unit: 'THB/tCO₂e', explanation: 'th_step_rate_desc' },
      { step: 'th_step_total_cost', value: totalCarbonCost, unit: 'THB', explanation: 'th_step_total_cost_desc' },
    ];

    return {
      totalCarbonCost,
      totalCarbonCostUSD,
      effectiveRate,
      effectiveRateUSD,
      currency: 'THB',
      chargeableEmissions: totalEmissions,
      breakdown,
      deductibleForCBAM,
      notes,
    };
  },

  getFormFields(): FormFieldConfig[] {
    return [
      {
        key: 'inputMode',
        type: 'select',
        label: { zhTW: '輸入方式', en: 'Input Mode' },
        options: [
          { value: 'direct', label: { zhTW: '直接輸入排放量', en: 'Direct Emissions Input' } },
          { value: 'fuel', label: { zhTW: '依燃料消費量計算', en: 'Calculate from Fuel Consumption' } },
        ],
        defaultValue: 'direct',
        required: true,
      },
      {
        key: 'dieselLitres',
        type: 'number',
        label: { zhTW: '柴油年消費量（公升）', en: 'Annual Diesel Consumption (litres)' },
        defaultValue: 0,
        required: false,
        tooltip: { zhTW: '排放因子 0.0026 tCO₂/L', en: 'Emission factor: 0.0026 tCO₂/L' },
      },
      {
        key: 'electricityKwh',
        type: 'number',
        label: { zhTW: '年用電量（kWh）', en: 'Annual Electricity (kWh)' },
        defaultValue: 0,
        required: false,
        tooltip: { zhTW: '排放因子 0.519 kgCO₂/kWh', en: 'Emission factor: 0.519 kgCO₂/kWh' },
      },
    ];
  },

  getDefaultParams() {
    return { inputMode: 'direct', dieselLitres: 0, gasolineLitres: 0, lpgLitres: 0, fuelOilLitres: 0, electricityKwh: 0 };
  },
};
