import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DGP_OPTIONS, type DGPId } from '@/lib/coreMechanism/dgpSimulator';
import { PRESET_META, type BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';
import { runPipeline, type PipelineResult } from '@/lib/coreMechanism/runPipeline';
import type { WeightingMode } from '@/lib/coreMechanism/runRound';
import { fmtNum } from '@/lib/formatters';

const WEIGHTING_OPTIONS: { id: WeightingMode; label: string }[] = [
  { id: 'uniform', label: 'Uniform' },
  { id: 'deposit', label: 'Deposit only' },
  { id: 'skill', label: 'Skill only' },
  { id: 'full', label: 'Skill × stake' },
];

export default function PipelineOverview() {
  const [dgpId, setDgpId] = useState<DGPId>('baseline');
  const [weighting, setWeighting] = useState<WeightingMode>('full');
  const [behaviourPreset, setBehaviourPreset] = useState<BehaviourPresetId>('baseline');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);

  const selectedDGP = DGP_OPTIONS.find((d) => d.id === dgpId);
  const selectedBehaviour = PRESET_META[behaviourPreset];

  const handleRun = useCallback(() => {
    setRunning(true);
    setResult(null);
    try {
      const res = runPipeline({
        dgpId,
        weighting,
        behaviourPreset,
        rounds: 50,
        seed: 42,
        n: 5,
      });
      setResult(res);
    } finally {
      setRunning(false);
    }
  }, [dgpId, weighting, behaviourPreset]);

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Pipeline overview
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Choose components from beginning to end: DGP → Core → Behaviours.
        </p>
      </header>

      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">1. DGP</h2>
            <Link to="/dgp" className="text-xs text-blue-600 hover:text-blue-700">
              View →
            </Link>
          </div>
          <label className="block">
            <span className="text-xs text-slate-500">Data generating process</span>
            <select
              value={dgpId}
              onChange={(e) => setDgpId(e.target.value as DGPId)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1"
            >
              {DGP_OPTIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          {selectedDGP && (
            <p className="text-xs text-slate-500 mt-2">{selectedDGP.description}</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">2. Core</h2>
            <Link to="/core" className="text-xs text-blue-600 hover:text-blue-700">
              View →
            </Link>
          </div>
          <label className="block">
            <span className="text-xs text-slate-500">Weighting rule</span>
            <select
              value={weighting}
              onChange={(e) => setWeighting(e.target.value as WeightingMode)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1"
            >
              {WEIGHTING_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-slate-500 mt-2">
            How reports are combined: uniform, deposit-only, skill-only, or full skill × stake.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">3. Behaviours</h2>
            <Link to="/behaviours" className="text-xs text-blue-600 hover:text-blue-700">
              View →
            </Link>
          </div>
          <label className="block">
            <span className="text-xs text-slate-500">Behaviour scenario</span>
            <select
              value={behaviourPreset}
              onChange={(e) => setBehaviourPreset(e.target.value as BehaviourPresetId)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1"
            >
              {(Object.keys(PRESET_META) as BehaviourPresetId[]).map((p) => (
                <option key={p} value={p}>
                  {PRESET_META[p].label}
                </option>
              ))}
            </select>
          </label>
          {selectedBehaviour && (
            <p className="text-xs text-slate-500 mt-2">{selectedBehaviour.description}</p>
          )}
        </section>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? 'Running…' : 'Run with selected components'}
          </button>
          <Link
            to="/core/experiments"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View experiments
          </Link>
        </div>

        {result && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Results</h2>
            <p className="text-xs text-slate-500 mb-4">
              Ran with <strong>{selectedDGP?.label ?? dgpId}</strong>, weighting <strong>{WEIGHTING_OPTIONS.find((o) => o.id === result.weighting)?.label ?? result.weighting}</strong>, behaviour <strong>{selectedBehaviour?.label ?? result.behaviourPreset}</strong>.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Mean |y − r̂|</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.meanError, 4)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Rounds</p>
                <p className="text-lg font-semibold text-slate-800">{result.summary.finalRounds}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Mean participation</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.meanParticipation, 2)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Mean n_eff</p>
                <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.meanNEff, 3)}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-1">Round-by-round error |y − r̂|</p>
              <p className="text-xs font-mono text-slate-700 break-all leading-relaxed">
                {result.rounds.map((r, i) => (
                  <span key={i}>
                    {i > 0 && ', '}
                    <span className={i < 5 ? 'font-medium text-slate-900' : undefined}>
                      {fmtNum(r.error, 3)}
                    </span>
                  </span>
                ))}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
