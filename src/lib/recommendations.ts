import type {
  Activity,
  City,
  Mood,
  Recommendation,
  Tag,
  WeatherNow,
} from "../types";
import { ACTIVITIES } from "../data";
import { isOpenNow, ukMinutesNow } from "./hours";

// ---------------------------------------------------------------------------
// THE RECOMMENDATION ENGINE
//
// Given a city, the live weather and an optional mood, score every activity in
// that city and return the best handful — each with a plain-English reason for
// why it's a good shout right now. Scoring is additive and transparent.
//
// New in this version, the ranking weighs SIX signals, not two:
//   mood · weather · cost · indoor/outdoor suitability · popularity · variety
// and a final diversity pass guarantees a spread of categories (café, museum,
// walk, gig…) instead of three near-identical cards.
// ---------------------------------------------------------------------------

export interface EngineInput {
  city: City;
  weather: WeatherNow;
  mood: Mood | null;
  /** A reshuffle counter — change it to get a fresh "Try another idea" mix. */
  seed?: number;
}

const WET = (w: WeatherNow) => w.condition === "rainy" || w.condition === "snowy";
const WET_OR_COLD = (w: WeatherNow) => WET(w) || w.condition === "cold";

/** Does this activity suit the current weather? */
function weatherScore(activity: Activity, weather: WeatherNow): number {
  let score = 0;

  if (activity.goodIn.includes(weather.condition)) score += 8;

  // Indoor things are a safe bet when it's wet, snowy or cold...
  if (WET_OR_COLD(weather)) {
    if (activity.setting === "indoor") score += 11;
    if (activity.setting === "outdoor") score -= 13;
  }

  // ...and outdoor things shine when it's fine.
  if (weather.condition === "sunny") {
    if (activity.setting === "outdoor") score += 12;
    if (activity.setting === "indoor") score -= 4;
  }

  // Cloudy-but-dry: mild nudge outdoors.
  if (weather.condition === "cloudy" && activity.setting === "outdoor") score += 3;

  // Strong wind takes the shine off exposed outdoor plans.
  if (weather.windy && activity.setting === "outdoor") score -= 4;

  return score;
}

/** Is this a strong answer to the chosen mood? */
function moodScore(activity: Activity, mood: Mood | null): number {
  if (!mood) return 0;
  let score = 0;

  if (activity.moods.includes(mood)) score += 12;

  switch (mood) {
    case "free":
      if (activity.cost === "Free") score += 10;
      else score -= 8;
      break;
    case "indoors":
      if (activity.setting === "indoor") score += 8;
      else if (activity.setting === "outdoor") score -= 10;
      break;
    case "outdoors":
      if (activity.setting === "outdoor") score += 8;
      else if (activity.setting === "indoor") score -= 10;
      break;
    case "student":
      if (activity.tags.includes("Student-friendly")) score += 6;
      if (activity.cost === "Free") score += 3;
      break;
    case "date":
      if (activity.bestFor.includes("couples")) score += 6;
      break;
    case "social":
      if (activity.bestFor.includes("groups")) score += 6;
      break;
    case "hidden-gem":
      if (activity.tags.includes("Hidden gem")) score += 10;
      break;
    case "relaxing":
      if (activity.cost !== "££" && activity.cost !== "£££") score += 2;
      break;
    case "bored":
      if (activity.tags.includes("Hidden gem")) score += 3;
      break;
  }

  return score;
}

/** Light base score + cost & popularity nudges so good all-rounders surface. */
function baseScore(activity: Activity): number {
  let score = 4;
  if (activity.cost === "Free") score += 2; // free is friendly
  if (activity.cost === "£") score += 1;
  if (activity.cost === "£££") score -= 1; // pricey needs to earn it
  // Popularity as a gentle tiebreaker: up to +4.
  score += (activity.popularity / 100) * 4;
  return score;
}

/** Tiny deterministic string hash for the reshuffle jitter. */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Score a single activity in context. Exported so the planner can reuse the
 * exact same logic when assembling itineraries.
 */
export function scoreActivity(
  activity: Activity,
  ctx: { weather: WeatherNow; mood: Mood | null; seed?: number }
): number {
  const jitter = ((hash(activity.id + (ctx.seed ?? 0)) % 100) / 100) * 5; // 0–5
  return (
    baseScore(activity) +
    weatherScore(activity, ctx.weather) +
    moodScore(activity, ctx.mood) +
    jitter
  );
}

