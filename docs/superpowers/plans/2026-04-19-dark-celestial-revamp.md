# Dark Celestial Visual Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat light-theme design with a Dark Celestial aesthetic (deep navy-black, glowing teal + gold, glass-morphism cards) across all pages and upgrade all 5 recharts/SVG charts to an atmospheric glow treatment, with a persistent light/dark toggle.

**Architecture:** CSS custom properties on `:root` (dark default) and `[data-theme="light"]` (light override) drive every color token; a single attribute flip on `<html>` switches the whole app. `initTheme()` runs before React mounts to prevent flash-of-wrong-theme. Charts gain SVG `<defs>` (gradients + glow filters) via a hidden zero-size SVG rendered adjacent to each `<ResponsiveContainer>`.

**Tech Stack:** React 19, Vite, recharts ^3.8, Tailwind CSS v3, d3-geo (QiblaGC), Vitest + jsdom

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/styles/tokens.css` | Rewrite | Dark + light token sets, sky/map vars |
| `tailwind.config.ts` | Modify | Add `gold`, `chart-1` color tokens |
| `src/lib/theme.ts` | Create | `initTheme`, `toggleTheme`, `getTheme` |
| `src/components/ThemeToggle.tsx` | Create | Moon/sun icon button |
| `src/main.tsx` | Modify | Call `initTheme()` before React mounts |
| `src/styles/global.css` | Modify | Dark select/input overrides |
| `src/lib/__tests__/theme.test.ts` | Create | Theme function unit tests |
| `src/components/Layout/Header.tsx` | Modify | Glass header + ThemeToggle |
| `src/components/Layout/Footer.tsx` | Modify | Teal-dot minimal footer |
| `src/lib/chartUtils.ts` | Create | Month tick labels + formatter |
| `src/components/GlowDefs.tsx` | Create | Hidden SVG with chart gradients + filters |
| `src/components/ChartTooltip.tsx` | Create | Glass tooltip for recharts |
| `src/components/Chip.tsx` | Modify | Accent-adaptive chip |
| `src/components/MiniChart.tsx` | Create | Per-slug mini SVG previews |
| `src/components/VizCard.tsx` | Modify | Glass card + hover effects + MiniChart |
| `src/pages/Home.tsx` | Modify | Hero section above card grid |
| `src/pages/VizPage.tsx` | Modify | Dark chart container styling |
| `src/viz/fajr-globe/FajrGlobe.tsx` | Modify | GlowDefs + gradient fills + ChartTooltip + month ticks |
| `src/viz/fasting-hours/FastingHours.tsx` | Modify | Season ReferenceArea bands + glow |
| `src/viz/hijri-drift/HijriDrift.tsx` | Modify | Glowing two-tone scatter + season bands |
| `src/viz/sun-path-asr/SunPathAsr.tsx` | Modify | Sky gradient bg + gradient-stroke arc |
| `src/viz/qibla-great-circle/QiblaGC.tsx` | Modify | Dark ocean + glowing arc + city dots |

---

### Task 1: CSS Token System + Theme Module + ThemeToggle

**Files:**
- Rewrite: `src/styles/tokens.css`
- Modify: `tailwind.config.ts`
- Create: `src/lib/theme.ts`
- Create: `src/components/ThemeToggle.tsx`
- Modify: `src/main.tsx`
- Modify: `src/styles/global.css`
- Create: `src/lib/__tests__/theme.test.ts`

- [ ] **Step 1: Write the failing theme tests**

Create `src/lib/__tests__/theme.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initTheme, toggleTheme, getTheme } from '../theme';

