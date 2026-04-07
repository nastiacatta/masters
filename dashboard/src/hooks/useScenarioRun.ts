import { useMemo } from 'react';
import {
  runPipeline,
  type PipelineResult,
  type PipelineOptions,
} from '@/lib/coreMechanism/runPipeline';

/**
 * Wraps `runPipeline()` in a `useMemo` so the simulation only re-runs
 * when the option values actually change. Returns the result and a
 * staleness flag (always false for synchronous execution; the interface
 * supports a future async path).
 */
export function useScenarioRun(options: PipelineOptions): {
  result: PipelineResult;
  isStale: boolean;
} {
  const result = useMemo(
    () => runPipeline(options),
    [
      options.dgpId,
      options.behaviourPreset,
      options.rounds,
      options.seed,
      options.n,
      JSON.stringify(options.builder),
      JSON.stringify(options.mechanism),
    ],
  );
  return { result, isStale: false };
}
