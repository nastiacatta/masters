import { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import ThesisHeader from '@/components/thesis/ThesisHeader';
import ExperimentTopBar from '@/components/dashboard/ExperimentTopBar';
import Validation from '@/pages/validation/Validation';
import ExperimentQuestionCard from '@/components/thesis/ExperimentQuestionCard';
import InterpretationCard from '@/components/thesis/InterpretationCard';
import { useStore } from '@/lib/store';
import type { ExperimentMeta } from '@/lib/types';

const TABS = [
  { id: 'baselines', label: 'Baselines' },
  { id: 'core_ablations', label: 'Core ablations' },
  { id: 'missingness', label: 'Missingness / intermittent' },
  { id: 'behaviour_stress', label: 'Behaviour stress tests' },
  { id: 'adversarial', label: 'Adversarial / sybil' },
  { id: 'sensitivity', label: 'Sensitivity analysis' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const TAB_META: Record<
  TabId,
  { question: string; fixed: string[]; varies: string[]; interpretation: string }
> = {
  baselines: {
    question: 'Does the mechanism produce sensible forecasts under benign conditions?',
    fixed: ['DGP (baseline)', 'Scoring rule (MAE/CRPS)', 'Benign participation'],
    varies: ['Weighting mode (uniform, deposit, skill, full)', 'Number of agents', 'Rounds'],
    interpretation:
      'Baseline experiments establish that the mechanism converges to reasonable aggregate forecasts when agents participate honestly. Skill × stake should outperform uniform and deposit-only under heterogeneous skill.',
  },
  core_ablations: {
    question: 'How do core mechanism choices affect forecast quality and concentration?',
    fixed: ['DGP', 'Behaviour preset'],
    varies: ['Weighting rule', 'Settlement parameters', 'Skill update rate (ρ)', 'σ_min, γ'],
    interpretation:
      'Core ablations isolate the effect of each mechanism component. The skill update rate controls adaptation speed; σ_min sets a floor to avoid over-penalising new participants.',
  },
  missingness: {
    question: 'How does intermittent participation affect aggregation and skill learning?',
    fixed: ['DGP', 'Weighting mode'],
    varies: ['Participation pattern (IID, bursty, edge-threshold)', 'Missingness handling (freeze, decay)'],
    interpretation:
      'Missingness tests whether the online skill layer remains informative when participation is sporadic. Freeze preserves σ for absent agents; decay toward L₀ reduces their influence over time.',
  },
  behaviour_stress: {
    question: 'How robust is the mechanism to realistic behavioural frictions?',
    fixed: ['DGP', 'Core mechanism'],
    varies: ['Behaviour preset (bursty, risk-averse, manipulator)', 'Participation shocks', 'Deposit policies'],
    interpretation:
      'Behaviour stress tests probe whether forecast quality degrades under hedged reporting, bursty participation, or conservative staking. The mechanism should remain stable if incentives are properly aligned.',
  },
  adversarial: {
    question: 'Can strategic or sybil behaviour gain advantage or distort the aggregate?',
    fixed: ['DGP', 'Core mechanism'],
    varies: ['Attacker type (sybil, manipulator, evader, arbitrageur)', 'Attack intensity'],
    interpretation:
      'Adversarial experiments test robustness to manipulation. Sybil splitting should not yield disproportionate profit if skill is learned from outcomes. The effective number of contributors (N_eff) indicates concentration risk.',
  },
  sensitivity: {
    question: 'How do key parameters affect the trade-off between forecast quality and concentration?',
    fixed: ['DGP', 'Behaviour preset'],
    varies: ['λ (skill–stake blend)', 'σ_min', 'γ (loss–skill mapping)', 'ρ (EWMA rate)'],
    interpretation:
      'Sensitivity analysis maps the Pareto frontier: higher skill weight improves forecast quality but may increase concentration. The thesis seeks parameter regions where both are acceptable.',
  },
};

function filterExperiments(experiments: ExperimentMeta[], tab: TabId): ExperimentMeta[] {
  switch (tab) {
    case 'baselines':
      return experiments.filter(
        (e) =>
          e.name === 'forecast_aggregation' ||
          e.name === 'skill_wager' ||
          e.name === 'fixed_deposit' ||
          e.block === 'core'
      );
    case 'core_ablations':
      return experiments.filter(
        (e) =>
          e.block === 'core' ||
          ['parameter_sweep', 'weight_rule_comparison', 'aggregation_skill_effect', 'settlement_sanity', 'scoring_validation'].includes(e.name)
      );
    case 'missingness':
      return experiments.filter(
        (e) =>
          e.name.includes('intermittency') ||
          e.name.includes('stress') ||
          e.name === 'intermittency_stress_test'
      );
    case 'behaviour_stress':
      return experiments.filter(
        (e) =>
          e.block === 'behaviour' &&
          !['sybil', 'arbitrage_scan', 'identity', 'detection'].some((k) => e.name.includes(k))
      );
    case 'adversarial':
      return experiments.filter(
        (e) =>
          e.name.includes('sybil') ||
          e.name.includes('arbitrage') ||
          e.name.includes('detection') ||
          e.name.includes('collusion') ||
          e.name.includes('insider') ||
          e.name.includes('identity')
      );
    case 'sensitivity':
      return experiments.filter(
        (e) =>
          e.name === 'parameter_sweep' ||
          e.name === 'calibration' ||
          e.name.includes('sweep') ||
          e.name.includes('sensitivity')
      );
    default:
      return experiments;
  }
}

export default function ExperimentsPage() {
  const [tab, setTab] = useState<TabId>('baselines');
  const { experiments, selectedExperiment, setSelectedExperiment } = useStore();
  const filtered = useMemo(() => filterExperiments(experiments, tab), [experiments, tab]);

  useEffect(() => {
    if (!selectedExperiment || filtered.length === 0) return;
    if (!filtered.some((e) => e.name === selectedExperiment.name)) {
      setSelectedExperiment(filtered[0]);
    }
  }, [tab, filtered, selectedExperiment, setSelectedExperiment]);

  const meta = TAB_META[tab];

  return (
    <div className="flex flex-col h-full">
      <ThesisHeader compact />
      <p className="px-4 pb-2 text-sm text-slate-600">
        Cross-scenario comparison. Select a tab and an experiment to view results. Each experiment states the question, what is held fixed vs varied, and ends with an interpretation in thesis language.
      </p>
      <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 mx-4 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-2">
          <ExperimentTopBar experimentsFilter={filtered} />
        </div>
        <div className="p-4 space-y-4">
          <ExperimentQuestionCard
            question={meta.question}
            fixed={meta.fixed}
            varies={meta.varies}
          />
          <Validation />
          <InterpretationCard>{meta.interpretation}</InterpretationCard>
        </div>
      </div>
    </div>
  );
}
