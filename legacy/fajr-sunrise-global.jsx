import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

const CITIES = [
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
  // Oceania
  { name: "Sydney, Australia", lat: -33.869, lng: 151.209, tz: 10, dstType: "au" },
  { name: "Melbourne, Australia", lat: -37.814, lng: 144.963, tz: 10, dstType: "au" },
  { name: "Auckland, New Zealand", lat: -36.849, lng: 174.763, tz: 12, dstType: "nz" },
];

const REGIONS = [
  { label: "North America", filter: c => ["USA","Canada","Mexico"].some(x => c.name.includes(x)) || c.name.includes("22041") },
  { label: "South America", filter: c => ["Brazil","Argentina","Colombia","Peru","Chile"].some(x => c.name.includes(x)) },
  { label: "Europe", filter: c => ["UK","France","Germany","Spain","Italy","Netherlands","Sweden","Norway","Finland","Russia","Turkey","Greece"].some(x => c.name.includes(x)) },
  { label: "Middle East", filter: c => ["Saudi","UAE","Jordan","Palestine","Lebanon","Iraq","Iran","Kuwait","Qatar","Oman","Yemen"].some(x => c.name.includes(x)) },
  { label: "Africa", filter: c => ["Egypt","Morocco","Nigeria","Kenya","South Africa","Ethiopia","Senegal"].some(x => c.name.includes(x)) },
  { label: "South Asia", filter: c => ["Pakistan","India","Bangladesh","Sri Lanka","Afghanistan"].some(x => c.name.includes(x)) },
  { label: "East & SE Asia", filter: c => ["China","Japan","Korea","Indonesia","Malaysia","Singapore","Thailand","Philippines","Vietnam"].some(x => c.name.includes(x)) },
  { label: "Central Asia", filter: c => ["Uzbekistan","Kazakhstan"].some(x => c.name.includes(x)) },
  { label: "Oceania", filter: c => ["Australia","Zealand"].some(x => c.name.includes(x)) },
];

const CONVENTIONS = {
  "ISNA": { name: "ISNA (15°)", angle: 15 },
  "MWL": { name: "Muslim World League (18°)", angle: 18 },
  "Egypt": { name: "Egyptian Authority (19.5°)", angle: 19.5 },
  "Umm": { name: "Umm al-Qura (18.5°)", angle: 18.5 },
};

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}
function solarDeclination(doy) {
  return -23.44 * Math.cos(RAD * (360 / 365) * (doy + 10));
}
function equationOfTime(doy) {
  const B = RAD * (360 / 365) * (doy - 81);
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}
function hourAngle(lat, decl, angle) {
  const latR = lat * RAD;
  const declR = decl * RAD;
  const cosH = (Math.sin(angle * RAD) - Math.sin(latR) * Math.sin(declR)) / (Math.cos(latR) * Math.cos(declR));
  if (cosH > 1 || cosH < -1) return null;
  return Math.acos(cosH) * DEG;
}
function sunriseHour(doy, lat, lng, tzOff) {
  const decl = solarDeclination(doy);
  const eot = equationOfTime(doy);
  const ha = hourAngle(lat, decl, -0.833);
  if (ha === null) return null;
  const noon = 12 - (lng / 15) - (eot / 60) + tzOff;
  return noon - ha / 15;
}
function fajrHour(doy, lat, lng, tzOff, fajrAngle) {
  const decl = solarDeclination(doy);
  const eot = equationOfTime(doy);
  const ha = hourAngle(lat, decl, -fajrAngle);
  if (ha === null) return null;
  const noon = 12 - (lng / 15) - (eot / 60) + tzOff;
  return noon - ha / 15;
}

