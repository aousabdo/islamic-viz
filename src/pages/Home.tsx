import { useLang } from '../i18n/useLang';
export default function Home() {
  const { t } = useLang();
  return <h1 className="text-5xl">{t('site.title')}</h1>;
}
