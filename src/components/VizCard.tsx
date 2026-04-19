import { Link } from 'react-router-dom';
import { useLang } from '../i18n/useLang';
import type { VizSlug } from '../data/visualizations';
import Chip from './Chip';

type VizCardProps = {
  slug: VizSlug;
  title: string;
  subtitle: string;
  tag: string;
};

export default function VizCard({ slug, title, subtitle, tag }: VizCardProps) {
  const { lang } = useLang();
  return (
    <Link
      to={`/${lang}/v/${slug}`}
      className="block bg-surface rounded-2xl border border-rule p-6 hover:shadow-md transition no-underline text-ink"
    >
      <div className="mb-3"><Chip>{tag}</Chip></div>
      <h3 className="text-2xl mb-2">{title}</h3>
      <p className="text-ink-dim text-sm">{subtitle}</p>
    </Link>
  );
}
