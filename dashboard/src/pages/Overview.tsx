import { useExplorer } from '@/lib/explorerStore';
import PageHeader from '@/components/dashboard/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';

export default function Overview() {
  const { lastPipelineResult } = useExplorer();
  const summary = lastPipelineResult?.summary;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader
        title="Main result"
        description="Pipeline summary for the selected experiment."
      />
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
