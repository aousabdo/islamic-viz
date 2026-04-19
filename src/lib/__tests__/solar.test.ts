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
  it('Makkah sunrise on 2025-06-21 is ~05:39 local (NOAA algorithm)', () => {
    const { sunrise } = sunriseSunset({ lat: 21.4225, lng: 39.8262, tz: 3 }, new Date(Date.UTC(2025, 5, 21)));
    // Pure NOAA solar math without elevation/ihtiyat corrections; islamicfinder/aladhan
    // publish ~05:48 due to method-specific padding we do not apply here.
    expect(sunrise).toBeGreaterThan(5.62);
    expect(sunrise).toBeLessThan(5.68);
  });
});

describe('fajrTime', () => {
  it('Makkah Fajr on 2025-06-21 with Umm al-Qura (Fajr angle 18.5°) is ~04:11 (NOAA algorithm)', () => {
    const t = fajrTime({ lat: 21.4225, lng: 39.8262, tz: 3 }, new Date(Date.UTC(2025, 5, 21)), 18.5);
    // Pure NOAA solar math; islamicfinder reports ~04:25 with method-specific padding.
    expect(t).toBeGreaterThan(4.16);
    expect(t).toBeLessThan(4.22);
  });
});
