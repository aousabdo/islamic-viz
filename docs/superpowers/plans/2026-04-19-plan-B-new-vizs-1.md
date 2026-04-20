# New Visualizations — Plan B: Prayer Day, Qibla Globe 3D, Fasting Heatmap, Asr Shadow

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 4 new Islamic science visualizations: PrayerDay (all 5 prayers on 365-day chart), QiblaGlobe3D (draggable orthographic globe), FastingHeatmap (30-city × 12-month SVG grid), AsrShadow (animated pole/shadow geometry).

**Architecture:** Each viz is a self-contained React component in its own `src/viz/<slug>/` directory. Tasks T2-1 through T2-4 are independent of each other and of Plan A's T1 tasks (though they share the same lib utilities). Plan A's S0 (shared infra) must be complete before T2-1 (uses StoryCallout). T2-2, T2-3, T2-4 do NOT use StoryCallout, so they can run in parallel with Plan A.

**Prerequisites:** `src/lib/constants.ts`, `src/components/StoryCallout.tsx`, `src/lib/insights.ts` (from Plan A Task S0) must exist before T2-1. T2-2/T2-3/T2-4 have no dependency on Plan A.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, recharts ^3.8, d3-geo ^3.1 (already installed), vitest

**Route registration happens in Plan C (FINAL task) — do NOT touch `src/data/visualizations.ts` in this plan.**

---

## File Structure

**New files created in this plan:**
- `src/viz/prayer-day/PrayerDay.tsx`
- `src/viz/prayer-day/content.en.json`
- `src/viz/prayer-day/content.ar.json`
- `src/viz/qibla-globe/QiblaGlobe.tsx`
- `src/viz/qibla-globe/content.en.json`
- `src/viz/qibla-globe/content.ar.json`
- `src/viz/fasting-heatmap/FastingHeatmap.tsx`
- `src/viz/fasting-heatmap/content.en.json`
- `src/viz/fasting-heatmap/content.ar.json`
- `src/viz/asr-shadow/AsrShadow.tsx`
- `src/viz/asr-shadow/content.en.json`
- `src/viz/asr-shadow/content.ar.json`

---

### Task T2-1: Full Prayer Day (`prayer-day`)

**Files:**
- Create: `src/viz/prayer-day/PrayerDay.tsx`
- Create: `src/viz/prayer-day/content.en.json`
- Create: `src/viz/prayer-day/content.ar.json`

**What it does:** AreaChart showing all 5 prayer times as lines across 365 days. ReferenceArea bands fill the night/twilight/day periods. Solstice and Ramadan markers. Dynamic insight callout.

- [ ] **Step 1: Create `src/viz/prayer-day/content.en.json`**

```json
{
  "title": "The Full Muslim Day",
  "subtitle": "All five daily prayers traced across every day of the year",
  "tag": "astronomy",
  "controls": { "city": "City", "method": "Calculation method" },
  "explainer": [
    { "type": "p", "text": "Five prayers, five different astronomical thresholds, traced across every day of 2025. Fajr (predawn teal) opens the day before sunrise; Dhuhr (gold) falls at solar noon; Asr (orange) is ruled by shadow length; Maghrib (sunset orange) comes moments after sunset; Isha (twilight purple) closes after the last light fades. The chart shows how the entire Islamic day breathes and compresses across seasons and latitudes." },
    { "type": "p", "text": "Notice how the gap between Fajr and sunrise widens dramatically in winter for northern cities, while tropical cities maintain nearly constant prayer schedules. The Dhuhr line traces the equation of time — it shifts by up to 16 minutes across the year, which is why solar noon rarely falls at exactly 12:00." }
  ],
  "methodology": [
    { "type": "p", "text": "Fajr uses the selected method's twilight angle. Dhuhr is solar noon (equation of time + longitude correction). Asr is Shafi'i (shadow = object length + noon shadow). Maghrib is sunset (sun at -0.833°). Isha uses the method's angle or fixed interval. DST is applied per region." }
  ]
}
```

