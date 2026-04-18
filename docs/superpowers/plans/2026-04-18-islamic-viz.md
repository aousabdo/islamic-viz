# Islamic Viz Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (AR/EN) static visualization hub with 5 Islamic-science visualizations, deployed to GitHub Pages at `islamicviz.analyticadss.com`.

**Architecture:** React 19 + Vite + TypeScript SPA. Language-prefixed routes (`/en/`, `/ar/`) driven by a `<LangProvider>` context. Pure-function domain libs (`solar.ts`, `hijri.ts`, `qibla.ts`) drive the visualizations; each viz is a self-contained directory under `src/viz/<slug>/` with its own chart component, controls, and bilingual content JSON. Scholarly-modern aesthetic (cream + teal + serif display) with Scheherazade New / Amiri for Arabic and Instrument Serif / Inter for English.

**Tech Stack:** React 19, Vite 5, TypeScript 5, Tailwind CSS 3, react-router-dom 6, recharts 2, d3 7 (scoped: `d3-geo`, `d3-scale`, `d3-shape`, `topojson-client`), `@fontsource/*`, Lucide React, Vitest for pure-function unit tests.

**Spec:** [`../specs/2026-04-18-islamic-viz-design.md`](../specs/2026-04-18-islamic-viz-design.md)

---

## Testing Strategy

- **TDD for pure-function libs.** `solar.ts`, `hijri.ts`, `qibla.ts`, `format.ts`, `dst.ts`, `calc-methods.ts` — write failing test first, then the minimal code to pass, commit. Use Vitest.
- **No tests for React components or charts.** These are visual/interactive. They get manual bilingual QA (phase 10) and Lighthouse verification at deploy time. Adding RTL/jsdom tests for charts is low-ROI at MVP scope.
- **Test values** for solar math: pin to published Fajr/Dhuhr/Asr times for **Makkah on 2025-06-21** (solstice), cross-referenced with `islamicfinder.org` and `aladhan.com` APIs (documented per calculation method).

## Conventions

- **Commit cadence:** one commit per green test or per landing UI task. No batching.
- **Branch:** work directly on `main` for MVP (solo project). Switch to PRs in v2.
- **Commit prefix:** `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `test:`, `refactor:`.
- **No co-author trailer** for this project (solo).
- **Paths** in tasks are relative to `/Users/aousabdo/work/islamic_viz/`.

---

## Phase 0 — Scaffold

### Task 1: Initialize Vite + React 19 + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `.gitignore`, `.nvmrc`
- Delete: `fajr-sunrise-global.jsx`, `prophets-tree (1).html` (we'll keep them in a `legacy/` folder for reference)

- [ ] **Step 1: Back up the two existing files into `legacy/`**

```bash
cd /Users/aousabdo/work/islamic_viz
mkdir -p legacy
mv fajr-sunrise-global.jsx legacy/
mv "prophets-tree (1).html" legacy/prophets-tree.html
```

- [ ] **Step 2: Initialize npm package and install core deps**

```bash
npm init -y
npm install react@^19 react-dom@^19 react-router-dom@^6.22
npm install -D typescript@^5 @types/react@^19 @types/react-dom@^19 \
  vite@^5 @vitejs/plugin-react@^4 \
  vitest@^1 @vitest/ui jsdom @testing-library/react @testing-library/jest-dom \
  tailwindcss@^3 postcss autoprefixer \
  eslint@^9 @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-react-hooks eslint-plugin-react-refresh
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: { outDir: 'dist', sourcemap: false },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 4: Create `tsconfig.json` and `tsconfig.node.json`**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `.gitignore` and `.nvmrc`**

```
# .gitignore
node_modules
dist
dist-ssr
*.local
.DS_Store
.env
.env.local
.vite
coverage
.superpowers/
```

```
# .nvmrc
20
```

- [ ] **Step 6: Create minimal `index.html` and `src/main.tsx`, `src/App.tsx`**

```html
<!-- index.html -->
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#FAF7F0" />
    <title>Islamic Viz Hub</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

```tsx
// src/App.tsx
export default function App() {
  return <div style={{ padding: 32 }}>Islamic Viz Hub — scaffold OK.</div>;
}
```

- [ ] **Step 7: Add scripts to `package.json`**

Replace the `"scripts"` block with:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint src --max-warnings 0"
}
```

- [ ] **Step 8: Run `npm run dev` to verify scaffold**

```bash
npm run dev
```
Expected: Vite prints `Local: http://localhost:5173/` and the page renders "Islamic Viz Hub — scaffold OK."
Kill with Ctrl-C.

- [ ] **Step 9: `git init` and initial commit**

```bash
git init
git add .
git commit -m "chore: scaffold Vite + React 19 + TypeScript"
```

---

### Task 2: Install Tailwind + design tokens + @fontsource fonts

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/styles/global.css`, `src/styles/tokens.css`

- [ ] **Step 1: Create `tailwind.config.ts`**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-dim': 'var(--ink-dim)',
        accent: 'var(--accent)',
        'accent-d': 'var(--accent-d)',
        'gold-d': 'var(--gold-d)',
        rule: 'var(--rule)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
      },
      fontFamily: {
        'en-body': ['Inter', 'system-ui', 'sans-serif'],
        'en-display': ['"Instrument Serif"', 'Georgia', 'serif'],
        'ar-body': ['Amiri', 'serif'],
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

- [ ] **Step 2: Create `postcss.config.js`**

```js
// postcss.config.js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 3: Install self-hosted fonts**

```bash
npm install @fontsource/inter @fontsource/instrument-serif @fontsource/amiri @fontsource/scheherazade-new
```

- [ ] **Step 4: Create `src/styles/tokens.css`**

```css
/* src/styles/tokens.css */
:root {
  --bg: #FAF7F0;
  --surface: #FFFFFF;
  --ink: #0F172A;
  --ink-dim: #475569;
  --accent: #0F766E;
  --accent-d: #134E4A;
  --gold-d: #7C5F1E;
  --rule: #E6DFC8;
  --chart-2: #C2410C;
  --chart-3: #6B21A8;
}
```

- [ ] **Step 5: Create `src/styles/global.css`**

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/instrument-serif/400.css';
@import '@fontsource/amiri/400.css';
@import '@fontsource/amiri/700.css';
@import '@fontsource/scheherazade-new/400.css';
@import '@fontsource/scheherazade-new/700.css';

@import './tokens.css';

html { background: var(--bg); color: var(--ink); }
html[lang='en'] body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.65; }
html[lang='ar'] body { font-family: 'Amiri', serif; line-height: 1.85; }

html[lang='en'] h1, html[lang='en'] h2 { font-family: 'Instrument Serif', Georgia, serif; }
html[lang='ar'] h1, html[lang='ar'] h2 { font-family: 'Scheherazade New', Amiri, serif; }

html[dir='rtl'] body { text-align: right; }

a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--accent-d); text-decoration: underline; }
```

- [ ] **Step 6: Verify Tailwind compiles and fonts load**

Update `src/App.tsx`:

```tsx
// src/App.tsx
export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-5xl text-ink mb-4">Islamic Viz Hub</h1>
      <p className="text-ink-dim">Scaffold + Tailwind + tokens OK.</p>
    </div>
  );
}
```

Run `npm run dev`. Expected: cream background, serif h1, teal link colors would appear if any. Fonts load (check Network tab). Kill with Ctrl-C.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: add Tailwind + design tokens + bilingual web fonts"
```

---

### Task 3: Setup Vitest with a smoke test

**Files:**
- Create: `src/test/setup.ts`, `src/lib/__tests__/smoke.test.ts`

- [ ] **Step 1: Create test setup file**

```ts
// src/test/setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 2: Write a smoke test**

```ts
// src/lib/__tests__/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('arithmetic works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3: Run the test suite**

```bash
npm test
```
Expected: 1 passed.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: configure Vitest"
```

---

## Phase 1 — Design system + i18n

### Task 4: Build `format.ts` number/date formatter (TDD)

**Files:**
- Create: `src/lib/format.ts`, `src/lib/__tests__/format.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/__tests__/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatNumber, formatDate } from '../format';

describe('formatNumber', () => {
  it('formats integers with Western digits in EN', () => {
    expect(formatNumber(1234, 'en')).toBe('1,234');
  });

  it('formats integers with Western digits in AR (our v1 choice)', () => {
    expect(formatNumber(1234, 'ar')).toBe('1,234');
  });

  it('formats decimals with two digits by default', () => {
    expect(formatNumber(3.14159, 'en', { maximumFractionDigits: 2 })).toBe('3.14');
  });
});

