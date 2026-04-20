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
