import { Link } from 'react-router-dom';
import { useExplorer } from '@/lib/explorerStore';
import PageHeader from '@/components/dashboard/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';

export default function Overview() {
  const { lastPipelineResult } = useExplorer();
  const summary = lastPipelineResult?.summary;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader
        title="Overview"
        description="Can combining stake with an online, time-varying skill layer improve aggregate forecasts under non-stationarity, strategic behaviour, and intermittent participation? Use the Walkthrough to see one round step by step: Inputs → DGP / private signal → Behaviour policy → Core mechanism → Results → Next state."
        question="Why adaptive skill and stake?"
      />
      <p className="text-sm text-slate-600">
        Start with the <Link to="/walkthrough" className="text-teal-600 hover:underline font-medium">Walkthrough</Link> to explore the mechanism; use <Link to="/experiments" className="text-teal-600 hover:underline font-medium">Experiments</Link> for cross-scenario evidence and <Link to="/validation" className="text-teal-600 hover:underline font-medium">Validation</Link> for invariants and robustness.
      </p>
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Mean error" value={summary.meanError.toFixed(4)} />
          <MetricCard label="Participation" value={summary.meanParticipation.toFixed(2)} />
          <MetricCard label="N_eff" value={summary.meanNEff.toFixed(2)} />
          <MetricCard label="Final Gini" value={summary.finalGini.toFixed(3)} />
        </div>
      )}
      {!summary && (
        <p className="text-sm text-slate-500">
          Run the pipeline from the Walkthrough page to see results here.
        </p>
      )}
    </div>
  );
}
