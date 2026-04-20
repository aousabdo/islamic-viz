// src/viz/prayer-day/PrayerDay.tsx
import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';
import { CITIES } from '../../data/cities';
import { CALC_METHODS, getMethod } from '../../data/calc-methods';
import {
  fajrTime, sunriseSunset, solarNoon, asrTime, ishaTime, hoursToHHMM,
} from '../../lib/solar';
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
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

type PrayerPoint = {
  day: number;
  fajr: number; sunrise: number; dhuhr: number; asr: number; maghrib: number; isha: number;
};

const PRAYER_LINES = [
  { key: 'fajr',    color: 'var(--chart-1)', label: 'Fajr'    },
  { key: 'sunrise', color: 'rgba(140,200,255,0.5)', label: 'Sunrise' },
  { key: 'dhuhr',   color: 'var(--gold)',    label: 'Dhuhr'   },
  { key: 'asr',     color: 'var(--chart-3)', label: 'Asr'     },
  { key: 'maghrib', color: 'var(--chart-5)', label: 'Maghrib' },
  { key: 'isha',    color: 'var(--chart-4)', label: 'Isha'    },
] as const;

export default function PrayerDay() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx,  setCityIdx]  = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [methodId, setMethodId] = useState('umm');

  const city   = CITIES[cityIdx];
  const method = getMethod(methodId);

  const data = useMemo<PrayerPoint[]>(() => {
    return Array.from({ length: 365 }, (_, i) => {
      const n = i + 1;
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(city.dstType, d) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const { sunrise, sunset } = sunriseSunset(loc, d);
      const isha = method.ishaMode.kind === 'angle'
        ? ishaTime(loc, d, method.ishaMode.angle)
        : sunset + method.ishaMode.minutes / 60;
      return {
        day: n,
        fajr:    fajrTime(loc, d, method.fajrAngle),
        sunrise,
        dhuhr:   solarNoon(loc, d),
        asr:     asrTime(loc, d, 1),
        maghrib: sunset,
        isha,
      };
    });
  }, [city, method]);

  const fmtHour = (h: number) => { const { hh, mm } = hoursToHHMM(h); return `${hh}:${mm}`; };

  const validFajr = data.filter(p => isFinite(p.fajr));
  const minFajr = validFajr.length ? Math.min(...validFajr.map(p => p.fajr)) : 0;
  const maxIsha = Math.max(...data.filter(p => isFinite(p.isha)).map(p => p.isha));
  const cn = city.name.split(',')[0];
  const ramadanLabel = lang === 'ar' ? 'رمضان ٢٠٢٥' : "Ramadan '25";
  const insightText = lang === 'ar'
    ? `في ${city.nameAr ?? cn}، يبدأ الفجر باكرًا على مدار السنة عند ${fmtHour(minFajr)}، وتمتد العشاء حتى ${fmtHour(maxIsha)} في ذروتها — فارق يعكس تنفُّس اليوم الفلكي الإسلامي.`
    : `In ${cn}, Fajr opens as early as ${fmtHour(minFajr)} and Isha closes as late as ${fmtHour(maxIsha)} — the full span of the Islamic astronomical day.`;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.city}</span>
          <select value={cityIdx} onChange={(e) => setCityIdx(+e.target.value)}
            className="border rounded-lg px-2 py-1" style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.method}</span>
          <select value={methodId} onChange={(e) => setMethodId(e.target.value)}
            className="border rounded-lg px-2 py-1" style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            {CALC_METHODS.map((m) => (
              <option key={m.id} value={m.id}>{lang === 'ar' ? m.labelAr : m.labelEn}</option>
            ))}
          </select>
        </label>
      </div>

      <GlowDefs />

      <div style={{ width: '100%', height: 460 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <ReferenceArea x1={RAMADAN_2025_START} x2={RAMADAN_2025_END}
              fill="rgba(212,180,131,0.07)" stroke="none"
              label={{ value: ramadanLabel, fill: 'var(--gold)', fontSize: 9, position: 'insideTop' }} />

            <ReferenceLine x={WINTER_SOLSTICE_DAY} stroke="var(--gold)" strokeDasharray="2 4" strokeOpacity={0.5}
              label={{ value: '❄', position: 'insideTopLeft', fill: 'var(--gold)', fontSize: 11 }} />
            <ReferenceLine x={SUMMER_SOLSTICE_DAY} stroke="var(--chart-3)" strokeDasharray="2 4" strokeOpacity={0.5}
              label={{ value: '☀', position: 'insideTopLeft', fill: 'var(--chart-3)', fontSize: 11 }} />
            <ReferenceLine x={SPRING_EQUINOX_DAY}  stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.3} />
            <ReferenceLine x={AUTUMN_EQUINOX_DAY}  stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.3} />

            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis dataKey="day" ticks={MONTH_TICKS} tickFormatter={dayToMonth}
              stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }} />
            <YAxis domain={[0, 26]} tickFormatter={fmtHour}
              stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }} />
            <Tooltip content={
              <ChartTooltip labelFormatter={(d) => dayToMonth(Number(d))} valueFormatter={(v) => fmtHour(Number(v))} />
            } />
            <Legend wrapperStyle={{ color: 'var(--ink-dim)', fontSize: 12 }} />

            {PRAYER_LINES.map(({ key, color, label }) => (
              <Line key={key} type="monotone" dataKey={key} name={label}
                stroke={color} strokeWidth={key === 'sunrise' ? 1 : 2}
                dot={false} activeDot={{ r: 3 }} connectNulls={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <StoryCallout text={insightText} />
    </div>
  );
}
