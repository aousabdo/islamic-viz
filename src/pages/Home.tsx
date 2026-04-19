import { useLang } from '../i18n/useLang';
import Container from '../components/Layout/Container';
import VizCard from '../components/VizCard';
import { VIZ_ORDER, VISUALIZATIONS } from '../data/visualizations';

type CardContent = { title: string; subtitle: string; tag: string };

const contentModules = import.meta.glob('../viz/*/content.{en,ar}.json', { eager: true }) as Record<string, { default: CardContent }>;

export default function Home() {
  const { t, lang } = useLang();
  return (
    <Container>
      <header className="text-center mb-12 mt-6">
        <h1 className="text-6xl mb-4">{t('site.title')}</h1>
        <p className="text-ink-dim text-xl">{t('site.tagline')}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
