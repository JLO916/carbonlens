import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import KoreaClient from './client';
export const metadata = { title: '韓國 K-ETS 試算 | South Korea K-ETS Calculator' };
export default function KoreaPage() {
  return (<><Header /><main className="flex-1 bg-gray-50"><div className="max-w-2xl mx-auto px-4 py-8"><KoreaClient /></div></main><Footer /></>);
}
