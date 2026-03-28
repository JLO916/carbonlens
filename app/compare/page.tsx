import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompareClient from './client';

export const metadata = {
  title: '跨國碳成本比較 | Cross-Country Carbon Cost Comparison',
  description: 'Compare carbon costs across six APAC countries under the same emissions assumptions.',
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
