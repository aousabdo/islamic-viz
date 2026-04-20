// src/lib/insights.ts
import type { City } from '../data/cities';
import { dayToMonth } from './chartUtils';
import { haversineDistance } from './qibla';
import { gregorianToHijri, ramadanStart } from './hijri';

export type Lang = 'en' | 'ar';

export type FajrPoint    = { day: number; fajr: number; sunrise: number };
export type FastingPoint = { day: number; hours: number };

// ── helpers ──────────────────────────────────────────────────────────────────

function cityName(city: City, lang: Lang): string {
  return (lang === 'ar' && city.nameAr) ? city.nameAr : city.name.split(',')[0];
}

function fmtHm(decHours: number): string {
  const h = Math.floor(decHours);
  const m = Math.round((decHours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── fajrInsight ───────────────────────────────────────────────────────────────

export function fajrInsight(
  city: City,
  data: FajrPoint[],
  city2: City | null,
  data2: FajrPoint[] | null,
  lang: Lang,
): string {
  const valid = data.filter((p) => isFinite(p.fajr) && isFinite(p.sunrise));
  if (valid.length === 0) return lang === 'ar' ? 'لا توجد بيانات.' : 'No data available.';

  const polarDays = data.length - valid.length;
  const cn = cityName(city, lang);

  if (polarDays > 10) {
    return lang === 'ar'
      ? `⚠️ ${cn} لديها ${polarDays} يومًا لا يُعرَّف فيها وقت الفجر — الشفق لا ينتهي قرب الانقلاب الصيفي.`
      : `⚠️ ${cn} has ${polarDays} days with no defined Fajr — twilight never fully ends near the summer solstice.`;
  }

  const gaps = valid.map((p) => ({ day: p.day, gap: p.sunrise - p.fajr }));
  const maxG = gaps.reduce((a, b) => (b.gap > a.gap ? b : a));
  const minG = gaps.reduce((a, b) => (b.gap < a.gap ? b : a));
  const factor = (maxG.gap / minG.gap).toFixed(1);

  if (city2 && data2) {
    const valid2 = data2.filter((p) => isFinite(p.fajr) && isFinite(p.sunrise));
    const maxG2 = valid2.reduce(
      (a, b) => (b.sunrise - b.fajr > a.sunrise - a.fajr ? b : a),
      valid2[0],
    );
    const diff = maxG.gap - (maxG2.sunrise - maxG2.fajr);
    const cn2 = cityName(city2, lang);
    const diffMin = Math.abs(diff * 60).toFixed(0);
    const dir = lang === 'ar' ? (diff > 0 ? 'أطول' : 'أقصر') : (diff > 0 ? 'longer' : 'shorter');
    return lang === 'ar'
      ? `في ${cn}، فجوة الفجر–الشروق تبلغ ${fmtHm(maxG.gap)} في ${dayToMonth(maxG.day)} — بفارق ${diffMin} دقيقة ${dir} مقارنةً بـ ${cn2}.`
      : `In ${cn}, the Fajr–Sunrise gap peaks at ${fmtHm(maxG.gap)} in ${dayToMonth(maxG.day)} — ${diffMin} min ${dir} than ${cn2}.`;
  }

  return lang === 'ar'
    ? `في ${cn}، فجوة الفجر–الشروق تبلغ ذروتها ${fmtHm(maxG.gap)} في ${dayToMonth(maxG.day)} — ${factor}× أوسع من أضيق نقطة في السنة.`
    : `In ${cn}, the Fajr–Sunrise gap peaks at ${fmtHm(maxG.gap)} in ${dayToMonth(maxG.day)} — ${factor}× wider than its narrowest point in the year.`;
}

// ── fastingInsight ────────────────────────────────────────────────────────────

export function fastingInsight(
  city: City,
  data: FastingPoint[],
  city2: City | null,
  data2: FastingPoint[] | null,
  lang: Lang,
): string {
  const valid = data.filter((p) => isFinite(p.hours) && p.hours > 0);
  if (valid.length === 0) return lang === 'ar' ? 'لا توجد بيانات.' : 'No data available.';

  const maxP = valid.reduce((a, b) => (b.hours > a.hours ? b : a));
  const minP = valid.reduce((a, b) => (b.hours < a.hours ? b : a));
  const cn   = cityName(city, lang);
  const isExtreme = maxP.hours > 20;
  const isEquatorial = Math.abs(city.lat) < 15;

  if (city2 && data2) {
    const valid2  = data2.filter((p) => isFinite(p.hours) && p.hours > 0);
    const maxP2   = valid2.reduce((a, b) => (b.hours > a.hours ? b : a), valid2[0]);
    const diff    = maxP.hours - maxP2.hours;
    const cn2     = cityName(city2, lang);
    return lang === 'ar'
      ? `في ذروة الصيام، ${cn} (${maxP.hours.toFixed(1)}h) ${diff > 0 ? 'أطول' : 'أقصر'} بـ ${Math.abs(diff).toFixed(1)} ساعة مقارنةً بـ ${cn2} (${maxP2.hours.toFixed(1)}h).`
      : `At peak, ${cn} (${maxP.hours.toFixed(1)}h) fasts ${Math.abs(diff).toFixed(1)} hrs ${diff > 0 ? 'longer' : 'shorter'} than ${cn2} (${maxP2.hours.toFixed(1)}h).`;
  }

  if (isExtreme) {
    return lang === 'ar'
      ? `⚠️ في ${cn}، تبلغ ساعات الصيام ${maxP.hours.toFixed(1)} ساعة في ${dayToMonth(maxP.day)} — تجيز بعض المذاهب التخفيف بناءً على خط العرض.`
      : `⚠️ ${cn} peaks at ${maxP.hours.toFixed(1)} fasting hours in ${dayToMonth(maxP.day)} — traditional scholars permit latitude-based adjustments at this extreme.`;
  }
  if (isEquatorial) {
    const swing = ((maxP.hours - minP.hours) * 60).toFixed(0);
    return lang === 'ar'
      ? `${cn} قريبة من خط الاستواء — لا يتغير وقت الصيام إلا بمقدار ${swing} دقيقة على مدار السنة.`
      : `${cn} sits near the equator — fasting hours vary by only ${swing} minutes across the entire year.`;
  }

  return lang === 'ar'
    ? `في ${cn}، تبلغ ساعات الصيام ذروتها ${maxP.hours.toFixed(1)} ساعة في ${dayToMonth(maxP.day)} وأدناها ${minP.hours.toFixed(1)} ساعة في ${dayToMonth(minP.day)}.`
    : `In ${cn}, fasting peaks at ${maxP.hours.toFixed(1)} hrs in ${dayToMonth(maxP.day)} and drops to ${minP.hours.toFixed(1)} hrs in ${dayToMonth(minP.day)}.`;
}

// ── hijriInsight ──────────────────────────────────────────────────────────────

export function hijriInsight(lang: Lang): string {
  const now = new Date();
  const hNow = gregorianToHijri(now);
  let ramadanG: Date;
  try { ramadanG = ramadanStart(hNow.year); } catch { return ''; }

  const doy = Math.floor(
    (ramadanG.getTime() - Date.UTC(ramadanG.getUTCFullYear(), 0, 0)) / 86_400_000,
  );
  const month = dayToMonth(doy);
  const nextCycleYear = ramadanG.getUTCFullYear() + 33;

  return lang === 'ar'
    ? `رمضان ${hNow.year} يبدأ في ${month} ${ramadanG.getUTCFullYear()} — بسبب دورة ٣٣ عامًا، سيعود رمضان إلى نفس الموسم تقريبًا عام ${nextCycleYear}.`
    : `Ramadan ${hNow.year} AH starts in ${month} ${ramadanG.getUTCFullYear()} — due to the 33-year Hijri cycle, it returns to the same season around ${nextCycleYear}.`;
}

// ── sunPathInsight ────────────────────────────────────────────────────────────

export function sunPathInsight(
  city: City,
  asrShafii: number,
  asrHanafi: number,
  lang: Lang,
): string {
  const diffMin = Math.round((asrHanafi - asrShafii) * 60);
  const cn = cityName(city, lang);
  return lang === 'ar'
    ? `في ${cn} اليوم، العصر الحنفي يأتي ${diffMin} دقيقة بعد العصر الشافعي. يتسع هذا الفارق بزيادة خط العرض وفي الشتاء — وقد يتجاوز ساعتين في لندن شتاءً.`
    : `In ${cn} today, the Hanafi Asr is ${diffMin} min later than the Shafi'i Asr. This gap widens with latitude and in winter — exceeding 2 hours in London in December.`;
}

// ── qiblaInsight ─────────────────────────────────────────────────────────────

export function qiblaInsight(city: City, bearing: number, lang: Lang): string {
  const cn  = cityName(city, lang);
  const km  = Math.round(haversineDistance({ lat: city.lat, lng: city.lng }, { lat: 21.4225, lng: 39.8262 }));
  const mi  = Math.round(km * 0.621371);

  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const dir  = dirs[Math.round(bearing / 22.5) % 16];

  const bendNote = city.lat > 40
    ? (lang === 'ar' ? 'ينحني المسار شمالًا فوق المحيط الأطلسي/القطب الشمالي' : 'the path bends north over the Atlantic/Arctic')
    : city.lat < -10
    ? (lang === 'ar' ? 'ينحني المسار جنوبًا نحو المحيط الهندي' : 'the path curves south over the Indian Ocean')
    : (lang === 'ar' ? 'يسير المسار شبه مستقيم عبر المناطق الاستوائية' : 'the path runs nearly straight across the tropics');

  return lang === 'ar'
    ? `من ${cn}، مكة المكرمة تقع على بُعد ${km.toLocaleString()} كم (${mi.toLocaleString()} ميل) باتجاه ${bearing.toFixed(1)}° — ${bendNote} على سطح الكرة الأرضية.`
    : `From ${cn}, Makkah is ${km.toLocaleString()} km (${mi.toLocaleString()} mi) at ${bearing.toFixed(1)}° (${dir}) — ${bendNote} on the sphere.`;
}
