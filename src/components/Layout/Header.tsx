import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import Container from './Container';
import LangToggle from './LangToggle';

export default function Header() {
  const { lang, t } = useLang();
  return (
    <header className="border-b border-rule bg-surface/60 backdrop-blur">
      <Container className="py-4 flex items-center justify-between">
        <Link to={`/${lang}/`} className="text-xl text-ink no-underline">
          {t('site.title')}
        </Link>
        <nav className="flex items-center gap-6">
          <Link to={`/${lang}/about`} className="text-sm text-ink-dim hover:text-accent">
            {t('nav.about')}
          </Link>
          <LangToggle />
        </nav>
      </Container>
    </header>
  );
}
