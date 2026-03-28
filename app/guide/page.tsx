import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GuideContent from './content';

export const metadata = {
  title: '使用說明 | User Guide — APAC Carbon Calculator',
  description: 'Step-by-step guide for using the APAC Carbon Cost Calculator. Learn how to calculate domestic carbon costs, EU CBAM obligations, and cross-country comparisons.',
};

export default function GuidePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <GuideContent />
      </main>
      <Footer />
    </>
  );
}
