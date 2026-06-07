import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompareClient from './client';

export const metadata = {
  title: '碳成本跨國比較｜台灣vs韓國vs越南出口歐盟CBAM成本差異 — Carbon Lens 碳排鏡菱',
  description: '比較同一產品從台灣、新加坡、韓國、日本、泰國、越南出口歐盟的CBAM碳關稅成本差異。了解各國碳價抵扣能力對出口競爭力的影響。',
};

export default function ComparePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <CompareClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
