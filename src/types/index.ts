// Central type definitions for RightNow.
// Everything in the app — data, the recommendation engine, the UI — speaks these types.

/** The ten UK cities the MVP covers. */
export const CITIES = [
  "London",
  "Leeds",
  "Manchester",
  "Birmingham",
  "Liverpool",
  "Bristol",
  "Edinburgh",
  "Glasgow",
  "Newcastle",
  "Sheffield",
] as const;

export type City = (typeof CITIES)[number];

/** Latitude/longitude per city — used to fetch real weather. */
export const CITY_COORDS: Record<City, { lat: number; lon: number }> = {
  London: { lat: 51.5074, lon: -0.1278 },
  Leeds: { lat: 53.8008, lon: -1.5491 },
  Manchester: { lat: 53.4808, lon: -2.2426 },
  Birmingham: { lat: 52.4862, lon: -1.8904 },
  Liverpool: { lat: 53.4084, lon: -2.9916 },
  Bristol: { lat: 51.4545, lon: -2.5879 },
  Edinburgh: { lat: 55.9533, lon: -3.1883 },
  Glasgow: { lat: 55.8642, lon: -4.2518 },
  Newcastle: { lat: 54.9783, lon: -1.6178 },
  Sheffield: { lat: 53.3811, lon: -1.4701 },
};

// ---------------------------------------------------------------------------
// WEATHER
// ---------------------------------------------------------------------------

/**
 * The coarse "bucket" that drives the sky, the icons and the engine.
 * Derived from a real provider's richer signals (see lib/weather.ts).
 */
export type WeatherCondition = "sunny" | "cloudy" | "rainy" | "snowy" | "cold";

/** Where the weather reading came from — lets the UI be honest. */
export type WeatherSource = "live" | "estimated";

export interface WeatherNow {
  city: City;
  condition: WeatherCondition;
  /** Temperature in °C. */
  temp: number;
  /** "Feels like" in °C (wind chill / humidity adjusted). */
  feelsLike: number;
  /** Wind speed in mph. */
  windMph: number;
  /** Cloud cover 0–100%. */
  cloudCover: number;
  /** Precipitation in the last hour, mm. */
  precipitationMm: number;
  /** Daylight right now? */
  isDay: boolean;
  /** True when it's blowy enough to matter for outdoor plans. */
  windy: boolean;
  /** Short, human label e.g. "Light rain". */
  label: string;
  /** A one-liner used in the hero, written in plain UK English. */
  blurb: string;
  /** Did this come from the live API, or an estimate fallback? */
  source: WeatherSource;
}

// ---------------------------------------------------------------------------
// ACTIVITIES
// ---------------------------------------------------------------------------

/** Rough price band. "Free" means genuinely no cost to take part. */
export type Cost = "Free" | "£" | "££" | "£££";

/** Where the activity happens — drives the weather logic. */
export type Setting = "indoor" | "outdoor" | "either";

/** Who an activity tends to suit. */
export type Audience = "students" | "couples" | "solo" | "groups" | "families";

/** The moods/situations a user can pick on the homepage. */
export type Mood =
  | "bored"
  | "free"
  | "student"
  | "indoors"
  | "outdoors"
  | "date"
  | "social"
  | "relaxing"
  | "hidden-gem";

/** Display tags shown on cards. "Good now" is added dynamically by the engine. */
export type Tag =
  | "Free"
  | "Rainy day"
  | "Student-friendly"
  | "Hidden gem"
  | "Good now"
  | "Outdoors"
  | "Indoors";

/**
 * Broad, user-facing categories (the ones a real discovery product would
 * filter on). Kept deliberately wide so thousands of activities slot in.
 */
export type Category =
  | "Museums"
  | "Cafés"
  | "Restaurants"
  | "Parks"
  | "Walks"
  | "Markets"
  | "Comedy"
  | "Live Music"
  | "Sports"
  | "Attractions"
  | "Hidden Gems"
  | "Date Ideas"
  | "Student Activities"
  | "Free Activities"
  | "Rainy Day Activities";

