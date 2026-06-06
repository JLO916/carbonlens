'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import CurrencySelector from './CurrencySelector';

const TOOLS = {
  calc: [
    { href: '/tw', zhTW: '碳費試算（六國）', en: 'Carbon fee (6 countries)' },
    { href: '/cbam', zhTW: 'CBAM 成本試算', en: 'CBAM calculator' },
    { href: '/compare', zhTW: '跨國比較', en: 'Cross-country compare' },
  ],
  diag: [
    { href: '/diagnose/listed', zhTW: '上市櫃揭露診斷', en: 'Listed disclosure' },
    { href: '/diagnose/supply-chain', zhTW: '供應鏈碳要求', en: 'Supply-chain' },
    { href: '/diagnose/cbam', zhTW: 'CBAM 暴露評估', en: 'CBAM exposure' },
  ],
};

export default function Header() {
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#89B56C] text-sm font-bold text-white">C</div>
            <span className="hidden text-sm font-semibold text-gray-900 sm:block lg:text-base">CarbonLens</span>
          </Link>

          {/* Desktop nav — 5 items, tools collapsed into a dropdown */}
          <nav className="hidden items-center gap-4 sm:flex lg:gap-5">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">{t('首頁', 'Home')}</Link>
            <Link href="/workbench" className="text-sm font-semibold text-[#5d7d44] hover:text-[#89B56C]">{t('工作台', 'Workbench')}</Link>
            <div className="group relative">
              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                {t('個別工具', 'Tools')}
                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-56 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">{t('成本試算', 'Calculators')}</p>
                  {TOOLS.calc.map((x) => (
                    <Link key={x.href} href={x.href} className="block rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">{t(x.zhTW, x.en)}</Link>
                  ))}
                  <p className="mt-1 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">{t('單項診斷', 'Single diagnoses')}</p>
                  {TOOLS.diag.map((x) => (
                    <Link key={x.href} href={x.href} className="block rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">{t(x.zhTW, x.en)}</Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/guide" className="text-sm text-gray-600 hover:text-gray-900">{t('指南', 'Guide')}</Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">{t('關於', 'About')}</Link>
            <CurrencySelector />
            <button onClick={() => setLang(lang === 'zhTW' ? 'en' : 'zhTW')} className="rounded-md border px-2 py-1 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-900">{lang === 'zhTW' ? 'EN' : '中文'}</button>
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 sm:hidden">
            <CurrencySelector />
            <button onClick={() => setLang(lang === 'zhTW' ? 'en' : 'zhTW')} className="rounded-md border px-2 py-1 text-xs text-gray-500">{lang === 'zhTW' ? 'EN' : '中文'}</button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-gray-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="space-y-1 border-t bg-white px-4 py-3 sm:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">{t('首頁', 'Home')}</Link>
          <Link href="/workbench" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#5d7d44]">{t('工作台', 'Workbench')}</Link>
          <p className="pt-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">{t('個別工具', 'Tools')}</p>
          {[...TOOLS.calc, ...TOOLS.diag].map((x) => (
            <Link key={x.href} href={x.href} onClick={() => setMenuOpen(false)} className="block py-1.5 pl-2 text-sm text-gray-700">{t(x.zhTW, x.en)}</Link>
          ))}
          <Link href="/guide" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">{t('指南', 'Guide')}</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">{t('關於', 'About')}</Link>
        </div>
      )}
    </header>
  );
}
