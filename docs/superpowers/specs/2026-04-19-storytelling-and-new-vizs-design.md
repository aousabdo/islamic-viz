# Islamic Viz Hub — Storytelling Upgrades + New Visualizations Design

## Goal

Two parallel tracks:
1. **Track 1 — Storytelling upgrades**: Add chart annotations (solstice/equinox/Ramadan markers), dynamic insight callouts, and city-comparison overlays to all 5 existing visualizations.
2. **Track 2 — New visualizations**: Build 8 new Islamic science visualizations using the existing math library.

## Architecture

### Shared new infrastructure

**`src/lib/constants.ts`** — Astronomical and calendar constants:
```ts
export const WINTER_SOLSTICE_DAY = 355;   // ~Dec 21
export const SUMMER_SOLSTICE_DAY = 172;   // ~Jun 21
export const SPRING_EQUINOX_DAY  = 80;    // ~Mar 21
export const AUTUMN_EQUINOX_DAY  = 266;   // ~Sep 23
// Ramadan 1446 (2025): Mar 1 – Mar 29
export const RAMADAN_2025_START  = 60;    // day-of-year
export const RAMADAN_2025_END    = 88;
```

**`src/components/StoryCallout.tsx`** — Glass insight box, reused by all vizs:
```tsx
type StoryCalloutProps = { icon?: string; text: string; warning?: boolean };
// Renders: teal glow panel with ✦ icon, dynamic text, optional ⚠️ warning styling
```

**`src/lib/insights.ts`** — Computes per-viz insight strings:
```ts
export function fajrInsight(city: City, data: FajrPoint[], lang: Lang): string
export function fastingInsight(city: City, data: FastingPoint[], lang: Lang): string
export function hijriInsight(pts: HijriPt[], lang: Lang): string
export function sunPathInsight(city: City, date: Date, asrShafii: number, asrHanafi: number, lang: Lang): string
export function qiblaInsight(city: City, bearing: number, lang: Lang): string
```

---

## Track 1: Storytelling Upgrades

### T1-A: Fajr Globe upgrades

**File:** `src/viz/fajr-globe/FajrGlobe.tsx`

Changes:
- Import `WINTER_SOLSTICE_DAY`, `SUMMER_SOLSTICE_DAY`, `SPRING_EQUINOX_DAY`, `AUTUMN_EQUINOX_DAY`, `RAMADAN_2025_START`, `RAMADAN_2025_END` from `../../lib/constants`
- Import `StoryCallout` from `../../components/StoryCallout`
- Import `fajrInsight` from `../../lib/insights`
- Add second city state: `const [city2Idx, setCity2Idx] = useState<number | null>(null)`
- Compute `data2` via useMemo when `city2Idx !== null`
- Inside `<AreaChart>`:
  - `<ReferenceArea x1={RAMADAN_2025_START} x2={RAMADAN_2025_END} fill="rgba(212,180,131,0.07)" stroke="none" label={{ value: "Ramadan ʼ25", fill: "var(--gold)", fontSize: 9, position: "insideTop" }} />`
  - `<ReferenceLine x={WINTER_SOLSTICE_DAY} stroke="var(--gold)" strokeDasharray="2 4" strokeOpacity={0.5} label={{ value: "❄", position: "insideTopLeft", fill: "var(--gold)", fontSize: 11 }} />`
  - `<ReferenceLine x={SUMMER_SOLSTICE_DAY} stroke="var(--chart-3)" strokeDasharray="2 4" strokeOpacity={0.5} label={{ value: "☀", position: "insideTopLeft", fill: "var(--chart-3)", fontSize: 11 }} />`
  - `<ReferenceLine x={SPRING_EQUINOX_DAY} stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.35} />`
  - `<ReferenceLine x={AUTUMN_EQUINOX_DAY} stroke="var(--ink-dim)" strokeDasharray="1 5" strokeOpacity={0.35} />`
  - Second city Area lines if `data2` exists: `fill="url(#grad-chart2)"`, `stroke="var(--chart-2)"`, `dot={false}`, `activeDot={{ r: 3, fill: 'var(--chart-2)' }}`
