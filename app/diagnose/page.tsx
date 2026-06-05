import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DiagnoseLandingClient from './client';

export const metadata = {
  title: '碳合規暴露診斷工具｜上市櫃揭露・CBAM・供應鏈碳要求 — CarbonLens',
  description:
    '免費碳合規暴露診斷。輸入公司條件，即時判定永續報告書與 IFRS S1/S2 接軌義務、申報時程與急迫度分數，附初步因應清單。每個數字標來源與同步日期。',
};

export default function DiagnosePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <DiagnoseLandingClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
