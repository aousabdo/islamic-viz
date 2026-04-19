import { useLang } from '../i18n/useLang';
export default function About() {
  const { t } = useLang();
  return <h1 className="text-4xl">{t('nav.about')}</h1>;
}
