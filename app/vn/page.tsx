import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VietnamClient from './client';
export const metadata = { title: '越南碳定價現況｜ETS試行與CBAM競爭力影響評估 — CarbonLens', description: '越南碳定價現況分析。評估無正式碳價下的CBAM競爭力劣勢，以及未來碳交易試行對出口成本的影響。',
};
export default function VietnamPage() {
  return (<><Header /><main className="flex-1 bg-gray-50"><div className="max-w-2xl mx-auto px-4 py-8"><VietnamClient /></div></main><Footer /></>);
}