function mockMatchMedia(prefersLight: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: prefersLight && query === '(prefers-color-scheme: light)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('initTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    mockMatchMedia(false);
  });

  it('defaults to dark (no data-theme attribute) when system is dark and no storage', () => {
    mockMatchMedia(false);
    initTheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('sets data-theme="light" when system prefers light and no stored preference', () => {
    mockMatchMedia(true);
    initTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('uses stored "dark" over light system preference', () => {
    localStorage.setItem('theme', 'dark');
    mockMatchMedia(true);
    initTheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('uses stored "light" over dark system preference', () => {
    localStorage.setItem('theme', 'light');
    mockMatchMedia(false);
    initTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('toggleTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('switches from dark to light', () => {
    toggleTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('switches from light back to dark', () => {
    document.documentElement.dataset.theme = 'light';
    toggleTheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});

describe('getTheme', () => {
  it('returns "dark" when no data-theme attribute', () => {
    delete document.documentElement.dataset.theme;
    expect(getTheme()).toBe('dark');
  });

  it('returns "light" when data-theme is "light"', () => {
    document.documentElement.dataset.theme = 'light';
    expect(getTheme()).toBe('light');
    delete document.documentElement.dataset.theme;
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/aousabdo/work/islamic_viz && npm test -- --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|theme)"
```

Expected: FAIL — `Cannot find module '../theme'`

- [ ] **Step 3: Create `src/lib/theme.ts`**

```ts
// src/lib/theme.ts
export type Theme = 'dark' | 'light';

/** Call once before ReactDOM.createRoot — reads localStorage then system pref. */
export function initTheme(): void {
  const stored = localStorage.getItem('theme') as Theme | null;
  const preferred: Theme = window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
  const theme = stored ?? preferred;
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
  }
}

/** Toggle between dark and light; persists selection to localStorage. */
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

/** Returns current active theme. */
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/aousabdo/work/islamic_viz && npm test -- --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|✓|✗|theme)"
```

Expected: all 7 theme tests PASS, existing tests still PASS

- [ ] **Step 5: Rewrite `src/styles/tokens.css`**

Complete replacement:

```css
/* src/styles/tokens.css — dark default, light override via [data-theme="light"] */
:root {
  /* backgrounds */
  --bg:          #070b14;
  --surface:     rgba(255,255,255,0.04);
  --surface-h:   rgba(255,255,255,0.07);

  /* borders */
  --border:      rgba(255,255,255,0.08);
  --border-h:    rgba(77,222,204,0.35);

  /* text */
  --ink:         #f0e8d6;
  --ink-dim:     rgba(240,232,214,0.45);

  /* brand */
  --accent:      #4adecc;
  --accent-d:    #0F766E;
  --gold:        #d4b483;
  --gold-d:      #a88a52;

  /* dividers */
  --rule:        rgba(255,255,255,0.06);

  /* chart palette */
  --chart-1:     #4adecc;
  --chart-2:     #d4b483;
  --chart-3:     #f97316;

  /* shadows / glows */
  --glow-teal:   0 0 24px rgba(77,222,204,0.15);
  --glow-gold:   0 0 20px rgba(212,180,131,0.12);

  /* glass header */
  --header-bg:   rgba(7,11,20,0.75);

  /* SunPathAsr sky gradient stops */
  --sky-top:     #04080f;
  --sky-bottom:  #0a1628;

  /* QiblaGC map fills */
  --map-land:      rgba(255,255,255,0.06);
  --map-graticule: rgba(255,255,255,0.04);
}

[data-theme="light"] {
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

  --header-bg:   rgba(250,247,240,0.82);

  --sky-top:     #dbeafe;
  --sky-bottom:  #bfdbfe;

  --map-land:      rgba(15,118,110,0.07);
  --map-graticule: rgba(15,118,110,0.05);
}
```

- [ ] **Step 6: Update `tailwind.config.ts` to add missing tokens**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:        'var(--bg)',
        surface:   'var(--surface)',
        ink:       'var(--ink)',
        'ink-dim': 'var(--ink-dim)',
        accent:    'var(--accent)',
        'accent-d':'var(--accent-d)',
        gold:      'var(--gold)',
        'gold-d':  'var(--gold-d)',
        rule:      'var(--rule)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
      },
      fontFamily: {
        'en-body':    ['Inter', 'system-ui', 'sans-serif'],
        'en-display': ['"Instrument Serif"', 'Georgia', 'serif'],
        'ar-body':    ['Amiri', 'serif'],
        'ar-display': ['"Scheherazade New"', 'Amiri', 'serif'],
      },
      borderRadius: { lg: '8px', '2xl': '14px' },
      transitionTimingFunction: {
        'ease-out-soft': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 7: Update `src/styles/global.css`**

Add dark control styling after the existing rules:

```css
/* src/styles/global.css */
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/instrument-serif/400.css';
@import '@fontsource/amiri/400.css';
@import '@fontsource/amiri/700.css';
@import '@fontsource/scheherazade-new/400.css';
@import '@fontsource/scheherazade-new/700.css';

@import './tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

html { background: var(--bg); color: var(--ink); }
html[lang='en'] body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.65; }
html[lang='ar'] body { font-family: 'Amiri', serif; line-height: 1.85; }

html[lang='en'] h1, html[lang='en'] h2 { font-family: 'Instrument Serif', Georgia, serif; }
html[lang='ar'] h1, html[lang='ar'] h2 { font-family: 'Scheherazade New', Amiri, serif; }

html[dir='rtl'] body { text-align: right; }

a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--accent-d); text-decoration: underline; }

/* Force dark-theme colors on native form controls */
select,
input[type='date'],
input[type='text'],
input[type='number'] {
  color: var(--ink);
  background: var(--surface);
}

select option {
  background: var(--bg);
  color: var(--ink);
}
```

- [ ] **Step 8: Create `src/components/ThemeToggle.tsx`**

```tsx
// src/components/ThemeToggle.tsx
import { useState } from 'react';
import { toggleTheme, getTheme, type Theme } from '../lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getTheme);

  function handleClick() {
    toggleTheme();
    setTheme(getTheme());
  }

  return (
    <button
      onClick={handleClick}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
      style={{
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--ink-dim)',
        cursor: 'pointer',
      }}
    >
      {theme === 'dark' ? (
        /* Moon */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        /* Sun */
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 9: Update `src/main.tsx`**

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { initTheme } from './lib/theme';

// Run before React mounts to avoid flash of wrong theme
initTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 10: Run full test suite and verify build**

```bash
cd /Users/aousabdo/work/islamic_viz && npm test && npm run build
```

Expected: all tests PASS, build exits 0

- [ ] **Step 11: Commit**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/styles/tokens.css tailwind.config.ts src/lib/theme.ts src/components/ThemeToggle.tsx src/main.tsx src/styles/global.css src/lib/__tests__/theme.test.ts
git commit -m "feat: dark celestial token system, theme module, ThemeToggle"
```

---

### Task 2: Glass Header + Minimal Footer

**Files:**
- Modify: `src/components/Layout/Header.tsx`
- Modify: `src/components/Layout/Footer.tsx`

- [ ] **Step 1: Update `src/components/Layout/Header.tsx`**

```tsx
// src/components/Layout/Header.tsx
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import LangToggle from './LangToggle';
import ThemeToggle from '../ThemeToggle';

export default function Header() {
  const { lang, t } = useLang();
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--header-bg)',
      }}
    >
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to={`/${lang}/`}
          className="no-underline"
          style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            color: 'var(--gold)',
            fontSize: '1.05rem',
            letterSpacing: '.04em',
          }}
        >
          {t('site.title')}
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to={`/${lang}/about`}
            className="no-underline transition-opacity hover:opacity-100"
            style={{ color: 'var(--ink-dim)', fontSize: '.78rem', opacity: 0.75 }}
          >
            {t('nav.about')}
          </Link>
          <LangToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Update `src/components/Layout/Footer.tsx`**

```tsx
// src/components/Layout/Footer.tsx
import Credit from './Credit';

export default function Footer() {
  return (
    <footer className="mt-16" style={{ borderTop: '1px solid var(--rule)' }}>
      <div
        className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between text-xs"
        style={{ color: 'var(--ink-dim)' }}
      >
        <span className="flex items-center gap-2">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <Credit tier={2} />
        </span>
        <span>© 2026</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Run build (no TS errors expected)**

```bash
cd /Users/aousabdo/work/islamic_viz && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` — no errors

- [ ] **Step 4: Commit**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/components/Layout/Header.tsx src/components/Layout/Footer.tsx
git commit -m "feat: glass header with ThemeToggle, minimal teal-dot footer"
```

---

### Task 3: Shared Chart Utilities (chartUtils, GlowDefs, ChartTooltip)

**Files:**
- Create: `src/lib/chartUtils.ts`
- Create: `src/components/GlowDefs.tsx`
- Create: `src/components/ChartTooltip.tsx`

- [ ] **Step 1: Create `src/lib/chartUtils.ts`**

```ts
// src/lib/chartUtils.ts
export const MONTH_LABELS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

/** X-axis tick positions: first day of each month in a non-leap year. */
export const MONTH_TICKS = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

/**
 * Convert a day-of-year integer (1–365) to a 3-letter month abbreviation.
 * Uses 2025 (non-leap) as reference year.
 */
export function dayToMonth(day: number): string {
  const d = new Date(Date.UTC(2025, 0, day));
  return MONTH_LABELS[d.getUTCMonth()];
}
```

- [ ] **Step 2: Create `src/components/GlowDefs.tsx`**

This is a zero-size hidden SVG placed adjacent to each `<ResponsiveContainer>`.
Because SVG `<defs>` IDs are scoped to the document (not the individual `<svg>`), the
gradients and filters defined here are referenceable by recharts' internal SVG elements.

```tsx
// src/components/GlowDefs.tsx
/**
 * Renders a hidden 0×0 SVG containing shared gradients and glow filters.
 * Place once per chart component, alongside (not inside) <ResponsiveContainer>.
 *
 * IDs registered:
 *   #grad-chart1  — vertical fade, var(--chart-1) teal
 *   #grad-chart2  — vertical fade, var(--chart-2) gold
 *   #glow         — feGaussianBlur merge (stdDeviation 3) for lines
 *   #dot-glow     — feGaussianBlur merge (stdDeviation 2) for scatter dots
 */
export default function GlowDefs() {
  return (
    <svg
      style={{ width: 0, height: 0, position: 'absolute', overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grad-chart1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--chart-1)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="grad-chart2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--chart-2)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
```

- [ ] **Step 3: Create `src/components/ChartTooltip.tsx`**

```tsx
// src/components/ChartTooltip.tsx
type Row = { name: string; value: string; color: string };

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string | number;
  /** Optional — override how the label string is displayed */
  labelFormatter?: (label: string | number) => string;
  /** Optional — override how each row value is displayed */
  valueFormatter?: (value: number, name: string) => string;
};

/**
 * Drop-in recharts custom tooltip.
 *
 * Usage in a chart:
 *   <Tooltip
 *     content={
 *       <ChartTooltip
 *         labelFormatter={(d) => `Day ${d}`}
 *         valueFormatter={(v) => `${Number(v).toFixed(1)} hrs`}
 *       />
 *     }
 *   />
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter
    ? labelFormatter(label ?? '')
    : String(label ?? '');

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-h)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: 'var(--glow-teal)',
        opacity: 0.97,
      }}
    >
      <p
        style={{
          color: 'var(--ink-dim)',
          fontSize: 11,
          marginBottom: payload.length > 1 ? 6 : 2,
        }}
      >
        {displayLabel}
      </p>
      {payload.map((row, i) => (
        <div
          key={i}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: row.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: 'var(--ink-dim)' }}>{row.name}:</span>
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
            {valueFormatter ? valueFormatter(row.value, row.name) : String(row.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run build to verify no TS errors**

```bash
cd /Users/aousabdo/work/islamic_viz && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` — no errors

- [ ] **Step 5: Commit**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/lib/chartUtils.ts src/components/GlowDefs.tsx src/components/ChartTooltip.tsx
git commit -m "feat: chartUtils, GlowDefs hidden SVG, glass ChartTooltip"
```

---

### Task 4: VizCard + MiniChart + Chip

**Files:**
- Modify: `src/components/Chip.tsx`
- Create: `src/components/MiniChart.tsx`
- Modify: `src/components/VizCard.tsx`

- [ ] **Step 1: Update `src/components/Chip.tsx`**

```tsx
// src/components/Chip.tsx
import type { ReactNode } from 'react';

export default function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block text-xs uppercase tracking-[0.08em] font-semibold px-2 py-1 rounded-lg"
      style={{
        background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
        color: 'var(--accent)',
        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
      }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Create `src/components/MiniChart.tsx`**

Each slug gets a unique static SVG preview. Gradient IDs are slug-prefixed to avoid
conflicts when multiple cards are in the DOM simultaneously.

```tsx
// src/components/MiniChart.tsx
import type { VizSlug } from '../data/visualizations';

/** Short unique prefix per slug for SVG gradient/filter IDs */
const P: Record<VizSlug, string> = {
  'fajr-globe':          'fg',
  'fasting-hours':       'fh',
  'hijri-drift':         'hd',
  'sun-path-asr':        'sp',
  'qibla-great-circle':  'qg',
};

export default function MiniChart({ slug }: { slug: VizSlug }) {
  const p = P[slug];

  switch (slug) {
    case 'fajr-globe':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          {/* Fajr teal curve (U-shaped, lower in summer) */}
          <path
            d="M0 32 C22 40 40 24 50 28 C65 33 80 20 100 28"
            stroke="var(--chart-1)"
            strokeWidth="1.5"
          />
          {/* Sunrise gold curve (above Fajr) */}
          <path
            d="M0 24 C22 32 40 16 50 20 C65 25 80 12 100 20"
            stroke="var(--chart-2)"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
        </svg>
      );

    case 'fasting-hours':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${p}-g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--chart-1)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Peak in summer (middle of year) */}
          <path d="M0 38 Q50 4 100 38 L100 44 L0 44 Z" fill={`url(#${p}-g)`} />
          <path d="M0 38 Q50 4 100 38" stroke="var(--chart-1)" strokeWidth="1.5" />
        </svg>
      );

    case 'hijri-drift':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          {/* Diagonal scatter — teal for first half of Gregorian year, gold for second */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <circle
              key={i}
              cx={6 + i * 11}
              cy={6 + (i * 4) % 36}
              r={2.5}
              fill={i < 5 ? 'var(--chart-1)' : 'var(--chart-2)'}
              fillOpacity={0.85}
            />
          ))}
        </svg>
      );

    case 'sun-path-asr':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${p}-s`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#1e3a5f" />
              <stop offset="25%"  stopColor="#f97316" />
              <stop offset="50%"  stopColor="#fbbf24" />
              <stop offset="75%"  stopColor="#f97316" />
              <stop offset="100%" stopColor="#1e3a5f" />
            </linearGradient>
          </defs>
          {/* Ground */}
          <line x1="3" y1="40" x2="97" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {/* Sun arc with gradient stroke */}
          <path d="M4 40 Q50 3 96 40" stroke={`url(#${p}-s)`} strokeWidth="2" />
          {/* Asr marker */}
          <line x1="65" y1="12" x2="65" y2="40" stroke="var(--chart-1)" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'qibla-great-circle':
      return (
        <svg width="100%" height="44" viewBox="0 0 100 44" fill="none" aria-hidden="true">
          {/* Ocean background */}
          <rect width="100" height="44" fill="var(--bg)" rx="4" />
          {/* Simplified land outline */}
          <rect
            x="4" y="4" width="92" height="36" rx="2"
            fill="var(--map-land)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
          {/* Great-circle arc */}
          <path d="M18 22 Q50 8 82 22" stroke="var(--chart-1)" strokeWidth="1.5" />
          {/* City dot */}
          <circle cx="18" cy="22" r="2.5" fill="var(--chart-2)" />
          {/* Makkah dot */}
          <circle cx="82" cy="22" r="3" fill="var(--chart-1)" />
        </svg>
      );

    default:
      return null;
  }
}
```

- [ ] **Step 3: Update `src/components/VizCard.tsx`**

```tsx
// src/components/VizCard.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/useLang';
import type { VizSlug } from '../data/visualizations';
import Chip from './Chip';
import MiniChart from './MiniChart';

