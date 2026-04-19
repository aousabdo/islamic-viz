import { Outlet, useParams } from 'react-router-dom';
import { LangProvider } from '../i18n/LangProvider';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import type { Lang } from '../lib/format';

export default function LangRoot() {
  const { lang } = useParams<{ lang: string }>();
  const resolved: Lang = lang === 'ar' ? 'ar' : 'en';
  return (
    <LangProvider lang={resolved}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-10"><Outlet /></main>
        <Footer />
      </div>
    </LangProvider>
  );
}
