import type { DSTRegion } from '../lib/dst';

export type City = {
  name: string;      // English display name, e.g., "Makkah, Saudi Arabia"
  nameAr?: string;   // Optional Arabic name (populated later if desired)
  lat: number;
  lng: number;
  tz: number;        // base UTC offset (pre-DST)
  dstType: DSTRegion;
};

// Ported from legacy/fajr-sunrise-global.jsx.
// NOTE: legacy used 'au' for Australia and 'nz' for New Zealand; neither is in
// the DSTRegion union (which covers: us, eu, jordan, palestine, iran, south, none).
// Australia and New Zealand both use southern-hemisphere DST, so they're mapped
// to 'south' here as the closest approximation.
export const CITIES: City[] = [
  // North America
  { name: "Falls Church, VA (22041)", lat: 38.846, lng: -77.169, tz: -5, dstType: "us" },
  { name: "New York, USA", lat: 40.713, lng: -74.006, tz: -5, dstType: "us" },
  { name: "Los Angeles, USA", lat: 34.052, lng: -118.244, tz: -8, dstType: "us" },
  { name: "Chicago, USA", lat: 41.878, lng: -87.630, tz: -6, dstType: "us" },
  { name: "Houston, USA", lat: 29.760, lng: -95.370, tz: -6, dstType: "us" },
  { name: "Toronto, Canada", lat: 43.653, lng: -79.383, tz: -5, dstType: "us" },
  { name: "Vancouver, Canada", lat: 49.283, lng: -123.121, tz: -8, dstType: "us" },
  { name: "Mexico City, Mexico", lat: 19.433, lng: -99.133, tz: -6, dstType: "none" },
  // South America
  { name: "São Paulo, Brazil", lat: -23.551, lng: -46.634, tz: -3, dstType: "none" },
  { name: "Buenos Aires, Argentina", lat: -34.604, lng: -58.382, tz: -3, dstType: "none" },
  { name: "Bogotá, Colombia", lat: 4.711, lng: -74.072, tz: -5, dstType: "none" },
  { name: "Lima, Peru", lat: -12.046, lng: -77.043, tz: -5, dstType: "none" },
  { name: "Santiago, Chile", lat: -33.449, lng: -70.669, tz: -4, dstType: "south" },
  // Europe
  { name: "London, UK", lat: 51.507, lng: -0.128, tz: 0, dstType: "eu" },
  { name: "Paris, France", lat: 48.857, lng: 2.352, tz: 1, dstType: "eu" },
  { name: "Berlin, Germany", lat: 52.520, lng: 13.405, tz: 1, dstType: "eu" },
  { name: "Madrid, Spain", lat: 40.417, lng: -3.704, tz: 1, dstType: "eu" },
  { name: "Rome, Italy", lat: 41.902, lng: 12.496, tz: 1, dstType: "eu" },
  { name: "Amsterdam, Netherlands", lat: 52.370, lng: 4.895, tz: 1, dstType: "eu" },
  { name: "Stockholm, Sweden", lat: 59.329, lng: 18.069, tz: 1, dstType: "eu" },
  { name: "Oslo, Norway", lat: 59.914, lng: 10.752, tz: 1, dstType: "eu" },
  { name: "Helsinki, Finland", lat: 60.170, lng: 24.941, tz: 2, dstType: "eu" },
  { name: "Moscow, Russia", lat: 55.756, lng: 37.617, tz: 3, dstType: "none" },
  { name: "Istanbul, Turkey", lat: 41.009, lng: 28.978, tz: 3, dstType: "none" },
  { name: "Athens, Greece", lat: 37.984, lng: 23.728, tz: 2, dstType: "eu" },
  // Middle East
  { name: "Makkah, Saudi Arabia", lat: 21.423, lng: 39.826, tz: 3, dstType: "none" },
  { name: "Madinah, Saudi Arabia", lat: 24.471, lng: 39.612, tz: 3, dstType: "none" },
  { name: "Riyadh, Saudi Arabia", lat: 24.713, lng: 46.675, tz: 3, dstType: "none" },
  { name: "Jeddah, Saudi Arabia", lat: 21.486, lng: 39.188, tz: 3, dstType: "none" },
  { name: "Dubai, UAE", lat: 25.205, lng: 55.271, tz: 4, dstType: "none" },
  { name: "Amman, Jordan", lat: 31.956, lng: 35.946, tz: 3, dstType: "jordan" },
  { name: "Jerusalem, Palestine", lat: 31.769, lng: 35.216, tz: 2, dstType: "palestine" },
  { name: "Beirut, Lebanon", lat: 33.894, lng: 35.502, tz: 2, dstType: "eu" },
  { name: "Baghdad, Iraq", lat: 33.313, lng: 44.366, tz: 3, dstType: "none" },
  { name: "Tehran, Iran", lat: 35.689, lng: 51.389, tz: 3.5, dstType: "iran" },
  { name: "Kuwait City, Kuwait", lat: 29.376, lng: 47.977, tz: 3, dstType: "none" },
  { name: "Doha, Qatar", lat: 25.286, lng: 51.535, tz: 3, dstType: "none" },
  { name: "Muscat, Oman", lat: 23.588, lng: 58.382, tz: 4, dstType: "none" },
  { name: "Sana'a, Yemen", lat: 15.355, lng: 44.207, tz: 3, dstType: "none" },
  // Africa
  { name: "Cairo, Egypt", lat: 30.044, lng: 31.236, tz: 2, dstType: "none" },
  { name: "Casablanca, Morocco", lat: 33.573, lng: -7.589, tz: 1, dstType: "none" },
  { name: "Lagos, Nigeria", lat: 6.524, lng: 3.379, tz: 1, dstType: "none" },
  { name: "Nairobi, Kenya", lat: -1.286, lng: 36.817, tz: 3, dstType: "none" },
  { name: "Cape Town, South Africa", lat: -33.925, lng: 18.424, tz: 2, dstType: "none" },
  { name: "Johannesburg, South Africa", lat: -26.204, lng: 28.046, tz: 2, dstType: "none" },
  { name: "Addis Ababa, Ethiopia", lat: 9.025, lng: 38.747, tz: 3, dstType: "none" },
  { name: "Dakar, Senegal", lat: 14.693, lng: -17.444, tz: 0, dstType: "none" },
  // South Asia
  { name: "Islamabad, Pakistan", lat: 33.693, lng: 73.036, tz: 5, dstType: "none" },
  { name: "Karachi, Pakistan", lat: 24.861, lng: 67.010, tz: 5, dstType: "none" },
  { name: "Lahore, Pakistan", lat: 31.550, lng: 74.350, tz: 5, dstType: "none" },
  { name: "Delhi, India", lat: 28.614, lng: 77.209, tz: 5.5, dstType: "none" },
  { name: "Mumbai, India", lat: 19.076, lng: 72.878, tz: 5.5, dstType: "none" },
  { name: "Dhaka, Bangladesh", lat: 23.811, lng: 90.413, tz: 6, dstType: "none" },
  { name: "Colombo, Sri Lanka", lat: 6.927, lng: 79.862, tz: 5.5, dstType: "none" },
  { name: "Kabul, Afghanistan", lat: 34.553, lng: 69.208, tz: 4.5, dstType: "none" },
  // East & Southeast Asia
  { name: "Beijing, China", lat: 39.904, lng: 116.407, tz: 8, dstType: "none" },
  { name: "Shanghai, China", lat: 31.230, lng: 121.474, tz: 8, dstType: "none" },
  { name: "Tokyo, Japan", lat: 35.682, lng: 139.692, tz: 9, dstType: "none" },
  { name: "Seoul, South Korea", lat: 37.567, lng: 126.978, tz: 9, dstType: "none" },
  { name: "Jakarta, Indonesia", lat: -6.175, lng: 106.845, tz: 7, dstType: "none" },
  { name: "Kuala Lumpur, Malaysia", lat: 3.139, lng: 101.687, tz: 8, dstType: "none" },
  { name: "Singapore", lat: 1.352, lng: 103.820, tz: 8, dstType: "none" },
  { name: "Bangkok, Thailand", lat: 13.756, lng: 100.502, tz: 7, dstType: "none" },
  { name: "Manila, Philippines", lat: 14.600, lng: 120.984, tz: 8, dstType: "none" },
  { name: "Hanoi, Vietnam", lat: 21.028, lng: 105.854, tz: 7, dstType: "none" },
  // Central Asia
  { name: "Tashkent, Uzbekistan", lat: 41.299, lng: 69.240, tz: 5, dstType: "none" },
  { name: "Almaty, Kazakhstan", lat: 43.238, lng: 76.946, tz: 6, dstType: "none" },
  // Oceania (legacy 'au'/'nz' mapped to 'south' — both use southern-hemisphere DST)
  { name: "Sydney, Australia", lat: -33.869, lng: 151.209, tz: 10, dstType: "south" },
  { name: "Melbourne, Australia", lat: -37.814, lng: 144.963, tz: 10, dstType: "south" },
  { name: "Auckland, New Zealand", lat: -36.849, lng: 174.763, tz: 12, dstType: "south" },
];
