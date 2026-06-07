import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JapanClient from './client';
export const metadata = { title: '日本碳稅+GX-ETS計算器｜雙軌碳成本估算 — Carbon Lens 碳排鏡菱', description: '日本碳稅¥289與GX-ETS雙軌制碳成本估算。評估碳稅加配額購買的綜合碳成本及CBAM抵扣可能性。',
};
export default function JapanPage() {
  return (<><Header /><main className="flex-1 bg-gray-50"><div className="max-w-2xl mx-auto px-4 py-8"><JapanClient /></div></main><Footer /></>);
}
