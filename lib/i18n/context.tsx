'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'zhTW' | 'en';

const LANG_KEY = 'recc:lang';

/** R4 #9 — read the persisted/deep-linked language. `?lang=en|zh` wins (shareable), then
 *  localStorage. SSR-safe: returns null off the client so the first render stays deterministic. */
function readInitialLang(): Lang | null {
  if (typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en') return 'en';
    if (q === 'zh' || q === 'zhTW' || q === 'zh-TW') return 'zhTW';
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'zhTW') return stored;
  } catch { /* ignore */ }
  return null;
}

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (zhTW: string, en: string) => string;
  tObj: (obj: { zhTW: string; en: string }) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'zhTW',
  setLang: () => {},
  t: (zhTW) => zhTW,
  tObj: (obj) => obj.zhTW,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  // SSR/first paint = zhTW (deterministic, no hydration mismatch); sync to the persisted/?lang value
  // right after mount.
  const [lang, setLangState] = useState<Lang>('zhTW');

  useEffect(() => {
    const initial = readInitialLang();
    if (initial && initial !== 'zhTW') setLangState(initial);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try { window.localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
  };

  const t = (zhTW: string, en: string) => (lang === 'zhTW' ? zhTW : en);
  const tObj = (obj: { zhTW: string; en: string }) => (lang === 'zhTW' ? obj.zhTW : obj.en);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, tObj }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
