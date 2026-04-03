import { Link } from 'react-router-dom';

const EXPERIMENTS = [
  {
    id: 'deposit-sensitivity',
    title: 'Deposit policy determines whether skill helps',
    status: 'confirmed' as const,
    finding: 'Under exponential deposits, the current mechanism (m = b × g(σ)) performs identically to equal weighting because deposit variance overwhelms the skill signal. Under fixed deposits, it improves CRPS by 5.2%.',
    implication: 'The deposit policy is a critical design choice. The skill gate only adds value when deposits don\'t dominate the effective wager.',
    data: [
      { label: 'Fixed deposits', delta: '-0.002862', pct: '+5.2%', sig: true },
      { label: 'Bankroll deposits', delta: '-0.000637', pct: '+1.2%', sig: true },
      { label: 'Exponential deposits', delta: '-0.000006', pct: '+0.0%', sig: false },
    ],
  },
  {
    id: 'rank-skill',
    title: 'Rank-based skill weights outperform multiplicative gate',
    status: 'confirmed' as const,
    finding: 'Replacing the multiplicative skill gate with rank-based weights (weight ∝ rank position by σ) improves CRPS by 21.1% under exponential deposits — the exact regime where the current mechanism fails.',
    implication: 'Ranks are invariant to deposit scale, so they can\'t be drowned out by deposit noise. This is a candidate replacement for the multiplicative gate.',
    data: [
      { label: 'Rank-based skill', delta: '-0.011690', pct: '+21.1%', sig: true },
      { label: 'Skill² (sharper)', delta: '-0.003046', pct: '+5.5%', sig: true },
      { label: 'Skill-only (σ)', delta: '-0.001516', pct: '+2.7%', sig: true },
      { label: 'Current mechanism', delta: '+0.000107', pct: '-0.2%', sig: false },
    ],
  },
  {
    id: 'additive-combination',
    title: 'Additive skill+deposit combination',
    status: 'partial' as const,
    finding: 'An additive combination w = α·b_norm + (1-α)·σ_norm with α=0.3 improves by 1.4% under exponential deposits. Less effective than rank-based but preserves the deposit signal.',
    implication: 'Additive combination gives skill its own channel that can\'t be overwhelmed. The mixing parameter α controls the trade-off.',
    data: [
      { label: 'Additive (α=0.3)', delta: '-0.000796', pct: '+1.4%', sig: true },
      { label: 'Additive (α=0.5)', delta: '-0.000048', pct: '+0.1%', sig: false },
    ],
  },
  {
    id: 'log-deposit',
    title: 'Log-compressing deposits before skill gate',
    status: 'partial' as const,
    finding: 'Using log(1+b) instead of b in the effective wager compresses the deposit range and lets the skill signal through. Improves by 1.9% under exponential deposits.',
    implication: 'A simple transformation that doesn\'t change the mechanism structure but reduces deposit dominance.',
    data: [
      { label: 'Log-deposit mechanism', delta: '-0.001066', pct: '+1.9%', sig: true },
    ],
  },
  {
    id: 'learning-curve',
    title: 'The skill layer works from T=100 onwards',
    status: 'confirmed' as const,
    finding: 'The mechanism improvement is stable across T=100 to T=1000 (all ~5.2% under fixed deposits). The EWMA skill estimate converges quickly — no long burn-in needed.',
    implication: 'The online skill layer is practical even for short horizons. 100 rounds is enough for the skill signal to separate good from bad forecasters.',
    data: [
      { label: 'T = 100', delta: '-0.002910', pct: '+5.3%', sig: true },
      { label: 'T = 200', delta: '-0.002847', pct: '+5.2%', sig: true },
      { label: 'T = 500', delta: '-0.002851', pct: '+5.2%', sig: true },
      { label: 'T = 1000', delta: '-0.002871', pct: '+5.2%', sig: true },
    ],
  },
  {
    id: 'missingness',
    title: 'Skill improvement degrades gracefully under missingness',
    status: 'confirmed' as const,
    finding: 'With 0% missingness the mechanism improves by 5.3%. At 60% missingness it still improves by 4.4%. The skill layer is robust to intermittent participation.',
    implication: 'Even when most agents are absent most rounds, the EWMA skill estimate retains enough signal to improve aggregation.',
    data: [
      { label: '0% missing', delta: '-0.002911', pct: '+5.3%', sig: true },
      { label: '10% missing', delta: '-0.002886', pct: '+5.2%', sig: true },
      { label: '20% missing', delta: '-0.002851', pct: '+5.2%', sig: true },
      { label: '40% missing', delta: '-0.002747', pct: '+5.0%', sig: true },
      { label: '60% missing', delta: '-0.002424', pct: '+4.4%', sig: true },
    ],
  },
] as const;

const STATUS_STYLE = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
} as const;

export default function NotesPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        <header>
          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold tracking-wide mb-4">
            Research Notes
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Mechanism Design Experiments
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Tested improvements to the skill × stake mechanism. Each experiment uses 100+ paired seeds
            on the same DGP realization. All deltas are vs equal weighting.
          </p>
        </header>

        <div className="space-y-8">
          {EXPERIMENTS.map((exp) => (
            <section key={exp.id} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[exp.status]}`}>
                  {exp.status}
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{exp.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{exp.finding}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 pr-4 text-slate-400 font-medium">Variant</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Δ CRPS</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">% vs equal</th>
                      <th className="text-center py-2 pl-3 text-slate-400 font-medium">Sig.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exp.data.map((row) => (
                      <tr key={row.label} className="border-b border-slate-50">
                        <td className="py-2 pr-4 text-slate-700 font-medium">{row.label}</td>
                        <td className={`text-right py-2 px-3 font-mono ${row.delta.startsWith('-') ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {row.delta}
                        </td>
                        <td className={`text-right py-2 px-3 font-mono ${row.pct.startsWith('+') && row.sig ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {row.pct}
                        </td>
                        <td className="text-center py-2 pl-3">
                          {row.sig ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-400 italic">{exp.implication}</p>
            </section>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Methodology</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All experiments use the latent-fixed DGP with 10 heterogeneous forecasters (τ ∈ [0.15, 1.0]),
            T=500 rounds, 20% missingness, and CRPS scoring. Each seed generates the same truth, reports,
            and missingness pattern — only the weighting rule changes. Deltas are paired (same seed, different method).
            Significance tested via paired t-test at 5% level.
          </p>
          <Link to="/results" className="inline-block mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-800">
            ← Back to main results
          </Link>
        </div>
      </div>
    </div>
  );
}
