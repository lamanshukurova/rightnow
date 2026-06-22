import type { Activity, RawCategory } from "../types";

/**
 * Opening-hours awareness.
 *
 * The MVP doesn't carry official per-day opening times for every venue, so we
 * derive a sensible *typical* daily window from the venue's fine-grained
 * category (with an optional per-activity override). It's approximate — enough
 * to stop the app from cheerfully recommending a museum at 10:25pm — and the
 * card always links out to Google Maps for the authoritative hours.
 *
 * Times are minutes from midnight (e.g. 600 = 10:00). A `close` value past
 * 1440 means "after midnight" (e.g. a club closing at 02:00 = 1560).
 */

export type DayWindow = { open: number; close: number } | "always";

export interface OpenInfo {
  /** "open" now, "closed" now, or "always" accessible (parks, walks…). */
  status: "open" | "closed" | "always";
  /** Minutes-from-midnight the venue next opens (when currently closed). */
  opensAt?: number;
  /** Minutes-from-midnight the venue closes (when currently open). */
  closesAt?: number;
  /** Short label for the card, e.g. "Open · till 17:00" or "Closed · opens 10:00". */
  label: string;
}

const h = (hour: number, min = 0) => hour * 60 + min;

/** Typical daily opening window by fine-grained category. Approximate. */
const DEFAULT_HOURS: Record<RawCategory, DayWindow> = {
  "Independent café": { open: h(8), close: h(17) },
  "Outdoor café": { open: h(8), close: h(17) },
  "Local market": { open: h(9), close: h(17) },
  Museum: { open: h(10), close: h(17) },
  Gallery: { open: h(10), close: h(17) },
  "National Trust / heritage": { open: h(9, 30), close: h(17) },
  Bookshop: { open: h(9), close: h(18) },
  "Escape room": { open: h(10), close: h(22) },
  "Indoor climbing": { open: h(7), close: h(22) },
  "Board game café": { open: h(11), close: h(23) },
  "Comedy night": { open: h(19), close: h(23) },
  "Live music": { open: h(19), close: h(23, 30) },
  "Festival / event": { open: h(10), close: h(22) },
  "Student-friendly": { open: h(9), close: h(23) },
  // Outdoor / public spaces — always accessible.
  "Parks & walks": "always",
  "Canal walk": "always",
  "Seaside trip": "always",
  "Day trip": "always",
};

/** Format minutes-from-midnight as "HH:MM" (wrapping past-midnight values). */
export function formatClock(mins: number): string {
  const m = ((mins % 1440) + 1440) % 1440;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Current minutes-from-midnight in UK local time (Europe/London, DST-aware). */
export function ukMinutesNow(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

function windowFor(activity: Activity): DayWindow {
  return activity.hours ?? DEFAULT_HOURS[activity.rawCategory] ?? "always";
}

/** Work out whether an activity is open at `minutesNow` (UK time by default). */
export function openState(
  activity: Activity,
  minutesNow: number = ukMinutesNow()
): OpenInfo {
  const win = windowFor(activity);
  if (win === "always") {
    return { status: "always", label: "Open anytime" };
  }

  const { open, close } = win;
  const overnight = close <= open; // closes after midnight
  const isOpen = overnight
    ? minutesNow >= open || minutesNow < close % 1440
    : minutesNow >= open && minutesNow < close;

  if (isOpen) {
    return {
      status: "open",
      closesAt: close,
      label: `Open · till ${formatClock(close)}`,
    };
  }
  return {
    status: "closed",
    opensAt: open,
    label: `Closed · opens ${formatClock(open)}`,
  };
}

/** Convenience: is this activity currently open (or always accessible)? */
export function isOpenNow(
  activity: Activity,
  minutesNow: number = ukMinutesNow()
): boolean {
  return openState(activity, minutesNow).status !== "closed";
}
