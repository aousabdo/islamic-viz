import { useLang } from '../../i18n/useLang';

export default function LangToggle() {
  const { lang, setLang, t } = useLang();
  const other = lang === 'en' ? 'ar' : 'en';
  return (
    <button
      onClick={() => setLang(other)}
      aria-label={t('lang.toggle')}
      className="text-sm px-3 py-1 rounded-lg border border-rule text-ink-dim hover:text-accent hover:border-accent transition"
    >
      {t('lang.toggle')}
    </button>
  );
}
