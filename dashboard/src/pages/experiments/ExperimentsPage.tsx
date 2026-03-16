import { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import ExperimentTopBar from '@/components/dashboard/ExperimentTopBar';
import Validation from '@/pages/validation/Validation';
import { useStore } from '@/lib/store';
import type { ExperimentMeta } from '@/lib/types';

const TABS = [
  { id: 'baselines', label: 'Baselines' },
  { id: 'behaviour', label: 'Behaviour' },
  { id: 'adversarial', label: 'Adversarial' },
] as const;

type TabId = (typeof TABS)[number]['id'];

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
    case 'behaviour':
      return experiments.filter(
        (e) =>
          e.block === 'behaviour' ||
          e.name.includes('intermittency') ||
          e.name.includes('stress') ||
          e.name === 'intermittency_stress_test'
      );
    case 'adversarial':
      return experiments.filter(
        (e) =>
          e.name.includes('sybil') ||
          e.name.includes('arbitrage') ||
          e.name.includes('detection') ||
          e.name.includes('collusion') ||
          e.name.includes('insider') ||
          e.name.includes('identity') ||
          e.block === 'core' ||
          e.name === 'parameter_sweep' ||
          e.name === 'calibration'
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

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <h1 className="text-lg font-semibold text-slate-900">Experiments</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Cross-scenario evidence. Select a tab and an experiment.
        </p>
      </div>
      <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 mx-4 mt-3 mb-2">
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
        <div className="p-4">
          <Validation />
        </div>
      </div>
    </div>
  );
}
