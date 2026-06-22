import type { WeatherCondition, WeatherNow } from "../types";

export function WeatherIcon({
  condition,
  size = 22,
}: {
  condition: WeatherCondition;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (condition) {
    case "sunny":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4.2" fill="#F2B33D" />
          <g stroke="#F2B33D" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7 17 17M7 7 5.3 5.3" />
          </g>
        </svg>
      );
    case "cloudy":
      return (
        <svg {...common}>
          <path
            d="M7.5 18h9.5a3.5 3.5 0 0 0 .4-6.98A5 5 0 0 0 8 9.4 3.8 3.8 0 0 0 7.5 18Z"
            fill="#9AA7B4"
          />
        </svg>
      );
    case "rainy":
      return (
        <svg {...common}>
          <path
            d="M7.5 15h9.5a3.5 3.5 0 0 0 .4-6.98A5 5 0 0 0 8 6.4 3.8 3.8 0 0 0 7.5 15Z"
            fill="#7E8B98"
          />
          <g stroke="#4F86B5" strokeWidth="2" strokeLinecap="round">
            <path d="M8.5 18l-1 2.5M12 18l-1 2.5M15.5 18l-1 2.5" />
          </g>
        </svg>
      );
    case "snowy":
      return (
        <svg {...common}>
          <path
            d="M7.5 14h9.5a3.5 3.5 0 0 0 .4-6.98A5 5 0 0 0 8 5.4 3.8 3.8 0 0 0 7.5 14Z"
            fill="#AEBDC9"
          />
          <g fill="#4F86B5">
            <circle cx="8.5" cy="18.5" r="1" />
            <circle cx="12" cy="20" r="1" />
            <circle cx="15.5" cy="18.5" r="1" />
          </g>
        </svg>
      );
    case "cold":
      return (
        <svg {...common}>
          <g stroke="#4F86B5" strokeWidth="2" strokeLinecap="round">
            <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
            <path d="M12 6.5 9.7 5M12 6.5 14.3 5M12 17.5 9.7 19M12 17.5 14.3 19" />
          </g>
        </svg>
      );
  }
}

function WindIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3" />
      </g>
    </svg>
  );
}

export default function WeatherDisplay({ weather }: { weather: WeatherNow }) {
  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full border border-ink/10 bg-card/70 px-3.5 py-2 backdrop-blur">
      <WeatherIcon condition={weather.condition} />
      <span className="data-label text-ink-soft">{weather.city}</span>
      <span className="font-mono text-sm font-bold text-ink">{weather.temp}°</span>
      <span className="hidden text-sm text-ink-soft sm:inline">· {weather.label}</span>
      {weather.windy && (
        <span className="hidden items-center gap-1 text-sm text-ink-soft sm:inline-flex">
          · <WindIcon /> {weather.windMph} mph
        </span>
      )}
      <span
        className="data-label rounded-full bg-ink/5 px-1.5 py-0.5 text-[0.6rem] text-ink-soft/80"
        title={
          weather.source === "live"
            ? "Live data from Open-Meteo"
            : "Live weather unavailable — showing an estimate"
        }
      >
        {weather.source === "live" ? "LIVE" : "EST."}
      </span>
    </div>
  );
}
