import { Link } from 'react-router-dom';

const NAV = [
  { to: '/evidence',   label: 'Evidence',   desc: 'Real data, accuracy & concentration',       accent: 'indigo' },
  { to: '/robustness', label: 'Robustness', desc: 'Behaviour taxonomy, attacks & sensitivity', accent: 'violet' },
  { to: '/explorer',   label: 'Explorer',   desc: 'Interactive mechanism walkthrough',         accent: 'teal' },
  { to: '/notes',      label: 'Notes',      desc: 'Experiments & methodology',                 accent: 'slate' },
] as const;

type NavAccent = (typeof NAV)[number]['accent'];

/** Keep colour mapping static so Tailwind's JIT can see the classes. */
const NAV_STYLES: Record<NavAccent, { ring: string; dot: string; arrow: string }> = {
  indigo: { ring: 'hover:border-indigo-300 hover:shadow-indigo-100', dot: 'bg-indigo-500', arrow: 'group-hover:text-indigo-500' },
  violet: { ring: 'hover:border-violet-300 hover:shadow-violet-100', dot: 'bg-violet-500', arrow: 'group-hover:text-violet-500' },
  teal:   { ring: 'hover:border-teal-300 hover:shadow-teal-100',     dot: 'bg-teal-500',   arrow: 'group-hover:text-teal-500' },
  slate:  { ring: 'hover:border-slate-300 hover:shadow-slate-100',   dot: 'bg-slate-400',  arrow: 'group-hover:text-slate-500' },
};

/** SVG circle indicator used in place of emoji characters. */
function Indicator({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0 mt-1.5">
      <circle cx="6" cy="6" r="5" fill={color} />
    </svg>
  );
}

