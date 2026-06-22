import { CITIES } from "../types";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-12">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-lg font-bold text-ink">RightNow</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              The friendly way to answer "I'm bored, what should I do?" —
              built for the UK and its very British weather.
            </p>
          </div>

          <div>
            <p className="data-label mb-3 text-ink-soft">Cities we cover</p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-ink-soft">
              {CITIES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-xs text-ink-soft">
          MVP demo · sample data · mock weather. No accounts, no ads, no
          tracking — just ideas.
        </p>
      </div>
    </footer>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#15243A" />
      <path
        d="M16 6c-4.4 0-8 3.5-8 7.9 0 5.5 7 11.4 7.3 11.6.4.3.9.3 1.3 0 .3-.2 7.4-6.1 7.4-11.6C24 9.5 20.4 6 16 6Z"
        fill="#1B7A4B"
      />
      <circle cx="16" cy="13.6" r="2.9" fill="#F2B33D" />
    </svg>
  );
}
