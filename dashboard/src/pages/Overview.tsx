import { Link } from 'react-router-dom';
import { useExplorer } from '@/lib/explorerStore';
import PageHeader from '@/components/dashboard/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';

export default function Overview() {
  const { lastPipelineResult } = useExplorer();
  const summary = lastPipelineResult?.summary;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader
        title="Overview"
        description="This project studies a repeated prediction market for probabilistic forecasting."
        question="Why adaptive skill and stake?"
      />
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Project at a glance</h3>
          <p className="text-sm text-slate-600 mt-1">
            The mechanism combines self-financed wagering with an online estimate of forecaster reliability, learned from past realised outcomes.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Funding</p>
            <p className="text-sm text-slate-700 mt-1">Self-financed wagering each round.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weighting signal</p>
            <p className="text-sm text-slate-700 mt-1">Current influence depends on both stake and learned skill.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Research aim</p>
            <p className="text-sm text-slate-700 mt-1">Test whether history-aware weighting improves forecast aggregation.</p>
          </div>
        </div>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
          <li>Heterogeneous forecasters with different reliability profiles.</li>
          <li>Intermittent participation where agents are not always active.</li>
          <li>Changing conditions that induce non-stationary dynamics.</li>
        </ul>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">How one round works</h3>
          <p className="text-sm text-slate-600 mt-1">
            Each round follows the same five-step flow: submit, weight, aggregate, settle, then update skill.
          </p>
        </div>
        <div className="grid gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">1) Submit</p>
            <p className="text-sm text-slate-700 mt-1">Each forecaster submits a deposit and a forecast.</p>
            <p className="text-xs font-mono text-slate-600 mt-2">(b_i,t, r_i,t)</p>
            <p className="text-xs text-slate-500 mt-1">b_i,t = current deposit, r_i,t = current forecast.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">2) Skill-adjusted wager</p>
            <p className="text-sm text-slate-700 mt-1">Deposits are adjusted by skill fixed before the round.</p>
            <p className="text-xs font-mono text-slate-600 mt-2">m_i,t = b_i,t * (lambda + (1 - lambda) * sigma_i,t)</p>
            <p className="text-xs text-slate-500 mt-1">lambda is a floor so some of every deposit still counts.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">3) Influence and aggregate forecast</p>
            <p className="text-sm text-slate-700 mt-1">Effective wagers are normalised into influence weights.</p>
            <p className="text-xs font-mono text-slate-600 mt-2">m_hat_i,t = m_i,t / sum_j m_j,t</p>
            <p className="text-xs font-mono text-slate-600 mt-1">r_hat_t = sum_i (m_hat_i,t * r_i,t)</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">4) Outcome and payoff</p>
            <p className="text-sm text-slate-700 mt-1">After the outcome is realised, payoffs are settled by relative score quality.</p>
            <p className="text-xs font-mono text-slate-600 mt-2">Pi_i,t = m_i,t * (1 + s(r_i,t, y_t) - weighted_avg_j s(r_j,t, y_t))</p>
            <p className="text-xs text-slate-500 mt-1">Payoff depends on how well each forecaster scores versus others.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">5) Skill update for next round</p>
            <p className="text-sm text-slate-700 mt-1">Realised loss updates the next-round skill value.</p>
            <p className="text-xs font-mono text-slate-600 mt-2">sigma_i,t+1 = sigma_min + (1 - sigma_min) * exp(-gamma * L_i,t)</p>
            <p className="text-xs text-slate-500 mt-1">Next round starts with this updated skill.</p>
          </div>
        </div>
      </section>
      <p className="text-sm text-slate-600">
        Start with the <Link to="/walkthrough" className="text-teal-600 hover:underline font-medium">Walkthrough</Link> to explore the mechanism; use <Link to="/experiments" className="text-teal-600 hover:underline font-medium">Experiments</Link> for cross-scenario evidence and <Link to="/validation" className="text-teal-600 hover:underline font-medium">Validation</Link> for invariants and robustness.
      </p>
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Mean error" value={summary.meanError.toFixed(4)} />
          <MetricCard label="Participation" value={summary.meanParticipation.toFixed(2)} />
          <MetricCard label="N_eff" value={summary.meanNEff.toFixed(2)} />
          <MetricCard label="Final Gini" value={summary.finalGini.toFixed(3)} />
        </div>
      )}
      {!summary && (
        <p className="text-sm text-slate-500">
          Run the pipeline from the Walkthrough page to see results here.
        </p>
      )}
    </div>
  );
}
