import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JapanClient from './client';
export const metadata = { title: '日本碳稅+GX-ETS 試算 | Japan Carbon Tax + GX-ETS Calculator' };
export default function JapanPage() {
  return (<><Header /><main className="flex-1 bg-gray-50"><div className="max-w-2xl mx-auto px-4 py-8"><JapanClient /></div></main><Footer /></>);
}
