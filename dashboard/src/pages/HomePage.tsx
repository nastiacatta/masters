import { Link } from 'react-router-dom';
import { useState } from 'react';
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
  const [showBehaviourDetails, setShowBehaviourDetails] = useState(false);

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
      <StepSection step={1} title="System overview" description="DGP → Behaviour → Core">
        <div className="grid gap-3 pt-2">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">DGP</p>
              <p className="text-sm text-slate-800 mt-1">What world is generated.</p>
              <p className="text-xs text-slate-600 mt-1">Exogenous and endogenous outcome models.</p>
            </div>
            <div className="hidden sm:flex items-center justify-center text-slate-400 text-lg font-semibold">→</div>
            <button
              type="button"
              onClick={() => setShowBehaviourDetails((v) => !v)}
              className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-left transition-colors hover:bg-violet-100"
              aria-expanded={showBehaviourDetails}
              aria-label="Toggle behaviour details"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Behaviour</p>
              <p className="text-sm text-slate-800 mt-1">What users do in that world.</p>
              <p className="text-xs text-slate-600 mt-1">Participation, beliefs, reporting, staking, identity strategy.</p>
              <p className="text-xs text-violet-700 mt-2 font-medium">
                {showBehaviourDetails ? 'Hide behaviour details ↑' : 'Show behaviour details ↓'}
              </p>
            </button>
            <div className="hidden sm:flex items-center justify-center text-slate-400 text-lg font-semibold">→</div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Core</p>
              <p className="text-sm text-slate-800 mt-1">How the market responds.</p>
              <p className="text-xs text-slate-600 mt-1">Aggregation, scoring, settlement, and skill update.</p>
            </div>
          </div>
          {showBehaviourDetails && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Participation and timing</p>
                <p className="text-sm text-slate-800 mt-1">Intermittent, bursty, and selective entry.</p>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Belief and reporting</p>
                <p className="text-sm text-slate-800 mt-1">Precision, bias, calibration, truthful vs strategic reporting.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Staking behaviour</p>
                <p className="text-sm text-slate-800 mt-1">Wealth constraints, confidence, and bankroll management.</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Identity and strategy</p>
                <p className="text-sm text-slate-800 mt-1">Single account, sybils, collusion, adaptation over time.</p>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <MathBlock inline latex="\text{DGP} \;\rightarrow\; \text{Behaviour} \;\rightarrow\; \text{Core}" />
          </div>
        </div>
      </StepSection>

      <StepSection step={2} title="Round timeline" description="How one round is processed.">
        <div className="grid gap-3 pt-2">
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">1. Submission</p>
            <p className="text-sm text-slate-800 mt-1">Forecaster submits a forecast and a wager.</p>
            <p className="text-sm text-slate-700 mt-1">The wager reflects current commitment in this round.</p>
          </div>

          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">2. Skill-adjusted wager</p>
            <MathBlock latex="m_{i,t}=b_{i,t}\left(\lambda+(1-\lambda)\sigma_{i,t}\right)" />
            <div className="grid sm:grid-cols-3 gap-2">
              <div className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs text-slate-700">
                <MathBlock inline latex="b_{i,t}" className="font-mono" />: submitted wager
              </div>
              <div className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs text-slate-700">
                <MathBlock inline latex="\sigma_{i,t}" className="font-mono" />: skill estimate fixed before the round
              </div>
              <div className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs text-slate-700">
                <MathBlock inline latex="m_{i,t}" className="font-mono" />: effective wager, the amount that actually counts
              </div>
            </div>
            <p className="text-sm text-slate-700">Lower skill reduces influence, but does not remove downside.</p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">3. Aggregation</p>
            <MathBlock latex="\hat{m}_{i,t}=\frac{m_{i,t}}{\sum_{j\in I_t}m_{j,t}},\quad \hat{r}_t=\sum_{i\in I_t}\hat{m}_{i,t}r_{i,t}" />
            <p className="text-sm text-slate-700">Effective wagers are converted into forecast weights.</p>
            <p className="text-sm text-slate-700">The market forecast is a weighted combination of submitted forecasts.</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">4. Outcome, payoff, and learning</p>
            <MathBlock latex="\Pi_{i,t}=m_{i,t}\left(1+s(r_{i,t},y_t)-\frac{\sum_{j\in I_t}m_{j,t}s(r_{j,t},y_t)}{\sum_{j\in I_t}m_{j,t}}\right)" />
            <p className="text-sm text-slate-700">Payoff depends on relative forecast performance.</p>
            <p className="text-sm text-slate-700">Greater influence also means greater payoff exposure.</p>
            <MathBlock latex="\sigma_{i,t+1}=\sigma_{\min}+(1-\sigma_{\min})e^{-\gamma L_{i,t}}" />
            <p className="text-sm text-slate-700">Realised performance updates next-round skill.</p>
          </div>
        </div>
      </StepSection>

      <StepSection step={3} title="The claims" description="What this thesis argues.">
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

      <StepSection step={4} title="Where to go" description="Follow the flow: Mechanism → Comparisons → Robustness.">
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
