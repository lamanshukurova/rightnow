import type { Recommendation, Setting, Tag } from "../types";
import { WeatherIcon } from "./WeatherDisplay";
import type { WeatherCondition } from "../types";

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
  rec: Recommendation;
  /** Current condition, so the card can show weather suitability. */
  condition: WeatherCondition;
  index: number;
}

export default function RecommendationCard({ rec, condition, index }: Props) {
  const { activity, tags, reason } = rec;

  // Show the most useful tags first; "Good now" always leads if present.
  const ordered = [...tags].sort((a, b) =>
    a === "Good now" ? -1 : b === "Good now" ? 1 : 0
  );

  return (
    <article
      className="animate-fade-up flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {ordered.map((tag) => (
            <span
              key={tag}
              className={`data-label rounded-full px-2.5 py-1 ${TAG_STYLE[tag]}`}
            >
              {tag === "Good now" && <span className="mr-1">●</span>}
              {tag}
            </span>
          ))}
        </div>

        {/* Title + place */}
        <h3 className="text-xl font-bold leading-tight text-ink">
          {activity.name}
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          {activity.category} · {activity.city}
        </p>

        {/* Description */}
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
          {activity.description}
        </p>

        {/* Why now */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-green/15 bg-green-tint/60 p-3">
          <span className="mt-0.5 shrink-0 text-green" aria-hidden="true">
            <SparkIcon />
          </span>
          <p className="text-sm font-medium leading-snug text-green-deep">
            {reason}
          </p>
        </div>

        <div className="flex-1" />

        {/* Departures-board detail row — the card's signature */}
        <dl className="mt-5 grid grid-cols-2 gap-y-2 border-t border-dashed border-line pt-4 font-mono text-xs">
          <Detail label="Cost" value={activity.cost} />
          <Detail label="Setting" value={SETTING_LABEL[activity.setting]} />
          <Detail
            label="Best for"
            value={activity.bestFor.slice(0, 2).join(", ")}
          />
          <Detail
            label="Weather"
            value={
              <span className="inline-flex items-center gap-1">
                <WeatherIcon condition={condition} size={14} />
                {activity.goodIn.includes(condition) ? "Suits now" : "Any time"}
              </span>
            }
          />
        </dl>

        {/* Time hint */}
        <p className="mt-3 text-xs font-medium text-ink-soft">
          ⏱ {activity.timeHint}
        </p>
      </div>
    </article>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft/70">
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
