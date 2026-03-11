import { useExplorer } from '@/lib/explorerStore';
import ThesisIntro from '@/components/thesis/ThesisIntro';
import PipelineDiagram from '@/components/thesis/PipelineDiagram';
import MetricStrip from '@/components/thesis/MetricStrip';

export default function Overview() {
  const { lastPipelineResult } = useExplorer();
  const summary = lastPipelineResult?.summary;

  return (
    <div className="p-6 max-w-4xl space-y-10">
      <ThesisIntro />

      <PipelineDiagram />

      <MetricStrip
        meanError={summary?.meanError}
        participation={summary?.meanParticipation}
        gini={summary?.finalGini}
        nEff={summary?.meanNEff}
      />
    </div>
  );
}
