// src/viz/fajr-globe/FajrGlobe.tsx
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CITIES } from '../../data/cities';
import { CALC_METHODS, getMethod } from '../../data/calc-methods';
import { sunriseSunset, fajrTime, hoursToHHMM } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import { MONTH_TICKS, dayToMonth } from '../../lib/chartUtils';
import GlowDefs from '../../components/GlowDefs';
import ChartTooltip from '../../components/ChartTooltip';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

export default function FajrGlobe() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [methodId, setMethodId] = useState('umm');

  const city = CITIES[cityIdx];
  const method = getMethod(methodId);

  const data = useMemo(() => {
    const out: Array<{ day: number; fajr: number; sunrise: number }> = [];
    for (let n = 1; n <= 365; n++) {
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(city.dstType, d) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const { sunrise } = sunriseSunset(loc, d);
      const fajr = fajrTime(loc, d, method.fajrAngle);
      out.push({ day: n, fajr, sunrise });
    }
    return out;
  }, [city, method]);

  const cityLabel = lang === 'ar' && city.nameAr ? city.nameAr : city.name;

  const fmtHour = (h: number) => {
    const { hh, mm } = hoursToHHMM(h);
    return `${hh}:${mm}`;
  };

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
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.method}</span>
          <select
            value={methodId}
            onChange={(e) => setMethodId(e.target.value)}
            className="border rounded-lg px-2 py-1"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}
          >
            {CALC_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {lang === 'ar' ? m.labelAr : m.labelEn}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="text-sm mb-2" style={{ color: 'var(--ink-dim)' }}>
        {cityLabel}
      </div>

      {/* Hidden SVG defs — must precede ResponsiveContainer in DOM */}
      <GlowDefs />

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />

            <XAxis
              dataKey="day"
              ticks={MONTH_TICKS}
              tickFormatter={dayToMonth}
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
            />
            <YAxis
              domain={[0, 8]}
              tickFormatter={fmtHour}
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
            />

            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(d) => dayToMonth(Number(d))}
                  valueFormatter={(v) => fmtHour(Number(v))}
                />
              }
            />

            <Area
              type="monotone"
              dataKey="fajr"
              name="Fajr"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#grad-chart1)"
              filter="url(#glow)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--chart-1)' }}
            />
            <Area
              type="monotone"
              dataKey="sunrise"
              name="Sunrise"
              stroke="var(--chart-2)"
              strokeWidth={1.5}
              fill="url(#grad-chart2)"
              filter="url(#glow)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--chart-2)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
