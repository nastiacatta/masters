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
import type {
  MechanismConfig,
  SimParams,
  SkillVariant,
} from '@/lib/mechanismExplorer/types';

type TabId = 'builder' | 'inspector' | 'outcome';

const TABS: { id: TabId; label: string }[] = [
  { id: 'builder', label: '⬡ Mechanism builder' },
  { id: 'inspector', label: '⊙ Round inspector' },
  { id: 'outcome', label: '◎ Outcome studio' },
];

/** Map composable builder + behaviour preset + skill to the 6-block config. Uses precise labels (no semantic compression). */
function builderToConfig(
  builder: BuilderSelections,
  behaviourPreset: BehaviourPresetId,
  skillVariant: SkillVariant,
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
    sqrt: '√-weight pool',
    softmax: 'Log pool',
  };
  const settlementLabels: Record<SettlementRule, MechanismConfig['settlement']> = {
    skill_only: 'Skill-only',
    skill_plus_utility: 'Skill+utility',
  };
  const behaviourLabels: Record<BehaviourPresetId, MechanismConfig['behaviour']> = {
    baseline: 'Benign',
    bursty: 'Bursty',
    risk_averse: 'Risk-averse',
    manipulator: 'Manipulator',
    sybil: 'Sybil',
    evader: 'Evader',
    arbitrageur: 'Arbitrageur',
  };
  return {
    skill: skillVariant,
    deposit: depositLabels[builder.depositPolicy],
    influence: influenceLabels[builder.influenceRule],
    aggregation: aggregationLabels[builder.aggregationRule],
    settlement: settlementLabels[builder.settlementRule],
    behaviour: behaviourLabels[behaviourPreset],
  };
}

/** Map config block selection back to composable builder, behaviour preset, and skill. */
function configToBuilderAndPreset(
  config: MechanismConfig,
): {
  builder: Partial<BuilderSelections>;
  preset?: BehaviourPresetId;
  skill?: SkillVariant;
} {
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
    '√-weight pool': 'sqrt',
    'Log pool': 'softmax',
    'Equal pool': 'linear',
  };
  const settlementFromLabel: Record<string, SettlementRule> = {
    'Skill-only': 'skill_only',
    'Skill+utility': 'skill_plus_utility',
  };
  const presetFromLabel: Record<string, BehaviourPresetId> = {
    Benign: 'baseline',
    Bursty: 'bursty',
    'Risk-averse': 'risk_averse',
    Manipulator: 'manipulator',
    Evader: 'evader',
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
    skill: config.skill,
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
  const [selectedSkill, setSelectedSkill] = useState<SkillVariant>('Fast adapt');
  const [appliedBuilder, setAppliedBuilder] =
    useState<BuilderSelections>(DEFAULT_BUILDER_SELECTIONS);
  const [appliedSimParams, setAppliedSimParams] = useState<SimParams>(() =>
    initialParamsFromDefs(rounds, nAgents),
  );
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
      builder: appliedBuilder,
      mechanism: {
        gamma: appliedSimParams.gamma,
        lam: appliedSimParams.lambda,
        eta: appliedSimParams.eta,
        baseDepositFraction: appliedSimParams.f,
        utilityPool: appliedSimParams.U,
      },
    });
  }, [
    selectedDGP,
    selectedWeightingMode,
    selectedBehaviourPreset,
    rounds,
    seed,
    nAgents,
    appliedBuilder,
    appliedSimParams.gamma,
    appliedSimParams.lambda,
    appliedSimParams.eta,
    appliedSimParams.f,
    appliedSimParams.U,
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
    () => builderToConfig(builder, selectedBehaviourPreset, selectedSkill),
    [builder, selectedBehaviourPreset, selectedSkill],
  );

  const params: SimParams = useMemo(
    () => ({ ...simParams, T: rounds, N: nAgents }),
    [simParams, rounds, nAgents],
  );

  const setConfig = (next: MechanismConfig) => {
    const { builder: nextBuilder, preset, skill: nextSkill } =
      configToBuilderAndPreset(next);
    if (Object.keys(nextBuilder).length) {
      setBuilder((prev) => ({ ...prev, ...nextBuilder }));
    }
    if (preset != null) setSelectedBehaviourPreset(preset);
    if (nextSkill != null) setSelectedSkill(nextSkill);
  };

  const setParams = (next: SimParams) => {
    setRounds(next.T);
    setNAgents(next.N);
    setSimParams(next);
  };

  const hasPendingChanges =
    JSON.stringify(builder) !== JSON.stringify(appliedBuilder) ||
    JSON.stringify(simParams) !== JSON.stringify(appliedSimParams);

  const handleApply = () => {
    setAppliedBuilder(builder);
    setAppliedSimParams(simParams);
  };

  const runMessage = hasPendingChanges
    ? 'Change blocks or params, then click Apply to recompute pipeline.'
    : pipeline.traces.length > 0
      ? `✓ Pipeline ready — ${pipeline.traces.length} rounds, ${nAgents} forecasters. (Live counterfactual preview.)`
      : 'Configure blocks above and click Apply to run the pipeline.';

  const currentRound = Math.max(
    0,
    Math.min(selectedRound, pipeline.traces.length - 1),
  );

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Walkthrough"
        description="Step-by-step round flow: Inputs → DGP → Core → Behaviour → Results → Next state. The tabs below are subsections of this narrative. Pre-run evidence lives in Experiments and Validation; this page runs a live counterfactual pipeline when you Apply."
        question="How does one round move from forecast → influence → payout?"
      />
      <p className="text-xs text-slate-500 mb-4">
        This view recomputes the pipeline in the browser when you click Apply. For static experiment outputs from <code className="bg-slate-100 px-1 rounded">public/data/</code>, use Experiments and Validation.
      </p>

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
          onRun={handleApply}
          runMessage={runMessage}
          hasPendingChanges={hasPendingChanges}
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
