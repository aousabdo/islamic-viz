// Standard Islamic prayer-time calculation methods.
// Sources: praytimes.org, University of Islamic Sciences Karachi, Umm al-Qura, ISNA.

export type IshaMode = { kind: 'angle'; angle: number } | { kind: 'interval'; minutes: number };

export type CalcMethod = {
  id: string;
  labelEn: string;
  labelAr: string;
  fajrAngle: number;       // degrees below horizon
  ishaMode: IshaMode;
  notes?: string;
};

export const CALC_METHODS: CalcMethod[] = [
  { id: 'mwl',     labelEn: 'Muslim World League',            labelAr: 'رابطة العالم الإسلامي', fajrAngle: 18,   ishaMode: { kind: 'angle', angle: 17 } },
  { id: 'isna',    labelEn: 'ISNA (North America)',           labelAr: 'الجمعية الإسلامية',    fajrAngle: 15,   ishaMode: { kind: 'angle', angle: 15 } },
  { id: 'umm',     labelEn: 'Umm al-Qura (Makkah)',           labelAr: 'أم القرى',              fajrAngle: 18.5, ishaMode: { kind: 'interval', minutes: 90 } },
  { id: 'egypt',   labelEn: 'Egyptian General Authority',     labelAr: 'الهيئة المصرية',        fajrAngle: 19.5, ishaMode: { kind: 'angle', angle: 17.5 } },
  { id: 'karachi', labelEn: 'Karachi (Univ. Islamic Sci.)',   labelAr: 'كراتشي',                fajrAngle: 18,   ishaMode: { kind: 'angle', angle: 18 } },
  { id: 'tehran',  labelEn: 'Tehran (Institute of Geophysics)', labelAr: 'طهران',               fajrAngle: 17.7, ishaMode: { kind: 'angle', angle: 14 } },
  { id: 'jafari',  labelEn: 'Shia Ithna-Ashari (Jafari)',     labelAr: 'الجعفري',               fajrAngle: 16,   ishaMode: { kind: 'angle', angle: 14 } },
];

export function getMethod(id: string): CalcMethod {
  return CALC_METHODS.find((m) => m.id === id) ?? CALC_METHODS[0];
}
