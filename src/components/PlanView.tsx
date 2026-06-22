import { useEffect, useState } from "react";
import type { City, WeatherNow } from "../types";
import { buildPlan, formatDuration, PLAN_VIBES, type Plan, type PlanVibe } from "../lib/planner";
import ActivityCard from "./ActivityCard";
import { SkeletonCard } from "./Skeletons";

interface Props {
  city: City | null;
  weather: WeatherNow | null;
}

export default function PlanView({ city, weather }: Props) {
  const [vibe, setVibe] = useState<PlanVibe>("classic");
  const [seed, setSeed] = useState(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [building, setBuilding] = useState(false);

  // Re-plan whenever the inputs change, with a short shimmer for feel.
  useEffect(() => {
    if (!city || !weather) return;
    setBuilding(true);
    const t = setTimeout(() => {
      setPlan(buildPlan({ city, weather, vibe, seed }));
      setBuilding(false);
    }, 350);
    return () => clearTimeout(t);
  }, [city, weather, vibe, seed]);

  if (!city || !weather) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-tint text-green">
          <RouteIcon />
        </div>
        <h2 className="text-xl font-bold text-ink">Pick a city to build a plan</h2>
        <p className="mt-2 text-ink-soft">
          Choose where you are on the home tab and we'll string together a full
          afternoon — coffee, a thing to do, a walk — sized to the weather.
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-5 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">Build my plan</h2>
        <p className="mt-1 text-ink-soft">
          A ready-made itinerary for {city}, tuned to {weather.label.toLowerCase()}.
          Pick a vibe and we'll do the rest.
        </p>
      </div>

      {/* Vibe selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {PLAN_VIBES.map((v) => {
          const active = v.id === vibe;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setVibe(v.id)}
              aria-pressed={active}
              title={v.blurb}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                active
                  ? "border-ink bg-ink text-paper shadow-sm"
                  : "border-line bg-card text-ink-soft hover:border-ink/40 hover:text-ink"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {building || !plan ? (
        <div className="space-y-4">
          <div className="skeleton h-24 w-full rounded-xl2" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="animate-fade-up">
          {/* Plan header */}
          <div className="rounded-xl2 border border-line bg-ink p-5 text-paper shadow-card sm:p-6">
            <p className="font-mono text-sm tracking-wide text-sun">{plan.title}</p>
            <p className="mt-2 text-paper/85">{plan.note}</p>
            <div className="mt-4 flex gap-6 font-mono text-sm">
              <span>
                <span className="block text-[0.6rem] uppercase tracking-[0.12em] text-paper/60">
                  Total cost
                </span>
                <span className="text-lg font-bold">
                  {plan.totalGBP === 0 ? "Free" : `~£${plan.totalGBP}`}
                </span>
              </span>
              <span>
                <span className="block text-[0.6rem] uppercase tracking-[0.12em] text-paper/60">
                  Time
                </span>
                <span className="text-lg font-bold">{formatDuration(plan.totalMins)}</span>
              </span>
              <span>
                <span className="block text-[0.6rem] uppercase tracking-[0.12em] text-paper/60">
                  Stops
                </span>
                <span className="text-lg font-bold">{plan.stops.length}</span>
              </span>
            </div>
          </div>

          {/* Itinerary */}
          <ol className="mt-5 space-y-4">
            {plan.stops.map((stop, i) => (
              <li key={stop.activity.id} className="relative pl-10">
                <span className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-green font-mono text-sm font-bold text-white">
                  {i + 1}
                </span>
                {i < plan.stops.length - 1 && (
                  <span className="absolute left-[13px] top-9 h-[calc(100%-1rem)] w-px bg-line" aria-hidden="true" />
                )}
                <p className="data-label mb-2 text-ink-soft">{stop.slot}</p>
                <ActivityCard
                  activity={stop.activity}
                  condition={weather.condition}
                  index={i}
                />
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="group mt-6 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/40 hover:shadow-sm"
          >
            <RefreshIcon /> Regenerate plan
          </button>
        </div>
      )}
    </section>
  );
}

function RouteIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition group-hover:rotate-90">
      <path d="M20 11a8 8 0 1 0-.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 4v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
