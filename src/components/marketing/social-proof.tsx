const TESTIMONIALS = [
  {
    name: "Marcus T.",
    business: "MT Strength Coaching",
    quote:
      "DawFit helped me manage 40+ clients without spreadsheets. My check-in response time went from days to minutes.",
    initials: "MT",
    accent: "bg-indigo-500",
  },
  {
    name: "Priya R.",
    business: "Priya Fit Online",
    quote:
      "The lead capture page alone paid for itself. I went from zero online clients to a full roster in 8 weeks.",
    initials: "PR",
    accent: "bg-violet-500",
  },
  {
    name: "Jordan K.",
    business: "KineticCoach",
    quote:
      "Building programs used to take me hours per client. Now I draft a full 12-week block in under 20 minutes.",
    initials: "JK",
    accent: "bg-emerald-500",
  },
];

export function SocialProof() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-24">
      {/* Headline */}
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Trusted by coaches building real fitness businesses
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          From solo coaches to growing teams — DawFit scales with your business.
        </p>
      </div>

      {/* Testimonial cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
        {TESTIMONIALS.map(({ name, business, quote, initials, accent }) => (
          <div
            key={name}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex flex-col gap-4"
          >
            {/* Quote */}
            <p className="text-slate-300 text-sm leading-relaxed flex-1">
              &ldquo;{quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
              <div
                className={`h-9 w-9 rounded-full ${accent} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{name}</p>
                <p className="text-slate-500 text-xs">{business}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Logo placeholder bar */}
      <div className="border border-slate-700/40 rounded-xl px-8 py-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-0 justify-between bg-slate-800/20">
        <p className="text-slate-500 text-xs uppercase tracking-widest font-medium flex-shrink-0">
          Featured in
        </p>
        <div className="flex items-center gap-8 flex-wrap justify-center">
          {["FitBusiness Weekly", "CoachGrowth", "OnlinePTHub", "StrengthBiz"].map((name) => (
            <span key={name} className="text-slate-600 text-sm font-semibold tracking-wide">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
