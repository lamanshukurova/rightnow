import type { WeatherNow } from "../types";

/**
 * Two jobs:
 *  - With no weather/city yet, it's the pre-search invitation.
 *  - With a city but no matches, it's a friendly no-results nudge.
 * Per the brief's empty-state guidance: an empty screen is an invitation to act.
 */
export default function EmptyState({ weather }: { weather?: WeatherNow }) {
  if (!weather) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-tint text-green">
          <CompassIcon />
        </div>
        <h2 className="text-xl font-bold text-ink">
          Pick a city to get started
        </h2>
        <p className="mt-2 text-ink-soft">
          Choose where you are and we'll sort out a few good things to do,
          based on what the weather's actually doing right now.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sun-tint text-sun-deep">
        <CompassIcon />
      </div>
      <h2 className="text-xl font-bold text-ink">
        Nothing matched that exactly
      </h2>
      <p className="mt-2 text-ink-soft">
        Try clearing the vibe filter, or pick a different one — there's always
        something on in {weather.city}.
      </p>
    </div>
  );
}

function CompassIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M15.5 8.5l-1.8 5-5 1.8 1.8-5 5-1.8Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
