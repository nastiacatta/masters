import PageHeader from '@/components/dashboard/PageHeader';
import ExperimentTopBar from '@/components/dashboard/ExperimentTopBar';
import Validation from '@/pages/validation/Validation';

export default function CoreExperiments() {
  return (
    <div className="space-y-4 p-6">
      <PageHeader
        title="Core experiments"
        description="Experiments that validate the skill × stake mechanism: formulas, settlement, and aggregation."
      />
      <ExperimentTopBar />
      <Validation />
    </div>
  );
}
