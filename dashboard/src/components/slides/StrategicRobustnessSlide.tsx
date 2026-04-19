import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 13: Strategic Robustness — attack-outcome panel with pass/fail indicators
 * and shield icon. Wider table, bigger fonts, bigger shield, subtitle.
 */

interface AttackRow {
  attack: string;
  ratio: string;
  pass: boolean;
  warning?: boolean;
}

const ATTACKS: AttackRow[] = [
  { attack: 'Sybil (identical)', ratio: '1.000000', pass: true },
  { attack: 'Sybil (diversified)', ratio: '1.065', pass: false, warning: true },
  { attack: 'Arbitrage', ratio: '0 profit', pass: true },
  { attack: 'Strategic Deposit', ratio: '1.000000', pass: true },
];

/** Simple shield icon SVG — bigger */
function ShieldIcon() {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M40 5 L70 20 V45 C70 65 55 80 40 85 C25 80 10 65 10 45 V20 L40 5Z"
        fill="rgba(0, 132, 127, 0.1)"
        stroke={PALETTE.teal}
        strokeWidth={3.5}
      />
      <path
        d="M27 45 L36 54 L53 35"
        stroke={PALETTE.teal}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StrategicRobustnessSlide() {
  return (
    <SlideShell title="Strategic Robustness" refText="[6] Chen et al., EC 2014">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.2rem',
            color: PALETTE.warmGrey,
            fontFamily: TYPOGRAPHY.fontFamily,
            textAlign: 'center',
            margin: 0,
          }}
        >
          Does the mechanism resist manipulation attempts?
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
          {/* Attack table — wider */}
          <div
            style={{
              background: PALETTE.white,
              borderRadius: 16,
              padding: '36px 44px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              minWidth: 600,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: 14,
                borderBottom: `2px solid ${PALETTE.lightGrey}`,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily }}>
                Attack Type
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily }}>
                Profit Ratio
              </span>
            </div>

            {ATTACKS.map((row) => (
              <div
                key={row.attack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: `1px solid ${PALETTE.lightGrey}`,
                }}
              >
                <span
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    color: PALETTE.navy,
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  {row.attack}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: PALETTE.darkSlate,
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {row.ratio}
                  </span>
                  {/* Status icon — bigger */}
                  {row.pass ? (
                    <span style={{ fontSize: '1.8rem', color: PALETTE.teal }}>✓</span>
                  ) : (
                    <span style={{ fontSize: '1.8rem', color: '#D69E2E' }}>⚠</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Shield icon + message */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <ShieldIcon />
            <p
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: PALETTE.teal,
                fontFamily: TYPOGRAPHY.fontFamily,
                textAlign: 'center',
                maxWidth: 200,
                lineHeight: 1.5,
              }}
            >
              Mechanism resists standard attacks
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
