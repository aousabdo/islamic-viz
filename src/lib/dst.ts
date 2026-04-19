export type DSTRegion = 'us' | 'eu' | 'jordan' | 'palestine' | 'iran' | 'south' | 'none';

function nthDowOfMonth(year: number, month: number, dow: number, n: number): Date {
  const d = new Date(Date.UTC(year, month, 1));
  const offset = (dow - d.getUTCDay() + 7) % 7 + (n - 1) * 7;
  return new Date(Date.UTC(year, month, 1 + offset));
}

function lastDowOfMonth(year: number, month: number, dow: number): Date {
  const d = new Date(Date.UTC(year, month + 1, 0));
  const offset = (d.getUTCDay() - dow + 7) % 7;
  return new Date(Date.UTC(year, month, d.getUTCDate() - offset));
}

function secondSundayOfMarch(y: number) { return nthDowOfMonth(y, 2, 0, 2); }
function firstSundayOfNovember(y: number) { return nthDowOfMonth(y, 10, 0, 1); }
function lastSundayOfMarch(y: number) { return lastDowOfMonth(y, 2, 0); }
function lastSundayOfOctober(y: number) { return lastDowOfMonth(y, 9, 0); }
function firstSundayOfSeptember(y: number) { return nthDowOfMonth(y, 8, 0, 1); }
function firstSundayOfApril(y: number) { return nthDowOfMonth(y, 3, 0, 1); }

export function isDST(region: DSTRegion, date: Date): boolean {
  const y = date.getUTCFullYear();
  const t = date.getTime();
  switch (region) {
    case 'us': {
      const start = secondSundayOfMarch(y).getTime();
      const end = firstSundayOfNovember(y).getTime();
      return t >= start && t < end;
    }
    case 'eu': {
      const start = lastSundayOfMarch(y).getTime();
      const end = lastSundayOfOctober(y).getTime();
      return t >= start && t < end;
    }
    case 'south': {
      const end = firstSundayOfApril(y).getTime();
      const start = firstSundayOfSeptember(y).getTime();
      return t < end || t >= start;
    }
    case 'iran':
      // Iran abolished DST in 2022.
      return false;
    case 'jordan':
    case 'palestine':
      // Simplified: EU rules. Actual rules vary slightly by year.
      return isDST('eu', date);
    case 'none':
    default:
      return false;
  }
}
