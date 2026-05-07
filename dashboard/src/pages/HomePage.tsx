import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '@/components/dashboard/PageShell';

/* ────────────────────────────────────────────────────────────────
   HomePage — academic redesign.

   Priorities:
   - Serif display headings, generous type
   - Restrained colour (navy, teal, amber), used as accents only
   - No gradient chrome, no "ping" dots
   - Content flows as a single readable column
   ──────────────────────────────────────────────────────────────── */

const STAGES = [
  {
    mark: 'D',
    title: 'Data-generating process',
    body: 'The world the forecasters face. Latent states evolve; outcomes are drawn round by round.',
    color: '#1d3461',
  },
  {
    mark: 'B',
    title: 'Forecaster behaviour',
    body: 'How each forecaster reports and wagers. Honest, risk-averse, adversarial — all covered by the same interface.',
    color: '#5b21b6',
  },
  {
    mark: 'C',
    title: 'Core mechanism',
    body: 'Scores each forecast with CRPS, settles payoffs from the pooled deposits, and updates every forecaster\u2019s skill estimate.',
    color: '#0f766e',
  },
] as const;

const ROUND_STEPS = [
  { n: 1, label: 'Submit',          body: 'Each forecaster posts a quantile forecast together with a real-money deposit.' },
  { n: 2, label: 'Weight',          body: 'Deposits are multiplied by the current skill estimate \u03C3\u1D62, giving an effective wager m\u1D62.' },
  { n: 3, label: 'Aggregate',       body: 'Individual forecasts are combined into a single panel forecast r\u0302.' },
  { n: 4, label: 'Settle & learn',  body: 'Once the outcome y is observed, good forecasters are paid from the deposits of bad ones; skill estimates update via EWMA.' },
] as const;

const FINDINGS = [
  {
    kicker: 'Real data',
    title: 'Modest CRPS reduction on Elia wind; essentially flat on electricity',
    body:
      'Across 17,344 evaluation rounds on Elia offshore wind with seven forecasting models (Naive, EWMA, ARIMA, XGBoost, MLP, Theta, Ensemble), the skill \u00D7 stake aggregate reduces mean CRPS by about 7% relative to equal weighting under strictly-causal expanding normalisation (Diebold\u2013Mariano t = 40.77, p < 0.001). On Elia electricity imbalance prices (10,000 rounds) the mechanism is statistically indistinguishable from equal weighting (t = 0.008, p = 0.99) \u2014 an honest null that reflects the near-identical quality of the forecaster panel on that series. best_single (the per-round oracle of the best forecaster) still outperforms the mechanism by roughly 16 percentage points on wind; the contribution is economic structure preserved, not universal accuracy dominance.',
    accent: '#0f766e',
  },
  {
    kicker: 'Key lever',
    title: 'Deposit policy controls how much value the mechanism adds',
    body:
      'With informative deposits, correlated with skill, the blended rule approaches the oracle benchmark. With random or noisy deposits, equal weighting is hard to beat. The deposit regime, not the aggregator alone, determines outcomes.',
    accent: '#1d3461',
  },
  {
    kicker: 'Theoretical',
    title: 'Budget-balanced and sybil-resistant (Lambert narrow sense)',
    body:
      'Total payouts equal total effective wagers to machine precision (residual < 10\u207B\u00B9\u2074). Sybil-resistant against identical clones with conserved total wager (Lambert 2008): splitting identity provides zero advantage even when the underlying attack extracts arbitrage profit. Diversified sybil strategies can extract a small advantage (\u224B6%). The Chen-Devanur-Pennock-Vaughan (2014) arbitrage interval applies: a theory-grounded arbitrage seeker earns a positive expected profit, as predicted.',
    accent: '#b45309',
  },
  {
    kicker: 'Caveat',
    title: 'Equal weighting remains a strong baseline',
    body:
      'Uniform weights are hard to beat under non-stationarity or small panels. The skill layer helps most when forecasters have heterogeneous quality and the panel runs long enough for the online estimator to converge (roughly 50 rounds with N \u2265 6).',
    accent: '#5a6175',
  },
] as const;

const NAV_CARDS = [
  { to: '/evidence',   label: 'Evidence',   desc: 'Real data, accuracy & concentration' },
  { to: '/robustness', label: 'Robustness', desc: 'Behaviour taxonomy, attacks & sensitivity' },
  { to: '/explorer',   label: 'Explorer',   desc: 'Interactive mechanism walkthrough' },
  { to: '/notes',      label: 'Notes',      desc: 'Experiments & methodology' },
] as const;

