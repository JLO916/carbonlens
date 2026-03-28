'use client';
import DomesticCarbonForm from '@/components/calculator/DomesticCarbonForm';
import { japanCalculator } from '@/lib/calculators/domestic/japan';
export default function JapanClient() { return <DomesticCarbonForm calculator={japanCalculator} />; }
