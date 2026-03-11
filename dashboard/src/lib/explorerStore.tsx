/**
 * Central explorer state for the thesis-first mechanism demonstrator.
 * All downstream views derive from this single state.
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ExperimentMeta } from './types';
import type { DGPId } from './coreMechanism/dgpSimulator';
import type { WeightingMode } from './coreMechanism/runRound';
import type { BehaviourPresetId } from './behaviour/scenarioSimulator';
import type { ExplorerStageId, CoreSubtabId } from './thesis';
import { useStore } from './store';

export interface ExplorerState {
  selectedExperiment: ExperimentMeta | null;
  selectedRound: number;
  selectedDGP: DGPId;
  selectedAggregation: WeightingMode;
  selectedScoringRule: 'MAE' | 'CRPS';
  selectedWeightingMode: WeightingMode;
  selectedBehaviourPreset: BehaviourPresetId;
  selectedBehaviourModuleOptions: Record<string, unknown>;
  selectedCoreSubstep: CoreSubtabId;
  selectedStage: ExplorerStageId;
  // Pipeline params (for run)
  rounds: number;
  nAgents: number;
  seed: number;
  // Pipeline result (after run)
  lastPipelineResult: import('./coreMechanism/runPipeline').PipelineResult | null;
}

const DEFAULT_STATE: ExplorerState = {
  selectedExperiment: null,
  selectedRound: 0,
  selectedDGP: 'baseline',
  selectedAggregation: 'full',
  selectedScoringRule: 'MAE',
  selectedWeightingMode: 'full',
  selectedBehaviourPreset: 'baseline',
  selectedBehaviourModuleOptions: {},
  selectedCoreSubstep: 'task_setup',
  selectedStage: 'inputs',
  rounds: 500,
  nAgents: 6,
  seed: 42,
  lastPipelineResult: null,
};

interface ExplorerContextValue extends ExplorerState {
  setSelectedExperiment: (e: ExperimentMeta | null) => void;
  setSelectedRound: (r: number | ((prev: number) => number)) => void;
  setSelectedDGP: (d: DGPId) => void;
  setSelectedAggregation: (a: WeightingMode) => void;
  setSelectedScoringRule: (r: 'MAE' | 'CRPS') => void;
  setSelectedWeightingMode: (w: WeightingMode) => void;
  setSelectedBehaviourPreset: (p: BehaviourPresetId) => void;
  setSelectedBehaviourModuleOptions: (o: Record<string, unknown>) => void;
  setSelectedCoreSubstep: (s: CoreSubtabId) => void;
  setSelectedStage: (s: ExplorerStageId) => void;
  setRounds: (r: number) => void;
  setNAgents: (n: number) => void;
  setSeed: (s: number) => void;
  setLastPipelineResult: (r: ExplorerState['lastPipelineResult']) => void;
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null);

export function ExplorerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExplorerState>(DEFAULT_STATE);
  const { selectedExperiment: storeExperiment } = useStore();

  useEffect(() => {
    if (storeExperiment && !state.selectedExperiment) {
      setState((s) => ({ ...s, selectedExperiment: storeExperiment }));
    }
  }, [storeExperiment, state.selectedExperiment]);

  const update = useCallback(<K extends keyof ExplorerState>(key: K, value: ExplorerState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const setSelectedRound = useCallback((r: number | ((prev: number) => number)) => {
    setState((s) => ({ ...s, selectedRound: typeof r === 'function' ? r(s.selectedRound) : r }));
  }, []);

  const value: ExplorerContextValue = {
    ...state,
    setSelectedExperiment: (e) => update('selectedExperiment', e),
    setSelectedRound,
    setSelectedDGP: (d) => update('selectedDGP', d),
    setSelectedAggregation: (a) => update('selectedAggregation', a),
    setSelectedScoringRule: (r) => update('selectedScoringRule', r),
    setSelectedWeightingMode: (w) => update('selectedWeightingMode', w),
    setSelectedBehaviourPreset: (p) => update('selectedBehaviourPreset', p),
    setSelectedBehaviourModuleOptions: (o) => update('selectedBehaviourModuleOptions', o),
    setSelectedCoreSubstep: (s) => update('selectedCoreSubstep', s),
    setSelectedStage: (s) => update('selectedStage', s),
    setRounds: (r) => update('rounds', r),
    setNAgents: (n) => update('nAgents', n),
    setSeed: (s) => update('seed', s),
    setLastPipelineResult: (r) => update('lastPipelineResult', r),
  };

  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  );
}

export function useExplorer(): ExplorerContextValue {
  const ctx = useContext(ExplorerContext);
  if (!ctx) throw new Error('useExplorer must be used within ExplorerProvider');
  return ctx;
}
