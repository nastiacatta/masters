import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell, Label,
} from 'recharts';
import { runPipeline, type PipelineResult } from '@/lib/coreMechanism/runPipeline';
import ChartCard from '@/components/dashboard/ChartCard';
import MathBlock from '@/components/dashboard/MathBlock';
import {
  AGENT_PALETTE, CHART_MARGIN, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  TOOLTIP_STYLE, fmt, downsample, agentName,
} from '@/components/lab/shared';

const DGP_ID = 'baseline' as const;
const SEED = 42;
const N_AGENTS = 6;
const ROUNDS = 200;

type SectionId = 'intermittency' | 'sybil' | 'sensitivity';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'intermittency', label: 'Intermittency' },
  { id: 'sybil', label: 'Sybil' },
  { id: 'sensitivity', label: 'Sensitivity' },
];

function SmartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: number | string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <div className="font-medium text-slate-700 text-[11px] mb-1">{typeof label === 'number' ? `Round ${label}` : label}</div>
      {payload.filter(p => p.value != null).map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}</span>
          <span className="font-mono font-medium ml-auto">{fmt(p.value, 4)}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, question, takeaway }: { title: string; question: string; takeaway: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm font-medium text-slate-700 mt-1">{question}</p>
      <p className="text-sm text-slate-500 mt-1 italic">{takeaway}</p>
    </div>
  );
}

export default function RobustnessPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('intermittency');

  // Intermittency pipeline (bursty behaviour)
  const burstyPipeline = useMemo<PipelineResult>(() => {
    return runPipeline({
      dgpId: DGP_ID,
      behaviourPreset: 'bursty',
      rounds: ROUNDS,
      seed: SEED,
      n: N_AGENTS,
    });
  }, []);

  const baselinePipeline = useMemo<PipelineResult>(() => {
    return runPipeline({
      dgpId: DGP_ID,
      behaviourPreset: 'baseline',
      rounds: ROUNDS,
      seed: SEED,
      n: N_AGENTS,
    });
  }, []);

  // Sybil pipeline
  const sybilPipeline = useMemo<PipelineResult>(() => {
    return runPipeline({
      dgpId: DGP_ID,
      behaviourPreset: 'sybil',
      rounds: ROUNDS,
      seed: SEED,
      n: N_AGENTS,
    });
  }, []);

  // Sensitivity: sweep over λ and σ_min
  const sweepData = useMemo(() => {
    const lambdas = [0.0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0];
    const sigMins = [0.05, 0.1, 0.2, 0.3, 0.5];
    const results: { lam: number; sigmaMin: number; meanError: number; gini: number }[] = [];

    for (const lam of lambdas) {
      for (const sigMin of sigMins) {
        const p = runPipeline({
          dgpId: DGP_ID,
          behaviourPreset: 'baseline',
          rounds: 100,
          seed: SEED,
          n: N_AGENTS,
          mechanism: { lam, sigma_min: sigMin } as Record<string, number>,
        });
        results.push({
          lam,
          sigmaMin: sigMin,
          meanError: p.summary.meanError,
          gini: p.summary.finalGini,
        });
      }
    }
    return results;
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Robustness</h2>
        <p className="text-sm font-medium text-slate-700 mt-2">
          Does the mechanism hold up under missingness, identity splitting, and parameter variation?
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-6">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'intermittency' && (
        <IntermittencySection bursty={burstyPipeline} baseline={baselinePipeline} />
      )}

      {activeSection === 'sybil' && (
        <SybilSection sybil={sybilPipeline} baseline={baselinePipeline} />
      )}

      {activeSection === 'sensitivity' && (
        <SensitivitySection data={sweepData} />
      )}
    </div>
    </div>
  );
}

/* ---------- Intermittency ---------- */

