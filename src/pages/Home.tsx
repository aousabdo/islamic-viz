// src/pages/Home.tsx
import { useLang } from '../i18n/useLang';
import Container from '../components/Layout/Container';
import VizCard from '../components/VizCard';
import { VIZ_ORDER, VISUALIZATIONS } from '../data/visualizations';

type CardContent = { title: string; subtitle: string; tag: string };

const contentModules = import.meta.glob('../viz/*/content.{en,ar}.json', {
  eager: true,
}) as Record<string, { default: CardContent }>;

export default function Home() {
  const { t, lang } = useLang();

  const heroTitle =
    lang === 'ar' ? (
      <>
        مركز{' '}
        <span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>
          التصورات
        </span>{' '}
        الإسلامية
      </>
    ) : (
      <>
        Islamic{' '}
        <span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>
          Viz
        </span>{' '}
        Hub
      </>
    );

  const heroEyebrow =
    lang === 'ar'
      ? 'خمس نوافذ إلى العلوم الإسلامية'
      : 'Five windows into Islamic science';

  return (
    <Container>
      {/* Hero */}
      <section className="relative text-center pt-16 pb-12 overflow-hidden">
        {/* Radial teal glow behind the hero text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(77,222,204,0.08) 0%, transparent 70%)',
          }}
        />
        <p
          className="mb-4 uppercase tracking-[.2em] text-xs font-semibold"
          style={{ color: 'var(--accent)' }}
        >
          {heroEyebrow}
        </p>
        <h1
          className="mb-5"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            lineHeight: 1.15,
            color: 'var(--ink)',
          }}
        >
          {heroTitle}
        </h1>
        <p
          className="mx-auto text-lg"
          style={{ color: 'var(--ink-dim)', maxWidth: 480 }}
        >
          {t('site.tagline')}
        </p>
      </section>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {VIZ_ORDER.filter((slug) => VISUALIZATIONS[slug] !== null).map((slug) => {
          const key = `../viz/${slug}/content.${lang}.json`;
          const content = contentModules[key]?.default;
          if (!content) return null;
          return <VizCard key={slug} slug={slug} {...content} />;
        })}
      </div>
    </Container>
  );
}
