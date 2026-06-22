import type { Activity, Category, City, WeatherNow } from "../types";
import { ACTIVITIES } from "../data";
import { scoreActivity } from "./recommendations";
import { isOpenNow, ukMinutesNow } from "./hours";

// ---------------------------------------------------------------------------
// BUILD MY PLAN
//
// Instead of a flat list, assemble a believable half-day itinerary: a sequence
// of 3–4 stops that flow sensibly (a coffee, then a thing to do, then a walk or
// a bite), chosen for the weather and a chosen "vibe", with the total cost and
// duration summed up. Reuses the engine's scorer so plan stops are as good as
// the standalone recommendations.
// ---------------------------------------------------------------------------

export type PlanVibe = "classic" | "cheap" | "rainy" | "date" | "active";

export const PLAN_VIBES: { id: PlanVibe; label: string; blurb: string }[] = [
  { id: "classic", label: "A classic day out", blurb: "A bit of everything, weather-adjusted" },
  { id: "cheap", label: "Cheap day", blurb: "Free and low-cost only" },
  { id: "rainy", label: "Rainy day plan", blurb: "Stays indoors and dry" },
  { id: "date", label: "Date day", blurb: "Relaxed, couple-friendly" },
  { id: "active", label: "Get outside", blurb: "Walks, parks and fresh air" },
];

export interface PlanStop {
  activity: Activity;
  /** When in the day this slot sits, e.g. "First up", "Then", "To finish". */
  slot: string;
}

export interface Plan {
  title: string;
  city: City;
  vibe: PlanVibe;
  stops: PlanStop[];
  totalGBP: number;
  totalMins: number;
  /** A friendly one-liner summarising the plan. */
  note: string;
}

/** Ordered category templates per vibe — adjusted for weather below. */
function templateFor(vibe: PlanVibe, weather: WeatherNow): Category[] {
  const wet = weather.condition === "rainy" || weather.condition === "snowy";

  switch (vibe) {
    case "rainy":
      return ["Cafés", "Museums", "Hidden Gems"];
    case "cheap":
      return wet ? ["Cafés", "Museums", "Markets"] : ["Cafés", "Parks", "Markets"];
    case "date":
      return wet ? ["Cafés", "Museums", "Comedy"] : ["Cafés", "Parks", "Live Music"];
    case "active":
      return wet ? ["Parks", "Cafés", "Museums"] : ["Parks", "Walks", "Cafés"];
    case "classic":
    default:
      return wet ? ["Cafés", "Museums", "Markets"] : ["Cafés", "Parks", "Museums"];
  }
}

/** Vibe-specific filter so e.g. "cheap" only ever surfaces free/£ stops. */
function vibeFilter(vibe: PlanVibe): (a: Activity) => boolean {
  switch (vibe) {
    case "cheap":
      return (a) => a.cost === "Free" || a.cost === "£";
    case "rainy":
      return (a) => a.setting !== "outdoor";
    case "date":
      return (a) => a.bestFor.includes("couples");
    case "active":
      return (a) => a.setting !== "indoor";
    default:
      return () => true;
  }
}

const SLOT_LABELS = ["First up", "Then", "To finish", "If you've still got time"];

function timeOfDayWord(): string {
  const h = new Date().getHours();
  if (h < 12) return "MORNING";
  if (h < 17) return "AFTERNOON";
  return "EVENING";
}

function formatTitle(vibe: PlanVibe, city: City): string {
  const when = timeOfDayWord();
  switch (vibe) {
    case "cheap":
      return `CHEAP ${when} IN ${city.toUpperCase()}`;
    case "rainy":
      return `RAINY DAY PLAN · ${city.toUpperCase()}`;
    case "date":
      return `DATE ${when} IN ${city.toUpperCase()}`;
    case "active":
      return `OUTDOORS ${when} IN ${city.toUpperCase()}`;
    default:
      return `A ${when} IN ${city.toUpperCase()}`;
  }
}

export interface PlanInput {
  city: City;
  weather: WeatherNow;
  vibe: PlanVibe;
  seed?: number;
}

/** Generate a single itinerary. Change `seed` to get a fresh plan. */
export function buildPlan({ city, weather, vibe, seed = 0 }: PlanInput): Plan {
  const inCity = ACTIVITIES.filter((a) => a.city === city);
  const allowed = inCity.filter(vibeFilter(vibe));
  // Fall back to the whole city pool if a strict vibe filter is too thin.
  const pool = allowed.length >= 3 ? allowed : inCity;

  const minsNow = ukMinutesNow();
  const ranked = (cat: Category | null) =>
    pool
      .filter((a) => (cat ? a.category === cat : true))
      .map((a) => ({ a, s: scoreActivity(a, { weather, mood: null, seed }) }))
      // Open-now venues first, then by score — no shut stops in a plan you'd
      // start now, unless nothing in that slot is open.
      .sort(
        (x, y) =>
          Number(isOpenNow(y.a, minsNow)) - Number(isOpenNow(x.a, minsNow)) ||
          y.s - x.s
      )
      .map((x) => x.a);

  const template = templateFor(vibe, weather);
  const stops: PlanStop[] = [];
  const usedIds = new Set<string>();

  template.forEach((cat, i) => {
    const pick = ranked(cat).find((a) => !usedIds.has(a.id));
    const chosen = pick ?? ranked(null).find((a) => !usedIds.has(a.id));
    if (chosen) {
      usedIds.add(chosen.id);
      stops.push({ activity: chosen, slot: SLOT_LABELS[i] ?? "Next" });
    }
  });

  const totalGBP = stops.reduce((sum, s) => sum + s.activity.costGBP, 0);
  const totalMins = stops.reduce((sum, s) => sum + s.activity.durationMins, 0);

  const costWord =
    totalGBP === 0 ? "completely free" : `around £${totalGBP} a head`;
  const note = `A ${Math.round((totalMins / 60) * 2) / 2}-hour plan, ${costWord}.`;

  return {
    title: formatTitle(vibe, city),
    city,
    vibe,
    stops,
    totalGBP,
    totalMins,
    note,
  };
}

/** "3 hr 15 min" style label from minutes. */
export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
