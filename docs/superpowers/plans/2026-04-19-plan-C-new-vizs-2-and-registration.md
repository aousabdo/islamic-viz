# New Visualizations — Plan C: Hijri Calendar, Polar Anomaly, Analemma, Ramadan World + Route Registration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 4 more new Islamic science visualizations (HijriCalendar, PolarAnomaly, Analemma, RamadanWorld) and register all 8 new routes in `visualizations.ts`.

**Prerequisites:**
- T2-5, T2-6, T2-7, T2-8: independent — can run in parallel with Plans A and B.
- FINAL (route registration): requires ALL of Plans A, B, C viz tasks to be complete.
- T2-7 (Analemma): requires `sunAzimuth` from `src/lib/solar.ts` — this is added in Plan A Task S0. If Plan A S0 is not yet done, add the function manually (see Task T2-7 Step 1b).

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, d3-geo ^3.1 (already installed), vitest

**Route registration happens in the FINAL task of this plan** — it touches `src/data/visualizations.ts`.

---

## File Structure

**New files created in this plan:**
- `src/viz/hijri-calendar/HijriCalendar.tsx`
- `src/viz/hijri-calendar/content.en.json`
- `src/viz/hijri-calendar/content.ar.json`
- `src/viz/polar-anomaly/PolarAnomaly.tsx`
- `src/viz/polar-anomaly/content.en.json`
- `src/viz/polar-anomaly/content.ar.json`
- `src/viz/analemma/Analemma.tsx`
- `src/viz/analemma/content.en.json`
- `src/viz/analemma/content.ar.json`
- `src/viz/ramadan-world/RamadanWorld.tsx`
- `src/viz/ramadan-world/content.en.json`
- `src/viz/ramadan-world/content.ar.json`

**Modified in FINAL task:**
- `src/data/visualizations.ts`

---

### Task T2-5: Hijri Calendar Bridge (`hijri-calendar`)

**Files:**
- Create: `src/viz/hijri-calendar/HijriCalendar.tsx`
- Create: `src/viz/hijri-calendar/content.en.json`
- Create: `src/viz/hijri-calendar/content.ar.json`

**What it does:** Horizontal bar chart showing 12 Hijri months as bars on a Gregorian x-axis. Ramadan (month 9) glows teal; Dhul Hijja (month 12) glows gold. Year slider 1440–1460 AH shows the drift.

- [ ] **Step 1: Create content JSON files**

```json
// src/viz/hijri-calendar/content.en.json
{
  "title": "Hijri Calendar Bridge",
  "subtitle": "Twelve lunar months mapped to Gregorian time — watch them drift across the year",
  "tag": "calendar",
  "controls": { "year": "Hijri year" },
  "explainer": [
    { "type": "p", "text": "The Islamic lunar calendar has 354 or 355 days, roughly 11 days shorter than the Gregorian year. This means every Islamic event — Ramadan, Hajj, the Islamic New Year — drifts backward through the Gregorian calendar by about 11 days per year. Use the slider to watch Ramadan move from one season to another as the years advance." },
    { "type": "p", "text": "Every 33 years, the Hijri calendar completes roughly 34 cycles — bringing key events almost back to the same Gregorian date. This is the pattern behind the observation that 'Ramadan returns to your birthdate every 33 years.'" }
  ],
  "methodology": [
    { "type": "p", "text": "Hijri dates are computed using the Umm al-Qura calendar via the browser's Intl.DateTimeFormat with the 'islamic-umalqura' calendar extension. Each Hijri month's Gregorian start and end date is found by scanning candidate dates. Bar widths reflect actual month lengths (29 or 30 days)." }
  ]
}
```