type VizCardProps = {
  slug: VizSlug;
  title: string;
  subtitle: string;
  tag: string;
};

export default function VizCard({ slug, title, subtitle, tag }: VizCardProps) {
  const { lang } = useLang();
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/${lang}/v/${slug}`}
      className="relative block rounded-2xl p-6 no-underline overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--border-h)' : 'var(--border)'}`,
        color: 'var(--ink)',
        boxShadow: hovered ? 'var(--glow-teal)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Radial shimmer — visible on hover */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(77,222,204,0.07) 0%, transparent 60%)',
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="mb-3">
        <Chip>{tag}</Chip>
      </div>

      <h3 className="text-2xl mb-2" style={{ color: 'var(--ink)' }}>
        {title}
      </h3>

      <p className="text-sm mb-4" style={{ color: 'var(--ink-dim)' }}>
        {subtitle}
      </p>

      <MiniChart slug={slug} />

      {/* Hover arrow */}
      <span
        className="absolute bottom-4 right-5 text-lg transition-opacity duration-200"
        style={{ color: 'var(--accent)', opacity: hovered ? 1 : 0 }}
      >
        →
      </span>
    </Link>
  );
}
```

- [ ] **Step 4: Run build**

```bash
cd /Users/aousabdo/work/islamic_viz && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` — no errors

- [ ] **Step 5: Commit**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/components/Chip.tsx src/components/MiniChart.tsx src/components/VizCard.tsx
git commit -m "feat: glass VizCard with hover glow, mini chart previews, adaptive Chip"
```

