import PageHeader from '@/components/dashboard/PageHeader';
import SectionLabel from '@/components/dashboard/SectionLabel';
import MathBlock from '@/components/dashboard/MathBlock';

const CHECKS = [
  { title: 'Budget balance', desc: 'Total payouts equal total effective wagers in the skill pool.' },
  { title: 'Zero-sum profit', desc: <><MathBlock inline latex="\\sum_i \\pi_i = 0" /> (skill component).</> },
  { title: 'Bounds on m/b', desc: <><MathBlock inline latex="m_i / b_i \\in [\\lambda, 1]" />; refund <MathBlock inline latex="= b_i - m_i \\geq 0" />.</> },
  { title: 'Missing agents excluded', desc: <><MathBlock inline latex="\\alpha_i = 1 \\Rightarrow m_i = 0" />, no report, no payoff.</> },
  { title: 'Timing of σ', desc: <><MathBlock inline latex="\\sigma_{i,t}" /> is fixed before reports in round <MathBlock inline latex="t" /> (no double-counting).</> },
];

export default function Invariants() {
  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Invariants and safety checks"
        description="Concrete guarantees that make the skill × stake design disciplined rather than ad hoc."
      />

      <div className="flex items-center gap-2 mb-4">
        <SectionLabel type="mechanism_computation" />
        <span className="text-xs text-slate-500">All of the following hold by construction.</span>
      </div>

      <ul className="space-y-3">
        {CHECKS.map(({ title, desc }) => (
          <li key={title} className="flex gap-3 p-3 rounded-lg bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 shrink-0 w-36">{title}</span>
            <span className="text-xs text-slate-600">{desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
