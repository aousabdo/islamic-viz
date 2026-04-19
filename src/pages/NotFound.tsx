import { useLang } from '../i18n/useLang';
import { Link } from 'react-router-dom';
export default function NotFound() {
  const { t, lang } = useLang();
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-4xl mb-4">{t('notfound.title')}</h1>
      <p className="text-ink-dim mb-6">{t('notfound.body')}</p>
      <Link to={`/${lang}/`}>{t('notfound.home')}</Link>
    </div>
  );
}
