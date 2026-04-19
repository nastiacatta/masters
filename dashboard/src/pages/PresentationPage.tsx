import { useState, useEffect, useCallback } from 'react';
import PasswordGate from '@/components/slides/PasswordGate';

/**
 * Full-screen presentation mode for thesis defence.
 * Imperial College styling: Arial font, navy (#000080) / blue (#0000CD) palette.
 * Arrow keys navigate between slides. Escape exits.
 */

// Imperial College colour palette (from theme1.xml)
const IMPERIAL = {
  navy: '#000080',
  blue: '#0000CD',
  magenta: '#C71585',
  red: '#FF0000',
  orange: '#FF4500',
  green: '#006400',
  lightGrey: '#F5F5F5',
  smoke: '#708090',
  white: '#FFFFFF',
  dark: '#232333',
} as const;

/* ─── Slide data ─────────────────────────────────────────────── */

interface SlideData {
  id: string;
  type: 'title' | 'section' | 'content' | 'split' | 'closing';
  title?: string;
  subtitle?: string;
  bullets?: string[];
  columns?: { heading: string; items: string[] }[];
  leftBullets?: string[];
  rightBullets?: string[];
  image?: string; // path to plot PNG
  highlight?: string; // key takeaway text
  dark?: boolean;
}

const SLIDES: SlideData[] = [
  // ─── TITLE ───
  {
    id: 'title',
    type: 'title',
    title: 'Adaptive Skill and Stake in Forecast Markets',
    subtitle: 'Coupling Self-Financed Wagering with Online Skill Learning',
    dark: true,
  },
  // ─── PROBLEM ───
  {
    id: 'motivation',
    type: 'content',
    title: 'Why Forecast Aggregation Matters',
    bullets: [
      'Combining forecasts reduces error — different sources capture different aspects of reality',
      'Modern standard: full probabilistic forecasts, not point estimates (Gneiting & Raftery, 2007)',
      'Quality measured by strictly proper scoring rules (e.g. CRPS)',
      'Strictly proper → only way to maximise score is to report true belief',
      'Open question: how to incentivise participation and decide whose forecast counts more?',
    ],
  },
  {
    id: 'markets',
    type: 'content',
    title: 'Prediction Markets as a Solution',
    bullets: [
      'Data owners share predictions (not raw data); rewarded based on accuracy',
      'Market structure: client posts task → players submit forecasts + wagers → settlement',
      'Real platforms: Numerai, Polymarket ($3.7B volume), Kalshi',
      '⚠ Wash trading ~60% of Polymarket weekly volume (Sirolly et al., 2025)',
      '⚠ Prices driven by small core of active traders (Wu, 2025)',
      '→ Need mechanisms with formal guarantees',
    ],
  },
  {
    id: 'existing-work',
    type: 'content',
    title: 'Existing Work',
    columns: [
      {
        heading: 'Self-Financed Wagering',
        items: [
          'Lambert et al. (2008): WSWM',
          '7 properties; uniqueness result',
          'Raja et al. (2024): + client',
          'Conditionally truthful',
          'Wind energy case study',
          '⚠ Limitation: history-free',
        ],
      },
      {
        heading: 'Online Aggregation',
        items: [
          'OGD / Hedge algorithms',
          'Learns time-varying weights',
          'Regret guarantees',
          '⚠ Non-strategic assumption',
          '⚠ No payments or incentives',
        ],
      },
      {
        heading: 'Intermittent Contributions',
        items: [
          'Vitali & Pinson (2025)',
          'Correction matrix for missing',
          'OGD on pinball loss',
          'Shapley + scoring payoff',
          '⚠ Relative weights on simplex',
        ],
      },
    ],
  },
  {
    id: 'gap',
    type: 'section',
    title: 'No existing design couples self-financed wagering with an online skill-learning layer',
    subtitle: 'Contribution: effective wager = deposit × learned skill\n• Absolute (not relative)  • Pre-round (preserves truthfulness)  • Handles intermittency',
    dark: true,
  },
  // ─── SOLUTION ───
  {
    id: 'solution-divider',
    type: 'section',
    title: 'Solution',
    subtitle: 'Mechanism Design and Implementation',
  },
  {
    id: 'mechanism',
    type: 'content',
    title: 'The Mechanism: Round-by-Round',
    bullets: [
      '1. Submit — quantile forecast + deposit (wealth × confidence)',
      '2. Skill Gate — effective wager = deposit × skill factor; remainder refunded',
      '3. Aggregate — weighted combination using effective wagers as weights',
      '4. Settle — payoff redistributes wager pool by relative scores (budget-balanced)',
      '5. Update — loss → EWMA → skill recomputed; wealth updated',
    ],
    highlight: 'Same effective wager controls BOTH influence and exposure → incentives aligned',
  },
  {
    id: 'skill-signal',
    type: 'split',
    title: 'The Skill Signal',
    leftBullets: [
      'When present: EWMA blends previous loss with current',
      'When absent: reverts toward neutral baseline (staleness decay)',
      'Mapping: exponential function → skill ∈ [σ_min, 1.0]',
      '',
      'Properties:',
      '• Absolute (not relative to others)',
      '• Pre-round (past losses only)',
      '• Handles intermittent participation',
      '',
      'Key difference from Vitali-Pinson:',
      'Absolute skill — one forecaster improves without reducing another\'s weight',
    ],
    image: '/presentation-plots/quantiles_crps_recovery.png',
  },
  {
    id: 'architecture',
    type: 'content',
    title: 'Architecture and Implementation',
    bullets: [
      'Three-layer modular separation:',
      '  Environment — data-generating processes',
      '  Agents — behaviour policies (honest, noisy, sybil, arbitrageur, ...)',
      '  Platform — scoring → aggregation → settlement → skill (deterministic)',
      '',
      'Implementation: onlinev2 Python package',
      '  20+ invariant tests; property-based testing (Hypothesis)',
      '  Experiment ladder: correctness → forecasting → dynamics → strategy',
    ],
  },
  // ─── VALIDATION ───
  {
    id: 'validation-divider',
    type: 'section',
    title: 'Validation',
    subtitle: 'Experimental Results',
  },
  {
    id: 'correctness',
    type: 'split',
    title: 'Correctness: The Mechanism Works',
    leftBullets: [
      'Budget Balance:',
      '  Max gap: 2.84 × 10⁻¹⁴ (machine precision)',
      '  Mean profit: 3.01 × 10⁻¹⁷',
      '',
      'Sybilproofness (identical reports):',
      '  Profit ratio: 1.000000',
      '  Max |Δ|: 2.07 × 10⁻¹⁷',
      '',
      'Scoring Invariants:',
      '  Pinball ≥ 0 ✓  CRPS ≥ 0 ✓',
      '  Perfect beats shifted ✓  Bounded ✓',
      '',
      '✓ All 20+ tests PASS (point + quantile)',
    ],
    image: '/presentation-plots/settlement_sanity.png',
  },
  {
    id: 'deposit-design',
    type: 'split',
    title: 'Deposit Design Is the Strongest Lever',
    leftBullets: [
      'Deposit policy comparison (20 seeds):',
      '',
      '  IID Exponential:    0.0456 ± 0.0003',
      '  Fixed Unit (b=1):   0.0423 ± 0.0002',
      '  Bankroll + Conf:    0.0375 ± 0.0001',
      '  Oracle Precision:   0.0227 ± 0.0001',
      '',
      '→ Bankroll vs Fixed: −11.3%',
      '→ Oracle vs Fixed:   −46.3%',
    ],
    image: '/presentation-plots/deposit_policy_comparison.png',
    highlight: 'How stake enters the system matters more than the weighting rule',
  },
  {
    id: 'weight-rules',
    type: 'split',
    title: 'Weight Rules and the Combination Puzzle',
    leftBullets: [
      'Under fixed deposits:',
      '  Uniform:     0.0434 ± 0.0002',
      '  Skill:       0.0419 ± 0.0002',
      '  Mechanism:   0.0423 ± 0.0002',
      '  Best single: 0.0232 ± 0.0001',
      '',
      '→ Skill vs uniform: −3.5%',
      '',
      'Under bankroll deposits:',
      '  Deposit only: 0.0230 ± 0.0001',
      '',
      'Forecast combination puzzle:',
      'Equal weights hard to beat (Wang et al., 2023)',
    ],
    image: '/presentation-plots/weight_rule_comparison.png',
  },
  {
    id: 'skill-recovery',
    type: 'content',
    title: 'Skill Recovery and Dynamic Robustness',
    subtitle: 'T=20000, 6 forecasters, 20 seeds',
    bullets: [
      'f0: τ=0.15  →  loss=0.023  →  σ=0.959',
      'f1: τ=0.22  →  loss=0.033  →  σ=0.942',
      'f2: τ=0.32  →  loss=0.047  →  σ=0.919',
      'f3: τ=0.46  →  loss=0.066  →  σ=0.890',
      'f4: τ=0.68  →  loss=0.089  →  σ=0.854',
      'f5: τ=1.00  →  loss=0.112  →  σ=0.820',
    ],
    highlight: 'Spearman rank correlation (τ vs σ): 1.0000 — perfect rank recovery',
  },
  {
    id: 'strategic',
    type: 'split',
    title: 'Strategic Robustness',
    leftBullets: [
      'Sybil (identical reports):',
      '  Profit ratio: 1.000000',
      '  → No advantage from splitting',
      '',
      'Sybil (diversified reports):',
      '  Ratio: 1.065 (known limit)',
      '',
      'Strategic deposit manipulation:',
      '  Ratio: 1.000000',
      '',
      'Arbitrage (Chen et al., 2014):',
      '  Zero profit in repeated setting',
      '',
      '⚠ Adaptive adversaries: open challenge',
    ],
    image: '/presentation-plots/sybil.png',
  },
  {
    id: 'calibration',
    type: 'split',
    title: 'Calibration',
    subtitle: 'Known Limitation',
    leftBullets: [
      'Reliability (latent-fixed DGP, T=20000):',
      '',
      '  τ=0.10:  p̂=0.054  (dev: −0.046)',
      '  τ=0.25:  p̂=0.194  (dev: −0.056)',
      '  τ=0.50:  p̂=0.499  (dev: −0.001) ✓',
      '  τ=0.75:  p̂=0.804  (dev: +0.054)',
      '  τ=0.90:  p̂=0.945  (dev: +0.045)',
      '',
      'Median: nearly perfect',
      '⚠ Tails: ~5pp under-dispersion',
      'Inherent to quantile averaging (all methods)',
    ],
    image: '/presentation-plots/calibration_reliability.png',
  },
  {
    id: 'contributions',
    type: 'content',
    title: 'Contributions and Limitations',
    columns: [
      {
        heading: 'Contributions',
        items: [
          '1. Mechanism coupling wagering + skill learning',
          '2. Budget balance < 10⁻¹⁴; sybilproof',
          '3. Deposit design: −11.3% CRPS',
          '4. Skill recovery: ρ = 1.0000',
          '5. Sybil-resistant; no arbitrage profit',
          '6. Modular platform + test suite',
        ],
      },
      {
        heading: 'Limitations',
        items: [
          '• Tail calibration: ~5pp under-dispersion',
          '• Equal weights competitive in some configs',
          '• Truthfulness: risk-neutrality assumption',
          '• All synthetic data — no deployment',
        ],
      },
    ],
    highlight: 'Strongest lever is deposit design, not the weighting rule',
  },
  // ─── CLOSING ───
  {
    id: 'closing',
    type: 'closing',
    title: 'Thank you',
    subtitle: 'Anastasia Cattaneo\nImperial College London — Dyson School of Design Engineering\n2025',
    dark: true,
  },
];

