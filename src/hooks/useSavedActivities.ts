import { useCallback, useEffect, useState } from "react";
import type { Activity } from "../types";
import { ACTIVITY_BY_ID } from "../data";

// ---------------------------------------------------------------------------
// SAVED ACTIVITIES
//
// Persist a list of saved activity ids in localStorage — no login, no backend.
// A tiny pub/sub keeps every mounted copy of the hook (header badge, cards,
// saved page) in sync the instant something is saved or removed, and a
// `storage` listener syncs across browser tabs too.
// ---------------------------------------------------------------------------

const KEY = "rightnow:saved:v1";
const EVENT = "rightnow:saved-changed";

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* storage full or unavailable — fail quietly, app still works in-memory */
  }
}

export function useSavedActivities() {
  const [ids, setIds] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : read()
  );

  // Re-read whenever anything (this tab or another) changes the store.
  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    write(next);
    setIds(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((x) => x !== id);
    write(next);
    setIds(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setIds([]);
  }, []);

  // Resolve ids → full activities (newest first), skipping any that no longer exist.
  const activities: Activity[] = ids
    .map((id) => ACTIVITY_BY_ID[id])
    .filter((a): a is Activity => Boolean(a))
    .reverse();

  return { ids, count: activities.length, isSaved, toggle, remove, clear, activities };
}
