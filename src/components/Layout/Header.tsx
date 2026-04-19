// src/components/Layout/Header.tsx
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import LangToggle from './LangToggle';
import ThemeToggle from '../ThemeToggle';

export default function Header() {
  const { lang, t } = useLang();
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--header-bg)',
      }}
    >
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to={`/${lang}/`} className="site-title">
          {t('site.title')}
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to={`/${lang}/about`}
            className="no-underline transition-opacity hover:opacity-100"
            style={{ color: 'var(--ink-dim)', fontSize: '.78rem', opacity: 0.75 }}
          >
            {t('nav.about')}
          </Link>
          <LangToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
