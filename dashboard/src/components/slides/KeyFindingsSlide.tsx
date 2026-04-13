import SlideWrapper from './SlideWrapper';

const findings = [
  {
    number: 1,
    title: 'Skill-weighted aggregation improves accuracy',
    description:
      'Skill-weighted aggregation improves accuracy over equal weighting on real data.',
  },
  {
    number: 2,
    title: 'Mechanism achieves lowest CRPS',
    description:
      'The mechanism (skill + stake) achieves the lowest CRPS among aggregation methods.',
  },
  {
    number: 3,
    title: 'Equal weighting remains a strong baseline',
    description:
      'Equal weighting remains a strong baseline, especially on the electricity dataset where improvements are smaller.',
  },
];

export default function KeyFindingsSlide() {
  return (
    <SlideWrapper>
      <h2 className="text-xl font-semibold text-slate-900">Key Findings</h2>
      <p className="mt-2 text-sm text-slate-600">
        Summary of the main takeaways from the real-world evaluation.
      </p>

      <div className="mt-6 space-y-4">
        {findings.map((f) => (
          <div
            key={f.number}
            className="flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {f.number}
            </span>
            <div>
              <h3 className="text-sm font-medium text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}
