import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SingaporeCalculatorClient from './client';

export const metadata = {
  title: '新加坡碳稅試算 | Singapore Carbon Tax Calculator',
  description: 'Singapore carbon tax calculator covering 2024-2030 rate schedules with international carbon credit offsets.',
};

export default function SingaporePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <SingaporeCalculatorClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
