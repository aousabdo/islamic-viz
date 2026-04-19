import { useMemo, useState } from 'react';
import { CITIES } from '../../data/cities';
import { sunAltitude, sunriseSunset, asrTime, solarNoon, hoursToHHMM } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 720, H = 360;
const PADDING_X = 40, PADDING_Y = 40;

export default function SunPathAsr() {
  const { lang } = useLang();
  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [dateIso, setDateIso] = useState('2025-06-21');
  const city = CITIES[cityIdx];
  const date = new Date(dateIso + 'T00:00:00Z');
  const dict = lang === 'ar' ? contentAr : contentEn;

  const { points, sunrise, sunset, noon, asrShafii, asrHanafi, maxAlt } = useMemo(() => {
    const dstOffset = isDST(city.dstType, date) ? 1 : 0;
    const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
    const { sunrise, sunset } = sunriseSunset(loc, date);
    const noon = solarNoon(loc, date);
    const pts: Array<{ h: number; alt: number }> = [];
    for (let h = 0; h <= 24; h += 0.1) {
      pts.push({ h, alt: sunAltitude(loc, date, h) });
    }
    const maxAlt = Math.max(...pts.map((p) => p.alt));
    return {
      points: pts,
      sunrise,
      sunset,
      noon,
      asrShafii: asrTime(loc, date, 1),
      asrHanafi: asrTime(loc, date, 2),
      maxAlt: Math.max(90, Math.ceil(maxAlt / 10) * 10),
    };
  }, [city, date]);

  const xScale = (h: number) => PADDING_X + ((h - 0) / 24) * (W - 2 * PADDING_X);
  const yScale = (alt: number) => H - PADDING_Y - Math.max(0, alt / maxAlt) * (H - 2 * PADDING_Y);

  const path = points
    .filter((p) => p.alt > 0)
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.h).toFixed(1)},${yScale(p.alt).toFixed(1)}`)
    .join(' ');

  const fmt = (h: number) => {
    const { hh, mm } = hoursToHHMM(h);
    return `${hh}:${mm}`;
  };

  const timeMarkers = [
    { h: sunrise, label: dict.labels.sunrise },
    { h: noon, label: dict.labels.noon },
    { h: sunset, label: dict.labels.sunset },
  ];

  const asrMarkers = [
    { time: asrShafii, color: 'var(--accent)', label: dict.labels.shafii, dy: -8 },
    { time: asrHanafi, color: 'var(--chart-2)', label: dict.labels.hanafi, dy: 18 },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">{dict.controls.city}</span>
          <select value={cityIdx} onChange={(e) => setCityIdx(parseInt(e.target.value, 10))} className="border border-rule rounded-lg px-2 py-1 bg-surface">
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">{dict.controls.date}</span>
          <input type="date" value={dateIso} onChange={(e) => setDateIso(e.target.value)} className="border border-rule rounded-lg px-2 py-1 bg-surface" />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* ground line */}
        <line x1={PADDING_X} y1={H - PADDING_Y} x2={W - PADDING_X} y2={H - PADDING_Y} stroke="var(--rule)" />

        {/* sun arc */}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} />

        {/* Asr markers */}
        {asrMarkers.map((m, i) => {
          if (!isFinite(m.time)) return null;
          const x = xScale(m.time);
          return (
            <g key={i}>
              <line x1={x} y1={PADDING_Y} x2={x} y2={H - PADDING_Y} stroke={m.color} strokeDasharray="3 4" />
              <text x={x + 4} y={PADDING_Y + 14 + m.dy} fontSize={12} fill={m.color}>{m.label} · {fmt(m.time)}</text>
            </g>
          );
        })}

        {/* sunrise/noon/sunset ticks */}
        {timeMarkers.map((tk, i) => {
          if (!isFinite(tk.h)) return null;
          const x = xScale(tk.h);
          return (
            <g key={i}>
              <line x1={x} y1={H - PADDING_Y - 4} x2={x} y2={H - PADDING_Y + 4} stroke="var(--ink-dim)" />
              <text x={x} y={H - PADDING_Y + 18} fontSize={11} fill="var(--ink-dim)" textAnchor="middle">{tk.label}</text>
              <text x={x} y={H - PADDING_Y + 32} fontSize={10} fill="var(--ink-dim)" textAnchor="middle">{fmt(tk.h)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
