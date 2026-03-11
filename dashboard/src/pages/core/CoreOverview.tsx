import { useState, useMemo } from 'react';
import PageHeader from '@/components/dashboard/PageHeader';
import MathBlock from '@/components/dashboard/MathBlock';
import SectionLabel from '@/components/dashboard/SectionLabel';
import ChartCard from '@/components/dashboard/ChartCard';
import { fmtNum } from '@/lib/formatters';
import {
  DGP_OPTIONS,
  generateDGP,
  type DGPId,
  type DGPSeries,
  type RoundData,
} from '@/lib/coreMechanism/dgpSimulator';
import {
  runRound,
  stateAfterRounds,
  buildInitialStateAndActions,
  type MechanismParams,
  type StepOutputs,
} from '@/lib/coreMechanism/runRound';

const DEFAULT_PARAMS: MechanismParams = {
  lam: 0.3,
  sigma_min: 0.1,
  gamma: 4,
  rho: 0.1,
  eta: 1,
  U: 0,
  s_client: 0,
};
const DEFAULT_N = 3;
const DEFAULT_T = 20;
const DEFAULT_SEED = 42;
const DEPOSIT = 1;

export default function CoreOverview() {
  const [dgpId, setDgpId] = useState<DGPId>('baseline');
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [nForecasters, setNForecasters] = useState(DEFAULT_N);
  const [numRounds, setNumRounds] = useState(DEFAULT_T);
  const [series, setSeries] = useState<DGPSeries | null>(null);
  const [currentRound, setCurrentRound] = useState(0);

  const dgpOption = DGP_OPTIONS.find((o) => o.id === dgpId) ?? DGP_OPTIONS[0];

  const generate = () => {
    const s = generateDGP(dgpId, seed, numRounds, nForecasters);
    setSeries(s);
    setCurrentRound(0);
  };

  const { state: initialState, actionsTemplate } = useMemo(
    () => buildInitialStateAndActions(nForecasters, DEPOSIT),
    [nForecasters]
  );

  const stateAtStartOfRound = useMemo(() => {
    if (!series || series.rounds.length === 0) return initialState;
    const roundsData = series.rounds.map((r) => ({ y: r.y, reports: r.reports }));
    return stateAfterRounds(
      initialState,
      roundsData,
      DEFAULT_PARAMS,
      DEPOSIT,
      currentRound
    );
  }, [series, currentRound, initialState, nForecasters]);

  const roundData: RoundData | null = series?.rounds[currentRound] ?? null;
  const stepOutputs: StepOutputs | null = useMemo(() => {
    if (!roundData) return null;
    const actions = actionsTemplate(roundData.reports);
    return runRound(stateAtStartOfRound, actions, roundData.y, DEFAULT_PARAMS);
  }, [roundData, stateAtStartOfRound, actionsTemplate]);

  const maxRound = series ? Math.max(0, series.rounds.length - 1) : 0;

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader
        title="Core mechanism"
        description="The mechanism is a deterministic state machine. Choose a data-generating process (DGP), generate rounds, and step through one round to see how state, actions, outcome, and mechanism computations interact."
      />

      {/* DGP selection */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Data generation (DGP)</h3>
        <p className="text-xs text-slate-500 mb-3">
          Select how the outcome <MathBlock inline latex="y_t" /> and forecaster reports are generated. Exogenous: truth is drawn first. Endogenous: truth depends on forecaster signals.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {DGP_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setDgpId(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                dgpId === opt.id
                  ? opt.truthSource === 'exogenous'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-violet-50 text-violet-800 border-violet-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-medium text-slate-800 mb-1">{dgpOption.description}</p>
          <p className="text-slate-600">
            Formula: <MathBlock inline latex={dgpOption.formula} />
          </p>
        </div>
      </div>

      {/* Generate controls */}
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase text-slate-500">Seed</span>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value) || 0)}
            className="w-20 rounded border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase text-slate-500">Forecasters</span>
          <input
            type="number"
            min={1}
            max={10}
            value={nForecasters}
            onChange={(e) => setNForecasters(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
            className="w-20 rounded border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase text-slate-500">Rounds</span>
          <input
            type="number"
            min={5}
            max={100}
            value={numRounds}
            onChange={(e) => setNumRounds(Math.max(5, Math.min(100, Number(e.target.value) || 10)))}
            className="w-20 rounded border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          onClick={generate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Generate
        </button>
      </div>

      {/* Round contract (static) */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <SectionLabel type="mechanism_computation" />
          Round contract
        </h3>
        <MathBlock
          accent
          label="One round"
          latex="(\text{state}_t, \text{RoundInput}_t, y_t) \to (\text{state}_{t+1}, \text{logs}_t)"
        />
        <p className="text-xs text-slate-500 mt-2">
          Round input = (account_id, participate, report, deposit). The mechanism uses only these actions and the outcome <MathBlock inline latex="y_t" />.
        </p>
      </div>

      {!series && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Select a DGP and click Generate to see step-by-step mechanism for each round.
        </div>
      )}

      {series && (
        <>
          {/* Round selector */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="text-xs font-medium text-slate-600">Round</span>
            <input
              type="range"
              min={0}
              max={maxRound}
              value={currentRound}
              onChange={(e) => setCurrentRound(Number(e.target.value))}
              className="flex-1 min-w-[120px] accent-blue-600"
            />
            <span className="text-sm font-mono text-slate-800 w-12">
              {currentRound} / {maxRound}
            </span>
          </div>

          {/* Step-by-step with live data */}
          {stepOutputs && (
            <div className="space-y-4">
              {/* Step 1: Pre-round state */}
              <ChartCard
                title="Step 1: Pre-round state"
                subtitle="Hidden state (fixed before reports)"
              >
                <div className="flex flex-wrap gap-4">
                  <div className="min-w-[140px]">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                      L_{'{i,t-1}'} (EWMA loss)
                    </p>
                    <p className="font-mono text-xs text-slate-700">
                      {stepOutputs.L_prev.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                    </p>
                  </div>
                  <div className="min-w-[140px]">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                      σ_{'{i,t}'} (skill)
                    </p>
                    <p className="font-mono text-xs text-slate-700">
                      {stepOutputs.sigma_t.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                    </p>
                  </div>
                  <div className="min-w-[140px]">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                      W_{'{i,t}'} (wealth)
                    </p>
                    <p className="font-mono text-xs text-slate-700">
                      {stepOutputs.wealth.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                    </p>
                  </div>
                </div>
              </ChartCard>

              {/* Step 2: User submission */}
              <ChartCard title="Step 2: User submission" subtitle="Reports and deposits">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                      r_{'{i,t}'} (reports)
                    </p>
                    <p className="font-mono text-xs text-slate-700">
                      {stepOutputs.reports.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                      b_{'{i,t}'} (deposits)
                    </p>
                    <p className="font-mono text-xs text-slate-700">
                      {stepOutputs.deposits.map((v, i) => `A${i}: ${fmtNum(v, 2)}`).join(' · ')}
                    </p>
                  </div>
                </div>
              </ChartCard>

              {/* Step 3: Realised outcome */}
              <ChartCard title="Step 3: Realised outcome" subtitle="From DGP">
                <p className="font-mono text-sm text-slate-800">
                  y_t = <span className="text-blue-600 font-semibold">{fmtNum(stepOutputs.y_t, 4)}</span>
                </p>
              </ChartCard>

              {/* Step 4: Scores & effective wager */}
              <ChartCard
                title="Step 4: Scores & effective wager"
                subtitle="s_i = 1 - |y - r_i|; m_i = b_i · (λ + (1-λ)σ_i)"
              >
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">s_i (scores)</p>
                    <p className="font-mono text-xs text-slate-700">
                      {stepOutputs.scores.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">m_i (effective wager)</p>
                    <p className="font-mono text-xs text-slate-700">
                      {stepOutputs.m.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                    </p>
                  </div>
                </div>
              </ChartCard>

              {/* Step 5: Aggregation */}
              <ChartCard title="Step 5: Aggregation" subtitle="r̂ = Σ (m_i / M) · r_i">
                <p className="font-mono text-sm text-slate-800">
                  r̂_t = <span className="text-blue-600 font-semibold">{fmtNum(stepOutputs.r_hat, 4)}</span>
                </p>
              </ChartCard>

              {/* Step 6: Settlement */}
              <ChartCard
                title="Step 6: Settlement"
                subtitle="Skill payoff Π_i = m_i(1 + s_i - s̄); profit π_i = Π_i - m_i"
              >
                <p className="font-mono text-xs text-slate-700">
                  π_i: {stepOutputs.profit.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                </p>
              </ChartCard>

              {/* Step 7: Wealth update */}
              <ChartCard title="Step 7: Wealth update" subtitle="W_{i,t+1} = W_{i,t} + π_i">
                <p className="font-mono text-xs text-slate-700">
                  W_{'{i,t+1}'}: {stepOutputs.wealth_new.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                </p>
              </ChartCard>

              {/* Step 8: Skill update */}
              <ChartCard
                title="Step 8: Skill update"
                subtitle="L_i updated by EWMA; σ_{i,t+1} = f(L_i)"
              >
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">L_{'{i,t}'} (new loss)</p>
                    <p className="font-mono text-xs text-slate-700">
                      {stepOutputs.L_new.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">σ_{'{i,t+1}'} (new skill)</p>
                    <p className="font-mono text-xs text-slate-700">
                      {stepOutputs.sigma_new.map((v, i) => `A${i}: ${fmtNum(v, 3)}`).join(' · ')}
                    </p>
                  </div>
                </div>
              </ChartCard>
            </div>
          )}

          {/* Pipeline strip */}
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Round flow</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <SectionLabel type="hidden_state" />
              <span className="text-slate-400">→</span>
              <SectionLabel type="user_choice" />
              <span className="text-slate-400">+</span>
              <span className="text-slate-500"><MathBlock inline latex="y_t" /></span>
              <span className="text-slate-400">→</span>
              <SectionLabel type="mechanism_computation" />
              <span className="text-slate-400">→</span>
              <SectionLabel type="observed_output" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
