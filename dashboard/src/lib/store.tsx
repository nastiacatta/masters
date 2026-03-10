import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ExperimentMeta } from './types';
import { mockExperiments } from './mock-data';
import { loadExperimentList } from './adapters';

interface StoreState {
  experiments: ExperimentMeta[];
  selectedExperiment: ExperimentMeta | null;
  setSelectedExperiment: (e: ExperimentMeta | null) => void;
  blockFilter: 'all' | 'core' | 'behaviour' | 'experiments';
  setBlockFilter: (b: 'all' | 'core' | 'behaviour' | 'experiments') => void;
  currentRound: number;
  setCurrentRound: (r: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  dataMode: 'mock' | 'real';
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [experiments, setExperiments] = useState<ExperimentMeta[]>(mockExperiments);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentMeta | null>(mockExperiments[0]);
  const [blockFilter, setBlockFilter] = useState<'all' | 'core' | 'behaviour' | 'experiments'>('all');
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dataMode, setDataMode] = useState<'mock' | 'real'>('mock');

  useEffect(() => {
    loadExperimentList().then(real => {
      if (real.length > 0) {
        setExperiments(real);
        setSelectedExperiment(real[0]);
        setDataMode('real');
      }
    });
  }, []);

  void setDataMode;

  return (
    <StoreContext.Provider
      value={{
        experiments,
        selectedExperiment,
        setSelectedExperiment,
        blockFilter,
        setBlockFilter,
        currentRound,
        setCurrentRound,
        isPlaying,
        setIsPlaying,
        dataMode,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