```json
// src/viz/hijri-calendar/content.ar.json
{
  "title": "جسر التقويم الهجري",
  "subtitle": "اثنا عشر شهرًا قمريًا على التقويم الميلادي — شاهد انزياحها عبر السنين",
  "tag": "calendar",
  "controls": { "year": "السنة الهجرية" },
  "explainer": [
    { "type": "p", "text": "التقويم الإسلامي القمري أقصر من الميلادي بنحو 11 يومًا، فيتقدم كل حدث إسلامي — رمضان والحج ورأس السنة — في التقويم الميلادي بحوالي 11 يومًا كل عام. استخدم المنزلق لمشاهدة انتقال رمضان من فصل إلى آخر." },
    { "type": "p", "text": "كل 33 سنة ميلادية تكمل التقويمات دورة تقريبية تعيد المناسبات إلى التواريخ الميلادية ذاتها تقريبًا — وهو الأساس الرياضي للقول بأن 'رمضان يعود إلى يوم ميلادك كل 33 سنة'." }
  ],
  "methodology": [
    { "type": "p", "text": "تُحسب التواريخ الهجرية باستخدام تقويم أم القرى عبر Intl.DateTimeFormat بامتداد 'islamic-umalqura'. يُحدد تاريخ بداية كل شهر هجري ونهايته بمسح التواريخ الميلادية. عرض الأشرطة يعكس طول الشهر الفعلي (29 أو 30 يومًا)." }
  ]
}
```

- [ ] **Step 2: Create `src/viz/hijri-calendar/HijriCalendar.tsx`**

