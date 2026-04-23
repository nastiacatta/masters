import { useState } from 'react';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE, FIGURE_FRAME } from './shared/presentationConstants';

/* ─── Q&A data ────────────────────────────────────────────────── */

interface QAItem {
  question: string;
  answer: string;
}

const QA_ITEMS: QAItem[] = [
  {
    question:
      "Why not just use Vitali & Pinson's approach? It has lower CRPS.",
    answer:
      "Vitali & Pinson's OGD achieves lower CRPS (−65 % wind) but uses Shapley settlement (not self-financed) and relative weights on a simplex. This project's mechanism preserves Lambert's seven formal properties, including budget balance and sybilproofness, and uses absolute skill signals. The trade-off is quantified: roughly 21 percentage points of CRPS on wind relative to OGD, in exchange for self-financing and absolute skill.",
  },
  {
    question:
      'Why does the best single forecaster (Naive) still beat the aggregate?',
    answer:
      'Wind power is highly autocorrelated, making Naive persistence exceptionally strong. The mechanism improves the aggregate substantially (−44 % relative to equal weights) but the ceiling is set by the best individual. This is a known limitation of linear opinion pools — future work could explore nonlinear combination methods.',
  },
  {
    question:
      'How sensitive are the results to hyperparameter choices (γ, ρ, λ)?',
    answer:
      'The parameter sweep experiments show the mechanism is robust across a wide range. γ (skill learning rate) has the strongest effect — too low means slow adaptation, too high means overfitting to noise. The tuned values (γ = 16, ρ = 0.5, λ = 0.05) were selected via grid search on a validation split.',
  },
  {
    question: 'What happens with fewer forecasters?',
    answer:
      'The mechanism needs heterogeneity to work. With N < 4, there is not enough diversity for the skill signal to exploit. The sweet spot is N ≥ 6 with genuinely different model families.',
  },
  {
    question: 'Is truthfulness guaranteed?',
    answer:
      "Truthfulness holds under risk neutrality, following Lambert et al.'s original assumption. Under risk aversion, forecasters may shade their reports. This is a known limitation shared with all Lambert-family mechanisms.",
  },
  {
    question: 'How does the mechanism handle regime changes?',
    answer:
      'The EWMA skill signal naturally adapts — recent performance is weighted more heavily. The staleness decay also helps: if a forecaster becomes stale during a regime shift, their skill decays toward baseline. Seasonal analysis on Elia wind shows the mechanism improves in all four seasons.',
  },
  {
    question: 'What is the computational cost?',
    answer:
      'Each round is O(N) where N is the number of forecasters. The EWMA update, skill gate, and Lambert settlement are all linear. The full 17,544-round Elia experiment runs in under 30 seconds on a laptop.',
  },
  {
    question: 'How does this compare to simple inverse-variance weighting?',
    answer:
      'Inverse-variance weighting uses forecast spread as a proxy for quality. Our mechanism learns skill from realised accuracy over time, which is more informative. On Elia wind, the mechanism outperforms inverse-variance by a wide margin.',
  },
  {
    question: 'Could this work with non-probabilistic (point) forecasts?',
    answer:
      'The mechanism requires probabilistic forecasts (quantiles) because the CRPS scoring rule needs a full distribution. Point forecasts could be converted to distributions via residual resampling, which is what we do for the 7 models.',
  },
  {
    question: 'What about the warm-up period?',
    answer:
      'The first 200 rounds are a warm-up where all forecasters have equal skill. This is needed for the EWMA to accumulate enough history. Results are reported on the post-warm-up period only.',
  },
];


/* ─── Extra figures references ────────────────────────────────── */

const BASE = import.meta.env.BASE_URL;

const EXTRA_FIGURES = [
  { label: 'Parameter sweep results', file: 'parameter_sweep.png' },
  { label: 'Calibration reliability diagram', file: 'calibration_reliability.png' },
  { label: 'Behaviour matrix (18 presets × 9 families)', file: 'behaviour_concentration.png' },
  { label: 'Seasonal decomposition of Elia wind results', file: 'real_data_validation.png' },
];

