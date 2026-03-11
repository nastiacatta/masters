import PageHeader from '@/components/dashboard/PageHeader';
import ExperimentTopBar from '@/components/dashboard/ExperimentTopBar';
import Validation from '@/pages/validation/Validation';

export default function BehavioursExperiments() {
  return (
    <div className="space-y-4 p-6">
      <PageHeader
        title="Behaviour experiments"
        description="Experiments that vary participation, strategic behaviour, and adversarial scenarios."
      />
      <ExperimentTopBar />
      <Validation />
    </div>
  );
}
