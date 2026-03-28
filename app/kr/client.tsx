'use client';
import DomesticCarbonForm from '@/components/calculator/DomesticCarbonForm';
import { koreaCalculator } from '@/lib/calculators/domestic/korea';
export default function KoreaClient() { return <DomesticCarbonForm calculator={koreaCalculator} />; }
