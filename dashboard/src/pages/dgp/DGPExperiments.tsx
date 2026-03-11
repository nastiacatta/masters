import PageHeader from '@/components/dashboard/PageHeader';
import ExperimentTopBar from '@/components/dashboard/ExperimentTopBar';
import Validation from '@/pages/validation/Validation';

export default function DGPExperiments() {
  return (
    <div className="space-y-4 p-6">
      <PageHeader
        title="DGP experiments"
        description="Experiments that vary or validate the data generating process."
      />
      <ExperimentTopBar />
      <Validation />
    </div>
  );
}
