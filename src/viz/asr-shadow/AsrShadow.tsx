// src/viz/asr-shadow/AsrShadow.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { CITIES } from '../../data/cities';
import { sunAltitude, sunriseSunset, solarNoon, hoursToHHMM } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 700;
const H = 380;
const GROUND_Y = 310;
const POLE_H   = 180;
const CX       = 200;

export default function AsrShadow() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx,  setCityIdx]  = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [dateIso, setDateIso]   = useState('2025-06-21');
  const [hour,    setHour]      = useState(6.0);
  const [playing, setPlaying]   = useState(false);

  const animRef = useRef<number>(0);
  const city    = CITIES[cityIdx];
  const date    = new Date(dateIso + 'T00:00:00Z');

  const { loc, sunrise, sunset, noonShadowPx, shafiiPx, hanafiPx, asrShafii, asrHanafi } = useMemo(() => {
    const dstOffset = isDST(city.dstType, date) ? 1 : 0;
    const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
    const { sunrise, sunset } = sunriseSunset(loc, date);
    const noon = solarNoon(loc, date);
    const noonAlt = sunAltitude(loc, date, noon);
    const noonShadowPx = noonAlt > 0 ? POLE_H / Math.tan(noonAlt * Math.PI / 180) : POLE_H * 3;
    const shafiiPx = POLE_H + noonShadowPx;
    const hanafiPx = 2 * POLE_H + noonShadowPx;
    let asrShafii = NaN, asrHanafi = NaN;
    for (let h = noon; h <= sunset; h += 0.01) {
      const alt = sunAltitude(loc, date, h);
      if (!isFinite(alt) || alt <= 0) continue;
      const shadow = POLE_H / Math.tan(alt * Math.PI / 180);
      if (isNaN(asrShafii) && shadow >= shafiiPx) asrShafii = h;
      if (isNaN(asrHanafi) && shadow >= hanafiPx) asrHanafi = h;
    }
    return { loc, sunrise, sunset, noonShadowPx, shafiiPx, hanafiPx, asrShafii, asrHanafi };
  }, [city, dateIso]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!playing) { cancelAnimationFrame(animRef.current); return; }
    let last = 0;
    const tick = (ts: number) => {
      const dt = last ? (ts - last) / 1000 : 0;
      last = ts;
      setHour((h) => {
        const next = h + dt * 2.0;
        if (next >= sunset) { setPlaying(false); return Math.max(sunrise, sunset - 0.01); }
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, sunrise, sunset]);

  const clampedHour = Math.min(Math.max(hour, sunrise), sunset);
  const alt = sunAltitude(loc, date, clampedHour);
  const shadowPx = (isFinite(alt) && alt > 0.5) ? Math.min(POLE_H / Math.tan(alt * Math.PI / 180), W - CX - 20) : W - CX - 20;

  const { hh: hStr, mm: mStr } = hoursToHHMM(clampedHour);

  let status = lang === 'ar' ? 'قبل العصر' : 'Before Asr';
  if (isFinite(asrHanafi) && clampedHour >= asrHanafi) status = lang === 'ar' ? 'وقت العصر (الحنفي)' : "Asr window (Hanafi)";
  else if (isFinite(asrShafii) && clampedHour >= asrShafii) status = lang === 'ar' ? 'وقت العصر (الشافعي)' : "Asr window (Shafi'i)";
  if (clampedHour >= sunset - 0.05) status = lang === 'ar' ? 'بعد المغرب' : 'After Maghrib';

  const fmt = (h: number) => { const { hh, mm } = hoursToHHMM(h); return `${hh}:${mm}`; };

  // suppress unused warning
  void noonShadowPx;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.city}</span>
          <select value={cityIdx} onChange={(e) => { setCityIdx(+e.target.value); setHour(6); setPlaying(false); }}
            className="border rounded-lg px-2 py-1" style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.date}</span>
          <input type="date" value={dateIso}
            onChange={(e) => { setDateIso(e.target.value); setHour(6); setPlaying(false); }}
            className="border rounded-lg px-2 py-1" style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }} />
        </label>
        <button onClick={() => { if (!playing) setHour(sunrise + 0.1); setPlaying((p) => !p); }}
          style={{
            padding: '4px 14px', borderRadius: 8, fontSize: 12,
            background: playing ? 'rgba(249,115,22,0.15)' : 'rgba(74,222,204,0.12)',
            border: `1px solid ${playing ? 'rgba(249,115,22,0.4)' : 'rgba(74,222,204,0.35)'}`,
            color: playing ? 'var(--chart-3)' : 'var(--accent)', cursor: 'pointer',
          }}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ flex: '1 1 400px', height: 'auto' }}>
          <defs>
            <linearGradient id="asr-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sky-top)" />
              <stop offset="100%" stopColor="var(--sky-bottom)" />
            </linearGradient>
          </defs>

          <rect x={0} y={0} width={W} height={GROUND_Y} fill="url(#asr-sky)" />
          <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill="rgba(30,20,10,0.3)" />
          <line x1={0} y1={GROUND_Y} x2={W} y2={GROUND_Y} stroke="var(--rule)" strokeWidth={1} />

          <line x1={CX} y1={GROUND_Y} x2={CX + shadowPx} y2={GROUND_Y}
            stroke="rgba(0,0,0,0.5)" strokeWidth={8} strokeLinecap="round" />
          <line x1={CX} y1={GROUND_Y} x2={CX} y2={GROUND_Y - POLE_H}
            stroke="var(--gold)" strokeWidth={4} strokeLinecap="round" />

          {shafiiPx < W - CX - 10 && (
            <g>
              <line x1={CX + shafiiPx} y1={GROUND_Y - 30} x2={CX + shafiiPx} y2={GROUND_Y}
                stroke="var(--chart-1)" strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={CX + shafiiPx + 4} y={GROUND_Y - 16} fontSize={9} fill="var(--chart-1)">
                {lang === 'ar' ? 'الشافعي' : "Shafi'i"}
              </text>
              <text x={CX + shafiiPx + 4} y={GROUND_Y - 5} fontSize={8} fill="var(--ink-dim)">
                {fmt(asrShafii)}
              </text>
            </g>
          )}

          {hanafiPx < W - CX - 10 && (
            <g>
              <line x1={CX + hanafiPx} y1={GROUND_Y - 30} x2={CX + hanafiPx} y2={GROUND_Y}
                stroke="var(--chart-2)" strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={CX + hanafiPx + 4} y={GROUND_Y - 16} fontSize={9} fill="var(--chart-2)">
                {lang === 'ar' ? 'الحنفي' : 'Hanafi'}
              </text>
              <text x={CX + hanafiPx + 4} y={GROUND_Y - 5} fontSize={8} fill="var(--ink-dim)">
                {fmt(asrHanafi)}
              </text>
            </g>
          )}

          {(() => {
            const trackX1 = 20, trackX2 = W - 20, trackY = H - 20;
            const frac = (clampedHour - sunrise) / (sunset - sunrise);
            const trackXcur = trackX1 + frac * (trackX2 - trackX1);
            return (
              <g>
                <line x1={trackX1} y1={trackY} x2={trackX2} y2={trackY} stroke="var(--rule)" strokeWidth={2} />
                <circle cx={trackXcur} cy={trackY} r={6} fill="var(--accent)" />
                <text x={trackXcur} y={trackY - 10} textAnchor="middle" fontSize={9} fill="var(--ink-dim)">
                  {hStr}:{mStr}
                </text>
              </g>
            );
          })()}
        </svg>

        <div style={{
          flex: '0 0 160px', padding: '14px', borderRadius: 10,
          background: 'var(--surface)', border: '1px solid var(--border)',
          fontSize: 12, lineHeight: 2,
        }}>
          <div style={{ color: 'var(--ink-dim)', marginBottom: 6 }}>{status}</div>
          <div>
            <span style={{ color: 'var(--ink-dim)' }}>{lang === 'ar' ? 'الوقت' : 'Time'}: </span>
            <strong style={{ color: 'var(--accent)' }}>{hStr}:{mStr}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--ink-dim)' }}>{lang === 'ar' ? 'الارتفاع' : 'Altitude'}: </span>
            <strong>{isFinite(alt) ? alt.toFixed(1) : '--'}°</strong>
          </div>
          <div>
            <span style={{ color: 'var(--ink-dim)' }}>{lang === 'ar' ? 'نسبة الظل' : 'Shadow ratio'}: </span>
            <strong>{isFinite(alt) && alt > 0.5 ? (shadowPx / POLE_H).toFixed(2) : '—'}×</strong>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', margin: '8px 0' }} />
          <div>
            <span style={{ color: 'var(--chart-1)' }}>Shafi'i:</span>{' '}
            <span>{isFinite(asrShafii) ? fmt(asrShafii) : '—'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--chart-2)' }}>Hanafi:</span>{' '}
            <span>{isFinite(asrHanafi) ? fmt(asrHanafi) : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
