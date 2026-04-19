import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 9: Mechanism Guarantees — wider panel, bigger fonts,
 * prominent checkmark column, green left-border on passing rows.
 */

interface GuaranteeRow {
  property: string;
  meaning: string;
  status: string;
  pass: boolean;
}

const GUARANTEES: GuaranteeRow[] = [
  {
    property: 'Budget gap',
    meaning: 'Self-financed — no external subsidy needed',
    status: '< 10⁻¹³',
    pass: true,
  },
  {
    property: 'Mean profit',
    meaning: 'Zero-sum — no money created or destroyed',
    status: '< 10⁻¹³',
    pass: true,
  },
  {
    property: 'Sybil ratio',
    meaning: 'No advantage from splitting',
    status: '= 1.0 (exact)',
    pass: true,
  },
  {
    property: 'Noise-skill corr.',
    meaning: 'Skilled forecasters reliably rewarded',
    status: 'r = −0.98',
    pass: true,
  },
];

export default function CorrectnessSlide() {
  return (
    <SlideShell title="Mechanism Guarantees">
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
        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.4rem',
            color: PALETTE.warmGrey,
            fontFamily: TYPOGRAPHY.fontFamily,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Verified to machine precision across all properties
        </p>

        {/* Guarantees panel — wider */}
        <div
          style={{
            width: '100%',
            maxWidth: 850,
            background: PALETTE.white,
            borderRadius: 16,
            padding: '36px 44px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 170px 1fr 160px',
              gap: 16,
              paddingBottom: 14,
              borderBottom: `2px solid ${PALETTE.lightGrey}`,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 700, color: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily, textAlign: 'center' }}>
              ✓
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily }}>
              Property
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily }}>
              What it means
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily, textAlign: 'right' }}>
              Result
            </span>
          </div>

          {GUARANTEES.map((row, i) => (
            <div
              key={row.property}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 170px 1fr 160px',
                gap: 16,
                alignItems: 'center',
                padding: '18px 0 18px 0',
                borderBottom: i < GUARANTEES.length - 1 ? `1px solid ${PALETTE.lightGrey}` : 'none',
                borderLeft: row.pass ? `4px solid ${PALETTE.teal}` : '4px solid transparent',
                paddingLeft: 12,
                borderRadius: '4px 0 0 4px',
              }}
            >
              {/* Checkmark column — larger, more prominent */}
              <span
                style={{
                  fontSize: '36px',
                  color: row.pass ? PALETTE.teal : PALETTE.deepRed,
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                {row.pass ? '✓' : '✗'}
              </span>
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
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: PALETTE.darkSlate,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'right',
                }}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
