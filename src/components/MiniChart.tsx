// src/components/MiniChart.tsx
import type { VizSlug } from '../data/visualizations';

/** Short unique prefix per slug for SVG gradient/filter IDs */
const P: Record<VizSlug, string> = {
  'fajr-globe':          'fg',
  'fasting-hours':       'fh',
  'hijri-drift':         'hd',
  'sun-path-asr':        'sp',
  'qibla-great-circle':  'qg',
};

export default function MiniChart({ slug }: { slug: VizSlug }) {
  const p = P[slug];

  switch (slug) {
    case 'fajr-globe':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          {/* Fajr teal curve (U-shaped, lower in summer) */}
          <path
            d="M0 32 C22 40 40 24 50 28 C65 33 80 20 100 28"
            stroke="var(--chart-1)"
            strokeWidth="1.5"
          />
          {/* Sunrise gold curve (above Fajr) */}
          <path
            d="M0 24 C22 32 40 16 50 20 C65 25 80 12 100 20"
            stroke="var(--chart-2)"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
        </svg>
      );

    case 'fasting-hours':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${p}-g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--chart-1)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Peak in summer (middle of year) */}
          <path d="M0 38 Q50 4 100 38 L100 44 L0 44 Z" fill={`url(#${p}-g)`} />
          <path d="M0 38 Q50 4 100 38" stroke="var(--chart-1)" strokeWidth="1.5" />
        </svg>
      );

    case 'hijri-drift':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          {/* Diagonal scatter — teal for first half of Gregorian year, gold for second */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <circle
              key={i}
              cx={6 + i * 11}
              cy={6 + (i * 4) % 36}
              r={2.5}
              fill={i < 5 ? 'var(--chart-1)' : 'var(--chart-2)'}
              fillOpacity={0.85}
            />
          ))}
        </svg>
      );

    case 'sun-path-asr':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${p}-s`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#1e3a5f" />
              <stop offset="25%"  stopColor="#f97316" />
              <stop offset="50%"  stopColor="#fbbf24" />
              <stop offset="75%"  stopColor="#f97316" />
              <stop offset="100%" stopColor="#1e3a5f" />
            </linearGradient>
          </defs>
          {/* Ground */}
          <line x1="3" y1="40" x2="97" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {/* Sun arc with gradient stroke */}
          <path d="M4 40 Q50 3 96 40" stroke={`url(#${p}-s)`} strokeWidth="2" />
          {/* Asr marker */}
          <line x1="65" y1="12" x2="65" y2="40" stroke="var(--chart-1)" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'qibla-great-circle':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          {/* Ocean background */}
          <rect width="100" height="44" fill="var(--bg)" rx="4" />
          {/* Simplified land outline */}
          <rect
            x="4" y="4" width="92" height="36" rx="2"
            fill="var(--map-land)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
          {/* Great-circle arc */}
          <path d="M18 22 Q50 8 82 22" stroke="var(--chart-1)" strokeWidth="1.5" />
          {/* City dot */}
          <circle cx="18" cy="22" r="2.5" fill="var(--chart-2)" />
          {/* Makkah dot */}
          <circle cx="82" cy="22" r="3" fill="var(--chart-1)" />
        </svg>
      );

    default:
      return null;
  }
}
