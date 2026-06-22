import type { Recommendation, WeatherNow, Mood } from "../types";
import { MOOD_LABELS } from "../lib/recommendations";
import ActivityCard from "./ActivityCard";
import EmptyState from "./EmptyState";
import { SkeletonGrid } from "./Skeletons";

interface Props {
  recs: Recommendation[];
  weather: WeatherNow;
  mood: Mood | null;
  loading: boolean;
  onShuffle: () => void;
}

export default function RecommendationResults({
  recs,
  weather,
  mood,
  loading,
  onShuffle,
}: Props) {
  return (
    <section
      aria-label="Recommendations"
      className="mx-auto w-full max-w-6xl px-5 pb-20"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">
            A few actually good ideas in {weather.city}
          </h2>
          <p className="mt-1 text-ink-soft">
            Picked for {weather.label.toLowerCase()} · {weather.temp}°
            {mood ? ` · ${MOOD_LABELS[mood].toLowerCase()}` : ""}.
          </p>
        </div>

        <button
          type="button"
          onClick={onShuffle}
          disabled={loading}
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-ink/15 bg-card px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/40 hover:shadow-sm disabled:opacity-50 sm:self-auto"
        >
          <RefreshIcon />
          Try another mix
        </button>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : recs.length === 0 ? (
        <EmptyState weather={weather} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {recs.map((rec, i) => (
            <ActivityCard
              key={rec.activity.id}
              activity={rec.activity}
              reason={rec.reason}
              tags={rec.tags}
              condition={weather.condition}
              moodMatch={mood ? rec.activity.moods.includes(mood) : false}
              index={i}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="transition group-hover:rotate-90"
    >
      <path d="M20 11a8 8 0 1 0-.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 4v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
