import { useEffect, useRef, useState } from "react";
import type { City, Mood, Recommendation, WeatherNow } from "./types";
import { getWeather } from "./lib/weather";
import { recommend } from "./lib/recommendations";
import Header, { type View } from "./components/Header";
import Hero from "./components/Hero";
import RecommendationResults from "./components/RecommendationResults";
import EmptyState from "./components/EmptyState";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import PlanView from "./components/PlanView";
import SavedView from "./components/SavedView";

export default function App() {
  const [view, setView] = useState<View>("discover");
  const [city, setCity] = useState<City | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [weather, setWeather] = useState<WeatherNow | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [seed, setSeed] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);

  // When the city changes, fetch its live weather (with a loading state).
  // getWeather never throws — it falls back to an estimate — so the UI is safe.
  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setWeatherLoading(true);
    getWeather(city).then((w) => {
      if (cancelled) return;
      setWeather(w);
      setWeatherLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [city]);

  // Once searched, keep results live as mood/weather/seed change.
  useEffect(() => {
    if (recs === null || !city || !weather) return;
    setRecs(recommend({ city, weather, mood, seed }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, weather, seed]);

  function runSearch() {
    if (!city || !weather) return;
    setGenerating(true);
    // A short, deliberate beat so the skeleton reads as "thinking", not jank.
    window.setTimeout(() => {
      setRecs(recommend({ city, weather, mood, seed }));
      setGenerating(false);
    }, 400);
  }

  function handleSubmit() {
    if (!city) return;
    setView("discover");
    runSearch();
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleBuildPlan() {
    if (!city) return;
    setView("plan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleShuffle() {
    setSeed((s) => s + 1);
  }

  return (
    <div id="top" className="min-h-screen">
      <Header weather={weather} view={view} onNavigate={setView} />

      {view === "discover" && (
        <Hero
          city={city}
          mood={mood}
          weather={weather}
          weatherLoading={weatherLoading}
          onCityChange={setCity}
          onMoodChange={setMood}
          onSubmit={handleSubmit}
          onBuildPlan={handleBuildPlan}
        />
      )}

      <main ref={resultsRef} className="scroll-mt-16 pt-8">
        {view === "discover" &&
          (recs === null && !generating ? (
            <EmptyState />
          ) : (
            weather && (
              <RecommendationResults
                recs={recs ?? []}
                weather={weather}
                mood={mood}
                loading={generating}
                onShuffle={handleShuffle}
              />
            )
          ))}

        {view === "plan" && <PlanView city={city} weather={weather} />}

        {view === "saved" && <SavedView onBrowse={() => setView("discover")} />}
      </main>

      {view === "discover" && <HowItWorks />}
      <Footer />
    </div>
  );
}
