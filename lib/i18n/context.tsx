'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'zhTW' | 'en';

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
  const [lang, setLang] = useState<Lang>('zhTW');

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
