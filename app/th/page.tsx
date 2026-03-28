import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ThailandClient from './client';
export const metadata = { title: '泰國碳稅試算 | Thailand Carbon Tax Calculator' };
export default function ThailandPage() {
  return (<><Header /><main className="flex-1 bg-gray-50"><div className="max-w-2xl mx-auto px-4 py-8"><ThailandClient /></div></main><Footer /></>);
}
