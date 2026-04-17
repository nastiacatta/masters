/**
 * Baseline coverage audit — check that core experiments include
 * all mandatory baselines.
 *
 * Pure function — no side effects.
 *
 * Requirements: 7.1, 7.2, 7.4, 7.6
 */

import type { BaselineCoverageEntry } from './types';
import type { ExperimentMeta } from '../types';

/** The five mandatory baselines every core experiment should compare. */
export const MANDATORY_BASELINES = [
  'equal',
  'stake-only',
  'skill-only',
  'blended',
  'bankroll',
] as const;

/**
 * Audit experiments for mandatory baseline coverage.
 *
 * Filters experiments to block = "core" or "experiments", then for each
 * experiment checks which mandatory baselines are present in the data.
 *
 * Missing baselines = set difference of mandatory \ present.
 * isComplete = missingBaselines.length === 0.
 */
export function auditBaselineCoverage(
  experiments: ExperimentMeta[],
  dataByExperiment: Map<string, { method: string }[]>,
): BaselineCoverageEntry[] {
  const coreExperiments = experiments.filter(
    (exp) => exp.block === 'core' || exp.block === 'experiments',
  );

  return coreExperiments.map((exp) => {
    const rows = dataByExperiment.get(exp.name) ?? [];
    const presentSet = new Set(rows.map((r) => r.method));

    const presentBaselines = MANDATORY_BASELINES.filter((b) =>
      presentSet.has(b),
    );
    const missingBaselines = MANDATORY_BASELINES.filter(
      (b) => !presentSet.has(b),
    );

    return {
      experimentName: exp.name,
      presentBaselines: [...presentBaselines],
      missingBaselines: [...missingBaselines],
      isComplete: missingBaselines.length === 0,
    };
  });
}
