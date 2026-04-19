# Islamic Viz Hub — Dark Celestial Visual Revamp

## Goal

Replace the current flat, mediocre visual design with a **Dark Celestial** aesthetic: deep navy-black background, glowing teal + gold accents, glass-morphism cards, atmospheric glow charts, and a light/dark toggle. Every viz chart is also upgraded from default recharts styling to a polished atmospheric glow treatment.

## Architecture

**Approach: CSS Custom Properties + `[data-theme]` class toggle.**

- Two token sets live in `tokens.css`: `:root` = dark (default), `[data-theme="light"]` = light override.
- A single `<html data-theme="light">` attribute flip switches all tokens; no component logic changes for theming.
- A new `src/lib/theme.ts` module handles `initTheme()` (reads localStorage / `prefers-color-scheme` on boot) and `toggleTheme()`.
- A new `src/components/ThemeToggle.tsx` renders the moon/sun button and calls `toggleTheme()`.
- Charts stay on recharts but gain SVG `<defs>` (gradients + `feGaussianBlur` glow filters) injected via recharts' `customized` prop.
- No changes to test files, lib math, i18n, or routing.

---

## Token System

### Dark theme (`:root` — default)

```css
--bg:          #070b14;          /* near-black navy */
--surface:     rgba(255,255,255,0.04);
--surface-h:   rgba(255,255,255,0.07);   /* card hover */
--border:      rgba(255,255,255,0.08);
--border-h:    rgba(77,222,204,0.35);    /* hover border */
--ink:         #f0e8d6;          /* warm parchment white */
--ink-dim:     rgba(240,232,214,0.45);
--accent:      #4adecc;          /* bright teal */
--accent-d:    #0F766E;          /* darker teal */
--gold:        #d4b483;          /* warm gold */
--gold-d:      #a88a52;
--rule:        rgba(255,255,255,0.06);
--chart-1:     #4adecc;          /* Fajr / teal glow */
--chart-2:     #d4b483;          /* Sunrise / gold glow */
--chart-3:     #f97316;          /* Fasting / ember */
--glow-teal:   0 0 24px rgba(77,222,204,0.15);
--glow-gold:   0 0 20px rgba(212,180,131,0.12);
```

### Light theme (`[data-theme="light"]`)

```css
--bg:          #FAF7F0;
--surface:     rgba(0,0,0,0.03);
--surface-h:   rgba(15,118,110,0.06);
--border:      rgba(0,0,0,0.09);
--border-h:    rgba(15,118,110,0.40);
--ink:         #0F172A;
--ink-dim:     #64748b;
--accent:      #0F766E;
--accent-d:    #134E4A;
--gold:        #7C5F1E;
--gold-d:      #5C4415;
--rule:        #E6DFC8;
--chart-1:     #0F766E;
--chart-2:     #7C5F1E;
--chart-3:     #c2410c;
--glow-teal:   0 2px 16px rgba(15,118,110,0.10);
--glow-gold:   0 2px 12px rgba(124,95,30,0.08);
```

---

## File Map

| File | Change |
|------|--------|
| `src/styles/tokens.css` | Full rewrite — dark default + light override |
| `src/styles/global.css` | Update `html { background: var(--bg) }`, dark control styling for `select`/`input` |
| `src/lib/theme.ts` | **New** — `initTheme()`, `toggleTheme()` |
| `src/components/ThemeToggle.tsx` | **New** — moon/sun icon button |
| `src/components/Layout/Header.tsx` | Glass header + ThemeToggle |
| `src/components/Layout/Footer.tsx` | Minimal dark footer |
| `src/components/VizCard.tsx` | Glass card + mini chart SVG preview + hover arrow |
| `src/components/Chip.tsx` | Teal chip styling on dark |
| `src/pages/Home.tsx` | Hero section (eyebrow + large title + radial glow) |
| `src/pages/VizPage.tsx` | Dark page background, better spacing |
| `src/viz/fajr-globe/FajrGlobe.tsx` | Atmospheric glow chart |
| `src/viz/fasting-hours/FastingHours.tsx` | Atmospheric glow chart |
| `src/viz/hijri-drift/HijriDrift.tsx` | Glowing scatter + season bands |
| `src/viz/sun-path-asr/SunPathAsr.tsx` | Sky gradient + gradient-stroke arc |
| `src/viz/qibla-great-circle/QiblaGC.tsx` | Dark ocean map + glowing arc |
| `src/main.tsx` | Call `initTheme()` before React mounts |

