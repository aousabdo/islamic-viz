// Qibla bearing + great-circle path interpolation.
// Formulas from Aviation Formulary (E. Williams, http://www.edwilliams.org/avform.htm).

const MAKKAH = { lat: 21.4225, lng: 39.8262 };
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export type LatLng = { lat: number; lng: number };

/** Initial great-circle bearing from origin to Makkah, in degrees 0..360 (N = 0). */
export function qiblaBearing(origin: LatLng): number {
  const φ1 = origin.lat * RAD;
  const φ2 = MAKKAH.lat * RAD;
  const Δλ = (MAKKAH.lng - origin.lng) * RAD;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x) * DEG;
  return ((θ + 360) % 360);
}

/** N+1 points along the great-circle from a to b, inclusive. */
export function greatCirclePath(a: LatLng, b: LatLng, segments = 64): LatLng[] {
  const φ1 = a.lat * RAD, λ1 = a.lng * RAD;
  const φ2 = b.lat * RAD, λ2 = b.lng * RAD;
  const Δ = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
  ));
  if (Δ === 0) return Array(segments + 1).fill({ lat: a.lat, lng: a.lng });
  const pts: LatLng[] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * Δ) / Math.sin(Δ);
    const B = Math.sin(f * Δ) / Math.sin(Δ);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);
    pts.push({ lat: φ * DEG, lng: λ * DEG });
  }
  return pts;
}

export const MAKKAH_COORDS: LatLng = MAKKAH;
