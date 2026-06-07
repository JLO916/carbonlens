import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SupplyChainDiagnoseClient from './client';

export const metadata = {
  title: '供應鏈碳要求診斷｜RE100・SBTi・CDP 預期被要求側寫 — Carbon Lens 碳排鏡菱',
  description:
    '依品牌客戶的公開承諾（RE100／SBTi／CDP）側寫您預期被要求的供應鏈碳壓力，說明 Scope 3 為何落在供應商、傳導機制與 CSRD 價值鏈上限保護。定性風險側寫，非金額損失。',
};

export default function SupplyChainDiagnosePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <SupplyChainDiagnoseClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
