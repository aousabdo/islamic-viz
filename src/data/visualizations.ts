import type { ComponentType } from 'react';
import FajrGlobe from '../viz/fajr-globe/FajrGlobe';
import FastingHours from '../viz/fasting-hours/FastingHours';
import HijriDrift from '../viz/hijri-drift/HijriDrift';

export type VizSlug = 'fajr-globe' | 'fasting-hours' | 'hijri-drift' | 'sun-path-asr' | 'qibla-great-circle';

export type VizConfig = {
  slug: VizSlug;
  tag: string;                       // e.g., 'astronomy'
  Chart: ComponentType;              // the viz itself; reads its own state internally
};

// Populated as each viz lands (Tasks 16-20).
export const VISUALIZATIONS: Record<VizSlug, VizConfig | null> = {
  'fajr-globe': { slug: 'fajr-globe', tag: 'astronomy', Chart: FajrGlobe },
  'fasting-hours': { slug: 'fasting-hours', tag: 'astronomy', Chart: FastingHours },
  'hijri-drift': { slug: 'hijri-drift', tag: 'calendar', Chart: HijriDrift },
  'sun-path-asr': null,
  'qibla-great-circle': null,
};

export const VIZ_ORDER: VizSlug[] = [
  'fajr-globe',
  'fasting-hours',
  'hijri-drift',
  'sun-path-asr',
  'qibla-great-circle',
];
