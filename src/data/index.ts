import type {
  Activity,
  Category,
  Cost,
  RawActivity,
  RawCategory,
} from "../types";
import { RAW_ACTIVITIES } from "./activities";

// ---------------------------------------------------------------------------
// DATA ENRICHMENT
//
// The hand-authored data (activities.ts) stays lean and readable. Here we turn
// each `RawActivity` into a fully-resolved `Activity` by DERIVING the fields a
// real product needs but that are tedious/error-prone to hand-write 1000×:
//
//   • broad category      ← mapped from the fine-grained authored category
//   • Google Maps link     ← built from name + city (always valid, never 404s)
//   • website              ← curated official site if known, else a web search
//   • popularity (0–100)   ← derived from category + fame signals (stable)
//   • durationMins         ← typical visit length by category
//   • costGBP              ← representative per-person spend from the £ band
//
// Any of these can be overridden per-activity in the data file when you know
// the real value (website, imageUrl, popularity, durationMins). Nothing here
// fabricates a broken link: an unknown website becomes a working web search.
// ---------------------------------------------------------------------------

/** Fine-grained authored category → broad, user-facing category. */
const CATEGORY_MAP: Record<RawCategory, Category> = {
  "Independent café": "Cafés",
  "Outdoor café": "Cafés",
  "Board game café": "Cafés",
  "Local market": "Markets",
  Museum: "Museums",
  Gallery: "Museums",
  "National Trust / heritage": "Attractions",
  "Parks & walks": "Parks",
  "Canal walk": "Walks",
  "Seaside trip": "Attractions",
  "Day trip": "Attractions",
  "Comedy night": "Comedy",
  "Live music": "Live Music",
  "Festival / event": "Attractions",
  "Student-friendly": "Student Activities",
  Bookshop: "Hidden Gems",
  "Indoor climbing": "Sports",
  "Escape room": "Attractions",
};

/** Representative spend per person (GBP) for each price band. */
const COST_GBP: Record<Cost, number> = {
  Free: 0,
  "£": 8,
  "££": 20,
  "£££": 45,
};

/** Typical visit length (minutes) by fine-grained category. */
const DURATION_MINS: Record<RawCategory, number> = {
  "Independent café": 60,
  "Outdoor café": 60,
  "Board game café": 120,
  "Local market": 75,
  Museum: 105,
  Gallery: 90,
  "National Trust / heritage": 90,
  "Parks & walks": 120,
  "Canal walk": 90,
  "Seaside trip": 180,
  "Day trip": 240,
  "Comedy night": 120,
  "Live music": 150,
  "Festival / event": 150,
  "Student-friendly": 90,
  Bookshop: 45,
  "Indoor climbing": 120,
  "Escape room": 75,
};

/**
 * Curated official websites for well-known, stable venues. Anything not listed
 * falls back to a Google search for the venue — which always works.
 */
