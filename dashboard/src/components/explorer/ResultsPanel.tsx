/**
 * Results stage: 3 sections
 * 1. Forecast quality
 * 2. Market / payout outcomes
 * 3. Robustness / manipulation outcomes
 */
import { useCallback, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useExplorer } from '@/lib/explorerStore';
import { runPipeline } from '@/lib/coreMechanism/runPipeline';
import ChartCard from '@/components/dashboard/ChartCard';
import { fmtNum } from '@/lib/formatters';

export default function ResultsPanel() {
  const {
    selectedDGP,
    selectedWeightingMode,
    selectedBehaviourPreset,
    rounds,
    seed,
    nAgents,
    lastPipelineResult,
    setLastPipelineResult,
  } = useExplorer();

  const [running, setRunning] = useState(false);

  const handleRun = useCallback(() => {
    setRunning(true);
    setLastPipelineResult(null);
    try {
      const res = runPipeline({
        dgpId: selectedDGP,
        weighting: selectedWeightingMode,
        behaviourPreset: selectedBehaviourPreset,
        rounds,
        seed,
        n: nAgents,
      });
      setLastPipelineResult(res);
    } finally {
      setRunning(false);
    }
  }, [selectedDGP, selectedWeightingMode, selectedBehaviourPreset, rounds, seed, nAgents, setLastPipelineResult]);

  const result = lastPipelineResult;
  const chartData = result?.rounds.map((r, i) => ({
    round: i + 1,
    error: r.error,
    participation: r.participation,
    nEff: r.nEff,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? 'Running…' : 'Run pipeline'}
        </button>
        <p className="text-xs text-slate-500">
          Uses {selectedDGP}, {selectedWeightingMode}, {selectedBehaviourPreset}
        </p>
      </div>

      {!result && (
        <p className="text-sm text-slate-500">
          Run the pipeline to see results. Outputs are grouped into forecast quality, market/payout outcomes, and robustness.
        </p>
      )}

      {result && (
        <>
          {/* 1. Forecast quality */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">1. Forecast quality</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Aggregate forecast error</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.meanError, 4)}</p>
                <p className="text-xs text-slate-500">Mean |y − r̂|</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Calibration</p>
                <p className="text-lg font-semibold text-slate-800">—</p>
                <p className="text-xs text-slate-500">TODO: add if available</p>
              </div>
            </div>
          </section>

          {/* 2. Market / payout outcomes */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">2. Market / payout outcomes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Payout distribution</p>
                <p className="text-lg font-semibold text-slate-800">Gini {fmtNum(result.summary.finalGini, 3)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Participation rate</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.meanParticipation, 2)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Effective contributors</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.meanNEff, 2)}</p>
              </div>
            </div>
          </section>

          {/* 3. Robustness / manipulation */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">3. Robustness / manipulation outcomes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Wealth concentration</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.finalGini, 3)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Missingness rate</p>
                <p className="text-lg font-semibold text-slate-800">—</p>
                <p className="text-xs text-slate-500">TODO: add if available</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[10px] uppercase text-slate-500">Attack metrics</p>
                <p className="text-lg font-semibold text-slate-800">—</p>
                <p className="text-xs text-slate-500">TODO: add if available</p>
              </div>
            </div>
          </section>

          {chartData.length > 0 && (
            <ChartCard title="Round-by-round" subtitle="Error, participation, N_eff">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="round" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => (typeof v === 'number' ? fmtNum(v, 4) : String(v))} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="error" name="Error" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="participation" name="Participation" stroke="#0d9488" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="nEff" name="N_eff" stroke="#64748b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
}
