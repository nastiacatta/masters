import { Link } from 'react-router-dom';
import PageShell from '@/components/dashboard/PageShell';
import PageHeader from '@/components/dashboard/PageHeader';

const SECTIONS = [
  { to: '/appendix/dgp', title: 'DGP', description: 'Data generating processes: baseline, latent-fixed, aggregation methods.' },
  { to: '/appendix/behaviours', title: 'Behaviours', description: 'Behaviour scenarios: honest baseline, bursty participation, hedged reporting, Sybil, collusion, drift.' },
  { to: '/appendix/core', title: 'Core (detail)', description: 'Effective wager, aggregation, settlement, skill update, invariants.' },
];

export default function Appendix() {
  return (
    <PageShell width="narrow">
      <PageHeader
        hero
        title="Appendix"
        subtitle="Reference material: DGP, behaviour scenarios, and mechanism detail."
      />
      <ul className="space-y-4">
        {SECTIONS.map(({ to, title, description }) => (
          <li key={to}>
            <Link
              to={to}
              className="block panel-card transition-colors hover:shadow-sm"
            >
              <h2
                className="font-serif"
                style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--ink-soft)',
                  marginTop: 6,
                }}
              >
                {description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
