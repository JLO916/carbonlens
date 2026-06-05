import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CbamDiagnoseClient from './client';

export const metadata = {
  title: 'CBAM 暴露診斷｜歐盟碳邊境調整條件式暴露與時程 — CarbonLens',
  description:
    '出口歐盟的 CBAM 暴露評估:以實際排放數據＋當前 ETS 價算指示性條件式暴露區間,附時程(2026 定義期、2027/2 憑證、2027/9/30 申報)、罰則與 de minimis。官方預設值走定期同步,通過驗證前以占位呈現。',
};

export default function CbamDiagnosePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <CbamDiagnoseClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