function ArrowRightIcon({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <path d="M3 7h8M8 3.5L11.5 7 8 10.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowFlow() {
  return (
    <svg
      width="34" height="12" viewBox="0 0 34 12" fill="none" aria-hidden="true"
      className="mx-auto my-2 sm:my-0"
      style={{ color: 'var(--ink-faint)' }}
    >
      <path d="M1 6h28M25 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <PageShell width="narrow">
        {/* ─── Masthead ───────────────────────────────────────── */}
        <header>
          <p
            className="eyebrow mb-5"
            style={{ color: 'var(--navy)' }}
          >
            Master&rsquo;s project &middot; Imperial College London &middot; 2026
          </p>
          <h1
            className="font-serif tracking-tight"
            style={{
              fontSize: 'clamp(36px, 5vw, 48px)',
              lineHeight: 1.1,
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            Adaptive Skill and Stake in Prediction Markets
          </h1>
          <p
            className="font-serif mt-3"
            style={{
              fontSize: 'clamp(20px, 2.5vw, 24px)',
              lineHeight: 1.3,
              color: 'var(--ink-muted)',
              fontWeight: 400,
              fontStyle: 'italic',
            }}
          >
            Coupling Self-Financed Wagering with Online Skill Learning
          </p>

          <div
            className="mt-8"
            style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-muted)' }}
          >
            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>Anastasia Cattaneo</div>
            <div style={{ marginTop: 4, color: 'var(--ink-soft)' }}>
              Supervisors: Pierre Pinson &middot; Michael Vitali
            </div>
          </div>
        </header>

        {/* ─── Research question ───────────────────────────────── */}
        <section aria-labelledby="research-question">
          <h2 id="research-question" className="sr-only">Research question</h2>
          <div
            className="p-7"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--navy)',
              borderRadius: 4,
            }}
          >
            <p className="eyebrow mb-3" style={{ color: 'var(--navy)' }}>
              Research question
            </p>
            <p
              className="font-serif"
              style={{
                fontSize: 20,
                lineHeight: 1.6,
                color: 'var(--ink-muted)',
              }}
            >
              Can an online skill-estimation layer, combined with stake-based deposits,
              produce better probabilistic forecast aggregates than equal weighting when
              forecasters are heterogeneous, the data are non-stationary, and some agents
              behave strategically?
            </p>
          </div>
        </section>

        {/* ─── Abstract / plain-language summary ─────────────── */}
        <section aria-labelledby="abstract">
          <h2 id="abstract" className="eyebrow mb-4" style={{ color: 'var(--ink-soft)' }}>
            Plain-language summary
          </h2>
          <div className="prose-academic">
            <p>
              Imagine a panel of forecasters predicting tomorrow&apos;s wind power output. Each round they
              submit a probabilistic forecast, a set of quantiles describing their uncertainty, together
              with a deposit of real money. The mechanism learns who is accurate over time and gives those
              forecasters more influence in the combined prediction. Accurate forecasters earn money from
              inaccurate ones.
            </p>
            <p>
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>The question:</span>{' '}
              does this adaptive weighting produce a better combined forecast than simply averaging everyone equally?
            </p>
            <p>
              <span style={{ color: 'var(--teal-deep)', fontWeight: 600 }}>The answer:</span>{' '}
              conditionally yes. On Elia Belgian offshore wind data (17,344 evaluation rounds,
              seven forecasting models, strictly-causal expanding normalisation) the mechanism
              reduces mean CRPS by about{' '}
              <span style={{ color: 'var(--teal-deep)', fontWeight: 700 }}>7%</span>{' '}
              relative to equal weighting, significant at any conventional level
              (Diebold&ndash;Mariano t = 40.77, p &lt; 0.001). The improvement is real but modest:
              inverse-variance weighting gets an almost identical gain (\u22127.0%), and the
              per-round oracle of best forecasters still outperforms the mechanism by roughly
              16 percentage points. The contribution is <em>conditional</em> forecasting
              improvement with preserved economic structure (budget balance, sybil resistance),
              not universal dominance.
            </p>
          </div>
        </section>

        {/* ─── Mechanism overview ───────────────────────────── */}
        <section aria-labelledby="mech-overview">
          <h2 id="mech-overview" className="eyebrow mb-5" style={{ color: 'var(--ink-soft)' }}>
            Mechanism overview
          </h2>

          <div className="grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-4">
            {STAGES.map((s, i) => (
              <Fragment key={s.mark}>
                {i > 0 && (
                  <div className="hidden sm:flex items-center justify-center">
                    <ArrowFlow />
                  </div>
                )}
                <div
                  className="p-6"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderTop: `3px solid ${s.color}`,
                    borderRadius: 4,
                  }}
                >
                  <div
                    className="font-mono font-semibold mb-3"
                    style={{
                      width: 30, height: 30,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: s.color, color: '#fff',
                      fontSize: 14, borderRadius: 3,
                    }}
                  >
                    {s.mark}
                  </div>
                  <div
                    className="font-serif"
                    style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}
                  >
                    {s.title}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-soft)', marginTop: 8 }}>
                    {s.body}
                  </p>
                </div>
              </Fragment>
            ))}
          </div>
        </section>

        {/* ─── Round-by-round process ────────────────────────── */}
        <section aria-labelledby="round-steps">
          <h2 id="round-steps" className="eyebrow mb-5" style={{ color: 'var(--ink-soft)' }}>
            What happens each round
          </h2>
          <div
            className="p-7"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 4,
            }}
          >
            <ol className="grid sm:grid-cols-2 gap-x-10 gap-y-7">
              {ROUND_STEPS.map((step) => (
                <li key={step.n} className="flex gap-4">
                  <div
                    className="font-mono shrink-0"
                    style={{
                      width: 34, height: 34, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid var(--navy)',
                      color: 'var(--navy)',
                      fontWeight: 600, fontSize: 15,
                    }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <div
                      className="font-serif"
                      style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}
                    >
                      {step.label}
                    </div>
                    <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--ink-soft)', marginTop: 4 }}>
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Contribution ──────────────────────────────────── */}
        <section aria-labelledby="contribution">
          <h2 id="contribution" className="eyebrow mb-4" style={{ color: 'var(--ink-soft)' }}>
            Contribution
          </h2>
          <p
            className="font-serif"
            style={{ fontSize: 19, lineHeight: 1.65, color: 'var(--ink-muted)' }}
          >
            This project extends the Lambert (2008) self-financed wagering mechanism with an{' '}
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>online skill layer</span>. Each round,
            every forecaster is scored with CRPS, the running loss is updated via EWMA, and the loss is
            mapped to a skill weight &sigma;<sub>i</sub> &isin; [&sigma;<sub>min</sub>, 1] that gates the
            effective wager. Weighting is adaptive and requires no prior information about skill.
          </p>
        </section>

        {/* ─── Key findings ──────────────────────────────────── */}
        <section aria-labelledby="findings">
          <h2 id="findings" className="eyebrow mb-5" style={{ color: 'var(--ink-soft)' }}>
            Principal findings
          </h2>
          <div className="space-y-5">
            {FINDINGS.map((f) => (
              <article
                key={f.title}
                className="p-6"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderLeft: `3px solid ${f.accent}`,
                  borderRadius: 4,
                }}
              >
                <p
                  className="eyebrow mb-2"
                  style={{ color: f.accent, fontSize: 11.5 }}
                >
                  {f.kicker}
                </p>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: 22, lineHeight: 1.3,
                    fontWeight: 600, color: 'var(--ink)',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)', marginTop: 10 }}
                >
                  {f.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ─── Navigation ────────────────────────────────────── */}
        <nav aria-labelledby="nav-cards">
          <h2 id="nav-cards" className="eyebrow mb-5" style={{ color: 'var(--ink-soft)' }}>
            Explore the project
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {NAV_CARDS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group block p-5 transition-colors"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="font-serif"
                    style={{ fontSize: 19, fontWeight: 600, color: 'var(--ink)' }}
                  >
                    {l.label}
                  </span>
                  <ArrowRightIcon
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    color="var(--navy)"
                  />
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-soft)', marginTop: 8 }}>
                  {l.desc}
                </p>
              </Link>
            ))}
          </div>
        </nav>

        {/* ─── Colophon ───────────────────────────────────────── */}
        <footer
          className="pt-10"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', textAlign: 'center' }}>
            Anastasia Cattaneo &middot; Imperial College London &middot; &copy; 2026
          </p>
        </footer>
    </PageShell>
  );
}