/* ─── Tab type ────────────────────────────────────────────────── */

type AppendixTab = 'qa' | 'figures' | 'guarantees' | 'deposit' | 'mechanism' | 'skillmath' | 'params' | 'crps';

/* ─── Mechanism Comparison data (moved from main deck) ─────── */

interface ComparisonRow {
  feature: string;
  lambert: string;
  raja: string;
  vitali: string;
  thesis: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Financing',
    lambert: 'Self-financed',
    raja: 'Self-financed + client reward',
    vitali: 'Shapley payoffs (not self-financed)',
    thesis: 'Self-financed',
  },
  {
    feature: 'Weight Adaptation',
    lambert: 'Static (per-round)',
    raja: 'Static (per-round)',
    vitali: 'Online gradient descent',
    thesis: 'Online EWMA',
  },
  {
    feature: 'Skill/Weight Type',
    lambert: 'Equal or deposit-based',
    raja: 'Equal or deposit-based',
    vitali: 'Relative (simplex)',
    thesis: 'Absolute (per-forecaster)',
  },
  {
    feature: 'Intermittency',
    lambert: 'Not handled',
    raja: 'Not handled',
    vitali: 'Handled (online)',
    thesis: 'Staleness decay',
  },
  {
    feature: 'Key Properties',
    lambert: '7 formal properties, uniqueness',
    raja: 'Client reward, payoff allocation',
    vitali: 'Regret bounds, missing data',
    thesis: '7 properties + skill learning',
  },
];

const COMPARISON_HEADERS = ['Lambert et al.', 'Raja et al.', 'Vitali & Pinson', 'This Project'] as const;

const COMPARISON_HEADER_TINTS = [
  'rgba(0, 62, 116, 0.08)',
  'rgba(100, 116, 139, 0.08)',
  'rgba(124, 58, 237, 0.08)',
  'rgba(46, 139, 139, 0.10)',
] as const;

/* ─── Mechanism Guarantees data ───────────────────────────────── */

interface GuaranteeRow {
  property: string;
  meaning: string;
  pass: boolean;
}

const GUARANTEES: GuaranteeRow[] = [
  {
    property: 'Budget gap',
    meaning: 'Self-financed — no external subsidy needed',
    pass: true,
  },
  {
    property: 'Mean profit',
    meaning: 'Zero-sum — no money created or destroyed',
    pass: true,
  },
  {
    property: 'Sybil ratio',
    meaning: 'No advantage from splitting',
    pass: true,
  },
  {
    property: 'Noise-skill corr.',
    meaning: 'Skilled forecasters reliably rewarded',
    pass: true,
  },
];

