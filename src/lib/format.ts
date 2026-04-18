export type Lang = 'en' | 'ar';

export function formatNumber(
  n: number,
  _lang: Lang,
  opts: Intl.NumberFormatOptions = {},
): string {
  // v1 choice: Western digits in both languages (see spec §6).
  return new Intl.NumberFormat('en-US', opts).format(n);
}

type FormatDateOpts = Intl.DateTimeFormatOptions & {
  calendar: 'gregory' | 'islamic-umalqura';
};

export function formatDate(
  d: Date,
  lang: Lang,
  opts: FormatDateOpts,
): string {
  const locale = lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US-u-nu-latn';
  // Default to UTC so callers passing Date.UTC(...) see the intended day.
  const resolved: FormatDateOpts = { timeZone: 'UTC', ...opts };
  return new Intl.DateTimeFormat(locale, resolved).format(d);
}
