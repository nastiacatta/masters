import { useState, useEffect, useCallback } from 'react';
import PasswordGate from '@/components/slides/PasswordGate';

/**
 * Full-screen presentation mode for thesis defence.
 * Imperial College styling: Arial font, navy (#000080) / blue (#0000CD) palette.
 * Arrow keys navigate between slides. Spacebar advances. Escape toggles controls.
 *
 * FORMATTING: All text sized for projection — title 4rem+, headings 2.5rem+,
 * body 1.5rem+, bullets text-xl minimum. Split slides: 40/60 text/image.
 */

const IMPERIAL = {
  navy: '#000080',
  blue: '#0000CD',
  lightGrey: '#F5F5F5',
  smoke: '#708090',
  white: '#FFFFFF',
  dark: '#232333',
} as const;

const BASE = import.meta.env.BASE_URL;

/* ─── Slide data ─────────────────────────────────────────────── */

interface SlideData {
  id: string;
  type: 'title' | 'section' | 'content' | 'split' | 'columns' | 'closing';
  title?: string;
  subtitle?: string;
  bullets?: string[];
  columns?: { heading: string; items: string[] }[];
  leftBullets?: string[];
  image?: string;
  highlight?: string;
  dark?: boolean;
}

const SLIDES: SlideData[] = [
  /* ── 1  TITLE ── */
  {
    id: 'title',
    type: 'title',
    title: 'Adaptive Skill and Stake in Forecast Markets',
    subtitle: 'Coupling Self-Financed Wagering with Online Skill Learning',
    dark: true,
  },

  /* ── 2  WHY FORECAST AGGREGATION ── */
  {
    id: 'motivation',
    type: 'split',
    title: 'Why Forecast Aggregation?',
    leftBullets: [
      'Combining forecasts reduces error',
      'Modern standard: probabilistic forecasts',
      'Quality: strictly proper scoring rules (CRPS)',
      'Open question: incentivise + weight correctly?',
    ],
    image: 'presentation-plots/forecast_aggregation_four_panel.png',
  },

  /* ── 3  PREDICTION MARKETS ── */
  {
    id: 'markets',
    type: 'split',
    title: 'Prediction Markets',
    leftBullets: [
      'Share predictions, not raw data',
      'Client → forecasts + wagers → settlement',
      'Platforms: Numerai, Polymarket, Kalshi',
      '⚠ Wash trading ~60% volume (Sirolly 2025)',
      '⚠ Small core drives prices (Wu 2025)',
      '→ Need formal guarantees',
    ],
    image: 'presentation-plots/behaviour_concentration.png',
  },

  /* ── 4  EXISTING WORK ── */
  {
    id: 'existing-work',
    type: 'columns',
    title: 'Existing Work',
    columns: [
      {
        heading: 'Self-Financed Wagering',
        items: [
          'Lambert (2008) WSWM',
          '7 properties; uniqueness',
          'Raja (2024) + client',
          '⚠ History-free',
        ],
      },
      {
        heading: 'Online Aggregation',
        items: [
          'OGD / Hedge algorithms',
          'Regret guarantees',
          '⚠ Non-strategic',
          '⚠ No payments',
        ],
      },
      {
        heading: 'Intermittent',
        items: [
          'Vitali-Pinson (2025)',
          'Correction matrix',
          'Shapley payoff',
          '⚠ Relative weights',
        ],
      },
    ],
  },

  /* ── 5  GAP ── */
  {
    id: 'gap',
    type: 'section',
    title: 'No existing design couples self-financed wagering with online skill learning',
    subtitle: 'effective wager = deposit × learned skill\nAbsolute · Pre-round · Handles intermittency',
    dark: true,
  },

  /* solution section — no divider needed */

  /* ── 7  MECHANISM ── */
  {
    id: 'mechanism',
    type: 'split',
    title: 'Mechanism: Round-by-Round',
    leftBullets: [
      '1. Submit — quantile forecast + deposit',
      '2. Skill Gate — m = b × (λ + (1−λ)σ^η)',
      '3. Aggregate — weighted by effective wager',
      '4. Settle — Π_i = m_i(1 + s_i − s̄)',
      '5. Update — loss → EWMA → σ recomputed',
    ],
    image: 'presentation-plots/fixed_deposit.png',
    highlight: 'Same m_i controls BOTH influence and exposure → incentives aligned',
  },

  /* ── 8  SKILL SIGNAL ── */
  {
    id: 'skill-signal',
    type: 'split',
    title: 'The Skill Signal',
    leftBullets: [
      'Present: EWMA blends loss with history',
      'Absent: staleness decay → baseline',
      'Mapping: exp(−γL) → σ ∈ [σ_min, 1]',
      '',
      'Key properties:',
      '• Absolute (not relative to others)',
      '• Pre-round (past losses only)',
      '• Handles intermittent participation',
      '',
      'vs Vitali-Pinson:',
      '⚠ Their weights are relative (simplex)',
      '→ Mine are absolute (per-user)',
    ],
    image: 'presentation-plots/skill_wager.png',
  },

  /* ── 9  ARCHITECTURE ── */
  {
    id: 'architecture',
    type: 'split',
    title: 'Architecture & Testing',
    leftBullets: [
      'Three layers:',
      '• Environment — DGPs (exogenous / endogenous)',
      '• Agents — honest, noisy, adversarial',
      '• Platform — deterministic core mechanism',
      '',
      'Contract: agents output (participate, report, deposit)',
      'Core consumes without knowing motives',
      '',
      'onlinev2 Python package',
      '20+ invariant tests (Hypothesis)',
      'Experiment ladder: correctness → forecasting → robustness',
    ],
    image: 'presentation-plots/parameter_sweep.png',
  },

  /* validation section — no divider needed */

  /* ── 11  CORRECTNESS ── */
  {
    id: 'correctness',
    type: 'split',
    title: 'Correctness',
    leftBullets: [
      'Budget gap: 2.84 × 10⁻¹⁴',
      'Mean profit: 3.01 × 10⁻¹⁷ (zero-sum)',
      'Equal-score → zero profit ✓',
      '',
      'Sybil ratio (identical): 1.000000',
      'Sybil max|Δ|: 2.07 × 10⁻¹⁷',
      '',
      'Noise-skill corr (MAE): −0.952',
      'Noise-skill corr (CRPS): −0.979',
      '',
      '✓ All 20+ invariant tests PASS',
      '✓ Both point_mae and quantiles_crps',
    ],
    image: 'presentation-plots/settlement_sanity.png',
  },

  /* ── 12  DEPOSIT DESIGN ── */
  {
    id: 'deposit-design',
    type: 'split',
    title: 'Deposit Design Is the Strongest Lever',
    leftBullets: [
      'IID Exponential:  0.0456',
      'Fixed Unit:       0.0423',
      'Bankroll + Conf:  0.0375',
      'Oracle Precision: 0.0227',
      '',
      '→ Bankroll vs Fixed: −11.3%',
      '→ Oracle vs Fixed:   −46.3%',
    ],
    image: 'presentation-plots/deposit_policy_comparison.png',
    highlight: 'How stake enters matters more than the weighting rule',
  },

  /* ── 13  WEIGHT RULES ── */
  {
    id: 'weight-rules',
    type: 'split',
    title: 'Weight Rules & the Combination Puzzle',
    leftBullets: [
      'Fixed deposits:',
      '  Uniform:  0.0434',
      '  Skill:    0.0419 (−3.5%)',
      '',
      'Bankroll deposits:',
      '  Deposit-only: 0.0230',
      '',
      'Forecast combination puzzle:',
      'Equal weights hard to beat',
    ],
    image: 'presentation-plots/weight_rule_comparison.png',
  },

  /* ── 14  SKILL RECOVERY ── */
  {
    id: 'skill-recovery',
    type: 'split',
    title: 'Skill Recovery',
    leftBullets: [
      'f0: τ=0.15 → σ=0.959',
      'f1: τ=0.22 → σ=0.942',
      'f2: τ=0.32 → σ=0.919',
      'f3: τ=0.46 → σ=0.890',
      'f4: τ=0.68 → σ=0.854',
      'f5: τ=1.00 → σ=0.820',
      '',
      'Spearman = 1.0000',
    ],
    image: 'presentation-plots/quantiles_crps_recovery.png',
    highlight: 'Staleness decay prevents strategic absence',
  },

  /* ── 15  STRATEGIC ROBUSTNESS ── */
  {
    id: 'strategic',
    type: 'split',
    title: 'Strategic Robustness',
    leftBullets: [
      'Sybil (identical reports):',
      '  ratio = 1.000000 ± 2×10⁻¹⁷',
      '',
      'Sybil (diversified reports):',
      '  ratio = 1.065 (not sybilproof)',
      '',
      'Strategic deposit: ratio = 1.000000',
      '',
      'Arbitrage (Chen et al. 2014):',
      '  Zero profit across all λ values',
      '',
      '→ Resists standard attacks',
      '⚠ Adaptive adversaries remain open',
    ],
    image: 'presentation-plots/arbitrage_heatmap.png',
  },

  /* calibration folded into contributions slide */

  /* ── 17  CONTRIBUTIONS ── */
  {
    id: 'contributions',
    type: 'split',
    title: 'Contributions & Limitations',
    leftBullets: [
      '1. Mechanism coupling wagering + skill',
      '2. Budget balance < 10⁻¹⁴; sybilproof',
      '3. Deposit design: −11.3% CRPS',
      '4. Skill recovery: ρ = 1.0000',
      '5. Sybil-resistant; no arbitrage profit',
      '6. Modular platform + test suite',
      '',
      'Limitations:',
      '• Tail calibration ~5pp (quantile avg.)',
      '• Equal weights competitive',
      '• Risk neutrality assumption',
      '• Synthetic data only',
    ],
    image: 'presentation-plots/master_comparison_four_panel.png',
  },

  /* ── 18  CLOSING ── */
  {
    id: 'closing',
    type: 'closing',
    title: 'Thank you',
    subtitle: 'Anastasia Cattaneo\nImperial College London\n2025',
    dark: true,
  },
];

