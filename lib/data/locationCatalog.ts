export type CityOption = {
  city: string;
  city_slug: string;
};

export type StateOption = {
  state_province: string;
  cities: CityOption[];
};

export type CountryRegionOption = {
  /** 国家或地区（中性表述，避免单一词 country 的语义） */
  country_or_region: string;
  states: StateOption[];
};

/**
 * 结构化地点目录：国家/地区 -> 州/省 -> 城市（含标准 slug）
 * 离线兜底副本（API 不可用或未执行迁移时使用）。完整数据以 Supabase `geo_city_options` 为准。
 */
export const LOCATION_CATALOG: CountryRegionOption[] = [
  {
    country_or_region: "United States",
    states: [
      {
        state_province: "California",
        cities: [
          { city: "San Francisco", city_slug: "san-francisco" },
          { city: "Los Angeles", city_slug: "los-angeles" },
          { city: "San Diego", city_slug: "san-diego" },
          { city: "Palo Alto", city_slug: "palo-alto" },
        ],
      },
      {
        state_province: "New York",
        cities: [
          { city: "New York", city_slug: "new-york" },
          { city: "Buffalo", city_slug: "buffalo" },
        ],
      },
      {
        state_province: "Illinois",
        cities: [{ city: "Chicago", city_slug: "chicago" }],
      },
      {
        state_province: "Massachusetts",
        cities: [{ city: "Boston", city_slug: "boston" }],
      },
      {
        state_province: "Washington",
        cities: [
          { city: "Seattle", city_slug: "seattle" },
          { city: "Bellevue", city_slug: "bellevue" },
        ],
      },
      {
        state_province: "Texas",
        cities: [
          { city: "Austin", city_slug: "austin" },
          { city: "Dallas", city_slug: "dallas" },
          { city: "Houston", city_slug: "houston" },
        ],
      },
      {
        state_province: "District of Columbia",
        cities: [{ city: "Washington", city_slug: "washington-dc" }],
      },
      {
        state_province: "Georgia",
        cities: [{ city: "Atlanta", city_slug: "atlanta" }],
      },
      {
        state_province: "Pennsylvania",
        cities: [{ city: "Philadelphia", city_slug: "philadelphia" }],
      },
      {
        state_province: "Colorado",
        cities: [{ city: "Denver", city_slug: "denver" }],
      },
      {
        state_province: "Florida",
        cities: [
          { city: "Miami", city_slug: "miami" },
          { city: "Orlando", city_slug: "orlando" },
        ],
      },
    ],
  },
  {
    country_or_region: "Canada",
    states: [
      {
        state_province: "Ontario",
        cities: [
          { city: "Toronto", city_slug: "toronto" },
          { city: "Ottawa", city_slug: "ottawa" },
        ],
      },
      {
        state_province: "British Columbia",
        cities: [
          { city: "Vancouver", city_slug: "vancouver" },
          { city: "Victoria", city_slug: "victoria-bc" },
        ],
      },
      {
        state_province: "Quebec",
        cities: [{ city: "Montreal", city_slug: "montreal" }],
      },
      {
        state_province: "Alberta",
        cities: [
          { city: "Calgary", city_slug: "calgary" },
          { city: "Edmonton", city_slug: "edmonton" },
        ],
      },
    ],
  },
  {
    country_or_region: "United Kingdom",
    states: [
      {
        state_province: "England",
        cities: [
          { city: "London", city_slug: "london" },
          { city: "Manchester", city_slug: "manchester" },
          { city: "Birmingham", city_slug: "birmingham-uk" },
          { city: "Cambridge", city_slug: "cambridge-uk" },
        ],
      },
      {
        state_province: "Scotland",
        cities: [
          { city: "Edinburgh", city_slug: "edinburgh" },
          { city: "Glasgow", city_slug: "glasgow" },
        ],
      },
      {
        state_province: "Wales",
        cities: [{ city: "Cardiff", city_slug: "cardiff" }],
      },
      {
        state_province: "Northern Ireland",
        cities: [{ city: "Belfast", city_slug: "belfast" }],
      },
    ],
  },
  {
    country_or_region: "France",
    states: [
      {
        state_province: "Ile-de-France",
        cities: [{ city: "Paris", city_slug: "paris" }],
      },
      {
        state_province: "Auvergne-Rhone-Alpes",
        cities: [{ city: "Lyon", city_slug: "lyon" }],
      },
      {
        state_province: "Provence-Alpes-Cote d'Azur",
        cities: [{ city: "Marseille", city_slug: "marseille" }],
      },
    ],
  },
  {
    country_or_region: "Germany",
    states: [
      {
        state_province: "Berlin",
        cities: [{ city: "Berlin", city_slug: "berlin" }],
      },
      {
        state_province: "Bavaria",
        cities: [{ city: "Munich", city_slug: "munich" }],
      },
      {
        state_province: "Hamburg",
        cities: [{ city: "Hamburg", city_slug: "hamburg" }],
      },
      {
        state_province: "Hesse",
        cities: [{ city: "Frankfurt", city_slug: "frankfurt" }],
      },
    ],
  },
  {
    country_or_region: "Netherlands",
    states: [
      {
        state_province: "North Holland",
        cities: [{ city: "Amsterdam", city_slug: "amsterdam" }],
      },
      {
        state_province: "South Holland",
        cities: [
          { city: "Rotterdam", city_slug: "rotterdam" },
          { city: "The Hague", city_slug: "the-hague" },
        ],
      },
      {
        state_province: "North Brabant",
        cities: [{ city: "Eindhoven", city_slug: "eindhoven" }],
      },
    ],
  },
  {
    country_or_region: "Switzerland",
    states: [
      {
        state_province: "Zurich",
        cities: [{ city: "Zurich", city_slug: "zurich" }],
      },
      {
        state_province: "Geneva",
        cities: [{ city: "Geneva", city_slug: "geneva" }],
      },
      {
        state_province: "Basel-Stadt",
        cities: [{ city: "Basel", city_slug: "basel" }],
      },
    ],
  },
  {
    country_or_region: "Spain",
    states: [
      {
        state_province: "Community of Madrid",
        cities: [{ city: "Madrid", city_slug: "madrid" }],
      },
      {
        state_province: "Catalonia",
        cities: [{ city: "Barcelona", city_slug: "barcelona" }],
      },
      {
        state_province: "Andalusia",
        cities: [{ city: "Seville", city_slug: "seville" }],
      },
    ],
  },
  {
    country_or_region: "Italy",
    states: [
      {
        state_province: "Lombardy",
        cities: [{ city: "Milan", city_slug: "milan" }],
      },
      {
        state_province: "Lazio",
        cities: [{ city: "Rome", city_slug: "rome" }],
      },
      {
        state_province: "Piedmont",
        cities: [{ city: "Turin", city_slug: "turin" }],
      },
    ],
  },
  {
    country_or_region: "Sweden",
    states: [
      {
        state_province: "Stockholm County",
        cities: [{ city: "Stockholm", city_slug: "stockholm" }],
      },
      {
        state_province: "Skane County",
        cities: [{ city: "Malmo", city_slug: "malmo" }],
      },
      {
        state_province: "Vastra Gotaland",
        cities: [{ city: "Gothenburg", city_slug: "gothenburg" }],
      },
    ],
  },
  {
    country_or_region: "Singapore",
    states: [
      {
        state_province: "N/A",
        cities: [{ city: "Singapore", city_slug: "singapore" }],
      },
    ],
  },
  {
    country_or_region: "Japan",
    states: [
      {
        state_province: "Tokyo",
        cities: [{ city: "Tokyo", city_slug: "tokyo" }],
      },
      {
        state_province: "Kanagawa",
        cities: [{ city: "Yokohama", city_slug: "yokohama" }],
      },
      {
        state_province: "Osaka",
        cities: [{ city: "Osaka", city_slug: "osaka" }],
      },
      {
        state_province: "Aichi",
        cities: [{ city: "Nagoya", city_slug: "nagoya" }],
      },
    ],
  },
  {
    country_or_region: "South Korea",
    states: [
      {
        state_province: "Seoul",
        cities: [{ city: "Seoul", city_slug: "seoul" }],
      },
      {
        state_province: "Busan",
        cities: [{ city: "Busan", city_slug: "busan" }],
      },
      {
        state_province: "Incheon",
        cities: [{ city: "Incheon", city_slug: "incheon" }],
      },
    ],
  },
  {
    country_or_region: "China",
    states: [
      {
        state_province: "Shanghai",
        cities: [{ city: "Shanghai", city_slug: "shanghai" }],
      },
      {
        state_province: "Beijing",
        cities: [{ city: "Beijing", city_slug: "beijing" }],
      },
      {
        state_province: "Guangdong",
        cities: [
          { city: "Shenzhen", city_slug: "shenzhen" },
          { city: "Guangzhou", city_slug: "guangzhou" },
        ],
      },
    ],
  },
  {
    country_or_region: "Hong Kong",
    states: [
      {
        state_province: "N/A",
        cities: [{ city: "Hong Kong", city_slug: "hong-kong" }],
      },
    ],
  },
  {
    country_or_region: "Taiwan",
    states: [
      {
        state_province: "Taiwan",
        cities: [
          { city: "Taipei", city_slug: "taipei" },
          { city: "Kaohsiung", city_slug: "kaohsiung" },
          { city: "Taichung", city_slug: "taichung" },
        ],
      },
    ],
  },
  {
    country_or_region: "United Arab Emirates",
    states: [
      {
        state_province: "Dubai",
        cities: [{ city: "Dubai", city_slug: "dubai" }],
      },
      {
        state_province: "Abu Dhabi",
        cities: [{ city: "Abu Dhabi", city_slug: "abu-dhabi" }],
      },
    ],
  },
  {
    country_or_region: "India",
    states: [
      {
        state_province: "Maharashtra",
        cities: [{ city: "Mumbai", city_slug: "mumbai" }],
      },
      {
        state_province: "Karnataka",
        cities: [{ city: "Bengaluru", city_slug: "bengaluru" }],
      },
      {
        state_province: "Delhi",
        cities: [{ city: "New Delhi", city_slug: "new-delhi" }],
      },
      {
        state_province: "Telangana",
        cities: [{ city: "Hyderabad", city_slug: "hyderabad" }],
      },
    ],
  },
  {
    country_or_region: "Australia",
    states: [
      {
        state_province: "New South Wales",
        cities: [{ city: "Sydney", city_slug: "sydney" }],
      },
      {
        state_province: "Victoria",
        cities: [{ city: "Melbourne", city_slug: "melbourne" }],
      },
      {
        state_province: "Queensland",
        cities: [{ city: "Brisbane", city_slug: "brisbane" }],
      },
      {
        state_province: "Western Australia",
        cities: [{ city: "Perth", city_slug: "perth" }],
      },
    ],
  },
];

/** @alias {@link LOCATION_CATALOG} */
export const FALLBACK_LOCATION_CATALOG = LOCATION_CATALOG;

