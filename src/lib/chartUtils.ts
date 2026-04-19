// src/lib/chartUtils.ts
export const MONTH_LABELS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

/** X-axis tick positions: first day of each month in a non-leap year. */
export const MONTH_TICKS = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

/**
 * Convert a day-of-year integer (1–365) to a 3-letter month abbreviation.
 * Uses 2025 (non-leap) as reference year.
 */
export function dayToMonth(day: number): string {
  const d = new Date(Date.UTC(2025, 0, day));
  return MONTH_LABELS[d.getUTCMonth()];
}
