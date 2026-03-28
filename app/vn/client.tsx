'use client';
import DomesticCarbonForm from '@/components/calculator/DomesticCarbonForm';
import { vietnamCalculator } from '@/lib/calculators/domestic/vietnam';
export default function VietnamClient() { return <DomesticCarbonForm calculator={vietnamCalculator} />; }
