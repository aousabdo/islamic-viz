import { describe, it, expect } from 'vitest';
import {
  WINTER_SOLSTICE_DAY, SUMMER_SOLSTICE_DAY,
  SPRING_EQUINOX_DAY, AUTUMN_EQUINOX_DAY,
  RAMADAN_2025_START, RAMADAN_2025_END,
} from '../constants';
import { fajrInsight, fastingInsight, hijriInsight, sunPathInsight, qiblaInsight } from '../insights';
import { CITIES } from '../../data/cities';

describe('constants', () => {
  it('WINTER_SOLSTICE_DAY is 355', () => expect(WINTER_SOLSTICE_DAY).toBe(355));
  it('SUMMER_SOLSTICE_DAY is 172', () => expect(SUMMER_SOLSTICE_DAY).toBe(172));
  it('SPRING_EQUINOX_DAY is 80', () => expect(SPRING_EQUINOX_DAY).toBe(80));
  it('AUTUMN_EQUINOX_DAY is 266', () => expect(AUTUMN_EQUINOX_DAY).toBe(266));
  it('RAMADAN_2025_START is 60', () => expect(RAMADAN_2025_START).toBe(60));
  it('RAMADAN_2025_END is 88', () => expect(RAMADAN_2025_END).toBe(88));
});

describe('fajrInsight', () => {
  const makkah = CITIES.find((c) => c.name.startsWith('Makkah'))!;
  const london = CITIES.find((c) => c.name.startsWith('London'))!;
  const sampleData = Array.from({ length: 365 }, (_, i) => ({
    day: i + 1, fajr: 4 + Math.sin(i / 58) * 1.5, sunrise: 6 + Math.sin(i / 58) * 2,
  }));
  it('returns a non-empty string for Makkah', () => {
    const s = fajrInsight(makkah, sampleData, null, null, 'en');
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(10);
  });
  it('includes city2 name when compare mode active', () => {
    const s = fajrInsight(makkah, sampleData, london, sampleData, 'en');
    expect(s).toContain('London');
  });
  it('works in Arabic', () => {
    const s = fajrInsight(makkah, sampleData, null, null, 'ar');
    expect(typeof s).toBe('string');
  });
});

describe('fastingInsight', () => {
  const makkah = CITIES.find((c) => c.name.startsWith('Makkah'))!;
  const data = Array.from({ length: 365 }, (_, i) => ({ day: i + 1, hours: 13 + Math.sin(i / 58) * 2 }));
  it('returns a string', () => {
    expect(typeof fastingInsight(makkah, data, null, null, 'en')).toBe('string');
  });
});

describe('hijriInsight', () => {
  it('returns a string', () => {
    expect(typeof hijriInsight('en')).toBe('string');
  });
});

describe('sunPathInsight', () => {
  const makkah = CITIES.find((c) => c.name.startsWith('Makkah'))!;
  it('returns a string', () => {
    const s = sunPathInsight(makkah, 14.5, 16.2, 'en');
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(10);
  });
});

describe('qiblaInsight', () => {
  const nyc = CITIES.find((c) => c.name.startsWith('New York'))!;
  it('returns a string mentioning distance', () => {
    const s = qiblaInsight(nyc, 58.5, 'en');
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(10);
  });
});
