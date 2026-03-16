import { useStore } from '@/lib/store';
import type { ExperimentMeta } from '@/lib/types';

interface ExperimentTopBarProps {
  /** When set, only these experiments are shown (e.g. filtered by tab on Experiments page). */
  experimentsFilter?: ExperimentMeta[] | null;
}

export default function ExperimentTopBar({ experimentsFilter }: ExperimentTopBarProps = {}) {
  const { experiments, selectedExperiment, setSelectedExperiment } = useStore();
  const source = experimentsFilter ?? experiments;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 px-4 bg-slate-50 border-b border-slate-200">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
        Experiment:
      </label>
      <select
        value={selectedExperiment?.name ?? ''}
        onChange={(e) => {
          const exp = experiments.find((x) => x.name === e.target.value);
          setSelectedExperiment(exp ?? null);
        }}
        className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 min-w-[200px]"
      >
        <option value="">Select experiment</option>
        {source.map((exp) => (
          <option key={exp.name} value={exp.name}>
            {exp.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
