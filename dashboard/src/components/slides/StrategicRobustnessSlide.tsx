import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 14: Strategic Robustness — properly centred layout.
 * Title centred, subtitle centred, attack table centred, shield centred below.
 */

interface AttackRow {
  attack: string;
  outcome: string;
  pass: boolean;
}

const ATTACKS: AttackRow[] = [
  { attack: 'Sybil (identical)', outcome: 'No advantage', pass: true },
  { attack: 'Sybil (diversified)', outcome: 'Small advantage (~6%)', pass: false },
  { attack: 'Arbitrage', outcome: 'No sustained profit', pass: true },
  { attack: 'Strategic Deposit', outcome: 'No advantage', pass: true },
];

/** SVG checkmark */
function PassIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="rgba(46, 139, 139, 0.1)" stroke={PALETTE.teal} strokeWidth="2" />
      <path d="M7 12 L10.5 15.5 L17 9" stroke={PALETTE.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** SVG warning triangle */
function WarnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L22 20 H2 Z" fill="rgba(124, 58, 237, 0.1)" stroke={PALETTE.purple} strokeWidth="2" strokeLinejoin="round" />
      <line x1="12" y1="10" x2="12" y2="14" stroke={PALETTE.purple} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.2" fill={PALETTE.purple} />
    </svg>
  );
}

/** Shield icon */
function ShieldIcon() {
  return (
    <svg width="60" height="68" viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M40 5 L70 20 V45 C70 65 55 80 40 85 C25 80 10 65 10 45 V20 L40 5Z"
        fill="rgba(46, 139, 139, 0.1)"
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
    <SlideShell title="Strategic Robustness" subtitle="Does the mechanism resist manipulation?" refText="Chen et al., 2014" slideNumber={14}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        {/* Attack table — centred */}
        <div
          style={{
            background: PALETTE.white,
            borderRadius: 12,
            border: `1.5px solid ${PALETTE.border}`,
            padding: '28px 40px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            width: '100%',
            maxWidth: 620,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: 14,
              borderBottom: `2px solid ${PALETTE.border}`,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>
              Attack Type
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>
              Outcome
            </span>
          </div>

          {ATTACKS.map((row) => (
            <div
              key={row.attack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: `1px solid ${PALETTE.border}`,
              }}
            >
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: PALETTE.navy,
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}
              >
                {row.attack}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: PALETTE.charcoal,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {row.outcome}
                </span>
                {row.pass ? <PassIcon /> : <WarnIcon />}
              </div>
            </div>
          ))}
        </div>

        {/* Shield icon + message — centred below table */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <ShieldIcon />
          <p
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: PALETTE.teal,
              fontFamily: TYPOGRAPHY.fontFamily,
              textAlign: 'center',
              maxWidth: 280,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Mechanism resists standard attacks
          </p>
        </div>

        {/* Behaviour analysis evidence — text summary */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, margin: 0, lineHeight: 1.6 }}>
            Tested across 18 behaviour presets in 9 families
          </p>
        </div>
      </div>
    </SlideShell>
  );
}
