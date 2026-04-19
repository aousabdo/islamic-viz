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
