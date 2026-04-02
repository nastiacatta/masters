import { Link } from 'react-router-dom';
import MathBlock from '@/components/dashboard/MathBlock';

/* ── Subtle palette — no rainbow, just slate + one accent per layer ── */
const LAYER = {
  dgp:  { border: 'border-slate-300', bg: 'bg-slate-50',  text: 'text-slate-600',  label: 'text-slate-500' },
  beh:  { border: 'border-slate-300', bg: 'bg-slate-50',  text: 'text-slate-600',  label: 'text-slate-500' },
  core: { border: 'border-slate-300', bg: 'bg-slate-50',  text: 'text-slate-600',  label: 'text-slate-500' },
} as const;

const NAV_LINKS = [
  { to: '/results',    label: 'Results',    desc: 'Accuracy, calibration, concentration' },
  { to: '/mechanism',  label: 'Mechanism',  desc: 'Interactive round-by-round walkthrough' },
  { to: '/robustness', label: 'Robustness', desc: 'Intermittency, sybil, sensitivity' },
] as const;

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24 space-y-20">

        {/* ═══ Hero ═══ */}
        <header className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Master's thesis — supplementary dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug tracking-tight max-w-2xl">
            Can combining stake with an online, time-varying skill layer improve
            aggregate forecasts under non-stationarity, strategic behaviour, and
            intermittent participation?
          </h1>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            A mechanism that filters each forecaster's wager through a learned
            skill estimate, then aggregates, scores, and settles — all in a
            single repeated game.
          </p>
        </header>

        {/* ═══ System overview — 3-column flow ═══ */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            System overview
          </h2>

          <div className="grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-y-3 gap-x-2">
            {/* DGP */}
            <div className={`rounded-lg border ${LAYER.dgp.border} ${LAYER.dgp.bg} px-4 py-4`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${LAYER.dgp.label}`}>DGP</p>
              <p className={`text-sm mt-1 ${LAYER.dgp.text}`}>Generates the world</p>
              <p className="text-[11px] text-slate-400 mt-1">Exogenous &amp; endogenous outcomes</p>
            </div>
            <div className="hidden sm:flex items-center justify-center text-slate-300 text-sm select-none pt-4">→</div>

            {/* Behaviour */}
            <div className={`rounded-lg border ${LAYER.beh.border} ${LAYER.beh.bg} px-4 py-4`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${LAYER.beh.label}`}>Behaviour</p>
              <p className={`text-sm mt-1 ${LAYER.beh.text}`}>What agents do</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Participation', 'Beliefs', 'Reporting', 'Staking', 'Identity'].map((c) => (
                  <span key={c} className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-center text-slate-300 text-sm select-none pt-4">→</div>

            {/* Core */}
            <div className={`rounded-lg border ${LAYER.core.border} ${LAYER.core.bg} px-4 py-4`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${LAYER.core.label}`}>Core</p>
              <p className={`text-sm mt-1 ${LAYER.core.text}`}>How the market responds</p>
              <p className="text-[11px] text-slate-400 mt-1">Aggregate → Score → Settle → Learn</p>
            </div>
          </div>
        </section>

        {/* ═══ Round timeline — horizontal stepper ═══ */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Round timeline
          </h2>

          <ol className="grid sm:grid-cols-4 gap-4">
            <RoundStep
              n={1}
              title="Submit"
              caption="Forecast + wager"
              latex="r_{i,t},\; b_{i,t}"
            />
            <RoundStep
              n={2}
              title="Skill-adjust"
              caption="Effective wager"
              latex="m_{i,t} = b_{i,t}\!\left(\lambda + (1{-}\lambda)\,\sigma_{i,t}\right)"
            />
            <RoundStep
              n={3}
              title="Aggregate"
              caption="Weighted forecast"
              latex="\hat{r}_t = \sum_{i \in I_t} \frac{m_{i,t}}{\sum_j m_{j,t}}\, r_{i,t}"
            />
            <RoundStep
              n={4}
              title="Settle & learn"
              caption="Payoff + skill update"
              latex="\sigma_{i,t+1} = \sigma_{\min} + (1{-}\sigma_{\min})\,e^{-\gamma\, L_{i,t}}"
            />
          </ol>
        </section>

        {/* ═══ Navigation ═══ */}
        <nav className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Explore the results
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group rounded-lg border border-slate-200 bg-white px-4 py-4 transition-colors hover:border-slate-400"
              >
                <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                  {l.label} →
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{l.desc}</p>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ── Round step card ── */
function RoundStep({ n, title, caption, latex }: {
  n: number; title: string; caption: string; latex: string;
}) {
  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
          {n}
        </span>
        <span className="text-xs font-semibold text-slate-700">{title}</span>
      </div>
      <p className="text-[11px] text-slate-400">{caption}</p>
      <MathBlock latex={latex} className="text-[11px]" />
    </li>
  );
}
