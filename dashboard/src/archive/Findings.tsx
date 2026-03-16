import { Link } from 'react-router-dom';
import PageHeader from '@/components/dashboard/PageHeader';

export default function Findings() {
  return (
    <div className="p-6 max-w-3xl space-y-6">
      <PageHeader
        title="Findings"
        subtitle="Main results, round-by-round behaviour, strategic effects, and robustness checks."
      />
      <p className="text-sm text-slate-600">
        All experiment results and diagnostics live under <strong>Experiments</strong>. Choose an experiment in the top bar to see the main result, what happens in one round, what changes under strategic behaviour, and robustness checks.
      </p>
      <Link
        to="/experiments"
        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Open Experiments →
      </Link>
    </div>
  );
}
