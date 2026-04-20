// src/viz/qibla-globe/QiblaGlobe.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import { CITIES } from '../../data/cities';
import { greatCirclePath, MAKKAH_COORDS, qiblaBearing } from '../../lib/qibla';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 560;
const H = 560;
const MAKKAH = MAKKAH_COORDS;

type Rot = [number, number, number];

function lerp(a: number, b: number, t: number) {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return a + d * t;
}

export default function QiblaGlobe() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('New York'));
    return i >= 0 ? i : 0;
  });
  const [rotation, setRotation] = useState<Rot>([0, -20, 0]);
  const [land, setLand] = useState<FeatureCollection<Geometry> | null>(null);

  const dragRef   = useRef<{ x: number; y: number; rot: Rot } | null>(null);
  const animRef   = useRef<number>(0);

  const city = CITIES[cityIdx];

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((world) => {
        setLand(feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    const target: Rot = [-city.lng, -city.lat, 0];
    const start = { rot: rotation, ts: performance.now() };
    const DURATION = 600;
    function tick(now: number) {
      const t = Math.min(1, (now - start.ts) / DURATION);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setRotation([
        lerp(start.rot[0], target[0], eased),
        lerp(start.rot[1], target[1], eased),
        0,
      ]);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [cityIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const projection = useMemo(
    () => geoOrthographic().scale(H / 2 - 20).translate([W / 2, H / 2]).rotate(rotation).clipAngle(90),
    [rotation],
  );
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const arc = useMemo(() => {
    const pts = greatCirclePath({ lat: city.lat, lng: city.lng }, MAKKAH, 128);
    return { type: 'LineString' as const, coordinates: pts.map((p) => [p.lng, p.lat]) };
  }, [city]);

  const bearing = qiblaBearing({ lat: city.lat, lng: city.lng });

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    cancelAnimationFrame(animRef.current);
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, rot: rotation };
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setRotation([
      dragRef.current.rot[0] + dx * 0.4,
      Math.max(-90, Math.min(90, dragRef.current.rot[1] - dy * 0.4)),
      0,
    ]);
  };
  const onPointerUp = () => { dragRef.current = null; };

  const cityXY   = projection([city.lng,  city.lat]);
  const makkahXY = projection([MAKKAH.lng, MAKKAH.lat]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.city}</span>
          <select value={cityIdx} onChange={(e) => setCityIdx(+e.target.value)}
            className="border rounded-lg px-2 py-1"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <span style={{ color: 'var(--ink-dim)' }}>
          {lang === 'ar' ? 'اتجاه القبلة' : 'Bearing'}:{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{bearing.toFixed(1)}°</span>
        </span>
        <span style={{ color: 'var(--ink-dim)', fontSize: 12 }}>
          {lang === 'ar' ? 'اسحب للتدوير' : 'Drag to rotate'}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', maxWidth: W, height: 'auto', cursor: 'grab', display: 'block', margin: '0 auto' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <radialGradient id="qg3d-ocean" cx="40%" cy="35%">
            <stop offset="0%"   stopColor="#0a1628" />
            <stop offset="100%" stopColor="#04080f" />
          </radialGradient>
          <filter id="qg3d-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="qg3d-dot" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path d={pathGen({ type: 'Sphere' }) ?? ''} fill="url(#qg3d-ocean)" />
        <path d={pathGen(geoGraticule10()) ?? ''} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        {land && <path d={pathGen(land) ?? ''} fill="rgba(255,255,255,0.07)" stroke="var(--rule)" strokeWidth={0.4} />}

        <path d={pathGen(arc) ?? ''} fill="none" stroke="var(--chart-1)" strokeWidth={2.5}
          filter="url(#qg3d-glow)" opacity={0.9} />

        {cityXY && (
          <circle cx={cityXY[0]} cy={cityXY[1]} r={6}
            fill="var(--chart-2)" filter="url(#qg3d-dot)" />
        )}

        {makkahXY && (
          <>
            <circle cx={makkahXY[0]} cy={makkahXY[1]} r={10}
              fill="var(--chart-1)" filter="url(#qg3d-dot)" />
            <text x={makkahXY[0]} y={makkahXY[1] - 14}
              textAnchor="middle" fontSize={11} fill="var(--chart-1)" fontWeight={600}>
              {lang === 'ar' ? 'مكة' : 'Makkah'}
            </text>
          </>
        )}

        {cityXY && (
          <text x={cityXY[0]} y={cityXY[1] - 10}
            textAnchor="middle" fontSize={10} fill="var(--chart-2)">
            {city.name.split(',')[0]}
          </text>
        )}
      </svg>
    </div>
  );
}
