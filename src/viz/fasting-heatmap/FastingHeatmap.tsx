// src/viz/fasting-heatmap/FastingHeatmap.tsx
import { useMemo, useState } from 'react';
import { CITIES, type City } from '../../data/cities';
import { sunriseSunset, fajrTime } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import { MONTH_LABELS } from '../../lib/chartUtils';

const HEATMAP_CITY_NAMES = [
  'Helsinki, Finland',
  'Oslo, Norway',
  'Stockholm, Sweden',
  'Moscow, Russia',
  'London, UK',
  'Berlin, Germany',
  'Amsterdam, Netherlands',
  'Paris, France',
  'Toronto, Canada',
  'Istanbul, Turkey',
  'Rome, Italy',
  'New York, USA',
  'Madrid, Spain',
  'Tehran, Iran',
  'Kabul, Afghanistan',
  'Jerusalem, Palestine',
  'Cairo, Egypt',
  'Karachi, Pakistan',
  'Makkah, Saudi Arabia',
  'Mumbai, India',
  'Bangkok, Thailand',
  'Lagos, Nigeria',
  'Kuala Lumpur, Malaysia',
  'Nairobi, Kenya',
  'Singapore',
  'Jakarta, Indonesia',
  'São Paulo, Brazil',
  'Cape Town, South Africa',
  'Sydney, Australia',
  'Buenos Aires, Argentina',
];

function fastingHours(city: City, month0: number): number {
  const d = new Date(Date.UTC(2025, month0, 15));
  const dstOffset = isDST(city.dstType, d) ? 1 : 0;
  const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
  const { sunset } = sunriseSunset(loc, d);
  const fajr = fajrTime(loc, d, 18.5);
  if (!isFinite(fajr) || !isFinite(sunset)) return NaN;
  return Math.max(0, sunset - fajr);
}

function hoursToColor(h: number): string {
  if (!isFinite(h) || h <= 0) return '#1e3a5f';
  if (h < 12) return '#0f766e';
  if (h < 14) return '#4adecc';
  if (h < 16) return '#d4b483';
  if (h < 18) return '#f97316';
  if (h < 20) return '#ea580c';
  return '#ef4444';
}

const CELL_W = 38;
const CELL_H = 26;
const LABEL_W = 140;
const HEADER_H = 28;

export default function FastingHeatmap() {
  const { lang } = useLang();

  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const cities = useMemo(
    () => HEATMAP_CITY_NAMES.map((n) => CITIES.find((c) => c.name === n)).filter(Boolean) as City[],
    [],
  );

  const grid = useMemo(
    () => cities.map((city) => ({
      city,
      months: Array.from({ length: 12 }, (_, m) => fastingHours(city, m)),
    })),
    [cities],
  );

  const svgW = LABEL_W + 12 * CELL_W + 2;
  const svgH = HEADER_H + cities.length * CELL_H + 2;

  const hoursLabel = lang === 'ar' ? 'ساعة' : 'hrs';
  const polarLabel = lang === 'ar' ? 'شذوذ قطبي' : 'polar anomaly';

  return (
    <div>
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 520, position: 'relative' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block' }}>
          {MONTH_LABELS.map((label, m) => (
            <text key={m}
              x={LABEL_W + m * CELL_W + CELL_W / 2}
              y={HEADER_H - 6}
              textAnchor="middle" fontSize={10}
              fill="var(--ink-dim)">
              {label}
            </text>
          ))}

          {grid.map(({ city, months }, row) => {
            const y = HEADER_H + row * CELL_H;
            return (
              <g key={city.name}>
                <text x={LABEL_W - 6} y={y + CELL_H / 2 + 4}
                  textAnchor="end" fontSize={10} fill="var(--ink-dim)">
                  {city.name.split(',')[0]}
                </text>
                {months.map((h, m) => {
                  const x = LABEL_W + m * CELL_W;
                  const color = hoursToColor(h);
                  return (
                    <rect key={m}
                      x={x + 1} y={y + 1}
                      width={CELL_W - 2} height={CELL_H - 2}
                      rx={3} fill={color} opacity={0.85}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const text = isFinite(h)
                          ? `${city.name.split(',')[0]} · ${MONTH_LABELS[m]}: ${h.toFixed(1)} ${hoursLabel}`
                          : `${city.name.split(',')[0]} · ${MONTH_LABELS[m]}: ${polarLabel}`;
                        setTooltip({ x: e.clientX, y: e.clientY, text });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {tooltip && (
          <div style={{
            position: 'fixed',
            left: tooltip.x + 12, top: tooltip.y - 28,
            background: 'var(--bg)', border: '1px solid var(--border-h)',
            borderRadius: 8, padding: '6px 10px', fontSize: 12,
            color: 'var(--ink)', boxShadow: 'var(--glow-teal)',
            pointerEvents: 'none', zIndex: 999,
          }}>
            {tooltip.text}
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap mt-3 text-xs" style={{ color: 'var(--ink-dim)' }}>
        {[
          { color: '#0f766e', label: '< 12h' },
          { color: '#4adecc', label: '12–14h' },
          { color: '#d4b483', label: '14–16h' },
          { color: '#f97316', label: '16–18h' },
          { color: '#ea580c', label: '18–20h' },
          { color: '#ef4444', label: '> 20h' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
