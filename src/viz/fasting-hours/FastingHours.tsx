import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CITIES } from '../../data/cities';
import { sunriseSunset, fajrTime } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

// Fasting hours = (maghrib - fajr); treating maghrib as sunset for simplicity.
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
      const hours = isFinite(fajr) && isFinite(sunset) ? sunset - fajr : NaN;
      out.push({ day: n, hours });
    }
    return out;
  }, [city]);

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
      </div>

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis dataKey="day" stroke="var(--ink-dim)" />
            <YAxis domain={[0, 24]} stroke="var(--ink-dim)" />
            <Tooltip
              formatter={(v) => `${Number(v).toFixed(1)} hrs`}
              labelFormatter={(d) => `Day ${d}`}
            />
            <Area type="monotone" dataKey="hours" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
