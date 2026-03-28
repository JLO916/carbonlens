// CBAM free allocation phase-out factors (percentage of free allowances remaining)
export const CBAM_PHASE_OUT_FACTORS: Record<number, number> = {
  2026: 0.975, // 97.5% free → only 2.5% CBAM applies
  2027: 0.95,
  2028: 0.90,
  2029: 0.825,
  2030: 0.75,
  2031: 0.65,
  2032: 0.50,
  2033: 0.25,
  2034: 0,    // 100% CBAM applies
};

// Default emission surcharges for using default values instead of actual
export const DEFAULT_EMISSION_SURCHARGES: Record<number, number> = {
  2026: 0.10, // +10%
  2027: 0.20, // +20%
  2028: 0.30, // +30%
};

// Default specific embedded emissions by product type (tCO₂e per tonne of product)
export const DEFAULT_EMBEDDED_EMISSIONS: Record<string, number> = {
  'steel_bof': 2.1,       // Blast furnace - Basic oxygen furnace
  'steel_eaf': 0.4,       // Electric arc furnace
  'steel_avg': 1.85,      // Average
  'aluminum_primary': 8.6,
  'aluminum_secondary': 0.5,
  'cement_clinker': 0.85,
  'cement_portland': 0.65,
  'fertilizer_urea': 2.3,
  'fertilizer_ammonia': 1.6,
  'hydrogen_smr': 9.0,
  'hydrogen_electrolysis': 0.0,
  'electricity': 0.45,    // tCO₂e per MWh
};

// Product type options for form
export const CBAM_PRODUCT_TYPES = [
  { value: 'steel_bof', label: { zhTW: '鋼鐵（高爐-轉爐）', en: 'Steel (BF-BOF)' } },
  { value: 'steel_eaf', label: { zhTW: '鋼鐵（電弧爐）', en: 'Steel (EAF)' } },
  { value: 'steel_avg', label: { zhTW: '鋼鐵（平均）', en: 'Steel (Average)' } },
  { value: 'aluminum_primary', label: { zhTW: '鋁（原生）', en: 'Aluminum (Primary)' } },
  { value: 'aluminum_secondary', label: { zhTW: '鋁（再生）', en: 'Aluminum (Secondary)' } },
  { value: 'cement_clinker', label: { zhTW: '水泥（熟料）', en: 'Cement (Clinker)' } },
  { value: 'cement_portland', label: { zhTW: '水泥（波特蘭）', en: 'Cement (Portland)' } },
  { value: 'fertilizer_urea', label: { zhTW: '化肥（尿素）', en: 'Fertilizer (Urea)' } },
  { value: 'fertilizer_ammonia', label: { zhTW: '化肥（氨）', en: 'Fertilizer (Ammonia)' } },
  { value: 'hydrogen_smr', label: { zhTW: '氫（蒸氣重組）', en: 'Hydrogen (SMR)' } },
  { value: 'electricity', label: { zhTW: '電力', en: 'Electricity' } },
];

// EU ETS free allocation benchmarks (tCO₂e per tonne of product)
// Used to calculate free allocation that offsets CBAM obligations
export const EU_BENCHMARKS: Record<string, number> = {
  'steel_bof': 1.286,       // Hot metal benchmark
  'steel_eaf': 0.283,       // EAF carbon steel
  'steel_avg': 1.286,       // Use BF-BOF as conservative default
  'aluminum_primary': 1.514,
  'aluminum_secondary': 0.0, // No benchmark for secondary
  'cement_clinker': 0.766,
  'cement_portland': 0.766,  // Use clinker as proxy
  'fertilizer_urea': 0.742,
  'fertilizer_ammonia': 1.619,
  'hydrogen_smr': 8.85,
  'hydrogen_electrolysis': 0.0,
  'electricity': 0.0,       // No free allocation for electricity
};

// De minimis threshold (tonnes)
export const DE_MINIMIS_THRESHOLD = 50;
