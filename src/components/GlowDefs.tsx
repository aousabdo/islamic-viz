// src/components/GlowDefs.tsx
/**
 * Renders a hidden 0×0 SVG containing shared gradients and glow filters.
 * Place once per chart component, alongside (not inside) <ResponsiveContainer>.
 *
 * IDs registered:
 *   #grad-chart1  — vertical fade, var(--chart-1) teal
 *   #grad-chart2  — vertical fade, var(--chart-2) gold
 *   #glow         — feGaussianBlur merge (stdDeviation 3) for lines
 *   #dot-glow     — feGaussianBlur merge (stdDeviation 2) for scatter dots
 */
export default function GlowDefs() {
  return (
    <svg
      style={{ width: 0, height: 0, position: 'absolute', overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grad-chart1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--chart-1)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="grad-chart2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--chart-2)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
