# Storytelling Upgrades — Plan A: Shared Infra + Existing Viz Upgrades

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build shared storytelling infrastructure and add narrative annotations to all 5 existing visualizations.

**Architecture:** New `src/lib/constants.ts` (astronomical day constants), `src/components/StoryCallout.tsx` (glass insight panel), `src/lib/insights.ts` (per-viz dynamic insight functions), plus `sunAzimuth` added to solar.ts and `haversineDistance` to qibla.ts. Each existing viz gets solstice/equinox reference lines, a dynamic StoryCallout below the chart, and compare-city overlay on FajrGlobe and FastingHours.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, recharts ^3.8, vitest

---

## File Structure

**New files:**
- `src/lib/constants.ts` — WINTER_SOLSTICE_DAY, SUMMER_SOLSTICE_DAY, SPRING_EQUINOX_DAY, AUTUMN_EQUINOX_DAY, RAMADAN_2025_START, RAMADAN_2025_END
- `src/components/StoryCallout.tsx` — glass insight panel component
- `src/lib/insights.ts` — fajrInsight, fastingInsight, hijriInsight, sunPathInsight, qiblaInsight
- `src/lib/__tests__/insights.test.ts`

**Modified files:**
- `src/lib/solar.ts` — add `sunAzimuth` export (needed by Plan C Analemma)
- `src/lib/qibla.ts` — add `haversineDistance` export (needed by T1-E and Plan C)
- `src/styles/tokens.css` — add `--chart-4`, `--chart-5`
- `tailwind.config.ts` — add `chart-4`, `chart-5`
- `src/viz/fajr-globe/FajrGlobe.tsx`
- `src/viz/fasting-hours/FastingHours.tsx`
- `src/viz/hijri-drift/HijriDrift.tsx`
- `src/viz/sun-path-asr/SunPathAsr.tsx`
- `src/viz/qibla-great-circle/QiblaGC.tsx`

---

### Task S0: Shared Infrastructure

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/components/StoryCallout.tsx`
- Create: `src/lib/insights.ts`
- Create: `src/lib/__tests__/insights.test.ts`
- Modify: `src/lib/solar.ts` (append `sunAzimuth`)
- Modify: `src/lib/qibla.ts` (append `haversineDistance`)
- Modify: `src/styles/tokens.css` (add 2 tokens in both `:root` and `[data-theme="light"]`)
- Modify: `tailwind.config.ts` (add 2 color entries)

---

- [ ] **Step 1: Write tests for constants and insight functions**

```ts
// src/lib/__tests__/insights.test.ts
import { describe, it, expect } from 'vitest';
import {
  WINTER_SOLSTICE_DAY, SUMMER_SOLSTICE_DAY,
  SPRING_EQUINOX_DAY, AUTUMN_EQUINOX_DAY,
  RAMADAN_2025_START, RAMADAN_2025_END,
} from '../constants';
import { fajrInsight, fastingInsight, hijriInsight, sunPathInsight, qiblaInsight } from '../insights';
import { CITIES } from '../../data/cities';

describe('constants', () => {
  it('WINTER_SOLSTICE_DAY is 355', () => expect(WINTER_SOLSTICE_DAY).toBe(355));
  it('SUMMER_SOLSTICE_DAY is 172', () => expect(SUMMER_SOLSTICE_DAY).toBe(172));
  it('RAMADAN_2025_START is 60', () => expect(RAMADAN_2025_START).toBe(60));
  it('RAMADAN_2025_END is 88', () => expect(RAMADAN_2025_END).toBe(88));
});

describe('fajrInsight', () => {
  const makkah = CITIES.find((c) => c.name.startsWith('Makkah'))!;
  const london = CITIES.find((c) => c.name.startsWith('London'))!;
  const sampleData = Array.from({ length: 365 }, (_, i) => ({
    day: i + 1, fajr: 4 + Math.sin(i / 58) * 1.5, sunrise: 6 + Math.sin(i / 58) * 2,
  }));
  it('returns a non-empty string for Makkah', () => {
    const s = fajrInsight(makkah, sampleData, null, null, 'en');
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(10);
  });
  it('includes city2 name when compare mode active', () => {
    const s = fajrInsight(makkah, sampleData, london, sampleData, 'en');
    expect(s).toContain('London');
  });
  it('works in Arabic', () => {
    const s = fajrInsight(makkah, sampleData, null, null, 'ar');
    expect(typeof s).toBe('string');
  });
});

describe('fastingInsight', () => {
  const makkah = CITIES.find((c) => c.name.startsWith('Makkah'))!;
  const data = Array.from({ length: 365 }, (_, i) => ({ day: i + 1, hours: 13 + Math.sin(i / 58) * 2 }));
  it('returns a string', () => {
    expect(typeof fastingInsight(makkah, data, 'en')).toBe('string');
  });
});

describe('hijriInsight', () => {
  it('returns a string', () => {
    expect(typeof hijriInsight('en')).toBe('string');
  });
});