```tsx
// src/viz/hijri-calendar/HijriCalendar.tsx
import { useMemo, useState } from 'react';
import { gregorianToHijri } from '../../lib/hijri';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const HIJRI_MONTH_NAMES_EN = [
  'Muharram','Safar','Rabi I','Rabi II','Jumada I','Jumada II',
  'Rajab','Sha\'ban','Ramadan','Shawwal','Dhu al-Qi\'dah','Dhu al-Hijjah',
];
const HIJRI_MONTH_NAMES_AR = [
  'محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة',
  'رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة',
];
const GREGORIAN_MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function findHijriMonthStart(hYear: number, hMonth: number): Date | null {
  // Approximate Gregorian year for this Hijri year
  const approxGYear = Math.floor(hYear * 0.970229 + 621.5643);
  const start = new Date(Date.UTC(approxGYear - 1, 0, 1));
  const end   = new Date(Date.UTC(approxGYear + 1, 11, 31));
  for (let t = start.getTime(); t <= end.getTime(); t += 86_400_000) {
    const d = new Date(t);
    const h = gregorianToHijri(d);
    if (h.year === hYear && h.month === hMonth && h.day === 1) return d;
  }
  return null;
}

type MonthBar = {
  hMonth: number;     // 1–12
  label: string;
  startDay: number;   // day of chosen Gregorian year (can be negative if spans prev year)
  lengthDays: number;
};

function buildBars(hYear: number): MonthBar[] {
  const bars: MonthBar[] = [];
  // The Gregorian year we display on the x-axis
  const approxGYear = Math.floor(hYear * 0.970229 + 621.5643);
  const gYearStart = Date.UTC(approxGYear, 0, 1);

  for (let m = 1; m <= 12; m++) {
    const start = findHijriMonthStart(hYear, m);
    if (!start) continue;
    const next  = (m < 12) ? findHijriMonthStart(hYear, m + 1) : findHijriMonthStart(hYear + 1, 1);
    const length = next ? Math.round((next.getTime() - start.getTime()) / 86_400_000) : 29;
    const startDay = Math.floor((start.getTime() - gYearStart) / 86_400_000);
    bars.push({ hMonth: m, label: '', startDay, lengthDays: length });
  }
  return bars;
}

const W = 680;
const ROW_H = 28;
const GAP   = 4;
const LABEL_W = 130;
const HEADER_H = 30;
const YEAR_W = W - LABEL_W;

export default function HijriCalendar() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [hYear, setHYear] = useState(1446);

  const approxGYear = Math.floor(hYear * 0.970229 + 621.5643);
  const bars = useMemo(() => buildBars(hYear), [hYear]);

  const monthNames = lang === 'ar' ? HIJRI_MONTH_NAMES_AR : HIJRI_MONTH_NAMES_EN;

  const svgH = HEADER_H + 12 * (ROW_H + GAP) + 20;

  return (
    <div>
      {/* Year slider */}
      <div className="flex items-center gap-4 mb-5 text-sm">
        <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.year}:</span>
        <strong style={{ color: 'var(--accent)', fontSize: 16 }}>{hYear} AH</strong>
        <input type="range" min={1440} max={1460} value={hYear}
          onChange={(e) => setHYear(+e.target.value)}
          style={{ flex: 1, accentColor: 'var(--accent)' }} />
        <span style={{ color: 'var(--ink-dim)', fontSize: 12 }}>≈ {approxGYear} CE</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={svgH} style={{ display: 'block' }}>
          {/* Month column headers */}
          {GREGORIAN_MONTHS_EN.map((label, i) => {
            const x = LABEL_W + (i / 12) * YEAR_W;
            return (
              <g key={i}>
                <line x1={x} y1={HEADER_H - 8} x2={x} y2={svgH - 10}
                  stroke="var(--rule)" strokeWidth={1} />
                <text x={x + YEAR_W / 24} y={HEADER_H - 10}
                  textAnchor="middle" fontSize={10} fill="var(--ink-dim)">{label}</text>
              </g>
            );
          })}

          {/* Bars */}
          {bars.map(({ hMonth, startDay, lengthDays }, i) => {
            const isRamadan  = hMonth === 9;
            const isDhulHijj = hMonth === 12;
            const isMuharram = hMonth === 1;
            const color = isRamadan ? 'var(--chart-1)' : isDhulHijj ? 'var(--gold)' : isMuharram ? 'var(--accent)' : 'var(--surface-h)';
            const opacity = isRamadan || isDhulHijj ? 0.9 : 0.6;

            const x = LABEL_W + (startDay / 365) * YEAR_W;
            const barW = (lengthDays / 365) * YEAR_W;
            const y = HEADER_H + i * (ROW_H + GAP);

            return (
              <g key={hMonth}>
                {/* Month label */}
                <text x={LABEL_W - 8} y={y + ROW_H / 2 + 4}
                  textAnchor="end" fontSize={10} fill={isRamadan ? 'var(--chart-1)' : isDhulHijj ? 'var(--gold)' : 'var(--ink-dim)'}>
                  {monthNames[hMonth - 1]}
                </text>
                {/* Bar */}
                <rect x={Math.max(LABEL_W, x)} y={y} width={Math.min(barW, W - Math.max(LABEL_W, x))}
                  height={ROW_H} rx={4}
                  fill={color} opacity={opacity} />
                {/* Month number */}
                <text x={Math.max(LABEL_W, x) + 4} y={y + ROW_H / 2 + 4}
                  fontSize={9} fill={isRamadan || isDhulHijj ? 'var(--bg)' : 'var(--ink-dim)'}>
                  {hMonth}
                </text>
              </g>
            );
          })}

          {/* "11 days earlier" annotation arrow on Ramadan */}
          {hYear > 1440 && (() => {
            const thisRamadan = bars.find((b) => b.hMonth === 9);
            if (!thisRamadan) return null;
            const x = LABEL_W + (thisRamadan.startDay / 365) * YEAR_W;
            return (
              <text x={Math.max(LABEL_W + 4, x)} y={HEADER_H + 8 * (ROW_H + GAP) - 6}
                fontSize={8} fill="var(--chart-1)" opacity={0.7}>
                {lang === 'ar' ? '← 11 يومًا أبكر كل سنة' : '← ~11 days earlier each year'}
              </text>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--ink-dim)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--chart-1)', display: 'inline-block' }} />
          {lang === 'ar' ? 'رمضان' : 'Ramadan'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--gold)', display: 'inline-block' }} />
          {lang === 'ar' ? 'ذو الحجة' : 'Dhu al-Hijjah'}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/hijri-calendar/
git commit -m "feat(t2-5): HijriCalendar — 12 Hijri months as Gregorian bars, Ramadan/DhulHijja highlighted, year slider 1440-1460"
```

---

### Task T2-6: Polar Anomaly Map (`polar-anomaly`)

