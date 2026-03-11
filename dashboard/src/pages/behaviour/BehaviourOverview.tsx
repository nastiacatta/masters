import PageHeader from '@/components/dashboard/PageHeader';
import SectionLabel from '@/components/dashboard/SectionLabel';
import ChartCard from '@/components/dashboard/ChartCard';
import MathBlock from '@/components/dashboard/MathBlock';

const LAYERS = [
  {
    title: 'Layer 1: Stable latent traits',
    subtitle: 'Hidden state (per real user)',
    items: ['Wealth', 'Risk aversion', 'Signal quality', 'Bias', 'Participation propensity', 'Manipulation parameters'],
  },
  {
    title: 'Layer 2: Per-round policy outputs',
    subtitle: 'User choice (what the behaviour module emits each round)',
    items: ['Participation', 'Report', 'Stake', 'Identity action'],
  },
  {
    title: 'Layer 3: Behaviour families',
    subtitle: 'Taxonomy of behaviour types',
    items: [
      'Participation and timing',
      'Information and belief formation',
      'Reporting strategy',
      'Staking and bankroll behaviour',
      'Objectives and preferences',
      'Identity and account management',
      'Learning and meta-strategy',
      'Adversarial and manipulative behaviours',
      'Operational frictions and data artefacts',
    ],
  },
  {
    title: 'Layer 4: Behaviour-to-core interface',
    subtitle: 'Observed output',
    items: [<>Real user traits → policy → (<MathBlock inline latex="a_{i,t}, r_{i,t}, b_{i,t}" />, identity actions)</>],
  },
];

export default function BehaviourOverview() {
  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="User behaviour"
        description="The behaviour block is broad and structured. It does not explain one equation—it shows the full behavioural space. Each user is treated as a policy that outputs actions; the mechanism consumes those actions."
      />

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <p className="text-xs text-slate-700">
          <strong>Separation:</strong> Core mechanism = deterministic state machine. User behaviour = policy that outputs (participation, report, stake, identity). The mechanism never sees beliefs or strategies—only these actions.
        </p>
      </div>

      <div className="space-y-6">
        {LAYERS.map((layer) => (
          <ChartCard
            key={layer.title}
            title={layer.title}
            subtitle={layer.subtitle}
          >
            <ul className="space-y-1.5 text-xs text-slate-600">
              {layer.items.map((item, idx) => (
                <li key={`${layer.title}-${idx}`} className="flex items-center gap-2">
                  <span className="text-slate-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </ChartCard>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Interface</span>
        <SectionLabel type="hidden_state" />
        <span className="text-slate-400">→</span>
        <span className="text-xs text-slate-600">policy</span>
        <span className="text-slate-400">→</span>
        <SectionLabel type="user_choice" />
        <span className="text-slate-500 text-xs">(<MathBlock inline latex="a_{i,t}, r_{i,t}, b_{i,t}" />, identity)</span>
      </div>
    </div>
  );
}
