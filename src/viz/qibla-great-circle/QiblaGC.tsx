// src/viz/qibla-great-circle/QiblaGC.tsx
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
  const [land, setLand] = useState<FeatureCollection<Geometry> | null>(null);

  const city = CITIES[cityIdx];
  const dict = lang === 'ar' ? contentAr : contentEn;

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((world) => {
        const fc = feature(
          world,
          world.objects.countries,
        ) as unknown as FeatureCollection<Geometry>;
        setLand(fc);
      })
      .catch(() => {
        /* ignore — map renders without land outlines */
      });
  }, []);

  const projection = useMemo(
    () => geoNaturalEarth1().scale(140).translate([W / 2, H / 2]),
    [],
  );
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const arc = useMemo(
    () => greatCirclePath({ lat: city.lat, lng: city.lng }, MAKKAH_COORDS, 128),
    [city],
  );
  const arcLine = {
    type: 'LineString' as const,
    coordinates: arc.map((p) => [p.lng, p.lat]),
  };

  const bearing = qiblaBearing({ lat: city.lat, lng: city.lng });

  const cityXY = projection([city.lng, city.lat]);
  const makkahXY = projection([MAKKAH_COORDS.lng, MAKKAH_COORDS.lat]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.city}</span>
          <select
            value={cityIdx}
            onChange={(e) => setCityIdx(parseInt(e.target.value, 10))}
            className="border border-rule rounded-lg px-2 py-1 bg-surface"
          >
            {CITIES.map((c, i) => (
              <option key={c.name} value={i}>{c.name}</option>
            ))}
          </select>
        </label>
        <div style={{ color: 'var(--ink-dim)' }}>
          {dict.labels.bearing}:{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {bearing.toFixed(1)}°
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', borderRadius: 8 }}
      >
        <defs>
          <filter id="qg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="qg-dot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean background */}
        <rect width={W} height={H} fill="var(--bg)" />

        {/* Graticule */}
        <path
          d={pathGen(geoGraticule10()) ?? ''}
          fill="none"
          stroke="var(--map-graticule)"
          strokeWidth={0.4}
        />

        {/* Land */}
        {land && (
          <path
            d={pathGen(land) ?? ''}
            fill="var(--map-land)"
            stroke="var(--rule)"
            strokeWidth={0.6}
          />
        )}

        {/* Great-circle arc */}
        <path
          d={pathGen(arcLine) ?? ''}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          filter="url(#qg-glow)"
        />

        {/* City dot */}
        {cityXY && (
          <circle
            cx={cityXY[0]}
            cy={cityXY[1]}
            r={5}
            fill="var(--chart-2)"
            filter="url(#qg-dot-glow)"
          />
        )}

        {/* Makkah dot + label */}
        {makkahXY && (
          <>
            <circle
              cx={makkahXY[0]}
              cy={makkahXY[1]}
              r={6}
              fill="var(--chart-1)"
              filter="url(#qg-dot-glow)"
            />
            <text
              x={makkahXY[0] + 9}
              y={makkahXY[1] - 8}
              fontSize={12}
              fill="var(--chart-1)"
            >
              {dict.labels.makkah}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