// Simplified DST check per region type
function getTzOffset(baseTz, dstType, date) {
  const m = date.getMonth(); // 0-indexed
  const d = date.getDate();
  const dow = date.getDay();
  if (dstType === "none") return baseTz;
  // US: 2nd Sun March – 1st Sun Nov
  if (dstType === "us") {
    const marchStart = new Date(date.getFullYear(), 2, 8 + (7 - new Date(date.getFullYear(), 2, 1).getDay()) % 7);
    const novEnd = new Date(date.getFullYear(), 10, 1 + (7 - new Date(date.getFullYear(), 10, 1).getDay()) % 7);
    return (date >= marchStart && date < novEnd) ? baseTz + 1 : baseTz;
  }
  // EU: last Sun March – last Sun Oct
  if (dstType === "eu") {
    const marchLast = new Date(date.getFullYear(), 2, 31 - (new Date(date.getFullYear(), 2, 31).getDay()));
    const octLast = new Date(date.getFullYear(), 9, 31 - (new Date(date.getFullYear(), 9, 31).getDay()));
    return (date >= marchLast && date < octLast) ? baseTz + 1 : baseTz;
  }
  // Jordan: last Fri March – last Fri Oct
  if (dstType === "jordan") {
    const mEnd = 31 - ((new Date(date.getFullYear(), 2, 31).getDay() + 2) % 7);
    const oEnd = 31 - ((new Date(date.getFullYear(), 9, 31).getDay() + 2) % 7);
    const marchFri = new Date(date.getFullYear(), 2, mEnd);
    const octFri = new Date(date.getFullYear(), 9, oEnd);
    return (date >= marchFri && date < octFri) ? baseTz + 1 : baseTz;
  }
  // Palestine: similar to EU roughly
  if (dstType === "palestine") {
    const marchLast = new Date(date.getFullYear(), 2, 31 - (new Date(date.getFullYear(), 2, 31).getDay() + 1) % 7);
    const octLast = new Date(date.getFullYear(), 9, 31 - (new Date(date.getFullYear(), 9, 31).getDay() + 1) % 7);
    return (date >= marchLast && date < octLast) ? baseTz + 1 : baseTz;
  }
  // Iran: ~March 21 – Sep 21
  if (dstType === "iran") {
    const s = new Date(date.getFullYear(), 2, 22);
    const e = new Date(date.getFullYear(), 8, 22);
    return (date >= s && date < e) ? baseTz + 1 : baseTz;
  }
  // Australia: Oct first Sun – Apr first Sun (southern hemisphere)
  if (dstType === "au") {
    const octStart = new Date(date.getFullYear(), 9, 1 + (7 - new Date(date.getFullYear(), 9, 1).getDay()) % 7);
    const aprStart = new Date(date.getFullYear(), 3, 1 + (7 - new Date(date.getFullYear(), 3, 1).getDay()) % 7);
    return (date >= octStart || date < aprStart) ? baseTz + 1 : baseTz;
  }
  // NZ: last Sun Sep – first Sun Apr
  if (dstType === "nz") {
    const sepLast = new Date(date.getFullYear(), 8, 30 - (new Date(date.getFullYear(), 8, 30).getDay()));
    const aprFirst = new Date(date.getFullYear(), 3, 1 + (7 - new Date(date.getFullYear(), 3, 1).getDay()) % 7);
    return (date >= sepLast || date < aprFirst) ? baseTz + 1 : baseTz;
  }
  // Chile: first Sat Apr → first Sat Sep (winter = standard)
  if (dstType === "south") {
    const aprStart = new Date(date.getFullYear(), 3, 1 + (6 - new Date(date.getFullYear(), 3, 1).getDay() + 7) % 7);
    const sepStart = new Date(date.getFullYear(), 8, 1 + (6 - new Date(date.getFullYear(), 8, 1).getDay() + 7) % 7);
    return (date >= aprStart && date < sepStart) ? baseTz : baseTz + 1;
  }
  return baseTz;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function FajrSunriseGlobal() {
  const [cityIdx, setCityIdx] = useState(0);
  const [convention, setConvention] = useState("ISNA");
  const [year, setYear] = useState(2026);
  const [regionFilter, setRegionFilter] = useState("all");
  const [search, setSearch] = useState("");

  const city = CITIES[cityIdx];

  const filteredCities = useMemo(() => {
    let list = CITIES;
    if (regionFilter !== "all") {
      const reg = REGIONS.find(r => r.label === regionFilter);
      if (reg) list = list.filter(reg.filter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(s));
    }
    return list;
  }, [regionFilter, search]);

  const data = useMemo(() => {
    const fajrAngle = CONVENTIONS[convention].angle;
    const results = [];
    const d = new Date(year, 0, 1);
    while (d.getFullYear() === year) {
      const doy = dayOfYear(d);
      const tz = getTzOffset(city.tz, city.dstType, d);
      const sr = sunriseHour(doy, city.lat, city.lng, -tz);
      const fj = fajrHour(doy, city.lat, city.lng, -tz, fajrAngle);
      if (sr !== null && fj !== null) {
        const diffMin = (sr - fj) * 60;
        if (diffMin > 0 && diffMin < 300) {
          results.push({
            date: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
            doy, diff: Math.round(diffMin * 10) / 10,
            fajr: fj, sunrise: sr, month: d.getMonth(),
          });
        }
      }
      d.setDate(d.getDate() + 1);
    }
    return results;
  }, [convention, year, cityIdx]);

  const minDiff = data.length ? Math.min(...data.map(d => d.diff)) : 0;
  const maxDiff = data.length ? Math.max(...data.map(d => d.diff)) : 0;
  const avgDiff = data.length ? (data.reduce((s, d) => s + d.diff, 0) / data.length) : 0;
  const minEntry = data.find(d => d.diff === minDiff);
  const maxEntry = data.find(d => d.diff === maxDiff);
  const hasGaps = data.length < 360;

  const formatTime = (hrs) => {
    if (hrs < 0) hrs += 24;
    const h = Math.floor(hrs);
    const m = Math.round((hrs - h) * 60);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(100,150,255,0.3)", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 13, lineHeight: 1.6, backdropFilter: "blur(8px)" }}>
        <div style={{ fontWeight: 700, color: "#93c5fd", marginBottom: 4 }}>{d.date}, {year}</div>
        <div>Fajr: <span style={{ color: "#a78bfa" }}>{formatTime(d.fajr)}</span></div>
        <div>Sunrise: <span style={{ color: "#fbbf24" }}>{formatTime(d.sunrise)}</span></div>
        <div style={{ marginTop: 4, borderTop: "1px solid rgba(100,150,255,0.2)", paddingTop: 4 }}>
          Difference: <span style={{ color: "#34d399", fontWeight: 700 }}>{d.diff.toFixed(1)} min</span>
        </div>
      </div>
    );
  };

  const ticks = useMemo(() => {
    const t = [];
    for (let m = 0; m < 12; m++) {
      const entry = data.find(d => d.month === m && (data.indexOf(d) === 0 || data[data.indexOf(d) - 1]?.month !== m));
      if (entry) t.push(entry.doy);
    }
    return t;
  }, [data]);

  const sty = {
    select: { background: "rgba(30,41,59,0.8)", border: "1px solid rgba(100,150,255,0.2)", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 13, cursor: "pointer", width: "100%" },
    label: { fontSize: 10, color: "#64748b", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", color: "#e2e8f0", fontFamily: "'Inter',-apple-system,sans-serif", padding: "24px 20px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {/* Header */}
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, background: "linear-gradient(90deg,#93c5fd,#a78bfa,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Fajr → Sunrise Duration Worldwide
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 16px" }}>
          {city.name} &middot; Lat {city.lat.toFixed(2)}° &middot; {year} &middot; {CONVENTIONS[convention].name}
        </p>

        {/* Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={sty.label}>Region</label>
            <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setSearch(""); }} style={sty.select}>
              <option value="all">All Regions</option>
              {REGIONS.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label style={sty.label}>Search City</label>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Type to filter..."
              style={{ ...sty.select, cursor: "text" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
          <div>
            <label style={sty.label}>City ({filteredCities.length})</label>
            <select value={cityIdx} onChange={e => setCityIdx(Number(e.target.value))} style={sty.select}>
              {filteredCities.map(c => {
                const idx = CITIES.indexOf(c);
                return <option key={idx} value={idx}>{c.name} ({c.lat.toFixed(1)}°)</option>;
              })}
            </select>
          </div>
          <div>
            <label style={sty.label}>Convention</label>
            <select value={convention} onChange={e => setConvention(e.target.value)} style={sty.select}>
              {Object.entries(CONVENTIONS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label style={sty.label}>Year</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))} style={sty.select}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
          {[
            { label: "Shortest", value: `${minDiff.toFixed(1)}m`, sub: minEntry?.date, color: "#f87171" },
            { label: "Average", value: `${avgDiff.toFixed(1)}m`, sub: `${(maxDiff - minDiff).toFixed(0)}m range`, color: "#93c5fd" },
            { label: "Longest", value: `${maxDiff.toFixed(1)}m`, sub: maxEntry?.date, color: "#34d399" },
            { label: "Latitude", value: `${Math.abs(city.lat).toFixed(1)}°${city.lat >= 0 ? "N" : "S"}`, sub: hasGaps ? "⚠ gaps in summer" : "Full year", color: "#fbbf24" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(30,41,59,0.6)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(100,150,255,0.1)" }}>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: "rgba(30,41,59,0.5)", borderRadius: 16, padding: "20px 12px 12px 0", border: "1px solid rgba(100,150,255,0.1)" }}>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="diffGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,150,255,0.08)" />
              <XAxis dataKey="doy" ticks={ticks} tickFormatter={doy => { const e = data.find(d => d.doy === doy); return e ? MONTHS[e.month] : ""; }} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "rgba(100,150,255,0.15)" }} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "rgba(100,150,255,0.15)" }} tickLine={false} tickFormatter={v => `${v}m`} domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgDiff} stroke="#94a3b8" strokeDasharray="6 4" strokeWidth={1} label={{ value: `avg ${avgDiff.toFixed(0)}m`, fill: "#94a3b8", fontSize: 10, position: "right" }} />
              <Area type="monotone" dataKey="diff" stroke="#818cf8" strokeWidth={2.5} fill="url(#diffGrad)" dot={false} activeDot={{ r: 5, fill: "#a78bfa", stroke: "#1e1b4b", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Explanation */}
        <div style={{ marginTop: 18, background: "rgba(30,41,59,0.4)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(100,150,255,0.08)", fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
          <span style={{ color: "#a78bfa", fontWeight: 700 }}>Key insight:</span>{" "}
          The higher the latitude, the more dramatic the seasonal swing. Near the equator (Singapore, Nairobi), the Fajr-sunrise gap barely changes all year. At 60°N+ (Stockholm, Helsinki), it swings wildly — and in polar summer, Fajr may not exist at all (shown as gaps). Compare Makkah (21°N) with Oslo (59°N) to see the effect clearly.
        </div>
      </div>
    </div>
  );
}
