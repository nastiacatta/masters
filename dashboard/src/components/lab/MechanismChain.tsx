import { motion } from 'framer-motion';
import type { RoundTrace } from '@/lib/coreMechanism/runRoundComposable';
import { AGENT_PALETTE, fmt } from './shared';

interface MechanismChainProps {
  trace: RoundTrace;
  selectedAgent: number | null;
  onSelectAgent: (i: number | null) => void;
}

interface ChainNode {
  key: string;
  label: string;
  sym: string;
  getValue: (trace: RoundTrace, agent: number) => number;
  getAggregate: (trace: RoundTrace) => number;
  color: string;
  bgColor: string;
}

const CHAIN_NODES: ChainNode[] = [
  {
    key: 'deposit', label: 'Deposit', sym: 'bᵢ',
    getValue: (t, i) => t.deposits[i],
    getAggregate: (t) => t.deposits.reduce((a, b) => a + b, 0),
    color: '#0ea5e9', bgColor: '#f0f9ff',
  },
  {
    key: 'influence', label: 'Wager', sym: 'mᵢ',
    getValue: (t, i) => t.influence[i],
    getAggregate: (t) => t.influence.reduce((a, b) => a + b, 0),
    color: '#6366f1', bgColor: '#eef2ff',
  },
  {
    key: 'aggregate', label: 'Aggregate', sym: 'r̂',
    getValue: () => 0,
    getAggregate: (t) => t.r_hat,
    color: '#0d9488', bgColor: '#f0fdfa',
  },
  {
    key: 'score', label: 'Score', sym: 'sᵢ',
    getValue: (t, i) => t.scores[i],
    getAggregate: (t) => t.scores.reduce((a, b) => a + b, 0) / Math.max(1, t.participated.filter(Boolean).length),
    color: '#f59e0b', bgColor: '#fffbeb',
  },
  {
    key: 'payoff', label: 'Payoff', sym: 'Πᵢ',
    getValue: (t, i) => t.profit[i],
    getAggregate: (t) => t.profit.reduce((a, b) => a + b, 0),
    color: '#10b981', bgColor: '#ecfdf5',
  },
  {
    key: 'skill', label: 'Skill update', sym: 'σᵢ′',
    getValue: (t, i) => t.sigma_new[i],
    getAggregate: (t) => t.sigma_new.reduce((a, b) => a + b, 0) / t.sigma_new.length,
    color: '#8b5cf6', bgColor: '#f5f3ff',
  },
  {
    key: 'wealth', label: 'Wealth', sym: 'Wᵢ′',
    getValue: (t, i) => t.wealth_after[i],
    getAggregate: (t) => t.wealth_after.reduce((a, b) => a + b, 0),
    color: '#ec4899', bgColor: '#fdf2f8',
  },
];

export default function MechanismChain({ trace, selectedAgent, onSelectAgent }: MechanismChainProps) {
  const N = trace.participated.length;
  const agentIdx = selectedAgent;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CHAIN_NODES.map((node, idx) => (
          <div key={node.key} className="contents">
            {idx > 0 && (
              <div className="shrink-0 flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-300">
                  <path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="shrink-0 rounded-xl border-2 px-4 py-3 min-w-[110px] text-center cursor-default transition-shadow hover:shadow-md"
              style={{ borderColor: node.color + '40', background: node.bgColor }}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: node.color + 'aa' }}>
                {node.label}
              </div>
              <div className="text-lg font-bold font-mono mt-0.5" style={{ color: node.color }}>
                {agentIdx != null && node.key !== 'aggregate'
                  ? fmt(node.getValue(trace, agentIdx), node.key === 'payoff' ? 2 : 3)
                  : fmt(node.getAggregate(trace), node.key === 'aggregate' ? 4 : 2)
                }
              </div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: node.color + '99' }}>
                {node.sym}
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onSelectAgent(null)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
            agentIdx == null
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          All agents
        </button>
        {Array.from({ length: N }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectAgent(agentIdx === i ? null : i)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
              agentIdx === i
                ? 'text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            style={agentIdx === i ? { background: AGENT_PALETTE[i % AGENT_PALETTE.length] } : undefined}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: AGENT_PALETTE[i % AGENT_PALETTE.length] }} />
            F{i + 1}
            {!trace.participated[i] && <span className="text-[9px] opacity-60">(out)</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
