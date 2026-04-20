// src/viz/fasting-hours/FastingHours.tsx
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { CITIES } from '../../data/cities';
import { sunriseSunset, fajrTime } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import { MONTH_TICKS, dayToMonth } from '../../lib/chartUtils';
import {
  WINTER_SOLSTICE_DAY, SUMMER_SOLSTICE_DAY,
  SPRING_EQUINOX_DAY, AUTUMN_EQUINOX_DAY,
  RAMADAN_2025_START, RAMADAN_2025_END,
} from '../../lib/constants';
import GlowDefs from '../../components/GlowDefs';
import ChartTooltip from '../../components/ChartTooltip';
import StoryCallout from '../../components/StoryCallout';
import { fastingInsight } from '../../lib/insights';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const SEASON_BANDS = [
  { x1: 1,   x2: 79,  fill: 'rgba(30,60,100,0.08)',  label: 'Winter' },
  { x1: 80,  x2: 171, fill: 'rgba(30,100,60,0.08)',  label: 'Spring' },
  { x1: 172, x2: 265, fill: 'rgba(100,60,10,0.08)',  label: 'Summer' },
  { x1: 266, x2: 365, fill: 'rgba(60,30,80,0.08)',   label: 'Autumn' },
] as const;

export default function FastingHours() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx,  setCityIdx]  = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [city2Idx, setCity2Idx] = useState<number | null>(null);

  const city  = CITIES[cityIdx];
  const city2 = city2Idx !== null ? CITIES[city2Idx] : null;

  const buildData = (c: typeof city) =>
    Array.from({ length: 365 }, (_, i) => {
      const n = i + 1;
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(c.dstType, d) ? 1 : 0;
      const loc = { lat: c.lat, lng: c.lng, tz: c.tz + dstOffset };
      const { sunset } = sunriseSunset(loc, d);
      const fajr = fajrTime(loc, d, 18.5);
      return { day: n, hours: isFinite(fajr) && isFinite(sunset) ? sunset - fajr : NaN };
    });

  const data  = useMemo(() => buildData(city),  [city]);
  const data2 = useMemo(() => city2 ? buildData(city2) : null, [city2]);

  // Merge both datasets into one array so recharts uses a single data prop,
  // avoiding per-series `data` which can cause domain/layout recalculation.
  const mergedData = useMemo(
    () => data.map((d, i) => ({ ...d, hours2: data2 ? data2[i]?.hours : undefined })),
    [data, data2],
  );

  const insight = fastingInsight(city, data, city2, data2, lang);
  const isWarning = insight.startsWith('⚠️');
  const ramadanLabel   = lang === 'ar' ? 'رمضان ٢٠٢٥' : "Ramadan '25";
  const extremeLabel   = lang === 'ar' ? 'منطقة قصوى' : 'Extreme zone';

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.city}</span>
          <select value={cityIdx} onChange={(e) => setCityIdx(+e.target.value)}
            className="border rounded-lg px-2 py-1"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{lang === 'ar' ? 'مقارنة مع' : 'Compare'}</span>
          <select value={city2Idx ?? ''} onChange={(e) => setCity2Idx(e.target.value === '' ? null : +e.target.value)}
            className="border rounded-lg px-2 py-1"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            <option value="">{lang === 'ar' ? 'لا شيء' : 'None'}</option>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <GlowDefs />

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={mergedData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            {SEASON_BANDS.map((s) => (
              <ReferenceArea key={s.label} x1={s.x1} x2={s.x2} fill={s.fill} stroke="none" ifOverflow="hidden" />
            ))}

            {/* Ramadan band */}
            <ReferenceArea x1={RAMADAN_2025_START} x2={RAMADAN_2025_END}
              fill="rgba(212,180,131,0.07)" stroke="none"
              label={{ value: ramadanLabel, fill: 'var(--gold)', fontSize: 9, position: 'insideTop' }} />

            {/* Polar extreme zone */}
            <ReferenceArea y1={20} y2={24} fill="rgba(239,68,68,0.06)" stroke="none"
              label={{ value: extremeLabel, fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} />

            {/* Solstice lines */}
            <ReferenceLine x={WINTER_SOLSTICE_DAY} stroke="var(--gold)"    strokeDasharray="2 4" strokeOpacity={0.6}
              label={{ value: '❄', position: 'insideTopLeft', fill: 'var(--gold)',    fontSize: 11 }} />
            <ReferenceLine x={SUMMER_SOLSTICE_DAY} stroke="var(--chart-3)" strokeDasharray="2 4" strokeOpacity={0.6}
              label={{ value: '☀', position: 'insideTopLeft', fill: 'var(--chart-3)', fontSize: 11 }} />
            <ReferenceLine x={SPRING_EQUINOX_DAY}  stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.35} />
            <ReferenceLine x={AUTUMN_EQUINOX_DAY}  stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.35} />

            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis dataKey="day" ticks={MONTH_TICKS} tickFormatter={dayToMonth}
              stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }} />
            <YAxis domain={[0, 24]} stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }} />
            <Tooltip content={
              <ChartTooltip labelFormatter={(d) => dayToMonth(Number(d))} valueFormatter={(v) => `${Number(v).toFixed(1)} hrs`} />
            } />

            <Area type="monotone" dataKey="hours" name="Fasting hours"
              stroke="var(--chart-1)" strokeWidth={2}
              fill="url(#grad-chart1)" filter="url(#glow)"
              dot={false} activeDot={{ r: 4, fill: 'var(--chart-1)' }} />

            {data2 && (
              <Area type="monotone" dataKey="hours2"
                name={`Fasting (${city2?.name.split(',')[0]})`}
                stroke="var(--chart-2)" strokeWidth={1.5} strokeDasharray="4 2"
                fill="none" dot={false} activeDot={{ r: 3, fill: 'var(--chart-2)' }} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <StoryCallout text={insight} warning={isWarning} />
    </div>
  );
}
