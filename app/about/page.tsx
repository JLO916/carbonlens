import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutContent from './content';

export const metadata = {
  title: '關於 Carbon Lens 碳排鏡菱 | About Carbon Lens 碳排鏡菱',
  description: 'Carbon Lens 碳排鏡菱 is a free carbon cost calculator for Asia-Pacific, independently built and maintained by Jimmy Lo.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <AboutContent />
      </main>
      <Footer />
    </>
  );
}
