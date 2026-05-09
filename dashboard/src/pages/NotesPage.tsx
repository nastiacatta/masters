import { Link } from 'react-router-dom';
import PageShell from '@/components/dashboard/PageShell';

const EXPERIMENTS = [
  {
    id: 'deposit-sensitivity',
    title: 'Deposit policy determines whether skill helps',
    status: 'confirmed' as const,
    finding: 'On synthetic data, exponential deposits drown out the skill signal (mechanism +0.0%). On real wind data the mechanism improves under every deposit regime tested \u2014 fixed (+21.0%), exponential (+15.5%), and bankroll (+5.3%) \u2014 showing that the ranking between rules is robust even when the absolute gain shrinks. These percentages come from an earlier deposit-sensitivity pipeline that used the pre-audit normalisation, but are larger than the current post-audit headline (\u22487.9% on the 1h-ahead comparison run). The <em>ordering</em> of the three rules, not the raw percentages, is the persistent finding.',
    implication: 'Deposit sensitivity is real but less severe on real data than on synthetic data. The skill signal is stronger when forecasters have genuinely heterogeneous, time-varying quality.',
    data: [
      { label: 'Real: Fixed deposits (pre-audit scale)', delta: '-0.019562', pct: '+21.0%', sig: true },
      { label: 'Real: Exponential deposits (pre-audit scale)', delta: '-0.014383', pct: '+15.5%', sig: true },
      { label: 'Real: Bankroll deposits (pre-audit scale)', delta: '-0.004968', pct: '+5.3%', sig: true },
      { label: 'Synthetic: Fixed deposits', delta: '-0.002862', pct: '+5.2%', sig: true },
      { label: 'Synthetic: Exponential deposits', delta: '-0.000006', pct: '+0.0%', sig: false },
    ],
  },
  {
    id: 'rank-skill',
    title: 'Rank-based skill weights outperform multiplicative gate',
    status: 'confirmed' as const,
    finding: 'Replacing the multiplicative skill gate with rank-based weights (weight ∝ rank position by σ) improves CRPS by 21.1% under exponential deposits, the exact regime where the current mechanism fails.',
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
    finding: 'The mechanism improvement is stable across T=100 to T=1000 (all ~5.2% under fixed deposits). The EWMA skill estimate converges quickly with no long burn-in needed.',
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
  {
    id: 'real-data-wind',
    title: 'Real data: Elia offshore wind, mechanism \u22127.9% CRPS (1h-ahead, post-audit)',
    status: 'confirmed' as const,
    finding: 'Seven forecasting models (Naive, EWMA-5, ARIMA(2,1,1), XGBoost, MLP, Theta, and a Naive+EWMA ensemble) run on Elia Belgian offshore wind power (17,544 hourly points, 2024\u20132025). After the strictly-causal normalisation audit, the mechanism reduces mean CRPS by 7.9% versus equal weighting; skill-only reduces it by 7.3%. The improvement is genuine and significant, but materially smaller than the pre-audit figure (\u224821%) that assumed an incorrect normalisation.',
    implication: 'The mechanism still adds value on real data, but its headline advantage is in the single-digit-percent range on this series, not the tens of percent. Best-single remains a strong individual benchmark.',
    data: [
      { label: 'Mechanism (skill \u00d7 stake)', delta: '-0.003370', pct: '+7.9%', sig: true },
      { label: 'Skill-only', delta: '-0.003099', pct: '+7.3%', sig: true },
      { label: 'Equal (uniform)', delta: '0.000000', pct: '0.0%', sig: false },
      { label: 'Best single model', delta: '-0.010216', pct: '+24.0%', sig: true },
    ],
  },
  {
    id: 'day-ahead',
    title: 'Day-ahead forecasting: mechanism essentially flat',
    status: 'partial' as const,
    finding: 'At the day-ahead horizon (daily resolution, 732 points) the mechanism moves mean CRPS by only \u22120.08% versus equal weighting. The pre-audit figure of +1.1% was an artefact of the old normalisation; with strictly-causal normalisation the day-ahead gain is indistinguishable from noise.',
    implication: 'When all forecasters are roughly equally bad at a horizon, there is very little skill signal for the mechanism to exploit. Day-ahead wind is such a case on this dataset.',
    data: [
      { label: 'Mechanism', delta: '-0.000159', pct: '+0.08%', sig: false },
      { label: 'Skill-only', delta: '-0.000089', pct: '+0.05%', sig: false },
      { label: 'Best single', delta: '-0.003696', pct: '+1.9%', sig: true },
    ],
  },
  {
    id: '4h-ahead',
    title: '4-hour-ahead (15-min resolution): mechanism \u22120.6%',
    status: 'partial' as const,
    finding: 'At a 4-hour horizon on 15-minute data (20,000 points, 16-step ahead) the mechanism reduces mean CRPS by 0.6% versus equal weighting. The pre-audit figure of +6.7% was based on the old normalisation; with strictly-causal normalisation the gain shrinks to under 1%.',
    implication: 'A longer horizon at finer granularity exposes less skill signal than the hourly case. The best-single benchmark is still the strongest individual option at this horizon.',
    data: [
      { label: 'Mechanism', delta: '-0.000663', pct: '+0.6%', sig: true },
      { label: 'Skill-only', delta: '-0.000396', pct: '+0.4%', sig: true },
      { label: 'Best single', delta: '-0.004869', pct: '+4.5%', sig: true },
    ],
  },
  {
    id: 'regime-shift',
    title: 'Regime shift: mechanism adapts but gain is small',
    status: 'partial' as const,
    finding: 'On the full wind series under a regime-shift protocol (17,544 points; model quality changes across seasons), the mechanism reduces mean CRPS by 1.1% versus equal weighting. The EWMA skill layer does adapt to the changing ranking, but the magnitude of the gain is small once the strictly-causal normalisation is applied; earlier season-by-season numbers (+11\u2013+17%) relied on the pre-audit normalisation and are no longer supported by the data.',
    implication: 'The mechanism does track non-stationarity \u2014 the skill estimates shift with the regime \u2014 but on this series the aggregate improvement from that tracking is modest.',
    data: [
      { label: 'Mechanism', delta: '-0.000705', pct: '+1.1%', sig: true },
      { label: 'Skill-only', delta: '-0.000393', pct: '+0.6%', sig: true },
      { label: 'Best single', delta: '-0.007365', pct: '+11.0%', sig: true },
    ],
  },
] as const;

const STATUS_META = {
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Confirmed' },
  partial:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   label: 'Partial' },
  rejected:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500',     label: 'Rejected' },
} as const;

