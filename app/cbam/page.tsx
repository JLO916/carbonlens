import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CBAMForm from '@/components/calculator/CBAMForm';

export const metadata = {
  title: 'CBAM碳關稅計算器｜歐盟碳邊境調整機制成本評估 — CarbonLens',
  description: '免費CBAM成本評估工具。從亞洲出口企業角度評估歐盟進口商面臨的碳關稅成本，比較實際排放數據vs預設值的成本差異，以及各國碳價CBAM抵扣可能性。',
};

export default function CBAMPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <CBAMForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