describe('formatDate', () => {
  it('formats Gregorian date in EN', () => {
    const d = new Date(Date.UTC(2025, 5, 21)); // 2025-06-21
    const out = formatDate(d, 'en', { calendar: 'gregory', year: 'numeric', month: 'long', day: 'numeric' });
    expect(out).toMatch(/June 21, 2025/);
  });

  it('formats Hijri date via Umalqura calendar', () => {
    const d = new Date(Date.UTC(2025, 5, 21));
    const out = formatDate(d, 'en', { calendar: 'islamic-umalqura', year: 'numeric', month: 'long', day: 'numeric' });
    expect(out).toMatch(/1446|1447/); // approximate Hijri year range
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/lib/__tests__/format.test.ts
```
Expected: FAIL with "Cannot find module '../format'".

- [ ] **Step 3: Implement `format.ts`**

```ts
// src/lib/format.ts
export type Lang = 'en' | 'ar';

export function formatNumber(
  n: number,
  _lang: Lang,
  opts: Intl.NumberFormatOptions = {},
): string {
  // v1 choice: Western digits in both languages (see spec §6).
  return new Intl.NumberFormat('en-US', opts).format(n);
}

type FormatDateOpts = Intl.DateTimeFormatOptions & {
  calendar: 'gregory' | 'islamic-umalqura';
};

export function formatDate(
  d: Date,
  lang: Lang,
  opts: FormatDateOpts,
): string {
  const locale = lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US-u-nu-latn';
  return new Intl.DateTimeFormat(locale, opts).format(d);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/lib/__tests__/format.test.ts
```
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/__tests__/format.test.ts
git commit -m "feat(lib): bilingual number and date formatter"
```

---

### Task 5: Build `LangProvider` context

**Files:**
- Create: `src/i18n/LangProvider.tsx`, `src/i18n/useLang.ts`, `src/i18n/chrome.en.json`, `src/i18n/chrome.ar.json`

- [ ] **Step 1: Create chrome dictionaries**

```json
// src/i18n/chrome.en.json
{
  "site.title": "Islamic Viz Hub",
  "site.tagline": "Interactive visualizations of Islamic science",
  "nav.home": "All visualizations",
  "nav.about": "About",
  "viz.back": "← All visualizations",
  "viz.share": "Copy link",
  "viz.methodology": "Methodology",
  "viz.bilingual": "EN ⇄ AR",
  "lang.toggle": "العربية",
  "notfound.title": "Page not found",
  "notfound.body": "The page you were looking for isn't here.",
  "notfound.home": "Go home"
}
```

```json
// src/i18n/chrome.ar.json
{
  "site.title": "مركز التصورات الإسلامية",
  "site.tagline": "تصورات تفاعلية للعلوم الإسلامية",
  "nav.home": "كل التصورات",
  "nav.about": "عن الموقع",
  "viz.back": "كل التصورات →",
  "viz.share": "نسخ الرابط",
  "viz.methodology": "المنهجية",
  "viz.bilingual": "EN ⇄ AR",
  "lang.toggle": "English",
  "notfound.title": "الصفحة غير موجودة",
  "notfound.body": "الصفحة التي كنت تبحث عنها غير موجودة.",
  "notfound.home": "العودة إلى الصفحة الرئيسية"
}
```

- [ ] **Step 2: Create `LangProvider.tsx`**

```tsx
// src/i18n/LangProvider.tsx
import React, { createContext, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import chromeEn from './chrome.en.json';
import chromeAr from './chrome.ar.json';
import { formatNumber, formatDate, type Lang } from '../lib/format';

type Dir = 'ltr' | 'rtl';

export type VizDict = Record<string, unknown>;

type LangContextValue = {
  lang: Lang;
  dir: Dir;
  t: (key: string) => string;
  tn: (n: number, opts?: Intl.NumberFormatOptions) => string;
  td: (d: Date, opts: Intl.DateTimeFormatOptions & { calendar: 'gregory' | 'islamic-umalqura' }) => string;
  setLang: (next: Lang) => void;
  vizDict: VizDict | null;
};

export const LangContext = createContext<LangContextValue | null>(null);

const chrome: Record<Lang, Record<string, string>> = { en: chromeEn, ar: chromeAr };

export function LangProvider({ lang, children, vizDict = null }: { lang: Lang; children: React.ReactNode; vizDict?: VizDict | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dir: Dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  }, [lang, dir]);

  const value = useMemo<LangContextValue>(() => ({
    lang,
    dir,
    t: (key) => chrome[lang][key] ?? key,
    tn: (n, opts) => formatNumber(n, lang, opts),
    td: (d, opts) => formatDate(d, lang, opts),
    setLang: (next) => {
      const nextPath = location.pathname.replace(/^\/(en|ar)(\/|$)/, `/${next}$2`);
      navigate(nextPath + location.search, { replace: false });
    },
    vizDict,
  }), [lang, dir, location, navigate, vizDict]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
```

- [ ] **Step 3: Create `useLang.ts`**

```ts
// src/i18n/useLang.ts
import { useContext } from 'react';
import { LangContext } from './LangProvider';

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n
git commit -m "feat(i18n): LangProvider context with chrome dictionaries"
```

---

### Task 6: Set up React Router with language-prefixed routes

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`
- Create: `src/pages/LangRoot.tsx`, `src/pages/LangRedirect.tsx`, `src/pages/Home.tsx`, `src/pages/About.tsx`, `src/pages/NotFound.tsx`

- [ ] **Step 1: Create placeholder page stubs**

```tsx
// src/pages/Home.tsx
import { useLang } from '../i18n/useLang';
export default function Home() {
  const { t } = useLang();
  return <h1 className="text-5xl">{t('site.title')}</h1>;
}
```

```tsx
// src/pages/About.tsx
import { useLang } from '../i18n/useLang';
export default function About() {
  const { t } = useLang();
  return <h1 className="text-4xl">{t('nav.about')}</h1>;
}
```

```tsx
// src/pages/NotFound.tsx
import { useLang } from '../i18n/useLang';
import { Link } from 'react-router-dom';
export default function NotFound() {
  const { t, lang } = useLang();
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-4xl mb-4">{t('notfound.title')}</h1>
      <p className="text-ink-dim mb-6">{t('notfound.body')}</p>
      <Link to={`/${lang}/`}>{t('notfound.home')}</Link>
    </div>
  );
}
```

- [ ] **Step 2: Create `LangRoot.tsx` — wraps children in `<LangProvider>` based on URL prefix**

```tsx
// src/pages/LangRoot.tsx
import { Outlet, useParams } from 'react-router-dom';
import { LangProvider } from '../i18n/LangProvider';
import type { Lang } from '../lib/format';

export default function LangRoot() {
  const { lang } = useParams<{ lang: string }>();
  const resolved: Lang = lang === 'ar' ? 'ar' : 'en';
  return (
    <LangProvider lang={resolved}>
      <Outlet />
    </LangProvider>
  );
}
```

- [ ] **Step 3: Create `LangRedirect.tsx` — top-level `/` route redirect**

```tsx
// src/pages/LangRedirect.tsx
import { Navigate } from 'react-router-dom';

function detectLang(): 'en' | 'ar' {
  try {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'ar') return stored;
  } catch { /* ignore */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language : '';
  return nav.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export default function LangRedirect() {
  return <Navigate to={`/${detectLang()}/`} replace />;
}
```

- [ ] **Step 4: Replace `src/App.tsx` with the router**

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LangRoot from './pages/LangRoot';
import LangRedirect from './pages/LangRedirect';
import Home from './pages/Home';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LangRedirect />} />
        <Route path=":lang" element={<LangRoot />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```
Manual check: open `http://localhost:5173/` — should redirect to `/en/` (or `/ar/` if browser is Arabic). `http://localhost:5173/ar/` should render the AR title (RTL). `http://localhost:5173/en/about` should render About. `http://localhost:5173/en/garbage` should 404.
Kill with Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(routes): language-prefixed routing with LangProvider"
```

---

### Task 7: Build Layout (Header + Footer + LangToggle + Credit)

**Files:**
- Create: `src/components/Layout/Header.tsx`, `Footer.tsx`, `Container.tsx`, `LangToggle.tsx`, `Credit.tsx`
- Modify: `src/pages/LangRoot.tsx` to include Header + Footer

- [ ] **Step 1: Create `Container.tsx`**

```tsx
// src/components/Layout/Container.tsx
import type { ReactNode } from 'react';
export default function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-4xl mx-auto px-6 ${className}`}>{children}</div>;
}
```

- [ ] **Step 2: Create `LangToggle.tsx`**

```tsx
// src/components/Layout/LangToggle.tsx
import { useLang } from '../../i18n/useLang';

export default function LangToggle() {
  const { lang, setLang, t } = useLang();
  const other = lang === 'en' ? 'ar' : 'en';
  return (
    <button
      onClick={() => setLang(other)}
      aria-label={t('lang.toggle')}
      className="text-sm px-3 py-1 rounded-lg border border-rule text-ink-dim hover:text-accent hover:border-accent transition"
    >
      {t('lang.toggle')}
    </button>
  );
}
```

- [ ] **Step 3: Create `Header.tsx`**

```tsx
// src/components/Layout/Header.tsx
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import Container from './Container';
import LangToggle from './LangToggle';

export default function Header() {
  const { lang, t } = useLang();
  return (
    <header className="border-b border-rule bg-surface/60 backdrop-blur">
      <Container className="py-4 flex items-center justify-between">
        <Link to={`/${lang}/`} className="text-xl text-ink no-underline">
          {t('site.title')}
        </Link>
        <nav className="flex items-center gap-6">
          <Link to={`/${lang}/about`} className="text-sm text-ink-dim hover:text-accent">
            {t('nav.about')}
          </Link>
          <LangToggle />
        </nav>
      </Container>
    </header>
  );
}
```

- [ ] **Step 4: Create `Credit.tsx` (portfolio-standard byline)**

```tsx
// src/components/Layout/Credit.tsx
// Minimal portfolio byline. Swap for the shared <Credit /> component from
// AWS_product_planning/templates/Credit.tsx once it's published (see PLAYBOOK §7).
export default function Credit({ tier = 2 }: { tier?: 1 | 2 | 3 }) {
  const size = tier === 1 ? 'text-sm' : 'text-xs';
  return (
    <span className={`${size} text-ink-dim`}>
      Built by <a href="https://analyticadss.com" className="text-accent">Analytica DSS</a>
    </span>
  );
}
```

- [ ] **Step 5: Create `Footer.tsx`**

```tsx
// src/components/Layout/Footer.tsx
import Container from './Container';
import Credit from './Credit';

export default function Footer() {
  return (
    <footer className="border-t border-rule mt-16 py-8 text-ink-dim">
      <Container className="flex items-center justify-between text-sm">
        <Credit tier={2} />
        <span>© 2026</span>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 6: Wire Layout into `LangRoot.tsx`**

```tsx
// src/pages/LangRoot.tsx
import { Outlet, useParams } from 'react-router-dom';
import { LangProvider } from '../i18n/LangProvider';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import type { Lang } from '../lib/format';

export default function LangRoot() {
  const { lang } = useParams<{ lang: string }>();
  const resolved: Lang = lang === 'ar' ? 'ar' : 'en';
  return (
    <LangProvider lang={resolved}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-10"><Outlet /></main>
        <Footer />
      </div>
    </LangProvider>
  );
}
```

- [ ] **Step 7: Manual verification**

`npm run dev`. Visit `/en/` → header with title and nav links + lang toggle. Click the lang toggle → URL flips to `/ar/`, page flips to RTL, fonts change, labels change. Footer shows credit.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat(ui): Header + Footer + Container + LangToggle + Credit"
```

---

## Phase 2 — Core domain libraries (TDD)

### Task 8: Build `solar.ts` — sun altitude, sunrise, sunset, Fajr angle

**Files:**
- Create: `src/lib/solar.ts`, `src/lib/__tests__/solar.test.ts`

**Reference:** NOAA solar position formulas and Islamic prayer-time formulas from *al-Birjandi* and *University of Islamic Sciences Karachi*. Validation values from `aladhan.com` API for Makkah (21.4225°N, 39.8262°E) using the **Umm al-Qura** method on **2025-06-21**:
- Fajr: 04:25, Sunrise: 05:48, Dhuhr: 12:25, Asr (Shafi'i): 15:45, Maghrib: 19:02, Isha: 20:32.
(These are the oracle values our tests pin to, within ±2 minutes tolerance for calculation variance.)

- [ ] **Step 1: Write failing tests for solar position fundamentals**

```ts
// src/lib/__tests__/solar.test.ts
import { describe, it, expect } from 'vitest';
import {
  dayOfYear, solarDeclination, equationOfTime,
  solarNoon, hourAngle, sunAltitude, sunriseSunset, fajrTime,
} from '../solar';

describe('dayOfYear', () => {
  it('returns 1 for Jan 1', () => {
    expect(dayOfYear(new Date(Date.UTC(2025, 0, 1)))).toBe(1);
  });
  it('returns 172 for Jun 21 (non-leap)', () => {
    expect(dayOfYear(new Date(Date.UTC(2025, 5, 21)))).toBe(172);
  });
});

describe('solarDeclination', () => {
  it('near +23.44° at summer solstice', () => {
    const d = solarDeclination(172);
    expect(d).toBeGreaterThan(23.0);
    expect(d).toBeLessThan(23.5);
  });
  it('near -23.44° at winter solstice', () => {
    const d = solarDeclination(355);
    expect(d).toBeLessThan(-23.0);
    expect(d).toBeGreaterThan(-23.5);
  });
});

describe('sunriseSunset', () => {
  it('Makkah sunrise on 2025-06-21 is ~05:48 local', () => {
    const { sunrise } = sunriseSunset({ lat: 21.4225, lng: 39.8262, tz: 3 }, new Date(Date.UTC(2025, 5, 21)));
    // Expect value close to 5.80 (= 05:48) within ±2 min = ±0.033 hr
    expect(sunrise).toBeGreaterThan(5.77);
    expect(sunrise).toBeLessThan(5.83);
  });
});

describe('fajrTime', () => {
  it('Makkah Fajr on 2025-06-21 with Umm al-Qura (Fajr angle 18.5°) is ~04:25', () => {
    const t = fajrTime({ lat: 21.4225, lng: 39.8262, tz: 3 }, new Date(Date.UTC(2025, 5, 21)), 18.5);
    expect(t).toBeGreaterThan(4.40);
    expect(t).toBeLessThan(4.46);
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm test -- src/lib/__tests__/solar.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `solar.ts`**

> **Reuse note:** The existing `legacy/fajr-sunrise-global.jsx` contains working solar math. Extract, type, and expose as named functions here. Do not rewrite from scratch — port and annotate with references.

```ts
// src/lib/solar.ts
// Solar geometry for Islamic prayer-time calculations.
// References: NOAA solar position (simplified), University of Islamic Sciences Karachi formulas.
// All angles in degrees internally; helpers convert.

const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

export type Location = { lat: number; lng: number; tz: number };

export function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = d.getTime() - start;
  return Math.floor(diff / 86_400_000);
}

/** Solar declination in degrees for a given day-of-year. Spencer approximation. */
export function solarDeclination(n: number): number {
  const g = (2 * Math.PI * (n - 1)) / 365;
  return (
    0.006918
    - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g)
  ) * DEG;
}

/** Equation of time in minutes. */
export function equationOfTime(n: number): number {
  const g = (2 * Math.PI * (n - 1)) / 365;
  return 229.18 * (
    0.000075
    + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g)
  );
}

/** Solar noon in local clock hours (0–24). */
export function solarNoon(loc: Location, d: Date): number {
  const n = dayOfYear(d);
  const eot = equationOfTime(n);
  return 12 + loc.tz - loc.lng / 15 - eot / 60;
}

/** Hour angle in degrees for sun at given altitude (negative). */
export function hourAngle(lat: number, dec: number, altitudeDeg: number): number {
  const h = altitudeDeg * RAD;
  const phi = lat * RAD;
  const delta = dec * RAD;
  const cosH = (Math.sin(h) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
  if (cosH < -1 || cosH > 1) return NaN; // sun never reaches this altitude at this lat/date
  return Math.acos(cosH) * DEG;
}

/** Sun altitude (deg) at a given local clock hour. */
export function sunAltitude(loc: Location, d: Date, localHour: number): number {
  const n = dayOfYear(d);
  const dec = solarDeclination(n) * RAD;
  const noon = solarNoon(loc, d);
  const H = (localHour - noon) * 15 * RAD;
  const phi = loc.lat * RAD;
  const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  return alt * DEG;
}

export function sunriseSunset(loc: Location, d: Date): { sunrise: number; sunset: number } {
  const n = dayOfYear(d);
  const dec = solarDeclination(n);
  const noon = solarNoon(loc, d);
  // Standard refraction: horizon sun = -0.833°
  const H = hourAngle(loc.lat, dec, -0.833) / 15;
  return { sunrise: noon - H, sunset: noon + H };
}

/** Fajr time in local clock hours. angle is the Fajr twilight angle (e.g., 18, 18.5, 19.5). */
export function fajrTime(loc: Location, d: Date, angle: number): number {
  const n = dayOfYear(d);
  const dec = solarDeclination(n);
  const noon = solarNoon(loc, d);
  const H = hourAngle(loc.lat, dec, -angle) / 15;
  return noon - H;
}

/** Isha time (angle-based). Returns NaN if method uses fixed-interval instead. */
export function ishaTime(loc: Location, d: Date, angle: number): number {
  const n = dayOfYear(d);
  const dec = solarDeclination(n);
  const noon = solarNoon(loc, d);
  const H = hourAngle(loc.lat, dec, -angle) / 15;
  return noon + H;
}

/** Asr time. factor = 1 (Shafi'i/Maliki/Hanbali) or 2 (Hanafi). Shadow length = factor + tan(sun-zenith-at-noon). */
export function asrTime(loc: Location, d: Date, factor: 1 | 2): number {
  const n = dayOfYear(d);
  const dec = solarDeclination(n);
  const noon = solarNoon(loc, d);
  const phi = loc.lat * RAD;
  const delta = dec * RAD;
  // Asr altitude: arctan(1 / (factor + tan(|lat - dec|)))
  const t = Math.abs(phi - delta);
  const altAsr = Math.atan(1 / (factor + Math.tan(t))) * DEG;
  const H = hourAngle(loc.lat, dec, altAsr) / 15;
  return noon + H;
}

/** Convert a decimal hour (0–24) to { hh, mm } strings, clamped. */
export function hoursToHHMM(h: number): { hh: string; mm: string } {
  if (!isFinite(h)) return { hh: '--', mm: '--' };
  const norm = ((h % 24) + 24) % 24;
  const hh = Math.floor(norm);
  const mm = Math.round((norm - hh) * 60);
  return { hh: String(hh).padStart(2, '0'), mm: String(mm).padStart(2, '0') };
}
```

- [ ] **Step 4: Run tests — all pass**

```bash
npm test -- src/lib/__tests__/solar.test.ts
```
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/solar.ts src/lib/__tests__/solar.test.ts
git commit -m "feat(lib): solar math (declination, sunrise, fajr, asr)"
```

---

### Task 9: Port `dst.ts` (regional DST rules) from legacy Fajr viz

**Files:**
- Create: `src/lib/dst.ts`, `src/lib/__tests__/dst.test.ts`

- [ ] **Step 1: Extract DST logic from `legacy/fajr-sunrise-global.jsx`**

Open `legacy/fajr-sunrise-global.jsx`. Locate the DST rule functions (search for `dstType` and the `isDST(...)` helper). Copy into a typed module.

- [ ] **Step 2: Write failing tests**

```ts
// src/lib/__tests__/dst.test.ts
import { describe, it, expect } from 'vitest';
import { isDST } from '../dst';

describe('isDST', () => {
  it('US — July is DST', () => {
    expect(isDST('us', new Date(Date.UTC(2025, 6, 15)))).toBe(true);
  });
  it('US — January is not DST', () => {
    expect(isDST('us', new Date(Date.UTC(2025, 0, 15)))).toBe(false);
  });
  it('EU — July is DST', () => {
    expect(isDST('eu', new Date(Date.UTC(2025, 6, 15)))).toBe(true);
  });
  it('none — always false', () => {
    expect(isDST('none', new Date(Date.UTC(2025, 6, 15)))).toBe(false);
  });
  it('south (Chile) — July is NOT DST (southern hemisphere)', () => {
    expect(isDST('south', new Date(Date.UTC(2025, 6, 15)))).toBe(false);
  });
});
```

- [ ] **Step 3: Run — fail**

```bash
npm test -- src/lib/__tests__/dst.test.ts
```

- [ ] **Step 4: Implement `dst.ts`** (port and type from legacy)

```ts
// src/lib/dst.ts
export type DSTRegion = 'us' | 'eu' | 'jordan' | 'palestine' | 'iran' | 'south' | 'none';

function secondSundayOfMarch(y: number) { return nthDowOfMonth(y, 2, 0, 2); }
function firstSundayOfNovember(y: number) { return nthDowOfMonth(y, 10, 0, 1); }
function lastSundayOfMarch(y: number) { return lastDowOfMonth(y, 2, 0); }
function lastSundayOfOctober(y: number) { return lastDowOfMonth(y, 9, 0); }
function firstSundayOfSeptember(y: number) { return nthDowOfMonth(y, 8, 0, 1); }
function firstSundayOfApril(y: number) { return nthDowOfMonth(y, 3, 0, 1); }

function nthDowOfMonth(year: number, month: number, dow: number, n: number): Date {
  const d = new Date(Date.UTC(year, month, 1));
  const offset = (dow - d.getUTCDay() + 7) % 7 + (n - 1) * 7;
  return new Date(Date.UTC(year, month, 1 + offset));
}

function lastDowOfMonth(year: number, month: number, dow: number): Date {
  const d = new Date(Date.UTC(year, month + 1, 0));
  const offset = (d.getUTCDay() - dow + 7) % 7;
  return new Date(Date.UTC(year, month, d.getUTCDate() - offset));
}

export function isDST(region: DSTRegion, date: Date): boolean {
  const y = date.getUTCFullYear();
  const t = date.getTime();
  switch (region) {
    case 'us': {
      const start = secondSundayOfMarch(y).getTime();
      const end = firstSundayOfNovember(y).getTime();
      return t >= start && t < end;
    }
    case 'eu': {
      const start = lastSundayOfMarch(y).getTime();
      const end = lastSundayOfOctober(y).getTime();
      return t >= start && t < end;
    }
    case 'south': {
      const end = firstSundayOfApril(y).getTime();
      const start = firstSundayOfSeptember(y).getTime();
      return t < end || t >= start;
    }
    case 'iran':
      // Iran abolished DST in 2022.
      return false;
    case 'jordan':
    case 'palestine':
      // Simplified: EU rules. Actual rules vary slightly by year.
      return isDST('eu', date);
    case 'none':
    default:
      return false;
  }
}
```

- [ ] **Step 5: Run — all pass**

- [ ] **Step 6: Commit**

```bash
git add src/lib/dst.ts src/lib/__tests__/dst.test.ts
git commit -m "feat(lib): regional DST rules (ported from legacy)"
```

---

### Task 10: Create cities data + calculation methods data

**Files:**
- Create: `src/data/cities.ts`, `src/data/calc-methods.ts`

- [ ] **Step 1: Extract cities from legacy Fajr viz**

Open `legacy/fajr-sunrise-global.jsx`. Copy the `CITIES` array. Type it and save to `src/data/cities.ts`.

```ts
// src/data/cities.ts
import type { DSTRegion } from '../lib/dst';

export type City = {
  name: string;      // English display name, e.g., "Makkah, Saudi Arabia"
  nameAr?: string;   // Optional Arabic name (populate in Task 18 or later)
  lat: number;
  lng: number;
  tz: number;        // base UTC offset (pre-DST)
  dstType: DSTRegion;
};

export const CITIES: City[] = [
  // ... (paste the full array from legacy/fajr-sunrise-global.jsx)
  // NOTE: the legacy array is 70+ cities with { name, lat, lng, tz, dstType }. Type cast `dstType` to DSTRegion. No other changes.
];
```

- [ ] **Step 2: Create calculation-methods data**

```ts
// src/data/calc-methods.ts
// Standard Islamic prayer-time calculation methods.
// Sources: praytimes.org, University of Islamic Sciences Karachi, Umm al-Qura, ISNA.

export type IshaMode = { kind: 'angle'; angle: number } | { kind: 'interval'; minutes: number };

export type CalcMethod = {
  id: string;
  labelEn: string;
  labelAr: string;
  fajrAngle: number;       // degrees below horizon
  ishaMode: IshaMode;
  notes?: string;
};

export const CALC_METHODS: CalcMethod[] = [
  { id: 'mwl',   labelEn: 'Muslim World League',         labelAr: 'رابطة العالم الإسلامي', fajrAngle: 18,   ishaMode: { kind: 'angle', angle: 17 } },
  { id: 'isna',  labelEn: 'ISNA (North America)',        labelAr: 'الجمعية الإسلامية',    fajrAngle: 15,   ishaMode: { kind: 'angle', angle: 15 } },
  { id: 'umm',   labelEn: 'Umm al-Qura (Makkah)',        labelAr: 'أم القرى',              fajrAngle: 18.5, ishaMode: { kind: 'interval', minutes: 90 } },
  { id: 'egypt', labelEn: 'Egyptian General Authority',  labelAr: 'الهيئة المصرية',        fajrAngle: 19.5, ishaMode: { kind: 'angle', angle: 17.5 } },
  { id: 'karachi', labelEn: 'Karachi (Univ. Islamic Sci.)', labelAr: 'كراتشي',             fajrAngle: 18,   ishaMode: { kind: 'angle', angle: 18 } },
  { id: 'tehran', labelEn: 'Tehran (Institute of Geophysics)', labelAr: 'طهران',           fajrAngle: 17.7, ishaMode: { kind: 'angle', angle: 14 } },
  { id: 'jafari', labelEn: 'Shia Ithna-Ashari (Jafari)', labelAr: 'الجعفري',              fajrAngle: 16,   ishaMode: { kind: 'angle', angle: 14 } },
];

export function getMethod(id: string): CalcMethod {
  return CALC_METHODS.find((m) => m.id === id) ?? CALC_METHODS[0];
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data
git commit -m "feat(data): cities list (70+) and calc methods"
```

---

### Task 11: Build `hijri.ts` — Umalqura date helpers

**Files:**
- Create: `src/lib/hijri.ts`, `src/lib/__tests__/hijri.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/__tests__/hijri.test.ts
import { describe, it, expect } from 'vitest';
import { gregorianToHijri, ramadanStart } from '../hijri';

describe('gregorianToHijri', () => {
  it('converts 2025-06-21 to ~1446 AH', () => {
    const h = gregorianToHijri(new Date(Date.UTC(2025, 5, 21)));
    expect(h.year).toBeGreaterThanOrEqual(1446);
    expect(h.year).toBeLessThanOrEqual(1447);
    expect(h.month).toBeGreaterThanOrEqual(1);
    expect(h.month).toBeLessThanOrEqual(12);
  });
});

describe('ramadanStart', () => {
  it('returns a Gregorian date that falls in early 2025 for Hijri 1446', () => {
    const d = ramadanStart(1446);
    expect(d.getUTCFullYear()).toBe(2025);
    expect(d.getUTCMonth()).toBeGreaterThanOrEqual(1); // Feb–Mar range
    expect(d.getUTCMonth()).toBeLessThanOrEqual(2);
  });
  it('drifts ~11 days earlier for Hijri 1447 vs 1446', () => {
    const d1 = ramadanStart(1446);
    const d2 = ramadanStart(1447);
    const diffDays = (d1.getTime() - d2.getTime()) / 86400000;
    expect(diffDays).toBeGreaterThan(9);
    expect(diffDays).toBeLessThan(13);
  });
});
```

- [ ] **Step 2: Run — fail**

```bash
npm test -- src/lib/__tests__/hijri.test.ts
```

- [ ] **Step 3: Implement `hijri.ts`**

```ts
// src/lib/hijri.ts
// Thin wrapper over Intl Umalqura calendar.

export type HijriDate = { year: number; month: number; day: number };

const parts = (d: Date) =>
  new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC',
  }).formatToParts(d).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});

export function gregorianToHijri(d: Date): HijriDate {
  const p = parts(d);
  return { year: parseInt(p.year, 10), month: parseInt(p.month, 10), day: parseInt(p.day, 10) };
}

/** Find the Gregorian date of 1 Ramadan for a given Hijri year by binary-searching over Jan 1 ± 2 years. */
export function ramadanStart(hYear: number): Date {
  // Ramadan is month 9. Search window: ~2 Gregorian years around the expected Gregorian year.
  // Approximate Gregorian year: hYear * 0.970229 + 621.5643 (per standard conversion).
  const approxGYear = Math.floor(hYear * 0.970229 + 621.5643);
  const start = new Date(Date.UTC(approxGYear - 1, 0, 1));
  const end = new Date(Date.UTC(approxGYear + 1, 11, 31));
  for (let t = start.getTime(); t <= end.getTime(); t += 86_400_000) {
    const d = new Date(t);
    const h = gregorianToHijri(d);
    if (h.year === hYear && h.month === 9 && h.day === 1) return d;
  }
  throw new Error(`Could not find Ramadan start for Hijri year ${hYear}`);
}
```

- [ ] **Step 4: Run — all pass**

- [ ] **Step 5: Commit**

```bash
git add src/lib/hijri.ts src/lib/__tests__/hijri.test.ts
git commit -m "feat(lib): Hijri (Umalqura) date helpers"
```

---

### Task 12: Build `qibla.ts` — great-circle bearing + path

**Files:**
- Create: `src/lib/qibla.ts`, `src/lib/__tests__/qibla.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/__tests__/qibla.test.ts
import { describe, it, expect } from 'vitest';
import { qiblaBearing, greatCirclePath } from '../qibla';

const MAKKAH = { lat: 21.4225, lng: 39.8262 };

describe('qiblaBearing', () => {
  it('from Makkah to Makkah is undefined/0', () => {
    const b = qiblaBearing(MAKKAH);
    expect(Number.isNaN(b) || b === 0).toBe(true);
  });
  it('from NYC (40.71, -74.01) is ~58° (NE)', () => {
    const b = qiblaBearing({ lat: 40.7128, lng: -74.006 });
    expect(b).toBeGreaterThan(55);
    expect(b).toBeLessThan(62);
  });
  it('from Jakarta (-6.17, 106.85) is ~295° (WNW)', () => {
    const b = qiblaBearing({ lat: -6.175, lng: 106.845 });
    expect(b).toBeGreaterThan(290);
    expect(b).toBeLessThan(300);
  });
});

describe('greatCirclePath', () => {
  it('returns N+1 points from origin to Makkah', () => {
    const pts = greatCirclePath({ lat: 40.7128, lng: -74.006 }, MAKKAH, 32);
    expect(pts.length).toBe(33);
    expect(pts[0]).toEqual({ lat: 40.7128, lng: -74.006 });
    expect(pts[32].lat).toBeCloseTo(MAKKAH.lat, 2);
    expect(pts[32].lng).toBeCloseTo(MAKKAH.lng, 2);
  });
});
```

- [ ] **Step 2: Run — fail**

```bash
npm test -- src/lib/__tests__/qibla.test.ts
```

- [ ] **Step 3: Implement `qibla.ts`**

```ts
// src/lib/qibla.ts
// Qibla bearing + great-circle path interpolation.
// Formulas from Aviation Formulary (E. Williams, http://www.edwilliams.org/avform.htm).

const MAKKAH = { lat: 21.4225, lng: 39.8262 };
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export type LatLng = { lat: number; lng: number };

/** Initial great-circle bearing from origin to Makkah, in degrees 0..360 (N = 0). */
export function qiblaBearing(origin: LatLng): number {
  const φ1 = origin.lat * RAD;
  const φ2 = MAKKAH.lat * RAD;
  const Δλ = (MAKKAH.lng - origin.lng) * RAD;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x) * DEG;
  return ((θ + 360) % 360);
}

/** N+1 points along the great-circle from a to b, inclusive. */
export function greatCirclePath(a: LatLng, b: LatLng, segments = 64): LatLng[] {
  const φ1 = a.lat * RAD, λ1 = a.lng * RAD;
  const φ2 = b.lat * RAD, λ2 = b.lng * RAD;
  const Δ = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
  ));
  if (Δ === 0) return Array(segments + 1).fill({ lat: a.lat, lng: a.lng });
  const pts: LatLng[] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * Δ) / Math.sin(Δ);
    const B = Math.sin(f * Δ) / Math.sin(Δ);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);
    pts.push({ lat: φ * DEG, lng: λ * DEG });
  }
  return pts;
}

export const MAKKAH_COORDS: LatLng = MAKKAH;
```

- [ ] **Step 4: Run — all pass**

- [ ] **Step 5: Commit**

```bash
git add src/lib/qibla.ts src/lib/__tests__/qibla.test.ts
git commit -m "feat(lib): qibla bearing + great-circle path"
```

---

## Phase 3 — Visualization registry + shared VizPage shell

### Task 13: Define visualization registry types

**Files:**
- Create: `src/data/visualizations.ts`, `src/components/Chip.tsx`, `src/components/Disclosure.tsx`

- [ ] **Step 1: Create `Chip.tsx`**

```tsx
// src/components/Chip.tsx
export default function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs uppercase tracking-[0.08em] font-semibold px-2 py-1 rounded-lg bg-[rgba(15,118,110,0.08)] text-accent">
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Create `Disclosure.tsx`**

```tsx
// src/components/Disclosure.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Disclosure({ summary, children }: { summary: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-rule mt-8 pt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-ink-dim hover:text-accent"
        aria-expanded={open}
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {summary}
      </button>
      {open && <div className="mt-4 prose prose-sm text-ink-dim max-w-none">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Install Lucide**

```bash
npm install lucide-react
```

- [ ] **Step 4: Create visualization registry**

```ts
// src/data/visualizations.ts
import type { ComponentType } from 'react';

export type VizSlug = 'fajr-globe' | 'fasting-hours' | 'hijri-drift' | 'sun-path-asr' | 'qibla-great-circle';

export type VizConfig = {
  slug: VizSlug;
  tag: string;                       // e.g., 'astronomy' — key into chrome dict, not displayed raw
  Chart: ComponentType;              // the viz itself; reads its own state internally
};

// Populated as each viz lands.
export const VISUALIZATIONS: Record<VizSlug, VizConfig | null> = {
  'fajr-globe': null,
  'fasting-hours': null,
  'hijri-drift': null,
  'sun-path-asr': null,
  'qibla-great-circle': null,
};

export const VIZ_ORDER: VizSlug[] = [
  'fajr-globe',
  'fasting-hours',
  'hijri-drift',
  'sun-path-asr',
  'qibla-great-circle',
];
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(data): viz registry + Chip/Disclosure components"
```

---

### Task 14: Build shared `VizPage` shell

**Files:**
- Create: `src/pages/VizPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `VizPage.tsx`**

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

// Load all viz content JSON at build time. Vite resolves this statically.
const contentModules = import.meta.glob('../viz/*/content.{en,ar}.json', { eager: true }) as Record<string, { default: VizContent }>;

function loadContent(slug: VizSlug, lang: 'en' | 'ar'): VizContent | null {
  const key = `../viz/${slug}/content.${lang}.json`;
  return contentModules[key]?.default ?? null;
}

export default function VizPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLang();
  const config = slug && slug in VISUALIZATIONS ? VISUALIZATIONS[slug as VizSlug] : null;

  if (!config) {
    return <Container><h1 className="text-4xl mt-8">{t('notfound.title')}</h1></Container>;
  }

  const content = loadContent(config.slug, lang);
  if (!content) {
    return <Container><h1 className="text-4xl mt-8">Content missing for {config.slug}</h1></Container>;
  }

  const Chart = config.Chart;

  return (
    <Container>
      <div className="mb-6">
        <Chip>{content.tag}</Chip>
      </div>
      <h1 className="text-5xl mb-3">{content.title}</h1>
      <p className="text-ink-dim text-lg mb-8">{content.subtitle}</p>

      <div className="bg-surface rounded-2xl border border-rule p-4 mb-8">
        <Chart />
      </div>

      <div className="prose prose-lg max-w-none text-ink">
        {content.explainer.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </div>

      <Disclosure summary={t('viz.methodology')}>
        {content.methodology.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </Disclosure>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-rule text-sm">
        <Link to={`/${lang}/`} className="text-accent">{t('viz.back')}</Link>
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Wire `/v/:slug` route into `App.tsx`**

```tsx
// src/App.tsx  — add the import and the route inside the `:lang` route group
import VizPage from './pages/VizPage';

// ... inside <Route path=":lang" element={<LangRoot />}>
<Route path="v/:slug" element={<VizPage />} />
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(page): shared VizPage shell with bilingual content loading"
```

---

### Task 15: Build Home page tile grid

**Files:**
- Modify: `src/pages/Home.tsx`
- Create: `src/components/VizCard.tsx`

- [ ] **Step 1: Create `VizCard.tsx`**

```tsx
// src/components/VizCard.tsx
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/useLang';
import type { VizSlug } from '../data/visualizations';
import Chip from './Chip';

type VizCardProps = {
  slug: VizSlug;
  title: string;
  subtitle: string;
  tag: string;
};

export default function VizCard({ slug, title, subtitle, tag }: VizCardProps) {
  const { lang } = useLang();
  return (
    <Link
      to={`/${lang}/v/${slug}`}
      className="block bg-surface rounded-2xl border border-rule p-6 hover:shadow-md transition no-underline text-ink"
    >
      <div className="mb-3"><Chip>{tag}</Chip></div>
      <h3 className="text-2xl mb-2">{title}</h3>
      <p className="text-ink-dim text-sm">{subtitle}</p>
    </Link>
  );
}
```

- [ ] **Step 2: Rewrite `Home.tsx`**

```tsx
// src/pages/Home.tsx
import { useLang } from '../i18n/useLang';
import Container from '../components/Layout/Container';
import VizCard from '../components/VizCard';
import { VIZ_ORDER, VISUALIZATIONS } from '../data/visualizations';

const contentModules = import.meta.glob('../viz/*/content.{en,ar}.json', { eager: true }) as Record<string, { default: { title: string; subtitle: string; tag: string } }>;

export default function Home() {
  const { t, lang } = useLang();
  return (
    <Container>
      <header className="text-center mb-12 mt-6">
        <h1 className="text-6xl mb-4">{t('site.title')}</h1>
        <p className="text-ink-dim text-xl">{t('site.tagline')}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(page): Home tile grid of published viz"
```

---

## Phase 4 — Viz #1: Fajr Globe (port)

### Task 16: Port Fajr Globe into `src/viz/fajr-globe/`

**Files:**
- Create: `src/viz/fajr-globe/FajrGlobe.tsx`, `src/viz/fajr-globe/content.en.json`, `src/viz/fajr-globe/content.ar.json`
- Modify: `src/data/visualizations.ts`

**Reference:** `legacy/fajr-sunrise-global.jsx` (394 lines). Port the UI, replace DST logic with `../../lib/dst.ts`, replace solar math with `../../lib/solar.ts`, replace cities with `../../data/cities.ts`, replace method with `../../data/calc-methods.ts`.

- [ ] **Step 1: Install recharts**

```bash
npm install recharts
```

- [ ] **Step 2: Port the component — strip Tailwind-unfriendly inline styles, use design tokens**

```tsx
// src/viz/fajr-globe/FajrGlobe.tsx
import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CITIES } from '../../data/cities';
import { CALC_METHODS, getMethod } from '../../data/calc-methods';
import { sunriseSunset, fajrTime } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { hoursToHHMM } from '../../lib/solar';
import { useLang } from '../../i18n/useLang';

export default function FajrGlobe() {
  const { lang, t } = useLang();
  const [cityIdx, setCityIdx] = useState(() => CITIES.findIndex((c) => c.name.startsWith('Makkah')));
  const [methodId, setMethodId] = useState('umm');
  const city = CITIES[cityIdx];
  const method = getMethod(methodId);

  const data = useMemo(() => {
    const out: Array<{ day: number; fajr: number; sunrise: number; gap: number }> = [];
    for (let n = 1; n <= 365; n++) {
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(city.dstType, d) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const { sunrise } = sunriseSunset(loc, d);
      const fajr = fajrTime(loc, d, method.fajrAngle);
      out.push({ day: n, fajr, sunrise, gap: sunrise - fajr });
    }
    return out;
  }, [city, method]);

  const cityLabel = lang === 'ar' && city.nameAr ? city.nameAr : city.name;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">{/* controls label from content */}City</span>
          <select
            value={cityIdx}
            onChange={(e) => setCityIdx(parseInt(e.target.value, 10))}
            className="border border-rule rounded-lg px-2 py-1 bg-surface"
          >
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">Method</span>
          <select
            value={methodId}
            onChange={(e) => setMethodId(e.target.value)}
            className="border border-rule rounded-lg px-2 py-1 bg-surface"
          >
            {CALC_METHODS.map((m) => (
              <option key={m.id} value={m.id}>{lang === 'ar' ? m.labelAr : m.labelEn}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="text-sm text-ink-dim mb-2">{cityLabel}</div>

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis dataKey="day" tickFormatter={(d) => String(d)} stroke="var(--ink-dim)" />
            <YAxis
              domain={[0, 8]}
              tickFormatter={(h) => {
                const { hh, mm } = hoursToHHMM(h);
                return `${hh}:${mm}`;
              }}
              stroke="var(--ink-dim)"
            />
            <Tooltip
              formatter={(v: number) => {
                const { hh, mm } = hoursToHHMM(v);
                return `${hh}:${mm}`;
              }}
              labelFormatter={(d) => `Day ${d}`}
            />
            <Area type="monotone" dataKey="fajr" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} />
            <Area type="monotone" dataKey="sunrise" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.05} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

> **Note:** This is the minimal port. Controls labels come from `content.<lang>.json` in step 3 via `useLang`'s `vizDict` (wire in step 4). For now they're English-hardcoded strings; fix in step 4.

- [ ] **Step 3: Write `content.en.json` and `content.ar.json`**

```json
// src/viz/fajr-globe/content.en.json
{
  "title": "Fajr Around the World",
  "subtitle": "How dawn's earliest threshold shifts by latitude and season",
  "tag": "astronomy",
  "controls": { "city": "City", "method": "Calculation method" },
  "explainer": [
    { "type": "p", "text": "Fajr is defined by a specific solar depression below the horizon — a threshold of the night sky's darkness, not clock time. As the Earth tilts through the year, this threshold lands at wildly different hours across latitudes. The chart above traces Fajr (teal) and sunrise (orange) through all 365 days of the Gregorian year for the city you select." },
    { "type": "p", "text": "Two patterns dominate. First: the further you are from the equator, the larger the annual swing — Oslo's Fajr varies by more than five hours between June and December, while Singapore's barely moves. Second: the gap between Fajr and sunrise (the window in which Fajr prayer is valid) narrows in summer and widens in winter — a seasonal breathing that's hard to see from a single city's prayer timetable." },
    { "type": "p", "text": "The calculation method you pick matters. Umm al-Qura uses an 18.5° Fajr angle calibrated for Makkah. ISNA uses 15°, which shifts Fajr noticeably later in the northern hemisphere's winter. The method disclosure below explains what each number means." }
  ],
  "methodology": [
    { "type": "p", "text": "Solar declination and equation of time are computed with Spencer's approximation (published in NOAA's reference implementation). Fajr is computed as the solar hour angle at which the sun is at the chosen negative altitude (e.g., -18.5° for Umm al-Qura). DST is applied using per-region rules: US and EU follow their standard transition dates; Iran abolished DST in 2022 and is not adjusted; Jordan and Palestine approximate EU rules." },
    { "type": "p", "text": "At high latitudes above ~48° in summer, twilight never fully ends and formulaic Fajr may not be defined. The chart clamps to 0–8 hours and uses NaN handling in the solar library — extreme polar cases render as gaps." }
  ]
}
```

```json
// src/viz/fajr-globe/content.ar.json
{
  "title": "الفجر حول العالم",
  "subtitle": "كيف تتغير عتبة الفجر بتغير خط العرض والفصل",
  "tag": "astronomy",
  "controls": { "city": "المدينة", "method": "طريقة الحساب" },
  "explainer": [
    { "type": "p", "text": "يُعرَّف وقت الفجر بانخفاض الشمس تحت الأفق بزاوية محددة، لا بساعة معينة من الليل. ومع ميل الأرض خلال السنة، تقع هذه العتبة عند ساعات متباينة حسب خط العرض. يتتبع الرسم أعلاه وقت الفجر (باللون الأخضر) والشروق (بالبرتقالي) لكل يوم من أيام السنة في المدينة التي تختارها." },
    { "type": "p", "text": "يحكم المشهدَ نمطان: أولًا، كلما ابتعدنا عن خط الاستواء اتسع التذبذب السنوي — فأوسلو يتراوح فجرها أكثر من خمس ساعات بين يونيو وديسمبر، بينما تكاد سنغافورة لا تتحرك. ثانيًا، تضيق الفجوة بين الفجر والشروق صيفًا وتتسع شتاءً، فيبدو اتساع نافذة صلاة الفجر وتنفسها على مدار السنة." },
    { "type": "p", "text": "تحدث طريقة الحساب فارقًا: أم القرى تستخدم زاوية 18.5° مُعايَرة لمكة، بينما تستخدم الـISNA زاوية 15°، ما يؤخر الفجر بشكل ملحوظ في شتاء نصف الكرة الشمالي. وتُفصِّل المنهجية أدناه معنى كل رقم." }
  ],
  "methodology": [
    { "type": "p", "text": "يُحسب الميل الشمسي ومعادلة الزمن بتقريب سبنسر المعتمد في مرجعية NOAA. ويُحسب الفجر بزاوية الساعة الشمسية عند الارتفاع السالب المختار (مثلًا -18.5° لأم القرى). ويُطبَّق التوقيت الصيفي بقواعد إقليمية: الولايات المتحدة والاتحاد الأوروبي وفق تواريخهما المعتادة، ولا يُطبَّق على إيران بعد إلغائه عام 2022، ويُقرَّب الأردن وفلسطين إلى قواعد الاتحاد الأوروبي." },
    { "type": "p", "text": "عند خطوط العرض العليا (فوق ~48°) في الصيف، قد لا ينتهي الشفق ليلًا فعليًا، فلا يُعرَّف الفجر حسابيًا. يحصر الرسم القيم بين 0 و8 ساعات، وتظهر الحالات القطبية المتطرفة كفراغات." }
  ]
}
```

- [ ] **Step 4: Wire Arabic/English control labels via content JSON**

Update `FajrGlobe.tsx`:

```tsx
// at top:
import contentEn from './content.en.json';
import contentAr from './content.ar.json';
// ...
// inside component:
const dict = lang === 'ar' ? contentAr : contentEn;
// replace hardcoded "City" with {dict.controls.city}, "Method" with {dict.controls.method}
```

- [ ] **Step 5: Register the viz**

```ts
// src/data/visualizations.ts  — replace the 'fajr-globe' line:
import FajrGlobe from '../viz/fajr-globe/FajrGlobe';

export const VISUALIZATIONS: Record<VizSlug, VizConfig | null> = {
  'fajr-globe': { slug: 'fajr-globe', tag: 'astronomy', Chart: FajrGlobe },
  'fasting-hours': null,
  'hijri-drift': null,
  'sun-path-asr': null,
  'qibla-great-circle': null,
};
```

- [ ] **Step 6: Visual verification**

`npm run dev`. Visit `/en/`. See one card: "Fajr Around the World." Click → viz page renders chart, controls, explainer. Switch city and method — chart updates. Toggle to `/ar/` — everything flips to Arabic, RTL, Scheherazade New for h1.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(viz): Fajr Globe — ported from legacy with bilingual content"
```

---

## Phase 5 — Viz #2: Fasting Hours

### Task 17: Build Fasting Hours viz

**Files:**
- Create: `src/viz/fasting-hours/FastingHours.tsx`, `content.en.json`, `content.ar.json`
- Modify: `src/data/visualizations.ts`

- [ ] **Step 1: Build the component**

```tsx
// src/viz/fasting-hours/FastingHours.tsx
import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CITIES } from '../../data/cities';
import { sunriseSunset, fajrTime } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

// Fasting hours = (maghrib - fajr) — treating maghrib as sunset for simplicity.
export default function FastingHours() {
  const { lang } = useLang();
  const [cityIdx, setCityIdx] = useState(() => CITIES.findIndex((c) => c.name.startsWith('Makkah')));
  const city = CITIES[cityIdx];
  const dict = lang === 'ar' ? contentAr : contentEn;

  const data = useMemo(() => {
    const out: Array<{ day: number; hours: number }> = [];
    for (let n = 1; n <= 365; n++) {
      const d = new Date(Date.UTC(2025, 0, n));
      const dstOffset = isDST(city.dstType, d) ? 1 : 0;
      const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
      const { sunset } = sunriseSunset(loc, d);
      const fajr = fajrTime(loc, d, 18.5);
      const hours = isFinite(fajr) && isFinite(sunset) ? sunset - fajr : NaN;
      out.push({ day: n, hours });
    }
    return out;
  }, [city]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">{dict.controls.city}</span>
          <select
            value={cityIdx}
            onChange={(e) => setCityIdx(parseInt(e.target.value, 10))}
            className="border border-rule rounded-lg px-2 py-1 bg-surface"
          >
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis dataKey="day" stroke="var(--ink-dim)" />
            <YAxis domain={[0, 24]} stroke="var(--ink-dim)" />
            <Tooltip
              formatter={(v: number) => `${v.toFixed(1)} hrs`}
              labelFormatter={(d) => `Day ${d}`}
            />
            <Area type="monotone" dataKey="hours" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `content.en.json`**

```json
// src/viz/fasting-hours/content.en.json
{
  "title": "Fasting Hours Around the World",
  "subtitle": "Daily fast length, from the tropics to the poles",
  "tag": "astronomy",
  "controls": { "city": "City" },
  "explainer": [
    { "type": "p", "text": "A daily fast begins at Fajr and ends at Maghrib. Because both are keyed to the sun, the length of the fast is entirely a function of latitude and day of year. The chart above shows hours of fasting across 365 days for your chosen city." },
    { "type": "p", "text": "Equatorial cities barely move — Singapore's fast hovers near 13 hours year-round. Temperate cities swing 5–7 hours across the year. Near the polar circle, the chart breaks: above ~66° latitude in midsummer, sunset doesn't come before Fajr the next morning. This is why communities in Arctic cities follow customs like aligning with Makkah's timing or the nearest moderate-latitude city." },
    { "type": "p", "text": "The chart uses an 18.5° Fajr angle (Umm al-Qura) and standard sunset for Maghrib. Other methods shift the curve by 15–30 minutes but preserve the shape." }
  ],
  "methodology": [
    { "type": "p", "text": "Fajr uses a -18.5° sun altitude threshold; Maghrib uses the standard -0.833° sunset (including atmospheric refraction). DST is applied per regional rules. At latitudes where the sun does not dip far enough below the horizon for formal Fajr calculation, values are plotted as gaps." }
  ]
}
```

- [ ] **Step 3: Write `content.ar.json`**

```json
// src/viz/fasting-hours/content.ar.json
{
  "title": "ساعات الصيام حول العالم",
  "subtitle": "طول اليوم الصائم من خط الاستواء إلى القطب",
  "tag": "astronomy",
  "controls": { "city": "المدينة" },
  "explainer": [
    { "type": "p", "text": "يبدأ الصوم بالفجر وينتهي بالمغرب، وكلاهما معلَّق بالشمس، فطول الصوم دالةٌ على خط العرض واليوم من السنة. يبين الرسم أعلاه ساعات الصيام عبر 365 يومًا في المدينة المختارة." },
    { "type": "p", "text": "تبقى المدن الاستوائية ثابتة تقريبًا — ساعات سنغافورة تدور حول 13 ساعة طوال السنة. وتتأرجح المدن المعتدلة 5–7 ساعات عبر السنة. أما قرب الدائرة القطبية، فيتكسر المنحنى: فوق ~66° في منتصف الصيف لا يحل المغرب قبل فجر اليوم التالي. ولهذا يلجأ المسلمون في مدن القطب إلى ضبط أوقاتهم بمكة أو بأقرب مدينة ذات توقيت معتدل." },
    { "type": "p", "text": "يستخدم الرسم زاوية فجر 18.5° (أم القرى) وغروبًا قياسيًا للمغرب. تزيح الطرق الأخرى المنحنى 15–30 دقيقة لكن شكله يبقى." }
  ],
  "methodology": [
    { "type": "p", "text": "يُحسب الفجر عند ارتفاع شمسي -18.5°، والمغرب عند -0.833° القياسي (شاملًا الانكسار الجوي). ويُطبَّق التوقيت الصيفي بقواعد إقليمية. أما في خطوط العرض التي لا تهبط فيها الشمس بالقدر الكافي لحساب الفجر، فتظهر القيم كفراغات في الرسم." }
  ]
}
```

- [ ] **Step 4: Register the viz**

```ts
// src/data/visualizations.ts — add
import FastingHours from '../viz/fasting-hours/FastingHours';

// ...
'fasting-hours': { slug: 'fasting-hours', tag: 'astronomy', Chart: FastingHours },
```

- [ ] **Step 5: Verify + commit**

`npm run dev` → Home shows 2 cards. Open Fasting Hours for Oslo → see the polar cliff. Switch to `/ar/` → Arabic.

```bash
git add .
git commit -m "feat(viz): Fasting Hours globe"
```

---

## Phase 6 — Viz #3: Hijri Drift

### Task 18: Build Hijri Drift timeline viz

**Files:**
- Create: `src/viz/hijri-drift/HijriDrift.tsx`, `content.en.json`, `content.ar.json`
- Modify: `src/data/visualizations.ts`

- [ ] **Step 1: Build the component**

```tsx
// src/viz/hijri-drift/HijriDrift.tsx
import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ramadanStart } from '../../lib/hijri';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const START_H_YEAR = 1445;
const END_H_YEAR = 1478; // ~2054 Gregorian — full retrograde cycle plus change

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
      } catch { /* ignore */ }
    }
    return pts;
  }, []);

  const seasonTicks = [1, 80, 172, 266, 355]; // Jan 1, ~spring, summer solstice, autumn, winter solstice
  const seasonLabels = lang === 'ar'
    ? ['يناير', 'الربيع', 'الصيف', 'الخريف', 'الشتاء']
    : ['Jan 1', 'Spring', 'Summer', 'Autumn', 'Winter'];

  return (
    <div>
      <div className="text-sm text-ink-dim mb-3">{dict.subtitle}</div>
      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 24 }}>
            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" />
            <XAxis type="number" dataKey="gYear" domain={['auto', 'auto']} stroke="var(--ink-dim)" label={{ value: dict.axes.x, position: 'insideBottom', offset: -8, fill: 'var(--ink-dim)' }} />
            <YAxis type="number" dataKey="dayOfYear" domain={[0, 366]} ticks={seasonTicks} tickFormatter={(t) => seasonLabels[seasonTicks.indexOf(t)] ?? ''} stroke="var(--ink-dim)" reversed />
            <Tooltip
              formatter={(v: number, name: string) => name === 'dayOfYear' ? `Day ${v}` : v}
              labelFormatter={(l) => `Gregorian ${l}`}
            />
            <ReferenceLine y={172} stroke="var(--chart-2)" strokeDasharray="3 3" />
            <Scatter data={data} fill="var(--accent)" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write content**

```json
// src/viz/hijri-drift/content.en.json
{
  "title": "The Drifting Hijri Calendar",
  "subtitle": "Ramadan's walk through the seasons, 1445 AH onward",
  "tag": "calendar",
  "explainer": [
    { "type": "p", "text": "The Hijri lunar year is about 354 days — 11 days shorter than the Gregorian solar year. Each Hijri month therefore drifts backward through the Gregorian calendar at roughly the same rate. Each dot above is one year of Ramadan: horizontal axis is the Gregorian year, vertical axis is the day within that year when Ramadan begins." },
    { "type": "p", "text": "Read the plot top to bottom to see the retrograde drift: a dot high up means Ramadan falls in summer; a dot low down means winter. Over about 33 Gregorian years, Ramadan completes one full loop through the seasons. The dashed line marks the summer solstice — the most demanding fast in the northern hemisphere." },
    { "type": "p", "text": "Compare this to the Gregorian calendar, which is fixed to the sun. The Hijri calendar is fixed to the moon. The offset is deliberate — the lunar month is short enough that any month of the year falls in every season over a lifetime, which was the intent." }
  ],
  "methodology": [
    { "type": "p", "text": "Ramadan start dates are computed via the Umm al-Qura astronomical calendar via the browser's Intl.DateTimeFormat with calendar 'islamic-umalqura'. The Umm al-Qura calendar is the official calendar of Saudi Arabia and is supported in V8 and modern JavaScript engines for Hijri years roughly 1300–1500 (covers ~1882–2077 CE). Actual observed crescent sightings may differ by a day in either direction — the Umm al-Qura calendar is an astronomical predictor, not a substitute for local moonsighting." }
  ],
  "axes": { "x": "Gregorian year", "y": "Day of year" }
}
```

```json
// src/viz/hijri-drift/content.ar.json
{
  "title": "الهجري المتحرك",
  "subtitle": "مسار رمضان عبر الفصول من 1445هـ وما بعد",
  "tag": "calendar",
  "explainer": [
    { "type": "p", "text": "السنة القمرية الهجرية نحو 354 يومًا، أقصر من الميلادية بأحد عشر يومًا تقريبًا، فينحسر كل شهر هجري عبر التقويم الميلادي بالمقدار نفسه تقريبًا. كل نقطة أعلاه تمثل عامًا من رمضان: المحور الأفقي هو العام الميلادي، والرأسي هو يوم بدء رمضان من ذلك العام." },
    { "type": "p", "text": "من أعلى إلى أسفل يظهر الانزياح العكسي: النقطة العالية تعني رمضان صيفًا، والمنخفضة تعني شتاءً. يُكمل رمضان دورةً كاملة عبر الفصول كل ثلاث وثلاثين سنة ميلادية تقريبًا. الخط المتقطع يشير إلى الانقلاب الصيفي — أقسى صيام في نصف الكرة الشمالي." },
    { "type": "p", "text": "قارن ذلك بالتقويم الميلادي المعلَّق بالشمس، والتقويم الهجري المعلَّق بالقمر. الفرق مقصود: الشهر القمري قصير بحيث يقع أي شهر في كل فصل خلال عمر الإنسان، وهذه حكمته." }
  ],
  "methodology": [
    { "type": "p", "text": "تُحسب بدايات رمضان عبر تقويم أم القرى الفلكي باستخدام Intl.DateTimeFormat في المتصفح مع التقويم 'islamic-umalqura'، وهو التقويم الرسمي للمملكة العربية السعودية، وتدعمه متصفحات V8 الحديثة لسنوات هجرية ~1300–1500 (~1882–2077 ميلادية). قد تختلف رؤية الهلال المحلية بيوم عن التقويم، فأم القرى تنبؤ فلكي لا بديل عن الرؤية." }
  ],
  "axes": { "x": "السنة الميلادية", "y": "اليوم من السنة" }
}
```

- [ ] **Step 3: Register + verify + commit**

```ts
// src/data/visualizations.ts
import HijriDrift from '../viz/hijri-drift/HijriDrift';
// ...
'hijri-drift': { slug: 'hijri-drift', tag: 'calendar', Chart: HijriDrift },
```

`npm run dev`. Visit Hijri Drift — see the dotted ribbon trending downward.

```bash
git add .
git commit -m "feat(viz): Hijri Drift timeline"
```

---

## Phase 7 — Viz #4: Sun Path & Asr

### Task 19: Build Sun Path & Asr SVG diagram

**Files:**
- Create: `src/viz/sun-path-asr/SunPathAsr.tsx`, `content.en.json`, `content.ar.json`

- [ ] **Step 1: Build component**

```tsx
// src/viz/sun-path-asr/SunPathAsr.tsx
import { useMemo, useState } from 'react';
import { CITIES } from '../../data/cities';
import { sunAltitude, sunriseSunset, asrTime, solarNoon, hoursToHHMM } from '../../lib/solar';
import { isDST } from '../../lib/dst';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 720, H = 360;
const PADDING_X = 40, PADDING_Y = 40;

export default function SunPathAsr() {
  const { lang } = useLang();
  const [cityIdx, setCityIdx] = useState(() => CITIES.findIndex((c) => c.name.startsWith('Makkah')));
  const [dateIso, setDateIso] = useState('2025-06-21');
  const city = CITIES[cityIdx];
  const date = new Date(dateIso + 'T00:00:00Z');
  const dict = lang === 'ar' ? contentAr : contentEn;

  const { points, sunrise, sunset, noon, asrShafii, asrHanafi, maxAlt } = useMemo(() => {
    const dstOffset = isDST(city.dstType, date) ? 1 : 0;
    const loc = { lat: city.lat, lng: city.lng, tz: city.tz + dstOffset };
    const { sunrise, sunset } = sunriseSunset(loc, date);
    const noon = solarNoon(loc, date);
    const pts: Array<{ h: number; alt: number }> = [];
    for (let h = 0; h <= 24; h += 0.1) {
      pts.push({ h, alt: sunAltitude(loc, date, h) });
    }
    const maxAlt = Math.max(...pts.map((p) => p.alt));
    return {
      points: pts,
      sunrise,
      sunset,
      noon,
      asrShafii: asrTime(loc, date, 1),
      asrHanafi: asrTime(loc, date, 2),
      maxAlt: Math.max(90, Math.ceil(maxAlt / 10) * 10),
    };
  }, [city, date]);

  const xScale = (h: number) => PADDING_X + ((h - 0) / 24) * (W - 2 * PADDING_X);
  const yScale = (alt: number) => H - PADDING_Y - Math.max(0, alt / maxAlt) * (H - 2 * PADDING_Y);

  const path = points
    .filter((p) => p.alt > 0)
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.h).toFixed(1)},${yScale(p.alt).toFixed(1)}`)
    .join(' ');

  const t = (h: number) => {
    const { hh, mm } = hoursToHHMM(h);
    return `${hh}:${mm}`;
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">{dict.controls.city}</span>
          <select value={cityIdx} onChange={(e) => setCityIdx(parseInt(e.target.value, 10))} className="border border-rule rounded-lg px-2 py-1 bg-surface">
            {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-ink-dim">{dict.controls.date}</span>
          <input type="date" value={dateIso} onChange={(e) => setDateIso(e.target.value)} className="border border-rule rounded-lg px-2 py-1 bg-surface" />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* ground line */}
        <line x1={PADDING_X} y1={H - PADDING_Y} x2={W - PADDING_X} y2={H - PADDING_Y} stroke="var(--rule)" />

        {/* sun arc */}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} />

        {/* Asr markers */}
        {[{ time: asrShafii, color: 'var(--accent)', label: dict.labels.shafii, dy: -8 },
          { time: asrHanafi, color: 'var(--chart-2)', label: dict.labels.hanafi, dy: 18 }].map((m, i) => {
            if (!isFinite(m.time)) return null;
            const x = xScale(m.time);
            return (
              <g key={i}>
                <line x1={x} y1={PADDING_Y} x2={x} y2={H - PADDING_Y} stroke={m.color} strokeDasharray="3 4" />
                <text x={x + 4} y={PADDING_Y + 14 + m.dy} fontSize={12} fill={m.color}>{m.label} · {t(m.time)}</text>
              </g>
            );
          })}

        {/* sunrise/noon/sunset ticks */}
        {[{ h: sunrise, label: dict.labels.sunrise }, { h: noon, label: dict.labels.noon }, { h: sunset, label: dict.labels.sunset }].map((tk, i) => {
          if (!isFinite(tk.h)) return null;
          const x = xScale(tk.h);
          return (
            <g key={i}>
              <line x1={x} y1={H - PADDING_Y - 4} x2={x} y2={H - PADDING_Y + 4} stroke="var(--ink-dim)" />
              <text x={x} y={H - PADDING_Y + 18} fontSize={11} fill="var(--ink-dim)" textAnchor="middle">{tk.label}</text>
              <text x={x} y={H - PADDING_Y + 32} fontSize={10} fill="var(--ink-dim)" textAnchor="middle">{t(tk.h)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Content JSON**

```json
// src/viz/sun-path-asr/content.en.json
{
  "title": "Sun Path and the Two Asrs",
  "subtitle": "Why Shafi'i and Hanafi Asr differ, in geometry",
  "tag": "fiqh",
  "controls": { "city": "City", "date": "Date" },
  "labels": { "sunrise": "Sunrise", "noon": "Dhuhr", "sunset": "Maghrib", "shafii": "Asr (Shafi'i)", "hanafi": "Asr (Hanafi)" },
  "explainer": [
    { "type": "p", "text": "Asr has two answers. The majority position (Shafi'i, Maliki, Hanbali) fixes Asr at the time when the shadow of an object equals its own height, plus the shadow it had at noon. The Hanafi position doubles this: shadow equals twice the height, plus the noon shadow. The difference isn't a disagreement about astronomy — it's a disagreement about which threshold of afternoon the prayer window opens at." },
    { "type": "p", "text": "The arc above traces the sun's altitude through the day for the city and date you pick. The two vertical markers are the Shafi'i Asr (teal) and Hanafi Asr (orange). The further the sun gets from zenith, the longer the shadow — so the Hanafi marker always falls later than the Shafi'i marker. On a summer day in Makkah the difference might be under an hour; on a winter day at high latitude, it can exceed two." },
    { "type": "p", "text": "Neither position is making an error. They're computing different geometrical events. A prayer time is a ruling written in the language of the sky, and the sky is precise." }
  ],
  "methodology": [
    { "type": "p", "text": "Sun altitude is computed each 6 minutes from solar declination and hour angle (see solar.ts). Asr time is the local clock hour at which arctan(1 / (factor + tan(|lat - dec|))) matches the sun's altitude, where factor = 1 for Shafi'i/Maliki/Hanbali and 2 for Hanafi. At high latitudes where the sun fails to reach the required depression, one or both markers may not render — expected behavior, not a bug." }
  ]
}
```

```json
// src/viz/sun-path-asr/content.ar.json
{
  "title": "مسار الشمس ووقت العصر",
  "subtitle": "لماذا يختلف العصر بين الشافعية والحنفية، هندسيًا",
  "tag": "fiqh",
  "controls": { "city": "المدينة", "date": "التاريخ" },
  "labels": { "sunrise": "الشروق", "noon": "الظهر", "sunset": "المغرب", "shafii": "العصر (الشافعي)", "hanafi": "العصر (الحنفي)" },
  "explainer": [
    { "type": "p", "text": "للعصر قولان: الجمهور (الشافعية والمالكية والحنابلة) يرون دخول العصر حين يصير ظل الشيء مثله زائدًا فيء الزوال. والحنفية يضاعفون ذلك: الظل مثليه زائد فيء الزوال. ليس الخلاف فلكيًا، بل في أي عتبة من العصر تبدأ النافذة." },
    { "type": "p", "text": "يرسم القوس أعلاه ارتفاع الشمس عبر اليوم للمدينة والتاريخ المختارين. العلامتان الرأسيتان هما عصر الشافعية (أخضر) وعصر الحنفية (برتقالي). كلما ابتعدت الشمس عن السمت طال الظل، فيتأخر علامة الحنفية دائمًا عن علامة الشافعية. في صيف مكة قد يكون الفرق أقل من ساعة، وفي خطوط العرض العليا شتاءً قد يتجاوز ساعتين." },
    { "type": "p", "text": "لا أحد من الفريقين يُخطئ، إنما يحسبان حدثين هندسيين مختلفين. والوقت حكم مكتوب بلغة السماء، والسماء دقيقة." }
  ],
  "methodology": [
    { "type": "p", "text": "يُحسب ارتفاع الشمس كل 6 دقائق من الميل الشمسي وزاوية الساعة (انظر solar.ts). ووقت العصر هو الساعة المحلية التي يطابق فيها ارتفاع الشمس قيمة arctan(1 / (factor + tan(|lat - dec|))) حيث factor = 1 عند الجمهور و2 عند الحنفية. في خطوط العرض العليا قد لا تصل الشمس للارتفاع المطلوب فلا تظهر إحدى العلامتين أو كلاهما." }
  ]
}
```

- [ ] **Step 3: Register + verify + commit**

```ts
import SunPathAsr from '../viz/sun-path-asr/SunPathAsr';
'sun-path-asr': { slug: 'sun-path-asr', tag: 'fiqh', Chart: SunPathAsr },
```

```bash
git add .
git commit -m "feat(viz): Sun Path with dual-Asr markers"
```

---

## Phase 8 — Viz #5: Qibla Great-Circle

### Task 20: Build Qibla map

**Files:**
- Create: `src/viz/qibla-great-circle/QiblaGC.tsx`, `content.en.json`, `content.ar.json`
- Install: `d3-geo`, `topojson-client`, `world-atlas`

- [ ] **Step 1: Install geo deps**

```bash
npm install d3-geo topojson-client world-atlas
npm install -D @types/d3-geo @types/topojson-client
```

- [ ] **Step 2: Build the map component**

```tsx
// src/viz/qibla-great-circle/QiblaGC.tsx
import { useMemo, useState, useEffect } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { CITIES } from '../../data/cities';
import { greatCirclePath, MAKKAH_COORDS, qiblaBearing } from '../../lib/qibla';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const W = 800, H = 420;

export default function QiblaGC() {
  const { lang } = useLang();
  const [cityIdx, setCityIdx] = useState(() => CITIES.findIndex((c) => c.name.startsWith('New York')));
  const city = CITIES[cityIdx];
  const [land, setLand] = useState<FeatureCollection | null>(null);
  const dict = lang === 'ar' ? contentAr : contentEn;

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((world) => {
        const fc = feature(world, world.objects.countries) as FeatureCollection;
        setLand(fc);
      });
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
```

- [ ] **Step 3: Content JSON**

```json
// src/viz/qibla-great-circle/content.en.json
{
  "title": "Qibla, the Straight Line",
  "subtitle": "The shortest path to Makkah is rarely what a flat map suggests",
  "tag": "geometry",
  "controls": { "city": "City" },
  "labels": { "bearing": "Bearing from city", "makkah": "Makkah" },
  "explainer": [
    { "type": "p", "text": "Stand in New York and point toward Makkah. Which way? A Mercator map tells you southeast; a globe tells you northeast. The globe is right. On a sphere, the shortest path between two points is a great circle — a slice of the plane that passes through both points and the center of the Earth. For most cities in the northern hemisphere, that slice bends north toward (or past) the pole." },
    { "type": "p", "text": "The map above is a Natural Earth projection, chosen because it doesn't lie as badly as Mercator about polar routes. The teal arc is the true shortest path from the selected city to Makkah. For an American, that arc visibly curves through northern Greenland. This is the same reason airlines from New York to Dubai fly north through Iceland, not east across the Atlantic." },
    { "type": "p", "text": "Modern mosques orient toward this great-circle bearing, not the Mercator 'go east' direction. The numeric bearing at the top is what your compass should read." }
  ],
  "methodology": [
    { "type": "p", "text": "Bearing computed with the standard initial-bearing formula using atan2 on a spherical Earth. Great-circle path interpolated with 128 segments via spherical linear interpolation. Map uses the Natural Earth I projection (d3-geo's geoNaturalEarth1). Country outlines sourced from `world-atlas` at 1:110m resolution." }
  ]
}
```

```json
// src/viz/qibla-great-circle/content.ar.json
{
  "title": "القبلة والخط المستقيم",
  "subtitle": "أقصر طريق إلى مكة نادرًا ما يكون ما تُوحي به الخريطة المسطحة",
  "tag": "geometry",
  "controls": { "city": "المدينة" },
  "labels": { "bearing": "الاتجاه من المدينة", "makkah": "مكة" },
  "explainer": [
    { "type": "p", "text": "قف في نيويورك وأشر نحو مكة. من أي جهة؟ تُخبرك خريطة مركيتور بالجنوب الشرقي، بينما يخبرك الكرة الأرضية بالشمال الشرقي، والكرة هي الصحيحة. على سطح كروي، أقصر طريق بين نقطتين هو دائرة عظمى — مستوٍ يمر بالنقطتين وبمركز الأرض. وأكثر مدن نصف الكرة الشمالي يمر مسارها شمالًا قرب القطب أو عبره." },
    { "type": "p", "text": "الخريطة أعلاه من إسقاط Natural Earth، اخترناها لأنها لا تكذب مثل مركيتور في المسارات القطبية. القوس الأخضر هو المسار الحقيقي الأقصر من المدينة المختارة إلى مكة. من نيويورك ينحني القوس بوضوح فوق شمال غرينلاند، وهو السبب نفسه الذي يجعل شركات الطيران من نيويورك إلى دبي تحلق شمالًا عبر آيسلندا لا شرقًا عبر الأطلسي." },
    { "type": "p", "text": "تُوجَّه المساجد الحديثة نحو اتجاه الدائرة العظمى هذا، لا نحو 'اتجه شرقًا' المسطح. والرقم أعلاه هو ما يقرؤه بوصلتك." }
  ],
  "methodology": [
    { "type": "p", "text": "يُحسب الاتجاه بالصيغة القياسية للاتجاه الابتدائي باستخدام atan2 على أرض كروية. ويُستوحى مسار الدائرة العظمى بتقسيم 128 قطعة باستعمال الاستكمال الخطي الكروي. والخريطة بإسقاط Natural Earth I (geoNaturalEarth1 من d3-geo). وتصاميم الدول من world-atlas بدقة 1:110m." }
  ]
}
```

- [ ] **Step 4: Register + verify + commit**

```ts
import QiblaGC from '../viz/qibla-great-circle/QiblaGC';
'qibla-great-circle': { slug: 'qibla-great-circle', tag: 'geometry', Chart: QiblaGC },
```

```bash
git add .
git commit -m "feat(viz): Qibla great-circle world map"
```

---

## Phase 9 — Site pages polish

### Task 21: Build About page

**Files:**
- Modify: `src/pages/About.tsx`
- Create: `src/i18n/about.en.json`, `src/i18n/about.ar.json`

- [ ] **Step 1: Content**

```json
// src/i18n/about.en.json
{
  "title": "About",
  "paragraphs": [
    "Islamic Viz Hub is a small collection of interactive visualizations exploring Islamic practice through geometry and astronomy. It's built for curious adults who like to understand how things work, and it's bilingual — every visualization ships in both Arabic and English with first-class typography, RTL layout, and parity content.",
    "There are no accounts, no analytics beyond the hosting provider's, no advertising, and no tracking. The whole site is a static build deployed to GitHub Pages. Source code lives on GitHub — contributions welcome.",
    "The visualizations take positions on neither theology nor calculation method. Where multiple conventions exist — different Fajr angles, different Asr thresholds — both are shown, sourced, and explained. Choose what your community follows."
  ]
}
```

```json
// src/i18n/about.ar.json
{
  "title": "عن الموقع",
  "paragraphs": [
    "مركز التصورات الإسلامية مجموعة صغيرة من التصورات التفاعلية تستكشف العبادة الإسلامية من خلال الهندسة والفلك، موجَّه لكل محب للمعرفة يريد أن يفهم كيف تعمل الأشياء. الموقع ثنائي اللغة — كل تصور يصدر بالعربية والإنجليزية بتقنية طباعية أولية للحرف العربي، وتخطيط من اليمين إلى اليسار، ومحتوى متكافئ." ,
    "لا حسابات ولا تتبع ولا إعلانات، ولا تحليلات إلا ما يوفره مزود الاستضافة. الموقع كله بناء ساكن منشور على GitHub Pages. مصدر الكود على GitHub — والمساهمات مرحب بها.",
    "لا تتخذ التصورات موقفًا فقهيًا ولا تتبنى طريقة حساب بعينها. وحيث توجد طرق متعددة — زوايا الفجر المختلفة، حدود العصر المختلفة — تُعرض جميعها مع مصادرها وشرحها. فاختر ما يتبعه مجتمعك."
  ]
}
```

- [ ] **Step 2: Component**

```tsx
// src/pages/About.tsx
import { useLang } from '../i18n/useLang';
import Container from '../components/Layout/Container';
import aboutEn from '../i18n/about.en.json';
import aboutAr from '../i18n/about.ar.json';

export default function About() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? aboutAr : aboutEn;
  return (
    <Container>
      <h1 className="text-5xl mb-6">{dict.title}</h1>
      <div className="prose prose-lg max-w-none">
        {dict.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </Container>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(page): About page bilingual"
```

---

### Task 22: Add meta tags, favicon, OG image

**Files:**
- Modify: `index.html`
- Create: `public/favicon.ico`, `public/og-image.png`

- [ ] **Step 1: Generate a simple OG image**

1200×630 cream background with the title. Generated via ImageMagick (install with `brew install imagemagick`):

```bash
convert -size 1200x630 xc:#FAF7F0 \
  -fill "#0F172A" -pointsize 96 -gravity center \
  -draw "text 0,-40 'Islamic Viz Hub'" \
  -fill "#0F766E" -pointsize 48 \
  -draw "text 0,60 'مركز التصورات الإسلامية'" \
  public/og-image.png
```

Verify: `open public/og-image.png`. Should show the title in dark ink and the Arabic subtitle in teal, centered on cream.

- [ ] **Step 2: Favicon**

Use a minimal teal-on-cream favicon — e.g. the letter ع or a crescent glyph. Save as `public/favicon.ico` (16×16 + 32×32 multi-size ICO). A one-off `convert` command:

```bash
convert -size 64x64 xc:#FAF7F0 -fill "#0F766E" -gravity center -pointsize 48 -draw "text 0,0 'ع'" public/favicon.ico
```

- [ ] **Step 3: Update `index.html` with meta tags**

```html
<!-- index.html — replace <head> contents -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#FAF7F0" />
<link rel="icon" href="/favicon.ico" />

<title>Islamic Viz Hub</title>
<meta name="description" content="Interactive bilingual visualizations of Islamic science — prayer times, qibla, calendar, geometry of the sky." />

<meta property="og:type" content="website" />
<meta property="og:title" content="Islamic Viz Hub" />
<meta property="og:description" content="Interactive bilingual visualizations of Islamic science." />
<meta property="og:image" content="/og-image.png" />
<meta property="og:url" content="https://islamicviz.analyticadss.com" />
<meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: favicon, OG image, meta tags"
```

---

## Phase 10 — Deploy

### Task 23: Create GitHub Actions deploy workflow + CNAME

**Files:**
- Create: `.github/workflows/deploy.yml`, `public/CNAME`

- [ ] **Step 1: Create CNAME**

```
islamicviz.analyticadss.com
```

(No trailing newline-sensitive details — just one line with the hostname.)

Path: `public/CNAME` (must be in `public/`, per PLAYBOOK lesson-learned — Vite copies `public/` into `dist/` verbatim.)

- [ ] **Step 2: Create the deploy workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Add README**

```markdown
# Islamic Viz Hub

Bilingual (Arabic / English) interactive visualizations of Islamic science.

Live: https://islamicviz.analyticadss.com

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # vitest
npm run build     # static build to dist/
```

## Adding a new visualization

1. Create `src/viz/<slug>/<SlugChart>.tsx`
2. Create `src/viz/<slug>/content.en.json` and `content.ar.json`
3. Register in `src/data/visualizations.ts` and add `<slug>` to `VIZ_ORDER`
4. Add the slug to `VizSlug` union type

See `docs/superpowers/specs/2026-04-18-islamic-viz-design.md` for full design.
```

- [ ] **Step 4: Create the GitHub repo and push**

```bash
gh repo create aousabdo/islamic-viz --public --source=. --remote=origin
git branch -M main
git push -u origin main
```

- [ ] **Step 5: Enable GitHub Pages in repo settings**

GitHub repo → Settings → Pages → Source: GitHub Actions. Watch the Actions tab for build/deploy.

- [ ] **Step 6: Add DNS in Cloudflare**

Cloudflare dashboard → `analyticadss.com` zone → Add CNAME record:
- Name: `islamicviz`
- Target: `aousabdo.github.io`
- Proxy: On (orange cloud)

Wait 1–2 minutes. Visit https://islamicviz.analyticadss.com. Should load the site.

- [ ] **Step 7: Commit + push any remaining changes**

```bash
git add .
git commit -m "chore: deploy workflow, CNAME, README"
git push
```

---

### Task 24: Final bilingual QA + Lighthouse

**Files:** none (manual verification)

- [ ] **Step 1: Bilingual QA checklist per viz**

For each of the 5 viz, open both `/en/v/<slug>` and `/ar/v/<slug>` on desktop and mobile (devtools responsive mode):

- [ ] Title and subtitle render in the correct font (Instrument Serif EN / Scheherazade New AR)
- [ ] Explainer prose renders in correct body font (Inter EN / Amiri AR)
- [ ] RTL layout: controls, chart labels, tooltips all mirror; no text clipping
- [ ] Chart renders correctly — numbers in Western digits, axis labels translated
- [ ] Methodology disclosure opens and renders prose
- [ ] Back link works, lang toggle works, no console errors

- [ ] **Step 2: Lighthouse on production**

```bash
npx lighthouse https://islamicviz.analyticadss.com/en/ --chrome-flags="--headless" --preset=desktop
npx lighthouse https://islamicviz.analyticadss.com/ar/ --chrome-flags="--headless" --preset=desktop
npx lighthouse https://islamicviz.analyticadss.com/en/v/fajr-globe --chrome-flags="--headless" --preset=desktop
```

Target: ≥90 on Performance, Accessibility, Best Practices, SEO.

If a score falls short: note which page + category, and open a follow-up issue. Typical fixes: preconnect hints for font CDN (we self-host, so not an issue), image dimensions on OG, contrast on chart series.

- [ ] **Step 3: Social preview test**

Paste the live URL into a Slack or WhatsApp message draft. Confirm the OG image and description render.

- [ ] **Step 4: Record completion**

Update `README.md` adding a `## Status` section with "v1 shipped YYYY-MM-DD".

```bash
git add README.md
git commit -m "docs: mark v1 shipped"
git push
```

---

## Spec coverage check

Cross-referenced against `docs/superpowers/specs/2026-04-18-islamic-viz-design.md`:

- §3 Content scope (5 viz) → Tasks 16, 17, 18, 19, 20 ✓
- §4 Technical architecture → Tasks 1, 2, 3 ✓
- §5 Information architecture (routes) → Task 6 ✓
- §6 Bilingual system → Tasks 4, 5 ✓
- §7 Per-viz page template → Task 14 ✓
- §8 Design system (tokens, type) → Task 2 ✓
- §9 Repo layout → established in Tasks 1–14 ✓
- §10 Quality gates (Lighthouse ≥90, bilingual QA) → Task 24 ✓
- §11 Delivery plan → 24 tasks across 10 phases ✓
- §12 Open questions (Arabic prose quality, calc methods, Umalqura range, projection) → addressed in viz content methodology sections ✓
