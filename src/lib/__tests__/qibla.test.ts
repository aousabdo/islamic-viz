import { describe, it, expect } from 'vitest';
import { qiblaBearing, greatCirclePath } from '../qibla';

const MAKKAH = { lat: 21.4225, lng: 39.8262 };

describe('qiblaBearing', () => {
  it('from Makkah to Makkah is undefined/0', () => {
    const b = qiblaBearing(MAKKAH);
    expect(Number.isNaN(b) || b === 0).toBe(true);
  });
  it('from NYC (40.71, -74.01) is ~58° (NE)', () => {
    const b = qiblaBearing({ lat: 40.7128, lng: -74.006 });
    expect(b).toBeGreaterThan(55);
    expect(b).toBeLessThan(62);
  });
  it('from Jakarta (-6.17, 106.85) is ~295° (WNW)', () => {
    const b = qiblaBearing({ lat: -6.175, lng: 106.845 });
    expect(b).toBeGreaterThan(290);
    expect(b).toBeLessThan(300);
  });
});

describe('greatCirclePath', () => {
  it('returns N+1 points from origin to Makkah', () => {
    const pts = greatCirclePath({ lat: 40.7128, lng: -74.006 }, MAKKAH, 32);
    expect(pts.length).toBe(33);
    expect(pts[0]).toEqual({ lat: 40.7128, lng: -74.006 });
    expect(pts[32].lat).toBeCloseTo(MAKKAH.lat, 2);
    expect(pts[32].lng).toBeCloseTo(MAKKAH.lng, 2);
  });
});
