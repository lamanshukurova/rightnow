import type { Mood } from "../types";
import { MOOD_LABELS } from "../lib/recommendations";

interface Props {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
}

// Order chosen so the most common "I'm bored / something free" sit first.
const ORDER: Mood[] = [
  "bored",
  "free",
  "outdoors",
  "indoors",
  "student",
  "date",
  "social",
  "relaxing",
  "hidden-gem",
];

export default function MoodChips({ value, onChange }: Props) {
  return (
    <div>
      <p className="data-label mb-2 text-ink-soft">What's the vibe? (optional)</p>
      <div className="flex flex-wrap gap-2">
        {ORDER.map((mood) => {
          const selected = value === mood;
          return (
            <button
              key={mood}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : mood)}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                selected
                  ? "border-ink bg-ink text-paper shadow-sm"
                  : "border-line bg-card text-ink-soft hover:border-ink/40 hover:text-ink"
              }`}
            >
              {MOOD_LABELS[mood]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