**Files:**
- Create: `src/viz/polar-anomaly/PolarAnomaly.tsx`
- Create: `src/viz/polar-anomaly/content.en.json`
- Create: `src/viz/polar-anomaly/content.ar.json`

**What it does:** NaturalEarth1 world map where each of the 97 cities is a colored dot indicating peak Ramadan fasting severity. Click a city for a detail panel.

- [ ] **Step 1: Create content JSON files**

```json
// src/viz/polar-anomaly/content.en.json
{
  "title": "Polar Fasting Anomaly",
  "subtitle": "Peak Ramadan fasting burden across 97 cities — where does 20+ hours happen?",
  "tag": "astronomy",
  "controls": {},
  "explainer": [
    { "type": "p", "text": "Not all Ramadans are equal. While a Muslim in Singapore fasts ~13 hours regardless of when Ramadan falls, a Muslim in Helsinki may face over 20 hours of fasting when Ramadan coincides with summer. This map shows peak fasting hours during Ramadan 1447 AH (estimated Feb–Mar 2026) for all 97 cities in our dataset." },
    { "type": "p", "text": "Red cities face extreme fasting. Teal cities have comfortable fasts under 14 hours. Click any city to see its peak fasting window and the scholarly context. Northern cities in winter Ramadans are actually relatively comfortable — the extreme cases arise when Ramadan falls in northern summer." }
  ],
  "methodology": [
    { "type": "p", "text": "Peak fasting hours = max(Maghrib - Fajr) across all days of Ramadan 1447 AH. Fajr angle 18.5° (Umm al-Qura). Severity: < 14h = comfortable, 14-17h = moderate, 17-20h = severe, > 20h = extreme. Cities where Fajr is undefined (polar twilight) are also marked extreme." }
  ]
}
```

```json
// src/viz/polar-anomaly/content.ar.json
{
  "title": "خريطة الشذوذ القطبي في الصيام",
  "subtitle": "أقصى ساعات الصيام في رمضان عبر 97 مدينة — أين يتجاوز 20 ساعة؟",
  "tag": "astronomy",
  "controls": {},
  "explainer": [
    { "type": "p", "text": "ليست كل رمضانات متساوية. بينما يصوم مسلم سنغافورة ~13 ساعة بصرف النظر عن موعد رمضان، قد يواجه مسلم هلسنكي أكثر من 20 ساعة حين يتزامن رمضان مع الصيف. تُظهر هذه الخريطة أقصى ساعات الصيام خلال رمضان 1447 هـ (تقديرًا: فبراير–مارس 2026) لـ 97 مدينة." },
    { "type": "p", "text": "المدن الحمراء تواجه صيامًا شديدًا، والفيروزية صيامًا مريحًا أقل من 14 ساعة. انقر أي مدينة لرؤية نافذة الصيام القصوى." }
  ],
  "methodology": [
    { "type": "p", "text": "أقصى ساعات صيام = max(المغرب - الفجر) عبر أيام رمضان 1447 هـ. زاوية الفجر 18.5°. الشدة: < 14h مريح، 14-17h معتدل، 17-20h شديد، > 20h قصوى." }
  ]
}
```

- [ ] **Step 2: Create `src/viz/polar-anomaly/PolarAnomaly.tsx`**

