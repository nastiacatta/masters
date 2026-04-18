import { Link } from 'react-router-dom';

const NAV = [
  { to: '/evidence',   label: 'Evidence',   desc: 'Real data, accuracy & concentration', color: 'border-l-indigo-500 hover:bg-indigo-50' },
  { to: '/robustness', label: 'Robustness', desc: 'Behaviour taxonomy, attacks & sensitivity', color: 'border-l-violet-500 hover:bg-violet-50' },
  { to: '/explorer',   label: 'Explorer',   desc: 'Interactive mechanism walkthrough', color: 'border-l-teal-500 hover:bg-teal-50' },
  { to: '/notes',      label: 'Notes',      desc: 'Experiments & methodology', color: 'border-l-slate-400 hover:bg-slate-50' },
] as const;

/** SVG circle indicator used in place of emoji characters. */
function Indicator({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0 mt-1.5">
      <circle cx="6" cy="6" r="5" fill={color} />
    </svg>
  );
}

const FINDINGS = [
  { color: '#10b981', title: '34% CRPS improvement on real wind data', detail: 'The online skill layer improves forecast aggregation by 34% on Elia offshore wind with tuned parameters (DM test, p < 0.001). Confirmed on two real-world datasets.' },
  { color: '#6366f1', title: 'Deposit policy is the key lever', detail: 'The mechanism\'s value depends on deposit quality. With informative deposits (correlated with skill), blended weighting achieves near-oracle accuracy. With random deposits, equal weighting is hard to beat.' },
  { color: '#f59e0b', title: 'Mathematically sound', detail: 'Budget-balanced to machine precision (gap < 10\u207B\u00B9\u2074). Sybil-proof: splitting identity provides zero advantage. Arbitrage-free across all parameter settings.' },
  { color: '#64748b', title: 'Equal weighting is a strong baseline', detail: 'Uniform weights are surprisingly competitive, especially under non-stationarity or small panels. The mechanism helps most when forecasters have heterogeneous skill and enough rounds for learning to converge.' },
] as const;

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 space-y-16">

        {/* ── Research Question ── */}
        <header>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
            Skill × Stake
          </h1>
          <p className="text-lg text-slate-600 mt-3 max-w-4xl leading-relaxed">
            This thesis investigates whether an online skill estimation layer, combined with stake-based deposits,
            can improve probabilistic forecast aggregation under non-stationarity and strategic behaviour.
          </p>
        </header>

        {/* ── Plain-language summary ── */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 -mt-8">
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
            Imagine a group of forecasters predicting tomorrow&apos;s wind power output. Each round, they submit
            probabilistic forecasts and put money on the line. The mechanism learns who is good at forecasting
            and gives them more influence over the combined prediction. Good forecasters earn money; bad ones lose it.
            The key question: does this adaptive weighting actually produce better forecasts than simply averaging everyone equally?
          </p>
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl mt-2">
            <strong>Answer:</strong> Yes, but only when the panel has enough forecasters (N &ge; 6), enough rounds
            for learning to converge (~50), and heterogeneous skill levels. Under these conditions, the mechanism
            achieves a 34% improvement in forecast quality on real wind data.
          </p>
        </div>

        {/* ── Connecting statement ── */}
        <p className="text-sm text-slate-500 leading-relaxed -mt-8">
          The following sections outline the mechanism architecture, the core contribution, and the principal empirical findings.
        </p>

        {/* ── Mechanism Overview: 3 blocks ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Mechanism overview</h2>
          <div className="grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
            <div className="rounded-xl bg-sky-50 border border-sky-200 p-5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white text-xs font-bold mb-3">D</div>
              <div className="text-sm font-semibold text-sky-900">DGP</div>
              <div className="text-[11px] text-sky-700 mt-1">Generates outcomes</div>
            </div>
            <div className="hidden sm:flex items-center text-slate-300 text-xl font-light">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M10 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-5">
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-white text-xs font-bold mb-3">B</div>
              <div className="text-sm font-semibold text-violet-900">Behaviour</div>
              <div className="text-[11px] text-violet-700 mt-1">Agent decisions</div>
            </div>
            <div className="hidden sm:flex items-center text-slate-300 text-xl font-light">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M10 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="rounded-xl bg-teal-50 border border-teal-200 p-5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white text-xs font-bold mb-3">C</div>
              <div className="text-sm font-semibold text-teal-900">Core</div>
              <div className="text-[11px] text-teal-700 mt-1">Score, settle, learn</div>
            </div>
          </div>
        </section>

        {/* ── Round process ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">What happens each round</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold">1</div>
                  <span className="text-sm font-semibold text-slate-800">Submit</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Each forecaster submits a probabilistic forecast (quantiles) and a deposit (money at risk).
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white text-[10px] font-bold">2</div>
                  <span className="text-sm font-semibold text-slate-800">Weight</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The mechanism scales each deposit by the forecaster's learned skill. Good forecasters get more influence.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px] font-bold">3</div>
                  <span className="text-sm font-semibold text-slate-800">Aggregate</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Individual forecasts are combined into a single aggregate using the skill-adjusted weights.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold">4</div>
                  <span className="text-sm font-semibold text-slate-800">Settle &amp; Learn</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  After the outcome is observed, forecasters who beat the average profit. Skill estimates update.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Connecting statement ── */}
        <p className="text-sm text-slate-500 leading-relaxed -mt-8">
          Building on this mechanism, the thesis makes the following contribution.
        </p>

        {/* ── Thesis contribution ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Thesis contribution</h2>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 space-y-4">
            <p className="text-sm text-indigo-900 leading-relaxed">
              This thesis extends the Lambert (2008) self-financed wagering mechanism with an <span className="font-semibold">online skill layer</span>: 
              each round, the mechanism observes forecaster accuracy via CRPS scoring, updates an EWMA loss estimate, 
              and maps it to a skill weight &sigma;<sub>i</sub> that gates the effective wager.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-white border border-indigo-100 p-4">
                <div className="text-xs font-semibold text-indigo-800 mb-1">What is new</div>
                <div className="text-[11px] text-indigo-700 leading-relaxed">Online EWMA skill estimation combined with skill-gated effective wagers in a multi-round wagering mechanism</div>
              </div>
              <div className="rounded-lg bg-white border border-indigo-100 p-4">
                <div className="text-xs font-semibold text-indigo-800 mb-1">What it enables</div>
                <div className="text-[11px] text-indigo-700 leading-relaxed">Adaptive forecast aggregation that learns forecaster quality without requiring prior knowledge of skill</div>
              </div>
              <div className="rounded-lg bg-white border border-indigo-100 p-4">
                <div className="text-xs font-semibold text-indigo-800 mb-1">Key finding</div>
                <div className="text-[11px] text-indigo-700 leading-relaxed">34% CRPS improvement on real wind data with tuned parameters; deposit policy is the key lever determining mechanism value</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Connecting statement ── */}
        <p className="text-sm text-slate-500 leading-relaxed -mt-8">
          The empirical evaluation yields four principal findings.
        </p>

        {/* ── Key findings ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Key findings</h2>
          <div className="space-y-3">
            {FINDINGS.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 flex gap-4 items-start">
                <Indicator color={f.color} />
                <div>
                  <div className="text-[15px] font-semibold text-slate-800">{f.title}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{f.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Connecting statement ── */}
        <p className="text-sm text-slate-500 leading-relaxed -mt-8">
          The sections below provide detailed results, behavioural analysis, and robustness checks.
        </p>

        {/* ── Navigate ── */}
        <nav>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Explore</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {NAV.map((l) => (
              <Link key={l.to} to={l.to}
                className={`rounded-xl border border-slate-200 border-l-4 ${l.color} bg-white px-5 py-4 transition-colors`}>
                <div className="text-sm font-semibold text-slate-800">{l.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{l.desc}</div>
              </Link>
            ))}
          </div>
        </nav>

        {/* ── Footer ── */}
        <footer className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-100">
          Anastasia Cattaneo · Imperial College London · © 2026
        </footer>

      </div>
    </div>
  );
}
