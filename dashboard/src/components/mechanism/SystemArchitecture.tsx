import { useState, useCallback, useMemo } from 'react';
import { SEM } from '@/lib/tokens';
import MathBlock from '@/components/dashboard/MathBlock';

/* ─── Node & layer data structures ──────────────────────────────── */

interface ArchNode {
  id: string;
  label: string;
  sym: string;
  color: string;
  bg: string;
  desc: string;
  formula?: string;
}

interface Layer {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  accent: string;
  nodes: ArchNode[];
}

const LAYERS: Layer[] = [
  {
    id: 'inputs', step: 1,
    title: 'Exogenous inputs & state',
    subtitle: 'What the mechanism receives at the start of round t',
    accent: '#64748b',
    nodes: [
      { id: 'x', label: 'Private info', sym: 'xᵢ,ₜ', color: '#64748b', bg: '#f1f5f9', desc: 'Each agent\u2019s private signal about the upcoming outcome' },
      { id: 'W', label: 'Wealth', sym: 'Wᵢ,ₜ', color: SEM.wealth.main, bg: SEM.wealth.light, desc: 'Current wealth carried from the previous round' },
      { id: 'sigma', label: 'Skill state', sym: 'σᵢ,ₜ', color: SEM.skill.main, bg: SEM.skill.light, desc: 'Online skill estimate from past performance, ∈ [σ_min, 1]', formula: '\\sigma_{i,t} = \\mathrm{EWMA}(s_{i,1},\\ldots,s_{i,t-1})' },
      { id: 'theta', label: 'Parameters', sym: 'θ', color: '#475569', bg: '#f8fafc', desc: 'Mechanism parameters: λ, γ, σ_min, scoring rule, aggregation rule' },
      { id: 'task', label: 'Task / env', sym: 'env', color: '#94a3b8', bg: '#f8fafc', desc: 'The forecasting task; produces realised outcome yₜ later' },
    ],
  },
  {
    id: 'behaviour', step: 2,
    title: 'Agent decisions',
    subtitle: 'Choices made by each agent — not primitive inputs to the system',
    accent: SEM.deposit.main,
    nodes: [
      { id: 'r', label: 'Report', sym: 'rᵢ,ₜ', color: SEM.outcome.main, bg: SEM.outcome.light, desc: 'Agent i\u2019s probabilistic forecast for the outcome' },
      { id: 'b', label: 'Deposit', sym: 'bᵢ,ₜ', color: SEM.deposit.main, bg: SEM.deposit.light, desc: 'Amount of wealth agent i stakes this round' },
      { id: 'part', label: 'Participation', sym: '∈ / ∉', color: '#64748b', bg: '#f1f5f9', desc: 'Whether agent i participates in this round' },
    ],
  },
  {
    id: 'core', step: 3,
    title: 'Mechanism core',
    subtitle: 'Transforms, aggregation, and forecast publication — before outcome',
    accent: SEM.wager.main,
    nodes: [
      { id: 'elig', label: 'Eligibility', sym: '✓ / ✗', color: '#64748b', bg: '#f1f5f9', desc: 'Validate participation, check deposits, exclude absent agents' },
      { id: 'm', label: 'Eff. wager', sym: 'mᵢ,ₜ', color: SEM.wager.main, bg: SEM.wager.light, desc: 'Deposit filtered through the skill gate', formula: 'm_{i,t} = b_{i,t}\\bigl(\\lambda + (1-\\lambda)\\,\\sigma_{i,t}\\bigr)' },
      { id: 'cap', label: 'Cap / normalise', sym: 'w̃ᵢ', color: '#6366f1', bg: '#eef2ff', desc: 'Cap individual weights so no single agent dominates aggregation' },
      { id: 'agg', label: 'Aggregate', sym: 'r̂ₜ', color: SEM.aggregate.main, bg: SEM.aggregate.light, desc: 'Weighted combination of reports into the market forecast', formula: '\\hat{r}_t = \\sum_i w_i\\,r_{i,t}' },
    ],
  },
  {
    id: 'settle', step: 4,
    title: 'Outcome & settlement',
    subtitle: 'After outcome yₜ is realised — scoring, then payoffs',
    accent: SEM.payoff.main,
    nodes: [
      { id: 'y', label: 'Outcome', sym: 'yₜ', color: SEM.outcome.main, bg: SEM.outcome.light, desc: 'The realised outcome, observed after forecasts are locked in' },
      { id: 's', label: 'Score', sym: 'sᵢ,ₜ', color: SEM.score.main, bg: SEM.score.light, desc: 'How close agent i\u2019s report was to yₜ', formula: 's_{i,t} = S(r_{i,t},\\, y_t)' },
      { id: 'Pi', label: 'Settlement', sym: 'Πᵢ,ₜ', color: SEM.payoff.main, bg: SEM.payoff.light, desc: 'Payoff after scoring — zero-sum redistribution', formula: '\\Pi^{\\text{skill}}_{i,t} = m_{i,t}\\bigl(1 + s_{i,t} - \\bar{s}_t\\bigr)' },
    ],
  },
  {
    id: 'outputs', step: 5,
    title: 'Outputs & state update',
    subtitle: 'What the mechanism produces — fed back into the next round',
    accent: SEM.wealth.main,
    nodes: [
      { id: 'rhat_out', label: 'Forecast', sym: 'r̂ₜ', color: SEM.aggregate.main, bg: SEM.aggregate.light, desc: 'Published aggregate forecast for consumers' },
      { id: 'm_out', label: 'Weights', sym: 'mᵢ', color: SEM.wager.main, bg: SEM.wager.light, desc: 'Effective weights used in aggregation' },
      { id: 'Pi_out', label: 'Payoffs', sym: 'Πᵢ', color: SEM.payoff.main, bg: SEM.payoff.light, desc: 'Individual payoffs after settlement' },
      { id: 'W_next', label: 'Wealth\u2032', sym: 'Wᵢ,ₜ₊₁', color: SEM.wealth.main, bg: SEM.wealth.light, desc: 'Updated wealth for the next round', formula: 'W_{i,t+1} = W_{i,t} - b_{i,t} + \\Pi_{i,t}' },
      { id: 'sigma_next', label: 'Skill\u2032', sym: 'σᵢ,ₜ₊₁', color: SEM.skill.main, bg: SEM.skill.light, desc: 'Updated online skill estimate for the next round' },
      { id: 'diag', label: 'Diagnostics', sym: 'Neff, HHI', color: '#94a3b8', bg: '#f8fafc', desc: 'Concentration metrics, calibration, effective sample size' },
    ],
  },
];