/* ─── Slide renderers ────────────────────────────────────────── */

/** Slide 1 — dark navy gradient title card */
function TitleSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center px-20 py-16"
      style={{
        background: `linear-gradient(135deg, ${IMPERIAL.navy} 0%, ${IMPERIAL.dark} 100%)`,
      }}
    >
      <h1
        className="font-bold text-white leading-tight max-w-5xl"
        style={{ fontSize: '4.5rem', lineHeight: 1.1 }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          className="mt-8 max-w-4xl"
          style={{ fontSize: '2rem', color: '#93c5fd', lineHeight: 1.4 }}
        >
          {slide.subtitle}
        </p>
      )}
      <div className="mt-16" style={{ fontSize: '1.4rem', color: 'rgba(147,197,253,0.7)' }}>
        Anastasia Cattaneo — Imperial College London — 2025
      </div>
    </div>
  );
}

/** Slides 5, 6, 10 — section dividers */
function SectionSlideView({ slide }: { slide: SlideData }) {
  const isDark = slide.dark;
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center px-20 py-16"
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${IMPERIAL.navy} 0%, ${IMPERIAL.blue} 100%)`
          : IMPERIAL.lightGrey,
      }}
    >
      <h1
        className="font-bold leading-snug max-w-5xl"
        style={{
          fontSize: '3.2rem',
          color: isDark ? IMPERIAL.white : IMPERIAL.navy,
          lineHeight: 1.25,
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          className="mt-10 max-w-4xl whitespace-pre-line"
          style={{
            fontSize: '2rem',
            color: isDark ? '#93c5fd' : IMPERIAL.smoke,
            lineHeight: 1.5,
          }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

/** Slide footer — small text at bottom of content slides */
function SlideFooter() {
  return (
    <div
      className="flex-shrink-0 pt-4"
      style={{ fontSize: '0.85rem', color: IMPERIAL.smoke }}
    >
      Anastasia Cattaneo — Imperial College London
    </div>
  );
}

/** Highlight / key-takeaway bar */
function HighlightBar({ text }: { text: string }) {
  return (
    <div
      className="flex-shrink-0 rounded-lg mt-4"
      style={{
        background: '#dbeafe',
        color: IMPERIAL.navy,
        fontSize: '1.35rem',
        fontWeight: 700,
        padding: '0.9rem 1.5rem',
        lineHeight: 1.4,
      }}
    >
      {text}
    </div>
  );
}

/** Bullet styling helper — returns inline style + className for a bullet string */
function bulletStyle(item: string): React.CSSProperties {
  if (item === '') return { height: '0.75rem' };
  if (item.startsWith('⚠')) return { color: '#dc2626', fontWeight: 600 };
  if (item.startsWith('→')) return { color: '#047857', fontWeight: 700 };
  if (item.startsWith('✓')) return { color: '#047857', fontWeight: 700 };
  if (item.startsWith('  '))
    return { paddingLeft: '1.5rem', fontFamily: 'monospace', fontSize: '1.15rem', color: '#475569' };
  if (item.startsWith('•'))
    return { paddingLeft: '0.75rem' };
  return {};
}

/** Slide 4 — 3-column layout (no image, full width) */
function ColumnsSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      className="w-full h-full flex flex-col px-14 py-10"
      style={{ background: IMPERIAL.white }}
    >
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h2
          className="font-bold"
          style={{ fontSize: '2.8rem', color: IMPERIAL.navy, lineHeight: 1.15 }}
        >
          {slide.title}
        </h2>
        <div className="mt-3 h-1 w-24" style={{ background: IMPERIAL.blue }} />
      </div>

      {/* Columns */}
      <div className="flex-1 flex gap-8 min-h-0">
        {slide.columns?.map((col) => (
          <div key={col.heading} className="flex-1 flex flex-col rounded-xl border border-slate-200 p-6">
            <h3
              className="font-bold mb-4"
              style={{ fontSize: '1.7rem', color: IMPERIAL.blue, lineHeight: 1.3 }}
            >
              {col.heading}
            </h3>
            <ul className="space-y-3">
              {col.items.map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '1.35rem',
                    lineHeight: 1.5,
                    color: item.startsWith('⚠') ? '#dc2626' : '#334155',
                    fontWeight: item.startsWith('⚠') ? 600 : 400,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <SlideFooter />
    </div>
  );
}

/** Content slide — bullets only, full width (unused in current deck but kept for flexibility) */
function ContentSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      className="w-full h-full flex flex-col px-16 py-12"
      style={{ background: IMPERIAL.white }}
    >
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h2
          className="font-bold"
          style={{ fontSize: '2.5rem', color: IMPERIAL.navy, lineHeight: 1.2 }}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mt-2" style={{ fontSize: '1.25rem', color: IMPERIAL.smoke }}>
            {slide.subtitle}
          </p>
        )}
        <div className="mt-3 h-1 w-20" style={{ background: IMPERIAL.blue }} />
      </div>

      {/* Bullets */}
      <div className="flex-1 flex flex-col justify-center">
        <ul className="space-y-4 max-w-5xl">
          {slide.bullets?.map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: '1.5rem',
                lineHeight: 1.6,
                color: '#1e293b',
                ...bulletStyle(item),
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {slide.highlight && <HighlightBar text={slide.highlight} />}
      <SlideFooter />
    </div>
  );
}

/** Split slide — 40% text left, 60% image right */
function SplitSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      className="w-full h-full flex flex-col px-14 py-10"
      style={{ background: IMPERIAL.white }}
    >
      {/* Header */}
      <div className="flex-shrink-0 mb-5">
        <h2
          className="font-bold"
          style={{ fontSize: '2.8rem', color: IMPERIAL.navy, lineHeight: 1.15 }}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mt-2" style={{ fontSize: '1.3rem', color: IMPERIAL.smoke }}>
            {slide.subtitle}
          </p>
        )}
        <div className="mt-3 h-1 w-24" style={{ background: IMPERIAL.blue }} />
      </div>

      {/* Split body */}
      <div className="flex-1 flex gap-8 min-h-0">
        {/* Left — text (38%) */}
        <div className="flex flex-col justify-center" style={{ width: '38%' }}>
          <ul className="space-y-2.5">
            {slide.leftBullets?.map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: '1.4rem',
                  lineHeight: 1.5,
                  color: '#1e293b',
                  ...bulletStyle(item),
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — image (62%) */}
        <div
          className="flex items-center justify-center"
          style={{ width: '62%' }}
        >
          {slide.image && (
            <img
              src={`${BASE}${slide.image}`}
              alt={slide.title ?? 'Slide image'}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
              }}
            />
          )}
        </div>
      </div>

      {slide.highlight && <HighlightBar text={slide.highlight} />}
      <SlideFooter />
    </div>
  );
}

/** Slide 18 — closing card */
function ClosingSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center px-20 py-16"
      style={{
        background: `linear-gradient(135deg, ${IMPERIAL.navy} 0%, ${IMPERIAL.dark} 100%)`,
      }}
    >
      <h1
        className="font-bold text-white"
        style={{ fontSize: '5rem' }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          className="mt-10 whitespace-pre-line"
          style={{ fontSize: '1.8rem', color: '#93c5fd', lineHeight: 1.6 }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

/** Dispatch to the correct renderer by slide type */
function SlideRenderer({ slide }: { slide: SlideData }) {
  switch (slide.type) {
    case 'title':
      return <TitleSlideView slide={slide} />;
    case 'section':
      return <SectionSlideView slide={slide} />;
    case 'content':
      return <ContentSlideView slide={slide} />;
    case 'columns':
      return <ColumnsSlideView slide={slide} />;
    case 'split':
      return <SplitSlideView slide={slide} />;
    case 'closing':
      return <ClosingSlideView slide={slide} />;
    default:
      return null;
  }
}

/* ─── Main presentation component ────────────────────────────── */

export default function PresentationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [current, setCurrent] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const total = SLIDES.length;

  const goTo = useCallback(
    (idx: number) => setCurrent(Math.max(0, Math.min(idx, total - 1))),
    [total],
  );

  /* Keyboard navigation */
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goTo(current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goTo(current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goTo(total - 1);
      } else if (e.key === 'Escape') {
        setShowControls((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, goTo, total, isAuthenticated]);

  /* Auto-hide controls after 4 s of inactivity */
  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timer);
  }, [showControls, current]);

  /* Show controls on mouse move */
  useEffect(() => {
    const handleMove = () => setShowControls(true);
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  /* ── Password gate ── */
  if (!isAuthenticated) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          background: `linear-gradient(135deg, ${IMPERIAL.navy} 0%, ${IMPERIAL.dark} 100%)`,
        }}
      >
        <PasswordGate onAuthenticate={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  const slide = SLIDES[current];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif', background: '#000' }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Full-viewport slide */}
      <div className="relative w-full h-full" style={{ maxWidth: '100vw', maxHeight: '100vh' }}>
        <SlideRenderer slide={slide} />
      </div>

      {/* Bottom navigation bar — auto-hides */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-8 py-3 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="text-white/80 hover:text-white disabled:opacity-30 px-4 py-1"
          style={{ fontSize: '1rem' }}
        >
          ← Prev
        </button>
        <span className="text-white/80 font-mono" style={{ fontSize: '0.95rem' }}>
          {current + 1} / {total}
        </span>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === total - 1}
          className="text-white/80 hover:text-white disabled:opacity-30 px-4 py-1"
          style={{ fontSize: '1rem' }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
