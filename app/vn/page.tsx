import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VietnamClient from './client';
export const metadata = { title: '越南碳定價試算 | Vietnam Carbon Pricing Calculator' };
export default function VietnamPage() {
  return (<><Header /><main className="flex-1 bg-gray-50"><div className="max-w-2xl mx-auto px-4 py-8"><VietnamClient /></div></main><Footer /></>);
}
