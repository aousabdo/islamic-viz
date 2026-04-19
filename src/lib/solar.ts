// Solar geometry for Islamic prayer-time calculations.
// References: NOAA solar position (simplified), University of Islamic Sciences Karachi formulas.
// All angles in degrees in function signatures; internal conversions to radians.

const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

export type Location = { lat: number; lng: number; tz: number };

export function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = d.getTime() - start;
  return Math.floor(diff / 86_400_000);
}

/** Solar declination in degrees for a given day-of-year. Spencer approximation. */
export function solarDeclination(n: number): number {
  const g = (2 * Math.PI * (n - 1)) / 365;
  return (
    0.006918
    - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g)
  ) * DEG;
}

/** Equation of time in minutes. */
export function equationOfTime(n: number): number {
  const g = (2 * Math.PI * (n - 1)) / 365;
  return 229.18 * (
    0.000075
    + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g)
  );
}

/** Solar noon in local clock hours (0–24). */
export function solarNoon(loc: Location, d: Date): number {
  const n = dayOfYear(d);
  const eot = equationOfTime(n);
  return 12 + loc.tz - loc.lng / 15 - eot / 60;
}

/** Hour angle in degrees for sun at given altitude (negative). Returns NaN if sun never reaches altitude. */
export function hourAngle(lat: number, dec: number, altitudeDeg: number): number {
  const h = altitudeDeg * RAD;
  const phi = lat * RAD;
  const delta = dec * RAD;
  const cosH = (Math.sin(h) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
  if (cosH < -1 || cosH > 1) return NaN;
  return Math.acos(cosH) * DEG;
}

/** Sun altitude (deg) at a given local clock hour. */
export function sunAltitude(loc: Location, d: Date, localHour: number): number {
  const n = dayOfYear(d);
  const dec = solarDeclination(n) * RAD;
  const noon = solarNoon(loc, d);
  const H = (localHour - noon) * 15 * RAD;
  const phi = loc.lat * RAD;
  const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  return alt * DEG;
}

export function sunriseSunset(loc: Location, d: Date): { sunrise: number; sunset: number } {
  const n = dayOfYear(d);
  const dec = solarDeclination(n);
  const noon = solarNoon(loc, d);
  // Standard refraction: horizon sun = -0.833°
  const H = hourAngle(loc.lat, dec, -0.833) / 15;
  return { sunrise: noon - H, sunset: noon + H };
}

/** Fajr time in local clock hours. angle is the Fajr twilight angle (e.g., 18, 18.5, 19.5). */
export function fajrTime(loc: Location, d: Date, angle: number): number {
  const n = dayOfYear(d);
  const dec = solarDeclination(n);
  const noon = solarNoon(loc, d);
  const H = hourAngle(loc.lat, dec, -angle) / 15;
  return noon - H;
}

/** Isha time (angle-based). Returns NaN if method uses fixed-interval instead. */
export function ishaTime(loc: Location, d: Date, angle: number): number {
  const n = dayOfYear(d);
  const dec = solarDeclination(n);
  const noon = solarNoon(loc, d);
  const H = hourAngle(loc.lat, dec, -angle) / 15;
  return noon + H;
}

/** Asr time. factor = 1 (Shafi'i/Maliki/Hanbali) or 2 (Hanafi). */
export function asrTime(loc: Location, d: Date, factor: 1 | 2): number {
  const n = dayOfYear(d);
  const dec = solarDeclination(n);
  const noon = solarNoon(loc, d);
  const phi = loc.lat * RAD;
  const delta = dec * RAD;
  const t = Math.abs(phi - delta);
  const altAsr = Math.atan(1 / (factor + Math.tan(t))) * DEG;
  const H = hourAngle(loc.lat, dec, altAsr) / 15;
  return noon + H;
}

/** Convert a decimal hour (0–24) to { hh, mm } strings. */
export function hoursToHHMM(h: number): { hh: string; mm: string } {
  if (!isFinite(h)) return { hh: '--', mm: '--' };
  const norm = ((h % 24) + 24) % 24;
  const hh = Math.floor(norm);
  const mm = Math.round((norm - hh) * 60);
  return { hh: String(hh).padStart(2, '0'), mm: String(mm).padStart(2, '0') };
}