function IntermittencySection({ bursty, baseline }: { bursty: PipelineResult; baseline: PipelineResult }) {
  const N = bursty.traces[0]?.participated.length ?? 6;

  const skillData = useMemo(() => {
    return downsample(
      bursty.traces.map((t, i) => {
        const point: Record<string, number> = { round: i + 1 };
        for (let j = 0; j < N; j++) {
          point[`F${j + 1}`] = t.sigma_t[j];
        }
        return point;
      }),
      300,
    );
  }, [bursty.traces, N]);

  const mOverBData = useMemo(() => {
    return downsample(
      bursty.traces.map((t, i) => {
        const vals: Record<string, number> = { round: i + 1 };
        for (let j = 0; j < N; j++) {
          const b = t.deposits[j];
          vals[`F${j + 1}`] = b > 0.001 ? t.influence[j] / b : 0;
        }
        return vals;
      }),
      300,
    );
  }, [bursty.traces, N]);

  const participationData = useMemo(() => {
    return downsample(
      bursty.rounds.map(r => ({
        round: r.round,
        active: r.participation,
        rate: r.participation / N,
      })),
      300,
    );
  }, [bursty.rounds, N]);

  return (
    <div>
      <SectionHeader
        title="Intermittency"
        question="Do masking and skill bounds behave correctly when agents come and go?"
        takeaway="Under bursty participation, skill trajectories remain stable and m/b stays within [λ, 1] bounds."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <HeadlineCard label="Mean error (bursty)" value={fmt(bursty.summary.meanError, 4)} />
        <HeadlineCard label="Mean error (baseline)" value={fmt(baseline.summary.meanError, 4)} />
        <HeadlineCard label="Avg participation" value={`${(bursty.summary.meanParticipation / N * 100).toFixed(0)}%`} />
        <HeadlineCard label="Final Gini" value={fmt(bursty.summary.finalGini, 3)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Participation under intermittency" subtitle="Number of active agents per round with bursty behaviour.">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={participationData} margin={CHART_MARGIN}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, N]} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="active" name="Active agents" radius={[2, 2, 0, 0]} maxBarSize={6}>
                {participationData.map((d, i) => (
                  <Cell key={i} fill={d.rate >= 0.8 ? '#10b981' : d.rate >= 0.5 ? '#f59e0b' : '#ef4444'} opacity={0.7} />
                ))}
              </Bar>
              <ReferenceLine y={N} stroke="#94a3b8" strokeDasharray="4 4">
                <Label value="N" position="right" fill="#94a3b8" fontSize={9} />
              </ReferenceLine>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Skill trajectories under intermittency" subtitle="σᵢ over time — skill remains stable despite intermittent participation.">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={skillData} margin={CHART_MARGIN}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              {Array.from({ length: N }, (_, i) => (
                <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                  stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="m/b ratio under intermittency" subtitle="Effective wager / deposit stays within [λ, 1] bounds even with gaps.">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={mOverBData} margin={CHART_MARGIN}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1.1]} />
            <Tooltip content={<SmartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="4 4" />
            <ReferenceLine y={0.3} stroke="#94a3b8" strokeDasharray="4 4">
              <Label value="λ" position="left" fill="#94a3b8" fontSize={9} />
            </ReferenceLine>
            {Array.from({ length: N }, (_, i) => (
              <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={1.5} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* ---------- Sybil ---------- */

function SybilSection({ sybil, baseline }: { sybil: PipelineResult; baseline: PipelineResult }) {
  const sybilProfit = sybil.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const baselineProfit = baseline.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const profitRatio = baselineProfit > 0 ? sybilProfit / baselineProfit : 1;

  const wealthData = useMemo(() => {
    const N = sybil.traces[0]?.participated.length ?? 6;
    return downsample(
      sybil.traces.map((t, i) => {
        const point: Record<string, number> = { round: i + 1 };
        for (let j = 0; j < N; j++) {
          point[`F${j + 1}`] = t.wealth_after[j];
        }
        return point;
      }),
      300,
    );
  }, [sybil.traces]);

  const N = sybil.traces[0]?.participated.length ?? 6;

  return (
    <div>
      <SectionHeader
        title="Sybil resistance"
        question="Can an agent gain by splitting into multiple identities?"
        takeaway="No measurable advantage from identity splitting in the tested setup. The effective wager scales with skill, neutralising fragmentation."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <HeadlineCard label="Sybil pair wealth" value={fmt(sybilProfit, 2)} />
        <HeadlineCard label="Baseline pair wealth" value={fmt(baselineProfit, 2)} />
        <HeadlineCard label="Profit ratio" value={fmt(profitRatio, 3)} sub={profitRatio <= 1 ? 'no advantage' : 'advantage'} />
        <HeadlineCard label="Mean error (sybil)" value={fmt(sybil.summary.meanError, 4)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Wealth under sybil attack" subtitle="Agents F1–F2 are sybil clones. No sustained wealth divergence from splitting.">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={wealthData} margin={CHART_MARGIN}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="4 4">
                <Label value="W₀" position="right" fill="#94a3b8" fontSize={9} />
              </ReferenceLine>
              {Array.from({ length: N }, (_, i) => (
                <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                  stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                  strokeWidth={i < 2 ? 2.5 : 1.2}
                  strokeOpacity={i < 2 ? 1 : 0.5}
                  dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Why sybil fails</h4>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              When an agent splits into <em>k</em> identities, each clone starts with
              <MathBlock inline latex="\sigma = 0.5" /> and <MathBlock inline latex="W/k" /> wealth.
            </p>
            <p>
              The effective wager <MathBlock inline latex="m_i = b_i(\lambda + (1-\lambda)\sigma_i)" /> scales
              with skill, which the clones must individually earn. Splitting doesn't create skill.
            </p>
            <p>
              In the tested configuration, the profit ratio is approximately{' '}
              <span className="font-mono font-medium text-slate-800">{fmt(profitRatio, 3)}</span>,
              confirming no measurable advantage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sensitivity ---------- */

function SensitivitySection({ data }: { data: { lam: number; sigmaMin: number; meanError: number; gini: number }[] }) {
  const lambdas = [...new Set(data.map(d => d.lam))].sort((a, b) => a - b);
  const sigMins = [...new Set(data.map(d => d.sigmaMin))].sort((a, b) => a - b);

  const best = data.reduce((a, b) => a.meanError < b.meanError ? a : b);
  const worst = data.reduce((a, b) => a.meanError > b.meanError ? a : b);

  const barData = lambdas.map(lam => {
    const row: Record<string, number | string> = { lam: `λ=${lam}` };
    for (const sig of sigMins) {
      const point = data.find(d => d.lam === lam && d.sigmaMin === sig);
      if (point) row[`σ_min=${sig}`] = point.meanError;
    }
    return row;
  });

  const sigColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div>
      <SectionHeader
        title="Parameter sensitivity"
        question="How do λ and σ_min affect accuracy and inequality?"
        takeaway="Lower λ and lower σ_min slightly improve accuracy but can increase inequality. The mechanism is not brittle to parameter choice."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <HeadlineCard label="Best config" value={`λ=${best.lam}, σ_min=${best.sigmaMin}`} sub={`error ${fmt(best.meanError, 4)}`} />
        <HeadlineCard label="Worst config" value={`λ=${worst.lam}, σ_min=${worst.sigmaMin}`} sub={`error ${fmt(worst.meanError, 4)}`} />
        <HeadlineCard label="Error range" value={fmt(worst.meanError - best.meanError, 4)} sub="max − min" />
        <HeadlineCard label="Gini range" value={fmt(Math.max(...data.map(d => d.gini)) - Math.min(...data.map(d => d.gini)), 3)} sub="max − min" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Mean error by λ and σ_min" subtitle="Grouped by λ, coloured by σ_min. Lower is better.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ ...CHART_MARGIN, bottom: 20 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="lam" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              {sigMins.map((sig, i) => (
                <Bar
                  key={sig}
                  dataKey={`σ_min=${sig}`}
                  name={`σ_min=${sig}`}
                  fill={sigColors[i % sigColors.length]}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Accuracy vs inequality trade-off" subtitle="Each dot is one (λ, σ_min) configuration.">
          <div className="h-[300px] relative">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              {data.map((d, i) => {
                const x = 40 + (d.meanError - best.meanError) / (worst.meanError - best.meanError + 0.001) * 320;
                const giniRange = Math.max(...data.map(p => p.gini)) - Math.min(...data.map(p => p.gini));
                const y = 280 - (d.gini - Math.min(...data.map(p => p.gini))) / (giniRange + 0.001) * 260;
                const sigIdx = sigMins.indexOf(d.sigmaMin);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={6} fill={sigColors[sigIdx % sigColors.length]} opacity={0.7} />
                    <title>{`λ=${d.lam} σ_min=${d.sigmaMin}\nerror=${fmt(d.meanError, 4)} gini=${fmt(d.gini, 3)}`}</title>
                  </g>
                );
              })}
              <text x="200" y="298" textAnchor="middle" fontSize="10" fill="#94a3b8">Mean error →</text>
              <text x="12" y="150" textAnchor="middle" fontSize="10" fill="#94a3b8" transform="rotate(-90, 12, 150)">Gini →</text>
            </svg>
          </div>
        </ChartCard>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          The mechanism is not brittle: mean error varies by {fmt(worst.meanError - best.meanError, 4)} across
          the full grid. Lower <MathBlock inline latex="\lambda" /> gives skill more control over influence,
          while lower <MathBlock inline latex="\sigma_{\min}" /> allows the mechanism to more aggressively
          downweight poorly-calibrated agents — at the cost of higher concentration (Gini).
        </p>
      </div>
    </div>
  );
}

/* ---------- Shared ---------- */

function HeadlineCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-lg font-bold font-mono text-slate-800 mt-1">{value}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}
