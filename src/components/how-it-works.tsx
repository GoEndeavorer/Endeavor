const steps = [
  {
    number: "01",
    title: "Post",
    description:
      "Describe what you want to do — a hiking trip, a documentary, a community garden, a startup. Share your vision, location, and what you need to make it real.",
  },
  {
    number: "02",
    title: "Find",
    description:
      "People who want to join discover your endeavor. A filmmaker, a guide, a developer, a friend you haven't met yet — the right crew finds you.",
  },
  {
    number: "03",
    title: "Plan",
    description:
      "Organize tasks, milestones, and discussions with your team. Turn a rough idea into a concrete plan with shared timelines and clear ownership.",
  },
  {
    number: "04",
    title: "Launch",
    description:
      "Fund it through crowdfunding or shared costs, build it with your crew, and make it happen. From idea to reality — together.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-medium-gray/30 bg-accent/50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-green">
          {"// how it works"}
        </h2>
        <p className="mb-12 text-2xl font-bold md:text-3xl">
          Four steps. One platform.
        </p>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="group border border-medium-gray/20 p-6 transition-colors hover:border-code-green/50">
              <span className="mb-4 block text-3xl font-bold text-code-green">
                {step.number}
              </span>
              <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-light-gray">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