```tsx
// src/viz/polar-anomaly/PolarAnomaly.tsx
import { useEffect, useMemo, useState } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import { CITIES, type City } from '../../data/cities';
import { sunriseSunset, fajrTime, hoursToHHMM } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { ramadanStart } from '../../lib/hijri';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

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
  // Ramadan 1447 AH
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
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((world) => setLand(feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>))
      .catch(() => {});
  }, []);

  const projection = useMemo(() => geoNaturalEarth1().scale(140).translate([W / 2, H / 2]), []);
  const pathGen    = useMemo(() => geoPath(projection), [projection]);

  const cityData = useMemo(() => CITIES.map((city) => {
    const peak = computePeak(city);
    return { city, peak, sev: severity(peak), xy: projection([city.lng, city.lat]) };
  }), [projection]);

  const sel = selected !== null ? cityData[selected] : null;
  const fmtH = (h: number) => { const { hh, mm } = hoursToHHMM(h); return `${hh}:${mm}`; };

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
        {(['comfortable','moderate','severe','extreme'] as Severity[]).map((s) => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-dim)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: SEVERITY_COLOR[s], display: 'inline-block' }} />
            {s === 'comfortable' ? '< 14h' : s === 'moderate' ? '14–17h' : s === 'severe' ? '17–20h' : '> 20h'}
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
                : 'Many scholars permit latitude-based adjustment or following Makkah\'s timing when day/night cycles are severely distorted.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/polar-anomaly/
git commit -m "feat(t2-6): PolarAnomaly — world map with severity-colored city dots, click for detail panel"
```

---

### Task T2-7: Solar Analemma (`analemma`)

**Files:**
- Create: `src/viz/analemma/Analemma.tsx`
- Create: `src/viz/analemma/content.en.json`
- Create: `src/viz/analemma/content.ar.json`

**Prerequisite check:** `sunAzimuth` must be exported from `src/lib/solar.ts`. This is added in Plan A Task S0. If not yet available, add this to the end of `src/lib/solar.ts` before implementing this task:

```ts
export function sunAzimuth(loc: Location, d: Date, localHour: number): number {
  const n   = dayOfYear(d);
  const dec = solarDeclination(n) * RAD;
  const phi = loc.lat * RAD;
  const noon = solarNoon(loc, d);
  const ha  = (localHour - noon) * 15 * RAD;
  const sinAlt = Math.sin(dec) * Math.sin(phi) + Math.cos(dec) * Math.cos(phi) * Math.cos(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  if (alt * DEG < -0.833) return NaN;
  const cosAz = (Math.sin(dec) - Math.sin(phi) * sinAlt) / (Math.cos(phi) * Math.cos(alt));
  return Math.acos(Math.max(-1, Math.min(1, cosAz))) * DEG * (Math.sin(ha) > 0 ? 1 : -1);
}
```
(Note: `DEG` and `RAD` are already defined at the top of solar.ts as module-level constants.)

- [ ] **Step 1: Create content JSON files**

```json
// src/viz/analemma/content.en.json
{
  "title": "Solar Analemma",
  "subtitle": "The sun's position at noon every day of the year traces a figure-8 — the equation of time made visible",
  "tag": "astronomy",
  "controls": { "city": "City" },
  "explainer": [
    { "type": "p", "text": "If you photograph the sun at exactly 12:00 local time every day for a year, the dots trace a figure-8 called the analemma. The vertical spread is caused by Earth's axial tilt (changing declination throughout the year). The horizontal spread is caused by the elliptical orbit (equation of time). The crossing point — where the two lobes meet — is where solar noon falls exactly at 12:00." },
    { "type": "p", "text": "This matters for Islamic prayer times because Dhuhr (solar noon) is defined astronomically, not by the clock. The analemma reveals how Dhuhr drifts up to 16 minutes away from 12:00 across the year, explaining why prayer time apps give different Dhuhr times on the same date in different years even in the same city." }
  ],
  "methodology": [
    { "type": "p", "text": "Sun azimuth and altitude are computed at exactly 12:00 local clock time (not solar noon) for each of the 365 days of 2025. The azimuth is measured from south (positive = west, negative = east). Points are colored by season: winter teal, spring green, summer gold, autumn purple. Press Play to animate the sun's path through the year." }
  ]
}
```

