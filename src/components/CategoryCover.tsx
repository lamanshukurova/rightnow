import type { Category } from "../types";

// ---------------------------------------------------------------------------
// CATEGORY COVER
//
// A generated, on-brand cover for each card. It renders instantly, never 404s
// and needs no external image host — yet the data model still supports a real
// `imageUrl` (used in preference when present), so a future content team can
// drop in photographs for thousands of activities with zero code changes.
// ---------------------------------------------------------------------------

interface Style {
  from: string;
  to: string;
  accent: string;
  glyph: GlyphName;
}

type GlyphName =
  | "museum"
  | "coffee"
  | "plate"
  | "tree"
  | "walk"
  | "market"
  | "mic"
  | "music"
  | "ball"
  | "star"
  | "gem"
  | "heart"
  | "cap"
  | "tag";

const STYLES: Record<Category, Style> = {
  Museums: { from: "#E4EEF6", to: "#C7DBEB", accent: "#2F5C82", glyph: "museum" },
  Cafés: { from: "#FBEFD2", to: "#F4DCA6", accent: "#B97E12", glyph: "coffee" },
  Restaurants: { from: "#FBE7D7", to: "#F3CBA8", accent: "#B5651D", glyph: "plate" },
  Parks: { from: "#E7F1EB", to: "#C4E2CE", accent: "#1B7A4B", glyph: "tree" },
  Walks: { from: "#E7F1EB", to: "#CBE6D4", accent: "#124F32", glyph: "walk" },
  Markets: { from: "#FBEFD2", to: "#EBD9A8", accent: "#9A6A14", glyph: "market" },
  Comedy: { from: "#ECEAF4", to: "#D6D2EC", accent: "#5E5A8C", glyph: "mic" },
  "Live Music": { from: "#ECEAF4", to: "#D2CEEA", accent: "#4B4880", glyph: "music" },
  Sports: { from: "#E4EEF6", to: "#CBDDEC", accent: "#2F5C82", glyph: "ball" },
  Attractions: { from: "#FBEFD2", to: "#E9DBB6", accent: "#B97E12", glyph: "star" },
  "Hidden Gems": { from: "#ECEAF4", to: "#DAD6EE", accent: "#5E5A8C", glyph: "gem" },
  "Date Ideas": { from: "#FBE3E6", to: "#F3C4CC", accent: "#B14256", glyph: "heart" },
  "Student Activities": { from: "#E7F1EB", to: "#CBE6D4", accent: "#1B7A4B", glyph: "cap" },
  "Free Activities": { from: "#E7F1EB", to: "#C4E2CE", accent: "#1B7A4B", glyph: "tag" },
  "Rainy Day Activities": { from: "#E4EEF6", to: "#C7DBEB", accent: "#2F5C82", glyph: "museum" },
};

function Glyph({ name, color }: { name: GlyphName; color: string }) {
  const p = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "museum":
      return (<g {...p}><path d="M4 10 16 4l12 6" /><path d="M6 10v12M12 10v12M20 10v12M26 10v12" /><path d="M3 22h26M5 26h22" /></g>);
    case "coffee":
      return (<g {...p}><path d="M7 12h15v6a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6v-6Z" /><path d="M22 13h3a3 3 0 0 1 0 6h-3" /><path d="M11 6c0 1.5-1 1.5-1 3M16 6c0 1.5-1 1.5-1 3" /></g>);
    case "plate":
      return (<g {...p}><circle cx="16" cy="16" r="9" /><circle cx="16" cy="16" r="4" /></g>);
    case "tree":
      return (<g {...p}><path d="M16 6c4 0 7 3 7 6.5 0 2-1 3.5-2.5 4.5 1.5.5 2.5 2 2.5 3.5C23 24 20 26 16 26s-7-2-7-5.5c0-1.5 1-3 2.5-3.5C10 16 9 14.5 9 12.5 9 9 12 6 16 6Z" /><path d="M16 26v-8" /></g>);
    case "walk":
      return (<g {...p}><circle cx="16" cy="6" r="2.5" /><path d="M16 9v7l-4 9M16 16l4 4 3 5M11 13l5-1 5 2" /></g>);
    case "market":
      return (<g {...p}><path d="M6 12h20l-1.5-5h-17L6 12Z" /><path d="M7 12v12h18V12" /><path d="M13 24v-6h6v6" /></g>);
    case "mic":
      return (<g {...p}><rect x="13" y="4" width="6" height="13" rx="3" /><path d="M9 14a7 7 0 0 0 14 0M16 21v5M12 27h8" /></g>);
    case "music":
      return (<g {...p}><path d="M12 22V8l12-3v14" /><circle cx="10" cy="22" r="2.5" /><circle cx="22" cy="19" r="2.5" /></g>);
    case "ball":
      return (<g {...p}><circle cx="16" cy="16" r="10" /><path d="M16 6v20M6 16h20" /></g>);
    case "star":
      return (<g {...p}><path d="M16 5l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2-6.5-3.4-6.5 3.4 1.3-7.2L5.5 12.6l7.3-1L16 5Z" /></g>);
    case "gem":
      return (<g {...p}><path d="M10 6h12l5 6-11 14L5 12l5-6Z" /><path d="M5 12h22M16 6l-3 6 3 14 3-14-3-6Z" /></g>);
    case "heart":
      return (<g {...p}><path d="M16 25S6 19 6 12.5A5 5 0 0 1 16 10a5 5 0 0 1 10 2.5C26 19 16 25 16 25Z" /></g>);
    case "cap":
      return (<g {...p}><path d="M16 7 3 12l13 5 13-5-13-5Z" /><path d="M9 14v6c0 2 3.5 3.5 7 3.5s7-1.5 7-3.5v-6M27 12v6" /></g>);
    case "tag":
      return (<g {...p}><path d="M5 14V6h8l13 13-8 8L5 14Z" /><circle cx="10" cy="11" r="1.6" fill={color} stroke="none" /></g>);
  }
}

export default function CategoryCover({
  category,
  imageUrl,
  className = "",
}: {
  category: Category;
  imageUrl?: string;
  className?: string;
}) {
  // Prefer a real photo when the data provides one.
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const s = STYLES[category];
  const gid = `cov-${category.replace(/\W/g, "")}`;
  return (
    <svg
      viewBox="0 0 320 160"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={s.from} />
          <stop offset="100%" stopColor={s.to} />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill={`url(#${gid})`} />
      {/* faint repeating motif for texture */}
      <g opacity="0.10">
        <circle cx="265" cy="40" r="60" fill={s.accent} />
        <circle cx="40" cy="150" r="46" fill={s.accent} />
      </g>
      {/* the category glyph, centred-left */}
      <g transform="translate(26, 56) scale(1.5)" opacity="0.9">
        <Glyph name={s.glyph} color={s.accent} />
      </g>
      <text
        x="78"
        y="92"
        fontFamily="'Space Mono', monospace"
        fontSize="12"
        letterSpacing="1.5"
        fill={s.accent}
        opacity="0.9"
      >
        {category.toUpperCase()}
      </text>
    </svg>
  );
}
