import { Outlet, useParams } from 'react-router-dom';
import { LangProvider } from '../i18n/LangProvider';
import type { Lang } from '../lib/format';

export default function LangRoot() {
  const { lang } = useParams<{ lang: string }>();
  const resolved: Lang = lang === 'ar' ? 'ar' : 'en';
  return (
    <LangProvider lang={resolved}>
      <Outlet />
    </LangProvider>
  );
}