/* ─── Slide renderers ────────────────────────────────────────── */

function TitleSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center px-16"
      style={{ background: `linear-gradient(135deg, ${IMPERIAL.navy} 0%, ${IMPERIAL.dark} 100%)` }}
    >
      <h1 className="text-5xl font-bold text-white leading-tight max-w-4xl">
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p className="mt-6 text-xl text-blue-200 max-w-3xl">{slide.subtitle}</p>
      )}
      <div className="mt-12 text-sm text-blue-300/70">
        Anastasia Cattaneo — Imperial College London — 2025
      </div>
    </div>
  );
}

function SectionSlideView({ slide }: { slide: SlideData }) {
  const isDark = slide.dark;
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center px-16"
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${IMPERIAL.navy} 0%, ${IMPERIAL.blue} 100%)`
          : IMPERIAL.lightGrey,
      }}
    >
      <h1
        className="text-4xl font-bold leading-snug max-w-4xl"
        style={{ color: isDark ? IMPERIAL.white : IMPERIAL.navy }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          className="mt-6 text-lg max-w-3xl whitespace-pre-line"
          style={{ color: isDark ? '#93c5fd' : IMPERIAL.smoke }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

function ContentSlideView({ slide }: { slide: SlideData }) {
  return (
    <div className="w-full h-full flex flex-col px-14 py-10" style={{ background: IMPERIAL.white }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold" style={{ color: IMPERIAL.navy }}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mt-1 text-sm" style={{ color: IMPERIAL.smoke }}>{slide.subtitle}</p>
        )}
        <div className="mt-3 h-0.5 w-16" style={{ background: IMPERIAL.blue }} />
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-center">
        {slide.columns ? (
          <div className={`grid gap-8 ${slide.columns.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {slide.columns.map((col) => (
              <div key={col.heading}>
                <h3 className="text-base font-bold mb-3" style={{ color: IMPERIAL.blue }}>
                  {col.heading}
                </h3>
                <ul className="space-y-1.5">
                  {col.items.map((item, i) => (
                    <li
                      key={i}
                      className={`text-sm leading-relaxed ${
                        item.startsWith('⚠') ? 'text-red-600 font-medium' : 'text-slate-700'
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2 max-w-4xl">
            {slide.bullets?.map((item, i) => (
              <li
                key={i}
                className={`text-base leading-relaxed ${
                  item === '' ? 'h-2' :
                  item.startsWith('⚠') ? 'text-red-600 font-medium' :
                  item.startsWith('→') ? 'font-bold text-emerald-700' :
                  item.startsWith('  ') ? 'pl-6 text-slate-600 font-mono text-sm' :
                  'text-slate-800'
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Highlight bar */}
      {slide.highlight && (
        <div
          className="mt-4 px-5 py-3 rounded-lg text-sm font-semibold"
          style={{ background: '#eef2ff', color: IMPERIAL.navy }}
        >
          {slide.highlight}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs" style={{ color: IMPERIAL.smoke }}>
        <span>Anastasia Cattaneo — Imperial College London</span>
      </div>
    </div>
  );
}

function SplitSlideView({ slide }: { slide: SlideData }) {
  return (
    <div className="w-full h-full flex flex-col px-14 py-10" style={{ background: IMPERIAL.white }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold" style={{ color: IMPERIAL.navy }}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mt-1 text-sm" style={{ color: IMPERIAL.smoke }}>{slide.subtitle}</p>
        )}
        <div className="mt-3 h-0.5 w-16" style={{ background: IMPERIAL.blue }} />
      </div>

      {/* Split content */}
      <div className="flex-1 flex gap-8 min-h-0">
        {/* Left: bullets */}
        <div className="w-2/5 flex flex-col justify-center overflow-y-auto">
          <ul className="space-y-1.5">
            {slide.leftBullets?.map((item, i) => (
              <li
                key={i}
                className={`text-sm leading-relaxed ${
                  item === '' ? 'h-2' :
                  item.startsWith('⚠') ? 'text-red-600 font-medium' :
                  item.startsWith('→') ? 'font-bold text-emerald-700' :
                  item.startsWith('  ') ? 'pl-4 text-slate-600 font-mono text-xs' :
                  item.startsWith('✓') ? 'font-bold text-emerald-700' :
                  'text-slate-800'
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: image */}
        <div className="w-3/5 flex items-center justify-center">
          {slide.image && (
            <img
              src={slide.image}
              alt={slide.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-slate-100"
            />
          )}
        </div>
      </div>

      {/* Highlight bar */}
      {slide.highlight && (
        <div
          className="mt-3 px-5 py-3 rounded-lg text-sm font-semibold"
          style={{ background: '#eef2ff', color: IMPERIAL.navy }}
        >
          {slide.highlight}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs" style={{ color: IMPERIAL.smoke }}>
        <span>Anastasia Cattaneo — Imperial College London</span>
      </div>
    </div>
  );
}

function ClosingSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center px-16"
      style={{ background: `linear-gradient(135deg, ${IMPERIAL.navy} 0%, ${IMPERIAL.dark} 100%)` }}
    >
      <h1 className="text-5xl font-bold text-white">{slide.title}</h1>
      {slide.subtitle && (
        <p className="mt-8 text-lg text-blue-200 whitespace-pre-line">{slide.subtitle}</p>
      )}
    </div>
  );
}

function SlideRenderer({ slide }: { slide: SlideData }) {
  switch (slide.type) {
    case 'title': return <TitleSlideView slide={slide} />;
    case 'section': return <SectionSlideView slide={slide} />;
    case 'content': return <ContentSlideView slide={slide} />;
    case 'split': return <SplitSlideView slide={slide} />;
    case 'closing': return <ClosingSlideView slide={slide} />;
    default: return null;
  }
}

/* ─── Main presentation component ────────────────────────────── */

export default function PresentationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [current, setCurrent] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const total = SLIDES.length;

  const goTo = useCallback((idx: number) => {
    setCurrent(Math.max(0, Math.min(idx, total - 1)));
  }, [total]);

  // Keyboard navigation
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
        // Toggle controls visibility
        setShowControls((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, goTo, total, isAuthenticated]);

  // Auto-hide controls after 3s of inactivity
  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timer);
  }, [showControls, current]);

  // Show controls on mouse move
  useEffect(() => {
    const handleMove = () => setShowControls(true);
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

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
      {/* 16:9 slide container */}
      <div
        className="relative w-full h-full"
        style={{ maxWidth: '100vw', maxHeight: '100vh', aspectRatio: '16/9' }}
      >
        <SlideRenderer slide={slide} />
      </div>

      {/* Bottom bar — auto-hides */}
      <div
        className={`fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      >
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="text-white/80 hover:text-white disabled:opacity-30 text-sm px-3 py-1"
        >
          ← Prev
        </button>
        <span className="text-white/80 text-xs font-mono">
          {current + 1} / {total}
        </span>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === total - 1}
          className="text-white/80 hover:text-white disabled:opacity-30 text-sm px-3 py-1"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
