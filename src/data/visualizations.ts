import type { ComponentType } from 'react';
import FajrGlobe    from '../viz/fajr-globe/FajrGlobe';
import FastingHours from '../viz/fasting-hours/FastingHours';
import HijriDrift   from '../viz/hijri-drift/HijriDrift';
import SunPathAsr   from '../viz/sun-path-asr/SunPathAsr';
import QiblaGC      from '../viz/qibla-great-circle/QiblaGC';
import PrayerDay    from '../viz/prayer-day/PrayerDay';
import QiblaGlobe   from '../viz/qibla-globe/QiblaGlobe';
import FastingHeatmap from '../viz/fasting-heatmap/FastingHeatmap';
import AsrShadow    from '../viz/asr-shadow/AsrShadow';
import HijriCalendar from '../viz/hijri-calendar/HijriCalendar';
import PolarAnomaly from '../viz/polar-anomaly/PolarAnomaly';
import Analemma     from '../viz/analemma/Analemma';
import RamadanWorld from '../viz/ramadan-world/RamadanWorld';

export type VizSlug =
  | 'fajr-globe'
  | 'fasting-hours'
  | 'hijri-drift'
  | 'sun-path-asr'
  | 'qibla-great-circle'
  | 'prayer-day'
  | 'qibla-globe'
  | 'fasting-heatmap'
  | 'asr-shadow'
  | 'hijri-calendar'
  | 'polar-anomaly'
  | 'analemma'
  | 'ramadan-world';

export type VizConfig = {
  slug: VizSlug;
  tag: string;
  Chart: ComponentType;
};

export const VISUALIZATIONS: Record<VizSlug, VizConfig> = {
  'fajr-globe':         { slug: 'fajr-globe',         tag: 'astronomy', Chart: FajrGlobe      },
  'fasting-hours':      { slug: 'fasting-hours',      tag: 'astronomy', Chart: FastingHours   },
  'hijri-drift':        { slug: 'hijri-drift',        tag: 'calendar',  Chart: HijriDrift     },
  'sun-path-asr':       { slug: 'sun-path-asr',       tag: 'fiqh',      Chart: SunPathAsr     },
  'qibla-great-circle': { slug: 'qibla-great-circle', tag: 'geometry',  Chart: QiblaGC        },
  'prayer-day':         { slug: 'prayer-day',         tag: 'astronomy', Chart: PrayerDay      },
  'qibla-globe':        { slug: 'qibla-globe',        tag: 'geometry',  Chart: QiblaGlobe     },
  'fasting-heatmap':    { slug: 'fasting-heatmap',    tag: 'astronomy', Chart: FastingHeatmap },
  'asr-shadow':         { slug: 'asr-shadow',         tag: 'fiqh',      Chart: AsrShadow      },
  'hijri-calendar':     { slug: 'hijri-calendar',     tag: 'calendar',  Chart: HijriCalendar  },
  'polar-anomaly':      { slug: 'polar-anomaly',      tag: 'astronomy', Chart: PolarAnomaly   },
  'analemma':           { slug: 'analemma',           tag: 'astronomy', Chart: Analemma       },
  'ramadan-world':      { slug: 'ramadan-world',      tag: 'calendar',  Chart: RamadanWorld   },
};

export const VIZ_ORDER: VizSlug[] = [
  'fajr-globe',
  'fasting-hours',
  'hijri-drift',
  'sun-path-asr',
  'qibla-great-circle',
  'prayer-day',
  'qibla-globe',
  'fasting-heatmap',
  'asr-shadow',
  'hijri-calendar',
  'polar-anomaly',
  'analemma',
  'ramadan-world',
];