---

### Task 5: Home Hero + VizPage Dark Styling

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/pages/VizPage.tsx`

- [ ] **Step 1: Update `src/pages/Home.tsx`**

```tsx
// src/pages/Home.tsx
import { useLang } from '../i18n/useLang';
import Container from '../components/Layout/Container';
import VizCard from '../components/VizCard';
import { VIZ_ORDER, VISUALIZATIONS } from '../data/visualizations';

type CardContent = { title: string; subtitle: string; tag: string };

const contentModules = import.meta.glob('../viz/*/content.{en,ar}.json', {
  eager: true,
}) as Record<string, { default: CardContent }>;

export default function Home() {
  const { t, lang } = useLang();

  const heroTitle =
    lang === 'ar' ? (
      <>
        مركز{' '}
        <span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>
          التصورات
        </span>{' '}
        الإسلامية
      </>
    ) : (
      <>
        Islamic{' '}
        <span style={{ color: 'var(--gold)', fontStyle: 'normal' }}>
          Viz
        </span>{' '}
        Hub
      </>
    );

  const heroEyebrow =
    lang === 'ar'
      ? 'خمس نوافذ إلى العلوم الإسلامية'
      : 'Five windows into Islamic science';

  return (
    <Container>
      {/* Hero */}
      <section className="relative text-center pt-16 pb-12 overflow-hidden">
        {/* Radial teal glow behind the hero text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(77,222,204,0.08) 0%, transparent 70%)',
          }}
        />
        <p
          className="mb-4 uppercase tracking-[.2em] text-xs font-semibold"
          style={{ color: 'var(--accent)' }}
        >
          {heroEyebrow}
        </p>
        <h1
          className="mb-5"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            lineHeight: 1.15,
            color: 'var(--ink)',
          }}
        >
          {heroTitle}
        </h1>
        <p
          className="mx-auto text-lg"
          style={{ color: 'var(--ink-dim)', maxWidth: 480 }}
        >
          {t('site.tagline')}
        </p>
      </section>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {VIZ_ORDER.filter((slug) => VISUALIZATIONS[slug] !== null).map((slug) => {
          const key = `../viz/${slug}/content.${lang}.json`;
          const content = contentModules[key]?.default;
          if (!content) return null;
          return <VizCard key={slug} slug={slug} {...content} />;
        })}
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Update `src/pages/VizPage.tsx`**

```tsx
// src/pages/VizPage.tsx
import { useParams, Link } from 'react-router-dom';
import { VISUALIZATIONS, type VizSlug } from '../data/visualizations';
import { useLang } from '../i18n/useLang';
import Container from '../components/Layout/Container';
import Chip from '../components/Chip';
import Disclosure from '../components/Disclosure';

type VizContent = {
  title: string;
  subtitle: string;
  tag: string;
  explainer: Array<{ type: 'p'; text: string }>;
  methodology: Array<{ type: 'p'; text: string }>;
};

const contentModules = import.meta.glob('../viz/*/content.{en,ar}.json', {
  eager: true,
}) as Record<string, { default: VizContent }>;

function loadContent(slug: VizSlug, lang: 'en' | 'ar'): VizContent | null {
  const key = `../viz/${slug}/content.${lang}.json`;
  return contentModules[key]?.default ?? null;
}

export default function VizPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLang();
  const config =
    slug && slug in VISUALIZATIONS ? VISUALIZATIONS[slug as VizSlug] : null;

  if (!config) {
    return (
      <Container>
        <h1 className="text-4xl mt-8">{t('notfound.title')}</h1>
      </Container>
    );
  }

  const content = loadContent(config.slug, lang);
  if (!content) {
    return (
      <Container>
        <h1 className="text-4xl mt-8">Content missing for {config.slug}</h1>
      </Container>
    );
  }

  const Chart = config.Chart;

  return (
    <Container className="pt-8 pb-16">
      <div className="mb-6">
        <Chip>{content.tag}</Chip>
      </div>

      <h1 className="text-5xl mb-3" style={{ color: 'var(--ink)' }}>
        {content.title}
      </h1>
      <p className="text-lg mb-8" style={{ color: 'var(--ink-dim)' }}>
        {content.subtitle}
      </p>

      {/* Chart card */}
      <div
        className="rounded-2xl p-4 mb-8"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <Chart />
      </div>

      <div className="prose prose-lg max-w-none" style={{ color: 'var(--ink)' }}>
        {content.explainer.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </div>

      <Disclosure summary={t('viz.methodology')}>
        {content.methodology.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </Disclosure>

      <div
        className="flex items-center justify-between mt-10 pt-6 text-sm"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <Link to={`/${lang}/`} style={{ color: 'var(--accent)' }}>
          {t('viz.back')}
        </Link>
      </div>
    </Container>
  );
}
```

- [ ] **Step 3: Run build**

```bash
cd /Users/aousabdo/work/islamic_viz && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` — no errors

- [ ] **Step 4: Commit**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/pages/Home.tsx src/pages/VizPage.tsx
git commit -m "feat: Home hero section with radial glow, VizPage dark card styling"
```

---

### Task 6: FajrGlobe Atmospheric Chart

**Files:**
- Modify: `src/viz/fajr-globe/FajrGlobe.tsx`

- [ ] **Step 1: Update `src/viz/fajr-globe/FajrGlobe.tsx`**

```tsx
// src/viz/fajr-globe/FajrGlobe.tsx
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CITIES } from '../../data/cities';
import { CALC_METHODS, getMethod } from '../../data/calc-methods';
import { sunriseSunset, fajrTime, hoursToHHMM } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import { MONTH_TICKS, dayToMonth } from '../../lib/chartUtils';
import GlowDefs from '../../components/GlowDefs';
import ChartTooltip from '../../components/ChartTooltip';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

export default function FajrGlobe() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [methodId, setMethodId] = useState('umm');

  const city = CITIES[cityIdx];
  const method = getMethod(methodId);

  const data = useMemo(() => {
    const out: Array<{ day: number; fajr: number; sunrise: number }> = [];
    for (let n = 1; n <= 365; n++) {
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(city.dstType, d) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const { sunrise } = sunriseSunset(loc, d);
      const fajr = fajrTime(loc, d, method.fajrAngle);
      out.push({ day: n, fajr, sunrise });
    }
    return out;
  }, [city, method]);

  const cityLabel = lang === 'ar' && city.nameAr ? city.nameAr : city.name;

  const fmtHour = (h: number) => {
    const { hh, mm } = hoursToHHMM(h);
    return `${hh}:${mm}`;
  };

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
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.method}</span>
          <select
            value={methodId}
            onChange={(e) => setMethodId(e.target.value)}
            className="border border-rule rounded-lg px-2 py-1 bg-surface"
          >
            {CALC_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {lang === 'ar' ? m.labelAr : m.labelEn}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="text-sm mb-2" style={{ color: 'var(--ink-dim)' }}>
        {cityLabel}
      </div>

      {/* Hidden SVG defs — must precede ResponsiveContainer in DOM */}
      <GlowDefs />

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />

            <XAxis
              dataKey="day"
              ticks={MONTH_TICKS}
              tickFormatter={dayToMonth}
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
            />
            <YAxis
              domain={[0, 8]}
              tickFormatter={fmtHour}
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
            />

            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(d) => dayToMonth(Number(d))}
                  valueFormatter={(v) => fmtHour(Number(v))}
                />
              }
            />

            <Area
              type="monotone"
              dataKey="fajr"
              name="Fajr"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#grad-chart1)"
              filter="url(#glow)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--chart-1)' }}
            />
            <Area
              type="monotone"
              dataKey="sunrise"
              name="Sunrise"
              stroke="var(--chart-2)"
              strokeWidth={1.5}
              fill="url(#grad-chart2)"
              filter="url(#glow)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--chart-2)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run build**

```bash
cd /Users/aousabdo/work/islamic_viz && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` — no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/viz/fajr-globe/FajrGlobe.tsx
git commit -m "feat: FajrGlobe atmospheric glow — gradient fills, glow filter, month ticks, glass tooltip"
```

---

### Task 7: FastingHours Season Bands Chart

**Files:**
- Modify: `src/viz/fasting-hours/FastingHours.tsx`

- [ ] **Step 1: Update `src/viz/fasting-hours/FastingHours.tsx`**

```tsx
// src/viz/fasting-hours/FastingHours.tsx
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { CITIES } from '../../data/cities';
import { sunriseSunset, fajrTime } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import { MONTH_TICKS, dayToMonth } from '../../lib/chartUtils';
import GlowDefs from '../../components/GlowDefs';
import ChartTooltip from '../../components/ChartTooltip';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

// Subtle season background fills — same values in both themes; low-opacity so
// they don't fight the dark/light background.
const SEASON_BANDS = [
  { y1: 1,   y2: 79,  fill: 'rgba(30,60,100,0.08)',  label: 'Winter' },
  { y1: 80,  y2: 171, fill: 'rgba(30,100,60,0.08)',  label: 'Spring' },
  { y1: 172, y2: 265, fill: 'rgba(100,60,10,0.08)',  label: 'Summer' },
  { y1: 266, y2: 355, fill: 'rgba(60,30,80,0.08)',   label: 'Autumn' },
] as const;

// Fasting hours = maghrib (sunset) minus fajr.
export default function FastingHours() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const city = CITIES[cityIdx];

  const data = useMemo(() => {
    const out: Array<{ day: number; hours: number }> = [];
    for (let n = 1; n <= 365; n++) {
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(city.dstType, d) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const { sunset } = sunriseSunset(loc, d);
      const fajr = fajrTime(loc, d, 18.5);
      const hours =
        isFinite(fajr) && isFinite(sunset) ? sunset - fajr : NaN;
      out.push({ day: n, hours });
    }
    return out;
  }, [city]);

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
      </div>

      <GlowDefs />

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            {/* Season background bands — rendered first so they sit behind everything */}
            {SEASON_BANDS.map((s) => (
              <ReferenceArea
                key={s.label}
                x1={s.y1}
                x2={s.y2}
                fill={s.fill}
                stroke="none"
                ifOverflow="hidden"
              />
            ))}

            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />

            <XAxis
              dataKey="day"
              ticks={MONTH_TICKS}
              tickFormatter={dayToMonth}
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
            />
            <YAxis
              domain={[0, 24]}
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
            />

            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(d) => dayToMonth(Number(d))}
                  valueFormatter={(v) => `${Number(v).toFixed(1)} hrs`}
                />
              }
            />

            <Area
              type="monotone"
              dataKey="hours"
              name="Fasting hours"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#grad-chart1)"
              filter="url(#glow)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--chart-1)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run build**

```bash
cd /Users/aousabdo/work/islamic_viz && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` — no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/viz/fasting-hours/FastingHours.tsx
git commit -m "feat: FastingHours season bands, glow gradient area, month ticks"
```

---

### Task 8: HijriDrift Glowing Scatter + Season Bands

**Files:**
- Modify: `src/viz/hijri-drift/HijriDrift.tsx`

- [ ] **Step 1: Update `src/viz/hijri-drift/HijriDrift.tsx`**

```tsx
// src/viz/hijri-drift/HijriDrift.tsx
import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { ramadanStart } from '../../lib/hijri';
import { useLang } from '../../i18n/useLang';
import GlowDefs from '../../components/GlowDefs';
import ChartTooltip from '../../components/ChartTooltip';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const START_H_YEAR = 1445;
const END_H_YEAR = 1478;

// Season bands on Y axis (dayOfYear domain 0–366, reversed so Jan is at top)
const Y_BANDS = [
  { y1: 1,   y2: 79,  fill: 'rgba(30,60,100,0.08)' },
  { y1: 80,  y2: 171, fill: 'rgba(30,100,60,0.08)' },
  { y1: 172, y2: 265, fill: 'rgba(100,60,10,0.08)' },
  { y1: 266, y2: 366, fill: 'rgba(60,30,80,0.08)' },
] as const;

type DotProps = {
  cx?: number;
  cy?: number;
  payload?: { dayOfYear: number };
};

/** Custom scatter dot — teal for Jan–Jun Ramadan start, gold for Jul–Dec */
function GlowDot({ cx = 0, cy = 0, payload }: DotProps) {
  const isFirstHalf = (payload?.dayOfYear ?? 0) <= 182;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={isFirstHalf ? 'var(--chart-1)' : 'var(--chart-2)'}
      fillOpacity={0.85}
      filter="url(#dot-glow)"
    />
  );
}

export default function HijriDrift() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? contentAr : contentEn;

  const data = useMemo(() => {
    const pts: Array<{ gYear: number; dayOfYear: number; hYear: number }> = [];
    for (let h = START_H_YEAR; h <= END_H_YEAR; h++) {
      try {
        const d = ramadanStart(h);
        const gYear = d.getUTCFullYear();
        const start = Date.UTC(gYear, 0, 0);
        const day = Math.floor((d.getTime() - start) / 86400000);
        pts.push({ gYear, dayOfYear: day, hYear: h });
      } catch {
        /* ignore */
      }
    }
    return pts;
  }, []);

  const seasonTicks = [1, 80, 172, 266, 355];
  const seasonLabels =
    lang === 'ar'
      ? ['يناير', 'الربيع', 'الصيف', 'الخريف', 'الشتاء']
      : ['Jan 1', 'Spring', 'Summer', 'Autumn', 'Winter'];

  return (
    <div>
      <div className="text-sm mb-3" style={{ color: 'var(--ink-dim)' }}>
        {dict.subtitle}
      </div>

      <GlowDefs />

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 24 }}>
            {/* Season bands on Y axis */}
            {Y_BANDS.map((b, i) => (
              <ReferenceArea
                key={i}
                y1={b.y1}
                y2={b.y2}
                fill={b.fill}
                stroke="none"
                ifOverflow="hidden"
              />
            ))}

            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />

            <XAxis
              type="number"
              dataKey="gYear"
              domain={['auto', 'auto']}
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
              label={{
                value: dict.axes.x,
                position: 'insideBottom',
                offset: -8,
                fill: 'var(--ink-dim)',
              }}
            />
            <YAxis
              type="number"
              dataKey="dayOfYear"
              domain={[0, 366]}
              ticks={seasonTicks}
              tickFormatter={(t: number) =>
                seasonLabels[seasonTicks.indexOf(t)] ?? ''
              }
              stroke="var(--ink-dim)"
              tick={{ fill: 'var(--ink-dim)', fontSize: 11 }}
              reversed
            />

            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(l) => `${l}`}
                  valueFormatter={(v, name) =>
                    name === 'dayOfYear' ? `Day ${Math.round(v)}` : String(v)
                  }
                />
              }
            />

            <Scatter
              data={data}
              shape={(props: DotProps) => <GlowDot {...props} />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run build**

```bash
cd /Users/aousabdo/work/islamic_viz && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` — no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/viz/hijri-drift/HijriDrift.tsx
git commit -m "feat: HijriDrift glowing two-tone scatter dots, season Y-axis bands"
```

---

### Task 9: SunPathAsr Sky Gradient + Gradient-Stroke Arc

**Files:**
- Modify: `src/viz/sun-path-asr/SunPathAsr.tsx`

- [ ] **Step 1: Update `src/viz/sun-path-asr/SunPathAsr.tsx`**

```tsx
// src/viz/sun-path-asr/SunPathAsr.tsx
import { useMemo, useState } from 'react';
import { CITIES } from '../../data/cities';
import {
  sunAltitude, sunriseSunset, asrTime, solarNoon, hoursToHHMM,
} from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 720, H = 360;
const PADDING_X = 40, PADDING_Y = 40;

export default function SunPathAsr() {
  const { lang } = useLang();
  const [cityIdx, setCityIdx] = useState(() => {
    const i = CITIES.findIndex((c) => c.name.startsWith('Makkah'));
    return i >= 0 ? i : 0;
  });
  const [dateIso, setDateIso] = useState('2025-06-21');

  const city = CITIES[cityIdx];
  const date = new Date(dateIso + 'T00:00:00Z');
  const dict = lang === 'ar' ? contentAr : contentEn;

  const { points, sunrise, sunset, noon, asrShafii, asrHanafi, maxAlt } =
    useMemo(() => {
      const dstOffset = isDST(city.dstType, date) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const { sunrise, sunset } = sunriseSunset(loc, date);
      const noon = solarNoon(loc, date);
      const pts: Array<{ h: number; alt: number }> = [];
      for (let h = 0; h <= 24; h += 0.1) {
        pts.push({ h, alt: sunAltitude(loc, date, h) });
      }
      const peak = Math.max(...pts.map((p) => p.alt));
      return {
        points: pts,
        sunrise,
        sunset,
        noon,
        asrShafii: asrTime(loc, date, 1),
        asrHanafi: asrTime(loc, date, 2),
        maxAlt: Math.max(90, Math.ceil(peak / 10) * 10),
      };
    }, [city, date]);

  const xScale = (h: number) =>
    PADDING_X + ((h - 0) / 24) * (W - 2 * PADDING_X);
  const yScale = (alt: number) =>
    H - PADDING_Y - Math.max(0, alt / maxAlt) * (H - 2 * PADDING_Y);

  const arcPath = points
    .filter((p) => p.alt > 0)
    .map((p, i) =>
      `${i === 0 ? 'M' : 'L'}${xScale(p.h).toFixed(1)},${yScale(p.alt).toFixed(1)}`
    )
    .join(' ');

  const fmt = (h: number) => {
    const { hh, mm } = hoursToHHMM(h);
    return `${hh}:${mm}`;
  };

  const timeMarkers = [
    { h: sunrise, label: dict.labels.sunrise },
    { h: noon,    label: dict.labels.noon },
    { h: sunset,  label: dict.labels.sunset },
  ];

  const asrMarkers = [
    { time: asrShafii, color: 'var(--chart-1)', label: dict.labels.shafii, dy: -8 },
    { time: asrHanafi, color: 'var(--chart-2)', label: dict.labels.hanafi, dy: 18 },
  ];

  // The sun-stroke gradient spans the full chart x range so the colour
  // maps cleanly onto time-of-day regardless of arc position.
  const x1 = PADDING_X;
  const x2 = W - PADDING_X;

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
        <label className="flex items-center gap-2">
          <span style={{ color: 'var(--ink-dim)' }}>{dict.controls.date}</span>
          <input
            type="date"
            value={dateIso}
            onChange={(e) => setDateIso(e.target.value)}
            className="border border-rule rounded-lg px-2 py-1 bg-surface"
          />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          {/* Sky gradient — uses CSS vars so it adapts to light/dark theme */}
          <linearGradient id="spa-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--sky-top)" />
            <stop offset="100%" stopColor="var(--sky-bottom)" />
          </linearGradient>

          {/* Sun arc stroke — horizontal gradient in userSpaceOnUse */}
          <linearGradient
            id="spa-sun-stroke"
            x1={x1} y1="0" x2={x2} y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#1e3a5f" />   {/* predawn */}
            <stop offset="25%"  stopColor="#f97316" />   {/* Fajr orange */}
            <stop offset="50%"  stopColor="#fbbf24" />   {/* solar noon gold */}
            <stop offset="75%"  stopColor="#f97316" />   {/* Asr/dusk */}
            <stop offset="100%" stopColor="#1e3a5f" />   {/* night */}
          </linearGradient>

          {/* Glow filter */}
          <filter id="spa-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky background */}
        <rect x="0" y="0" width={W} height={H} fill="url(#spa-sky)" />

        {/* Ground line */}
        <line
          x1={PADDING_X} y1={H - PADDING_Y}
          x2={W - PADDING_X} y2={H - PADDING_Y}
          stroke="rgba(255,255,255,0.10)"
        />

        {/* Sun arc with gradient stroke + glow */}
        {arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke="url(#spa-sun-stroke)"
            strokeWidth={2.5}
            filter="url(#spa-glow)"
          />
        )}

        {/* Asr markers */}
        {asrMarkers.map((m, i) => {
          if (!isFinite(m.time)) return null;
          const x = xScale(m.time);
          return (
            <g key={i}>
              <line
                x1={x} y1={PADDING_Y} x2={x} y2={H - PADDING_Y}
                stroke={m.color}
                strokeDasharray="3 4"
                filter="url(#spa-glow)"
              />
              <text
                x={x + 4} y={PADDING_Y + 14 + m.dy}
                fontSize={12} fill={m.color}
              >
                {m.label} · {fmt(m.time)}
              </text>
            </g>
          );
        })}

        {/* Sunrise / noon / sunset ticks */}
        {timeMarkers.map((tk, i) => {
          if (!isFinite(tk.h)) return null;
          const x = xScale(tk.h);
          return (
            <g key={i}>
              <line
                x1={x} y1={H - PADDING_Y - 4}
                x2={x} y2={H - PADDING_Y + 4}
                stroke="var(--ink-dim)"
              />
              <text
                x={x} y={H - PADDING_Y + 18}
                fontSize={11} fill="var(--ink-dim)" textAnchor="middle"
              >
                {tk.label}
              </text>
              <text
                x={x} y={H - PADDING_Y + 32}
                fontSize={10} fill="var(--ink-dim)" textAnchor="middle"
              >
                {fmt(tk.h)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Run build**

```bash
cd /Users/aousabdo/work/islamic_viz && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` — no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/viz/sun-path-asr/SunPathAsr.tsx
git commit -m "feat: SunPathAsr sky gradient, gradient-stroke sun arc, glowing Asr markers"
```

---

### Task 10: QiblaGC Dark Ocean Map + Build Verification + Deploy

**Files:**
- Modify: `src/viz/qibla-great-circle/QiblaGC.tsx`

- [ ] **Step 1: Update `src/viz/qibla-great-circle/QiblaGC.tsx`**

```tsx
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
            stroke="rgba(255,255,255,0.1)"
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
```

- [ ] **Step 2: Run full test suite**

```bash
cd /Users/aousabdo/work/islamic_viz && npm test 2>&1 | tail -10
```

Expected: all tests PASS (no regressions)

- [ ] **Step 3: Run production build**

```bash
cd /Users/aousabdo/work/islamic_viz && npm run build 2>&1 | tail -10
```

Expected: `✓ built in Xs` — no TypeScript errors, no lint errors

- [ ] **Step 4: Commit QiblaGC**

```bash
cd /Users/aousabdo/work/islamic_viz
git add src/viz/qibla-great-circle/QiblaGC.tsx
git commit -m "feat: QiblaGC dark ocean map, glowing arc + city dots, theme-adaptive land fill"
```

- [ ] **Step 5: Deploy to GitHub Pages**

```bash
cd /Users/aousabdo/work/islamic_viz && gh workflow run deploy.yml
```

- [ ] **Step 6: Verify live site**

Wait ~60 seconds for deployment then:

```bash
curl -s -o /dev/null -w "%{http_code}" https://islamicviz.analyticadss.com/
```

Expected: `200`

Also verify the theme toggle works and charts glow correctly by opening the browser.

- [ ] **Step 7: Final commit (if any cleanup needed)**

```bash
cd /Users/aousabdo/work/islamic_viz
git status
# If clean, done. If any leftover changes:
git add -p && git commit -m "chore: dark celestial revamp — post-deploy cleanup"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Task 1: Token system (dark + light), `--sky-top/bottom`, `--map-land/graticule`
- ✅ Task 1: `theme.ts` (initTheme, toggleTheme, getTheme) + tests
- ✅ Task 1: `ThemeToggle.tsx` (moon/sun icon, useState)
- ✅ Task 1: `main.tsx` calls `initTheme()` before React mounts
- ✅ Task 1: `global.css` dark select/input styling
- ✅ Task 1: `tailwind.config.ts` adds `gold`, `chart-1`
- ✅ Task 2: Glass header (backdrop-blur, `var(--header-bg)`, gold serif site name, ThemeToggle)
- ✅ Task 2: Minimal footer (teal dot, Credit, © 2026)
- ✅ Task 3: `chartUtils.ts` (MONTH_TICKS, dayToMonth)
- ✅ Task 3: `GlowDefs.tsx` (hidden SVG, grad-chart1/2, glow, dot-glow)
- ✅ Task 3: `ChartTooltip.tsx` (glass panel, CSS variable colors)
- ✅ Task 4: `Chip.tsx` (color-mix adaptive chip)
- ✅ Task 4: `MiniChart.tsx` (slug-prefixed IDs, 5 unique previews)
- ✅ Task 4: `VizCard.tsx` (glass card, hover glow + translate, shimmer, arrow)
- ✅ Task 5: `Home.tsx` (eyebrow, gold "Viz" span, radial glow, bilingual)
- ✅ Task 5: `VizPage.tsx` (dark chart card, CSS variable borders)
- ✅ Task 6: `FajrGlobe.tsx` (GlowDefs, grad fills, glow filter, month ticks, ChartTooltip)
- ✅ Task 7: `FastingHours.tsx` (season ReferenceArea bands, GlowDefs, month ticks)
- ✅ Task 8: `HijriDrift.tsx` (GlowDot two-tone, dot-glow filter, Y-axis season bands)
- ✅ Task 9: `SunPathAsr.tsx` (sky gradient, sun-stroke gradient, glow filter, theme-adaptive)
- ✅ Task 10: `QiblaGC.tsx` (dark ocean, map tokens, glowing arc + dots)
- ✅ Task 10: build + test + deploy

**Type consistency check:**
- `GlowDefs` is a zero-arg function component — no props conflict
- `ChartTooltip` `valueFormatter` receives `(value: number, name: string)` — matches usage in all 3 chart tasks
- `MiniChart` accepts `{ slug: VizSlug }` — matches VizCard usage
- `GlowDot` accepts `DotProps` (`cx?, cy?, payload?`) — recharts Scatter `shape` receives the same
- `dayToMonth` takes `number` — all XAxis `tickFormatter` usages pass `number`
- `MONTH_TICKS` is `number[]` — XAxis `ticks` prop accepts `number[]`

**Placeholder scan:** No TBD/TODO/placeholder text found — every step has actual code.
