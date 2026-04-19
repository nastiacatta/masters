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
    title: 'Adaptive Skill and Stake\nin Forecast Markets',
    subtitle: 'Coupling Self-Financed Wagering with Online Skill Learning',
    dark: true,
  },

  /* ── 2  WHY FORECAST AGGREGATION ── */
  {
    id: 'motivation',
    type: 'split',
    title: 'Why Forecast Aggregation?',
    leftBullets: [
      '• Combining forecasts reduces error',
      '• Modern standard: full probabilistic forecasts',
      '• Quality measured by proper scoring rules (CRPS)',
      '• Information is distributed and costly to share',
      '',
      '→ How to incentivise participation?',
      '→ How to weight forecasters correctly?',
    ],
    image: 'presentation-plots/forecast_aggregation_four_panel.png',
  },

  /* ── 3  PREDICTION MARKETS ── */
  {
    id: 'markets',
    type: 'split',
    title: 'Prediction Markets',
    leftBullets: [
      '• Share predictions, not raw data',
      '• Reward based on forecast quality',
      '• Platforms: Numerai, Polymarket, Kalshi',
      '',
      '⚠ Wash trading ~60% volume (Sirolly 2025)',
      '⚠ Prices driven by small elite (Wu 2025)',
      '',
      '→ Need mechanisms with formal guarantees',
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
          '• Lambert (2008): WSWM',
          '• 7 properties; uniqueness result',
          '• Raja (2024): + client utility',
          '',
          '⚠ History-free',
        ],
      },
      {
        heading: 'Online Aggregation',
        items: [
          '• OGD / Hedge algorithms',
          '• Regret guarantees',
          '',
          '⚠ Non-strategic agents',
          '⚠ No payments',
        ],
      },
      {
        heading: 'Intermittent Markets',
        items: [
          '• Vitali-Pinson (2025)',
          '• Correction matrix for missing',
          '• Shapley + scoring payoff',
          '',
          '⚠ Relative weights (simplex)',
        ],
      },
    ],
  },

  /* ── 5  GAP ── */
  {
    id: 'gap',
    type: 'section',
    title: 'No existing design couples\nself-financed wagering\nwith online skill learning',
    subtitle: 'My contribution: effective wager = deposit × learned skill\nAbsolute · Pre-round · Handles intermittency',
    dark: true,
  },

  /* ── 6  MECHANISM ── */
  {
    id: 'mechanism',
    type: 'split',
    title: 'Mechanism: Round-by-Round',
    leftBullets: [
      '1. Submit forecast + deposit',
      '2. Skill gate: m = b × g(σ)',
      '3. Aggregate by effective wager',
      '4. Settle: Π = m(1 + s − s̄)',
      '5. Update skill from loss',
      '',
      '→ Same m controls influence AND exposure',
      '→ σ fixed before round (truthfulness)',
    ],
    image: 'presentation-plots/fixed_deposit.png',
    highlight: 'Incentives aligned: influence requires risk',
  },

  /* ── 7  SKILL SIGNAL ── */
  {
    id: 'skill-signal',
    type: 'split',
    title: 'The Skill Signal',
    leftBullets: [
      '• Present: EWMA blends loss with history',
      '• Absent: staleness decay toward baseline',
      '• Mapping: loss → σ ∈ [σ_min, 1]',
      '',
      '• Absolute (not relative to others)',
      '• Pre-round (past losses only)',
      '• Handles intermittent participation',
    ],
    image: 'presentation-plots/skill_wager.png',
  },

  /* ── 8  ARCHITECTURE ── */
  {
    id: 'architecture',
    type: 'split',
    title: 'Architecture',
    leftBullets: [
      '• Environment: DGPs (exogenous / endogenous)',
      '• Agents: honest, noisy, adversarial',
      '• Platform: deterministic core mechanism',
      '',
      '• Agents output (participate, report, deposit)',
      '• Core consumes without knowing motives',
      '',
      '• 20+ invariant tests',
      '• Experiment ladder: correctness → robustness',
    ],
    image: 'presentation-plots/parameter_sweep.png',
  },

  /* ── 9  CORRECTNESS ── */
  {
    id: 'correctness',
    type: 'split',
    title: 'Correctness',
    leftBullets: [
      '• Budget gap: 2.84 × 10⁻¹⁴',
      '• Mean profit: 3.01 × 10⁻¹⁷ (zero-sum)',
      '• Equal-score → zero profit',
      '',
      '• Sybil ratio (identical): 1.000000',
      '• Noise-skill correlation: −0.98',
      '',
      '✓ All 20+ tests PASS (both modes)',
    ],
    image: 'presentation-plots/settlement_sanity.png',
  },

  /* ── 10  DEPOSIT DESIGN ── */
  {
    id: 'deposit-design',
    type: 'split',
    title: 'Deposit Design',
    leftBullets: [
      '• Random (IID Exp): 0.0456',
      '• Fixed (b=1):      0.0423',
      '• Bankroll+Conf:    0.0375  (−11%)',
      '• Oracle:           0.0227  (−46%)',
      '',
      '→ How stake enters > weighting rule',
    ],
    image: 'presentation-plots/deposit_policy_comparison.png',
    highlight: 'Deposit design is the strongest lever',
  },

  /* ── 11  WEIGHT RULES ── */
  {
    id: 'weight-rules',
    type: 'split',
    title: 'Weight Rules',
    leftBullets: [
      'Fixed deposits:',
      '• Uniform:     0.0434',
      '• Skill-only:  0.0419  (−3.5%)',
      '',
      'Bankroll deposits:',
      '• Deposit-only: 0.0230',
      '',
      '→ Equal weights remain a strong baseline',
    ],
    image: 'presentation-plots/weight_rule_comparison.png',
  },

  /* ── 12  SKILL RECOVERY ── */
  {
    id: 'skill-recovery',
    type: 'split',
    title: 'Skill Recovery',
    leftBullets: [
      '• 6 forecasters, T=20000, 20 seeds',
      '• Least noisy (τ=0.15): σ = 0.959',
      '• Most noisy (τ=1.00): σ = 0.820',
      '',
      '• Spearman rank correlation = 1.0000',
      '• Perfect ordering recovered',
      '',
      '→ Staleness decay prevents gaming',
    ],
    image: 'presentation-plots/quantiles_crps_recovery.png',
  },

  /* ── 13  STRATEGIC ROBUSTNESS ── */
  {
    id: 'strategic',
    type: 'split',
    title: 'Strategic Robustness',
    leftBullets: [
      '• Sybil (identical): ratio = 1.000000',
      '• Sybil (diversified): ratio = 1.065',
      '• Strategic deposit: ratio = 1.000000',
      '',
      '• Arbitrage: zero profit (all λ)',
      '',
      '→ Resists standard attacks',
      '⚠ Adaptive adversaries remain open',
    ],
    image: 'presentation-plots/sybil.png',
  },

  /* ── 14  CONTRIBUTIONS ── */
  {
    id: 'contributions',
    type: 'content',
    title: 'Contributions & Limitations',
    bullets: [
      '1. Mechanism coupling wagering + online skill learning',
      '2. Budget balance < 10⁻¹⁴; sybilproof (identical reports)',
      '3. Deposit design: strongest lever (−11% CRPS)',
      '4. Skill recovery: Spearman = 1.0000',
      '5. Sybil-resistant; no arbitrage profit in practice',
      '6. Modular platform (onlinev2) + test suite + dashboard',
      '',
      'Limitations:',
      '• Tail calibration ~5pp under-dispersion (quantile averaging)',
      '• Equal weights competitive in some settings',
      '• Truthfulness under risk neutrality only',
      '• All synthetic data — no real-world deployment',
    ],
  },

  /* ── 15  CLOSING ── */
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

/** Bullet styling helper */
function bulletStyle(item: string): React.CSSProperties {
  if (item === '') return { height: '0.6rem' };
  if (item.startsWith('⚠')) return { color: '#dc2626', fontWeight: 600 };
  if (item.startsWith('→')) return { color: '#047857', fontWeight: 700 };
  if (item.startsWith('✓')) return { color: '#047857', fontWeight: 700 };
  if (item.startsWith('•')) return { paddingLeft: '0.5rem' };
  if (/^\d\./.test(item)) return { fontWeight: 600 };
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
