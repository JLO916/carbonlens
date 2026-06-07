import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TaiwanCalculatorClient from './client';

export const metadata = {
  title: '台灣碳費試算器｜一般費率vs優惠費率比較、高碳洩漏CL係數模擬 — Carbon Lens 碳排鏡菱',
  description: '台灣碳費免費試算工具。比較一般費率NT\$300、優惠B NT\$100、優惠A NT\$50三種方案的十年累計成本。支援高碳洩漏風險CL係數三期模擬、碳費門檻敏感度分析。',
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