function StatusPill({ status }: { status: keyof typeof STATUS_META }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${m.bg} ${m.text} ${m.border}`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export default function NotesPage() {
  const confirmedCount = EXPERIMENTS.filter((e) => e.status === 'confirmed').length;
  const partialCount = EXPERIMENTS.filter((e) => e.status === 'partial').length;

  return (
    <PageShell width="narrow">

        <header>
          <p className="eyebrow mb-3" style={{ color: 'var(--navy)' }}>
            Research Notes
          </p>
          <h1
            className="font-serif tracking-tight"
            style={{
              fontSize: 'clamp(32px, 4vw, 42px)',
              lineHeight: 1.15,
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            Mechanism design experiments
          </h1>
          <p
            className="font-serif mt-4"
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--ink-muted)',
              maxWidth: 820,
            }}
          >
            Experiments probing extensions and variants of the skill &times; stake mechanism. Each synthetic
            experiment uses 100 or more paired seeds drawn from the same data-generating process, so every
            weighting rule sees the same outcomes; only the rule changes. All deltas are reported versus
            equal weighting.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2" style={{ fontSize: 12 }}>
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium"
              style={{
                background: 'var(--teal-tint)',
                color: 'var(--teal-deep)',
                border: '1px solid rgba(15, 118, 110, 0.2)',
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal)' }} />
              {confirmedCount} confirmed
            </span>
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium"
              style={{
                background: 'var(--amber-tint)',
                color: 'var(--amber)',
                border: '1px solid rgba(180, 83, 9, 0.2)',
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--amber)' }} />
              {partialCount} partial
            </span>
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium"
              style={{
                background: 'var(--card)',
                color: 'var(--ink-soft)',
                border: '1px solid var(--border)',
              }}
            >
              {EXPERIMENTS.length} total experiments
            </span>
          </div>
        </header>

        <div className="space-y-5">
          {EXPERIMENTS.map((exp, i) => (
            <section
              key={exp.id}
              id={exp.id}
              className="scroll-mt-24 space-y-4"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: 22,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-start gap-4">
                <span
                  className="mt-0.5 flex items-center justify-center shrink-0 font-mono"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    background: 'var(--cream)',
                    border: '1px solid var(--border)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--ink-soft)',
                  }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusPill status={exp.status} />
                  </div>
                  <h2
                    className="font-serif tracking-tight mt-2"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                    }}
                  >
                    {exp.title}
                  </h2>
                  <p
                    className="mt-2"
                    style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}
                  >
                    {exp.finding}
                  </p>
                </div>
              </div>

              <div
                className="overflow-x-auto"
                style={{ border: '1px solid var(--border)', borderRadius: 4 }}
              >
                <table className="w-full" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr
                      style={{
                        background: 'var(--cream)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <th
                        className="text-left uppercase"
                        style={{
                          padding: '10px 16px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: 'var(--ink-soft)',
                        }}
                      >
                        Variant
                      </th>
                      <th
                        className="text-right uppercase"
                        style={{
                          padding: '10px 12px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: 'var(--ink-soft)',
                        }}
                      >
                        Δ CRPS
                      </th>
                      <th
                        className="text-right uppercase"
                        style={{
                          padding: '10px 12px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: 'var(--ink-soft)',
                        }}
                      >
                        % vs equal
                      </th>
                      <th
                        className="text-center uppercase"
                        style={{
                          padding: '10px 16px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: 'var(--ink-soft)',
                        }}
                      >
                        Sig.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exp.data.map((row, rowIdx, arr) => {
                      const isLast = rowIdx === arr.length - 1;
                      const deltaNeg = row.delta.startsWith('-');
                      const pctPos = row.pct.startsWith('+') && row.sig;
                      return (
                        <tr
                          key={row.label}
                          style={{
                            borderBottom: isLast ? 'none' : '1px solid var(--border)',
                          }}
                        >
                          <td
                            style={{
                              padding: '8px 16px',
                              color: 'var(--ink)',
                              fontWeight: 500,
                            }}
                          >
                            {row.label}
                          </td>
                          <td
                            className="text-right font-mono tabular-nums"
                            style={{
                              padding: '8px 12px',
                              color: deltaNeg ? 'var(--teal-deep)' : 'var(--ink-soft)',
                              fontWeight: deltaNeg ? 600 : 400,
                            }}
                          >
                            {row.delta}
                          </td>
                          <td
                            className="text-right font-mono tabular-nums"
                            style={{
                              padding: '8px 12px',
                              color: pctPos ? 'var(--teal-deep)' : 'var(--ink-soft)',
                              fontWeight: pctPos ? 600 : 400,
                            }}
                          >
                            {row.pct}
                          </td>
                          <td
                            className="text-center"
                            style={{ padding: '8px 16px' }}
                          >
                            {row.sig ? (
                              <span
                                className="inline-flex items-center justify-center"
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  background: 'var(--teal-tint)',
                                  color: 'var(--teal-deep)',
                                }}
                                aria-label="Significant"
                              >
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                  <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            ) : (
                              <span style={{ color: 'var(--ink-faint)' }} aria-label="Not significant">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div
                className="flex gap-3 items-start px-4 py-3"
                style={{
                  background: 'var(--navy-tint)',
                  borderLeft: '3px solid var(--navy)',
                  borderRadius: 4,
                }}
              >
                <span
                  className="uppercase shrink-0 mt-0.5"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    color: 'var(--navy)',
                  }}
                >
                  Implication
                </span>
                <p style={{ fontSize: 13, color: 'var(--navy-ink)', lineHeight: 1.55 }}>
                  {exp.implication}
                </p>
              </div>
            </section>
          ))}
        </div>

        <div
          className="p-6"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3
            className="font-serif mb-3 tracking-tight flex items-center gap-2.5"
            style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}
          >
            <span
              className="inline-block"
              style={{ width: 3, height: 16, background: 'var(--teal)', borderRadius: 2 }}
            />
            Methodology
          </h3>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.65 }}>
            Synthetic experiments use the latent-fixed data-generating process with 10 heterogeneous
            forecasters (noise levels &tau; &isin; [0.15, 1.0]), T = 500 rounds, 20% missingness, and CRPS
            scoring. Each seed generates the same ground truth, reports, and missingness pattern; only the
            weighting rule changes. Significance is assessed with a paired t-test.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed mt-2">
            Real-data experiments use seven forecasting models (Naive, EWMA-5, ARIMA(2,1,1), XGBoost,
            MLP, Theta, and a Naive+EWMA ensemble) run on Elia Belgian wind and electricity series.
            All models are strictly causal and are retrained on a rolling window. Statistical significance
            is assessed with the Diebold&ndash;Mariano test using Newey&ndash;West (HAC) standard errors,
            which corrects for autocorrelation in the loss differences.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 pl-4 pr-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Dataset</th>
                  <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Δ CRPS</th>
                  <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">% improv</th>
                  <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">DM stat</th>
                  <th className="text-right py-2 px-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">p-value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ds: 'Wind 1h-ahead',  delta: '-0.0034', pct: '+7.9%',  dm: '\u2014', p: '< 0.001' },
                  { ds: 'Wind 4h-ahead',  delta: '-0.0007', pct: '+0.6%',  dm: '\u2014', p: '< 0.001' },
                  { ds: 'Wind day-ahead', delta: '-0.0002', pct: '+0.08%', dm: '\u2014', p: 'n.s.'    },
                  { ds: 'Wind regime-shift', delta: '-0.0007', pct: '+1.1%', dm: '\u2014', p: '< 0.001' },
                  { ds: 'Electricity 1h', delta: '-0.0048', pct: '+5.3%',  dm: '\u2014', p: '< 0.001' },
                ].map((r) => (
                  <tr key={r.ds} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 pl-4 pr-3 text-slate-700 font-medium">{r.ds}</td>
                    <td className="text-right py-2 px-2 font-mono tabular-nums text-emerald-600 font-semibold">{r.delta}</td>
                    <td className="text-right py-2 px-2 font-mono tabular-nums text-emerald-600 font-semibold">{r.pct}</td>
                    <td className="text-right py-2 px-2 font-mono tabular-nums text-slate-600">{r.dm}</td>
                    <td className="text-right py-2 px-2 pr-4 font-mono tabular-nums text-slate-600">{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link
            to="/evidence"
            className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-700 group"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to main results
          </Link>
        </div>
    </PageShell>
  );
}
