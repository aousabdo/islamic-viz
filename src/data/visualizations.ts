import type { ComponentType } from 'react';

export type VizSlug = 'fajr-globe' | 'fasting-hours' | 'hijri-drift' | 'sun-path-asr' | 'qibla-great-circle';

export type VizConfig = {
  slug: VizSlug;
  tag: string;                       // e.g., 'astronomy'
  Chart: ComponentType;              // the viz itself; reads its own state internally
};

// Populated as each viz lands (Tasks 16-20).
export const VISUALIZATIONS: Record<VizSlug, VizConfig | null> = {
  'fajr-globe': null,
  'fasting-hours': null,
  'hijri-drift': null,
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
