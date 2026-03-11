import { Link } from 'react-router-dom';
import PageHeader from '@/components/dashboard/PageHeader';

const SECTIONS = [
  { to: '/appendix/dgp', title: 'DGP', description: 'Data generating processes: baseline, latent-fixed, aggregation methods.' },
  { to: '/appendix/behaviours', title: 'Behaviours', description: 'Behaviour scenarios: honest baseline, bursty participation, hedged reporting, Sybil, collusion, drift.' },
  { to: '/appendix/core', title: 'Core (detail)', description: 'Effective wager, aggregation, settlement, skill update, invariants.' },
];

export default function Appendix() {
  return (
    <div className="p-6 max-w-3xl space-y-6">
      <PageHeader
        title="Appendix"
        subtitle="Reference material: DGP, behaviour scenarios, and mechanism detail."
      />
      <ul className="space-y-4">
        {SECTIONS.map(({ to, title, description }) => (
          <li key={to}>
            <Link
              to={to}
              className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
