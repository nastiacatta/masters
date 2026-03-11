import PageHeader from '@/components/dashboard/PageHeader';
import SectionLabel from '@/components/dashboard/SectionLabel';

const STEPS = [
  { n: 1, label: 'Pre-round state', type: 'hidden_state' as const, detail: 'L_{i,t−1}, σ_{i,t}, W_{i,t} fixed' },
  { n: 2, label: 'User submission', type: 'user_choice' as const, detail: 'a_{i,t}, r_{i,t}, b_{i,t}' },
  { n: 3, label: 'Realised outcome', type: 'observed_output' as const, detail: 'y_t' },
  { n: 4, label: 'Scores & effective wager', type: 'mechanism_computation' as const, detail: 's_{i,t}, m_{i,t} = b_{i,t}·g(σ_{i,t})' },
  { n: 5, label: 'Aggregation', type: 'mechanism_computation' as const, detail: 'm̂_i, r̂_t' },
  { n: 6, label: 'Settlement', type: 'mechanism_computation' as const, detail: 'Π_i, π_i, cashout_i' },
  { n: 7, label: 'Wealth update', type: 'mechanism_computation' as const, detail: 'W_{i,t+1}' },
  { n: 8, label: 'Skill update', type: 'mechanism_computation' as const, detail: 'L_{i,t}, σ_{i,t+1}' },
];

export default function RoundTimeline() {
  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Round timeline"
        description="Order of operations within one round. Timing is explicit: σ_{i,t} is fixed before reports."
      />

      <div className="space-y-2">
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-white"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
              {step.n}
            </span>
            <SectionLabel type={step.type} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800">{step.label}</p>
              <p className="text-xs font-mono text-slate-500 truncate">{step.detail}</p>
            </div>
            {i < STEPS.length - 1 && (
              <span className="text-slate-300 shrink-0 self-center">↓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
