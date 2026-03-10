const steps = [
  {
    number: "01",
    title: "Post an Endeavor",
    description:
      "Got an idea? A hiking trip, a documentary, a community project? Post it. Describe what you want to do, where, and what you need.",
  },
  {
    number: "02",
    title: "People Join",
    description:
      "Others discover your endeavor and join up — bringing skills, energy, and resources. A filmmaker, a guide, a friend you haven't met yet.",
  },
  {
    number: "03",
    title: "Plan Together",
    description:
      "Collaborate with your crew. Shared tasks, timelines, and discussions — everything you need to go from idea to plan.",
  },
  {
    number: "04",
    title: "Fund It (Optional)",
    description:
      "Need money to make it happen? Toggle on crowdfunding and let backers support the project. Or set a cost-to-join so participants share the expense.",
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
            <div key={step.number} className="group border border-medium-gray/30 p-6 transition-colors hover:border-code-green/50">
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