---

## Component Designs

### `src/lib/theme.ts`

```ts
export type Theme = 'dark' | 'light';

export function initTheme(): void {
  const stored = localStorage.getItem('theme') as Theme | null;
  const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const theme = stored ?? preferred;
  if (theme === 'light') document.documentElement.dataset.theme = 'light';
}

export function toggleTheme(): void {
  const isLight = document.documentElement.dataset.theme === 'light';
  if (isLight) {
    delete document.documentElement.dataset.theme;
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.dataset.theme = 'light';
    localStorage.setItem('theme', 'light');
  }
}

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}
```

### `src/components/ThemeToggle.tsx`

Button with moon icon (dark mode) / sun icon (light mode). Reads current theme from `document.documentElement.dataset.theme` via a `useState` + `useEffect`. Calls `toggleTheme()` on click.

```tsx
// Moon SVG for dark mode, Sun SVG for light mode
// Tailwind classes: rounded-full border border-[var(--border)] bg-[var(--surface)]
// hover: border-[var(--border-h)] shadow-[var(--glow-teal)]
// size: w-8 h-8
```

### `src/components/Layout/Header.tsx`

```
sticky top-0 z-50
background: rgba(7,11,20,0.75) [dark] / rgba(250,247,240,0.82) [light]
backdrop-filter: blur(20px)
border-bottom: 1px solid var(--border)
height: 58px, flex, items-center, justify-between
padding: 0 2rem

Left:  site name — Georgia serif, var(--gold), 1.05rem, letter-spacing .04em
Right: "About" nav link (ink-dim, .78rem) | LangToggle | ThemeToggle
```

### `src/components/Layout/Footer.tsx`

```
border-top: 1px solid var(--rule)
padding: 1.25rem 2rem
flex items-center justify-between
font-size: .75rem, color: var(--ink-dim)

Left:  small teal dot + "Built with open solar & Hijri math"
Right: © 2026
```

### `src/components/VizCard.tsx`

```
background: var(--surface)
border: 1px solid var(--border)
border-radius: 16px
padding: 24px
transition: background, border-color, box-shadow, transform

hover:
  background: var(--surface-h)
  border-color: var(--border-h)
  box-shadow: var(--glow-teal)
  transform: translateY(-2px)
  radial shimmer overlay (position:absolute, opacity 0→1)

Contents:
  <Chip> tag (teal)
  <h3> card-title (Georgia serif, 1.25rem, var(--ink))
  <p>  card-sub  (.82rem, var(--ink-dim))
  <MiniChart /> — 52px tall SVG preview (unique per viz slug, drawn inline)
  Arrow "→" — position:absolute bottom-right, opacity 0→1 on hover, color var(--accent)
```

**Mini chart previews per slug:**
- `fajr-globe`: teal area curve + gold area curve (two-series area)
- `fasting-hours`: single gold/amber area curve (sine-like arc, peak in summer)
- `hijri-drift`: diagonal teal+gold scatter dots
- `sun-path-asr`: gradient-stroke arc (predawn→orange→gold→sunset), teal Asr marker
- `qibla-great-circle`: dark world outline + glowing teal arc + gold destination dot

### `src/pages/Home.tsx`

Hero section added above the card grid:

```tsx
<section className="hero">
  {/* radial teal glow via ::before pseudo or inline div */}
  <p className="eyebrow">Five windows into Islamic science</p>
  <h1>Islamic <span className="gold">Viz</span> Hub</h1>
  <p className="subtitle">Interactive visualizations of prayer times, fasting,
     the Hijri calendar, the sun's arc, and the path to Makkah.</p>
</section>
```

