import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from './shared/presentationConstants';

/**
 * Slide 5: Mechanism Comparison — feature comparison between
 * Lambert et al., Raja et al., and this thesis.
 */

interface ComparisonCell {
  text: string;
  present: boolean;
}

interface ComparisonRow {
  feature: string;
  lambert: ComparisonCell;
  raja: ComparisonCell;
  thesis: ComparisonCell;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Financing',
    lambert: { text: 'Self-financed', present: true },
    raja: { text: 'Self-financed + client reward', present: true },
    thesis: { text: 'Self-financed', present: true },
  },
  {
    feature: 'Weight Adaptation',
    lambert: { text: 'Static (per-round)', present: false },
    raja: { text: 'Static (per-round)', present: false },
    thesis: { text: 'Adaptive (online learning)', present: true },
  },
  {
    feature: 'Skill Learning',
    lambert: { text: 'None', present: false },
    raja: { text: 'None', present: false },
    thesis: { text: 'EWMA skill signal', present: true },
  },
  {
    feature: 'Deposit Design',
    lambert: { text: 'Not specified', present: false },
    raja: { text: 'Not specified', present: false },
    thesis: { text: 'Skill gate + deposit policy', present: true },
  },
  {
    feature: 'Key Properties',
    lambert: { text: '7 formal properties, uniqueness', present: true },
    raja: { text: 'Client reward allocation', present: true },
    thesis: { text: '7 properties + skill learning + deposit design', present: true },
  },
];

const COLUMN_HEADERS = ['Lambert et al.', 'Raja et al.', 'This Thesis'] as const;

/** Indicator: teal checkmark for present, slate dash for absent */
function Indicator({ present }: { present: boolean }) {
  if (present) {
    return (
      <span style={{ color: PALETTE.teal, fontWeight: 700, fontSize: '1.2rem', marginRight: 8 }}>
        ✓
      </span>
    );
  }
  return (
    <span style={{ color: PALETTE.slate, fontWeight: 600, fontSize: '1.2rem', marginRight: 8 }}>
      —
    </span>
  );
}

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
            maxWidth: 950,
            padding: '32px 40px',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '180px 1fr 1fr 1fr',
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
                  color: header === 'This Thesis' ? PALETTE.teal : PALETTE.slate,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  textAlign: 'center',
                  padding: '6px 8px',
                  borderRadius: 6,
                  ...(header === 'This Thesis'
                    ? {
                        borderBottom: `3px solid ${PALETTE.teal}`,
                        background: 'rgba(46, 139, 139, 0.06)',
                      }
                    : {}),
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
                gridTemplateColumns: '180px 1fr 1fr 1fr',
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
                <Indicator present={row.lambert.present} />
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: PALETTE.charcoal,
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  {row.lambert.text}
                </span>
              </div>

              {/* Raja */}
              <div style={{ textAlign: 'center' }}>
                <Indicator present={row.raja.present} />
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: PALETTE.charcoal,
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  {row.raja.text}
                </span>
              </div>

              {/* This Thesis — highlighted column */}
              <div
                style={{
                  textAlign: 'center',
                  background: 'rgba(46, 139, 139, 0.04)',
                  borderRadius: 6,
                  padding: '4px 6px',
                }}
              >
                <Indicator present={row.thesis.present} />
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: PALETTE.charcoal,
                    fontWeight: row.thesis.present ? 600 : 400,
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  {row.thesis.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