/** SVG checkmark icon for guarantees table */
function CheckIcon({ pass }: { pass: boolean }) {
  if (pass) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" fill="rgba(46, 139, 139, 0.1)" stroke={PALETTE.teal} strokeWidth="2" />
        <path d="M9 14 L12.5 17.5 L19 11" stroke={PALETTE.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" fill="rgba(232, 93, 74, 0.1)" stroke={PALETTE.coral} strokeWidth="2" />
      <path d="M10 10 L18 18 M18 10 L10 18" stroke={PALETTE.coral} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Q&A card ────────────────────────────────────────────────── */

function QACard({ item, index }: { item: QAItem; index: number }) {
  return (
    <div
      style={{
        ...CARD_STYLE,
        padding: '18px 22px',
        marginBottom: 14,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '1.15rem',
          fontWeight: 700,
          color: PALETTE.navy,
          lineHeight: 1.45,
          fontFamily: TYPOGRAPHY.fontFamily,
        }}
      >
        Q{index + 1}. "{item.question}"
      </p>
      <p
        style={{
          margin: '8px 0 0',
          fontSize: '1.05rem',
          fontWeight: 400,
          color: PALETTE.charcoal,
          lineHeight: 1.55,
          fontFamily: TYPOGRAPHY.fontFamily,
        }}
      >
        → {item.answer}
      </p>
    </div>
  );
}

/* ─── Figure reference card ───────────────────────────────────── */

function FigureCard({ label, file }: { label: string; file: string }) {
  return (
    <div
      style={{
        ...CARD_STYLE,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <img
        src={`${BASE}presentation-plots/${file}`}
        alt={label}
        style={{
          flex: 1,
          maxWidth: '100%',
          maxHeight: 400,
          objectFit: 'contain',
          borderRadius: 8,
        }}
      />
      <span
        style={{
          fontSize: '0.92rem',
          fontWeight: 600,
          color: PALETTE.navy,
          fontFamily: TYPOGRAPHY.fontFamily,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Tab button ──────────────────────────────────────────────── */

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        padding: '8px 24px',
        fontSize: '0.92rem',
        fontWeight: active ? 700 : 500,
        fontFamily: TYPOGRAPHY.fontFamily,
        color: active ? PALETTE.white : PALETTE.navy,
        background: active ? PALETTE.teal : PALETTE.lightBg,
        border: `1.5px solid ${active ? PALETTE.teal : PALETTE.border}`,
        borderRadius: 8,
        cursor: 'pointer',
        letterSpacing: '0.03em',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

/**
 * Appendix slide — backup material for Q&A.
 * No slide number, no section bar. Uses SlideShell without slideNumber.
 * Props are passed by PresentationPage for consistency with other slides; content is static.
 */
export default function AppendixSlide(_props: {
  slide?: unknown;
  palette?: unknown;
  fontFamily?: string;
}) {
  const [tab, setTab] = useState<AppendixTab>('qa');

  return (
    <SlideShell title="Appendix" subtitle="Backup slides for Q&A">
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          flexShrink: 0,
        }}
      >
        <TabButton
          label="A. Anticipated Questions"
          active={tab === 'qa'}
          onClick={() => setTab('qa')}
        />
        <TabButton
          label="B. Extra Figures"
          active={tab === 'figures'}
          onClick={() => setTab('figures')}
        />
        <TabButton
          label="C. Mechanism Guarantees"
          active={tab === 'guarantees'}
          onClick={() => setTab('guarantees')}
        />
        <TabButton
          label="D. Deposit Design"
          active={tab === 'deposit'}
          onClick={() => setTab('deposit')}
        />
        <TabButton
          label="E. Mechanism Comparison"
          active={tab === 'mechanism'}
          onClick={() => setTab('mechanism')}
        />
        <TabButton
          label="F. Skill Signal Math"
          active={tab === 'skillmath'}
          onClick={() => setTab('skillmath')}
        />
        <TabButton
          label="G. Tuned Parameters"
          active={tab === 'params'}
          onClick={() => setTab('params')}
        />
        <TabButton
          label="H. CRPS Explained"
          active={tab === 'crps'}
          onClick={() => setTab('crps')}
        />
      </div>

      {/* Tab content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {tab === 'qa' && (
          <div>
            {QA_ITEMS.map((item, i) => (
              <QACard key={i} item={item} index={i} />
            ))}
          </div>
        )}

        {tab === 'figures' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 20,
            }}
          >
            {EXTRA_FIGURES.map((fig) => (
              <FigureCard key={fig.file} label={fig.label} file={fig.file} />
            ))}
          </div>
        )}

        {tab === 'guarantees' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            <p
              style={{
                fontSize: '1.15rem',
                color: PALETTE.slate,
                fontFamily: TYPOGRAPHY.fontFamily,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Verified to machine precision across all properties
            </p>

            <div
              style={{
                ...CARD_STYLE,
                width: '100%',
                padding: '38px 48px',
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 170px 1fr',
                  gap: 16,
                  paddingBottom: 14,
                  borderBottom: `2px solid ${PALETTE.border}`,
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: '1.06rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, textAlign: 'center' }}>
                  Status
                </span>
                <span style={{ fontSize: '1.06rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>
                  Property
                </span>
                <span style={{ fontSize: '1.06rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>
                  What it means
                </span>
              </div>

              {GUARANTEES.map((row, i) => (
                <div
                  key={row.property}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 170px 1fr',
                    gap: 16,
                    alignItems: 'center',
                    padding: '18px 0 18px 0',
                    borderBottom: i < GUARANTEES.length - 1 ? `1px solid ${PALETTE.border}` : 'none',
                    borderLeft: row.pass ? `4px solid ${PALETTE.teal}` : '4px solid transparent',
                    paddingLeft: 12,
                    borderRadius: '4px 0 0 4px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <CheckIcon pass={row.pass} />
                  </div>
                  <span
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 600,
                      color: PALETTE.navy,
                      fontFamily: TYPOGRAPHY.fontFamily,
                    }}
                  >
                    {row.property}
                  </span>
                  <span
                    style={{
                      fontSize: '1.2rem',
                      color: PALETTE.teal,
                      fontWeight: 600,
                      fontFamily: TYPOGRAPHY.fontFamily,
                    }}
                  >
                    {row.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'deposit' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <div style={{ background: PALETTE.purple, color: PALETTE.white, fontSize: '1rem', fontWeight: 700, padding: '8px 18px', borderRadius: 16, fontFamily: TYPOGRAPHY.fontFamily }}>
                Bankroll+Conf: −44% relative to Fixed
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', ...FIGURE_FRAME }}>
              <img
                src={`${BASE}presentation-plots/deposit_policy_comparison.png`}
                alt="Deposit policy comparison showing Oracle, Bankroll+Confidence, Fixed, and Random"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
              />
            </div>
            <p style={{ fontSize: '1rem', color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
              Practical deposit rules capture most of the available gain — but we cannot control what forecasters stake
            </p>
          </div>
        )}

        {tab === 'mechanism' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            <div
              style={{
                ...CARD_STYLE,
                width: '100%',
                padding: '36px 44px',
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 1fr 1fr 1fr',
                  gap: 16,
                  paddingBottom: 14,
                  borderBottom: `2px solid ${PALETTE.border}`,
                  marginBottom: 10,
                }}
              >
                <span />
                {COMPARISON_HEADERS.map((header, idx) => (
                  <span
                    key={header}
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: PALETTE.navy,
                      fontFamily: TYPOGRAPHY.fontFamily,
                      textAlign: 'center',
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: COMPARISON_HEADER_TINTS[idx],
                    }}
                  >
                    {header}
                  </span>
                ))}
              </div>

              {/* Data rows */}
              {COMPARISON_DATA.map((row, i) => (
                <div
                  key={row.feature}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr 1fr 1fr 1fr',
                    gap: 16,
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom:
                      i < COMPARISON_DATA.length - 1
                        ? `1px solid ${PALETTE.border}`
                        : 'none',
                    background: i % 2 === 1 ? 'rgba(0,0,0,0.02)' : 'transparent',
                    borderRadius: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 600,
                      color: PALETTE.navy,
                      fontFamily: TYPOGRAPHY.fontFamily,
                      borderLeft: `4px solid ${PALETTE.navy}`,
                      paddingLeft: 12,
                    }}
                  >
                    {row.feature}
                  </span>
                  {[row.lambert, row.raja, row.vitali, row.thesis].map((cell, ci) => (
                    <div key={ci} style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '1.12rem',
                          color: PALETTE.charcoal,
                          fontFamily: TYPOGRAPHY.fontFamily,
                          lineHeight: 1.45,
                        }}
                      >
                        {cell}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'skillmath' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Step 1: Per-round loss */}
            <div style={{ ...CARD_STYLE, padding: '24px 32px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
                Step 1: Per-Round Forecasting Loss
              </h4>
              <p style={{ margin: 0, fontSize: '1.05rem', color: PALETTE.charcoal, lineHeight: 1.6, fontFamily: TYPOGRAPHY.fontFamily }}>
                Each round, forecaster <em>i</em> submits a probabilistic forecast (a set of quantiles). After the outcome is observed, the forecast is scored using the <strong>Continuous Ranked Probability Score (CRPS)</strong>. CRPS is always ≥ 0, with lower values indicating better forecasts. This gives a per-round loss:
              </p>
              <div style={{ margin: '12px 0', padding: '12px 20px', background: 'rgba(46, 139, 139, 0.06)', borderRadius: 8, fontFamily: 'monospace', fontSize: '1.15rem', color: PALETTE.navy, fontWeight: 600 }}>
                ℓᵢ(t) = CRPS(qᵢ(t), y(t)) ≥ 0
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.slate, lineHeight: 1.5, fontFamily: TYPOGRAPHY.fontFamily }}>
                where qᵢ(t) is the submitted quantile forecast and y(t) is the realised outcome.
              </p>
            </div>

            {/* Step 2: EWMA accumulator */}
            <div style={{ ...CARD_STYLE, padding: '24px 32px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
                Step 2: Loss Accumulator (EWMA)
              </h4>
              <p style={{ margin: 0, fontSize: '1.05rem', color: PALETTE.charcoal, lineHeight: 1.6, fontFamily: TYPOGRAPHY.fontFamily }}>
                The mechanism maintains an <strong>exponentially weighted moving average</strong> of past losses. Recent performance is weighted more heavily than distant history:
              </p>
              <div style={{ margin: '12px 0', padding: '12px 20px', background: 'rgba(46, 139, 139, 0.06)', borderRadius: 8, fontFamily: 'monospace', fontSize: '1.15rem', color: PALETTE.navy, fontWeight: 600 }}>
                Lᵢ(t) = ρ · Lᵢ(t−1) + (1 − ρ) · ℓᵢ(t)
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.slate, lineHeight: 1.5, fontFamily: TYPOGRAPHY.fontFamily }}>
                ρ ∈ (0, 1) is the decay parameter. Since ℓᵢ(t) ≥ 0 always, Lᵢ(t) ≥ 0 always. A consistently bad forecaster accumulates Lᵢ → large; a good one keeps Lᵢ ≈ 0. There is <strong>no upper bound</strong> on Lᵢ — it can grow without limit if the forecaster is persistently poor.
              </p>
            </div>

            {/* Step 3: Exponential mapping */}
            <div style={{ ...CARD_STYLE, padding: '24px 32px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
                Step 3: Exponential Mapping to Bounded Skill
              </h4>
              <p style={{ margin: 0, fontSize: '1.05rem', color: PALETTE.charcoal, lineHeight: 1.6, fontFamily: TYPOGRAPHY.fontFamily }}>
                The unbounded accumulator is compressed into the interval [σ_min, 1] via an exponential decay:
              </p>
              <div style={{ margin: '12px 0', padding: '12px 20px', background: 'rgba(46, 139, 139, 0.06)', borderRadius: 8, fontFamily: 'monospace', fontSize: '1.15rem', color: PALETTE.navy, fontWeight: 600 }}>
                σᵢ = σ_min + (1 − σ_min) · exp(−γ · Lᵢ)
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.slate, lineHeight: 1.5, fontFamily: TYPOGRAPHY.fontFamily }}>
                γ {'>'} 0 controls sensitivity. When Lᵢ ≈ 0 (good): σᵢ ≈ 1. When Lᵢ is large (bad): σᵢ → σ_min. The floor σ_min {'>'} 0 ensures every forecaster retains some market access — no one is permanently excluded.
              </p>
            </div>

            {/* Step 4: Staleness decay */}
            <div style={{ ...CARD_STYLE, padding: '24px 32px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
                Step 4: Staleness Decay (Absent Forecasters)
              </h4>
              <p style={{ margin: 0, fontSize: '1.05rem', color: PALETTE.charcoal, lineHeight: 1.6, fontFamily: TYPOGRAPHY.fontFamily }}>
                When a forecaster is absent in round t, their loss state decays toward a neutral baseline:
              </p>
              <div style={{ margin: '12px 0', padding: '12px 20px', background: 'rgba(46, 139, 139, 0.06)', borderRadius: 8, fontFamily: 'monospace', fontSize: '1.15rem', color: PALETTE.navy, fontWeight: 600 }}>
                Lᵢ(t) = λ · L_baseline + (1 − λ) · Lᵢ(t−1)
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.slate, lineHeight: 1.5, fontFamily: TYPOGRAPHY.fontFamily }}>
                λ is the staleness rate. This prevents a forecaster from building a high reputation and then disappearing to preserve it. With no new evidence, skill gradually reverts to a prior.
              </p>
            </div>
          </div>
        )}

        {tab === 'params' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <p style={{ margin: 0, fontSize: '1.1rem', color: PALETTE.charcoal, lineHeight: 1.6, fontFamily: TYPOGRAPHY.fontFamily }}>
              All hyperparameters were selected via <strong>grid search on a held-out validation split</strong> of the Elia wind dataset. The table below lists each parameter, its tuned value, and its role in the mechanism.
            </p>

            <div style={{ ...CARD_STYLE, width: '100%', padding: '36px 44px' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr', gap: 16, paddingBottom: 14, borderBottom: `2px solid ${PALETTE.border}`, marginBottom: 10 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>Parameter</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, textAlign: 'center' }}>Value</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>Role</span>
              </div>

              {[
                { symbol: 'γ (gamma)', value: '16', role: 'Skill learning rate — controls how sharply the exponential mapping separates good from bad forecasters. Higher γ means faster differentiation.' },
                { symbol: 'ρ (rho)', value: '0.5', role: 'EWMA decay — balances recent vs. historical performance. At 0.5, the half-life is about 1 round, so the mechanism adapts quickly.' },
                { symbol: 'λ (lambda)', value: '0.05', role: 'Staleness decay rate — how fast an absent forecaster\'s skill reverts to baseline. Low λ means slow decay, giving forecasters time to return.' },
                { symbol: 'σ_min', value: '0.05', role: 'Skill floor — the minimum skill any forecaster retains. Ensures no one is permanently excluded from the aggregate.' },
                { symbol: 'Warm-up', value: '200 rounds', role: 'Initial period where all forecasters have equal skill. Allows the EWMA to accumulate enough history before differentiation begins.' },
              ].map((row, i, arr) => (
                <div
                  key={row.symbol}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 120px 1fr',
                    gap: 16,
                    alignItems: 'center',
                    padding: '18px 0',
                    borderBottom: i < arr.length - 1 ? `1px solid ${PALETTE.border}` : 'none',
                    borderLeft: `4px solid ${PALETTE.teal}`,
                    paddingLeft: 12,
                    borderRadius: '4px 0 0 4px',
                  }}
                >
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, fontFamily: 'monospace' }}>{row.symbol}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: PALETTE.teal, fontFamily: 'monospace', textAlign: 'center' }}>{row.value}</span>
                  <span style={{ fontSize: '1.05rem', color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, lineHeight: 1.5 }}>{row.role}</span>
                </div>
              ))}
            </div>

            <div style={{ ...CARD_STYLE, padding: '20px 28px', background: 'rgba(46, 139, 139, 0.04)' }}>
              <p style={{ margin: 0, fontSize: '1rem', color: PALETTE.slate, lineHeight: 1.6, fontFamily: TYPOGRAPHY.fontFamily }}>
                <strong>Sensitivity:</strong> The parameter sweep experiments show the mechanism is robust across a wide range of values. γ has the strongest effect — too low means slow adaptation, too high means overfitting to noise. The other parameters are less sensitive.
              </p>
            </div>
          </div>
        )}

        {tab === 'crps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* What is CRPS */}
            <div style={{ ...CARD_STYLE, padding: '24px 32px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
                What is CRPS?
              </h4>
              <p style={{ margin: 0, fontSize: '1.05rem', color: PALETTE.charcoal, lineHeight: 1.6, fontFamily: TYPOGRAPHY.fontFamily }}>
                The <strong>Continuous Ranked Probability Score</strong> measures how close a probabilistic forecast is to the realised outcome. It generalises mean absolute error to full distributions. CRPS is always ≥ 0, and <strong>lower is better</strong>.
              </p>
              <div style={{ margin: '12px 0', padding: '12px 20px', background: 'rgba(46, 139, 139, 0.06)', borderRadius: 8, fontFamily: 'monospace', fontSize: '1.1rem', color: PALETTE.navy, fontWeight: 600 }}>
                CRPS(F, y) = ∫ [F(x) − 𝟙(x ≥ y)]² dx
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.slate, lineHeight: 1.5, fontFamily: TYPOGRAPHY.fontFamily }}>
                where F is the forecast CDF and y is the observed value. A perfect forecast concentrating all mass at y gives CRPS = 0.
              </p>
            </div>

            {/* What does 44% reduction mean */}
            <div style={{ ...CARD_STYLE, padding: '24px 32px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
                What Does "44% CRPS Reduction" Mean?
              </h4>
              <p style={{ margin: 0, fontSize: '1.05rem', color: PALETTE.charcoal, lineHeight: 1.6, fontFamily: TYPOGRAPHY.fontFamily }}>
                The mechanism's aggregate forecast has a mean CRPS that is <strong>44% lower</strong> than equal-weight averaging on the Elia wind dataset. The calculation:
              </p>
              <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 180, fontSize: '1.05rem', fontWeight: 600, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>Equal weights CRPS</div>
                  <div style={{ padding: '8px 20px', background: 'rgba(232, 93, 74, 0.08)', borderRadius: 8, fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: PALETTE.coral }}>≈ 0.068</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 180, fontSize: '1.05rem', fontWeight: 600, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>Mechanism CRPS</div>
                  <div style={{ padding: '8px 20px', background: 'rgba(46, 139, 139, 0.08)', borderRadius: 8, fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: PALETTE.teal }}>≈ 0.038</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 180, fontSize: '1.05rem', fontWeight: 600, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>Relative change</div>
                  <div style={{ padding: '8px 20px', background: 'rgba(0, 62, 116, 0.06)', borderRadius: 8, fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: PALETTE.navy }}>(0.038 − 0.068) / 0.068 ≈ −44%</div>
                </div>
              </div>
            </div>

            {/* Context: other benchmarks */}
            <div style={{ ...CARD_STYLE, padding: '24px 32px', background: 'rgba(46, 139, 139, 0.04)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
                How Does This Compare?
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { label: 'This Project', wind: '−44%', elec: '−8%', tint: `rgba(46, 139, 139, 0.08)`, color: PALETTE.teal },
                  { label: 'Vitali & Pinson', wind: '−65%', elec: '−20%', tint: `rgba(124, 58, 237, 0.08)`, color: PALETTE.purple },
                  { label: 'Raja et al.', wind: '−2.5%', elec: '−2.3%', tint: `rgba(100, 116, 139, 0.08)`, color: PALETTE.slate },
                ].map((item) => (
                  <div key={item.label} style={{ padding: '16px 20px', background: item.tint, borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: item.color, fontFamily: TYPOGRAPHY.fontFamily, marginBottom: 8 }}>{item.label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: PALETTE.navy, fontFamily: 'monospace' }}>{item.wind} wind</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: PALETTE.charcoal, fontFamily: 'monospace', marginTop: 4 }}>{item.elec} electricity</div>
                  </div>
                ))}
              </div>
              <p style={{ margin: '14px 0 0', fontSize: '0.95rem', color: PALETTE.slate, lineHeight: 1.5, fontFamily: TYPOGRAPHY.fontFamily }}>
                Vitali & Pinson achieve lower CRPS but use Shapley settlement (not self-financed). This project preserves all seven formal properties while still achieving substantial improvement over equal weights.
              </p>
            </div>
          </div>
        )}
      </div>
    </SlideShell>
  );
}