- Add compare city selector control: a `<select>` with "None" + all CITIES options, renders `data2` Area lines when set
- Add `<StoryCallout text={fajrInsight(city, data, city2 ?? null, lang)} />` below the chart

**`fajrInsight` logic:**
- Find peak gap (max of `sunrise - fajr`) and the day it occurs
- Find min gap
- If `city2` provided, compare peak gaps
- Format: "In [city], the Fajr–Sunrise gap peaks at [Xh Ym] on [month] — [Nx] wider than in [summer month]."
- If polar city (has NaN fajr days): "⚠️ [City] has [N] days with no defined Fajr — twilight never ends near the summer solstice."

### T1-B: Fasting Hours upgrades

**File:** `src/viz/fasting-hours/FastingHours.tsx`

Changes:
- Same annotation imports + StoryCallout + fasting insight
- Second city compare (same pattern as FajrGlobe)
- Add polar anomaly band: `<ReferenceArea y1={20} y2={24} fill="rgba(249,115,22,0.07)" stroke="none" />` with label "Extreme zone"
- Add world-record reference line: `<ReferenceLine y={22.3} stroke="var(--chart-3)" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: "Reykjavik peak", fill: "var(--chart-3)", fontSize: 9 }} />`

**`fastingInsight` logic:**
- Max and min fasting hours, day of year for each
- If max > 20: "⚠️ [City] peaks at [X.Y] fasting hours in [month] — traditional scholars permit latitude-based adjustments."
- If city is equatorial (lat < 15): "[City] is near the equator — fasting hours vary by only [X] minutes year-round."
- Two-city: "Compared to [city2], [city1] fasts [X hrs] longer/shorter at peak."

### T1-C: Hijri Drift upgrades

**File:** `src/viz/hijri-drift/HijriDrift.tsx`

Changes:
- Year labels on every 5th data point: use recharts `<LabelList dataKey="hYear" content={...} />` or custom dot shape that adds `<text>` every 5 years
- Add 33-year cycle annotation: a curved SVG arrow or note "← 33-yr cycle" near the bottom of the chart
- Add `<StoryCallout text={hijriInsight(data, lang)} />` below

**`hijriInsight` logic:**
- Find which Hijri year is nearest the current Gregorian year
- Compute which Gregorian season that Ramadan falls in
- "Ramadan [H-year] ([G-year]) falls in [season]. It returns to [same season] in [33 - offset] years (~[year])."

### T1-D: Sun Path Asr upgrades

**File:** `src/viz/sun-path-asr/SunPathAsr.tsx`

Changes:
- Display shadow ratio box: a small SVG inset showing the pole and shadow length ratio for each Asr madhab. Position: top-right corner of main SVG.
- Add peak altitude label at the top of the arc: a `<text>` element at noon position showing "Altitude: [X.X]°"
- Add `<StoryCallout text={sunPathInsight(...)} />` below the SVG

**`sunPathInsight` logic:**
- Compute difference in minutes between Shafi'i and Hanafi Asr
- "The Hanafi Asr is [N min] later than Shafi'i today in [city]. The difference grows with latitude: at the equator it's ~30 min, at London in winter it exceeds 2 hours."

### T1-E: Qibla GC upgrades

**File:** `src/viz/qibla-great-circle/QiblaGC.tsx`

Changes:
- Multi-city mode: replace single `cityIdx` with `selectedCities: number[]` (up to 5), each shown as its own glowing arc in a different color cycling through `--chart-1`, `--chart-2`, `--chart-3`, `--accent`, `--gold`
- Compass rose SVG: a small 40×40px compass drawn in the bottom-right of the map using `<path>` elements. N/S/E/W labels, teal needle pointing north.
- Great-circle distance label: compute haversine distance to Makkah, show in km and miles in the bearing display bar
- Add `<StoryCallout text={qiblaInsight(city, bearing, lang)} />` below