const EDGES: [string, string][] = [
  ['x', 'r'], ['x', 'b'], ['W', 'b'], ['sigma', 'r'], ['sigma', 'b'], ['sigma', 'm'],
  ['theta', 'm'], ['theta', 'cap'], ['theta', 'agg'], ['task', 'y'],
  ['r', 'elig'], ['b', 'elig'], ['part', 'elig'],
  ['elig', 'm'], ['m', 'cap'], ['cap', 'agg'],
  ['agg', 'rhat_out'], ['cap', 'm_out'],
  ['y', 's'], ['elig', 's'], ['cap', 'Pi'], ['s', 'Pi'],
  ['Pi', 'Pi_out'], ['Pi_out', 'W_next'], ['s', 'sigma_next'],
  ['Pi', 'diag'], ['s', 'diag'],
  ['W_next', 'W'], ['sigma_next', 'sigma'],
];

const TIMELINE_STEPS: ArchNode[] = [
  { id: 't1', label: 'Observe', sym: 'xᵢ, Wᵢ, σᵢ', color: '#64748b', bg: '#f1f5f9', desc: 'Agents see private info, current wealth and skill state' },
  { id: 't2', label: 'Decide', sym: 'rᵢ, bᵢ', color: SEM.deposit.main, bg: SEM.deposit.light, desc: 'Choose forecast report and deposit amount' },
  { id: 't3', label: 'Transform', sym: 'mᵢ', color: SEM.wager.main, bg: SEM.wager.light, desc: 'Mechanism computes effective wager from deposit and skill' },
  { id: 't4', label: 'Aggregate', sym: 'r̂ₜ', color: SEM.aggregate.main, bg: SEM.aggregate.light, desc: 'Weighted pool of reports produces market forecast' },
  { id: 't5', label: 'Outcome', sym: 'yₜ', color: SEM.outcome.main, bg: SEM.outcome.light, desc: 'Realised outcome is observed (exogenous)' },
  { id: 't6', label: 'Score', sym: 'sᵢ', color: SEM.score.main, bg: SEM.score.light, desc: 'Evaluate each report against the realised outcome' },
  { id: 't7', label: 'Settle', sym: 'Πᵢ', color: SEM.payoff.main, bg: SEM.payoff.light, desc: 'Compute payoffs and redistribute deposits' },
  { id: 't8', label: 'Update', sym: 'W\u2032, σ\u2032', color: SEM.wealth.main, bg: SEM.wealth.light, desc: 'Update wealth and skill — carry to next round' },
];

