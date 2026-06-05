import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ListedDiagnoseClient from './client';

export const metadata = {
  title: '上市櫃永續揭露診斷｜GRI 報告書・IFRS S1/S2 接軌階段與時程 — CarbonLens',
  description:
    '輸入上市櫃別、實收資本額級距與是否已編報告書，即時判定永續報告書義務、IFRS S1/S2 接軌第幾階段、哪年編製與申報、Scope 1/2/3 揭露範圍與合規急迫度分數。',
};

export default function ListedDiagnosePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <ListedDiagnoseClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
