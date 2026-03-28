import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CBAMForm from '@/components/calculator/CBAMForm';

export const metadata = {
  title: 'EU CBAM 碳邊境調整機制試算 | CBAM Calculator',
  description: '計算歐盟碳邊境調整機制（CBAM）成本 — 涵蓋鋼鐵、鋁、水泥、化肥、氫、電力。',
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
