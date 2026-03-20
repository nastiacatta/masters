import { Link } from 'react-router-dom';
import { useExplorer } from '@/lib/explorerStore';
import PageHeader from '@/components/dashboard/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';
import MathBlock from '@/components/dashboard/MathBlock';

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
          <h3 className="text-sm font-semibold text-slate-900">Round timeline</h3>
          <p className="text-sm text-slate-600 mt-1">
            A clear step-by-step view of how one market round is processed.
          </p>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">1. Submission</p>
            <p className="text-sm text-slate-700 mt-1">Forecaster submits a deposit and a forecast.</p>
            <MathBlock inline latex="(b_{i,t}, r_{i,t})" className="text-xs text-slate-700" />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">2. Skill adjustment</p>
            <MathBlock latex="m_{i,t}=b_{i,t}\left(\lambda+(1-\lambda)\sigma_{i,t}\right)" />
            <p className="text-sm text-slate-700">Current deposit is adjusted by pre-round skill.</p>
            <p className="text-sm text-slate-600">Low skill reduces influence, but does not remove downside.</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">3. Aggregation</p>
            <MathBlock latex="\hat{m}_{i,t}=\frac{m_{i,t}}{\sum_{j\in I_t}m_{j,t}},\quad \hat{r}_t=\sum_{i\in I_t}\hat{m}_{i,t}r_{i,t}" />
            <p className="text-sm text-slate-700">Effective wagers are normalised into forecast weights.</p>
            <p className="text-sm text-slate-600">The market forecast is a weighted combination of submitted forecasts.</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">4. Settlement and update</p>
            <MathBlock latex="\Pi_{i,t}=m_{i,t}\left(1+s(r_{i,t},y_t)-\frac{\sum_{j\in I_t}m_{j,t}s(r_{j,t},y_t)}{\sum_{j\in I_t}m_{j,t}}\right)" />
            <p className="text-sm text-slate-700">Payoffs depend on relative forecast performance.</p>
            <MathBlock latex="\sigma_{i,t+1}=\sigma_{\min}+(1-\sigma_{\min})e^{-\gamma L_{i,t}}" />
            <p className="text-sm text-slate-600">Realised performance updates next-round skill.</p>
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
