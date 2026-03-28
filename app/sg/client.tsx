'use client';

import DomesticCarbonForm from '@/components/calculator/DomesticCarbonForm';
import { singaporeCalculator } from '@/lib/calculators/domestic/singapore';

export default function SingaporeCalculatorClient() {
  return <DomesticCarbonForm calculator={singaporeCalculator} />;
}
