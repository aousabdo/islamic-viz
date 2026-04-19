import { useMemo, useState, useEffect } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import { CITIES } from '../../data/cities';
import { greatCirclePath, MAKKAH_COORDS, qiblaBearing } from '../../lib/qibla';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 800, H = 420;

export default function QiblaGC() {
  const { lang } = useLang();
  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('New York'));
    return i >= 0 ? i : 0;
  });
  const city = CITIES[cityIdx];
  const [land, setLand] = useState<FeatureCollection<Geometry> | null>(null);
  const dict = lang === 'ar' ? contentAr : contentEn;

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((world) => {
        const fc = feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>;
        setLand(fc);
      })
      .catch(() => { /* ignore load errors — map just won't render land */ });
  }, []);

  const projection = useMemo(() => geoNaturalEarth1().scale(140).translate([W / 2, H / 2]), []);
  const path = useMemo(() => geoPath(projection), [projection]);

  const arc = useMemo(() => greatCirclePath({ lat: city.lat, lng: city.lng }, MAKKAH_COORDS, 128), [city]);
  const arcLine = {
    type: 'LineString' as const,
    coordinates: arc.map((p) => [p.lng, p.lat]),
  };
  const bearing = qiblaBearing({ lat: city.lat, lng: city.lng });

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">{dict.controls.city}</span>
          <select value={cityIdx} onChange={(e) => setCityIdx(parseInt(e.target.value, 10))} className="border border-rule rounded-lg px-2 py-1 bg-surface">
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <div className="text-ink-dim">
          {dict.labels.bearing}: <span className="text-accent font-semibold">{bearing.toFixed(1)}°</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: 'var(--surface)', borderRadius: 8 }}>
        <path d={path(geoGraticule10()) ?? ''} fill="none" stroke="var(--rule)" strokeWidth={0.5} />
        {land && <path d={path(land) ?? ''} fill="var(--bg)" stroke="var(--rule)" strokeWidth={0.8} />}
        <path d={path(arcLine) ?? ''} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
        {(() => {
          const cxy = projection([city.lng, city.lat]);
          const mxy = projection([MAKKAH_COORDS.lng, MAKKAH_COORDS.lat]);
          return (
            <>
              {cxy && <circle cx={cxy[0]} cy={cxy[1]} r={5} fill="var(--accent-d)" />}
              {mxy && <circle cx={mxy[0]} cy={mxy[1]} r={6} fill="var(--chart-2)" />}
              {mxy && <text x={mxy[0] + 8} y={mxy[1] - 8} fontSize={12} fill="var(--chart-2)">{dict.labels.makkah}</text>}
            </>
          );
        })()}
      </svg>
    </div>
  );
}