/**
 * The finer-grained category authored in the data file. Mapped up to a broad
 * `Category` at load time so the data stays human-friendly and the UI stays tidy.
 */
export type RawCategory =
  | "Independent café"
  | "Local market"
  | "Museum"
  | "National Trust / heritage"
  | "Parks & walks"
  | "Seaside trip"
  | "Comedy night"
  | "Live music"
  | "Festival / event"
  | "Student-friendly"
  | "Bookshop"
  | "Indoor climbing"
  | "Escape room"
  | "Gallery"
  | "Canal walk"
  | "Day trip"
  | "Outdoor café"
  | "Board game café";

/**
 * The shape authored by hand in src/data/activities.ts. Only the essentials
 * are required; the optional fields are overrides — everything else is derived
 * automatically at load time, so adding hundreds more needs no code changes.
 */
export interface RawActivity {
  id: string;
  name: string;
  city: City;
  category: RawCategory;
  cost: Cost;
  setting: Setting;
  bestFor: Audience[];
  /** Weather conditions this activity works well in. */
  goodIn: WeatherCondition[];
  /** Static tags. The engine may add "Good now" on top of these. */
  tags: Tag[];
  /** Moods this activity is a strong answer to. */
  moods: Mood[];
  /** Friendly, specific description in UK English. */
  description: string;
  /** e.g. "Good for a 1–2 hour plan". */
  timeHint: string;

  // ---- Optional overrides (used when present, derived when absent) ----
  /** Official website. Falls back to a web search if omitted. */
  website?: string;
  /** Cover photo URL. Falls back to a generated cover if omitted. */
  imageUrl?: string;
  /** 0–100. Derived from category/fame if omitted. */
  popularity?: number;
  /** Typical visit length in minutes. Derived from category if omitted. */
  durationMins?: number;
  /**
   * Set true when a venue has permanently closed (e.g. flagged "closed" on
   * Google Maps). Closed activities are filtered out at load time and never
   * surface in recommendations, plans or saved items.
   */
  closed?: boolean;
  /**
   * Override the typical opening window (otherwise derived from category).
   * Minutes from midnight, or "always" for outdoor/public spaces. A `close`
   * past midnight is written as >1440 (e.g. 02:00 = 1560).
   */
  hours?: { open: number; close: number } | "always";
}

/**
 * The fully-resolved activity the rest of the app consumes. Produced by
 * enriching a `RawActivity` (see src/data/index.ts): broad category, a Google
 * Maps link, a resolved website, popularity, duration and a £ estimate.
 */
export interface Activity {
  id: string;
  name: string;
  city: City;
  /** Broad, user-facing category. */
  category: Category;
  /** The original fine-grained category, kept for nuance. */
  rawCategory: RawCategory;
  cost: Cost;
  /** Representative spend per person, in GBP (0 for free). */
  costGBP: number;
  setting: Setting;
  bestFor: Audience[];
  goodIn: WeatherCondition[];
  tags: Tag[];
  moods: Mood[];
  description: string;
  timeHint: string;
  /** Typical visit length in minutes. */
  durationMins: number;
  /** 0–100 popularity, used as a gentle ranking signal. */
  popularity: number;
  /** Always-valid Google Maps link. */
  mapsUrl: string;
  /** Official site if known, otherwise a web-search link. */
  website: string;
  /** True when `website` is a real official site (vs a search fallback). */
  hasOfficialSite: boolean;
  /** Cover photo if provided (otherwise the UI draws a generated cover). */
  imageUrl?: string;
  /** Typical opening window (minutes from midnight) or "always". */
  hours?: { open: number; close: number } | "always";
}

/** What the engine returns: an activity plus the reasoning + score. */
export interface Recommendation {
  activity: Activity;
  /** Tags to render, including any dynamic ones like "Good now". */
  tags: Tag[];
  /** Plain-English reason this was picked right now. */
  reason: string;
  /** Internal ranking score (higher = better fit). */
  score: number;
}
