import PageHeader from '@/components/dashboard/PageHeader';
import MathBlock from '@/components/dashboard/MathBlock';
import SectionLabel from '@/components/dashboard/SectionLabel';
import ChartCard from '@/components/dashboard/ChartCard';

export default function CoreOverview() {
  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Core mechanism"
        description="The mechanism is a deterministic state machine. It consumes per-round user actions and the realised outcome, and returns updated state and logs. No behaviour, no DGP—only equations and timing."
      />

      {/* A. Round contract — one large pipeline at the top */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <SectionLabel type="mechanism_computation" />
          Round contract
        </h3>
        <MathBlock accent label="One round" latex="(\text{state}_t, \text{RoundInput}_t, y_t) \to (\text{state}_{t+1}, \text{logs}_t)" />
        <p className="text-xs text-slate-500 mt-2">
          Round input = set of (account_id, participation flag, report, stake, optional metadata). The mechanism does not observe user beliefs or strategies—only these actions and the outcome y_t.
        </p>
      </div>

      {/* B. Objects and timing */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Objects and timing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ChartCard title="Pre-round state" subtitle="Hidden state (fixed before reports in round t)">
            <div className="space-y-2 text-xs font-mono text-slate-600">
              <p>L_{'_{i,t-1}'} — EWMA loss</p>
              <p>σ_{'_{i,t}'} — skill (from L_{'_{i,t-1}'})</p>
              <p>W_{'_{i,t}'} — wealth</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              σ_{'_{i,t}'} is fixed before reports in round t (no double-counting of current-round performance).
            </p>
          </ChartCard>

          <ChartCard title="User submission" subtitle="User choice">
            <div className="space-y-2 text-xs font-mono text-slate-600">
              <p>a_{'_{i,t}'} — participate (0/1)</p>
              <p>r_{'_{i,t}'} — report (point or quantiles)</p>
              <p>b_{'_{i,t}'} — deposit / stake</p>
            </div>
          </ChartCard>

          <ChartCard title="Realised outcome" subtitle="Observed output">
            <p className="text-xs font-mono text-slate-600">y_t</p>
          </ChartCard>

          <ChartCard title="Post-round outputs" subtitle="Mechanism computation → Observed output">
            <div className="space-y-2 text-xs font-mono text-slate-600">
              <p>m_{'_{i,t}'} — effective wager</p>
              <p>Π_{'_{i,t}'} — gross payoff</p>
              <p>π_{'_{i,t}'} — profit</p>
              <p>L_{'_{i,t}'} — updated loss (→ σ_{'_{i,t+1}'})</p>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Single pipeline strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Round flow</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <SectionLabel type="hidden_state" />
          <span className="text-slate-400">→</span>
          <SectionLabel type="user_choice" />
          <span className="text-slate-400">+</span>
          <span className="text-slate-500">y_t</span>
          <span className="text-slate-400">→</span>
          <SectionLabel type="mechanism_computation" />
          <span className="text-slate-400">→</span>
          <SectionLabel type="observed_output" />
        </div>
      </div>
    </div>
  );
}
