import SlideWrapper from './SlideWrapper';

const findings = [
  {
    icon: '✓',
    color: 'bg-emerald-500',
    title: 'Skill-weighted aggregation improves accuracy',
    description:
      'Skill-weighted aggregation improves accuracy over equal weighting on real data.',
  },
  {
    icon: '↘',
    color: 'bg-teal-500',
    title: 'Mechanism improves over equal weighting',
    description:
      'The mechanism (skill + stake) improves mean CRPS versus equal weighting on both Elia wind and electricity.',
  },
  {
    icon: '⚖',
    color: 'bg-amber-500',
    title: 'Best single can still win',
    description:
      'Even when the mechanism improves the aggregate, the best single forecaster can still outperform it on some datasets, so the claim is conditional rather than dominance.',
  },
];

export default function KeyFindingsSlide() {
  return (
    <SlideWrapper>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Takeaways</h2>
      <h3 className="text-2xl font-bold text-slate-900">Key Findings</h3>
      <p className="mt-2 text-sm text-slate-500 leading-relaxed">
        Summary of the main takeaways from the real-world evaluation.
      </p>

      <div className="mt-8 space-y-3">
        {findings.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-slate-200 bg-white p-5 flex gap-4 items-start"
          >
            <div className={`w-7 h-7 rounded-full ${f.color} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
              {f.icon}
            </div>
            <div>
              <div className="text-[15px] font-semibold text-slate-800">{f.title}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">{f.description}</div>
            </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}
