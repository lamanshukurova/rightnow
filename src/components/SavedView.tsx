import { useSavedActivities } from "../hooks/useSavedActivities";
import ActivityCard from "./ActivityCard";

interface Props {
  /** Jump back to discovery when there's nothing saved yet. */
  onBrowse: () => void;
}

export default function SavedView({ onBrowse }: Props) {
  const { activities, count, clear } = useSavedActivities();

  if (count === 0) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sun-tint text-sun-deep">
          <BookmarkIcon />
        </div>
        <h2 className="text-xl font-bold text-ink">Nothing saved yet</h2>
        <p className="mt-2 text-ink-soft">
          Tap the bookmark on any idea and it'll wait for you here — stored on
          this device, no account needed.
        </p>
        <button
          type="button"
          onClick={onBrowse}
          className="mt-5 rounded-xl2 bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-green-deep"
        >
          Find something to do
        </button>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">Saved ideas</h2>
          <p className="mt-1 text-ink-soft">
            {count} {count === 1 ? "idea" : "ideas"} saved on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear all saved ideas?")) clear();
          }}
          className="shrink-0 rounded-full border border-ink/15 bg-card px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-ink/40 hover:text-ink"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity, i) => (
          <ActivityCard key={activity.id} activity={activity} index={i} />
        ))}
      </div>
    </section>
  );
}

function BookmarkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
