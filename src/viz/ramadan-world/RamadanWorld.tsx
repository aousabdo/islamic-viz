import { useEffect, useMemo, useState } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import { CITIES } from '../../data/cities';
import { sunriseSunset, fajrTime, hoursToHHMM } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { ramadanStart } from '../../lib/hijri';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 800, H = 420;
const MAKKAH_TZ = 3;

function offsetColor(hoursAfterMakkah: number): string {
  if (hoursAfterMakkah < -1) return '#6d28d9';
  if (hoursAfterMakkah < 3)  return '#4adecc';
  if (hoursAfterMakkah < 8)  return '#d4b483';
  return '#f97316';
}

export default function RamadanWorld() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [hYear, setHYear]     = useState(1446);
  const [land, setLand]       = useState<FeatureCollection<Geometry> | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', { signal: controller.signal })
      .then((r) => r.json())
      .then((world) => setLand(feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>))
      .catch((err) => { if (err.name !== 'AbortError') console.error(err); });
    return () => controller.abort();
  }, []);

  const ramadanDate = useMemo(() => {
    try { return ramadanStart(hYear); } catch { return null; }
  }, [hYear]);

  const projection = useMemo(() => geoNaturalEarth1().scale(140).translate([W / 2, H / 2]), []);
  const pathGen    = useMemo(() => geoPath(projection), [projection]);

  const cityData = useMemo(() => {
    if (!ramadanDate) return [];
    return CITIES.map((city) => {
      const hoursAfterMakkah = city.tz - MAKKAH_TZ;
      const color = offsetColor(hoursAfterMakkah);
      const xy = projection([city.lng, city.lat]);

      const d = ramadanDate;
      const dstOffset = isDST(city.dstType, d) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const { sunset } = sunriseSunset(loc, d);
      const fajr = fajrTime(loc, d, 18.5);
      const fmtH = (h: number) => { const { hh, mm } = hoursToHHMM(h); return `${hh}:${mm}`; };

      return {
        city, hoursAfterMakkah, color, xy,
        suhoor: isFinite(fajr) ? fmtH(fajr) : '—',
        iftar:  isFinite(sunset) ? fmtH(sunset) : '—',
      };
    });
  }, [ramadanDate, projection]);

  const hoveredCity = hovered !== null ? cityData[hovered] : null;

  return (
    <div>
      {/* Year selector */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.year}:</span>
        <select value={hYear} onChange={(e) => setHYear(+e.target.value)}
          className="border rounded-lg px-2 py-1" style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
          {Array.from({ length: 11 }, (_, i) => 1445 + i).map((y) => (
            <option key={y} value={y}>{y} AH</option>
          ))}
        </select>
        {ramadanDate && (
          <span style={{ color: 'var(--ink-dim)', fontSize: 12 }}>
            Ramadan 1 ≈ {ramadanDate.toUTCString().slice(0, 16)}
          </span>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
          <defs>
            <filter id="rw-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width={W} height={H} fill="var(--bg)" />
          <path d={pathGen(geoGraticule10()) ?? ''} fill="none" stroke="var(--map-graticule)" strokeWidth={0.5} />
          {land && <path d={pathGen(land) ?? ''} fill="var(--map-land)" stroke="var(--rule)" strokeWidth={0.4} />}

          {cityData.map(({ city, color, xy }, i) => {
            if (!xy) return null;
            return (
              <circle key={city.name}
                cx={xy[0]} cy={xy[1]} r={hovered === i ? 7 : 4}
                fill={color} filter="url(#rw-glow)" opacity={0.85}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => { setHovered(i); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredCity && (
          <div style={{
            position: 'fixed', left: tooltipPos.x + 12, top: tooltipPos.y - 60,
            background: 'var(--bg)', border: '1px solid var(--border-h)',
            borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--ink)',
            boxShadow: 'var(--glow-teal)', pointerEvents: 'none', zIndex: 999, minWidth: 180,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{hoveredCity.city.name}</div>
            <div style={{ color: 'var(--ink-dim)' }}>
              UTC{hoveredCity.hoursAfterMakkah >= 0 ? '+' : ''}{hoveredCity.hoursAfterMakkah}h vs Makkah
            </div>
            <div style={{ color: 'var(--chart-1)' }}>
              {lang === 'ar' ? 'السحور' : 'Suhoor'}: {hoveredCity.suhoor}
            </div>
            <div style={{ color: 'var(--chart-2)' }}>
              {lang === 'ar' ? 'الإفطار' : 'Iftar'}: {hoveredCity.iftar}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs flex-wrap" style={{ color: 'var(--ink-dim)' }}>
        {[
          { color: '#6d28d9', label: lang === 'ar' ? 'قبل مكة' : 'Before Makkah' },
          { color: '#4adecc', label: lang === 'ar' ? '0–3h بعد مكة' : '0–3h after Makkah' },
          { color: '#d4b483', label: lang === 'ar' ? '3–8h بعد' : '3–8h after' },
          { color: '#f97316', label: lang === 'ar' ? '8h+ بعد' : '8h+ after' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
