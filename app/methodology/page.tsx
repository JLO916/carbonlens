import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MethodologyContent from './content';

export const metadata = {
  title: '方法論與來源｜每個數字標一手法源 — CarbonLens',
  description:
    '碳費依氣候變遷因應法第 29 條與碳費收費辦法;CBAM 依 Regulation (EU) 2023/956 附則;IFRS/GRI 依金管會。資料紅線:每個法規數字標一手來源,不編造、不估算未驗證值。',
};

export default function MethodologyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <MethodologyContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
