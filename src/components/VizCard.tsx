// src/components/VizCard.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/useLang';
import type { VizSlug } from '../data/visualizations';
import Chip from './Chip';
import MiniChart from './MiniChart';

type VizCardProps = {
  slug: VizSlug;
  title: string;
  subtitle: string;
  tag: string;
};

export default function VizCard({ slug, title, subtitle, tag }: VizCardProps) {
  const { lang } = useLang();
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/${lang}/v/${slug}`}
      className="relative block rounded-2xl p-6 no-underline overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--border-h)' : 'var(--border)'}`,
        color: 'var(--ink)',
        boxShadow: hovered ? 'var(--glow-teal)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Radial shimmer — visible on hover */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(77,222,204,0.07) 0%, transparent 60%)',
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="mb-3">
        <Chip>{tag}</Chip>
      </div>

      <h3 className="text-2xl mb-2" style={{ color: 'var(--ink)' }}>
        {title}
      </h3>

      <p className="text-sm mb-4" style={{ color: 'var(--ink-dim)' }}>
        {subtitle}
      </p>

      <MiniChart slug={slug} />

      {/* Hover arrow */}
      <span
        className="absolute bottom-4 right-5 text-lg transition-opacity duration-200"
        style={{ color: 'var(--accent)', opacity: hovered ? 1 : 0 }}
      >
        →
      </span>
    </Link>
  );
}
