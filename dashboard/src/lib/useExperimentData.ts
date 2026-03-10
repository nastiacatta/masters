import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import type {
  RunSummary,
  SkillWagerPoint,
  ForecastSeriesPoint,
  CalibrationPoint,
  BehaviourScenario,
  SweepPoint,
  RoundSeries,
  FixedDepositPoint,
} from './types';
import {
  loadSummary,
  loadSkillWagerData,
  loadForecastSeries,
  loadCalibration,
  loadBehaviourMatrix,
  loadSweepData,
  loadSettlementSeries,
  loadFixedDeposit,
} from './adapters';
import {
  generateMockSummary,
  generateMockSkillWager,
  generateMockForecastSeries,
  generateMockCalibration,
  generateMockBehaviourScenarios,
  generateMockSweep,
  generateMockSettlementSeries,
  generateMockFixedDeposit,
} from './mock-data';

interface ExperimentDataResult {
  summary: RunSummary | null;
  skillWagerData: SkillWagerPoint[];
  forecastSeries: ForecastSeriesPoint[];
  calibrationData: CalibrationPoint[];
  behaviourScenarios: BehaviourScenario[];
  sweepData: SweepPoint[];
  settlementSeries: RoundSeries[];
  fixedDepositData: FixedDepositPoint[];
  loading: boolean;
}

export function useExperimentData(): ExperimentDataResult {
  const { selectedExperiment, dataMode } = useStore();
  const [state, setState] = useState<ExperimentDataResult>({
    summary: null,
    skillWagerData: [],
    forecastSeries: [],
    calibrationData: [],
    behaviourScenarios: [],
    sweepData: [],
    settlementSeries: [],
    fixedDepositData: [],
    loading: true,
  });
  const reqId = useRef(0);

  useEffect(() => {
    if (!selectedExperiment) return;

    const thisReq = ++reqId.current;
    const exp = selectedExperiment;
    const name = exp.name;
    const block = exp.block;
    const nAgents = exp.nAgents ?? 6;
    const T = exp.rounds ?? 100;

    const mockFallback = () => ({
      summary: generateMockSummary(exp),
      skillWagerData: generateMockSkillWager(nAgents, Math.min(T, 50)),
      forecastSeries: generateMockForecastSeries(Math.min(T, 200)),
      calibrationData: generateMockCalibration(),
      behaviourScenarios: generateMockBehaviourScenarios(),
      sweepData: generateMockSweep(),
      settlementSeries: generateMockSettlementSeries(Math.min(T, 200)),
      fixedDepositData: generateMockFixedDeposit(nAgents, Math.min(T, 200)),
      loading: false,
    });

    if (dataMode === 'mock') {
      setState(mockFallback());
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    (async () => {
      try {
        const [realSummary, realSkill, realForecast, realCalib, realBehaviour, realSweep, realSettlement, realFixed] =
          await Promise.all([
            loadSummary(block, name),
            loadSkillWagerData(block, name, 'timeseries.csv'),
            loadForecastSeries(block, name, 'crps_timeseries.csv'),
            loadCalibration('experiments', 'calibration'),
            loadBehaviourMatrix('behaviour', 'behaviour_matrix'),
            loadSweepData('experiments', 'parameter_sweep'),
            loadSettlementSeries('core', 'settlement_sanity'),
            loadFixedDeposit('experiments', 'fixed_deposit'),
          ]);

        if (reqId.current !== thisReq) return;

        const mock = mockFallback();
        setState({
          summary: realSummary || mock.summary,
          skillWagerData: realSkill.length > 0 ? realSkill : mock.skillWagerData,
          forecastSeries: realForecast.length > 0 ? realForecast : mock.forecastSeries,
          calibrationData: realCalib.length > 0 ? realCalib : mock.calibrationData,
          behaviourScenarios: realBehaviour.length > 0 ? realBehaviour : mock.behaviourScenarios,
          sweepData: realSweep.length > 0 ? realSweep : mock.sweepData,
          settlementSeries: realSettlement.length > 0 ? realSettlement : mock.settlementSeries,
          fixedDepositData: realFixed.length > 0 ? realFixed : mock.fixedDepositData,
          loading: false,
        });
      } catch {
        if (reqId.current !== thisReq) return;
        setState(mockFallback());
      }
    })();
  }, [selectedExperiment, dataMode]);

  return state;
}
