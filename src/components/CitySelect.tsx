import { useEffect, useId, useRef, useState } from "react";
import { CITIES, type City } from "../types";

interface Props {
  value: City | null;
  onChange: (city: City) => void;
}

/**
 * A searchable city picker. Type to filter, click or press Enter to choose.
 * Falls back gracefully to a plain list of all ten cities.
 */
export default function CitySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const matches = CITIES.filter((c) =>
    c.toLowerCase().includes(query.trim().toLowerCase())
  );

  // Close when clicking outside.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(city: City) {
    onChange(city);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[active]) choose(matches[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <label
        htmlFor={listId}
        className="data-label mb-2 block text-ink-soft"
      >
        Your city
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-green">
          <PinIcon />
        </span>
        <input
          id={listId}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listId}-list`}
          autoComplete="off"
          value={open ? query : value ?? ""}
          placeholder="Search a UK city…"
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full rounded-xl2 border border-line bg-card py-4 pl-12 pr-4 text-lg font-medium text-ink shadow-sm transition focus:border-green focus:shadow-card"
        />
      </div>

      {open && (
        <ul
          id={`${listId}-list`}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl2 border border-line bg-card p-1.5 shadow-lift"
        >
          {matches.length === 0 && (
            <li className="px-4 py-3 text-sm text-ink-soft">
              No UK cities match that yet — we cover ten to start.
            </li>
          )}
          {matches.map((city, i) => (
            <li key={city} role="option" aria-selected={city === value}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(city)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base transition ${
                  i === active ? "bg-green-tint text-green-deep" : "text-ink"
                }`}
              >
                <span className={i === active ? "text-green" : "text-line"}>
                  <PinIcon small />
                </span>
                <span className="font-medium">{city}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PinIcon({ small = false }: { small?: boolean }) {
  const s = small ? 16 : 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
