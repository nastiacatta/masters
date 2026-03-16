import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { runPipeline } from '@/lib/coreMechanism/runPipeline';
import { DEFAULT_BUILDER_SELECTIONS, type BuilderSelections } from '@/lib/coreMechanism/runRoundComposable';
import type { SimParams } from '@/lib/mechanismExplorer/types';
import { SEM } from '@/lib/tokens';
import MathBlock from '@/components/dashboard/MathBlock';
import ScenarioBuilder from '@/components/lab/ScenarioBuilder';
import MechanismChain from '@/components/lab/MechanismChain';
import RoundReplayPanel from '@/components/lab/RoundReplayPanel';
import ValidationPanel from '@/components/lab/ValidationPanel';

const INVARIANTS = [
  { label: 'Budget balanced', desc: 'Total payouts equal total effective wagers in the skill pool.', color: SEM.payoff.main },
  { label: 'Cashflow identity', desc: 'Wealth change = payoff − deposit for every agent every round.', color: SEM.wealth.main },
  { label: 'Profit bounded', desc: 'No agent can gain more than the total pool of effective wagers.', color: SEM.wager.main },
  { label: 'Absent excluded', desc: 'Missing agents get mᵢ = 0, no report, no payoff.', color: SEM.score.main },
];

function PipelineArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0 text-slate-300">
      <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function PipelineNode({ label, sym, color, bgColor }: { label: string; sym: string; color: string; bgColor: string }) {
  return (
    <div
      className="shrink-0 rounded-xl border-2 px-3 py-2 text-center min-w-[80px]"
      style={{ borderColor: color + '40', background: bgColor }}
    >
      <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: color + 'bb' }}>{label}</div>
      <div className="text-sm font-mono font-semibold mt-0.5" style={{ color }}>{sym}</div>
    </div>
  );
}

export default function MechanismPage() {
  const {
    selectedDGP, setSelectedDGP,
    selectedBehaviourPreset, setSelectedBehaviourPreset,
    rounds, nAgents, seed, setSeed,
    setRounds, setNAgents,
    selectedRound, setSelectedRound,
  } = useStore();

  const [builder, setBuilder] = useState<BuilderSelections>(DEFAULT_BUILDER_SELECTIONS);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [simParams, setSimParams] = useState<SimParams>({
    T: rounds, N: nAgents, gamma: 1.5, lambda: 0.3, eta: 1.0, f: 0.4, U: 50,
  });

  const params: SimParams = useMemo(
    () => ({ ...simParams, T: rounds, N: nAgents }),
    [simParams, rounds, nAgents],
  );

  const setParams = (next: SimParams) => {
    if (next.T !== rounds) setRounds(next.T);
    if (next.N !== nAgents) setNAgents(next.N);
    setSimParams(next);
  };

  const pipeline = useMemo(() => {
    return runPipeline({
      dgpId: selectedDGP,
      behaviourPreset: selectedBehaviourPreset,
      rounds,
      seed,
      n: nAgents,
      builder,
      mechanism: {
        gamma: simParams.gamma,
        lam: simParams.lambda,
        eta: simParams.eta,
        baseDepositFraction: simParams.f,
        utilityPool: simParams.U,
      },
    });
  }, [selectedDGP, selectedBehaviourPreset, rounds, seed, nAgents, builder,
      simParams.gamma, simParams.lambda, simParams.eta, simParams.f, simParams.U]);

  const currentRound = Math.max(0, Math.min(selectedRound, pipeline.traces.length - 1));

  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Mechanism</h2>
        <p className="text-sm font-medium text-slate-700 mt-2">
          How does one round work, and why is the mechanism well-defined?
        </p>
      </div>

      {/* Pipeline diagram */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6 overflow-x-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Round pipeline</h3>
        <div className="flex items-center gap-1.5 min-w-max pb-1">
          <PipelineNode label="Forecast" sym="rᵢ" color={SEM.outcome.main} bgColor={SEM.outcome.light} />
          <PipelineArrow />
          <PipelineNode label="Deposit" sym="bᵢ" color={SEM.deposit.main} bgColor={SEM.deposit.light} />
          <PipelineArrow />
          <PipelineNode label="Skill" sym="σᵢ" color={SEM.skill.main} bgColor={SEM.skill.light} />
          <PipelineArrow />
          <PipelineNode label="Eff. wager" sym="mᵢ" color={SEM.wager.main} bgColor={SEM.wager.light} />
          <PipelineArrow />
          <PipelineNode label="Aggregate" sym="r̂" color={SEM.aggregate.main} bgColor={SEM.aggregate.light} />
          <PipelineArrow />
          <PipelineNode label="Settlement" sym="Πᵢ" color={SEM.payoff.main} bgColor={SEM.payoff.light} />
          <PipelineArrow />
          <PipelineNode label="Wealth" sym="Wᵢ′" color={SEM.wealth.main} bgColor={SEM.wealth.light} />
        </div>
      </div>

      {/* Core equations */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <MathBlock
          label="Effective wager"
          latex="m_{i,t} = b_{i,t}\bigl(\lambda + (1-\lambda)\,\sigma_{i,t}\bigr)"
          caption="Deposit filtered through the skill gate. When λ = 1, pure stake; when λ = 0, skill fully modulates."
          accent
        />
        <MathBlock
          label="Skill-pool payoff"
          latex="\Pi^{\text{skill}}_{i,t} = m_{i,t}\left(1 + s_{i,t} - \bar{s}_t\right)"
          caption="Zero-sum redistribution among participants. Better-than-average scorers gain; worse lose."
          accent
        />
      </div>

      {/* Invariant chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {INVARIANTS.map(({ label, desc, color }) => (
          <div
            key={label}
            className="rounded-xl border-2 px-4 py-3"
            style={{ borderColor: color + '30', background: color + '08' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: color }}>✓</span>
              <span className="text-xs font-semibold text-slate-800">{label}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Controls toggle + panel */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Interactive round explorer</h3>
        <button
          onClick={() => setControlsOpen(!controlsOpen)}
          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
        >
          {controlsOpen ? 'Hide controls' : 'Show controls'}
        </button>
        <button
          onClick={() => setShowValidation(!showValidation)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showValidation ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {showValidation ? 'Show round replay' : 'Show invariant checks'}
        </button>
      </div>

      <div className="flex gap-4">
        {/* Controls sidebar */}
        <AnimatePresence initial={false}>
          {controlsOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 264, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden"
            >
              <ScenarioBuilder
                dgp={selectedDGP}
                setDGP={setSelectedDGP}
                builder={builder}
                setBuilder={setBuilder}
                behaviourPreset={selectedBehaviourPreset}
                setBehaviourPreset={setSelectedBehaviourPreset}
                params={params}
                setParams={setParams}
                seed={seed}
                setSeed={setSeed}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Live mechanism chain for current round */}
          {pipeline.traces[currentRound] && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Live state — Round {currentRound + 1}
              </h4>
              <MechanismChain
                trace={pipeline.traces[currentRound]}
                selectedAgent={selectedAgent}
                onSelectAgent={setSelectedAgent}
              />
            </div>
          )}

          {showValidation ? (
            <ValidationPanel pipeline={pipeline} />
          ) : (
            <RoundReplayPanel
              pipeline={pipeline}
              currentRound={currentRound}
              setCurrentRound={setSelectedRound}
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
            />
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
