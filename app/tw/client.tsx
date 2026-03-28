'use client';

import DomesticCarbonForm from '@/components/calculator/DomesticCarbonForm';
import { taiwanCalculator } from '@/lib/calculators/domestic/taiwan';

export default function TaiwanCalculatorClient() {
  return <DomesticCarbonForm calculator={taiwanCalculator} />;
}