**`qiblaInsight` logic:**
- Compute haversine distance to Makkah
- Note if bearing differs significantly from "simple east" direction
- "From [city], Makkah lies [bearing]° ([NE/ENE/etc]) — [distance] km away. On a flat map this looks [direction], but the great-circle route bends [north/south] because the Earth is a sphere."

---

## Track 2: New Visualizations

### T2-1: Full Prayer Day (`prayer-day`)

**Files:**
- `src/viz/prayer-day/PrayerDay.tsx`
- `src/viz/prayer-day/content.en.json`
- `src/viz/prayer-day/content.ar.json`

**Tag:** astronomy

**Data shape:** Day 1–365 → `{ day, fajr, sunrise, dhuhr, asr, maghrib, isha }` (all in clock hours)

**Computation:**
```ts
const fajr    = fajrTime(loc, d, method.fajrAngle);
const sunrise = sunriseSunset(loc, d).sunrise;
const dhuhr   = solarNoon(loc, d);
const asr     = asrTime(loc, d, 1);     // Shafi'i
const maghrib = sunriseSunset(loc, d).sunset;
const isha    = ishaTime(loc, d, method.ishaAngle ?? 17);
```

**Chart:** `AreaChart` with 7 series:
- Night pre-Fajr: grey fill from 0 to fajr
- Fajr → Sunrise: deep teal (`#1e3a5f` → `var(--chart-1)`)
- Day: soft gold fill from sunrise to maghrib
- Maghrib → Isha: orange glow
- Night post-Isha: grey
- Prayer markers: thin `ReferenceLine` at each of the 5 prayer times with labels

Actually, simpler approach: `AreaChart` with the 5 prayer times as area boundaries. Use ReferenceArea between each pair:
- `[0, fajr]` → dark night fill `rgba(10,20,40,0.6)`
- `[fajr, sunrise]` → predawn teal `rgba(74,222,204,0.15)`
- `[sunrise, dhuhr]` → morning gold `rgba(212,180,131,0.1)`
- `[dhuhr, asr]` → midday gold `rgba(212,180,131,0.15)`
- `[asr, maghrib]` → afternoon orange `rgba(249,115,22,0.1)`
- `[maghrib, isha]` → dusk `rgba(30,30,80,0.3)`
- `[isha, 24]` → night `rgba(10,20,40,0.6)`

Use 5 `<Area>` lines (one per prayer time) with different `stroke` colors, `dot={false}`, `fill="none"`.

**Colors:**
- Fajr: `var(--chart-1)` (teal)
- Dhuhr: `var(--gold)` (gold)
- Asr: `var(--chart-3)` (orange) — or a warm amber
- Maghrib: `#e07040` (sunset orange)
- Isha: `#8b7ec8` (twilight purple — add as `--chart-4: #8b7ec8` token in dark, `#5b4e9e` in light)

**Controls:** city selector + calculation method selector

**GlowDefs + ChartTooltip + MONTH_TICKS/dayToMonth + StoryCallout**

### T2-2: Qibla Globe 3D (`qibla-globe`)

**Files:**
- `src/viz/qibla-globe/QiblaGlobe.tsx`
- `src/viz/qibla-globe/content.en.json`
- `src/viz/qibla-globe/content.ar.json`

**Tag:** geometry

**Technique:** d3-geo orthographic projection. Rotation via `useState([lng, -lat, 0])` for `[λ, φ, γ]`. Pointer drag updates rotation.

```ts
const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0]);
const projection = useMemo(
  () => geoOrthographic().scale(H / 2 - 10).translate([W/2, H/2]).rotate(rotation).clipAngle(90),
  [rotation]
);
```

**Drag handling:** `onPointerDown`, `onPointerMove`, `onPointerUp` on the SVG. Delta pointer movement → delta rotation.

**Elements:**
- Ocean sphere: `<path d={pathGen({type:'Sphere'})} fill="var(--bg)" />`
- Graticule: `var(--map-graticule)`
- Land: `var(--map-land)` fill, `var(--rule)` stroke
- City dot: `var(--chart-2)` with `filter="url(#qg-dot-glow)"`, visible only if on front hemisphere
- Makkah dot: larger, `var(--chart-1)` with strong glow
- Great-circle arc: `var(--chart-1)` with glow, drawn only for visible portion

