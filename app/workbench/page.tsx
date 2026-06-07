import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WorkbenchClient from './client';

export const metadata = {
  title: '碳合規工作台｜一次看清碳費 × CBAM × IFRS 揭露 × 供應鏈 — Carbon Lens 碳排鏡菱',
  description:
    '填一次公司側寫,同時算出台灣碳費、EU CBAM 暴露(逐年相位導入)、IFRS S1/S2 揭露階段與供應鏈碳壓力,並給跨義務的「先做哪件」優先序。資料只存在你的瀏覽器,免註冊。',
};

export default function WorkbenchPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <WorkbenchClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
