/**
 * 城市 slug → [longitude, latitude]（供 react-simple-maps Marker 使用）
 * 未知城市 fallback 到大致国家/地区中心，避免地图无点
 */
const CITY_COORDINATES: Record<string, [number, number]> = {
  "san-francisco": [-122.4194, 37.7749],
  "new-york": [-74.006, 40.7128],
  london: [-0.1276, 51.5074],
  "los-angeles": [-118.2437, 34.0522],
  chicago: [-87.6298, 41.8781],
  boston: [-71.0589, 42.3601],
  seattle: [-122.3321, 47.6062],
  singapore: [103.8198, 1.3521],
  dubai: [55.2708, 25.2048],
  "hong-kong": [114.1694, 22.3193],
  shanghai: [121.4737, 31.2304],
  tokyo: [139.6917, 35.6895],
  paris: [2.3522, 48.8566],
  berlin: [13.405, 52.52],
  taipei: [121.5654, 25.033],
  kaohsiung: [120.3014, 22.6273],
  taichung: [120.6736, 24.1477],
};

const COUNTRY_FALLBACK: Record<string, [number, number]> = {
  "United States": [-98.5795, 39.8283],
  Canada: [-106.3468, 56.1304],
  "United Kingdom": [-3.436, 55.3781],
  France: [2.2137, 46.2276],
  Germany: [10.4515, 51.1657],
  Netherlands: [5.2913, 52.1326],
  Switzerland: [8.2275, 46.8182],
  Spain: [-3.7492, 40.4637],
  Italy: [12.5674, 41.8719],
  Sweden: [18.6435, 60.1282],
  Singapore: [103.8198, 1.3521],
  Japan: [138.2529, 36.2048],
  "South Korea": [127.7669, 35.9078],
  China: [104.1954, 35.8617],
  "Hong Kong": [114.1694, 22.3193],
  Taiwan: [120.9605, 23.6978],
  "United Arab Emirates": [53.8478, 23.4241],
  India: [78.9629, 20.5937],
  Australia: [133.7751, -25.2744],
};

/**
 * @param citySlug - anchors.city_slug
 * @param country - anchors.country（存的是用户所选 country/region 标签）
 */
export function getCityCoordinates(
  citySlug: string,
  country: string
): [number, number] {
  const direct = CITY_COORDINATES[citySlug];
  if (direct) return direct;
  const fallback = COUNTRY_FALLBACK[country];
  if (fallback) return fallback;
  return [0, 20];
}
