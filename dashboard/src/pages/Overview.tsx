import { useStore } from '@/lib/store';
import { useExperimentData } from '@/lib/useExperimentData';
import { fmtNum } from '@/lib/formatters';
import PageHeader from '@/components/dashboard/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';
import ExperimentContext from '@/components/dashboard/ExperimentContext';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/DataStates';
import ForecastQualityChart from '@/components/charts/ForecastQualityChart';
import SkillTrajectoryChart from '@/components/charts/SkillTrajectoryChart';
import BehaviourComparisonChart from '@/components/charts/BehaviourComparisonChart';

export default function Overview() {
  const { selectedExperiment } = useStore();
  const { summary, forecastSeries, skillWagerData, behaviourScenarios, loading, error } = useExperimentData();

  if (!selectedExperiment) {
    return (
      <div className="p-6 max-w-7xl">
        <PageHeader title="Overview" description="Snapshot of the selected experiment." />
        <EmptyState message="Select an experiment from the sidebar." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl">
        <PageHeader title="Overview" description="Snapshot of the selected experiment." />
        <LoadingState message="Loading experiment data…" />
      </div>
    );
  }

  const hasData = summary != null || forecastSeries.length > 0 || skillWagerData.length > 0;
  if (!hasData) {
    return (
      <div className="p-6 max-w-7xl">
        <PageHeader title="Overview" description="Snapshot of the selected experiment." />
        <ExperimentContext experiment={selectedExperiment} className="mb-4" />
        <EmptyState message="No overview data available for this experiment." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Overview"
        description="Snapshot of the selected experiment — what it tests, how the aggregate forecast performs, and whether market concentration is controlled."
      />
      {error && <ErrorState message="Some data failed to load; showing available data." error={error} />}
      <ExperimentContext experiment={selectedExperiment} className="mb-4" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <MetricCard label="Experiment" value={selectedExperiment.displayName} subtitle={selectedExperiment.block} />
        <MetricCard label="DGP" value={selectedExperiment.dgp ?? '—'} />
        <MetricCard label="Agents" value={String(selectedExperiment.nAgents ?? '—')} />
        <MetricCard label="Rounds" value={String(selectedExperiment.rounds ?? '—')} />
        <MetricCard label="Final CRPS" value={fmtNum(summary?.finalCRPS)} accent />
        <MetricCard label="Final Gini" value={fmtNum(summary?.finalGini, 3)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <MetricCard label="N_eff" value={fmtNum(summary?.finalNEff, 2)} subtitle="Effective forecasters" />
        <MetricCard label="Mean HHI" value={fmtNum(summary?.meanHHI, 4)} subtitle="Market concentration" />
        <MetricCard label="Mean N_t" value={fmtNum(summary?.meanNt, 1)} subtitle="Avg active per round" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Run Description</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{selectedExperiment.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs text-slate-500">
          <div>
            <span className="font-medium text-slate-700">What is being tested:</span>{' '}
            The effect of {selectedExperiment.displayName.toLowerCase()} on aggregate forecast quality and market concentration.
          </div>
          <div>
            <span className="font-medium text-slate-700">Why it matters:</span>{' '}
            Validates that the mechanism {summary?.finalCRPS && summary.finalCRPS < 0.04 ? 'improves' : 'maintains'} forecast quality under this configuration.
          </div>
          <div>
            <span className="font-medium text-slate-700">Key result:</span>{' '}
            Final Gini = {fmtNum(summary?.finalGini, 3)}, N_eff = {fmtNum(summary?.finalNEff, 1)} — {summary?.finalGini && summary.finalGini < 0.4 ? 'concentration remains controlled' : 'some concentration observed'}.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ForecastQualityChart data={forecastSeries} />
        <SkillTrajectoryChart data={skillWagerData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkillTrajectoryChart
          data={skillWagerData}
          title="Cumulative Profit"
          yKey="cumProfit"
          yLabel="Cumulative profit"
        />
        <BehaviourComparisonChart data={behaviourScenarios} />
      </div>
    </div>
  );
}
