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

  const seasonTicks = [1, 80, 172, 266, 355];
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
            <YAxis type="number" dataKey="dayOfYear" domain={[0, 366]} ticks={seasonTicks} tickFormatter={(t: number) => seasonLabels[seasonTicks.indexOf(t)] ?? ''} stroke="var(--ink-dim)" reversed />
            <Tooltip
              formatter={(v, name) => name === 'dayOfYear' ? `Day ${v}` : String(v)}
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
