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

type AppendixTab = 'qa' | 'figures' | 'guarantees' | 'deposit';

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
      </div>
    </SlideShell>
  );
}