describe('sunPathInsight', () => {
  const makkah = CITIES.find((c) => c.name.startsWith('Makkah'))!;
  it('returns a string', () => {
    const s = sunPathInsight(makkah, 14.5, 16.2, 'en');
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(10);
  });
});

describe('qiblaInsight', () => {
  const nyc = CITIES.find((c) => c.name.startsWith('New York'))!;
  it('returns a string mentioning distance', () => {
    const s = qiblaInsight(nyc, 58.5, 'en');
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail (modules don't exist yet)**

```bash
cd /Users/aousabdo/work/islamic_viz
npx vitest run src/lib/__tests__/insights.test.ts --reporter verbose
```

Expected: FAIL — "Cannot find module '../constants'"

- [ ] **Step 3: Create `src/lib/constants.ts`**

```ts
// src/lib/constants.ts
/** Day-of-year constants for a non-leap year (2025 reference). */
export const WINTER_SOLSTICE_DAY = 355;   // ~Dec 21
export const SUMMER_SOLSTICE_DAY = 172;   // ~Jun 21
export const SPRING_EQUINOX_DAY  = 80;    // ~Mar 21
export const AUTUMN_EQUINOX_DAY  = 266;   // ~Sep 23

/** Ramadan 1446 (2025): Fajr-to-Maghrib window. Day-of-year values. */
export const RAMADAN_2025_START  = 60;    // Mar 1
export const RAMADAN_2025_END    = 88;    // Mar 29
```

- [ ] **Step 4: Create `src/components/StoryCallout.tsx`**

```tsx
// src/components/StoryCallout.tsx
type StoryCalloutProps = {
  icon?: string;
  text: string;
  warning?: boolean;
};

/**
 * Glass insight panel rendered below a chart.
 * Set warning=true for polar-anomaly / extreme-fasting cases (orange tint).
 */
export default function StoryCallout({ icon = '✦', text, warning = false }: StoryCalloutProps) {
  const borderColor = warning ? 'rgba(249,115,22,0.3)' : 'rgba(74,222,204,0.2)';
  const bgColor     = warning ? 'rgba(249,115,22,0.06)' : 'rgba(74,222,204,0.05)';
  const labelColor  = warning ? 'var(--chart-3)' : 'var(--accent)';

  return (
    <div
      style={{
        marginTop: 12,
        padding: '12px 16px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: labelColor,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        {icon} Insight
      </div>
      <p style={{ fontSize: 13, margin: 0, lineHeight: 1.65, color: 'var(--ink)' }}>
        {text}
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/lib/insights.ts`**

```ts
// src/lib/insights.ts
import type { City } from '../data/cities';
import { dayToMonth } from './chartUtils';
import { haversineDistance } from './qibla';
import { gregorianToHijri, ramadanStart } from './hijri';

export type Lang = 'en' | 'ar';

export type FajrPoint    = { day: number; fajr: number; sunrise: number };
export type FastingPoint = { day: number; hours: number };

// ── helpers ──────────────────────────────────────────────────────────────────

function cityName(city: City, lang: Lang): string {
  return (lang === 'ar' && city.nameAr) ? city.nameAr : city.name.split(',')[0];
}

function fmtHm(decHours: number): string {
  const h = Math.floor(decHours);
  const m = Math.round((decHours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── fajrInsight ───────────────────────────────────────────────────────────────

export function fajrInsight(
  city: City,
  data: FajrPoint[],
  city2: City | null,
  data2: FajrPoint[] | null,
  lang: Lang,
): string {
  const valid = data.filter((p) => isFinite(p.fajr) && isFinite(p.sunrise));
  if (valid.length === 0) return lang === 'ar' ? 'لا توجد بيانات.' : 'No data available.';

  const polarDays = data.length - valid.length;
  const cn = cityName(city, lang);

  if (polarDays > 10) {
    return lang === 'ar'
      ? `⚠️ ${cn} لديها ${polarDays} يومًا لا يُعرَّف فيها وقت الفجر — الشفق لا ينتهي قرب الانقلاب الصيفي.`
      : `⚠️ ${cn} has ${polarDays} days with no defined Fajr — twilight never fully ends near the summer solstice.`;
  }

  const gaps = valid.map((p) => ({ day: p.day, gap: p.sunrise - p.fajr }));
  const maxG = gaps.reduce((a, b) => (b.gap > a.gap ? b : a));
  const minG = gaps.reduce((a, b) => (b.gap < a.gap ? b : a));
  const factor = (maxG.gap / minG.gap).toFixed(1);

  if (city2 && data2) {
    const valid2 = data2.filter((p) => isFinite(p.fajr) && isFinite(p.sunrise));
    const maxG2 = valid2.reduce(
      (a, b) => (b.sunrise - b.fajr > a.sunrise - a.fajr ? b : a),
      valid2[0],
    );
    const diff = maxG.gap - (maxG2.sunrise - maxG2.fajr);
    const cn2 = cityName(city2, lang);
    const diffMin = Math.abs(diff * 60).toFixed(0);
    const dir = lang === 'ar' ? (diff > 0 ? 'أطول' : 'أقصر') : (diff > 0 ? 'longer' : 'shorter');
    return lang === 'ar'
      ? `في ${cn}، فجوة الفجر–الشروق تبلغ ${fmtHm(maxG.gap)} في ${dayToMonth(maxG.day)} — بفارق ${diffMin} دقيقة ${dir} مقارنةً بـ ${cn2}.`
      : `In ${cn}, the Fajr–Sunrise gap peaks at ${fmtHm(maxG.gap)} in ${dayToMonth(maxG.day)} — ${diffMin} min ${dir} than ${cn2}.`;
  }

  return lang === 'ar'
    ? `في ${cn}، فجوة الفجر–الشروق تبلغ ذروتها ${fmtHm(maxG.gap)} في ${dayToMonth(maxG.day)} — ${factor}× أوسع من أضيق نقطة في السنة.`
    : `In ${cn}, the Fajr–Sunrise gap peaks at ${fmtHm(maxG.gap)} in ${dayToMonth(maxG.day)} — ${factor}× wider than its narrowest point in the year.`;
}

// ── fastingInsight ────────────────────────────────────────────────────────────

export function fastingInsight(
  city: City,
  data: FastingPoint[],
  city2: City | null,
  data2: FastingPoint[] | null,
  lang: Lang,
): string {
  const valid = data.filter((p) => isFinite(p.hours) && p.hours > 0);
  if (valid.length === 0) return lang === 'ar' ? 'لا توجد بيانات.' : 'No data available.';

  const maxP = valid.reduce((a, b) => (b.hours > a.hours ? b : a));
  const minP = valid.reduce((a, b) => (b.hours < a.hours ? b : a));
  const cn   = cityName(city, lang);
  const isExtreme = maxP.hours > 20;
  const isEquatorial = Math.abs(city.lat) < 15;

  if (city2 && data2) {
    const valid2  = data2.filter((p) => isFinite(p.hours) && p.hours > 0);
    const maxP2   = valid2.reduce((a, b) => (b.hours > a.hours ? b : a), valid2[0]);
    const diff    = maxP.hours - maxP2.hours;
    const cn2     = cityName(city2, lang);
    return lang === 'ar'
      ? `في ذروة الصيام، ${cn} (${maxP.hours.toFixed(1)}h) ${diff > 0 ? 'أطول' : 'أقصر'} بـ ${Math.abs(diff).toFixed(1)} ساعة مقارنةً بـ ${cn2} (${maxP2.hours.toFixed(1)}h).`
      : `At peak, ${cn} (${maxP.hours.toFixed(1)}h) fasts ${Math.abs(diff).toFixed(1)} hrs ${diff > 0 ? 'longer' : 'shorter'} than ${cn2} (${maxP2.hours.toFixed(1)}h).`;
  }

  if (isExtreme) {
    return lang === 'ar'
      ? `⚠️ في ${cn}، تبلغ ساعات الصيام ${maxP.hours.toFixed(1)} ساعة في ${dayToMonth(maxP.day)} — تجيز بعض المذاهب التخفيف بناءً على خط العرض.`
      : `⚠️ ${cn} peaks at ${maxP.hours.toFixed(1)} fasting hours in ${dayToMonth(maxP.day)} — traditional scholars permit latitude-based adjustments at this extreme.`;
  }
  if (isEquatorial) {
    const swing = ((maxP.hours - minP.hours) * 60).toFixed(0);
    return lang === 'ar'
      ? `${cn} قريبة من خط الاستواء — لا يتغير وقت الصيام إلا بمقدار ${swing} دقيقة على مدار السنة.`
      : `${cn} sits near the equator — fasting hours vary by only ${swing} minutes across the entire year.`;
  }

  return lang === 'ar'
    ? `في ${cn}، تبلغ ساعات الصيام ذروتها ${maxP.hours.toFixed(1)} ساعة في ${dayToMonth(maxP.day)} وأدناها ${minP.hours.toFixed(1)} ساعة في ${dayToMonth(minP.day)}.`
    : `In ${cn}, fasting peaks at ${maxP.hours.toFixed(1)} hrs in ${dayToMonth(maxP.day)} and drops to ${minP.hours.toFixed(1)} hrs in ${dayToMonth(minP.day)}.`;
}

// ── hijriInsight ──────────────────────────────────────────────────────────────

export function hijriInsight(lang: Lang): string {
  const now = new Date();
  const hNow = gregorianToHijri(now);
  // Find this year's Ramadan start
  let ramadanG: Date;
  try { ramadanG = ramadanStart(hNow.year); } catch { return ''; }

  const doy = Math.floor(
    (ramadanG.getTime() - Date.UTC(ramadanG.getUTCFullYear(), 0, 0)) / 86_400_000,
  );
  const month = dayToMonth(doy);
  const nextCycleYear = ramadanG.getUTCFullYear() + 33;

  return lang === 'ar'
    ? `رمضان ${hNow.year} يبدأ في ${month} ${ramadanG.getUTCFullYear()} — بسبب دورة ٣٣ عامًا، سيعود رمضان إلى نفس الموسم تقريبًا عام ${nextCycleYear}.`
    : `Ramadan ${hNow.year} AH starts in ${month} ${ramadanG.getUTCFullYear()} — due to the 33-year Hijri cycle, it returns to the same season around ${nextCycleYear}.`;
}

// ── sunPathInsight ────────────────────────────────────────────────────────────

export function sunPathInsight(
  city: City,
  asrShafii: number,
  asrHanafi: number,
  lang: Lang,
): string {
  const diffMin = Math.round((asrHanafi - asrShafii) * 60);
  const cn = cityName(city, lang);
  return lang === 'ar'
    ? `في ${cn} اليوم، العصر الحنفي يأتي ${diffMin} دقيقة بعد العصر الشافعي. يتسع هذا الفارق بزيادة خط العرض وفي الشتاء — وقد يتجاوز ساعتين في لندن شتاءً.`
    : `In ${cn} today, the Hanafi Asr is ${diffMin} min later than the Shafi'i Asr. This gap widens with latitude and in winter — exceeding 2 hours in London in December.`;
}

// ── qiblaInsight ─────────────────────────────────────────────────────────────

export function qiblaInsight(city: City, bearing: number, lang: Lang): string {
  const cn  = cityName(city, lang);
  const km  = Math.round(haversineDistance({ lat: city.lat, lng: city.lng }, { lat: 21.4225, lng: 39.8262 }));
  const mi  = Math.round(km * 0.621371);

  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const dir  = dirs[Math.round(bearing / 22.5) % 16];

  const bendNote = city.lat > 40
    ? (lang === 'ar' ? 'ينحني المسار شمالًا فوق المحيط الأطلسي/القطب الشمالي' : 'the path bends north over the Atlantic/Arctic')
    : city.lat < -10
    ? (lang === 'ar' ? 'ينحني المسار جنوبًا نحو المحيط الهندي' : 'the path curves south over the Indian Ocean')
    : (lang === 'ar' ? 'يسير المسار شبه مستقيم عبر المناطق الاستوائية' : 'the path runs nearly straight across the tropics');

  return lang === 'ar'
    ? `من ${cn}، مكة المكرمة تقع على بُعد ${km.toLocaleString()} كم (${mi.toLocaleString()} ميل) باتجاه ${bearing.toFixed(1)}° — ${bendNote} على سطح الكرة الأرضية.`
    : `From ${cn}, Makkah is ${km.toLocaleString()} km (${mi.toLocaleString()} mi) at ${bearing.toFixed(1)}° (${dir}) — ${bendNote} on the sphere.`;
}
```

- [ ] **Step 6: Append `haversineDistance` to `src/lib/qibla.ts`**

Open `src/lib/qibla.ts` and append at the end (after the `MAKKAH_COORDS` export):

```ts
/** Haversine great-circle distance in kilometres between two lat/lng points. */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * RAD;
  const dLng = (b.lng - a.lng) * RAD;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
```

- [ ] **Step 7: Append `sunAzimuth` to `src/lib/solar.ts`**

Open `src/lib/solar.ts` and append at the end:

```ts
/**
 * Sun azimuth in degrees from south (positive = west, negative = east) at a given local clock hour.
 * Used by the Analemma visualization.
 * Returns NaN if sun is below the horizon.
 */
export function sunAzimuth(loc: Location, d: Date, localHour: number): number {
  const n   = dayOfYear(d);
  const dec = solarDeclination(n) * RAD;
  const phi = loc.lat * RAD;
  const noon = solarNoon(loc, d);
  const ha  = (localHour - noon) * 15 * RAD;
  const sinAlt = Math.sin(dec) * Math.sin(phi) + Math.cos(dec) * Math.cos(phi) * Math.cos(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  if (alt * DEG < -0.833) return NaN; // below horizon
  const cosAz = (Math.sin(dec) - Math.sin(phi) * sinAlt) / (Math.cos(phi) * Math.cos(alt));
  return Math.acos(Math.max(-1, Math.min(1, cosAz))) * DEG * (Math.sin(ha) > 0 ? 1 : -1);
}
```

- [ ] **Step 8: Add CSS tokens to `src/styles/tokens.css`**

In the `:root` block, after `--chart-3: #f97316;` add:
```css
--chart-4: #8b7ec8;   /* twilight purple — Isha prayer */
--chart-5: #e07040;   /* sunset orange  — Maghrib prayer */
```

In the `[data-theme="light"]` block, after `--chart-3: #c2410c;` add:
```css
--chart-4: #5b4e9e;
--chart-5: #c05020;
```

- [ ] **Step 9: Add Tailwind color entries to `tailwind.config.ts`**

In the `colors` object (after `'chart-3': 'var(--chart-3)'`) add:
```ts
'chart-4': 'var(--chart-4)',
'chart-5': 'var(--chart-5)',
```

- [ ] **Step 10: Run all tests**

```bash
npx vitest run --reporter verbose
```

Expected: All pass including the new insights tests.

- [ ] **Step 11: Commit**

```bash
git add src/lib/constants.ts src/components/StoryCallout.tsx src/lib/insights.ts \
  src/lib/__tests__/insights.test.ts src/lib/solar.ts src/lib/qibla.ts \
  src/styles/tokens.css tailwind.config.ts
git commit -m "feat(s0): shared storytelling infra — constants, StoryCallout, insights, sunAzimuth, haversineDistance, chart-4/5 tokens"
```

---

### Task T1-A: FajrGlobe Storytelling Upgrade

**Files:**
- Modify: `src/viz/fajr-globe/FajrGlobe.tsx`

Context: existing component at `src/viz/fajr-globe/FajrGlobe.tsx`. Add solstice/equinox/Ramadan reference lines, compare-city overlay, and StoryCallout. S0 must be complete first.

- [ ] **Step 1: Replace `src/viz/fajr-globe/FajrGlobe.tsx` with the upgraded version**

```tsx
// src/viz/fajr-globe/FajrGlobe.tsx
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { CITIES } from '../../data/cities';
import { CALC_METHODS, getMethod } from '../../data/calc-methods';
import { sunriseSunset, fajrTime, hoursToHHMM } from '../../lib/solar';
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
import { fajrInsight } from '../../lib/insights';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

export default function FajrGlobe() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [methodId, setMethodId]   = useState('umm');
  const [city2Idx, setCity2Idx]   = useState<number | null>(null);

  const city    = CITIES[cityIdx];
  const city2   = city2Idx !== null ? CITIES[city2Idx] : null;
  const method  = getMethod(methodId);

  const buildData = (c: typeof city) =>
    Array.from({ length: 365 }, (_, i) => {
      const n = i + 1;
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(c.dstType, d) ? 1 : 0;
      const loc = { lat: c.lat, lng: c.lng, tz: c.tz + dstOffset };
      return { day: n, fajr: fajrTime(loc, d, method.fajrAngle), sunrise: sunriseSunset(loc, d).sunrise };
    });

  const data  = useMemo(() => buildData(city),  [city, method]);
  const data2 = useMemo(() => city2 ? buildData(city2) : null, [city2, method]);

  const fmtHour = (h: number) => { const { hh, mm } = hoursToHHMM(h); return `${hh}:${mm}`; };

  const insight = fajrInsight(city, data, city2, data2, lang);
  const isWarning = insight.startsWith('⚠️');

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.city}</span>
          <select value={cityIdx} onChange={(e) => setCityIdx(+e.target.value)}
            className="border rounded-lg px-2 py-1"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.method}</span>
          <select value={methodId} onChange={(e) => setMethodId(e.target.value)}
            className="border rounded-lg px-2 py-1"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            {CALC_METHODS.map((m) => (
              <option key={m.id} value={m.id}>{lang === 'ar' ? m.labelAr : m.labelEn}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>
            {lang === 'ar' ? 'مقارنة مع' : 'Compare'}
          </span>
          <select
            value={city2Idx ?? ''}
            onChange={(e) => setCity2Idx(e.target.value === '' ? null : +e.target.value)}
            className="border rounded-lg px-2 py-1"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            <option value="">{lang === 'ar' ? 'لا شيء' : 'None'}</option>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <GlowDefs />

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            {/* Ramadan band */}
            <ReferenceArea x1={RAMADAN_2025_START} x2={RAMADAN_2025_END}
              fill="rgba(212,180,131,0.07)" stroke="none"
              label={{ value: "Ramadan '25", fill: 'var(--gold)', fontSize: 9, position: 'insideTop' }} />

            {/* Solstice lines */}
            <ReferenceLine x={WINTER_SOLSTICE_DAY} stroke="var(--gold)"
              strokeDasharray="2 4" strokeOpacity={0.6}
              label={{ value: '❄', position: 'insideTopLeft', fill: 'var(--gold)', fontSize: 11 }} />
            <ReferenceLine x={SUMMER_SOLSTICE_DAY} stroke="var(--chart-3)"
              strokeDasharray="2 4" strokeOpacity={0.6}
              label={{ value: '☀', position: 'insideTopLeft', fill: 'var(--chart-3)', fontSize: 11 }} />

            {/* Equinox lines */}
            <ReferenceLine x={SPRING_EQUINOX_DAY}  stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.35} />
            <ReferenceLine x={AUTUMN_EQUINOX_DAY}  stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.35} />

            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis dataKey="day" ticks={MONTH_TICKS} tickFormatter={dayToMonth}
              stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }} />
            <YAxis domain={[0, 8]} tickFormatter={fmtHour}
              stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }} />
            <Tooltip content={
              <ChartTooltip labelFormatter={(d) => dayToMonth(Number(d))} valueFormatter={(v) => fmtHour(Number(v))} />
            } />

            {/* Primary city */}
            <Area type="monotone" dataKey="fajr"    name="Fajr"    stroke="var(--chart-1)" strokeWidth={2}
              fill="url(#grad-chart1)" filter="url(#glow)" dot={false} activeDot={{ r: 4, fill: 'var(--chart-1)' }} />
            <Area type="monotone" dataKey="sunrise" name="Sunrise" stroke="var(--chart-2)" strokeWidth={1.5}
              fill="url(#grad-chart2)" filter="url(#glow)" dot={false} activeDot={{ r: 4, fill: 'var(--chart-2)' }} />

            {/* Compare city overlay */}
            {data2 && (
              <>
                <Area data={data2} type="monotone" dataKey="fajr"    name={`Fajr (${city2?.name.split(',')[0]})`}
                  stroke="var(--chart-2)" strokeWidth={1} strokeDasharray="4 2"
                  fill="none" dot={false} activeDot={{ r: 3, fill: 'var(--chart-2)' }} />
                <Area data={data2} type="monotone" dataKey="sunrise" name={`Sunrise (${city2?.name.split(',')[0]})`}
                  stroke="var(--chart-3)" strokeWidth={1} strokeDasharray="4 2"
                  fill="none" dot={false} activeDot={{ r: 3, fill: 'var(--chart-3)' }} />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <StoryCallout text={insight} warning={isWarning} />
    </div>
  );
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run --reporter verbose
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/viz/fajr-globe/FajrGlobe.tsx
git commit -m "feat(t1-a): FajrGlobe — solstice/equinox/Ramadan annotations, compare-city, StoryCallout"
```

---

### Task T1-B: FastingHours Storytelling Upgrade

**Files:**
- Modify: `src/viz/fasting-hours/FastingHours.tsx`

- [ ] **Step 1: Replace `src/viz/fasting-hours/FastingHours.tsx`**

```tsx
// src/viz/fasting-hours/FastingHours.tsx
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { CITIES } from '../../data/cities';
import { sunriseSunset, fajrTime } from '../../lib/solar';
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
import { fastingInsight } from '../../lib/insights';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const SEASON_BANDS = [
  { x1: 1,   x2: 79,  fill: 'rgba(30,60,100,0.08)',  label: 'Winter' },
  { x1: 80,  x2: 171, fill: 'rgba(30,100,60,0.08)',  label: 'Spring' },
  { x1: 172, x2: 265, fill: 'rgba(100,60,10,0.08)',  label: 'Summer' },
  { x1: 266, x2: 365, fill: 'rgba(60,30,80,0.08)',   label: 'Autumn' },
] as const;

export default function FastingHours() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx,  setCityIdx]  = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [city2Idx, setCity2Idx] = useState<number | null>(null);

  const city  = CITIES[cityIdx];
  const city2 = city2Idx !== null ? CITIES[city2Idx] : null;

  const buildData = (c: typeof city) =>
    Array.from({ length: 365 }, (_, i) => {
      const n = i + 1;
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(c.dstType, d) ? 1 : 0;
      const loc = { lat: c.lat, lng: c.lng, tz: c.tz + dstOffset };
      const { sunset } = sunriseSunset(loc, d);
      const fajr = fajrTime(loc, d, 18.5);
      return { day: n, hours: isFinite(fajr) && isFinite(sunset) ? sunset - fajr : NaN };
    });

  const data  = useMemo(() => buildData(city),  [city]);
  const data2 = useMemo(() => city2 ? buildData(city2) : null, [city2]);

  const insight = fastingInsight(city, data, city2, data2, lang);
  const isWarning = insight.startsWith('⚠️');

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
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{lang === 'ar' ? 'مقارنة مع' : 'Compare'}</span>
          <select value={city2Idx ?? ''} onChange={(e) => setCity2Idx(e.target.value === '' ? null : +e.target.value)}
            className="border rounded-lg px-2 py-1"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}>
            <option value="">{lang === 'ar' ? 'لا شيء' : 'None'}</option>
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <GlowDefs />

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            {SEASON_BANDS.map((s) => (
              <ReferenceArea key={s.label} x1={s.x1} x2={s.x2} fill={s.fill} stroke="none" ifOverflow="hidden" />
            ))}

            {/* Ramadan band */}
            <ReferenceArea x1={RAMADAN_2025_START} x2={RAMADAN_2025_END}
              fill="rgba(212,180,131,0.07)" stroke="none"
              label={{ value: "Ramadan '25", fill: 'var(--gold)', fontSize: 9, position: 'insideTop' }} />

            {/* Polar extreme zone */}
            <ReferenceArea y1={20} y2={24} fill="rgba(239,68,68,0.06)" stroke="none"
              label={{ value: 'Extreme zone', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} />

            {/* Solstice lines */}
            <ReferenceLine x={WINTER_SOLSTICE_DAY} stroke="var(--gold)"    strokeDasharray="2 4" strokeOpacity={0.6}
              label={{ value: '❄', position: 'insideTopLeft', fill: 'var(--gold)',    fontSize: 11 }} />
            <ReferenceLine x={SUMMER_SOLSTICE_DAY} stroke="var(--chart-3)" strokeDasharray="2 4" strokeOpacity={0.6}
              label={{ value: '☀', position: 'insideTopLeft', fill: 'var(--chart-3)', fontSize: 11 }} />
            <ReferenceLine x={SPRING_EQUINOX_DAY}  stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.35} />
            <ReferenceLine x={AUTUMN_EQUINOX_DAY}  stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.35} />

            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis dataKey="day" ticks={MONTH_TICKS} tickFormatter={dayToMonth}
              stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }} />
            <YAxis domain={[0, 24]} stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }} />
            <Tooltip content={
              <ChartTooltip labelFormatter={(d) => dayToMonth(Number(d))} valueFormatter={(v) => `${Number(v).toFixed(1)} hrs`} />
            } />

            <Area type="monotone" dataKey="hours" name="Fasting hours"
              stroke="var(--chart-1)" strokeWidth={2}
              fill="url(#grad-chart1)" filter="url(#glow)"
              dot={false} activeDot={{ r: 4, fill: 'var(--chart-1)' }} />

            {data2 && (
              <Area data={data2} type="monotone" dataKey="hours"
                name={`Fasting (${city2?.name.split(',')[0]})`}
                stroke="var(--chart-2)" strokeWidth={1.5} strokeDasharray="4 2"
                fill="none" dot={false} activeDot={{ r: 3, fill: 'var(--chart-2)' }} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <StoryCallout text={insight} warning={isWarning} />
    </div>
  );
}
```

- [ ] **Step 2: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/fasting-hours/FastingHours.tsx
git commit -m "feat(t1-b): FastingHours — solstice/equinox/Ramadan annotations, extreme zone, compare-city, StoryCallout"
```

---

### Task T1-C: HijriDrift Storytelling Upgrade

**Files:**
- Modify: `src/viz/hijri-drift/HijriDrift.tsx`

- [ ] **Step 1: Replace `src/viz/hijri-drift/HijriDrift.tsx`**

```tsx
// src/viz/hijri-drift/HijriDrift.tsx
import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { ramadanStart } from '../../lib/hijri';
import { useLang } from '../../i18n/useLang';
import GlowDefs from '../../components/GlowDefs';
import ChartTooltip from '../../components/ChartTooltip';
import StoryCallout from '../../components/StoryCallout';
import { hijriInsight } from '../../lib/insights';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const START_H_YEAR = 1445;
const END_H_YEAR   = 1478;

const Y_BANDS = [
  { y1: 1,   y2: 79,  fill: 'rgba(30,60,100,0.08)'  },
  { y1: 80,  y2: 171, fill: 'rgba(30,100,60,0.08)'  },
  { y1: 172, y2: 265, fill: 'rgba(100,60,10,0.08)'  },
  { y1: 266, y2: 366, fill: 'rgba(60,30,80,0.08)'   },
] as const;

type DotProps = { cx?: number; cy?: number; payload?: { dayOfYear: number; hYear: number } };

function GlowDot({ cx = 0, cy = 0, payload }: DotProps) {
  const isFirstHalf = (payload?.dayOfYear ?? 0) <= 182;
  const showLabel   = payload && payload.hYear % 5 === 0;
  return (
    <g>
      <circle cx={cx} cy={cy} r={4}
        fill={isFirstHalf ? 'var(--chart-1)' : 'var(--chart-2)'}
        fillOpacity={0.85} filter="url(#dot-glow)" />
      {showLabel && (
        <text x={cx + 6} y={cy + 4} fontSize={9} fill="var(--ink-dim)">{payload!.hYear}</text>
      )}
    </g>
  );
}

export default function HijriDrift() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const data = useMemo(() => {
    const pts: Array<{ gYear: number; dayOfYear: number; hYear: number }> = [];
    for (let h = START_H_YEAR; h <= END_H_YEAR; h++) {
      try {
        const d   = ramadanStart(h);
        const gY  = d.getUTCFullYear();
        const day = Math.floor((d.getTime() - Date.UTC(gY, 0, 0)) / 86_400_000);
        pts.push({ gYear: gY, dayOfYear: day, hYear: h });
      } catch { /* ignore */ }
    }
    return pts;
  }, []);

  const seasonTicks  = [1, 80, 172, 266, 355];
  const seasonLabels = lang === 'ar'
    ? ['يناير', 'الربيع', 'الصيف', 'الخريف', 'الشتاء']
    : ['Jan 1', 'Spring', 'Summer', 'Autumn', 'Winter'];

  // 33-year cycle: every 33 Gregorian years ≈ 34 Hijri years
  const cycleX = data.length > 0 ? data[0].gYear + 33 : 2060;

  return (
    <div>
      <div className="text-sm mb-3" style={{ color: 'var(--ink-dim)' }}>{dict.subtitle}</div>

      <GlowDefs />

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 24 }}>
            {Y_BANDS.map((b, i) => (
              <ReferenceArea key={i} y1={b.y1} y2={b.y2} fill={b.fill} stroke="none" ifOverflow="hidden" />
            ))}

            {/* 33-year cycle annotation */}
            <ReferenceLine x={cycleX} stroke="var(--accent)" strokeDasharray="3 3" strokeOpacity={0.5}
              label={{ value: '33-yr cycle', fill: 'var(--accent)', fontSize: 9, position: 'insideTopRight' }} />

            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis type="number" dataKey="gYear" domain={['auto', 'auto']}
              stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
              label={{ value: dict.axes.x, position: 'insideBottom', offset: -8, fill: 'var(--ink-dim)' }} />
            <YAxis type="number" dataKey="dayOfYear" domain={[0, 366]}
              ticks={seasonTicks} tickFormatter={(t: number) => seasonLabels[seasonTicks.indexOf(t)] ?? ''}
              stroke="var(--ink-dim)" tick={{ fill: 'var(--ink-dim)', fontSize: 11 }} reversed />
            <Tooltip content={
              <ChartTooltip
                labelFormatter={(l) => `${l}`}
                valueFormatter={(v, name) => name === 'dayOfYear' ? `Day ${Math.round(v)}` : String(v)} />
            } />
            <Scatter data={data} shape={(props: DotProps) => <GlowDot {...props} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <StoryCallout text={hijriInsight(lang)} />
    </div>
  );
}
```

- [ ] **Step 2: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/hijri-drift/HijriDrift.tsx
git commit -m "feat(t1-c): HijriDrift — 33-yr cycle line, year labels every 5, StoryCallout"
```

---

### Task T1-D: SunPathAsr Storytelling Upgrade

**Files:**
- Modify: `src/viz/sun-path-asr/SunPathAsr.tsx`

- [ ] **Step 1: Read current file (required before Edit)**

```bash
cat src/viz/sun-path-asr/SunPathAsr.tsx
```

- [ ] **Step 2: Add StoryCallout import and render after the existing SVG**

In `src/viz/sun-path-asr/SunPathAsr.tsx`, make the following targeted changes:

**2a.** Add imports after the existing imports block:
```tsx
import StoryCallout from '../../components/StoryCallout';
import { sunPathInsight } from '../../lib/insights';
```

**2b.** In the return statement, add a peak altitude label inside the SVG. Find the `<text>` elements that show `asrMarkers` (there's a section that maps over `asrMarkers`). After the closing of that map, add a noon peak label — insert this inside the `<svg>` element, after the arc markers section:

```tsx
{/* Peak altitude at noon */}
{(() => {
  const noonX = xScale(noon);
  const peakAlt = Math.max(...points.map((p) => p.alt));
  const noonY = yScale(peakAlt) - 10;
  return (
    <text x={noonX} y={noonY} textAnchor="middle" fontSize={10} fill="var(--gold)" opacity={0.85}>
      {peakAlt.toFixed(1)}°
    </text>
  );
})()}
```

**2c.** After the closing `</svg>` tag (and after the existing info grid div if any), add:
```tsx
<StoryCallout text={sunPathInsight(city, asrShafii, asrHanafi, lang)} />
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/sun-path-asr/SunPathAsr.tsx
git commit -m "feat(t1-d): SunPathAsr — peak altitude label, StoryCallout with madhab diff"
```

---

### Task T1-E: QiblaGC Storytelling Upgrade

**Files:**
- Modify: `src/viz/qibla-great-circle/QiblaGC.tsx`

- [ ] **Step 1: Read current file**

```bash
cat src/viz/qibla-great-circle/QiblaGC.tsx
```

- [ ] **Step 2: Add StoryCallout and haversine distance to `src/viz/qibla-great-circle/QiblaGC.tsx`**

**2a.** Add imports (after existing imports):
```tsx
import StoryCallout from '../../components/StoryCallout';
import { qiblaInsight } from '../../lib/insights';
import { haversineDistance } from '../../lib/qibla';
```

**2b.** After the existing `const bearing = qiblaBearing(...)` line, add:
```tsx
const distKm = Math.round(haversineDistance({ lat: city.lat, lng: city.lng }, MAKKAH_COORDS));
const distMi = Math.round(distKm * 0.621371);
```

**2c.** In the bearing display bar (the `<div>` that shows the bearing value), extend it to also show distance:
```tsx
<div style={{ color: 'var(--ink-dim)' }}>
  {dict.labels.bearing}:{' '}
  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{bearing.toFixed(1)}°</span>
  {'  ·  '}
  <span style={{ color: 'var(--gold)' }}>{distKm.toLocaleString()} km</span>
  <span style={{ color: 'var(--ink-dim)', fontSize: 11 }}> ({distMi.toLocaleString()} mi)</span>
</div>
```

**2d.** At the very end of the returned JSX (after the closing SVG div), add:
```tsx
<StoryCallout text={qiblaInsight(city, bearing, lang)} />
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/qibla-great-circle/QiblaGC.tsx
git commit -m "feat(t1-e): QiblaGC — haversine distance display, StoryCallout with great-circle narrative"
```

---

## Final verification for Plan A

- [ ] **Run full test suite**

```bash
npx vitest run --reporter verbose
```

Expected: all tests pass.

- [ ] **Build check**

```bash
npm run build
```

Expected: no TypeScript errors, build succeeds.
