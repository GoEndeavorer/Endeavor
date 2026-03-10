export function About() {
  return (
    <section id="about" className="border-t border-medium-gray/30 bg-accent/50 py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-green">
          {"// about"}
        </h2>
        <p className="mb-6 text-2xl font-bold md:text-3xl">
          The gap between ideas and action.
        </p>
        <p className="mb-6 text-base leading-relaxed text-light-gray">
          Meetup helps you find people. Kickstarter helps you find money. Trello
          helps you plan. But none of them do all three — and none of them help
          you find strangers who share your weird niche interest and want to
          actually build something together.
        </p>
        <p className="text-base leading-relaxed text-light-gray">
          Endeavor sits in that gap. Post your project, find your crew, plan it
          out, and fund it if you need to. Whether it&apos;s a road trip, a
          documentary, a conservation dive, or a community art installation —
          if you can dream it, you can endeavor it.
        </p>
      </div>
    </section>
  );
}
