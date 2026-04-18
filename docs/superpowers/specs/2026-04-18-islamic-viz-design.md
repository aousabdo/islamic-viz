# Islamic Viz Hub — Design Spec

**Date:** 2026-04-18
**Author:** aousabdo (with Claude)
**Status:** Approved, ready for implementation plan

---

## 1. Overview

A bilingual (Arabic / English) visualization hub for Islamic science concepts — observable, astronomical, mathematical phenomena relevant to Muslim practice. Modeled loosely on [scivizhub](https://github.com/aousabdo/scivizhub) in form, but narrower in scope (5 viz at launch), fully bilingual, and stylistically distinct.

Hosted on GitHub Pages at `islamicviz.analyticadss.com`.

### Goals

- Ship a polished MVP of **5 visualizations** covering easy → sophisticated difficulty, all in the "Islamic science" domain.
- **True bilingual parity** — every viz has first-class Arabic and English content, RTL layout, and localized UI chrome.
- Visual-learner oriented. Each viz is an interactive chart/diagram paired with a short, well-written essay, not a widget stub.
- Static site, no backend, no auth, no LLM — deployable to GitHub Pages out of the box.

### Non-goals (for v1)

- Search, categories, or a large viz registry (5 viz doesn't need them).
- Dark mode, offline/PWA, contributor flow.
- Domain B content (Prophets Tree, chains of narration, Quran linguistics) — deferred to v2+.
- Theologically sensitive viz (inheritance math, hilal visibility) — deferred to v2+.
- Jest/RTL test suite — add once logic shapes stabilize.

---

## 2. Audience

**Curious adults who like to understand how things work.** Assumes numeracy and attention span. Tone: scholarly, measured, not childish. Reference points: *Our World in Data*, *Observable*, *The Pudding*. Each viz is a mini-essay anchored around an interactive chart.

Not targeting: children (too scaffolded), dawah/general public (too shareable-infographic-first), theologians (too authoritative-claim-heavy).

---

## 3. Content scope — the five viz

All five share a theme: **Islamic practice × geometry/astronomy.** No theological-authority calls; methodology stated plainly with cited calculation methods.

| # | Slug | Title (EN) | Title (AR) | Complexity | Notes |
|---|---|---|---|---|---|
| 1 | `fajr-globe` | Fajr Around the World | الفجر حول العالم | Sophisticated | Port of existing `fajr-sunrise-global.jsx`. 70-city Fajr-vs-sunrise chart with DST rules per region. |
| 2 | `fasting-hours` | Fasting Hours Around the World | ساعات الصيام حول العالم | Sophisticated | Sister to #1 — daily fast duration across 70 cities through the year. Highlights polar edge cases. Reuses city list and solar math. |
| 3 | `hijri-drift` | The Drifting Hijri Calendar | الهجري المتحرك | Easy | Single-timeline viz showing Ramadan start date drifting through the Gregorian year over 33 years (~11-day/year retrograde). |
| 4 | `sun-path-asr` | Sun Path and the Two Asrs | مسار الشمس ووقت العصر | Medium | Sky-arc diagram of sun altitude + shadow length through a day, marking Asr in both Shafi'i (1:1) and Hanafi (2:1) schools. Explains a real fiqh difference via geometry. |
| 5 | `qibla-great-circle` | Qibla, the Straight Line | القبلة والخط المستقيم | Medium | World map with the great-circle arc from user's city to Makkah. Surfaces the counter-intuitive northern-route phenomenon. |

### Calculation methods (disclosed per-viz, not chosen for the user)

Viz #1 and #4 depend on prayer-time calculation conventions. The site offers a method selector (MWL, ISNA, Umm al-Qura, Makkah, Egyptian, Karachi, Tehran, Jafari) and discloses the formula in the Methodology disclosure. The site takes no position on which is correct.

---

## 4. Technical architecture

### Stack

- **React 19** + **Vite** (latest stable). Not CRA. Per `AWS_product_planning/PLAYBOOK.md` §7.
- **TypeScript** throughout. Port of the existing Fajr viz is typed during port.
- **Tailwind CSS** — utility-first, design tokens exposed as CSS variables.
- **Lucide React** — portfolio-standard icon set.
- **recharts** — viz #1 and #2. Matches existing Fajr implementation.
- **d3** scoped imports (`d3-geo`, `d3-scale`, `d3-shape`, `topojson-client`) — viz #4 and #5.
- **`@fontsource`** for self-hosted web fonts (Inter, Instrument Serif, Amiri, Scheherazade New).
- **No i18n library.** Custom `<LangProvider>` context + JSON dictionaries. Avoids i18next's bundle cost for 5 viz.
- **No KaTeX / MathJax for MVP.** Math in viz is geometric, not equation-heavy.

### Build and deploy

- Vite config: `base: '/'` (PLAYBOOK lesson-learned: custom-domain-by-default, never `/<repo-name>/`).
- Output: `dist/`.
- `public/CNAME` contains `islamicviz.analyticadss.com`. Must live in `public/`, not repo root.
- GitHub Actions workflow from `AWS_product_planning/templates/` (or PLAYBOOK §7 inline template): push to `main` → build → deploy to `gh-pages` branch via `peaceiris/actions-gh-pages@v3`.
- Cloudflare DNS record: `islamicviz.analyticadss.com` CNAME → `<username>.github.io`, proxied. Let's Encrypt cert on GH Pages side is cosmetic — visitors get Cloudflare's edge cert (known gotcha from PLAYBOOK §8).

---

## 5. Information architecture

### Routes

```
/                          redirect: Accept-Language 'ar*' → /ar/, else /en/
                           (also persisted in localStorage.lang)

/en/                       home — tile grid of the 5 viz (LTR)
/ar/                       home — tile grid of the 5 viz (RTL)

/en/v/<slug>               viz page, LTR
/ar/v/<slug>               viz page, RTL

/en/about                  about page
/ar/about                  about page

404                        minimal localized not-found with link to home
```

Slugs: `fajr-globe`, `fasting-hours`, `hijri-drift`, `sun-path-asr`, `qibla-great-circle`.

### Why URL language prefix (not cookie or subdomain)

- Shareability: link copies preserve language.
- SEO: Google indexes both variants; `<link rel="alternate" hreflang>` pair set per page.
- No hydration mismatch risk.
- Simpler than subdomain splits (no DNS, no cross-origin).

---

## 6. Bilingual system

### `<LangProvider>` context

Exposes to every component:

```ts
type LangContext = {
  lang: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  t(key: string): string;              // lookup in merged chrome + viz dict
  tn(n: number, opts?: Intl.NumberFormatOptions): string;
  td(d: Date, opts: { calendar: 'gregory' | 'islamic-umalqura' } & Intl.DateTimeFormatOptions): string;
  setLang(next: 'en' | 'ar'): void;    // navigates and persists
};
```

Set on mount: `document.documentElement.lang = lang; document.documentElement.dir = dir;`

### Dictionaries

- **Chrome strings** (site-wide): `src/i18n/chrome.en.json`, `src/i18n/chrome.ar.json`. Navigation labels, footer, 404, lang toggle, share label.
- **Per-viz strings**: `src/viz/<slug>/content.en.json`, `.ar.json`. Title, subtitle, controls labels, explainer prose (as HTML string or structured blocks), methodology prose, chart axis labels.

Content JSON shape (per viz):

```json
{
  "title": "Fajr Around the World",
  "subtitle": "How dawn's earliest threshold shifts by latitude and season",
  "tags": ["astronomy", "prayer-times"],
  "controls": { "city": "City", "method": "Calculation method", "...": "..." },
  "explainer": [
    { "type": "p", "text": "..." },
    { "type": "p", "text": "..." }
  ],
  "methodology": [
    { "type": "p", "text": "..." }
  ],
  "axes": { "x": "Day of year", "y": "Local time" }
}
```

### Typography

- **EN body:** Inter (400, 500, 600).
- **EN display:** Instrument Serif (400) — used for h1 and h2 only, the "scholarly" moment.
- **AR body:** Amiri (400, 700).
- **AR display:** Scheherazade New (400, 700) — h1, h2, large callouts.

All self-hosted via `@fontsource/*`. Font loading: `swap` with a preload for body weights to avoid FOIT.

### RTL

- `<html dir>` set by `<LangProvider>` on route change.
- Body gets `.rtl` class for conditional styling.
- Tailwind's `rtl:` variants used sparingly — prefer logical properties (`ms-4`, `me-4`, `ps-2`, `pe-2`).
- Charts: axes, legends, tooltips all respond to `dir` context. Numbers stay LTR even in RTL context (standard practice).

### Numerals

**Western digits (0–9) in both languages.** Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) are aesthetically preferred in prose but break chart axes (recharts doesn't localize), regex-based input, and muscle-memory prayer-time reading. Call out as a v2 consideration.

### Dates

- Gregorian: `Intl.DateTimeFormat(lang, { calendar: 'gregory', ... })`.
- Hijri: `Intl.DateTimeFormat(lang, { calendar: 'islamic-umalqura', ... })`.
- Both exposed via `td()` helper for consistency.

---

## 7. Per-viz page template

Approach 3: chart-first with real prose.

Layout (desktop, ≥1024px):

```
┌──────────────────────────────────────────────────┐
│  [chip: astronomy]    [EN | AR toggle]           │
│                                                  │
│  Title (display serif/Scheherazade New)          │
│  Subtitle (ink-dim)                              │
├──────────────────────────────────────────────────┤
│                                                  │
│        HERO CHART AREA (~500px tall)             │
│                                                  │
├──────────────────────────────────────────────────┤
│  CONTROLS DOCK                                   │
│  [city ▾] [method ▾] [date]                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  Explainer — 2–3 paragraphs of real prose.       │
│  What you're seeing. Why it matters. One         │
│  surprising fact or insight.                     │
│                                                  │
├──────────────────────────────────────────────────┤
│  ▼ Methodology                                   │
│     (disclosure, default collapsed — calculation │
│     method, sources, edge cases, caveats)        │
├──────────────────────────────────────────────────┤
│  ← All visualizations        Share · EN ⇄ AR     │
└──────────────────────────────────────────────────┘
```

Mobile (<640px): straight vertical stack, controls collapse into a bottom sheet, hero chart height drops to `min(65vh, 420px)`.

Shared `<VizPage>` component takes a `VizConfig` (from the registry) and renders this shell around the viz's `<Chart>` and `<Controls>` components. The viz author writes only the chart + controls; all chrome is free.

---

## 8. Design system (Aesthetic C — "scholarly modern")

### Color tokens

```css
--bg:        #FAF7F0   /* warm cream — primary background */
--surface:   #FFFFFF   /* cards, chart background */
--ink:       #0F172A   /* body text */
--ink-dim:   #475569   /* secondary text, labels */
--accent:    #0F766E   /* teal — links, primary chart series, chips */
--accent-d:  #134E4A   /* teal hover/active */
--gold-d:    #7C5F1E   /* Arabic decorative accents, small type */
--rule:      #E6DFC8   /* borders, dividers */
--chart-2:   #C2410C   /* secondary chart series (e.g., Asr-Hanafi) */
--chart-3:   #6B21A8   /* tertiary series if ever needed */
```

No dark mode in v1.

### Type scale

| Role | EN font | AR font | Size (px, desktop) |
|---|---|---|---|
| Display h1 | Instrument Serif | Scheherazade New 700 | 48 |
| Display h2 | Instrument Serif | Scheherazade New 700 | 32 |
| Section h3 | Inter 600 | Amiri 700 | 20 |
| Body | Inter 400 | Amiri 400 | 16 |
| Small / meta | Inter 500 | Amiri 400 | 13 |
| Label / chip | Inter 600 (uppercase, tracking 0.08em) | Amiri 400 | 11 |

Line-heights: body 1.65 (EN), 1.85 (AR — Arabic needs more).

### Spacing, radius, motion

- Spacing: Tailwind default (4px base).
- Radii: `rounded-lg` (8px) for cards/chips; `rounded-2xl` (14px) for hero chart surface.
- Shadows: single token `shadow-md` used for elevated cards on hover only.
- Motion: 180ms ease-out for hover/focus; 280ms ease-in-out for disclosure panels.

### Component primitives

- `<VizCard>` — home-page tile. Shows tag, title (both languages layered), one-line blurb, tiny chart preview.
- `<Chip>` — category tag.
- `<LangToggle>` — EN ⇄ AR pill in header.
- `<Disclosure>` — collapsible methodology panel.
- `<Credit tier={2} />` — portfolio-standard byline per PLAYBOOK.

---

## 9. Repository layout

```
islamic_viz/
├── public/
│   ├── CNAME                        # islamicviz.analyticadss.com
│   ├── og-image.png                 # social preview
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Layout/                  # Header, Footer, Container
│   │   ├── VizCard.tsx
│   │   ├── Chip.tsx
│   │   ├── LangToggle.tsx
│   │   ├── Disclosure.tsx
│   │   └── Credit.tsx
│   ├── i18n/
│   │   ├── LangProvider.tsx
│   │   ├── useLang.ts
│   │   ├── chrome.en.json
│   │   └── chrome.ar.json
│   ├── lib/
│   │   ├── solar.ts                 # sun altitude, sunrise/sunset, dawn angles
│   │   ├── hijri.ts                 # Umalqura helpers via Intl + fallback
│   │   ├── qibla.ts                 # great-circle bearing + path points
│   │   ├── format.ts                # numbers, dates (bilingual-aware)
│   │   └── dst.ts                   # regional DST rules (from Fajr viz)
│   ├── viz/
│   │   ├── fajr-globe/
│   │   │   ├── FajrGlobe.tsx        # Chart component
│   │   │   ├── Controls.tsx
│   │   │   ├── content.en.json
│   │   │   └── content.ar.json
│   │   ├── fasting-hours/{...}
│   │   ├── hijri-drift/{...}
│   │   ├── sun-path-asr/{...}
│   │   └── qibla-great-circle/{...}
│   ├── data/
│   │   ├── visualizations.ts        # registry: slug → VizConfig
│   │   ├── cities.ts                # 70-city list (ported from Fajr viz)
│   │   └── calc-methods.ts          # MWL, ISNA, Umm al-Qura, ...
│   ├── pages/
│   │   ├── Home.tsx                 # tile grid
│   │   ├── VizPage.tsx              # shared viz shell
│   │   ├── About.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx                      # router + LangProvider
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .github/workflows/deploy.yml
└── docs/
    └── superpowers/specs/2026-04-18-islamic-viz-design.md   # this file
```

---

## 10. Quality gates

- **Lighthouse ≥ 90** on Performance, Accessibility, Best Practices, SEO — both `/en/` and `/ar/`, home and one viz page.
- **Manual bilingual QA per viz:** both languages render, fonts load, RTL layout doesn't break (no text flowing off-screen, controls mirror correctly), numbers format, explainer reads well, hero chart fits mobile viewport.
- **Accessibility baseline:** semantic landmarks, keyboard navigation through all controls, focus rings preserved, `aria-label`s on chart regions, color contrast ≥ WCAG AA (teal on cream passes; verify chart series pair).
- **No formal unit tests for MVP.** Pure-function libs (`solar.ts`, `hijri.ts`, `qibla.ts`) get unit tests in v2 once shapes stabilize.

---

## 11. Delivery plan

Rough effort estimate, assuming focused work:

| Phase | Work | Days |
|---|---|---|
| 0 | Scaffold: Vite + TS + Tailwind + routing + LangProvider + design tokens + deploy workflow | 2 |
| 1 | Port **Fajr Globe** (#1) into new shell, type it, extract cities, write bilingual content | 2 |
| 2 | Build **Fasting Hours** (#2) — reuses solar/cities | 2 |
| 3 | Build **Hijri Drift** (#3) — cheapest, high shareability | 1 |
| 4 | Build **Sun Path & Asr** (#4) | 3 |
| 5 | Build **Qibla Great-Circle** (#5) | 2 |
| 6 | Home page tile grid, About page, 404, OG images, favicon | 1.5 |
| 7 | Bilingual QA + Lighthouse tuning + deploy + DNS | 1.5 |
| **Total** | | **~15 focused days** (3–4 calendar weeks) |

Each phase lands as a standalone PR to `main`, triggering a deploy.

---

## 12. Open questions / risks

- **Arabic prose quality.** The explainers in Arabic need to read natively, not as translations. Consider a native Arabic editor pass after the EN drafts land. Flagged as a v1 blocker if we ship without it.
- **Prayer-time calculation methods.** The data library (`solar.ts` + `calc-methods.ts`) needs care — various sources disagree in edge cases (angle-based vs twilight-based, Shia methods). Cite primary sources (ICOUK, University of Islamic Sciences Karachi) in `calc-methods.ts` comments.
- **Hijri Umalqura accuracy.** `Intl.DateTimeFormat` Umalqura in modern Node/browsers is reliable for ~1800–2077 AH but has edge cases. If Hijri Drift goes outside that range, add a polyfill note.
- **Qibla great-circle on 2D projection.** The "curving through the North Pole" insight depends on the map projection. Use Natural Earth / Robinson, not Mercator — explained in the explainer.

---

## 13. Not in v1 (reminder)

Search, category pages, dark mode, PWA/offline, contribute/PR flow, analytics beyond Cloudflare's, Arabic-Indic numeral mode, v2 viz (inheritance, hilal visibility, Prophets Tree port).
