import { useExplorer } from '@/lib/explorerStore';
import ExplorerStepper from '@/components/thesis/ExplorerStepper';
import StageDetailPanel from '@/components/thesis/StageDetailPanel';
import { EXPLORER_STAGE_LABELS } from '@/lib/thesis';
import InputsPanel from '@/components/explorer/InputsPanel';
import DGPPanel from '@/components/explorer/DGPPanel';
import CorePanel from '@/components/explorer/CorePanel';
import BehaviourPanel from '@/components/explorer/BehaviourPanel';
import ResultsPanel from '@/components/explorer/ResultsPanel';

export default function MechanismExplorer() {
  const { selectedStage, setSelectedStage } = useExplorer();

  const renderPanel = () => {
    switch (selectedStage) {
      case 'inputs':
        return <InputsPanel />;
      case 'dgp':
        return <DGPPanel />;
      case 'core':
        return <CorePanel />;
      case 'behaviour':
        return <BehaviourPanel />;
      case 'results':
        return <ResultsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ExplorerStepper currentStage={selectedStage} onSelectStage={setSelectedStage} />

      <div className="flex-1 overflow-y-auto p-6">
        <StageDetailPanel title={EXPLORER_STAGE_LABELS[selectedStage]}>
          {renderPanel()}
        </StageDetailPanel>
      </div>
    </div>
  );
}