const OFFICIAL_SITES: Record<string, string> = {
  "lon-soane": "https://www.soane.org",
  "lon-tate": "https://www.tate.org.uk/visit/tate-modern",
  "lon-daunt": "https://dauntbooks.co.uk",
  "lon-borough": "https://www.boroughmarket.org.uk",
  "lon-topsecret": "https://www.thetopsecretcomedyclub.co.uk",
  "lee-armouries": "https://royalarmouries.org/venue/royal-armouries-museum-leeds",
  "lee-artgallery": "https://museumsandgalleries.leeds.gov.uk/leeds-art-gallery",
  "lee-kirkstall": "https://museumsandgalleries.leeds.gov.uk/kirkstall-abbey",
  "man-artgallery": "https://manchesterartgallery.org",
  "man-sim": "https://www.scienceandindustrymuseum.org.uk",
  "man-rylands": "https://www.library.manchester.ac.uk/rylands",
  "man-afflecks": "https://www.afflecks.com",
  "man-botw": "https://bandonthewall.org",
  "bir-ikon": "https://www.ikon-gallery.org",
  "bir-bmag": "https://www.birminghammuseums.org.uk",
  "liv-walker": "https://www.liverpoolmuseums.org.uk/walker-art-gallery",
  "liv-museum": "https://www.liverpoolmuseums.org.uk/museum-of-liverpool",
  "bri-mshed": "https://www.bristolmuseums.org.uk/m-shed",
  "bri-museum": "https://www.bristolmuseums.org.uk/bristol-museum-and-art-gallery",
  "bri-stnicks": "https://www.stnicholasmarketbristol.co.uk",
  "edi-nms": "https://www.nms.ac.uk/national-museum-of-scotland",
  "edi-gallery": "https://www.nationalgalleries.org",
  "edi-stand": "https://www.thestand.co.uk",
  "gla-kelvingrove": "https://www.glasgowlife.org.uk/museums/venues/kelvingrove-art-gallery-and-museum",
  "gla-riverside": "https://www.glasgowlife.org.uk/museums/venues/riverside-museum",
  "gla-kingtuts": "https://www.kingtuts.co.uk",
  "new-baltic": "https://baltic.art",
  "new-hancock": "https://greatnorthmuseum.org.uk",
  "new-cluny": "https://www.thecluny.com",
  "she-weston": "https://www.museums-sheffield.org.uk/museums/weston-park",
  "she-millennium": "https://www.museums-sheffield.org.uk/museums/millennium-gallery",
  "she-climbingworks": "https://www.climbingworks.com",
};

/** A Google Maps search link for a place — always resolves, never 404s. */
function buildMapsUrl(name: string, city: string): string {
  const q = encodeURIComponent(`${name}, ${city}, UK`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** A web-search fallback used when we don't have an official site on file. */
function buildSearchUrl(name: string, city: string): string {
  const q = encodeURIComponent(`${name} ${city}`);
  return `https://www.google.com/search?q=${q}`;
}

/** Tiny deterministic string hash (stable popularity jitter). */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Stable, plausible popularity score in 0–100. */
function derivePopularity(raw: RawActivity): number {
  if (typeof raw.popularity === "number") return clamp(raw.popularity, 0, 100);

  let score = 62 + (hash(raw.id) % 26); // 62–87 baseline, deterministic
  const bumped: RawCategory[] = [
    "Museum",
    "Gallery",
    "Parks & walks",
    "Local market",
    "National Trust / heritage",
  ];
  if (bumped.includes(raw.category)) score += 6;
  if (raw.tags.includes("Hidden gem")) score = Math.round(score * 0.82); // gems are niche by design
  return clamp(score, 35, 98);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Turn one authored entry into a fully-resolved Activity. */
function enrich(raw: RawActivity): Activity {
  const official = raw.website ?? OFFICIAL_SITES[raw.id];
  return {
    id: raw.id,
    name: raw.name,
    city: raw.city,
    category: CATEGORY_MAP[raw.category],
    rawCategory: raw.category,
    cost: raw.cost,
    costGBP: COST_GBP[raw.cost],
    setting: raw.setting,
    bestFor: raw.bestFor,
    goodIn: raw.goodIn,
    tags: raw.tags,
    moods: raw.moods,
    description: raw.description,
    timeHint: raw.timeHint,
    durationMins: raw.durationMins ?? DURATION_MINS[raw.category],
    popularity: derivePopularity(raw),
    mapsUrl: buildMapsUrl(raw.name, raw.city),
    website: official ?? buildSearchUrl(raw.name, raw.city),
    hasOfficialSite: Boolean(official),
    imageUrl: raw.imageUrl,
    hours: raw.hours,
  };
}

/**
 * The enriched catalogue the whole app consumes.
 *
 * Permanently-closed venues (`closed: true`) are dropped here, so they never
 * appear in recommendations, plans, the saved list, or anywhere else — there's
 * a single source of truth and no component needs to re-check.
 */
export const ACTIVITIES: Activity[] = RAW_ACTIVITIES.filter(
  (raw) => !raw.closed
).map(enrich);

/** Quick lookup by id (used by saved-activities + the planner). */
export const ACTIVITY_BY_ID: Record<string, Activity> = Object.fromEntries(
  ACTIVITIES.map((a) => [a.id, a])
);
