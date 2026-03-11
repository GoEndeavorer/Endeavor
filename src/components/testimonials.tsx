const testimonials = [
  {
    quote:
      "I posted a documentary idea on a whim. Within a week, a cinematographer and a sound engineer joined. We just wrapped filming.",
    name: "Maya R.",
    role: "Documentary filmmaker",
  },
  {
    quote:
      "We used Endeavor to organize a neighborhood cleanup that turned into a recurring monthly event. 40 people showed up to the first one.",
    name: "James T.",
    role: "Community organizer",
  },
  {
    quote:
      "I had the technical skills but no co-founder. Found my business partner here — we launched our app three months later.",
    name: "Priya S.",
    role: "Startup founder",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-medium-gray/30 bg-accent/50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// testimonials"}
        </h2>
        <p className="mb-10 text-center text-2xl font-bold md:text-3xl">
          What people are saying.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="border border-medium-gray/20 p-6"
            >
              <p className="mb-6 text-sm leading-relaxed text-light-gray italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-medium-gray/20 pt-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-medium-gray">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
