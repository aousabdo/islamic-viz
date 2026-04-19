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

/** Find the Gregorian date of 1 Ramadan for a given Hijri year by scanning Jan 1 ± 2 years. */
export function ramadanStart(hYear: number): Date {
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
