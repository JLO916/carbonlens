import { CountryCode } from '@/lib/types';
import { DomesticCarbonPriceCalculator } from './types';
import { taiwanCalculator } from './taiwan';
import { singaporeCalculator } from './singapore';
import { koreaCalculator } from './korea';
import { japanCalculator } from './japan';
import { thailandCalculator } from './thailand';
import { vietnamCalculator } from './vietnam';

const calculators: Record<CountryCode, DomesticCarbonPriceCalculator> = {
  tw: taiwanCalculator,
  sg: singaporeCalculator,
  kr: koreaCalculator,
  jp: japanCalculator,
  th: thailandCalculator,
  vn: vietnamCalculator,
};

export function getCalculator(countryCode: CountryCode): DomesticCarbonPriceCalculator {
  return calculators[countryCode];
}

export function getAvailableCountries(): CountryCode[] {
  return Object.keys(calculators) as CountryCode[];
}
