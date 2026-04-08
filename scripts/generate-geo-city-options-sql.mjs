/**
 * 生成 Supabase 迁移 SQL：geo_city_options 表 + 种子数据
 * 运行：node scripts/generate-geo-city-options-sql.mjs > supabase/migrations/20260408120000_geo_city_options.sql
 */

let sort = 0;
function row(country, state, city, slug) {
  sort += 1;
  const esc = (s) => s.replace(/'/g, "''");
  return `('${esc(country)}','${esc(state)}','${esc(city)}','${esc(slug)}',${sort})`;
}

const rows = [];

function addCatalog(entries) {
  for (const e of entries) {
    rows.push(row(e.country, e.state, e.city, e.slug));
  }
}

/** 非中国：与原先 locationCatalog 一致 */
addCatalog([
  // United States
  { country: "United States", state: "California", city: "San Francisco", slug: "san-francisco" },
  { country: "United States", state: "California", city: "Los Angeles", slug: "los-angeles" },
  { country: "United States", state: "California", city: "San Diego", slug: "san-diego" },
  { country: "United States", state: "California", city: "Palo Alto", slug: "palo-alto" },
  { country: "United States", state: "New York", city: "New York", slug: "new-york" },
  { country: "United States", state: "New York", city: "Buffalo", slug: "buffalo" },
  { country: "United States", state: "Illinois", city: "Chicago", slug: "chicago" },
  { country: "United States", state: "Massachusetts", city: "Boston", slug: "boston" },
  { country: "United States", state: "Washington", city: "Seattle", slug: "seattle" },
  { country: "United States", state: "Washington", city: "Bellevue", slug: "bellevue" },
  { country: "United States", state: "Texas", city: "Austin", slug: "austin" },
  { country: "United States", state: "Texas", city: "Dallas", slug: "dallas" },
  { country: "United States", state: "Texas", city: "Houston", slug: "houston" },
  { country: "United States", state: "District of Columbia", city: "Washington", slug: "washington-dc" },
  { country: "United States", state: "Georgia", city: "Atlanta", slug: "atlanta" },
  { country: "United States", state: "Pennsylvania", city: "Philadelphia", slug: "philadelphia" },
  { country: "United States", state: "Colorado", city: "Denver", slug: "denver" },
  { country: "United States", state: "Florida", city: "Miami", slug: "miami" },
  { country: "United States", state: "Florida", city: "Orlando", slug: "orlando" },
  // Canada
  { country: "Canada", state: "Ontario", city: "Toronto", slug: "toronto" },
  { country: "Canada", state: "Ontario", city: "Ottawa", slug: "ottawa" },
  { country: "Canada", state: "British Columbia", city: "Vancouver", slug: "vancouver" },
  { country: "Canada", state: "British Columbia", city: "Victoria", slug: "victoria-bc" },
  { country: "Canada", state: "Quebec", city: "Montreal", slug: "montreal" },
  { country: "Canada", state: "Alberta", city: "Calgary", slug: "calgary" },
  { country: "Canada", state: "Alberta", city: "Edmonton", slug: "edmonton" },
  // UK
  { country: "United Kingdom", state: "England", city: "London", slug: "london" },
  { country: "United Kingdom", state: "England", city: "Manchester", slug: "manchester" },
  { country: "United Kingdom", state: "England", city: "Birmingham", slug: "birmingham-uk" },
  { country: "United Kingdom", state: "England", city: "Cambridge", slug: "cambridge-uk" },
  { country: "United Kingdom", state: "Scotland", city: "Edinburgh", slug: "edinburgh" },
  { country: "United Kingdom", state: "Scotland", city: "Glasgow", slug: "glasgow" },
  { country: "United Kingdom", state: "Wales", city: "Cardiff", slug: "cardiff" },
  { country: "United Kingdom", state: "Northern Ireland", city: "Belfast", slug: "belfast" },
  // France
  { country: "France", state: "Ile-de-France", city: "Paris", slug: "paris" },
  { country: "France", state: "Auvergne-Rhone-Alpes", city: "Lyon", slug: "lyon" },
  { country: "France", state: "Provence-Alpes-Cote d'Azur", city: "Marseille", slug: "marseille" },
  // Germany
  { country: "Germany", state: "Berlin", city: "Berlin", slug: "berlin" },
  { country: "Germany", state: "Bavaria", city: "Munich", slug: "munich" },
  { country: "Germany", state: "Hamburg", city: "Hamburg", slug: "hamburg" },
  { country: "Germany", state: "Hesse", city: "Frankfurt", slug: "frankfurt" },
  // NL
  { country: "Netherlands", state: "North Holland", city: "Amsterdam", slug: "amsterdam" },
  { country: "Netherlands", state: "South Holland", city: "Rotterdam", slug: "rotterdam" },
  { country: "Netherlands", state: "South Holland", city: "The Hague", slug: "the-hague" },
  { country: "Netherlands", state: "North Brabant", city: "Eindhoven", slug: "eindhoven" },
  // CH
  { country: "Switzerland", state: "Zurich", city: "Zurich", slug: "zurich" },
  { country: "Switzerland", state: "Geneva", city: "Geneva", slug: "geneva" },
  { country: "Switzerland", state: "Basel-Stadt", city: "Basel", slug: "basel" },
  // ES
  { country: "Spain", state: "Community of Madrid", city: "Madrid", slug: "madrid" },
  { country: "Spain", state: "Catalonia", city: "Barcelona", slug: "barcelona" },
  { country: "Spain", state: "Andalusia", city: "Seville", slug: "seville" },
  // IT
  { country: "Italy", state: "Lombardy", city: "Milan", slug: "milan" },
  { country: "Italy", state: "Lazio", city: "Rome", slug: "rome" },
  { country: "Italy", state: "Piedmont", city: "Turin", slug: "turin" },
  // SE
  { country: "Sweden", state: "Stockholm County", city: "Stockholm", slug: "stockholm" },
  { country: "Sweden", state: "Skane County", city: "Malmo", slug: "malmo" },
  { country: "Sweden", state: "Vastra Gotaland", city: "Gothenburg", slug: "gothenburg" },
  // SG
  { country: "Singapore", state: "N/A", city: "Singapore", slug: "singapore" },
  // JP
  { country: "Japan", state: "Tokyo", city: "Tokyo", slug: "tokyo" },
  { country: "Japan", state: "Kanagawa", city: "Yokohama", slug: "yokohama" },
  { country: "Japan", state: "Osaka", city: "Osaka", slug: "osaka" },
  { country: "Japan", state: "Aichi", city: "Nagoya", slug: "nagoya" },
  // KR
  { country: "South Korea", state: "Seoul", city: "Seoul", slug: "seoul" },
  { country: "South Korea", state: "Busan", city: "Busan", slug: "busan" },
  { country: "South Korea", state: "Incheon", city: "Incheon", slug: "incheon" },
  // HK / TW / UAE / IN / AU (non-China block)
  { country: "Hong Kong", state: "N/A", city: "Hong Kong", slug: "hong-kong" },
  { country: "Taiwan", state: "Taiwan", city: "Taipei", slug: "taipei" },
  { country: "Taiwan", state: "Taiwan", city: "Kaohsiung", slug: "kaohsiung" },
  { country: "Taiwan", state: "Taiwan", city: "Taichung", slug: "taichung" },
  { country: "United Arab Emirates", state: "Dubai", city: "Dubai", slug: "dubai" },
  { country: "United Arab Emirates", state: "Abu Dhabi", city: "Abu Dhabi", slug: "abu-dhabi" },
  { country: "India", state: "Maharashtra", city: "Mumbai", slug: "mumbai" },
  { country: "India", state: "Karnataka", city: "Bengaluru", slug: "bengaluru" },
  { country: "India", state: "Delhi", city: "New Delhi", slug: "new-delhi" },
  { country: "India", state: "Telangana", city: "Hyderabad", slug: "hyderabad" },
  { country: "Australia", state: "New South Wales", city: "Sydney", slug: "sydney" },
  { country: "Australia", state: "Victoria", city: "Melbourne", slug: "melbourne" },
  { country: "Australia", state: "Queensland", city: "Brisbane", slug: "brisbane" },
  { country: "Australia", state: "Western Australia", city: "Perth", slug: "perth" },
]);

/** 中国：31 个省级行政区（直辖市 + 省 + 自治区），每区若干代表城市；slug 全局唯一 */
const CN = "China";
const china = [
  { st: "Beijing", cities: [["Beijing", "beijing"]] },
  { st: "Tianjin", cities: [["Tianjin", "tianjin"]] },
  { st: "Shanghai", cities: [["Shanghai", "shanghai"]] },
  { st: "Chongqing", cities: [["Chongqing", "chongqing"]] },
  { st: "Hebei", cities: [["Shijiazhuang", "shijiazhuang"], ["Tangshan", "tangshan"], ["Baoding", "baoding"]] },
  { st: "Shanxi", cities: [["Taiyuan", "taiyuan"], ["Datong", "datong"]] },
  { st: "Liaoning", cities: [["Shenyang", "shenyang"], ["Dalian", "dalian"]] },
  { st: "Jilin", cities: [["Changchun", "changchun"], ["Jilin City", "jilin-city"]] },
  { st: "Heilongjiang", cities: [["Harbin", "harbin"], ["Daqing", "daqing"]] },
  { st: "Jiangsu", cities: [["Nanjing", "nanjing"], ["Suzhou", "suzhou-cn"], ["Wuxi", "wuxi"]] },
  { st: "Zhejiang", cities: [["Hangzhou", "hangzhou"], ["Ningbo", "ningbo"], ["Wenzhou", "wenzhou"]] },
  { st: "Anhui", cities: [["Hefei", "hefei"], ["Wuhu", "wuhu"]] },
  { st: "Fujian", cities: [["Fuzhou", "fuzhou-cn"], ["Xiamen", "xiamen"], ["Quanzhou", "quanzhou"]] },
  { st: "Jiangxi", cities: [["Nanchang", "nanchang"], ["Ganzhou", "ganzhou"]] },
  { st: "Shandong", cities: [["Jinan", "jinan"], ["Qingdao", "qingdao"], ["Yantai", "yantai"]] },
  { st: "Henan", cities: [["Zhengzhou", "zhengzhou"], ["Luoyang", "luoyang"]] },
  { st: "Hubei", cities: [["Wuhan", "wuhan"], ["Yichang", "yichang"]] },
  { st: "Hunan", cities: [["Changsha", "changsha"], ["Zhuzhou", "zhuzhou"]] },
  {
    st: "Guangdong",
    cities: [
      ["Guangzhou", "guangzhou"],
      ["Shenzhen", "shenzhen"],
      ["Dongguan", "dongguan"],
      ["Foshan", "foshan"],
      ["Zhuhai", "zhuhai"],
    ],
  },
  { st: "Hainan", cities: [["Haikou", "haikou"], ["Sanya", "sanya"]] },
  { st: "Sichuan", cities: [["Chengdu", "chengdu"], ["Mianyang", "mianyang"]] },
  { st: "Guizhou", cities: [["Guiyang", "guiyang"], ["Zunyi", "zunyi"]] },
  { st: "Yunnan", cities: [["Kunming", "kunming"], ["Dali", "dali-cn"]] },
  { st: "Shaanxi", cities: [["Xi'an", "xian-cn"], ["Xianyang", "xianyang"]] },
  { st: "Gansu", cities: [["Lanzhou", "lanzhou"]] },
  { st: "Qinghai", cities: [["Xining", "xining"]] },
  { st: "Guangxi", cities: [["Nanning", "nanning"], ["Guilin", "guilin"]] },
  { st: "Inner Mongolia", cities: [["Hohhot", "hohhot"], ["Baotou", "baotou"]] },
  { st: "Ningxia", cities: [["Yinchuan", "yinchuan"]] },
  { st: "Xinjiang", cities: [["Urumqi", "urumqi"], ["Kashgar", "kashgar"]] },
  { st: "Tibet", cities: [["Lhasa", "lhasa"], ["Shigatse", "shigatse"]] },
];

for (const { st, cities } of china) {
  for (const [city, slug] of cities) {
    rows.push(row(CN, st, city, slug));
  }
}

const header = `-- geo_city_options: static catalog for location dropdowns (offline seed)
-- Apply in Supabase: SQL Editor or \`supabase db push\`

create table if not exists public.geo_city_options (
  id uuid primary key default gen_random_uuid(),
  country_or_region text not null,
  state_province text not null,
  city text not null,
  city_slug text not null,
  sort_order int not null default 0,
  constraint geo_city_options_city_slug_unique unique (city_slug)
);

create index if not exists geo_city_options_country_state_idx
  on public.geo_city_options (country_or_region, state_province);

alter table public.geo_city_options enable row level security;

drop policy if exists "geo_city_options_select_public" on public.geo_city_options;
create policy "geo_city_options_select_public"
  on public.geo_city_options
  for select
  to anon, authenticated
  using (true);

truncate public.geo_city_options restart identity;

insert into public.geo_city_options (country_or_region, state_province, city, city_slug, sort_order)
values
`;

const footer = `;

`;

process.stdout.write(header + rows.join(",\n") + footer);
