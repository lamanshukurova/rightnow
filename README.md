# RightNow 🇬🇧

**"I'm in the UK, I'm bored — what should I do right now?"**

A fast, friendly, **weather-aware** activity finder for ten UK cities. Pick where
you are, tell us the vibe (optional), and get a short shortlist of genuinely
good things to do — chosen for whatever the weather is *actually* doing right
now, with one tap to open Maps, visit the website, or save it for later.

No login. No payments. No ads. Just ideas, usually in under 30 seconds.

---

## Run it locally

You'll need **Node 18+**.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually <http://localhost:5173>).

Other scripts:

```bash
npm run build      # type-check + production build into /dist
npm run preview    # preview the production build
npm run typecheck  # types only, no emit
```

---

## What it does

The app has three tabs:

1. **Discover** — pick a city (London, Leeds, Manchester, Birmingham, Liverpool,
   Bristol, Edinburgh, Glasgow, Newcastle, Sheffield), optionally pick a vibe,
   and get up to six ranked recommendations — each a different *kind* of thing
   so you never get three cafés in a row.
2. **Build a plan** — generate a complete, sequenced **itinerary** for the day
   (e.g. *"CHEAP AFTERNOON IN LEEDS"*) with ordered stops, a running total
   cost and total duration. Pick a vibe — classic, cheap, rainy-day, date, or
   active — and regenerate as many times as you like.
3. **Saved** — anything you bookmark is kept in your browser (localStorage) and
   listed here. No account needed.

Every card shows an image, title, description, cost estimate, duration,
indoor/outdoor badge, a "your vibe" match badge, a "why now" line, popularity,
and three actions: **Open in Google Maps**, **Visit website**, and **Save**.

---

## Live weather (Open-Meteo)