- [ ] **Step 2: Create `src/viz/prayer-day/content.ar.json`**

```json
{
  "title": "اليوم الإسلامي الكامل",
  "subtitle": "أوقات الصلوات الخمس على مدار أيام السنة",
  "tag": "astronomy",
  "controls": { "city": "المدينة", "method": "طريقة الحساب" },
  "explainer": [
    { "type": "p", "text": "خمس صلوات، وخمسة عتبات فلكية مختلفة، عبر كل يوم من أيام 2025. الفجر (الأخضر الفاتح) يفتح اليوم قبل الشروق؛ والظهر (الذهبي) عند منتصف الشمس؛ والعصر (البرتقالي) يُحكم بطول الظل؛ والمغرب (برتقال الغروب) بعد لحظات من الغروب؛ والعشاء (البنفسجي) يُغلق اليوم بعد انتهاء الشفق الأخير." },
    { "type": "p", "text": "لاحظ كيف تتسع الفجوة بين الفجر والشروق في الشتاء للمدن الشمالية، بينما تحافظ المدن الاستوائية على جداول صلاة شبه ثابتة." }
  ],
  "methodology": [
    { "type": "p", "text": "الفجر يُحسب بزاوية الشفق للطريقة المختارة. الظهر هو منتصف الشمس الشمسي. العصر بحسب المذهب الشافعي (ظل = طول الجسم + ظل الزوال). المغرب عند غروب الشمس (-0.833°). العشاء بزاوية الطريقة أو فترة ثابتة. يُطبَّق التوقيت الصيفي لكل منطقة." }
  ]
}
```

- [ ] **Step 3: Create `src/viz/prayer-day/PrayerDay.tsx`**

```tsx
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

  // Build a quick insight string
  const validFajr = data.filter(p => isFinite(p.fajr));
  const minFajr = validFajr.length ? Math.min(...validFajr.map(p => p.fajr)) : 0;
  const maxIsha = Math.max(...data.filter(p => isFinite(p.isha)).map(p => p.isha));
  const cn = city.name.split(',')[0];
  const insightText = lang === 'ar'
    ? `في ${city.nameAr ?? cn}، يبدأ الفجر باكرًا على مدار السنة عند ${fmtHour(minFajr)}، وتمتد العشاء حتى ${fmtHour(maxIsha)} في ذروتها — فارق يعكس تنفُّس اليوم الفلكي الإسلامي.`
    : `In ${cn}, Fajr opens as early as ${fmtHour(minFajr)} and Isha closes as late as ${fmtHour(maxIsha)} — the full span of the Islamic astronomical day.`;

  return (
    <div>
      {/* Controls */}
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
            {/* Ramadan band */}
            <ReferenceArea x1={RAMADAN_2025_START} x2={RAMADAN_2025_END}
              fill="rgba(212,180,131,0.07)" stroke="none"
              label={{ value: "Ramadan '25", fill: 'var(--gold)', fontSize: 9, position: 'insideTop' }} />

            {/* Solstice lines */}
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
```

