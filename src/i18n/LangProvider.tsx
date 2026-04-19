import React, { createContext, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import chromeEn from './chrome.en.json';
import chromeAr from './chrome.ar.json';
import { formatNumber, formatDate, type Lang } from '../lib/format';

type Dir = 'ltr' | 'rtl';

export type VizDict = Record<string, unknown>;

type LangContextValue = {
  lang: Lang;
  dir: Dir;
  t: (key: string) => string;
  tn: (n: number, opts?: Intl.NumberFormatOptions) => string;
  td: (d: Date, opts: Intl.DateTimeFormatOptions & { calendar: 'gregory' | 'islamic-umalqura' }) => string;
  setLang: (next: Lang) => void;
  vizDict: VizDict | null;
};

export const LangContext = createContext<LangContextValue | null>(null);

const chrome: Record<Lang, Record<string, string>> = { en: chromeEn, ar: chromeAr };

export function LangProvider({ lang, children, vizDict = null }: { lang: Lang; children: React.ReactNode; vizDict?: VizDict | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dir: Dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  }, [lang, dir]);

  const value = useMemo<LangContextValue>(() => ({
    lang,
    dir,
    t: (key) => chrome[lang][key] ?? key,
    tn: (n, opts) => formatNumber(n, lang, opts),
    td: (d, opts) => formatDate(d, lang, opts),
    setLang: (next) => {
      const nextPath = location.pathname.replace(/^\/(en|ar)(\/|$)/, `/${next}$2`);
      navigate(nextPath + location.search, { replace: false });
    },
    vizDict,
  }), [lang, dir, location, navigate, vizDict]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
