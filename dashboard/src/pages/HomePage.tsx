import { Link } from 'react-router-dom';

const NAV = [
  { to: '/results',    label: 'Results',    desc: 'Accuracy & concentration', color: 'border-l-indigo-500 hover:bg-indigo-50' },
  { to: '/behaviour',  label: 'Behaviour',  desc: 'Strategies, attacks & robustness', color: 'border-l-violet-500 hover:bg-violet-50' },
  { to: '/notes',      label: 'Notes',      desc: 'All experiments & methodology', color: 'border-l-slate-400 hover:bg-slate-50' },
] as const;

const FINDINGS = [
  { icon: '✓', color: 'bg-emerald-500', title: '21% CRPS improvement on real wind data', detail: 'The online skill layer improves forecast aggregation by 21% on Elia offshore wind (DM test, p < 0.001). Confirmed on two real-world datasets.' },
  { icon: '⚖', color: 'bg-indigo-500', title: 'Deposit policy is the key lever', detail: 'The mechanism\'s value depends on deposit quality. With informative deposits (correlated with skill), blended weighting achieves near-oracle accuracy. With random deposits, equal weighting is hard to beat.' },
  { icon: '🔒', color: 'bg-amber-500', title: 'Mathematically sound', detail: 'Budget-balanced to machine precision (gap < 10⁻¹⁴). Sybil-proof: splitting identity provides zero advantage. Arbitrage-free across all parameter settings.' },
  { icon: '↔', color: 'bg-slate-500', title: 'Equal weighting is a strong baseline', detail: 'Uniform weights are surprisingly competitive, especially under non-stationarity or small panels. The mechanism helps most when forecasters have heterogeneous skill and enough rounds for learning to converge.' },
] as const;

const STEPS = [
  {
    n: 1, title: 'Submit', color: 'bg-sky-500',
    what: 'Each forecaster submits a prediction and a wager.',
  },
  {
    n: 2, title: 'Skill-adjust', color: 'bg-violet-500',
    what: 'The wager is scaled by a learned skill estimate — low skill reduces influence.',
  },
  {
    n: 3, title: 'Aggregate', color: 'bg-teal-500',
    what: 'Adjusted wagers become weights. The market forecast is a weighted combination.',
  },
  {
    n: 4, title: 'Settle & learn', color: 'bg-amber-500',
    what: 'Payoffs reward accuracy. Skill estimates update from realised performance.',
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24 space-y-16">

        {/* ── Hero ── */}
        <header>
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold tracking-wide mb-5">
            Master's Thesis Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
            Skill × Stake
          </h1>
          <p className="text-lg text-slate-500 mt-3 max-w-xl leading-relaxed">
            Can an online skill layer, combined with stake-based deposits, improve probabilistic forecast aggregation under non-stationarity and strategic behaviour?
          </p>
        </header>

        {/* ── System: 3 blocks ── */}
        <section>
          <div className="grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
            <div className="rounded-xl bg-sky-50 border border-sky-200 p-5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white text-xs font-bold mb-3">D</div>
              <div className="text-sm font-semibold text-sky-900">DGP</div>
              <div className="text-xs text-sky-700 mt-1">Generates outcomes</div>
            </div>
            <div className="hidden sm:flex items-center text-slate-300 text-xl font-light">→</div>
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-5">
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-white text-xs font-bold mb-3">B</div>
              <div className="text-sm font-semibold text-violet-900">Behaviour</div>
              <div className="text-xs text-violet-700 mt-1">Agent decisions</div>
            </div>
            <div className="hidden sm:flex items-center text-slate-300 text-xl font-light">→</div>
            <div className="rounded-xl bg-teal-50 border border-teal-200 p-5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white text-xs font-bold mb-3">C</div>
              <div className="text-sm font-semibold text-teal-900">Core</div>
              <div className="text-xs text-teal-700 mt-1">Score, settle, learn</div>
            </div>
          </div>
        </section>

        {/* ── Round timeline — plain English ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">How one round works</h2>
          <div className="grid sm:grid-cols-2 gap-4 relative">
            {/* Connecting lines between steps */}
            <svg className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
              {/* Horizontal connector: step 1 → step 2 */}
              <line x1="50%" y1="25%" x2="50%" y2="25%" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />
              {/* Vertical connector: step 1 → step 3 */}
              <line x1="25%" y1="50%" x2="25%" y2="50%" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />
              {/* Vertical connector: step 2 → step 4 */}
              <line x1="75%" y1="50%" x2="75%" y2="50%" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />
              {/* Horizontal connector: step 3 → step 4 */}
              <line x1="50%" y1="75%" x2="50%" y2="75%" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative z-10">
                <div className="rounded-xl border border-slate-200 bg-white p-5 flex gap-4 items-start">
                  <div className={`w-7 h-7 rounded-full ${s.color} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                    {s.n}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{s.title}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">{s.what}</div>
                  </div>
                </div>
                {/* Arrow connectors */}
                {i < 3 && (
                  <div className={`hidden sm:flex absolute text-slate-300 text-sm font-light ${
                    i === 0 ? '-right-3 top-1/2 -translate-y-1/2' :
                    i === 1 ? 'left-1/2 -bottom-3 -translate-x-1/2' :
                    '-right-3 top-1/2 -translate-y-1/2'
                  }`}>
                    {i === 1 ? '↓' : '→'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Key findings ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Key findings</h2>
          <div className="space-y-3">
            {FINDINGS.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 flex gap-4 items-start">
                <div className={`w-7 h-7 rounded-full ${f.color} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-slate-800">{f.title}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{f.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Navigate ── */}
        <nav>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Explore</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {NAV.map((l) => (
              <Link key={l.to} to={l.to}
                className={`rounded-xl border border-slate-200 border-l-4 ${l.color} bg-white px-5 py-4 transition-colors`}>
                <div className="text-sm font-semibold text-slate-800">{l.label} →</div>
                <div className="text-xs text-slate-400 mt-0.5">{l.desc}</div>
              </Link>
            ))}
          </div>
        </nav>

        {/* ── Footer ── */}
        <footer className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-100">
          Anastasia Cattaneo · Imperial College London · © 2025
        </footer>

      </div>
    </div>
  );
}
