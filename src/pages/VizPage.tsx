// src/pages/VizPage.tsx
import { useParams, Link } from 'react-router-dom';
import { VISUALIZATIONS, type VizSlug } from '../data/visualizations';
import { useLang } from '../i18n/useLang';
import Container from '../components/Layout/Container';
import Chip from '../components/Chip';
import Disclosure from '../components/Disclosure';

type VizContent = {
  title: string;
  subtitle: string;
  tag: string;
  explainer: Array<{ type: 'p'; text: string }>;
  methodology: Array<{ type: 'p'; text: string }>;
};

const contentModules = import.meta.glob('../viz/*/content.{en,ar}.json', {
  eager: true,
}) as Record<string, { default: VizContent }>;

function loadContent(slug: VizSlug, lang: 'en' | 'ar'): VizContent | null {
  const key = `../viz/${slug}/content.${lang}.json`;
  return contentModules[key]?.default ?? null;
}

export default function VizPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLang();
  const config =
    slug && slug in VISUALIZATIONS ? VISUALIZATIONS[slug as VizSlug] : null;

  if (!config) {
    return (
      <Container>
        <h1 className="text-4xl mt-8">{t('notfound.title')}</h1>
      </Container>
    );
  }

  const content = loadContent(config.slug, lang);
  if (!content) {
    return (
      <Container>
        <h1 className="text-4xl mt-8">Content missing for {config.slug}</h1>
      </Container>
    );
  }

  const Chart = config.Chart;

  return (
    <Container className="pt-8 pb-16">
      <div className="mb-6">
        <Chip>{content.tag}</Chip>
      </div>

      <h1 className="text-5xl mb-3" style={{ color: 'var(--ink)' }}>
        {content.title}
      </h1>
      <p className="text-lg mb-8" style={{ color: 'var(--ink-dim)' }}>
        {content.subtitle}
      </p>

      {/* Chart card */}
      <div
        className="rounded-2xl p-4 mb-8"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <Chart />
      </div>

      <div className="prose prose-lg max-w-none" style={{ color: 'var(--ink)' }}>
        {content.explainer.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </div>

      <Disclosure summary={t('viz.methodology')}>
        {content.methodology.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </Disclosure>

      <div
        className="flex items-center justify-between mt-10 pt-6 text-sm"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <Link to={`/${lang}/`} style={{ color: 'var(--accent)' }}>
          {t('viz.back')}
        </Link>
      </div>
    </Container>
  );
}