**Arc animation:** When city changes, smoothly rotate so selected city comes into view. Use `useRef<number>` for animation frame ID + `useState` for current rotation. On city change, run a `requestAnimationFrame` loop that linearly interpolates from current rotation to target rotation over ~600ms (no d3-interpolate needed — it is not installed).

**Size:** W=600, H=600 (square)

**Own `<defs>` with `qg3d-` prefixed IDs** (separate from flat QiblaGC's `qg-` IDs).

### T2-3: Fasting Heatmap (`fasting-heatmap`)

**Files:**
- `src/viz/fasting-heatmap/FastingHeatmap.tsx`
- `src/viz/fasting-heatmap/content.en.json`
- `src/viz/fasting-heatmap/content.ar.json`

**Tag:** astronomy

**Cities to show:** 30 cities selected for geographic diversity and extremity, sorted by descending latitude (all from the existing 97-city dataset):
Helsinki (60°N), Oslo (59°N), Stockholm (59°N), Moscow (55°N), London (51°N), Amsterdam (52°N), Berlin (52°N), Paris (48°N), Toronto (43°N), Istanbul (41°N), Rome (41°N), New York (40°N), Madrid (40°N), Tehran (35°N), Kabul (34°N), Jerusalem (31°N), Cairo (30°N), Karachi (24°N), Makkah (21°N), Mumbai (19°N), Bangkok (13°N), Lagos (6°N), Kuala Lumpur (3°N), Nairobi (1°N), Singapore (1°N), Jakarta (6°S), São Paulo (23°S), Cape Town (33°S), Sydney (33°S), Buenos Aires (34°S).

**Data:** For each of the 30 cities, compute average fasting hours for each of 12 months (use the 15th of each month as representative day, Umm al-Qura method, fajr angle 18.5°, fajr to sunset).

**Cell design:** 40px wide × 30px tall. Color scale:
- `< 12 hrs` → `var(--chart-1)` (teal, very short)
- `12–14 hrs` → green-teal interpolation
- `14–16 hrs` → gold
- `16–18 hrs` → orange
- `18–20 hrs` → deep orange
- `> 20 hrs` → red `#ef4444`

Use simple bucket approach (no d3-scale; it is not installed):

**Hover tooltip:** `<title>` SVG element on each cell showing "[City] [Month]: [X.X] hrs"

**Month column headers, city row labels.**

**Width:** ~560px (12 × 40 + label column). Height: ~960px (30 × 30 + header). Make it scrollable in a fixed-height container (400px) with overflow-y auto.

**No external dependencies beyond existing stack.**

### T2-4: Asr Shadow Geometry (`asr-shadow`)

**Files:**
- `src/viz/asr-shadow/AsrShadow.tsx`
- `src/viz/asr-shadow/content.en.json`
- `src/viz/asr-shadow/content.ar.json`

**Tag:** fiqh

**Scene (SVG W=720, H=400):**
- Ground: horizontal line at `y=320`
- Pole: vertical line from `(cx, 320)` to `(cx, 320 - POLE_H)` where `POLE_H = 180px`
- Shadow: horizontal line from `(cx, 320)` to `(cx + shadowPx, 320)` where `shadowPx = POLE_H / tan(altitude_rad)`
- Sun: circle at computed position based on `sunAltitude(loc, date, hour)` and azimuth
- Shafi'i threshold mark: vertical dashed line at `x = cx + shafiiShadowPx`
- Hanafi threshold mark: vertical dashed line at `x = cx + hanafiShadowPx`

**Shadow thresholds:**
```ts
// At solar noon, shadow = noonShadow (always positive)
// noonShadow = POLE_H / tan(altitudeAtNoon)
// Shafi'i Asr: shadow length = POLE_H + noonShadow
// Hanafi Asr:  shadow length = 2×POLE_H + noonShadow
const noonShadowPx = POLE_H / Math.tan(altitudeAtNoon * RAD);
const shafiiShadowPx = POLE_H + noonShadowPx;
const hanafiShadowPx = 2 * POLE_H + noonShadowPx;
```

**Animation:** `useRef<number>` for animation frame. `useState<number>(hour)` for current hour (0–24). Play button runs `requestAnimationFrame` loop advancing hour from sunrise to sunset at ~0.05 hrs/frame (real-time-ish). Pause button stops.

**Display panel (right side, ~200px):**
- Current time: `HH:MM`
- Sun altitude: `XX.X°`
- Shadow ratio: `X.XX × pole`
- Prayer status: "Before Asr" / "Asr window (Shafi'i)" / "Asr window (Hanafi)" / "After Asr"

**Controls:** city selector, date picker, play/pause button

### T2-5: Hijri Calendar Bridge (`hijri-calendar`)

**Files:**
- `src/viz/hijri-calendar/HijriCalendar.tsx`
- `src/viz/hijri-calendar/content.en.json`
- `src/viz/hijri-calendar/content.ar.json`

**Tag:** calendar

**Concept:** Horizontal bar chart where each row = one Hijri month (12 rows). Bar spans from Gregorian start date to end date of that month. X-axis = Gregorian months (Jan–Dec of the displayed year). Year slider: 1440–1460 AH.

**Data computation:** For Hijri year H, iterate months 1–12:
```ts
// For each Hijri month 1-12, find its Gregorian start date
function hijriMonthStart(hYear: number, hMonth: number): Date {
  // Use Intl to find a date in that hijri month, then binary search for day 1
  // Simplified: use the approximation that each hijri month ≈ 29.53 days
  // More accurate: scan dates using gregorianToHijri() until hYear/hMonth/1 found
}
```

**Visual:**
- SVG: W=700, H=420
- Each row: 28px tall, 8px gap
- X-axis: 12 month markers (Jan–Dec) of the Gregorian year
- Bars: rounded rectangles
- Month names: right-to-left Arabic + English left side
- Color coding:
  - Ramadan (month 9): `var(--chart-1)` (teal glow)
  - Dhul Hijja (month 12): `var(--gold)` (gold)
  - Muharram (month 1): subtle teal border
  - Others: `var(--surface-h)`
- Hover: show exact Gregorian date range

**Key insight annotation:** Arrow showing "← 11 days earlier next year" on Ramadan bar.

### T2-6: Polar Anomaly Map (`polar-anomaly`)

**Files:**
- `src/viz/polar-anomaly/PolarAnomaly.tsx`
- `src/viz/polar-anomaly/content.en.json`
- `src/viz/polar-anomaly/content.ar.json`

**Tag:** astronomy

**Computation:** For each of the 97 cities, compute the maximum fasting hours during Ramadan 2026 (Hijri 1447, estimated Feb 17 – Mar 17, 2026). Use 18.5° Fajr angle, Umm al-Qura method.

```ts
type Severity = 'comfortable' | 'moderate' | 'severe' | 'extreme';
function fastingSeverity(maxHours: number): Severity {
  if (maxHours < 14) return 'comfortable';
  if (maxHours < 17) return 'moderate';
  if (maxHours < 20) return 'severe';
  return 'extreme';  // includes NaN (polar anomaly)
}
```

**Severity colors:**
- comfortable: `var(--chart-1)` (teal)
- moderate: `var(--gold)` (gold)
- severe: `var(--chart-3)` (orange)
- extreme: `#ef4444` (red)

**Map:** Same NaturalEarth1 projection as QiblaGC (W=800, H=420). City dots sized r=6, glowing with appropriate color filter. Faint glow using `filter="url(#pa-glow)"` (own prefixed defs).

**Click interaction:** Click a city dot → show info panel (absolute positioned div) with:
- City name
- Peak fasting hours
- Ramadan 2026 window (earliest Fajr to latest Maghrib)
- Severity badge
- Scholarly note if extreme

**Legend:** Bottom-right corner, 4 colored circles with labels.

**Selected city state:** `useState<number | null>(null)` for clicked city index.

### T2-7: Solar Analemma (`analemma`)

**Files:**
- `src/viz/analemma/Analemma.tsx`
- `src/viz/analemma/content.en.json`
- `src/viz/analemma/content.ar.json`

**Tag:** astronomy

**What is it:** The analemma is the figure-8 traced by the sun's position at the same clock time (solar noon local time) every day of the year. X axis = azimuth (degrees E/W of south), Y axis = altitude (degrees above horizon). It's figure-8 shaped because of the combined effect of Earth's axial tilt and elliptical orbit (equation of time).

**Data:** For each of 365 days, compute sun position at local noon (12:00 clock time, not solar noon):
```ts
const azimuth = sunAzimuth(loc, date, 12.0);   // need to add this function
const altitude = sunAltitude(loc, date, 12.0);
```

Note: `sunAzimuth` doesn't currently exist in solar.ts. Need to add:
```ts
export function sunAzimuth(loc: Location, d: Date, localHour: number): number {
  const n = dayOfYear(d);
  const dec = solarDeclination(n) * RAD;
  const phi = loc.lat * RAD;
  const ha = (localHour - solarNoon(loc, d)) * 15 * RAD; // hour angle in radians
  const sinAlt = Math.sin(dec)*Math.sin(phi) + Math.cos(dec)*Math.cos(phi)*Math.cos(ha);
  const alt = Math.asin(sinAlt);
  const cosAz = (Math.sin(dec) - Math.sin(phi)*sinAlt) / (Math.cos(phi)*Math.cos(alt));
  return Math.acos(Math.max(-1, Math.min(1, cosAz))) * DEG * (Math.sin(ha) > 0 ? 1 : -1);
}
```

**Chart:** `ScatterChart` (recharts) or SVG scatter.
- X: azimuth from south (-15° to +15° range typically)
- Y: altitude (0° to 90°, inverted so up = high on screen)
- Each dot colored by season (same SEASON_BANDS colors as HijriDrift)
- Animated: dots reveal day-by-day with a play button
- Current day highlighted with larger dot + date label

**Annotations:** Label the four seasonal extremes (solstices at top/bottom of 8, equinoxes at crossing point).

**Controls:** city selector, play/pause button, date scrubber (slider for day of year)

**Islamic significance callout:** The crossing of the figure-8 is where solar noon = clock noon exactly — April 15 and September 1 approximately. On those days, Dhuhr time is exactly 12:00 local mean time.

### T2-8: Ramadan World (`ramadan-world`)

**Files:**
- `src/viz/ramadan-world/RamadanWorld.tsx`
- `src/viz/ramadan-world/content.en.json`
- `src/viz/ramadan-world/content.ar.json`

**Tag:** calendar

**Concept:** For a selected Hijri year, show Ramadan 1st date for each of 97 cities' timezones. Cities are colored by how many hours into the global Ramadan they start (relative to Makkah). The +14 to -12 hour timezone spread means some cities start Ramadan nearly a full day after Makkah.

**Data:** For selected Hijri year H:
```ts
const ramadanDate = ramadanStart(H);  // UTC midnight of Ramadan 1 per Saudi calculation
// Each city's Ramadan starts when ramadanDate crosses midnight in their local timezone
const cityRamadanLocalMidnight = ramadanDate + (city.tz * 3600000);
// Time offset relative to Makkah (tz=3): city.tz - 3 hours
const hoursAfterMakkah = city.tz - 3;  // -11 to +9 range
```

**Color coding:** City dot color = how many hours after Makkah Ramadan begins there:
- Same day (±0-2 hrs): `var(--chart-1)` teal
- 2-6 hrs after Makkah: gold
- 6-12 hrs after: orange  
- Day before Makkah (negative): deep purple `#6d28d9`

**Map:** Same NaturalEarth1 (W=800, H=420). City dots r=5, colored by timezone offset. Ocean `var(--bg)`, land `var(--map-land)`.

**Hover:** Show city name, Ramadan 1 date in both Gregorian and Hijri, suhoor time (Fajr on Ramadan 1) and iftar time (Maghrib on Ramadan 1).

**Year selector:** Hijri 1445–1455 dropdown.

**Info panel:** Right side (or below), shows the range: "Ramadan 1 [H-year] begins on [earliest date] (Samoa) – [latest date] (Pacific islands)"

**Legend:** Color strip showing hours-after-Makkah scale.

---

## New Routes Registration

**`src/data/visualizations.ts`** — Add 8 new entries:
```ts
'prayer-day': { slug: 'prayer-day', tag: 'astronomy', Chart: PrayerDay },
'qibla-globe': { slug: 'qibla-globe', tag: 'geometry', Chart: QiblaGlobe },
'fasting-heatmap': { slug: 'fasting-heatmap', tag: 'astronomy', Chart: FastingHeatmap },
'asr-shadow': { slug: 'asr-shadow', tag: 'fiqh', Chart: AsrShadow },
'hijri-calendar': { slug: 'hijri-calendar', tag: 'calendar', Chart: HijriCalendar },
'polar-anomaly': { slug: 'polar-anomaly', tag: 'astronomy', Chart: PolarAnomaly },
'analemma': { slug: 'analemma', tag: 'astronomy', Chart: Analemma },
'ramadan-world': { slug: 'ramadan-world', tag: 'calendar', Chart: RamadanWorld },
```

**`VizSlug` type** extended with all 8 new slugs. **`VIZ_ORDER`** extended with all 8.

---

## New CSS Tokens Needed

Add to `src/styles/tokens.css` `:root`:
```css
--chart-4: #8b7ec8;   /* twilight purple — for Isha prayer line */
--chart-5: #e07040;   /* sunset orange — for Maghrib prayer line */
```

Add to `[data-theme="light"]`:
```css
--chart-4: #5b4e9e;
--chart-5: #c05020;
```

Add to `tailwind.config.ts` colors:
```ts
'chart-4': 'var(--chart-4)',
'chart-5': 'var(--chart-5)',
```

---

## Content JSON structure (all new vizs)

Each new viz needs `content.en.json` and `content.ar.json`. Minimum shape:
```json
{
  "title": "English title",
  "subtitle": "One sentence hook",
  "tag": "astronomy|fiqh|calendar|geometry",
  "controls": { "city": "City", "method": "Method" },
  "explainer": [{ "type": "p", "text": "..." }],
  "methodology": [{ "type": "p", "text": "..." }]
}
```

---

## Implementation Decomposition

This project decomposes into **14 independent tasks** (no file conflicts between tasks):

| Task | Files touched | Parallelizable? |
|------|--------------|-----------------|
| S0: Shared infrastructure | constants.ts, StoryCallout.tsx, insights.ts, tokens.css, tailwind.config.ts | First, blocks T1s |
| T1-A: FajrGlobe upgrade | FajrGlobe.tsx | After S0 |
| T1-B: FastingHours upgrade | FastingHours.tsx | After S0 |
| T1-C: HijriDrift upgrade | HijriDrift.tsx | After S0 |
| T1-D: SunPathAsr upgrade | SunPathAsr.tsx | After S0 |
| T1-E: QiblaGC upgrade | QiblaGC.tsx | After S0 |
| T2-1: PrayerDay | prayer-day/* | After S0 |
| T2-2: QiblaGlobe3D | qibla-globe/* | Independent |
| T2-3: FastingHeatmap | fasting-heatmap/* | Independent |
| T2-4: AsrShadow | asr-shadow/* | Independent |
| T2-5: HijriCalendar | hijri-calendar/* | Independent |
| T2-6: PolarAnomaly | polar-anomaly/* | Independent |
| T2-7: Analemma | analemma/* (+ sunAzimuth in solar.ts) | Independent |
| T2-8: RamadanWorld | ramadan-world/* | Independent |
| FINAL: Route registration | visualizations.ts, VizSlug type | After all T2s |

**Execution plan:** Build S0 first → fire T1-A through T2-8 all in parallel (12 agents) → register routes.