```json
// src/viz/analemma/content.ar.json
{
  "title": "الحلقة الشمسية (أنالما)",
  "subtitle": "موضع الشمس عند الظهر كل يوم من أيام السنة يرسم شكل الرقم 8 — معادلة الزمن مرئيةً",
  "tag": "astronomy",
  "controls": { "city": "المدينة" },
  "explainer": [
    { "type": "p", "text": "لو صوّرتَ الشمس في تمام الساعة 12:00 بالتوقيت المحلي كل يوم على مدار سنة، لتشكّلت النقاط رقمًا '8' يُسمى الحلقة الشمسية. الامتداد العمودي ناجم عن ميل محور الأرض، والأفقي عن مدارها الإهليلجي (معادلة الزمن)." },
    { "type": "p", "text": "يهمّ هذا أوقات الصلاة الإسلامية لأن الظهر يُعرَّف فلكيًا لا بالساعة. تكشف الحلقة كيف يتفاوت وقت الظهر بما يصل إلى 16 دقيقة عن الساعة 12:00 خلال السنة." }
  ],
  "methodology": [
    { "type": "p", "text": "يُحسب سمت الشمس وارتفاعها عند الساعة 12:00 بالتوقيت المحلي لكل يوم من أيام 2025. السمت يُقاس من الجنوب (موجب = غرب، سالب = شرق). النقاط ملوّنة حسب الفصل." }
  ]
}
```

- [ ] **Step 2: Create `src/viz/analemma/Analemma.tsx`**

```tsx
// src/viz/analemma/Analemma.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { CITIES } from '../../data/cities';
import { sunAzimuth, sunAltitude } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import { dayToMonth } from '../../lib/chartUtils';
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

  const [cityIdx,  setCityIdx]  = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [dayShown, setDayShown] = useState(365); // how many days revealed
  const [playing,  setPlaying]  = useState(false);
  const animRef = useRef<number>(0);

  const city = CITIES[cityIdx];

  const pts = useMemo<Pt[]>(() => {
    const out: Pt[] = [];
    for (let n = 1; n <= 365; n++) {
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(city.dstType, d) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const az  = sunAzimuth(loc, d, 12.0);
      const alt = sunAltitude(loc, d, 12.0);
      if (isFinite(az) && isFinite(alt) && alt > 0) out.push({ day: n, az, alt });
    }
    return out;
  }, [city]);

  // Animation
  useEffect(() => {
    if (!playing) { cancelAnimationFrame(animRef.current); return; }
    let last = 0;
    const tick = (ts: number) => {
      const dt = last ? (ts - last) / 1000 : 0;
      last = ts;
      setDayShown((d) => {
        const next = d + dt * 60; // 60 days / second
        if (next >= 365) { setPlaying(false); return 365; }
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  const visiblePts = pts.filter((p) => p.day <= dayShown);

  // Compute chart domain
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

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', display: 'block', margin: '0 auto' }}>
        {/* Axis labels */}
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="var(--ink-dim)">
          {lang === 'ar' ? 'السمت من الجنوب (°)' : 'Azimuth from south (°)'}
        </text>
        <text x={8} y={H / 2} textAnchor="middle" fontSize={10} fill="var(--ink-dim)"
          transform={`rotate(-90, 8, ${H / 2})`}>
          {lang === 'ar' ? 'الارتفاع (°)' : 'Altitude (°)'}
        </text>

        {/* Zero azimuth line (S) */}
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
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/analemma/
git commit -m "feat(t2-7): Analemma — figure-8 sun scatter with seasonal colors, animated day-by-day reveal"
```

---

### Task T2-8: Ramadan World (`ramadan-world`)

**Files:**
- Create: `src/viz/ramadan-world/RamadanWorld.tsx`
- Create: `src/viz/ramadan-world/content.en.json`
- Create: `src/viz/ramadan-world/content.ar.json`

**What it does:** World map where each city is colored by how many hours after Makkah Ramadan begins (timezone offset). Shows the global "wave" of Ramadan starting around the world.

- [ ] **Step 1: Create content JSON files**

