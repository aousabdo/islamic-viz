// src/viz/fasting-hours/FastingHours.tsx
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { CITIES } from '../../data/cities';
import { sunriseSunset, fajrTime } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import { MONTH_TICKS, dayToMonth } from '../../lib/chartUtils';
import GlowDefs from '../../components/GlowDefs';
import ChartTooltip from '../../components/ChartTooltip';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

// Subtle season background fills — same values in both themes; low-opacity so
// they don't fight the dark/light background.
const SEASON_BANDS = [
  { y1: 1,   y2: 79,  fill: 'rgba(30,60,100,0.08)',  label: 'Winter' },
  { y1: 80,  y2: 171, fill: 'rgba(30,100,60,0.08)',  label: 'Spring' },
  { y1: 172, y2: 265, fill: 'rgba(100,60,10,0.08)',  label: 'Summer' },
  { y1: 266, y2: 355, fill: 'rgba(60,30,80,0.08)',   label: 'Autumn' },
] as const;

// Fasting hours = maghrib (sunset) minus fajr.
export default function FastingHours() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const city = CITIES[cityIdx];

  const data = useMemo(() => {
    const out: Array<{ day: number; hours: number }> = [];
    for (let n = 1; n <= 365; n++) {
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(city.dstType, d) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const { sunset } = sunriseSunset(loc, d);
      const fajr = fajrTime(loc, d, 18.5);
      const hours =
        isFinite(fajr) && isFinite(sunset) ? sunset - fajr : NaN;
      out.push({ day: n, hours });
    }
    return out;
  }, [city]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.city}</span>
          <select
            value={cityIdx}
            onChange={(e) => setCityIdx(parseInt(e.target.value, 10))}
            className="border rounded-lg px-2 py-1"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}
          >
            {CITIES.map((c, i) => (
              <option key={c.name} value={i}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      <GlowDefs />

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            {/* Season background bands — rendered first so they sit behind everything */}
            {SEASON_BANDS.map((s) => (
              <ReferenceArea
                key={s.label}
                x1={s.y1}
                x2={s.y2}
                fill={s.fill}
                stroke="none"
                ifOverflow="hidden"
              />
            ))}

            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />

            <XAxis
              dataKey="day"
              ticks={MONTH_TICKS}
              tickFormatter={dayToMonth}
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
            />
            <YAxis
              domain={[0, 24]}
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
            />

            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(d) => dayToMonth(Number(d))}
                  valueFormatter={(v) => `${Number(v).toFixed(1)} hrs`}
                />
              }
            />

            <Area
              type="monotone"
              dataKey="hours"
              name="Fasting hours"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#grad-chart1)"
              filter="url(#glow)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--chart-1)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
