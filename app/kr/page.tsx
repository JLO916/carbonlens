import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import KoreaClient from './client';
export const metadata = { title: '韓國K-ETS碳交易計算器｜配額成本與CBAM抵扣評估 — CarbonLens', description: '韓國排放交易制度K-ETS碳成本估算。計算配額購買成本，評估K-ETS碳價的CBAM抵扣可能性。',
};
export default function KoreaPage() {
  return (<><Header /><main className="flex-1 bg-gray-50"><div className="max-w-2xl mx-auto px-4 py-8"><KoreaClient /></div></main><Footer /></>);
}
