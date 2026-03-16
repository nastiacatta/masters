import { useMemo, useState, useEffect } from 'react';
import { useExplorer } from '@/lib/explorerStore';
import {
  DEFAULT_BUILDER_SELECTIONS,
  type BuilderSelections,
  type DepositPolicy,
  type InfluenceRule,
  type AggregationRule,
  type SettlementRule,
} from '@/lib/coreMechanism/runRoundComposable';
import { runPipeline } from '@/lib/coreMechanism/runPipeline';
import { pipelineToSimResult } from '@/lib/mechanismExplorer/composableAdapter';
import { PARAM_DEFS } from '@/lib/mechanismExplorer/blockDefs';
import type { BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';
import PageHeader from '@/components/dashboard/PageHeader';
import MechanismBuilderTab from '@/components/mechanismExplorer/MechanismBuilderTab';
import RoundInspectorTab from '@/components/mechanismExplorer/RoundInspectorTab';
import OutcomeStudioTab from '@/components/mechanismExplorer/OutcomeStudioTab';
import type { MechanismConfig, SimParams } from '@/lib/mechanismExplorer/types';

type TabId = 'builder' | 'inspector' | 'outcome';

const TABS: { id: TabId; label: string }[] = [
  { id: 'builder', label: 'Mechanism builder' },
  { id: 'inspector', label: 'Round inspector' },
  { id: 'outcome', label: 'Outcome studio' },
];

/** Map composable builder + behaviour preset to the 6-block config used by MechanismBuilderTab (HTML-style labels). */
function builderToConfig(
  builder: BuilderSelections,
  behaviourPreset: BehaviourPresetId,
): MechanismConfig {
  const depositLabels: Record<DepositPolicy, MechanismConfig['deposit']> = {
    fixed_unit: 'Fixed unit',
    wealth_fraction: 'Bankroll×conf',
    sigma_scaled: 'Oracle-style',
  };
  const influenceLabels: Record<InfluenceRule, MechanismConfig['influence']> = {
    uniform: 'Equal',
    deposit_only: 'Stake-only',
    skill_only: 'Skill-only',
    skill_stake: 'Blended',
  };
  const aggregationLabels: Record<AggregationRule, MechanismConfig['aggregation']> = {
    linear: 'Linear pool',
    sqrt: 'Equal pool',
    softmax: 'Log pool',
  };
  const settlementLabels: Record<SettlementRule, MechanismConfig['settlement']> = {
    skill_only: 'Skill-only',
    skill_plus_utility: 'Skill+utility',
  };
  const behaviourLabels: Record<BehaviourPresetId, MechanismConfig['behaviour']> = {
    baseline: 'Benign',
    bursty: 'Bursty',
    risk_averse: 'Benign',
    manipulator: 'Arbitrageur',
    sybil: 'Sybil',
    evader: 'Arbitrageur',
    arbitrageur: 'Arbitrageur',
  };
  return {
    skill: 'Fast adapt',
    deposit: depositLabels[builder.depositPolicy],
    influence: influenceLabels[builder.influenceRule],
    aggregation: aggregationLabels[builder.aggregationRule],
    settlement: settlementLabels[builder.settlementRule],
    behaviour: behaviourLabels[behaviourPreset],
  };
}

/** Map config block selection back to composable builder or behaviour preset. */
function configToBuilderAndPreset(
  config: MechanismConfig,
): { builder: Partial<BuilderSelections>; preset?: BehaviourPresetId } {
  const depositFromLabel: Record<string, DepositPolicy> = {
    'Fixed unit': 'fixed_unit',
    'Bankroll×conf': 'wealth_fraction',
    'Oracle-style': 'sigma_scaled',
  };
  const influenceFromLabel: Record<string, InfluenceRule> = {
    Equal: 'uniform',
    'Stake-only': 'deposit_only',
    'Skill-only': 'skill_only',
    Blended: 'skill_stake',
  };
  const aggregationFromLabel: Record<string, AggregationRule> = {
    'Linear pool': 'linear',
    'Equal pool': 'sqrt',
    'Log pool': 'softmax',
  };
  const settlementFromLabel: Record<string, SettlementRule> = {
    'Skill-only': 'skill_only',
    'Skill+utility': 'skill_plus_utility',
  };
  const presetFromLabel: Record<string, BehaviourPresetId> = {
    Benign: 'baseline',
    Bursty: 'bursty',
    Sybil: 'sybil',
    Arbitrageur: 'arbitrageur',
  };
  return {
    builder: {
      depositPolicy: depositFromLabel[config.deposit] ?? 'wealth_fraction',
      influenceRule: influenceFromLabel[config.influence] ?? 'skill_stake',
      aggregationRule: aggregationFromLabel[config.aggregation] ?? 'linear',
      settlementRule: settlementFromLabel[config.settlement] ?? 'skill_only',
    },
    preset: presetFromLabel[config.behaviour],
  };
}

function initialParamsFromDefs(rounds: number, nAgents: number): SimParams {
  const defaults: Record<string, number> = {};
  PARAM_DEFS.forEach((def) => {
    defaults[def.id] = def.val;
  });
  return {
    T: rounds,
    N: nAgents,
    gamma: defaults.gamma ?? 1.5,
    lambda: defaults.lambda ?? 0.3,
    eta: defaults.eta ?? 1.0,
    f: defaults.f ?? 0.4,
    U: defaults.U ?? 50,
  };
}

export default function MechanismExplorer() {
  const {
    selectedDGP,
    selectedWeightingMode,
    selectedBehaviourPreset,
    setSelectedBehaviourPreset,
    rounds,
    seed,
    nAgents,
    setRounds,
    setNAgents,
    selectedRound,
    setSelectedRound,
    setLastPipelineResult,
  } = useExplorer();

  const [builder, setBuilder] =
    useState<BuilderSelections>(DEFAULT_BUILDER_SELECTIONS);
  const [activeTab, setActiveTab] = useState<TabId>('builder');
  const [ribbonStep, setRibbonStep] = useState(0);
  const [selectedForecaster, setSelectedForecaster] = useState<number | null>(
    null,
  );
  const [simParams, setSimParams] = useState<SimParams>(() =>
    initialParamsFromDefs(rounds, nAgents),
  );

  const pipeline = useMemo(() => {
    return runPipeline({
      dgpId: selectedDGP,
      weighting: selectedWeightingMode,
      behaviourPreset: selectedBehaviourPreset,
      rounds,
      seed,
      n: nAgents,
      builder,
      mechanism: {
        gamma: simParams.gamma,
        lam: simParams.lambda,
        eta: simParams.eta,
        baseDepositFraction: simParams.f,
        utilityPool: simParams.U,
      },
    });
  }, [
    selectedDGP,
    selectedWeightingMode,
    selectedBehaviourPreset,
    rounds,
    seed,
    nAgents,
    builder,
    simParams.gamma,
    simParams.lambda,
    simParams.eta,
    simParams.f,
    simParams.U,
  ]);

  useEffect(() => {
    setLastPipelineResult(pipeline);
  }, [pipeline, setLastPipelineResult]);

  const simData = useMemo(() => {
    if (pipeline.traces.length === 0) return null;
    return pipelineToSimResult(
      pipeline.traces,
      nAgents,
      pipeline.params.utilityPool,
    );
  }, [pipeline.traces, nAgents, pipeline.params.utilityPool]);

  const config = useMemo(
    () => builderToConfig(builder, selectedBehaviourPreset),
    [builder, selectedBehaviourPreset],
  );

  const params: SimParams = useMemo(
    () => ({ ...simParams, T: rounds, N: nAgents }),
    [simParams, rounds, nAgents],
  );

  const setConfig = (next: MechanismConfig) => {
    const { builder: nextBuilder, preset } =
      configToBuilderAndPreset(next);
    if (Object.keys(nextBuilder).length) {
      setBuilder((prev) => ({ ...prev, ...nextBuilder }));
    }
    if (preset != null) setSelectedBehaviourPreset(preset);
  };

  const setParams = (next: SimParams) => {
    setRounds(next.T);
    setNAgents(next.N);
    setSimParams(next);
  };

  const runMessage =
    pipeline.traces.length > 0
      ? `✓ Pipeline ready — ${pipeline.traces.length} rounds, ${nAgents} forecasters.`
      : 'Configure blocks above. Pipeline recomputed on change.';

  const currentRound = Math.max(
    0,
    Math.min(selectedRound, pipeline.traces.length - 1),
  );

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Mechanism explorer"
        description="Interactive mechanism design: swap blocks, rerun pipeline from round 0, then step through rounds and inspect pre-event forecast and post-event settlement."
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
          onRun={() => {}}
          runMessage={runMessage}
        />
      )}

      {activeTab === 'inspector' && (
        <RoundInspectorTab
          simData={simData}
          currentRound={currentRound}
          setCurrentRound={setSelectedRound}
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
          onRoundChange={setSelectedRound}
        />
      )}
    </div>
  );
}
