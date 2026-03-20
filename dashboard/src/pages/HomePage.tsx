import { Link } from 'react-router-dom';
import { SEM } from '@/lib/tokens';
import MathBlock from '@/components/dashboard/MathBlock';
import StepSection from '@/components/dashboard/StepSection';

function ClaimCard({
  number,
  title,
  body,
  link,
  color,
}: {
  number: number;
  title: string;
  body: string;
  link: string;
  color: string;
}) {
  return (
    <Link
      to={link}
      className="group block rounded-2xl border-2 p-6 transition-all hover:shadow-lg"
      style={{ borderColor: color + '40', background: color + '08' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: color + '20', color }}
        >
          {number}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{body}</p>
          <span className="inline-block mt-3 text-xs font-medium transition-colors" style={{ color }}>
            Explore evidence →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
        Adaptive Skill and Stake in Forecast Markets
      </h1>
      <p className="text-lg text-slate-500 mt-4 max-w-2xl">
        Stake filtered by online skill from past forecasts.
      </p>

      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <MathBlock
          inline
          latex="m_{i,t} = b_{i,t}\bigl(\lambda + (1-\lambda)\,\sigma_{i,t}\bigr)"
        />
      </div>

      <div className="mt-10">
      <StepSection step={1} title="Round timeline" description="How one round is processed.">
        <div className="grid gap-3 pt-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">1. Submission</p>
            <p className="text-sm text-slate-700 mt-1">Forecaster submits a deposit and a forecast.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">2. Skill adjustment</p>
            <MathBlock latex="m_{i,t}=b_{i,t}\left(\lambda+(1-\lambda)\sigma_{i,t}\right)" />
            <p className="text-sm text-slate-700">Current deposit is adjusted by pre-round skill.</p>
            <p className="text-sm text-slate-600">Low skill reduces influence, but does not remove downside.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">3. Aggregation</p>
            <MathBlock latex="\hat{m}_{i,t}=\frac{m_{i,t}}{\sum_{j\in I_t}m_{j,t}},\quad \hat{r}_t=\sum_{i\in I_t}\hat{m}_{i,t}r_{i,t}" />
            <p className="text-sm text-slate-700">Effective wagers are normalised into forecast weights.</p>
            <p className="text-sm text-slate-600">The market forecast is a weighted combination of submitted forecasts.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">4. Settlement and update</p>
            <MathBlock latex="\Pi_{i,t}=m_{i,t}\left(1+s(r_{i,t},y_t)-\frac{\sum_{j\in I_t}m_{j,t}s(r_{j,t},y_t)}{\sum_{j\in I_t}m_{j,t}}\right)" />
            <p className="text-sm text-slate-700">Payoffs depend on relative forecast performance.</p>
            <MathBlock latex="\sigma_{i,t+1}=\sigma_{\min}+(1-\sigma_{\min})e^{-\gamma L_{i,t}}" />
            <p className="text-sm text-slate-600">Realised performance updates next-round skill.</p>
          </div>
        </div>
      </StepSection>

      <StepSection step={2} title="The claims" description="What this thesis argues.">
        <div className="grid gap-4 pt-2">
          <ClaimCard
            number={1}
            title="The mechanism is coherent"
            body="Deposits, wagers, aggregation, payouts — core accounting holds."
            link="/mechanism"
            color={SEM.wager.main}
          />
          <ClaimCard
            number={2}
            title="Skill weighting changes allocation"
            body="Attenuates noisy stake; equal weighting remains a strong benchmark."
            link="/results"
            color={SEM.skill.main}
          />
        </div>
      </StepSection>

      <StepSection step={3} title="Where to go" description="Follow the flow: Mechanism → Comparisons → Robustness.">
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/mechanism" className="rounded-lg border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
            1. Mechanism
          </Link>
          <Link to="/results" className="rounded-lg border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
            2. Comparisons
          </Link>
          <Link to="/robustness" className="rounded-lg border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
            3. Robustness
          </Link>
        </div>
      </StepSection>
      </div>
    </div>
    </div>
  );
}