The eyebrow is `var(--accent)`, 0.68rem, letter-spacing .2em, uppercase.
The h1 is Georgia serif, `clamp(2.2rem, 5vw, 3.6rem)`, `var(--ink)`.
"Viz" (or Arabic equivalent) is wrapped in `<em>` colored `var(--gold)`.
Subtitle is 1rem, `var(--ink-dim)`, max-width 480px centered.

### `src/pages/VizPage.tsx`

No structural change — inherit dark bg from body. Add `pt-8 pb-16` padding. The chart title uses Georgia serif + `var(--ink)`.

---

## Chart Upgrades

### Shared: `ChartTooltip` component

A reusable custom tooltip for all recharts charts:

```tsx
// src/components/ChartTooltip.tsx
// Renders a glass panel using CSS variables (auto-switches with theme):
//   background: var(--bg) at 92% opacity via inline style
//   border: 1px solid var(--border-h)
//   border-radius: 10px
//   padding: 10px 14px
//   box-shadow: var(--glow-teal)
// Props: label (string), rows: Array<{ name: string; value: string; color: string }>
// Recharts passes active: boolean, payload: [], label — wrap with early-return if !active
```

### Shared: SVG `<defs>` injected via recharts `customized`

A `<GlowDefs />` component rendered as `<Customized component={GlowDefs}>` inside each recharts chart. Contains:

```svg
<defs>
  <!-- Gradient for chart-1 (teal) fill -->
  <linearGradient id="grad-chart1" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="var(--chart-1)" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="var(--chart-1)" stop-opacity="0"/>
  </linearGradient>
  <!-- Gradient for chart-2 (gold) fill -->
  <linearGradient id="grad-chart2" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="var(--chart-2)" stop-opacity="0.25"/>
    <stop offset="100%" stop-color="var(--chart-2)" stop-opacity="0"/>
  </linearGradient>
  <!-- Glow filter -->
  <filter id="glow">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
```

### Shared: X-axis month formatter

```ts
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dayToMonth(day: number): string {
  const d = new Date(Date.UTC(2025, 0, day));
  return MONTH_LABELS[d.getUTCMonth()];
}
// Use ticks={[1,32,60,91,121,152,182,213,244,274,305,335]} on XAxis
// tickFormatter={dayToMonth}
```

### FajrGlobe (`fajr-globe/FajrGlobe.tsx`)

- Keep recharts `AreaChart`.
- `<Area dataKey="fajr">`: `stroke="var(--chart-1)"` with `filter="url(#glow)"`, `fill="url(#grad-chart1)"`, `strokeWidth={2}`.
- `<Area dataKey="sunrise">`: `stroke="var(--chart-2)"` with `filter="url(#glow)"`, `fill="url(#grad-chart2)"`, `strokeWidth={1.5}`.
- `<XAxis>` tick: month name formatter, ticks at month boundaries.
- `<YAxis>` tick: existing `hoursToHHMM` formatter.
- `<CartesianGrid>` stroke: `var(--rule)`.
- `<Tooltip>` content: `<ChartTooltip>` component.
- `<GlowDefs />` via `<Customized>`.

### FastingHours (`fasting-hours/FastingHours.tsx`)

- Single `<Area dataKey="hours">`: `stroke="var(--chart-1)"` + glow, `fill="url(#grad-chart1)"`.
- `<ReferenceArea>` bands for the four seasons (subtle background fills, each a slightly different dark tint):
  - Winter: day 1–79, fill `rgba(30,60,100,0.08)`
  - Spring: day 80–171, fill `rgba(30,100,60,0.08)`
  - Summer: day 172–265, fill `rgba(100,60,10,0.08)`
  - Autumn: day 266–355, fill `rgba(60,30,80,0.08)`
- X-axis: month names.
- Tooltip: `<ChartTooltip>` with hours formatted to one decimal.

### HijriDrift (`hijri-drift/HijriDrift.tsx`)

