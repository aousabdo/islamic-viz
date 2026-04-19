import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CITIES } from '../../data/cities';
import { CALC_METHODS, getMethod } from '../../data/calc-methods';
import { sunriseSunset, fajrTime, hoursToHHMM } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
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

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">{dict.controls.city}</span>
          <select
            value={cityIdx}
            onChange={(e) => setCityIdx(parseInt(e.target.value, 10))}
            className="border border-rule rounded-lg px-2 py-1 bg-surface"
          >
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">{dict.controls.method}</span>
          <select
            value={methodId}
            onChange={(e) => setMethodId(e.target.value)}
            className="border border-rule rounded-lg px-2 py-1 bg-surface"
          >
            {CALC_METHODS.map((m) => (
              <option key={m.id} value={m.id}>{lang === 'ar' ? m.labelAr : m.labelEn}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="text-sm text-ink-dim mb-2">{cityLabel}</div>

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis dataKey="day" stroke="var(--ink-dim)" />
            <YAxis
              domain={[0, 8]}
              tickFormatter={(h: number) => {
                const { hh, mm } = hoursToHHMM(h);
                return `${hh}:${mm}`;
              }}
              stroke="var(--ink-dim)"
            />
            <Tooltip
              formatter={(v) => {
                const { hh, mm } = hoursToHHMM(Number(v));
                return `${hh}:${mm}`;
              }}
              labelFormatter={(d) => `Day ${d}`}
            />
            <Area type="monotone" dataKey="fajr" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} />
            <Area type="monotone" dataKey="sunrise" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.05} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
