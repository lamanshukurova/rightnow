import type { City, Mood, WeatherNow } from "../types";
import CitySelect from "./CitySelect";
import MoodChips from "./MoodChips";
import WeatherDisplay from "./WeatherDisplay";
import { SkeletonWeather } from "./Skeletons";

interface Props {
  city: City | null;
  mood: Mood | null;
  weather: WeatherNow | null;
  weatherLoading: boolean;
  onCityChange: (city: City) => void;
  onMoodChange: (mood: Mood | null) => void;
  onSubmit: () => void;
  onBuildPlan: () => void;
}

export default function Hero({
  city,
  mood,
  weather,
  weatherLoading,
  onCityChange,
  onMoodChange,
  onSubmit,
  onBuildPlan,
}: Props) {
  const condition = weather?.condition ?? "cloudy";

  return (
    <header className="relative isolate overflow-hidden">
      {/* The signature element: a sky that reflects the current weather. */}
      <div className={`sky sky--${condition}`} aria-hidden="true">
        <div className="sky__sun" />
        <div className="sky__cloud c1" />
        <div className="sky__cloud c2" />
        {(condition === "rainy" || condition === "snowy") && (
          <div className={condition === "snowy" ? "sky__snow" : "sky__rain"} />
        )}
      </div>

      <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-10 sm:pt-16">
        <div className="mb-6 flex min-h-[2.5rem] justify-center">
          {weatherLoading ? (
            <SkeletonWeather />
          ) : (
            weather && <WeatherDisplay weather={weather} />
          )}
        </div>

        <h1 className="text-center text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl">
          {city ? (
            <>
              Bored in {city}?
              <br />
              <span className="text-green">Let's fix that.</span>
            </>
          ) : (
            <>
              In the UK and bored?
              <br />
              <span className="text-green">Let's fix that.</span>
            </>
          )}
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-soft">
          Tell us your city and we'll give you a few actually good things to do —
          picked for whatever the weather's doing right now.
        </p>

        <div className="mx-auto mt-8 rounded-xl2 border border-line bg-card/80 p-5 shadow-card backdrop-blur-sm sm:p-6">
          <CitySelect value={city} onChange={onCityChange} />

          <div className="mt-5">
            <MoodChips value={mood} onChange={onMoodChange} />
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!city}
            className="mt-6 w-full rounded-xl2 bg-green px-6 py-4 text-lg font-bold text-white shadow-sm transition enabled:hover:bg-green-deep enabled:hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-40"
          >
            {city ? "Find something to do" : "Pick a city first"}
          </button>

          {/* Secondary path into the plan generator. */}
          <button
            type="button"
            onClick={onBuildPlan}
            disabled={!city}
            className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-ink-soft transition enabled:hover:text-ink disabled:opacity-40"
          >
            Or build me a full plan
            <span aria-hidden="true">→</span>
          </button>

          <p className="mt-3 text-center text-xs text-ink-soft">
            No login. No payment. Just ideas — usually in under 30 seconds.
          </p>
        </div>
      </div>
    </header>
  );
}