```json
// src/viz/ramadan-world/content.en.json
{
  "title": "Ramadan Across the World",
  "subtitle": "When does Ramadan begin in each city, relative to Makkah?",
  "tag": "calendar",
  "controls": { "year": "Hijri year" },
  "explainer": [
    { "type": "p", "text": "When the crescent moon is sighted over Makkah and Ramadan begins, it is not the same local time everywhere. A Muslim in Samoa starts Ramadan nearly 14 hours after a Muslim in Makkah — by the time the first prayer of Ramadan begins in the Pacific, Muslims in Arabia may already have completed their first day of fasting." },
    { "type": "p", "text": "This visualization shows each city's local midnight of Ramadan 1 — the moment their clock reads midnight on the first day of Ramadan. Colors indicate hours after Makkah's Ramadan begins. Hover over any city to see its exact Ramadan 1 date and suhoor/iftar times." }
  ],
  "methodology": [
    { "type": "p", "text": "Ramadan 1 date is computed for each Hijri year using the Umm al-Qura calendar. Each city's Ramadan 1 local midnight = Ramadan 1 UTC + city.tz hours. Time offset from Makkah (UTC+3) = city.tz - 3 hours. Suhoor = Fajr on Ramadan 1; Iftar = Maghrib on Ramadan 1. Hover tooltip shows local times." }
  ]
}
```

```json
// src/viz/ramadan-world/content.ar.json
{
  "title": "رمضان حول العالم",
  "subtitle": "متى يبدأ رمضان في كل مدينة بالنسبة لمكة المكرمة؟",
  "tag": "calendar",
  "controls": { "year": "السنة الهجرية" },
  "explainer": [
    { "type": "p", "text": "حين يُرى هلال رمضان فوق مكة المكرمة ويبدأ الشهر، لا يكون التوقيت المحلي واحدًا في كل مكان. مسلم ساموا يبدأ رمضان بعد نحو 14 ساعة من مسلم مكة — بحلول أول أذان في المحيط الهادئ ربما يكون المسلمون في الجزيرة العربية قد أتموا صيامهم الأول." },
    { "type": "p", "text": "يُظهر هذا التصوير منتصف ليل كل مدينة في أول رمضان. الألوان تُشير إلى عدد الساعات بعد بداية رمضان في مكة. مرّر الفأرة فوق أي مدينة لرؤية تاريخ أول رمضان وأوقات السحور والإفطار." }
  ],
  "methodology": [
    { "type": "p", "text": "يُحسب تاريخ أول رمضان باستخدام تقويم أم القرى. منتصف ليل كل مدينة = UTC أول رمضان + ساعات المنطقة الزمنية. الفارق عن مكة (UTC+3) = city.tz - 3 ساعة." }
  ]
}
```

- [ ] **Step 2: Create `src/viz/ramadan-world/RamadanWorld.tsx`**

```tsx
// src/viz/ramadan-world/RamadanWorld.tsx
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
  // -11 to +9 range; group into 4 buckets
  if (hoursAfterMakkah < -1) return '#6d28d9'; // before Makkah (west of Makkah)
  if (hoursAfterMakkah < 3)  return '#4adecc'; // same day ± 3 hrs
  if (hoursAfterMakkah < 8)  return '#d4b483'; // 3-8 hrs after
  return '#f97316';                              // 8+ hrs after (east Asia, Pacific)
}

export default function RamadanWorld() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [hYear, setHYear]   = useState(1446);
  const [land, setLand]     = useState<FeatureCollection<Geometry> | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((world) => setLand(feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>))
      .catch(() => {});
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

      // Suhoor and Iftar on Ramadan 1
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
            <div style={{ color: 'var(--chart-1)' }}>Suhoor: {hoveredCity.suhoor}</div>
            <div style={{ color: 'var(--chart-2)' }}>Iftar: {hoveredCity.iftar}</div>
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
```

- [ ] **Step 3: Run tests and commit**

```bash
npx vitest run --reporter verbose
git add src/viz/ramadan-world/
git commit -m "feat(t2-8): RamadanWorld — world map colored by timezone offset from Makkah, hover suhoor/iftar times"
```

---

### Task FINAL: Route Registration

**Files:**
- Modify: `src/data/visualizations.ts`

**Prerequisites:** ALL previous tasks (Plans A, B, C) must be complete. This task touches the central routing file and must be done last.

- [ ] **Step 1: Read the current file**

```bash
cat src/data/visualizations.ts
```

- [ ] **Step 2: Replace `src/data/visualizations.ts` with the full updated version**