function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <path d="M3 7h8M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FINDINGS = [
  { color: '#10b981', title: '44% CRPS improvement on real wind data', detail: 'The online skill layer improves forecast aggregation by 44% on Elia offshore wind with tuned parameters (DM test, p < 0.001). Confirmed on two real-world datasets.' },
  { color: '#6366f1', title: 'Deposit policy is the key lever', detail: 'The mechanism\'s value depends on deposit quality. With informative deposits (correlated with skill), blended weighting achieves near-oracle accuracy. With random deposits, equal weighting is hard to beat.' },
  { color: '#f59e0b', title: 'Mathematically sound', detail: 'Budget-balanced to machine precision (gap < 10\u207B\u00B9\u2074). Sybil-proof: splitting identity provides zero advantage. Arbitrage-free across all parameter settings.' },
  { color: '#64748b', title: 'Equal weighting is a strong baseline', detail: 'Uniform weights are surprisingly competitive, especially under non-stationarity or small panels. The mechanism helps most when forecasters have heterogeneous skill and enough rounds for learning to converge.' },
] as const;

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Subtle top accent gradient */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-teal-50/50 via-indigo-50/30 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20 space-y-16">

        {/* ── Research Question ── */}
        <header className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="inline-flex items-center gap-2 mb-5 rounded-full bg-white border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
            </span>
            MSc Thesis · Imperial College London
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight">
            <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
              Skill
            </span>
            <span className="text-slate-400 mx-2 sm:mx-3 font-light">×</span>
            <span className="bg-gradient-to-br from-teal-600 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
              Stake
            </span>
          </h1>
          <p className="text-lg text-slate-600 mt-5 max-w-4xl leading-relaxed">
            This project investigates whether an online skill estimation layer, combined with stake-based deposits,
            can improve probabilistic forecast aggregation under non-stationarity and strategic behaviour.
          </p>
        </header>

        {/* ── Plain-language summary ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm -mt-8">
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
            Imagine a group of forecasters predicting tomorrow&apos;s wind power output. Each round, they submit
            probabilistic forecasts and put money on the line. The mechanism learns who is good at forecasting
            and gives them more influence over the combined prediction. Good forecasters earn money; bad ones lose it.
            The key question: does this adaptive weighting actually produce better forecasts than simply averaging everyone equally?
          </p>
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl mt-3">
            <strong className="text-slate-800">Answer:</strong> Yes, but only when the panel has enough forecasters (N &ge; 6), enough rounds
            for learning to converge (~50), and heterogeneous skill levels. Under these conditions, the mechanism
            achieves a <span className="font-semibold text-teal-700">44% improvement</span> in forecast quality on real wind data.
          </p>
        </div>

        {/* ── Connecting statement ── */}
        <p className="text-sm text-slate-500 leading-relaxed -mt-8">
          The following sections outline the mechanism architecture, the core contribution, and the principal empirical findings.
        </p>

        {/* ── Mechanism Overview: 3 blocks ── */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">Mechanism overview</h2>
          <div className="grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
            <div className="rounded-xl bg-sky-50 border border-sky-200/80 p-5 hover:border-sky-300 hover:shadow-sm transition-all duration-150">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white text-xs font-bold mb-3 shadow-sm">D</div>
              <div className="text-sm font-semibold text-sky-900">DGP</div>
              <div className="text-[11px] text-sky-700/90 mt-1">Generates outcomes</div>
            </div>
            <div className="hidden sm:flex items-center text-slate-300">
              <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M10 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="rounded-xl bg-violet-50 border border-violet-200/80 p-5 hover:border-violet-300 hover:shadow-sm transition-all duration-150">
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-white text-xs font-bold mb-3 shadow-sm">B</div>
              <div className="text-sm font-semibold text-violet-900">Behaviour</div>
              <div className="text-[11px] text-violet-700/90 mt-1">Agent decisions</div>
            </div>
            <div className="hidden sm:flex items-center text-slate-300">
              <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M10 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="rounded-xl bg-teal-50 border border-teal-200/80 p-5 hover:border-teal-300 hover:shadow-sm transition-all duration-150">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white text-xs font-bold mb-3 shadow-sm">C</div>
              <div className="text-sm font-semibold text-teal-900">Core</div>
              <div className="text-[11px] text-teal-700/90 mt-1">Score, settle, learn</div>
            </div>
          </div>
        </section>

        {/* ── Round process ── */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">What happens each round</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="grid sm:grid-cols-4 gap-5 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">1</div>
                  <span className="text-sm font-semibold text-slate-800">Submit</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Each forecaster submits a probabilistic forecast (quantiles) and a deposit (money at risk).
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">2</div>
                  <span className="text-sm font-semibold text-slate-800">Weight</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The mechanism scales each deposit by the forecaster's learned skill. Good forecasters get more influence.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">3</div>
                  <span className="text-sm font-semibold text-slate-800">Aggregate</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Individual forecasts are combined into a single aggregate using the skill-adjusted weights.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">4</div>
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
          Building on this mechanism, the project makes the following contribution.
        </p>

        {/* ── Project contribution ── */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">Project contribution</h2>
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-indigo-50/40 p-6 sm:p-7 space-y-5 shadow-sm">
            <p className="text-sm text-indigo-900 leading-relaxed">
              This project extends the Lambert (2008) self-financed wagering mechanism with an <span className="font-semibold">online skill layer</span>:
              each round, the mechanism observes forecaster accuracy via CRPS scoring, updates an EWMA loss estimate,
              and maps it to a skill weight &sigma;<sub>i</sub> that gates the effective wager.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-white border border-indigo-100 p-4 hover:border-indigo-200 hover:shadow-sm transition-all duration-150">
                <div className="text-xs font-semibold text-indigo-800 mb-1.5">What is new</div>
                <div className="text-[11px] text-indigo-700/90 leading-relaxed">Online EWMA skill estimation combined with skill-gated effective wagers in a multi-round wagering mechanism</div>
              </div>
              <div className="rounded-xl bg-white border border-indigo-100 p-4 hover:border-indigo-200 hover:shadow-sm transition-all duration-150">
                <div className="text-xs font-semibold text-indigo-800 mb-1.5">What it enables</div>
                <div className="text-[11px] text-indigo-700/90 leading-relaxed">Adaptive forecast aggregation that learns forecaster quality without requiring prior knowledge of skill</div>
              </div>
              <div className="rounded-xl bg-white border border-indigo-100 p-4 hover:border-indigo-200 hover:shadow-sm transition-all duration-150">
                <div className="text-xs font-semibold text-indigo-800 mb-1.5">Key finding</div>
                <div className="text-[11px] text-indigo-700/90 leading-relaxed">44% CRPS improvement on real wind data with tuned parameters; deposit policy is the key lever determining mechanism value</div>
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
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">Key findings</h2>
          <div className="space-y-3">
            {FINDINGS.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-5 flex gap-4 items-start shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-slate-300 transition-all duration-150"
              >
                <Indicator color={f.color} />
                <div>
                  <div className="text-[15px] font-semibold text-slate-800">{f.title}</div>
                  <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.detail}</div>
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
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">Explore</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {NAV.map((l) => {
              const s = NAV_STYLES[l.accent];
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`group relative rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-150 ${s.ring}`}
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <div className="text-sm font-semibold text-slate-800">{l.label}</div>
                    <ArrowRightIcon className={`ml-auto text-slate-300 transition-transform duration-150 group-hover:translate-x-0.5 ${s.arrow}`} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{l.desc}</div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── Footer ── */}
        <footer className="text-center text-[11px] text-slate-400 pt-6 border-t border-slate-100">
          Anastasia Cattaneo · Imperial College London · © 2026
        </footer>

      </div>
    </div>
  );
}
