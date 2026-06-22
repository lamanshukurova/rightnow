import {
  CITY_COORDS,
  type City,
  type WeatherCondition,
  type WeatherNow,
} from "../types";

// ---------------------------------------------------------------------------
// WEATHER — now powered by a real API.
//
// We use Open-Meteo (https://open-meteo.com): free, no API key, CORS-enabled,
// data from national weather services incl. the UK Met Office. We read the
// current temperature, "feels like", WMO weather code, cloud cover, wind and
// precipitation, then derive a single coarse `condition` that drives the sky,
// the icons and the recommendation engine.
//
// If the network is down or the API misbehaves, `getWeather` quietly falls
// back to a plausible estimate (marked source:"estimated") so the app never
// breaks — exactly the fallback behaviour the brief asks for.
// ---------------------------------------------------------------------------

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";

/** Shape of the bits of the Open-Meteo response we rely on. */
interface OpenMeteoCurrent {
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  cloud_cover: number;
  wind_speed_10m: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  is_day: number;
}

/** Plain-English label for a WMO weather code. */
function wmoLabel(code: number): string {
  if (code === 0) return "Clear skies";
  if (code <= 2) return "Mostly clear";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Misty";
  if (code <= 57) return "Light drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}

/**
 * Collapse the rich signals into one coarse bucket. Order matters: snow beats
 * rain beats freezing-cold beats grey-cloud beats sunny.
 */
function deriveCondition(c: OpenMeteoCurrent): WeatherCondition {
  const code = c.weather_code;
  const snowing = c.snowfall > 0 || (code >= 71 && code <= 77) || code === 85 || code === 86;
  const raining =
    c.rain > 0 ||
    c.showers > 0 ||
    c.precipitation > 0.05 ||
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    code >= 95;

  if (snowing) return "snowy";
  if (raining) return "rainy";
  if (c.temperature_2m <= 4) return "cold";
  if (c.cloud_cover >= 60) return "cloudy";
  return "sunny";
}

const BLURB: Record<WeatherCondition, (city: City, temp: number, windy: boolean) => string> = {
  sunny: (city, temp) =>
    `It's ${temp}° and properly bright in ${city} — make the most of it before it turns.`,
  cloudy: (city, temp, windy) =>
    `${temp}° and grey over ${city}${windy ? " with a bit of wind" : ""}, but dry enough to be out.`,
  rainy: (city, temp) => `${temp}° and wet in ${city}. Classic. Let's keep you dry.`,
  snowy: (city, temp) => `${temp}° and snowing in ${city} — gorgeous to look at, best enjoyed warm.`,
  cold: (city, temp, windy) =>
    `A brisk ${temp}° in ${city}${windy ? ", and breezy with it" : ""} — fine for a wander if you wrap up.`,
};

function buildNow(city: City, c: OpenMeteoCurrent, source: "live" | "estimated"): WeatherNow {
  const condition = deriveCondition(c);
  const temp = Math.round(c.temperature_2m);
  const windMph = Math.round(c.wind_speed_10m);
  const windy = windMph >= 20;
  return {
    city,
    condition,
    temp,
    feelsLike: Math.round(c.apparent_temperature),
    windMph,
    cloudCover: Math.round(c.cloud_cover),
    precipitationMm: c.precipitation,
    isDay: c.is_day === 1,
    windy,
    label: wmoLabel(c.weather_code),
    blurb: BLURB[condition](city, temp, windy),
    source,
  };
}

/** Fetch with a timeout so a hung request can't freeze the UI. */
async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Live fetch against Open-Meteo. Returns null on any failure. */
export async function fetchRealWeather(city: City): Promise<WeatherNow | null> {
  const { lat, lon } = CITY_COORDS[city];
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "is_day",
    ].join(","),
    wind_speed_unit: "mph",
    temperature_unit: "celsius",
    timezone: "auto",
  });

  try {
    const res = await fetchWithTimeout(`${ENDPOINT}?${params.toString()}`, 8000);
    if (!res.ok) return null;
    const data = (await res.json()) as { current?: Partial<OpenMeteoCurrent> };
    const cur = data.current;
    if (!cur || typeof cur.temperature_2m !== "number") return null;

    const safe: OpenMeteoCurrent = {
      temperature_2m: cur.temperature_2m,
      apparent_temperature: cur.apparent_temperature ?? cur.temperature_2m,
      weather_code: cur.weather_code ?? 3,
      cloud_cover: cur.cloud_cover ?? 50,
      wind_speed_10m: cur.wind_speed_10m ?? 0,
      precipitation: cur.precipitation ?? 0,
      rain: cur.rain ?? 0,
      showers: cur.showers ?? 0,
      snowfall: cur.snowfall ?? 0,
      is_day: cur.is_day ?? 1,
    };
    return buildNow(city, safe, "live");
  } catch {
    return null;
  }
}

// --- Estimate fallback -----------------------------------------------------
// A plausible, seasonally-aware guess for when the live API can't be reached.

const CITY_BIAS: Record<City, [number, number, number, number]> = {
  // weights for [sunny, cloudy, rainy, cold]
  London: [3, 4, 2, 1],
  Leeds: [2, 4, 3, 1],
  Manchester: [2, 3, 4, 1],
  Birmingham: [2, 4, 3, 1],
  Liverpool: [2, 4, 3, 1],
  Bristol: [3, 4, 2, 1],
  Edinburgh: [2, 3, 2, 3],
  Glasgow: [1, 3, 4, 2],
  Newcastle: [2, 3, 3, 2],
  Sheffield: [2, 4, 3, 1],
};

const TEMP_RANGE: Record<WeatherCondition, [number, number]> = {
  sunny: [16, 23],
  cloudy: [11, 18],
  rainy: [8, 15],
  snowy: [-1, 3],
  cold: [1, 7],
};

function estimate(city: City): WeatherNow {
  const buckets: WeatherCondition[] = ["sunny", "cloudy", "rainy", "cold"];
  const weights = CITY_BIAS[city];
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  let condition: WeatherCondition = "cloudy";
  for (let i = 0; i < buckets.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      condition = buckets[i];
      break;
    }
  }
  const [min, max] = TEMP_RANGE[condition];
  const temp = Math.round(min + Math.random() * (max - min));
  const windMph = Math.round(6 + Math.random() * 16);
  return buildNow(
    city,
    {
      temperature_2m: temp,
      apparent_temperature: temp - (windMph > 15 ? 2 : 0),
      weather_code: condition === "rainy" ? 61 : condition === "sunny" ? 0 : 3,
      cloud_cover: condition === "sunny" ? 20 : 80,
      wind_speed_10m: windMph,
      precipitation: condition === "rainy" ? 0.6 : 0,
      rain: condition === "rainy" ? 0.6 : 0,
      showers: 0,
      snowfall: 0,
      is_day: 1,
    },
    "estimated"
  );
}

/**
 * The single entry point the app uses. Tries the real API, falls back to a
 * plausible estimate. Always resolves — never throws.
 */
export async function getWeather(city: City): Promise<WeatherNow> {
  const real = await fetchRealWeather(city);
  return real ?? estimate(city);
}
