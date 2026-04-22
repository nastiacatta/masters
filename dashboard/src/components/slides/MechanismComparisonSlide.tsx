import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from './shared/presentationConstants';

/**
 * Slide 5: Mechanism Comparison — neutral feature comparison between
 * Lambert et al., Raja et al., Vitali & Pinson, and this thesis.
 */

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

const COLUMN_HEADERS = ['Lambert et al.', 'Raja et al.', 'Vitali & Pinson', 'This Thesis'] as const;

export default function MechanismComparisonSlide() {
  return (
    <SlideShell title="Mechanism Comparison" slideNumber={5}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        {/* Card container */}
        <div
          style={{
            ...CARD_STYLE,
            width: '100%',
            maxWidth: 1100,
            padding: '32px 40px',
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
            {/* Empty cell for feature column */}
            <span />
            {COLUMN_HEADERS.map((header) => (
              <span
                key={header}
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: PALETTE.navy,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  textAlign: 'center',
                  padding: '6px 8px',
                  borderRadius: 6,
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
              }}
            >
              {/* Feature label */}
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: PALETTE.navy,
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}
              >
                {row.feature}
              </span>

              {/* Lambert */}
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: PALETTE.charcoal,
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  {row.lambert}
                </span>
              </div>

              {/* Raja */}
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: PALETTE.charcoal,
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  {row.raja}
                </span>
              </div>

              {/* Vitali & Pinson */}
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: PALETTE.charcoal,
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  {row.vitali}
                </span>
              </div>

              {/* This Thesis */}
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: PALETTE.charcoal,
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  {row.thesis}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
