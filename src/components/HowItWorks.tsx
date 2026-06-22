const STEPS = [
  {
    n: "01",
    title: "Tell us where you are",
    body: "Pick one of ten UK cities. That's it — no sign-up, no app, no faff.",
  },
  {
    n: "02",
    title: "We check the weather",
    body: "Raining? You'll get cosy indoor picks. Sun's out? We'll push you outside while it lasts.",
  },
  {
    n: "03",
    title: "Get a few good ideas",
    body: "A short, honest shortlist with why each one's a good shout right now. Not in the mood? Shuffle for more.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-line bg-card/40 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5">
        <p className="data-label text-green">How it works</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold leading-tight text-ink sm:text-4xl">
          From bored to sorted in under 30 seconds.
        </h2>

        {/* Numbered because this genuinely is a three-step sequence. */}
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="rounded-xl2 border border-line bg-card p-6"
            >
              <span className="font-mono text-sm font-bold text-green">
                {step.n}
              </span>
              <h3 className="mt-3 text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
