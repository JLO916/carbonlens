import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SingaporeCalculatorClient from './client';

export const metadata = {
  title: '新加坡碳稅計算器｜SGD 25→45→80 碳稅成本估算 — CarbonLens',
  description: '免費新加坡碳稅估算工具。依年排放量和年度計算碳稅成本，含2024-2030年費率調升路徑預覽及CBAM交叉抵扣可能性評估。',
};

export default function SingaporePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <SingaporeCalculatorClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
