import { useStore } from '@/lib/store';
import clsx from 'clsx';
import type { ExperimentMeta } from '@/lib/types';

const EXPERIMENT_CATEGORIES = [
  { id: 'forecast_aggregation', label: 'Aggregation' },
  { id: 'intermittency_stress_test', label: 'Intermittency' },
  { id: 'calibration', label: 'Calibration' },
  { id: 'sybil', label: 'Sybil' },
  { id: 'arbitrage_scan', label: 'Arbitrage' },
  { id: 'parameter_sweep', label: 'Sweep' },
] as const;

interface ExperimentTopBarProps {
  /** When set, only these experiments are shown (e.g. filtered by tab on Experiments page). */
  experimentsFilter?: ExperimentMeta[] | null;
}

export default function ExperimentTopBar({ experimentsFilter }: ExperimentTopBarProps = {}) {
  const { experiments, selectedExperiment, setSelectedExperiment } = useStore();
  const source = experimentsFilter ?? experiments;

  const primaryExperiments = EXPERIMENT_CATEGORIES.map(({ id }) =>
    source.find((e) => e.name === id)
  ).filter(Boolean);

  const otherExperiments = source.filter(
    (e) => !EXPERIMENT_CATEGORIES.some((c) => c.id === e.name)
  );

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 px-4 bg-slate-50 border-b border-slate-200 rounded-t-xl">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
        Experiment:
      </span>
      <div className="flex flex-wrap gap-1">
        {primaryExperiments.map((exp) => (
          <button
            key={exp!.name}
            onClick={() => setSelectedExperiment(exp!)}
            className={clsx(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              selectedExperiment?.name === exp!.name
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            )}
            title={exp!.description}
          >
            {exp!.displayName}
          </button>
        ))}
        {otherExperiments.length > 0 && (
          <select
            value={selectedExperiment?.name ?? ''}
            onChange={(e) => {
              const exp = experiments.find((x) => x.name === e.target.value);
              setSelectedExperiment(exp ?? null);
            }}
            className="px-2 py-1 rounded-md text-xs border border-slate-200 bg-white text-slate-600"
          >
            <option value="">More…</option>
            {otherExperiments.map((exp) => (
              <option key={exp.name} value={exp.name}>
                {exp.displayName}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
