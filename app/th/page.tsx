import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ThailandClient from './client';
export const metadata = { title: '泰國碳稅計算器｜THB200碳稅成本估算 — CarbonLens', description: '泰國碳稅THB200/tCO₂e成本估算工具。支援燃料消費量和用電量兩種計算模式，含CBAM抵扣可能性評估。',
};
export default function ThailandPage() {
  return (<><Header /><main className="flex-1 bg-gray-50"><div className="max-w-2xl mx-auto px-4 py-8"><ThailandClient /></div></main><Footer /></>);
}
