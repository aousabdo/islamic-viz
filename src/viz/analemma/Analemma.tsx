import { useEffect, useMemo, useRef, useState } from 'react';
import { CITIES } from '../../data/cities';
import { sunAltitude, solarNoon } from '../../lib/solar';
import { useLang } from '../../i18n/useLang';
import { dayToMonth } from '../../lib/chartUtils';
import GlowDefs from '../../components/GlowDefs';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 480;
const H = 480;
const PAD = 40;

type Pt = { day: number; az: number; alt: number };

function ptColor(day: number): string {
  if (day <= 79)  return '#4adecc'; // winter→spring
  if (day <= 171) return '#7cc87a'; // spring
  if (day <= 265) return '#d4b483'; // summer
  return '#8b7ec8';                 // autumn/winter
}

export default function Analemma() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [dayShown, setDayShown] = useState(365);
  const [playing, setPlaying]   = useState(false);
  const animRef = useRef<number>(0);

  const city = CITIES[cityIdx];

  const pts = useMemo<Pt[]>(() => {
    const out: Pt[] = [];
    for (let n = 1; n <= 365; n++) {
      const d = new Date(Date.UTC(2025, 0, n));
      // Use standard time (no DST) so the analemma samples the sun at the same
      // clock time year-round. Applying DST causes a 1-hour jump at DST
      // transitions that breaks the figure-8 continuity for DST cities.
      const loc  = { lat: city.lat, lng: city.lng, tz: city.tz };
      // Use hour angle at clock noon as the x-axis. This equals (equation of time + longitude
      // offset from tz meridian) × 15°/hr and traces a smooth, continuous figure-8 for every
      // latitude — including tropical cities where the sun crosses the zenith (azimuth has a
      // physical ±180° discontinuity at the zenith that splits the figure into disconnected blobs).
      const noon = solarNoon(loc, d);
      const az   = (12.0 - noon) * 15;  // positive = sun is west of meridian at clock noon
      const alt  = sunAltitude(loc, d, 12.0);
      if (isFinite(alt) && alt > 0) out.push({ day: n, az, alt });
    }
    return out;
  }, [city]);

  useEffect(() => {
    if (!playing) { cancelAnimationFrame(animRef.current); return; }
    let last = 0;
    const tick = (ts: number) => {
      const dt = last ? (ts - last) / 1000 : 0;
      last = ts;
      setDayShown((d) => {
        const next = d + dt * 60;
        if (next >= 365) { setPlaying(false); return 365; }
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  if (pts.length === 0) return <div>No data</div>;

  const visiblePts = pts.filter((p) => p.day <= dayShown);

  const allAz  = pts.map((p) => p.az);
  const allAlt = pts.map((p) => p.alt);
  const azMin  = Math.min(...allAz)  - 2;
  const azMax  = Math.max(...allAz)  + 2;
  const altMin = Math.min(...allAlt) - 2;
  const altMax = Math.max(...allAlt) + 2;

  const xScale = (az: number)  => PAD + ((az  - azMin)  / (azMax  - azMin))  * (W - 2 * PAD);
  const yScale = (alt: number) => H - PAD - ((alt - altMin) / (altMax - altMin)) * (H - 2 * PAD);

  const lastPt = visiblePts[visiblePts.length - 1];

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.city}</span>
          <select value={cityIdx} onChange={(e) => { setCityIdx(+e.target.value); setDayShown(365); setPlaying(false); }}
            className="border rounded-lg px-2 py-1" style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <button onClick={() => { if (!playing) setDayShown(1); setPlaying((p) => !p); }}
          style={{
            padding: '4px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
            background: playing ? 'rgba(249,115,22,0.15)' : 'rgba(74,222,204,0.12)',
            border: `1px solid ${playing ? 'rgba(249,115,22,0.4)' : 'rgba(74,222,204,0.35)'}`,
            color: playing ? 'var(--chart-3)' : 'var(--accent)',
          }}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        {!playing && (
          <input type="range" min={1} max={365} value={Math.round(dayShown)}
            onChange={(e) => setDayShown(+e.target.value)}
            style={{ flex: 1, accentColor: 'var(--accent)' }} />
        )}
        {lastPt && (
          <span style={{ color: 'var(--ink-dim)', fontSize: 12 }}>
            {dayToMonth(lastPt.day)} {Math.round(dayShown)}
          </span>
        )}
      </div>

      <GlowDefs />

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', display: 'block', margin: '0 auto' }}>
        {/* Axis labels */}
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="var(--ink-dim)">
          {lang === 'ar' ? 'معادلة الوقت — الشرق ← → الغرب (°)' : 'Equation of time — East ← → West (°)'}
        </text>
        <text x={8} y={H / 2} textAnchor="middle" fontSize={10} fill="var(--ink-dim)"
          transform={`rotate(-90, 8, ${H / 2})`}>
          {lang === 'ar' ? 'الارتفاع (°)' : 'Altitude (°)'}
        </text>

        {/* ha = 0 line: clock noon coincides with solar noon (equation of time = 0) */}
        {(() => {
          const x0 = xScale(0);
          return <line x1={x0} y1={PAD} x2={x0} y2={H - PAD} stroke="var(--rule)" strokeWidth={1} strokeDasharray="3 3" />;
        })()}

        {/* Dots */}
        {visiblePts.map((p) => (
          <circle key={p.day}
            cx={xScale(p.az)} cy={yScale(p.alt)}
            r={2.5} fill={ptColor(p.day)} opacity={0.7} />
        ))}

        {/* Current day highlight */}
        {lastPt && (
          <>
            <circle cx={xScale(lastPt.az)} cy={yScale(lastPt.alt)} r={6}
              fill="var(--accent)" filter="url(#dot-glow)" opacity={0.95} />
            <text x={xScale(lastPt.az) + 8} y={yScale(lastPt.alt) + 4}
              fontSize={9} fill="var(--accent)">{dayToMonth(lastPt.day)}</text>
          </>
        )}

        {/* Season legend */}
        {[
          { color: '#4adecc', label: lang === 'ar' ? 'شتاء/ربيع' : 'Winter/Spring' },
          { color: '#7cc87a', label: lang === 'ar' ? 'ربيع' : 'Spring' },
          { color: '#d4b483', label: lang === 'ar' ? 'صيف' : 'Summer' },
          { color: '#8b7ec8', label: lang === 'ar' ? 'خريف' : 'Autumn' },
        ].map(({ color, label }, i) => (
          <g key={i} transform={`translate(${PAD + i * 110}, ${PAD - 18})`}>
            <circle r={4} fill={color} />
            <text x={8} y={4} fontSize={9} fill="var(--ink-dim)">{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
