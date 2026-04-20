import { useEffect, useMemo, useState } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import { CITIES, type City } from '../../data/cities';
import { sunriseSunset, fajrTime } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { ramadanStart } from '../../lib/hijri';
import { useLang } from '../../i18n/useLang';

const W = 800, H = 420;

type Severity = 'comfortable' | 'moderate' | 'severe' | 'extreme';

const SEVERITY_COLOR: Record<Severity, string> = {
  comfortable: '#4adecc',
  moderate:    '#d4b483',
  severe:      '#f97316',
  extreme:     '#ef4444',
};

function severity(maxHours: number): Severity {
  if (!isFinite(maxHours) || maxHours > 23) return 'extreme';
  if (maxHours < 14) return 'comfortable';
  if (maxHours < 17) return 'moderate';
  if (maxHours < 20) return 'severe';
  return 'extreme';
}

function computePeak(city: City): number {
  let ramStart: Date;
  try { ramStart = ramadanStart(1447); } catch { return NaN; }
  let peak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(ramStart.getTime() + i * 86_400_000);
    const dstOffset = isDST(city.dstType, d) ? 1 : 0;
    const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
    const { sunset } = sunriseSunset(loc, d);
    const fajr = fajrTime(loc, d, 18.5);
    if (!isFinite(fajr) || !isFinite(sunset)) return NaN;
    peak = Math.max(peak, sunset - fajr);
  }
  return peak;
}

export default function PolarAnomaly() {
  const { lang } = useLang();

  const [land, setLand] = useState<FeatureCollection<Geometry> | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', { signal: controller.signal })
      .then((r) => r.json())
      .then((world) => setLand(feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>))
      .catch((err) => { if (err.name !== 'AbortError') console.error(err); });
    return () => controller.abort();
  }, []);

  const projection = useMemo(() => geoNaturalEarth1().scale(140).translate([W / 2, H / 2]), []);
  const pathGen    = useMemo(() => geoPath(projection), [projection]);

  const cityData = useMemo(() => CITIES.map((city) => {
    const peak = computePeak(city);
    return { city, peak, sev: severity(peak), xy: projection([city.lng, city.lat]) };
  }), [projection]);

  const sel = selected !== null ? cityData[selected] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <filter id="pa-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ocean */}
        <rect width={W} height={H} fill="var(--bg)" />

        {/* Graticule */}
        <path d={pathGen(geoGraticule10()) ?? ''} fill="none" stroke="var(--map-graticule)" strokeWidth={0.5} />

        {/* Land */}
        {land && <path d={pathGen(land) ?? ''} fill="var(--map-land)" stroke="var(--rule)" strokeWidth={0.4} />}

        {/* City dots */}
        {cityData.map(({ city, sev, xy }, i) => {
          if (!xy) return null;
          const isSelected = i === selected;
          return (
            <circle key={city.name}
              cx={xy[0]} cy={xy[1]} r={isSelected ? 8 : 5}
              fill={SEVERITY_COLOR[sev]}
              filter="url(#pa-glow)"
              opacity={0.85}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelected(i === selected ? null : i)}
            >
              <title>{city.name}</title>
            </circle>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {([
          { sev: 'comfortable' as Severity, label: lang === 'ar' ? '< 14 ساعة' : '< 14h' },
          { sev: 'moderate'    as Severity, label: lang === 'ar' ? '14–17 ساعة' : '14–17h' },
          { sev: 'severe'      as Severity, label: lang === 'ar' ? '17–20 ساعة' : '17–20h' },
          { sev: 'extreme'     as Severity, label: lang === 'ar' ? '> 20 ساعة' : '> 20h' },
        ]).map(({ sev: s, label }) => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-dim)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: SEVERITY_COLOR[s], display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>

      {/* City detail panel */}
      {sel && (
        <div style={{
          marginTop: 12, padding: '14px 16px', borderRadius: 10,
          background: 'var(--surface)', border: `1px solid ${SEVERITY_COLOR[sel.sev]}44`,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{sel.city.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
              {lang === 'ar' ? 'خط العرض' : 'Latitude'}: {sel.city.lat.toFixed(2)}°
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: SEVERITY_COLOR[sel.sev], fontWeight: 600 }}>
              {isFinite(sel.peak) ? `${sel.peak.toFixed(1)} hrs peak` : 'Polar anomaly'}
            </div>
            <div style={{
              marginTop: 4, fontSize: 11, padding: '2px 8px', borderRadius: 6,
              background: `${SEVERITY_COLOR[sel.sev]}22`, color: SEVERITY_COLOR[sel.sev],
            }}>
              {sel.sev}
            </div>
          </div>
          {sel.sev === 'extreme' && (
            <div style={{ fontSize: 11, color: 'var(--ink-dim)', maxWidth: 300 }}>
              {lang === 'ar'
                ? 'يُجيز كثير من العلماء التخفيف أو اعتماد توقيت مكة المكرمة في المناطق التي يختل فيها الليل والنهار.'
                : "Many scholars permit latitude-based adjustment or following Makkah's timing when day/night cycles are severely distorted."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
