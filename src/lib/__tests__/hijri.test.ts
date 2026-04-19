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
    // Hijri year is ~354 days; each subsequent Ramadan falls ~11 days earlier
    // within the Gregorian year. Measure the within-year drift.
    const absDiff = (d2.getTime() - d1.getTime()) / 86400000;
    const diffDays = 365 - absDiff;
    expect(diffDays).toBeGreaterThan(9);
    expect(diffDays).toBeLessThan(13);
  });
});