/* ─── Helpers ──────────────────────────────────────────────────── */

function buildAdjacency(): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const [from, to] of EDGES) {
    if (!adj.has(from)) adj.set(from, new Set());
    if (!adj.has(to)) adj.set(to, new Set());
    adj.get(from)!.add(to);
    adj.get(to)!.add(from);
  }
  return adj;
}

/* ─── Sub-components ──────────────────────────────────────────── */

function LayerBand({ layer, hovered, selected, onHover, onSelect, adjacency }: {
  layer: Layer;
  hovered: string | null;
  selected: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  adjacency: Map<string, Set<string>>;
}) {
  const highlightedSet = useMemo(() => {
    if (!hovered) return null;
    const set = new Set<string>();
    set.add(hovered);
    adjacency.get(hovered)?.forEach(n => set.add(n));
    return set;
  }, [hovered, adjacency]);

  return (
    <div className="relative">
      {/* Layer header */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white shrink-0"
          style={{ background: layer.accent }}
        >
          {layer.step}
        </span>
        <div>
          <span className="text-xs font-bold text-slate-700">{layer.title}</span>
          <span className="text-[10px] text-slate-400 ml-2">{layer.subtitle}</span>
        </div>
      </div>

      {/* Nodes */}
      <div className="flex flex-wrap gap-2 pl-7">
        {layer.nodes.map(node => {
          const dimmed = highlightedSet && !highlightedSet.has(node.id);
          const isSelected = selected === node.id;
          return (
            <button
              key={node.id}
              type="button"
              onMouseEnter={() => onHover(node.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(node.id)}
              className="relative rounded-xl border-2 px-3 py-2 text-center min-w-[72px] cursor-pointer transition-all duration-150"
              style={{
                borderColor: isSelected ? node.color : node.color + '50',
                background: node.bg,
                opacity: dimmed ? 0.25 : 1,
                transform: isSelected ? 'scale(1.05)' : undefined,
                boxShadow: isSelected ? `0 0 0 3px ${node.color}30` : undefined,
              }}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: node.color + 'bb' }}>
                {node.label}
              </div>
              <div className="text-sm font-mono font-semibold mt-0.5" style={{ color: node.color }}>
                {node.sym}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DownArrows({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center py-1 pl-7">
      <svg width="80" height="16" viewBox="0 0 80 16">
        <path d="M20 2v8M20 10l-3-3M20 10l3-3 M40 2v8M40 10l-3-3M40 10l3-3 M60 2v8M60 10l-3-3M60 10l3-3"
          stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4" />
      </svg>
    </div>
  );
}

function NodeDetail({ node, onClose }: { node: ArchNode; onClose: () => void }) {
  return (
    <div className="rounded-xl border-2 p-4 mt-3 relative animate-in fade-in duration-200" style={{ borderColor: node.color + '40', background: node.bg + 'aa' }}>
      <button
        type="button" onClick={onClose}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/60"
      >
        ✕
      </button>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-3 h-3 rounded-full" style={{ background: node.color }} />
        <span className="text-sm font-bold" style={{ color: node.color }}>{node.label}</span>
        <span className="font-mono text-sm text-slate-600">{node.sym}</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{node.desc}</p>
      {node.formula && (
        <div className="mt-3">
          <MathBlock latex={node.formula} />
        </div>
      )}
    </div>
  );
}

function FeedbackLoop() {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-4 py-3 flex items-center gap-3">
      <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
        <path d="M16 28A12 12 0 1 1 28 16" stroke={SEM.wealth.main} strokeWidth="2" fill="none" strokeDasharray="4 3" />
        <path d="M24 16l4 0 0-4" stroke={SEM.wealth.main} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div>
        <div className="text-xs font-bold text-slate-700">Feedback to next round</div>
        <div className="text-[11px] text-slate-500">
          <span className="font-mono" style={{ color: SEM.wealth.main }}>Wᵢ,ₜ₊₁</span> and{' '}
          <span className="font-mono" style={{ color: SEM.skill.main }}>σᵢ,ₜ₊₁</span>{' '}
          become the starting state at <span className="font-mono">t+1</span>, closing the loop.
        </div>
      </div>
    </div>
  );
}

/* ─── Timeline view ───────────────────────────────────────────── */

function TimelineView({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const selectedNode = TIMELINE_STEPS.find(n => n.id === selected) ?? null;

  return (
    <div>
      <p className="text-[11px] text-slate-500 mb-3">
        Chronology within a single round. Click any step for details.
      </p>

      {/* Desktop: horizontal scroll */}
      <div className="overflow-x-auto pb-3 -mx-1">
        <div className="flex items-stretch gap-0 min-w-max px-1">
          {TIMELINE_STEPS.map((step, i) => {
            const isSelected = selected === step.id;
            return (
              <div key={step.id} className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => onSelect(step.id)}
                  className="relative rounded-xl border-2 px-3 py-3 text-center min-w-[90px] transition-all duration-150 cursor-pointer"
                  style={{
                    borderColor: isSelected ? step.color : step.color + '40',
                    background: step.bg,
                    transform: isSelected ? 'scale(1.05)' : undefined,
                    boxShadow: isSelected ? `0 0 0 3px ${step.color}30` : undefined,
                    zIndex: isSelected ? 10 : 1,
                  }}
                >
                  <div className="text-[8px] font-bold text-slate-400 mb-0.5">{i + 1}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: step.color + 'cc' }}>
                    {step.label}
                  </div>
                  <div className="text-sm font-mono font-semibold mt-1" style={{ color: step.color }}>
                    {step.sym}
                  </div>
                </button>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className="flex items-center px-0.5 shrink-0">
                    <svg width="24" height="16" viewBox="0 0 24 16">
                      <path d="M2 8h16M14 4l4 4-4 4" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}

          {/* Feedback arrow wrapping back */}
          <div className="flex items-center pl-2 shrink-0">
            <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 bg-slate-50/80">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M10 16A6 6 0 1 1 16 10" stroke={SEM.wealth.main} strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
                <path d="M14 10l2 0 0-2" stroke={SEM.wealth.main} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">t+1</span>
            </div>
          </div>
        </div>
      </div>

      {selectedNode && (
        <NodeDetail node={selectedNode} onClose={() => onSelect('')} />
      )}

      <p className="text-[10px] text-slate-400 mt-3 italic">
        The outcome node sits <em>before</em> scoring and payoff — the mechanism cannot score before it observes yₜ.
      </p>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

type DiagramView = 'architecture' | 'timeline';

export default function SystemArchitecture() {
  const [view, setView] = useState<DiagramView>('architecture');
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const adjacency = useMemo(buildAdjacency, []);

  const allNodes = useMemo(() => {
    const map = new Map<string, ArchNode>();
    for (const layer of LAYERS) {
      for (const node of layer.nodes) {
        map.set(node.id, node);
      }
    }
    return map;
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelected(prev => prev === id ? null : id);
  }, []);

  const selectedArchNode = selected ? allNodes.get(selected) ?? null : null;

  return (
    <div className="space-y-4">
      {/* View tabs */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {([
            { id: 'architecture' as DiagramView, label: 'System architecture' },
            { id: 'timeline' as DiagramView, label: 'Within-round timing' },
          ]).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setView(tab.id); setSelected(null); setHovered(null); }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === tab.id ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-400">
          {view === 'architecture'
            ? 'Hover to trace connections. Click a node for its definition.'
            : 'Click a step for details.'}
        </span>
      </div>

      {/* Architecture view */}
      {view === 'architecture' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
          {LAYERS.map((layer, i) => (
            <div key={layer.id}>
              <LayerBand
                layer={layer}
                hovered={hovered}
                selected={selected}
                onHover={setHovered}
                onSelect={handleSelect}
                adjacency={adjacency}
              />
              {i < LAYERS.length - 1 && (
                <DownArrows accent={LAYERS[i + 1].accent} />
              )}
            </div>
          ))}

          {/* Feedback loop */}
          <div className="mt-3">
            <FeedbackLoop />
          </div>

          {/* Selected node detail */}
          {selectedArchNode && (
            <NodeDetail node={selectedArchNode} onClose={() => setSelected(null)} />
          )}

          <p className="text-[10px] text-slate-400 pt-2 leading-relaxed">
            <strong>Reading guide:</strong> mᵢ is <em>not</em> an agent input — it is produced by the mechanism from bᵢ and σᵢ.
            The outcome yₜ arrives <em>after</em> aggregation, so scoring and settlement depend on it.
            Updated wealth and skill feed back into the next round, making the system dynamic, not one-shot.
          </p>
        </div>
      )}

      {/* Timeline view */}
      {view === 'timeline' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <TimelineView selected={selected} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}