```ts
// src/data/visualizations.ts
import type { ComponentType } from 'react';
import FajrGlobe    from '../viz/fajr-globe/FajrGlobe';
import FastingHours from '../viz/fasting-hours/FastingHours';
import HijriDrift   from '../viz/hijri-drift/HijriDrift';
import SunPathAsr   from '../viz/sun-path-asr/SunPathAsr';
import QiblaGC      from '../viz/qibla-great-circle/QiblaGC';
import PrayerDay    from '../viz/prayer-day/PrayerDay';
import QiblaGlobe   from '../viz/qibla-globe/QiblaGlobe';
import FastingHeatmap from '../viz/fasting-heatmap/FastingHeatmap';
import AsrShadow    from '../viz/asr-shadow/AsrShadow';
import HijriCalendar from '../viz/hijri-calendar/HijriCalendar';
import PolarAnomaly from '../viz/polar-anomaly/PolarAnomaly';
import Analemma     from '../viz/analemma/Analemma';
import RamadanWorld from '../viz/ramadan-world/RamadanWorld';

export type VizSlug =
  | 'fajr-globe'
  | 'fasting-hours'
  | 'hijri-drift'
  | 'sun-path-asr'
  | 'qibla-great-circle'
  | 'prayer-day'
  | 'qibla-globe'
  | 'fasting-heatmap'
  | 'asr-shadow'
  | 'hijri-calendar'
  | 'polar-anomaly'
  | 'analemma'
  | 'ramadan-world';

export type VizConfig = {
  slug: VizSlug;
  tag: string;
  Chart: ComponentType;
};

export const VISUALIZATIONS: Record<VizSlug, VizConfig> = {
  'fajr-globe':        { slug: 'fajr-globe',        tag: 'astronomy', Chart: FajrGlobe    },
  'fasting-hours':     { slug: 'fasting-hours',     tag: 'astronomy', Chart: FastingHours },
  'hijri-drift':       { slug: 'hijri-drift',       tag: 'calendar',  Chart: HijriDrift   },
  'sun-path-asr':      { slug: 'sun-path-asr',      tag: 'fiqh',      Chart: SunPathAsr   },
  'qibla-great-circle':{ slug: 'qibla-great-circle',tag: 'geometry',  Chart: QiblaGC      },
  'prayer-day':        { slug: 'prayer-day',        tag: 'astronomy', Chart: PrayerDay    },
  'qibla-globe':       { slug: 'qibla-globe',       tag: 'geometry',  Chart: QiblaGlobe   },
  'fasting-heatmap':   { slug: 'fasting-heatmap',   tag: 'astronomy', Chart: FastingHeatmap },
  'asr-shadow':        { slug: 'asr-shadow',        tag: 'fiqh',      Chart: AsrShadow    },
  'hijri-calendar':    { slug: 'hijri-calendar',    tag: 'calendar',  Chart: HijriCalendar },
  'polar-anomaly':     { slug: 'polar-anomaly',     tag: 'astronomy', Chart: PolarAnomaly },
  'analemma':          { slug: 'analemma',          tag: 'astronomy', Chart: Analemma     },
  'ramadan-world':     { slug: 'ramadan-world',     tag: 'calendar',  Chart: RamadanWorld },
};

export const VIZ_ORDER: VizSlug[] = [
  'fajr-globe',
  'fasting-hours',
  'hijri-drift',
  'sun-path-asr',
  'qibla-great-circle',
  'prayer-day',
  'qibla-globe',
  'fasting-heatmap',
  'asr-shadow',
  'hijri-calendar',
  'polar-anomaly',
  'analemma',
  'ramadan-world',
];
```

- [ ] **Step 3: Run full test suite and build**

```bash
npx vitest run --reporter verbose
npm run build
```

Expected: all tests pass, build succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/data/visualizations.ts
git commit -m "feat(final): register all 8 new viz routes — prayer-day, qibla-globe, fasting-heatmap, asr-shadow, hijri-calendar, polar-anomaly, analemma, ramadan-world"
```
