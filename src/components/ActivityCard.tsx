import type { Activity, Setting, Tag, WeatherCondition } from "../types";
import { WeatherIcon } from "./WeatherDisplay";
import CategoryCover from "./CategoryCover";
import { formatDuration } from "../lib/planner";
import { openState } from "../lib/hours";
import { useSavedActivities } from "../hooks/useSavedActivities";

// Tag styling — a quiet palette with one colour each, not a rainbow.
const TAG_STYLE: Record<Tag, string> = {
  "Good now": "bg-green text-white",
  Free: "bg-green-tint text-green-deep",
  "Rainy day": "bg-sky-tint text-sky-deep",
  "Student-friendly": "bg-plum-tint text-plum",
  "Hidden gem": "bg-sun-tint text-sun-deep",
  Indoors: "bg-ink/5 text-ink-soft",
  Outdoors: "bg-ink/5 text-ink-soft",
};

const SETTING_LABEL: Record<Setting, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  either: "In / out",
};

interface Props {
  activity: Activity;
  /** Current condition, so the card can show weather suitability. */
  condition?: WeatherCondition;
  /** Engine reasoning — omitted on the saved page. */
  reason?: string;
  /** Tags to show (engine may add "Good now"). Defaults to the activity's own. */
  tags?: Tag[];
  /** Show a "your vibe" badge when the activity matches the chosen mood. */
  moodMatch?: boolean;
  index?: number;
}

export default function ActivityCard({
  activity,
  condition,
  reason,
  tags,
  moodMatch = false,
  index = 0,
}: Props) {
  const { isSaved, toggle } = useSavedActivities();
  const saved = isSaved(activity.id);
  const open = openState(activity);

  const shown = tags ?? activity.tags;
  // "Good now" always leads if present.
  const ordered = [...shown].sort((a, b) =>
    a === "Good now" ? -1 : b === "Good now" ? 1 : 0
  );

  return (
    <article
      className="group/card animate-fade-up flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* ---- Cover image + overlaid badges ---- */}
      <div className="relative h-40 w-full overflow-hidden">
        <CategoryCover
          category={activity.category}
          imageUrl={activity.imageUrl}
          className="transition duration-500 group-hover/card:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="data-label rounded-full bg-card/90 px-2.5 py-1 text-ink shadow-sm backdrop-blur">
            {SETTING_LABEL[activity.setting]}
          </span>
          {moodMatch && (
            <span className="data-label rounded-full bg-ink/85 px-2.5 py-1 text-paper shadow-sm backdrop-blur">
              Your vibe
            </span>
          )}
        </div>
        {open.status === "closed" ? (
          <span className="data-label absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-paper shadow-sm backdrop-blur">
            {open.label}
          </span>
        ) : (
          <span className="data-label absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-green px-2.5 py-1 text-white shadow-sm">
            <span className="animate-pulse-dot">●</span>{" "}
            {open.status === "always" ? "Open now" : open.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* category · city */}
        <p className="data-label text-ink-soft/80">
          {activity.category} · {activity.city}
        </p>

        {/* Title */}
        <h3 className="mt-1 text-xl font-bold leading-tight text-ink">
          {activity.name}
        </h3>

        {/* Static tags (skip "Good now" — already on the image) */}
        {ordered.filter((t) => t !== "Good now").length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {ordered
              .filter((t) => t !== "Good now")
              .map((tag) => (
                <span
                  key={tag}
                  className={`data-label rounded-full px-2 py-0.5 ${TAG_STYLE[tag]}`}
                >
                  {tag}
                </span>
              ))}
          </div>
        )}

        {/* Description */}
        <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-ink-soft">
          {activity.description}
        </p>

        {/* Why now */}
        {reason && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-green/15 bg-green-tint/60 p-3">
            <span className="mt-0.5 shrink-0 text-green" aria-hidden="true">
              <SparkIcon />
            </span>
            <p className="text-sm font-medium leading-snug text-green-deep">
              {reason}
            </p>
          </div>
        )}

        <div className="flex-1" />

        {/* Departures-board detail row — the card's signature */}
        <dl className="mt-5 grid grid-cols-3 gap-y-2 border-t border-dashed border-line pt-4 font-mono text-xs">
          <Detail
            label="Cost"
            value={activity.cost === "Free" ? "Free" : `${activity.cost} ~£${activity.costGBP}`}
          />
          <Detail label="Time" value={formatDuration(activity.durationMins)} />
          <Detail label="Popular" value={`${activity.popularity}%`} />
          {condition && (
            <Detail
              label="Weather"
              value={
                <span className="inline-flex items-center gap-1">
                  <WeatherIcon condition={condition} size={14} />
                  {activity.goodIn.includes(condition) ? "Suits now" : "Any time"}
                </span>
              }
            />
          )}
        </dl>

        {/* ---- Actions ---- */}
        <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
          <a
            href={activity.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft"
          >
            <MapPinIcon /> Maps
          </a>
          <a
            href={activity.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/40 hover:shadow-sm"
          >
            <GlobeIcon /> {activity.hasOfficialSite ? "Website" : "Search"}
          </a>
          <button
            type="button"
            onClick={() => toggle(activity.id)}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved" : "Save activity"}
            title={saved ? "Saved — tap to remove" : "Save activity"}
            className={`inline-flex items-center justify-center rounded-lg border px-3 py-2.5 transition ${
              saved
                ? "border-green bg-green-tint text-green-deep"
                : "border-line bg-card text-ink-soft hover:border-ink/40 hover:text-ink"
            }`}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft/70">
        {label}
      </dt>
      <dd className="font-bold text-ink">{value}</dd>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2c-4 0-7 3-7 7 0 5 7 12 7 12s7-7 7-12c0-4-3-7-7-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.4" fill="currentColor" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
