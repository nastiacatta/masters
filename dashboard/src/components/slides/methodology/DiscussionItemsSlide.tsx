import SlideShell from '../shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from '../shared/presentationConstants';

/**
 * Backup slide M7 — the six open items to raise in the viva / debrief, ranked.
 */

interface Item {
  index: string;
  title: string;
  body: string;
}

const TOP_SIX: Item[] = [
  {
    index: '1',
    title: 'Why the headline dropped from −44% to −7.1%',
    body: 'B1 is the biggest mover; the fix (strictly-causal expanding normalisation) is the right protocol. The thesis is still defensible: (a) −7.1% on 17 344 rounds is DM t = 22.35 with block-bootstrap CI well below zero; (b) the value was never "best CRPS" but "CRPS-competitive + four Lambert economic guarantees simultaneously"; (c) the recalibration layer closes 91% of centre miscalibration at +1.6% CRPS, near the GBR calibration-sharpness floor. Open question: frame the honest-number chapter as a correction of the draft or as the load-bearing result?',
  },
  {
    index: '2',
    title: 'Mechanism tied with inverse-CRPS (−7.1% vs −7.0%)',
    body: 'On this slice, skill-gating on top of Bates–Granger is within noise. This makes the packaging argument the load-bearing one: incentive-compatible settlement + budget balance + sybil-proofness + online adaptivity as a single mechanism. Open question: how aggressively to push this in the opening narrative?',
  },
  {
    index: '3',
    title: 'Mechanism loses to best-single (XGBoost) by ~16 pp',
    body: 'Correct finding for a highly autocorrelated series with a dominant forecaster (forecast-combination puzzle). One-line defence: "the mechanism reconstructs the best-single ordering from data alone (Spearman σ vs CRPS = 1.0), which is the value on any panel where the operator does not know a priori which model is best."',
  },
  {
    index: '4',
    title: 'Electricity null result',
    body: 'All seven forecasters cluster within 1% CRPS; mechanism returns a null (DM t = 0.008, p = 0.994). Correct behaviour — a spurious positive would indicate over-fitting of σ. Open question: frame as the mechanism\'s honesty property or as a limitation?',
  },
  {
    index: '5',
    title: 'Restart-per-season decomposition',
    body: 'Full-run −7.1% is partly cross-seasonal adaptation; within each season the mechanism is −0.83% to −1.20% without exception. Not a contradiction — a decomposition. Open question: how to present it so neither reading is overstated.',
  },
  {
    index: '6',
    title: 'Items not regenerated under the full fixed pipeline',
    body: '(i) Horizon experiments used synthetic-tuned defaults (γ, ρ, λ) = (4, 0.1, 0.3) instead of real-data tuned (16, 0.5, 0.05) (audit-M3). (ii) Published-OGD head-to-head table is still under warmup-window normalisation. (iii) Per-τ Michael OGD scaffolding landed but is not wired into runner.py — the current michael_ogd_centered_median_fan row is still the shifted-median fan. Open question: what blocks submission vs gets flagged as future work (~1–3 h rerun each).',
  },
];

const SEPARATE: Item[] = [
  {
    index: 'A',
    title: 'Grid-match sign flip',
    body: 'Mechanism went from "−13% worse than Elia real-time" (3-grid) to "+8% better" (matched 9-grid). Pre-fix number was honest but compared two different Riemann approximations of the same integral. The 9-grid version is apples-to-apples.',
  },
  {
    index: 'B',
    title: 'Diebold–Mariano HAC bandwidth (Andrews 1991)',
    body: 'Andrews (1991) gives a data-driven formula for the number of autocorrelation lags to correct for when computing DM standard errors: M = ⌊4 · (n / 100)^(2/9)⌋ with Bartlett kernel weights. On the wind run it picks lag 12 and gives DM t = 22.35. The legacy h=1 HAC (no autocorrelation correction) gave t = 40.77 — inflated because it under-estimates long-run variance on an autocorrelated loss differential. Both are significant at any threshold; Andrews is the correct one.',
  },
  {
    index: 'C',
    title: 'Warmup-window clipping on the audit slice',
    body: 'Static normalisation on a 3 000-point winter-wind slice clips ~33% of eval values to {0, 1}. Mitigated by normalize_mode="expanding" for all new runs. Audit slice retained only as calibration anchor and per-τ coverage reference.',
  },
];

export default function DiscussionItemsSlide() {
  return (
    <SlideShell
      title="Open items to flag in the viva"
      subtitle="Six ranked items, plus three separate-but-important ones"
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, letterSpacing: '0.12em', marginBottom: 2 }}>
          TOP SIX
        </div>

        {TOP_SIX.map((item) => (
          <div
            key={item.index}
            style={{
              ...CARD_STYLE,
              padding: '16px 22px',
              display: 'grid',
              gridTemplateColumns: '44px 1fr',
              gap: 18,
              alignItems: 'start',
              borderLeft: `4px solid ${PALETTE.teal}`,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: 'rgba(46, 139, 139, 0.12)',
                color: PALETTE.teal,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 800,
                fontFamily: 'monospace',
              }}
            >
              {item.index}
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, marginBottom: 6 }}>
                {item.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: PALETTE.charcoal, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
                {item.body}
              </p>
            </div>
          </div>
        ))}

        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, letterSpacing: '0.12em', marginTop: 8, marginBottom: 2 }}>
          SEPARATE-BUT-IMPORTANT
        </div>

        {SEPARATE.map((item) => (
          <div
            key={item.index}
            style={{
              ...CARD_STYLE,
              padding: '14px 22px',
              display: 'grid',
              gridTemplateColumns: '44px 1fr',
              gap: 18,
              alignItems: 'start',
              borderLeft: `4px solid ${PALETTE.purple}`,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: 'rgba(124, 58, 237, 0.12)',
                color: PALETTE.purple,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.05rem',
                fontWeight: 800,
                fontFamily: 'monospace',
              }}
            >
              {item.index}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, marginBottom: 6 }}>
                {item.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: PALETTE.charcoal, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
                {item.body}
              </p>
            </div>
          </div>
        ))}

      </div>
    </SlideShell>
  );
}
