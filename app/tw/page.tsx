import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TaiwanCalculatorClient from './client';

export const metadata = {
  title: '台灣碳費試算 | Taiwan Carbon Fee Calculator',
  description: '台灣碳費計算器 — 依環境部碳費三子法，計算一般費率、優惠 A/B 費率及高碳洩漏產業碳費。',
};

export default function TaiwanPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <TaiwanCalculatorClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
