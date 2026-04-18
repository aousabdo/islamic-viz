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