Weather is fetched **live** from [Open-Meteo](https://open-meteo.com) in
`src/lib/weather.ts` — a free, **keyless**, CORS-enabled API that includes UK
Met Office data, so there is nothing to configure.

When you select a city the app calls `fetchRealWeather(city)` using the city's
coordinates (`CITY_COORDS` in `src/types/index.ts`) and reads the *current*
temperature, apparent temperature, WMO weather code, cloud cover, wind speed,
precipitation and day/night flag. From that it derives one of five buckets —
**sunny, cloudy, rainy, snowy, cold** — plus a **windy** flag (≥20 mph).

That condition then directly shapes recommendations:

- **Wet (rain/snow) or cold** → indoor picks (museums, galleries, board-game
  cafés, indoor climbing, bookshops, arcades) are boosted, outdoor ones demoted.
- **Sunny** → parks, walks, markets, outdoor cafés and outdoor attractions rise.
- **Windy** → exposed outdoor activities take a small penalty.

**If the API fails or times out (8s)**, the app does *not* break: it silently
falls back to a plausible, city-biased **estimate** (`getWeather` returns
`fetchRealWeather(city) ?? estimate(city)`), and the weather chip is tagged
`EST` instead of `LIVE` so the difference is honest and visible.

---

## How the recommendations work

The engine (`src/lib/recommendations.ts`) scores every activity in the chosen
city with simple, transparent, additive rules across **six** signals:

- **Weather fit** — indoor/outdoor boost or penalty for the live condition, plus
  each activity's own `goodIn` conditions and a wind penalty.
- **Mood fit** — the selected vibe boosts matching activities; some moods lean
  harder (e.g. "something free" demotes anything that costs money).
- **Cost** — gentle preference for better value, stronger under budget vibes.
- **Popularity** — a derived 35–98 score nudges well-loved places up.
- **Base score** so strong all-rounders still surface with no vibe set.
- **A seeded jitter** so "Try another mix" reshuffles deterministically.

Then a **diversity pass** guarantees variety: it first takes the best activity
from each *distinct* category, then tops up with the next-best — so a result set
looks like *café · museum · walk · market · hidden gem*, never three cafés.

The **plan generator** (`src/lib/planner.ts`) reuses the same scorer against an
ordered category template (adjusted for vibe and weather), picking the best
unused activity for each slot and summing the totals.

---

## The activity data model

Activities are authored lean and **enriched at load time**, so you can add
hundreds or thousands more by editing data only — never code.

- **`src/data/activities.ts`** holds `RAW_ACTIVITIES: RawActivity[]` — just the
  core, hand-authored fields per place (id, name, city, description,
  fine-grained category, mood tags, cost band, indoor/outdoor, `goodIn`
  weather suitability, plus optional overrides for website/image/popularity).
- **`src/data/index.ts`** is the enrichment loader. For each raw activity it
  derives the full `Activity`: a **broad category** (the 15 brief categories),
  a **Google Maps** search URL, a **website** (a curated official URL where we're
  confident, otherwise a working Google-search link — never a broken/fake URL),
  a **popularity** score, a **duration** in minutes, and a **cost in £**. It
  exports the ready-to-use `ACTIVITIES` array and an `ACTIVITY_BY_ID` lookup.

### Add an activity

Append one object to `RAW_ACTIVITIES`:

```ts
{
  id: "lee-newplace",
  name: "Some New Place",
  city: "Leeds",
  description: "One or two friendly sentences.",
  category: "Café",            // a RawCategory
  moods: ["relaxed", "social"],
  cost: "£",                    // Free | £ | ££ | £££
  setting: "indoor",           // indoor | outdoor
  goodIn: ["rainy", "cold", "cloudy"],
  // optional overrides:
  // website: "https://...",   // real official site
  // imageUrl: "https://...",  // real photo (otherwise a generated cover is used)
  // popularity: 90,
}
```

Everything else — Maps link, broad category, duration, cost in £, popularity,
the card image — is filled in automatically.

### Hiding closed venues

When a place permanently closes (e.g. it's flagged **closed** on Google Maps),
add `closed: true` to its object:

```ts
{ id: "bir-hockley", name: "Hockley Social Club", /* … */ closed: true },
```

`src/data/index.ts` filters these out *before* enrichment, so a closed venue
instantly disappears from recommendations, plans **and** the saved list — and if
someone had already saved it, it's quietly dropped (the saved count updates too).
There's one source of truth, so no component has to re-check.

> Want this fully automatic? Query the Google Places **Place Details** API for
> each venue's `business_status` and treat anything other than `OPERATIONAL` as
> closed. That needs an API key and a tiny server-side proxy (the Places API
> isn't CORS-enabled for the browser), which is why the keyless MVP marks
> closures in data instead. The filter point is already in place — you'd just
> feed it from the API rather than the `closed` flag.

### Opening hours ("open right now")

The app is **time-aware**. It works out whether each venue is open at the
current **UK** time (`src/lib/hours.ts`, DST-aware via `Europe/London`) from a
typical daily window per category — museums ~10:00–17:00, markets ~9:00–17:00,
live-music/comedy in the evening, parks/walks/seaside always accessible, etc.

- Open venues are ranked first, so at 22:25 you get the gig that's on till 23:30,
  not the gallery that shut at 17:00.
- Closed venues only appear if too few are open (e.g. late at night), and the
  card badges them clearly — **"Closed · opens 10:00"** instead of a misleading
  "open now" — while open ones show **"Open · till 17:00"**.
- The plan generator avoids shut stops the same way.

Hours are approximate; the **Maps** button always links to the authoritative
times. To correct any venue, add an `hours` override (minutes from midnight, or
`"always"`):

```ts
{ id: "man-botw", name: "Band on the Wall", /* … */
  hours: { open: 19 * 60, close: 23 * 60 + 30 } }, // 19:00–23:30
```

For the fully-automatic version, the same Places **Place Details** call that
gives `business_status` also returns `opening_hours` — feed it into `openState`
in place of the category defaults.

### Real images & websites

Cards use an on-brand **generated SVG cover** per category by default (so nothing
ever 404s). Supply a real `imageUrl` on any activity and it's used instead.
Likewise, set `website` to override the derived link with an official URL.

---

## Project structure

```
src/
  App.tsx                  # top-level state, tabs, data flow
  main.tsx                 # entry point
  index.css                # Tailwind + weather-reactive "sky" + skeleton shimmer
  types/
    index.ts               # all shared domain types + CITY_COORDS
  data/
    activities.ts          # RAW_ACTIVITIES — lean authored data (80 venues)
    index.ts               # enrichment loader → ACTIVITIES, ACTIVITY_BY_ID
  lib/
    weather.ts             # live Open-Meteo fetch + estimate fallback
    recommendations.ts     # six-signal scorer + diversity pass
    planner.ts             # "Build My Plan" itinerary generator
  hooks/
    useSavedActivities.ts  # localStorage saved list + cross-tab sync
  components/
    Header.tsx             # logo + Discover/Plan/Saved tab nav (+ saved count)
    Hero.tsx               # headline + city/vibe controls + CTAs + sky
    CitySelect.tsx         # searchable city combobox
    MoodChips.tsx          # vibe filter chips
    WeatherDisplay.tsx     # weather chip (+ wind, LIVE/EST badge)
    CategoryCover.tsx      # generated SVG card image per category
    ActivityCard.tsx       # the polished card (image, badges, actions)
    RecommendationResults.tsx
    PlanView.tsx           # plan tab
    SavedView.tsx          # saved tab
    Skeletons.tsx          # skeleton loaders
    EmptyState.tsx
    HowItWorks.tsx
    Footer.tsx
```

---

## Stack

React 18 · TypeScript (strict) · Vite 5 · Tailwind CSS 3. No backend — all data
is local and the only network call is the keyless Open-Meteo weather fetch.

Fonts: Bricolage Grotesque (display), Hanken Grotesk (body), Space Mono (the
departures-board detail rows), loaded from Google Fonts.
