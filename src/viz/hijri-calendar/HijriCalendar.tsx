import { useMemo, useState } from 'react';
import { gregorianToHijri } from '../../lib/hijri';
import { useLang } from '../../i18n/useLang';
import contentEn from './content.en.json';
import contentAr from './content.ar.json';

const HIJRI_MONTH_NAMES_EN = [
  'Muharram','Safar','Rabi I','Rabi II','Jumada I','Jumada II',
  'Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhu al-Qi'dah",'Dhu al-Hijjah',
];
const HIJRI_MONTH_NAMES_AR = [
  'محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة',
  'رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة',
];
const GREGORIAN_MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function findHijriMonthStart(hYear: number, hMonth: number): Date | null {
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
  hMonth: number;
  startDay: number;
  lengthDays: number;
};

function buildBars(hYear: number): MonthBar[] {
  const bars: MonthBar[] = [];
  const approxGYear = Math.floor(hYear * 0.970229 + 621.5643);
  const gYearStart = Date.UTC(approxGYear, 0, 1);

  for (let m = 1; m <= 12; m++) {
    const start = findHijriMonthStart(hYear, m);
    if (!start) continue;
    const next  = (m < 12) ? findHijriMonthStart(hYear, m + 1) : findHijriMonthStart(hYear + 1, 1);
    const length = next ? Math.round((next.getTime() - start.getTime()) / 86_400_000) : 29;
    const startDay = Math.floor((start.getTime() - gYearStart) / 86_400_000);
    bars.push({ hMonth: m, startDay, lengthDays: length });
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
                <text x={LABEL_W - 8} y={y + ROW_H / 2 + 4}
                  textAnchor="end" fontSize={10} fill={isRamadan ? 'var(--chart-1)' : isDhulHijj ? 'var(--gold)' : 'var(--ink-dim)'}>
                  {monthNames[hMonth - 1]}
                </text>
                <rect x={Math.max(LABEL_W, x)} y={y} width={Math.min(barW, W - Math.max(LABEL_W, x))}
                  height={ROW_H} rx={4}
                  fill={color} opacity={opacity} />
                <text x={Math.max(LABEL_W, x) + 4} y={y + ROW_H / 2 + 4}
                  fontSize={9} fill={isRamadan || isDhulHijj ? 'var(--bg)' : 'var(--ink-dim)'}>
                  {hMonth}
                </text>
              </g>
            );
          })}

          {/* "11 days earlier" annotation on Ramadan */}
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
