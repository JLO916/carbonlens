'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import CurrencySelector from './CurrencySelector';

export default function Header() {
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#89B56C] flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block text-sm lg:text-base">
              CarbonLens
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-3 lg:gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">{t('首頁', 'Home')}</Link>
            <Link href="/workbench" className="text-sm font-semibold text-[#5d7d44] hover:text-[#89B56C]">{t('工作台', 'Workbench')}</Link>
            <Link href="/diagnose" className="text-sm text-gray-600 hover:text-gray-900">{t('合規診斷', 'Diagnose')}</Link>
            <Link href="/tw" className="text-sm text-gray-600 hover:text-gray-900">{t('碳費試算', 'Calculator')}</Link>
            <Link href="/cbam" className="text-sm text-gray-600 hover:text-gray-900">CBAM</Link>
            <Link href="/compare" className="text-sm text-gray-600 hover:text-gray-900">{t('跨國比較', 'Compare')}</Link>
            <Link href="/guide" className="text-sm text-gray-600 hover:text-gray-900">{t('使用說明', 'Guide')}</Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">{t('關於', 'About')}</Link>
            <CurrencySelector />
            <button
              onClick={() => setLang(lang === 'zhTW' ? 'en' : 'zhTW')}
              className="text-xs px-2 py-1 border rounded-md text-gray-500 hover:text-gray-900 hover:border-gray-400"
            >
              {lang === 'zhTW' ? 'EN' : '中文'}
            </button>
          </nav>

          {/* Mobile */}
          <div className="flex sm:hidden items-center gap-2">
            <CurrencySelector />
            <button
              onClick={() => setLang(lang === 'zhTW' ? 'en' : 'zhTW')}
              className="text-xs px-2 py-1 border rounded-md text-gray-500"
            >
              {lang === 'zhTW' ? 'EN' : '中文'}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t bg-white px-4 py-3 space-y-2">
          <Link href="/" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">{t('首頁', 'Home')}</Link>
          <Link href="/workbench" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#5d7d44]">{t('工作台', 'Workbench')}</Link>
          <Link href="/diagnose" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">{t('合規診斷', 'Diagnose')}</Link>
          <Link href="/tw" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">{t('碳費試算', 'Calculator')}</Link>
          <Link href="/cbam" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">CBAM</Link>
          <Link href="/compare" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">{t('跨國比較', 'Compare')}</Link>
          <Link href="/guide" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">{t('使用說明', 'Guide')}</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">{t('關於', 'About')}</Link>
        </div>
      )}
    </header>
  );
}