/** Add "Good now" on top of the static tags. */
function buildTags(activity: Activity, weather: WeatherNow): Tag[] {
  const tags = new Set<Tag>(activity.tags);
  const fitsNow =
    activity.goodIn.includes(weather.condition) &&
    !(WET_OR_COLD(weather) && activity.setting === "outdoor");
  if (fitsNow) tags.add("Good now");
  return Array.from(tags);
}

/** Write the friendly "why this, right now" line. */
function buildReason(activity: Activity, weather: WeatherNow, mood: Mood | null): string {
  const bits: string[] = [];

  // Weather-led reasoning first — it's the product's whole point.
  if (WET_OR_COLD(weather) && activity.setting === "indoor") {
    bits.push(
      weather.condition === "rainy"
        ? "It's raining out, so this keeps you dry"
        : weather.condition === "snowy"
        ? "It's snowing, so this is a warm, dry pick"
        : "It's properly cold, so this is a cosy pick"
    );
  } else if (weather.condition === "sunny" && activity.setting === "outdoor") {
    bits.push("The sun's out — grab it while it lasts");
  } else if (weather.condition === "cloudy" && activity.setting === "outdoor") {
    bits.push("Dry enough to be outside without freezing");
  } else if (activity.goodIn.includes(weather.condition)) {
    bits.push("Works nicely in today's weather");
  }

  // Then mood-led reasoning.
  if (mood === "free" && activity.cost === "Free") bits.push("and it won't cost you anything");
  else if (mood === "student" && activity.tags.includes("Student-friendly"))
    bits.push("and it's easy on a student budget");
  else if (mood === "date" && activity.bestFor.includes("couples"))
    bits.push("and it makes for a relaxed date");
  else if (mood === "social" && activity.bestFor.includes("groups"))
    bits.push("and it's an easy one to round up mates for");
  else if (mood === "hidden-gem" && activity.tags.includes("Hidden gem"))
    bits.push("and it's the kind of spot locals keep to themselves");
  else if (mood === "relaxing") bits.push("and it's low-effort and easy-going");

  if (bits.length === 0) {
    if (activity.cost === "Free") return "A reliable free option in your city.";
    return "A solid local option for right now.";
  }
  const sentence = bits.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function toRecommendation(
  activity: Activity,
  weather: WeatherNow,
  mood: Mood | null,
  score: number
): Recommendation {
  return {
    activity,
    tags: buildTags(activity, weather),
    reason: buildReason(activity, weather, mood),
    score,
  };
}

/**
 * Main entry point. Returns up to `limit` ranked recommendations, with a
 * diversity pass so the list spans different categories rather than clustering.
 */
export function recommend(input: EngineInput, limit = 6): Recommendation[] {
  const { city, weather, mood, seed = 0 } = input;

  const scored = ACTIVITIES.filter((a) => a.city === city)
    .map((activity) => ({
      activity,
      score: scoreActivity(activity, { weather, mood, seed }),
    }))
    .sort((a, b) => b.score - a.score);

  // --- Open-now preference --------------------------------------------------
  // Anything shut at the current (UK) time drops to the back, so a museum that
  // closed at 17:00 won't headline at 22:25. Closed venues still appear if too
  // few places are open (e.g. late at night) — the card badges them clearly.
  const minsNow = ukMinutesNow();
  const openFirst = [
    ...scored.filter((s) => isOpenNow(s.activity, minsNow)),
    ...scored.filter((s) => !isOpenNow(s.activity, minsNow)),
  ];

  // --- Diversity pass -------------------------------------------------------
  // First pick the best of each category, then top up with the next-best
  // remaining. Result: café · museum · walk · gig — not three cafés.
  const chosen: typeof scored = [];
  const usedCategories = new Set<string>();

  for (const item of openFirst) {
    if (chosen.length >= limit) break;
    if (!usedCategories.has(item.activity.category)) {
      chosen.push(item);
      usedCategories.add(item.activity.category);
    }
  }
  if (chosen.length < limit) {
    for (const item of openFirst) {
      if (chosen.length >= limit) break;
      if (!chosen.includes(item)) chosen.push(item);
    }
  }

  return chosen.map((c) => toRecommendation(c.activity, weather, mood, c.score));
}

/** A friendly label for a mood, used in the UI. */
export const MOOD_LABELS: Record<Mood, string> = {
  bored: "I'm bored",
  free: "Something free",
  student: "I'm a student",
  indoors: "Keep me indoors",
  outdoors: "Get me outdoors",
  date: "A date idea",
  social: "Something social",
  relaxing: "Something relaxing",
  "hidden-gem": "A hidden gem",
};