- [ ] **Step 4: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/prayer-day/
git commit -m "feat(t2-1): PrayerDay — all 5 prayers on 365-day LineChart with solstice/Ramadan markers"
```

---

### Task T2-2: Qibla Globe 3D (`qibla-globe`)

**Files:**
- Create: `src/viz/qibla-globe/QiblaGlobe.tsx`
- Create: `src/viz/qibla-globe/content.en.json`
- Create: `src/viz/qibla-globe/content.ar.json`

**What it does:** Drag-to-rotate orthographic globe using d3-geo. Great-circle arc from selected city to Makkah. City rotates into view with smooth animation on city change.

- [ ] **Step 1: Create content JSON files**

```json
// src/viz/qibla-globe/content.en.json
{
  "title": "Qibla Globe 3D",
  "subtitle": "Drag to rotate — the great-circle path to Makkah from anywhere on Earth",
  "tag": "geometry",
  "controls": { "city": "City" },
  "explainer": [
    { "type": "p", "text": "Every Muslim on Earth prays facing Makkah. The red arc shows the great-circle route — the shortest path over the sphere's surface. Drag the globe to see how the arc curves: from New York it bends north over the Atlantic, from Jakarta it sweeps west over the Indian Ocean. A flat map makes these routes look strange; the globe reveals they are perfectly straight." },
    { "type": "p", "text": "The concept of qibla (direction of prayer) required medieval Muslim scholars to develop spherical trigonometry centuries before it appeared in Europe. The formulas in this visualization descend directly from Ibn Battuta's era." }
  ],
  "methodology": [
    { "type": "p", "text": "The globe uses a d3-geo orthographic projection. The great-circle arc is computed via the Aviation Formulary haversine method with 128 interpolation steps. Drag events update the rotation state [λ, φ, γ] directly. City-change animation linearly interpolates to the target rotation over 600ms using requestAnimationFrame." }
  ]
}
```

```json
// src/viz/qibla-globe/content.ar.json
{
  "title": "كرة القبلة ثلاثية الأبعاد",
  "subtitle": "اسحب للتدوير — مسار دائرة الكبرى إلى مكة المكرمة من أي مكان على الأرض",
  "tag": "geometry",
  "controls": { "city": "المدينة" },
  "explainer": [
    { "type": "p", "text": "كل مسلم على وجه الأرض يصلي باتجاه مكة المكرمة. يُظهر القوس الأحمر مسار دائرة الكبرى — أقصر طريق على سطح الكرة. اسحب الكرة لترى كيف ينحني القوس: من نيويورك ينحني شمالًا فوق الأطلسي، ومن جاكرتا يمتد غربًا فوق المحيط الهندي." },
    { "type": "p", "text": "احتاج مفهوم القبلة من العلماء المسلمين في القرون الوسطى إلى تطوير علم المثلثات الكروية قبل أوروبا بقرون." }
  ],
  "methodology": [
    { "type": "p", "text": "تستخدم الكرة إسقاط d3-geo الأورثوغرافي. يُحسب قوس دائرة الكبرى بطريقة haversine الملاحية بـ 128 نقطة. تحديثات السحب تُعدِّل حالة الدوران [λ, φ, γ] مباشرةً. تحريك المدينة يُؤنمج الدوران خطيًا إلى الهدف خلال 600 مللي ثانية." }
  ]
}
```

- [ ] **Step 2: Create `src/viz/qibla-globe/QiblaGlobe.tsx`**

```tsx
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
  // Shortest path for longitude wrap-around
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

  // Load world topojson
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((world) => {
        setLand(feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>);
      })
      .catch(() => {});
  }, []);

  // Animate rotation to bring selected city into view
  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    const target: Rot = [-city.lng, -city.lat, 0];
    const start = { rot: rotation, ts: performance.now() };
    const DURATION = 600;
    function tick(now: number) {
      const t = Math.min(1, (now - start.ts) / DURATION);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out-quad
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

  // Drag handlers
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

        {/* Ocean */}
        <path d={pathGen({ type: 'Sphere' }) ?? ''} fill="url(#qg3d-ocean)" />

        {/* Graticule */}
        <path d={pathGen(geoGraticule10()) ?? ''} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />

        {/* Land */}
        {land && <path d={pathGen(land) ?? ''} fill="rgba(255,255,255,0.07)" stroke="var(--rule)" strokeWidth={0.4} />}

        {/* Great-circle arc */}
        <path d={pathGen(arc) ?? ''} fill="none" stroke="var(--chart-1)" strokeWidth={2.5}
          filter="url(#qg3d-glow)" opacity={0.9} />

        {/* City dot */}
        {cityXY && (
          <circle cx={cityXY[0]} cy={cityXY[1]} r={6}
            fill="var(--chart-2)" filter="url(#qg3d-dot)" />
        )}

        {/* Makkah dot */}
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

        {/* City label */}
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
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/qibla-globe/
git commit -m "feat(t2-2): QiblaGlobe3D — drag-to-rotate orthographic globe, animated arc on city change"
```

---

### Task T2-3: Fasting Heatmap (`fasting-heatmap`)

**Files:**
- Create: `src/viz/fasting-heatmap/FastingHeatmap.tsx`
- Create: `src/viz/fasting-heatmap/content.en.json`
- Create: `src/viz/fasting-heatmap/content.ar.json`

**What it does:** 30-city × 12-month SVG grid where each cell's color indicates fasting hours. Teal (short) → gold → orange → red (extreme). Hover tooltip shows exact hours. No external dependencies.

- [ ] **Step 1: Create content JSON files**

```json
// src/viz/fasting-heatmap/content.en.json
{
  "title": "Global Fasting Hours",
  "subtitle": "How many hours each city fasts across every month — the latitude effect made visible",
  "tag": "astronomy",
  "controls": {},
  "explainer": [
    { "type": "p", "text": "Each cell shows the average fasting hours (Fajr to Maghrib) for that city in that month, computed on the 15th using the Umm al-Qura 18.5° Fajr angle. The pattern is stark: equatorial cities (Singapore, Lagos, Nairobi) run flat at ~13 hours year-round. Northern cities (Helsinki, Oslo) swing from 8 hours in winter to over 20 in summer — red cells mark the extreme zone where traditional fasting becomes medically and jurisprudentially contentious." },
    { "type": "p", "text": "The mirror effect is visible in the Southern Hemisphere: when Helsinki's summer peaks, Buenos Aires and Sydney are in their short-fasting winter. The global Islamic community never shares the same fasting burden simultaneously." }
  ],
  "methodology": [
    { "type": "p", "text": "Fasting hours = Maghrib (sunset) minus Fajr (18.5° angle, Umm al-Qura). Computed on the 15th of each month for calendar year 2025. DST is applied per city's region rules. Cities sorted by descending latitude." }
  ]
}
```

```json
// src/viz/fasting-heatmap/content.ar.json
{
  "title": "خريطة ساعات الصيام العالمية",
  "subtitle": "كم تصوم كل مدينة في كل شهر — تأثير خط العرض مرئيًا",
  "tag": "astronomy",
  "controls": {},
  "explainer": [
    { "type": "p", "text": "تُظهر كل خلية متوسط ساعات الصيام (من الفجر إلى المغرب) للمدينة في ذلك الشهر، محسوبةً في اليوم الخامس عشر بزاوية أم القرى 18.5°. النمط صارخ: المدن الاستوائية تتراوح حول 13 ساعة طوال السنة، بينما تتأرجح المدن الشمالية بين 8 ساعات شتاءً و20+ ساعة صيفًا." },
    { "type": "p", "text": "ويظهر التأثير المعكوس في نصف الكرة الجنوبي: حين يبلغ الصيف ذروته في هلسنكي تكون بوينس آيرس وسيدني في شتائها القصير." }
  ],
  "methodology": [
    { "type": "p", "text": "ساعات الصيام = المغرب (الغروب) ناقص الفجر (زاوية 18.5°، أم القرى). محسوبة في اليوم الخامس عشر من كل شهر لعام 2025. يُطبَّق التوقيت الصيفي لكل منطقة." }
  ]
}
```

- [ ] **Step 2: Create `src/viz/fasting-heatmap/FastingHeatmap.tsx`**

```tsx
// src/viz/fasting-heatmap/FastingHeatmap.tsx
import { useMemo, useState } from 'react';
import { CITIES, type City } from '../../data/cities';
import { sunriseSunset, fajrTime } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import { MONTH_LABELS } from '../../lib/chartUtils';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

// 30 cities sorted by descending latitude (all from the 97-city dataset)
const HEATMAP_CITY_NAMES = [
  'Helsinki, Finland',
  'Oslo, Norway',
  'Stockholm, Sweden',
  'Moscow, Russia',
  'London, UK',
  'Berlin, Germany',
  'Amsterdam, Netherlands',
  'Paris, France',
  'Toronto, Canada',
  'Istanbul, Turkey',
  'Rome, Italy',
  'New York, USA',
  'Madrid, Spain',
  'Tehran, Iran',
  'Kabul, Afghanistan',
  'Jerusalem, Palestine',
  'Cairo, Egypt',
  'Karachi, Pakistan',
  'Makkah, Saudi Arabia',
  'Mumbai, India',
  'Bangkok, Thailand',
  'Lagos, Nigeria',
  'Kuala Lumpur, Malaysia',
  'Nairobi, Kenya',
  'Singapore',
  'Jakarta, Indonesia',
  'São Paulo, Brazil',
  'Cape Town, South Africa',
  'Sydney, Australia',
  'Buenos Aires, Argentina',
];

function fastingHours(city: City, month0: number): number {
  // Use the 15th of each month
  const d = new Date(Date.UTC(2025, month0, 15));
  const dstOffset = isDST(city.dstType, d) ? 1 : 0;
  const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
  const { sunset } = sunriseSunset(loc, d);
  const fajr = fajrTime(loc, d, 18.5);
  if (!isFinite(fajr) || !isFinite(sunset)) return NaN;
  return Math.max(0, sunset - fajr);
}

function hoursToColor(h: number): string {
  if (!isFinite(h) || h <= 0) return '#1e3a5f';
  if (h < 12) return '#0f766e';
  if (h < 14) return '#4adecc';
  if (h < 16) return '#d4b483';
  if (h < 18) return '#f97316';
  if (h < 20) return '#ea580c';
  return '#ef4444';
}

const CELL_W = 38;
const CELL_H = 26;
const LABEL_W = 140;
const HEADER_H = 28;

export default function FastingHeatmap() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const cities = useMemo(
    () => HEATMAP_CITY_NAMES.map((n) => CITIES.find((c) => c.name === n)).filter(Boolean) as City[],
    [],
  );

  const grid = useMemo(
    () => cities.map((city) => ({
      city,
      months: Array.from({ length: 12 }, (_, m) => fastingHours(city, m)),
    })),
    [cities],
  );

  const svgW = LABEL_W + 12 * CELL_W + 2;
  const svgH = HEADER_H + cities.length * CELL_H + 2;

  return (
    <div>
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 520, position: 'relative' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block' }}>
          {/* Month column headers */}
          {MONTH_LABELS.map((label, m) => (
            <text key={m}
              x={LABEL_W + m * CELL_W + CELL_W / 2}
              y={HEADER_H - 6}
              textAnchor="middle" fontSize={10}
              fill="var(--ink-dim)">
              {label}
            </text>
          ))}

          {/* Rows */}
          {grid.map(({ city, months }, row) => {
            const y = HEADER_H + row * CELL_H;
            return (
              <g key={city.name}>
                {/* City label */}
                <text x={LABEL_W - 6} y={y + CELL_H / 2 + 4}
                  textAnchor="end" fontSize={10} fill="var(--ink-dim)">
                  {city.name.split(',')[0]}
                </text>
                {/* Cells */}
                {months.map((h, m) => {
                  const x = LABEL_W + m * CELL_W;
                  const color = hoursToColor(h);
                  return (
                    <rect key={m}
                      x={x + 1} y={y + 1}
                      width={CELL_W - 2} height={CELL_H - 2}
                      rx={3} fill={color} opacity={0.85}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const text = isFinite(h)
                          ? `${city.name.split(',')[0]} · ${MONTH_LABELS[m]}: ${h.toFixed(1)} hrs`
                          : `${city.name.split(',')[0]} · ${MONTH_LABELS[m]}: polar anomaly`;
                        setTooltip({ x: e.clientX, y: e.clientY, text });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'fixed',
            left: tooltip.x + 12, top: tooltip.y - 28,
            background: 'var(--bg)', border: '1px solid var(--border-h)',
            borderRadius: 8, padding: '6px 10px', fontSize: 12,
            color: 'var(--ink)', boxShadow: 'var(--glow-teal)',
            pointerEvents: 'none', zIndex: 999,
          }}>
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap mt-3 text-xs" style={{ color: 'var(--ink-dim)' }}>
        {[
          { color: '#0f766e', label: '< 12h' },
          { color: '#4adecc', label: '12–14h' },
          { color: '#d4b483', label: '14–16h' },
          { color: '#f97316', label: '16–18h' },
          { color: '#ea580c', label: '18–20h' },
          { color: '#ef4444', label: '> 20h' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/fasting-heatmap/
git commit -m "feat(t2-3): FastingHeatmap — 30-city × 12-month SVG grid with teal→red color scale"
```

---

### Task T2-4: Asr Shadow Geometry (`asr-shadow`)

**Files:**
- Create: `src/viz/asr-shadow/AsrShadow.tsx`
- Create: `src/viz/asr-shadow/content.en.json`
- Create: `src/viz/asr-shadow/content.ar.json`

**What it does:** Animated SVG showing a vertical pole casting a shadow across the day. Shadow length reacts to sun altitude. Two threshold marks show when Shafi'i and Hanafi Asr are reached. Play/pause animation.

- [ ] **Step 1: Create content JSON files**

```json
// src/viz/asr-shadow/content.en.json
{
  "title": "Asr Shadow Geometry",
  "subtitle": "Watch the shadow grow until it triggers the afternoon prayer — Shafi'i vs Hanafi",
  "tag": "fiqh",
  "controls": { "city": "City", "date": "Date" },
  "explainer": [
    { "type": "p", "text": "Asr prayer time is defined geometrically, not by a sun angle. The Shafi'i, Maliki, and Hanbali schools define Asr as the moment a vertical pole's shadow equals the pole's own height plus its noon shadow. The Hanafi school uses twice the pole's height plus the noon shadow. Press play to watch the shadow grow from sunrise to sunset and see exactly when each threshold is crossed." },
    { "type": "p", "text": "This is why the Hanafi Asr is always later than the Shafi'i Asr — sometimes by minutes, sometimes by hours. The difference is most dramatic at high latitudes in winter, when the sun barely climbs above the horizon and noon shadows are very long." }
  ],
  "methodology": [
    { "type": "p", "text": "Sun altitude is computed using solar declination and hour angle. The pole is normalized to 180px. Shadow length in pixels = 180 / tan(altitude_radians). Shafi'i threshold = pole height + noon shadow. Hanafi threshold = 2 × pole height + noon shadow. Animation runs at ~24 simulated hours per 12 real seconds (2 hours/second)." }
  ]
}
```

```json
// src/viz/asr-shadow/content.ar.json
{
  "title": "هندسة ظل العصر",
  "subtitle": "شاهد الظل يطول حتى يُؤذَّن للعصر — الشافعي مقابل الحنفي",
  "tag": "fiqh",
  "controls": { "city": "المدينة", "date": "التاريخ" },
  "explainer": [
    { "type": "p", "text": "وقت العصر يُعرَّف هندسيًا لا بزاوية الشمس. يحدد الشافعية والمالكية والحنابلة وقت العصر بلحظة مساواة ظل الجسم لطوله مضافًا إليه ظل الزوال، بينما يضيف الحنفية ضعف الطول. اضغط تشغيل لتشاهد الظل يطول من الشروق إلى الغروب." },
    { "type": "p", "text": "لهذا يكون العصر الحنفي دائمًا أمتد من الشافعي — أحيانًا بدقائق وأحيانًا بساعات. يتسع الفارق في خطوط العرض العليا شتاءً حين تكاد الشمس لا ترتفع وتطول ظلال الزوال." }
  ],
  "methodology": [
    { "type": "p", "text": "يُحسب ارتفاع الشمس بالميل الشمسي وزاوية الساعة. العمود 180 بكسل. الظل (بكسل) = 180 / tan(الارتفاع بالراديان). عتبة الشافعي = ارتفاع العمود + ظل الزوال. عتبة الحنفي = ضعف ارتفاع العمود + ظل الزوال." }
  ]
}
```

- [ ] **Step 2: Create `src/viz/asr-shadow/AsrShadow.tsx`**

```tsx
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
const POLE_H   = 180;          // pixels
const CX       = 200;          // pole base X

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
    // Compute Asr times by scanning
    let asrShafii = NaN, asrHanafi = NaN;
    for (let h = noon; h <= sunset; h += 0.01) {
      const alt = sunAltitude(loc, date, h);
      if (!isFinite(alt) || alt <= 0) continue;
      const shadow = POLE_H / Math.tan(alt * Math.PI / 180);
      if (isNaN(asrShafii) && shadow >= shafiiPx) asrShafii = h;
      if (isNaN(asrHanafi) && shadow >= hanafiPx) asrHanafi = h;
    }
    return { loc, sunrise, sunset, noonShadowPx, shafiiPx, hanafiPx, asrShafii, asrHanafi };
  }, [city, dateIso]);

  // Play/pause animation
  useEffect(() => {
    if (!playing) { cancelAnimationFrame(animRef.current); return; }
    let last = 0;
    const tick = (ts: number) => {
      const dt = last ? (ts - last) / 1000 : 0;
      last = ts;
      setHour((h) => {
        const next = h + dt * 2.0; // 2 simulated hours / real second
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

  // Prayer status
  let status = lang === 'ar' ? 'قبل العصر' : 'Before Asr';
  if (isFinite(asrHanafi) && clampedHour >= asrHanafi) status = lang === 'ar' ? 'وقت العصر (الحنفي)' : 'Asr window (Hanafi)';
  else if (isFinite(asrShafii) && clampedHour >= asrShafii) status = lang === 'ar' ? 'وقت العصر (الشافعي)' : 'Asr window (Shafi\'i)';
  if (clampedHour >= sunset - 0.05) status = lang === 'ar' ? 'بعد المغرب' : 'After Maghrib';

  const fmt = (h: number) => { const { hh, mm } = hoursToHHMM(h); return `${hh}:${mm}`; };

  return (
    <div>
      {/* Controls */}
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
        {/* SVG scene */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ flex: '1 1 400px', height: 'auto' }}>
          <defs>
            <linearGradient id="asr-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sky-top)" />
              <stop offset="100%" stopColor="var(--sky-bottom)" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect x={0} y={0} width={W} height={GROUND_Y} fill="url(#asr-sky)" />

          {/* Ground */}
          <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill="rgba(30,20,10,0.3)" />
          <line x1={0} y1={GROUND_Y} x2={W} y2={GROUND_Y} stroke="var(--rule)" strokeWidth={1} />

          {/* Shadow */}
          <line x1={CX} y1={GROUND_Y} x2={CX + shadowPx} y2={GROUND_Y}
            stroke="rgba(0,0,0,0.5)" strokeWidth={8} strokeLinecap="round" />

          {/* Pole */}
          <line x1={CX} y1={GROUND_Y} x2={CX} y2={GROUND_Y - POLE_H}
            stroke="var(--gold)" strokeWidth={4} strokeLinecap="round" />

          {/* Shafi'i threshold */}
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

          {/* Hanafi threshold */}
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

          {/* Time scrubber track at bottom */}
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

        {/* Info panel */}
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
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/asr-shadow/
git commit -m "feat(t2-4): AsrShadow — animated pole/shadow SVG with Shafi'i and Hanafi Asr thresholds"
```
