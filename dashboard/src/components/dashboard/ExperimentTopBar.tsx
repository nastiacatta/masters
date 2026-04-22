import { useStore } from '@/lib/store';
import type { ExperimentMeta } from '@/lib/types';

/** Project question groups (README: aggregation, intermittency, sybil, arbitrage, adaptation). */
const THESIS_GROUP_ORDER = [
  'aggregation',
  'intermittency',
  'sybil',
  'arbitrage',
  'adaptation',
  'core',
  'other',
] as const;

const THESIS_GROUP_LABELS: Record<string, string> = {
  aggregation: 'Aggregation',
  intermittency: 'Intermittency',
  sybil: 'Sybil',
  arbitrage: 'Arbitrage',
  adaptation: 'Adaptation',
  core: 'Core / invariants',
  other: 'Other',
};

function getThesisGroup(exp: ExperimentMeta): string {
  if (exp.family && THESIS_GROUP_ORDER.includes(exp.family as (typeof THESIS_GROUP_ORDER)[number])) {
    return exp.family;
  }
  if (exp.name.includes('sybil')) return 'sybil';
  if (exp.name.includes('arbitrage') || exp.name.includes('manipulat')) return 'arbitrage';
  if (exp.name.includes('intermittency') || exp.name.includes('bursty') || exp.name.includes('missing')) return 'intermittency';
  if (exp.name.includes('aggregation') || exp.name.includes('forecast_aggregation') || exp.name.includes('calibration')) return 'aggregation';
  if (exp.name.includes('skill') || exp.name.includes('parameter_sweep') || exp.name.includes('fixed_deposit')) return 'adaptation';
  if (exp.block === 'core') return 'core';
  return 'other';
}

function groupExperimentsByThesis(experiments: ExperimentMeta[]): Map<string, ExperimentMeta[]> {
  const map = new Map<string, ExperimentMeta[]>();
  for (const exp of experiments) {
    const group = getThesisGroup(exp);
    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(exp);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
  return map;
}

interface ExperimentTopBarProps {
  /** When set, only these experiments are shown (e.g. filtered by tab on Experiments page). */
  experimentsFilter?: ExperimentMeta[] | null;
}

export default function ExperimentTopBar({ experimentsFilter }: ExperimentTopBarProps = {}) {
  const { experiments, selectedExperiment, setSelectedExperiment } = useStore();
  const source = experimentsFilter ?? experiments;
  const grouped = groupExperimentsByThesis(source);

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 px-4 bg-slate-50 border-b border-slate-200">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
        Experiment (by thesis question):
      </label>
      <select
        value={selectedExperiment?.name ?? ''}
        onChange={(e) => {
          const exp = experiments.find((x) => x.name === e.target.value);
          setSelectedExperiment(exp ?? null);
        }}
        className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 min-w-[220px]"
      >
        <option value="">Select experiment</option>
        {THESIS_GROUP_ORDER.map((groupKey) => {
          const list = grouped.get(groupKey);
          if (!list?.length) return null;
          const label = THESIS_GROUP_LABELS[groupKey] ?? groupKey;
          return (
            <optgroup key={groupKey} label={label}>
              {list.map((exp) => (
                <option key={exp.name} value={exp.name}>
                  {exp.displayName}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
}
