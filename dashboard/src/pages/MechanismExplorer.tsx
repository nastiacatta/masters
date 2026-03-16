import { useState, useCallback } from 'react';
import type { MechanismConfig, SimParams, SimResult } from '@/lib/mechanismExplorer/types';
import { runSimulation } from '@/lib/mechanismExplorer/simulation';
import { BLOCK_DEFS, PARAM_DEFS } from '@/lib/mechanismExplorer/blockDefs';
import PageHeader from '@/components/dashboard/PageHeader';
import MechanismBuilderTab from '@/components/mechanismExplorer/MechanismBuilderTab';
import RoundInspectorTab from '@/components/mechanismExplorer/RoundInspectorTab';
import OutcomeStudioTab from '@/components/mechanismExplorer/OutcomeStudioTab';

function initialConfig(): MechanismConfig {
  const c = {} as MechanismConfig;
  for (const def of BLOCK_DEFS) {
    (c as unknown as Record<string, string>)[def.id] = def.default;
  }
  return c;
}

function initialParams(): SimParams {
  const p = {} as SimParams;
  for (const def of PARAM_DEFS) {
    (p as unknown as Record<string, number>)[def.id] = def.val;
  }
  return p;
}

type TabId = 'builder' | 'inspector' | 'outcome';

const TABS: { id: TabId; label: string }[] = [
  { id: 'builder', label: 'Mechanism builder' },
  { id: 'inspector', label: 'Round inspector' },
  { id: 'outcome', label: 'Outcome studio' },
];

export default function MechanismExplorer() {
  const [activeTab, setActiveTab] = useState<TabId>('builder');
  const [config, setConfig] = useState<MechanismConfig>(initialConfig);
  const [params, setParams] = useState<SimParams>(initialParams);
  const [simData, setSimData] = useState<SimResult | null>(null);
  const [runMessage, setRunMessage] = useState<string | null>(
    'Configure blocks above, then run.'
  );
  const [currentRound, setCurrentRound] = useState(0);
  const [ribbonStep, setRibbonStep] = useState(0);
  const [selectedForecaster, setSelectedForecaster] = useState<number | null>(
    null
  );

  const handleRun = useCallback(() => {
    const result = runSimulation(config, params);
    setSimData(result);
    setCurrentRound(0);
    setRibbonStep(0);
    setSelectedForecaster(null);
    setRunMessage(
      `✓ Simulation complete — ${result.T} rounds, ${result.N} forecasters.`
    );
  }, [config, params]);

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Mechanism explorer"
        description="Interactive mechanism design: swap blocks, run a simulation, then step through rounds and inspect pre-event forecast and post-event settlement."
        question="How does one round move from forecast → influence → payout?"
      />

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`
              px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${
                activeTab === id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'builder' && (
        <MechanismBuilderTab
          config={config}
          setConfig={setConfig}
          params={params}
          setParams={setParams}
          onRun={handleRun}
          runMessage={runMessage}
        />
      )}
      {activeTab === 'inspector' && (
        <RoundInspectorTab
          simData={simData}
          currentRound={currentRound}
          setCurrentRound={setCurrentRound}
          ribbonStep={ribbonStep}
          setRibbonStep={setRibbonStep}
          selectedForecaster={selectedForecaster}
          setSelectedForecaster={setSelectedForecaster}
        />
      )}
      {activeTab === 'outcome' && (
        <OutcomeStudioTab
          simData={simData}
          currentRound={currentRound}
          onRoundChange={setCurrentRound}
        />
      )}
    </div>
  );
}
