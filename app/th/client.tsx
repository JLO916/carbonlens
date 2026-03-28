'use client';
import DomesticCarbonForm from '@/components/calculator/DomesticCarbonForm';
import { thailandCalculator } from '@/lib/calculators/domestic/thailand';
export default function ThailandClient() { return <DomesticCarbonForm calculator={thailandCalculator} />; }
