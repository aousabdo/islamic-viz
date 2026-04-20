import { useEffect, useMemo, useRef, useState } from 'react';
import { CITIES } from '../../data/cities';
import { solarDeclination, solarNoon } from '../../lib/solar';
import { useLang } from '../../i18n/useLang';
import { dayToMonth } from '../../lib/chartUtils';
import GlowDefs from '../../components/GlowDefs';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 480;
const H = 480;
const PAD = 52;

type Pt = { day: number; az: number; alt: number };

function ptColor(day: number): string {
  if (day <= 79)  return '#4adecc'; // winter→spring
  if (day <= 171) return '#7cc87a'; // spring
  if (day <= 265) return '#d4b483'; // summer
  return '#8b7ec8';                 // autumn/winter
}

// 1–2–5 sequence tick generator.
function niceTicks(min: number, max: number, targetCount = 6): number[] {
  const range = max - min;
  if (!(range > 0)) return [];
  const rawStep = range / targetCount;
  const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const n = rawStep / pow;
  const step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * pow;
  const first = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = first; v <= max + step * 0.5; v += step) ticks.push(v);
  return ticks;
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
    const phi = city.lat * Math.PI / 180;
    for (let n = 1; n <= 365; n++) {
      const d = new Date(Date.UTC(2025, 0, n));
      // Standard time year-round — DST injects a 1-hour discontinuity in H that breaks the curve.
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz };

      const delta = solarDeclination(n) * Math.PI / 180;
      // Hour angle at local clock noon (H < 0 = sun east of meridian, H > 0 = west).  Encodes
      // BOTH equation-of-time AND the city's longitude offset from its time-zone meridian,
      // which is why the figure-8's horizontal position depends on the city.
      const H = (12 - solarNoon(loc, d)) * 15 * Math.PI / 180;

      // Sun's unit vector in the local horizontal frame (south+, east+, up+).
      const S = Math.cos(delta) * Math.sin(phi) * Math.cos(H) - Math.sin(delta) * Math.cos(phi);
      const E = -Math.cos(delta) * Math.sin(H);
      const U = Math.sin(delta) * Math.sin(phi) + Math.cos(delta) * Math.cos(phi) * Math.cos(H);
      if (U <= 0) continue;                          // sun below horizon (polar night)

      // Y-axis: angle of the sun in the (south, up) meridian plane, swept through the zenith.
      //   0° = south horizon  •  90° = zenith  •  180° = north horizon.
      // atan2 stays smooth through zenith crossings (no isNorth flip required).
      const alt = Math.atan2(U, S) * 180 / Math.PI;

      // X-axis: great-circle angular distance from the meridian plane (positive = west).
      // This is the proper "east-west deviation on the sky" and stays bounded even when the
      // sun passes near the zenith, where raw azimuth would swing wildly.
      const az = -Math.asin(Math.max(-1, Math.min(1, E))) * 180 / Math.PI;

      out.push({ day: n, az, alt });
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
  const azRange  = Math.max(...allAz)  - Math.min(...allAz);
  const altRange = Math.max(...allAlt) - Math.min(...allAlt);
  const azMin  = Math.min(...allAz)  - Math.max(2, azRange  * 0.08);
  const azMax  = Math.max(...allAz)  + Math.max(2, azRange  * 0.08);
  const altMin = Math.min(...allAlt) - Math.max(2, altRange * 0.08);
  const altMax = Math.max(...allAlt) + Math.max(2, altRange * 0.08);

  const xScale = (az: number)  => PAD + ((az  - azMin)  / (azMax  - azMin))  * (W - 2 * PAD);
  const yScale = (alt: number) => H - PAD - ((alt - altMin) / (altMax - altMin)) * (H - 2 * PAD);

  const lastPt = visiblePts[visiblePts.length - 1];
  const xTicks = niceTicks(azMin,  azMax,  6);
  const yTicks = niceTicks(altMin, altMax, 6);

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
        {/* Plot frame */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--ink-dim)" strokeWidth={0.6} opacity={0.45} />
        <line x1={PAD} y1={PAD}     x2={PAD}     y2={H - PAD} stroke="var(--ink-dim)" strokeWidth={0.6} opacity={0.45} />

        {/* X gridlines, tick marks + values */}
        {xTicks.map((t) => {
          const x = xScale(t);
          return (
            <g key={`xt-${t}`}>
              <line x1={x} y1={PAD} x2={x} y2={H - PAD}
                stroke="var(--rule)" strokeWidth={0.35} opacity={0.18} />
              <line x1={x} y1={H - PAD} x2={x} y2={H - PAD + 4}
                stroke="var(--ink-dim)" strokeWidth={0.8} opacity={0.7} />
              <text x={x} y={H - PAD + 14} textAnchor="middle" fontSize={9} fill="var(--ink-dim)">
                {t.toFixed(0)}°
              </text>
            </g>
          );
        })}

        {/* Y gridlines, tick marks + values */}
        {yTicks.map((t) => {
          const y = yScale(t);
          return (
            <g key={`yt-${t}`}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y}
                stroke="var(--rule)" strokeWidth={0.35} opacity={0.18} />
              <line x1={PAD - 4} y1={y} x2={PAD} y2={y}
                stroke="var(--ink-dim)" strokeWidth={0.8} opacity={0.7} />
              <text x={PAD - 6} y={y + 3} textAnchor="end" fontSize={9} fill="var(--ink-dim)">
                {t.toFixed(0)}°
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--ink-dim)">
          {lang === 'ar' ? 'الانحراف عن الزوال (°)  شرق ← → غرب' : 'Meridian deviation — East ← → West (°)'}
        </text>
        <text x={12} y={H / 2} textAnchor="middle" fontSize={10} fill="var(--ink-dim)"
          transform={`rotate(-90, 12, ${H / 2})`}>
          {lang === 'ar' ? 'الارتفاع (°)' : 'Altitude (°)'}
        </text>

        {/* EoT = 0 line: clock noon matches solar noon exactly */}
        {(() => {
          const x0 = xScale(0);
          return <line x1={x0} y1={PAD} x2={x0} y2={H - PAD} stroke="var(--rule)" strokeWidth={1} strokeDasharray="3 3" />;
        })()}

        {/* Zenith line at extended-altitude = 90° (only visible for tropical cities) */}
        {(() => {
          const y90 = yScale(90);
          if (y90 < PAD || y90 > H - PAD) return null;
          return (
            <>
              <line x1={PAD} y1={y90} x2={W - PAD} y2={y90}
                stroke="var(--ink-dim)" strokeWidth={0.5} strokeDasharray="4 4" opacity={0.35} />
              <text x={W - PAD - 2} y={y90 - 4} fontSize={8} fill="var(--ink-dim)"
                textAnchor="end" opacity={0.6}>
                {lang === 'ar' ? 'السمت الرأسي' : 'zenith'}
              </text>
            </>
          );
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
          <g key={i} transform={`translate(${PAD + i * 110}, ${PAD - 24})`}>
            <circle r={4} fill={color} />
            <text x={8} y={4} fontSize={9} fill="var(--ink-dim)">{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