- Keep recharts `ScatterChart`.
- `<GlowDefs />` adds a `<filter id="dot-glow">` with `feGaussianBlur stdDeviation="2"`.
- `<Scatter>` uses a custom `shape` prop that renders a `<circle>` with `filter="url(#dot-glow)"`.
- Color by season: dots where `dayOfYear ≤ 182` (Ramadan falls Jan–Jun) → `var(--chart-1)` teal; dots where `dayOfYear > 182` (Jul–Dec) → `var(--chart-2)` gold. This is meaningful — it shows which half of the Gregorian year Ramadan occupies in each Hijri cycle.
- `<ReferenceArea>` season bands on Y axis (same four-season coloring).
- X-axis: Gregorian year (already correct). Y-axis: season labels (already correct).

### SunPathAsr (`sun-path-asr/SunPathAsr.tsx`)

Pure SVG — full atmospheric upgrade:

1. **Sky background**: `<defs>` add `<linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">`. Top = `#04080f`, bottom (horizon) = `#0a1628`. Applied to a `<rect>` filling the chart area.

2. **Sun arc**: Instead of a single stroke color, the path gets a gradient stroke via:
   ```svg
   <linearGradient id="sun-stroke" x1="0" y1="0" x2="1" y2="0">
     <stop offset="0%"   stop-color="#1e3a5f"/>  <!-- predawn -->
     <stop offset="25%"  stop-color="#f97316"/>  <!-- Fajr orange -->
     <stop offset="50%"  stop-color="#fbbf24"/>  <!-- solar noon gold -->
     <stop offset="75%"  stop-color="#f97316"/>  <!-- Asr/dusk -->
     <stop offset="100%" stop-color="#1e3a5f"/>  <!-- night -->
   </linearGradient>
   ```
   The `<path>` uses `stroke="url(#sun-stroke)"` + `filter="url(#glow)"`.

3. **Asr markers**: Existing `<line>` elements get `stroke="var(--chart-1)"` + `filter="url(#glow)"`.

4. **Ground line**: `stroke="rgba(255,255,255,0.1)"`.

5. **Text labels**: all `fill="var(--ink-dim)"` for light compat.

### QiblaGC (`qibla-great-circle/QiblaGC.tsx`)

SVG map upgrade:

- **Background**: `<rect fill="var(--bg)">` replacing inline `background: 'var(--surface)'`.
- **Graticule**: stroke `rgba(255,255,255,0.04)`, strokeWidth 0.4.
- **Land**: fill `rgba(255,255,255,0.06)`, stroke `rgba(255,255,255,0.1)`, strokeWidth 0.6.
- **Great-circle arc**: `stroke="var(--chart-1)"`, strokeWidth 2.5, `filter="url(#glow)"`.
- **City dot**: `fill="var(--chart-2)"`, r=5, `filter="url(#glow)"`.
- **Makkah dot**: `fill="var(--chart-1)"`, r=6, `filter="url(#glow)"`.
- **Makkah label**: `fill="var(--chart-1)"`, fontSize 12.
- SVG `<defs>` added inline (same glow filter pattern).

---

## Control Styling

All `<select>` and `<input type="date">` elements across all viz components get updated classes:

```
bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)]
rounded-lg px-2 py-1
focus:border-[var(--border-h)] focus:outline-none
transition-colors
```

(These already use these approximate classes; the upgrade ensures `var(--surface)` resolves to the dark background instead of white.)

---

## Theme Init in `main.tsx`

```tsx
import { initTheme } from './lib/theme';
initTheme(); // runs before React mounts — no flash of wrong theme

ReactDOM.createRoot(document.getElementById('root')!).render(...)
```

---

## `.gitignore` addition

`.superpowers/` must be added to `.gitignore` (brainstorm session files should not be committed).

---

## Out of Scope

- Arabic-Indic numerals (v2)
- Animations / transitions on chart data entry (v2)
- 3D globe for Fajr (v2)
- Elevation / ihtiyat corrections to solar math (v2)
- Code-splitting / bundle size optimization (v2)

---

## Success Criteria

- `https://islamicviz.analyticadss.com` renders dark by default; 🌙/☀️ toggle switches to light and back with no flash.
- All 5 viz charts show glowing teal/gold lines on dark, clean teal/gold on light.
- VizCards show mini chart previews and teal border glow on hover.
- `npm run build` exits 0, `npm test` passes.
- No TypeScript errors.
