import type { WeatherNow } from "../types";
import { WeatherIcon } from "./WeatherDisplay";
import { useSavedActivities } from "../hooks/useSavedActivities";

export type View = "discover" | "plan" | "saved";

interface Props {
  weather: WeatherNow | null;
  view: View;
  onNavigate: (view: View) => void;
}

const TABS: { id: View; label: string }[] = [
  { id: "discover", label: "Discover" },
  { id: "plan", label: "Build a plan" },
  { id: "saved", label: "Saved" },
];

export default function Header({ weather, view, onNavigate }: Props) {
  const { count } = useSavedActivities();

  return (
    <div className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <button
          type="button"
          onClick={() => onNavigate("discover")}
          className="flex items-center gap-2"
        >
          <Logo />
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            RightNow
          </span>
          <span className="data-label hidden text-green sm:inline">UK</span>
        </button>

        {/* Primary nav */}
        <nav className="flex items-center gap-1 rounded-full border border-line bg-card p-1">
          {TABS.map((tab) => {
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                }`}
              >
                {tab.label}
                {tab.id === "saved" && count > 0 && (
                  <span
                    className={`ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.65rem] font-bold ${
                      active ? "bg-paper text-ink" : "bg-green text-white"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {weather && (
          <span className="hidden items-center gap-1.5 text-sm text-ink-soft lg:flex">
            <WeatherIcon condition={weather.condition} size={18} />
            <span className="font-mono font-bold text-ink">{weather.temp}°</span>
            {weather.city}
          </span>
        )}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#15243A" />
      <path
        d="M16 6c-4.4 0-8 3.5-8 7.9 0 5.5 7 11.4 7.3 11.6.4.3.9.3 1.3 0 .3-.2 7.4-6.1 7.4-11.6C24 9.5 20.4 6 16 6Z"
        fill="#1B7A4B"
      />
      <circle cx="16" cy="13.6" r="2.9" fill="#F2B33D" />
    </svg>
  );
}
