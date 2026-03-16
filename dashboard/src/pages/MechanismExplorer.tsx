import { useMemo, useState, useEffect } from 'react';
import { useExplorer } from '@/lib/explorerStore';
import {
  DEFAULT_BUILDER_SELECTIONS,
  type BuilderSelections,
} from '@/lib/coreMechanism/runRoundComposable';
import { runPipeline } from '@/lib/coreMechanism/runPipeline';
import PageHeader from '@/components/dashboard/PageHeader';

export default function MechanismExplorer() {
  const {
    selectedDGP,
    selectedWeightingMode,
    selectedBehaviourPreset,
    rounds,
    seed,
    nAgents,
    selectedRound,
    setSelectedRound,
    setLastPipelineResult,
  } = useExplorer();

  const [builder, setBuilder] =
    useState<BuilderSelections>(DEFAULT_BUILDER_SELECTIONS);

  const pipeline = useMemo(() => {
    return runPipeline({
      dgpId: selectedDGP,
      weighting: selectedWeightingMode,
      behaviourPreset: selectedBehaviourPreset,
      rounds,
      seed,
      n: nAgents,
      builder,
    });
  }, [
    selectedDGP,
    selectedWeightingMode,
    selectedBehaviourPreset,
    rounds,
    seed,
    nAgents,
    builder,
  ]);

  useEffect(() => {
    setLastPipelineResult(pipeline);
  }, [pipeline, setLastPipelineResult]);

  const traceIndex = Math.max(
    0,
    Math.min(selectedRound, pipeline.traces.length - 1),
  );
  const trace = pipeline.traces[traceIndex] ?? null;

  if (!trace) {
    return (
      <div className="p-6 max-w-7xl">
        <PageHeader
          title="Mechanism explorer"
          description="Interactive mechanism design: swap blocks, rerun pipeline from round 0, then inspect per-round traces."
          question="How does one round move from forecast → influence → payout?"
        />
        <div className="p-6 text-sm text-slate-500">
          No recomputed rounds. Adjust inputs (rounds, n agents) or run the pipeline from the Results step.
        </div>
      </div>
    );
  }

  const totalDeposited = trace.deposits.reduce((sum, value) => sum + value, 0);
  const totalInfluence = trace.influence.reduce((sum, value) => sum + value, 0);
  const totalDistributed = trace.totalPayoff.reduce(
    (sum, value) => sum + Math.max(0, value),
    0,
  );

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Mechanism explorer"
        description="Interactive mechanism design: swap blocks, rerun pipeline from round 0, then inspect per-round traces."
        question="How does one round move from forecast → influence → payout?"
      />

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <select
            value={builder.depositPolicy}
            onChange={(e) =>
              setBuilder((prev) => ({
                ...prev,
                depositPolicy: e.target.value as BuilderSelections['depositPolicy'],
              }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="fixed_unit">Fixed unit</option>
            <option value="wealth_fraction">Wealth fraction</option>
            <option value="sigma_scaled">Sigma scaled</option>
          </select>

          <select
            value={builder.influenceRule}
            onChange={(e) =>
              setBuilder((prev) => ({
                ...prev,
                influenceRule: e.target.value as BuilderSelections['influenceRule'],
              }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="uniform">Uniform</option>
            <option value="deposit_only">Deposit only</option>
            <option value="skill_only">Skill only</option>
            <option value="skill_stake">Skill × stake</option>
          </select>

          <select
            value={builder.aggregationRule}
            onChange={(e) =>
              setBuilder((prev) => ({
                ...prev,
                aggregationRule: e.target.value as BuilderSelections['aggregationRule'],
              }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="linear">Linear pool</option>
            <option value="sqrt">Square-root pool</option>
            <option value="softmax">Softmax pool</option>
          </select>

          <select
            value={builder.settlementRule}
            onChange={(e) =>
              setBuilder((prev) => ({
                ...prev,
                settlementRule: e.target.value as BuilderSelections['settlementRule'],
              }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="skill_only">Skill only</option>
            <option value="skill_plus_utility">Skill + utility</option>
          </select>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Round {trace.round} / {pipeline.traces.length}
            </span>
            <span className="text-xs text-slate-500">true recomputation</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, pipeline.traces.length - 1)}
            value={traceIndex}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Aggregate forecast
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {trace.r_hat.toFixed(3)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Deposited
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {totalDeposited.toFixed(2)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Effective influence
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {totalInfluence.toFixed(2)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Distributed
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {totalDistributed.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-3 py-2">Agent</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Report</th>
                <th className="px-3 py-2">Sigma</th>
                <th className="px-3 py-2">Deposit</th>
                <th className="px-3 py-2">Influence</th>
                <th className="px-3 py-2">Weight</th>
                <th className="px-3 py-2">Profit</th>
                <th className="px-3 py-2">Wealth after</th>
              </tr>
            </thead>
            <tbody>
              {trace.reports.map((_, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    Agent {i}
                  </td>
                  <td className="px-3 py-3">
                    {trace.participated[i] ? 'Yes' : 'No'}
                  </td>
                  <td className="px-3 py-3">{trace.reports[i].toFixed(3)}</td>
                  <td className="px-3 py-3">{trace.sigma_t[i].toFixed(3)}</td>
                  <td className="px-3 py-3">{trace.deposits[i].toFixed(3)}</td>
                  <td className="px-3 py-3">{trace.influence[i].toFixed(3)}</td>
                  <td className="px-3 py-3">
                    {(trace.weights[i] * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-3">{trace.profit[i].toFixed(3)}</td>
                  <td className="px-3 py-3">
                    {trace.wealth_after[i].toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
