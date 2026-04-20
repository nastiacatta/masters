import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

export default function DepositAblationSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 16 }}>
        <p style={{ fontSize: TYPOGRAPHY.chartTitle.fontSize, fontWeight: TYPOGRAPHY.chartTitle.fontWeight, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, margin: 0 }}>
          CRPS by Deposit Policy
        </p>
        <div style={{ background: PALETTE.purple, color: PALETTE.white, fontSize: '1rem', fontWeight: 700, padding: '8px 18px', borderRadius: 16, fontFamily: TYPOGRAPHY.fontFamily }}>
          Bankroll+Conf: −11% vs Fixed
        </div>
      </div>
      <img
        src={`${BASE}presentation-plots/deposit_policy_comparison.png`}
        alt="Deposit policy comparison showing Oracle, Bankroll+Confidence, Fixed, and Random"
        style={{ maxWidth: '100%', maxHeight: '85%', objectFit: 'contain', borderRadius: 10 }}
      />
      <p style={{ fontSize: '0.9rem', color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, marginTop: 12, textAlign: 'center' }}>
        Practical deposit rules capture most of the available gain — but we cannot control what forecasters stake
      </p>
    </div>
  );
}
