import { useState, useMemo, useCallback } from 'react';
import { FAMILY_COLORS, VERDICT_COLOURS } from '@/lib/palette';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
  ReferenceArea, ReferenceLine,
} from 'recharts';
import { runPipeline, type PipelineResult } from '@/lib/coreMechanism/runPipeline';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricDisplay from '@/components/dashboard/MetricDisplay';
import {
  AGENT_PALETTE, CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  fmt, downsample, agentName,
} from '@/components/lab/shared';
import { SmartTooltip } from '@/components/dashboard/SmartTooltip';
import { useChartZoom } from '@/hooks/useChartZoom';
import ZoomBadge from '@/components/charts/ZoomBadge';
import MathBlock from '@/components/dashboard/MathBlock';
import ArchitectureDiagram from '@/components/behaviour/ArchitectureDiagram';
import FamilyCard from '@/components/behaviour/FamilyCard';
import CoverageAudit from '@/components/behaviour/CoverageAudit';
import ComparisonTable from '@/components/behaviour/ComparisonTable';
import FamilyImpactChart from '@/components/behaviour/FamilyImpactChart';
import TornadoChart from '@/components/charts/TornadoChart';
import type { TornadoDatum } from '@/components/charts/TornadoChart';
import MechanismResponseCard from '@/components/behaviour/MechanismResponseCard';
import { TAXONOMY_ITEMS } from '@/lib/behaviour/taxonomyData';
import { PRESET_CONFIGS } from '@/lib/behaviour/presetMeta';
import { useMechanismMetrics } from '@/hooks/useMechanismMetrics';
import type { BehaviourFamily, BehaviourPresetId } from '@/lib/behaviour/hiddenAttributes';
import { FigureProvider } from '@/contexts/FigureContext';
import { EquationProvider } from '@/contexts/EquationContext';

const SEED = 42;
const N = 6;
const T = 300;

/**
 * Build cumulative-average series from two (or more) round-error arrays.
 * Returns an array of objects with `round` and one key per series name.
 * Extracted to module scope so `useMemo` closures don't mutate `let` variables.
 */
function cumulativeAverage(
  series: Record<string, { error: number }[]>,
  maxSamples = 300,
): Record<string, number>[] {
  const keys = Object.keys(series);
  const len = Math.min(...keys.map(k => series[k].length));
  const sums: Record<string, number> = {};
  for (const k of keys) sums[k] = 0;

  const raw = Array.from({ length: len }, (_, i) => {
    const pt: Record<string, number> = { round: i + 1 };
    for (const k of keys) {
      sums[k] += series[k][i].error;
      pt[k] = sums[k] / (i + 1);
    }
    return pt;
  });
  return downsample(raw, maxSamples);
}

// ── 11-tab structure ───────────────────────────────────────────────────────

const TABS = [
  'Overview', 'Participation', 'Information', 'Reporting', 'Staking',
  'Objectives', 'Identity', 'Learning', 'Adversarial', 'Operational', 'Sensitivity',
] as const;
type Tab = (typeof TABS)[number];

/** Core tabs with experiment-backed content. */
const CORE_TABS: Tab[] = ['Overview', 'Participation', 'Information', 'Reporting', 'Adversarial', 'Sensitivity'];
/** Extended tabs — in-browser simulations. */
const EXTENDED_TABS: Tab[] = ['Staking', 'Objectives', 'Identity', 'Learning', 'Operational'];

/** Tabs that have experiment-backed content (not just taxonomy placeholders). */
const EXPERIMENT_TABS = new Set<string>(
  TAXONOMY_ITEMS
    .filter((item) => item.status === 'experiment' && item.tab)
    .map((item) => item.tab!),
);
// Overview and Sensitivity are always experiment-backed
EXPERIMENT_TABS.add('Overview');
EXPERIMENT_TABS.add('Sensitivity');

// ── Family colours ─────────────────────────────────────────────────────────

const FAMILY_BADGE_CLASSES: Record<BehaviourFamily, string> = {
  participation: 'bg-sky-100 text-sky-700 border-sky-200',
  information: 'bg-blue-100 text-blue-700 border-blue-200',
  reporting: 'bg-violet-100 text-violet-700 border-violet-200',
  staking: 'bg-teal-100 text-teal-700 border-teal-200',
  objectives: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  identity: 'bg-amber-100 text-amber-700 border-amber-200',
  learning: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  adversarial: 'bg-red-100 text-red-700 border-red-200',
  operational: 'bg-slate-100 text-slate-700 border-slate-200',
};



const FAMILY_DESCRIPTIONS: Record<BehaviourFamily, string> = {
  participation: 'When and whether agents submit forecasts.',
  information: 'How agents form beliefs: signal quality, bias, calibration.',
  reporting: 'What agents report: truthful belief or distorted.',
  staking: 'How much agents wager and bankroll management.',
  objectives: 'What agents optimise: expected value, utility, reputation.',
  identity: 'Whether agents split into multiple accounts.',
  learning: 'How agents adapt strategy over time.',
  adversarial: 'Attacks optimised against the mechanism rules.',
  operational: 'Real-world frictions: latency, errors, automation.',
};

// ── Shared helpers ─────────────────────────────────────────────────────────

type Verdict = 'good' | 'neutral' | 'bad';
/** Map verdict string to MetricDisplay variant. */
const VERDICT_VARIANT: Record<Verdict, 'verdict-good' | 'verdict-neutral' | 'verdict-bad'> = {
  good: 'verdict-good',
  neutral: 'verdict-neutral',
  bad: 'verdict-bad',
};

/** Compare two pipelines: returns {deltaPct, deltaAbs}. */
function compare(test: PipelineResult, base: PipelineResult) {
  const d = test.summary.meanError - base.summary.meanError;
  const pct = base.summary.meanError > 0 ? (d / base.summary.meanError * 100) : 0;
  return { deltaAbs: d, deltaPct: pct };
}

/** Placeholder banner for tabs without full experiment data. */
function PlaceholderBanner({ description }: { family: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        <span className="text-sm font-semibold text-slate-700">
          In-browser simulation
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        {description} Results are from a lightweight in-browser simulation (seed={SEED}, N={N}, T={T}).
      </p>
    </div>
  );
}

const PLACEHOLDER_DESCRIPTIONS: Record<string, string> = {
  Staking: 'Deposit policy strategies (budget constraints, house-money effect, Kelly sizing) affect how much agents commit each round. The deposit amount directly controls the effective wager and thus the agent\'s influence on the aggregate forecast.',
  Objectives: 'Agents with diverse objectives (risk aversion, loss aversion, signalling motives) may deviate from truthful reporting. Understanding these deviations helps assess mechanism robustness under realistic preferences.',
  Identity: 'Identity attacks (sybil splitting, collusion, reputation reset) test whether agents can gain unfair advantage by manipulating their identity. The mechanism\'s sybil-proofness property should prevent splitting gains.',
  Learning: 'Adaptive learning strategies test how agents who adjust their behaviour based on past outcomes interact with the mechanism\'s own learning (EWMA skill updates).',
  Operational: 'Real-world operational frictions (latency exploitation, submission errors, automation failures) test mechanism robustness under imperfect conditions that arise in practice.',
};


// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function BehaviourPage() {
  const [tab, setTab] = useState<Tab>('Overview');

  // ── Existing 9 preset simulations ──────────────────────────────────────
  const baseline = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: T, seed: SEED, n: N }), []);
  const bursty = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'bursty', rounds: T, seed: SEED, n: N }), []);
  const sybil = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'sybil', rounds: T, seed: SEED, n: N }), []);
  const manipulator = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'manipulator', rounds: T, seed: SEED, n: N }), []);
  const arbitrageur = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'arbitrageur', rounds: T, seed: SEED, n: N }), []);
  const riskAverse = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'risk_averse', rounds: T, seed: SEED, n: N }), []);
  const collusion = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'collusion', rounds: T, seed: SEED, n: N }), []);
  const repReset = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'reputation_reset', rounds: T, seed: SEED, n: N }), []);
  const evader = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'evader', rounds: T, seed: SEED, n: N }), []);

  // ── 10 new preset simulations (task 6.4) ───────────────────────────────
  const biased = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'biased', rounds: T, seed: SEED, n: N }), []);
  const miscalibrated = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'miscalibrated', rounds: T, seed: SEED, n: N }), []);
  const noisyReporter = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'noisy_reporter', rounds: T, seed: SEED, n: N }), []);
  const budgetConstrained = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'budget_constrained', rounds: T, seed: SEED, n: N }), []);
  const houseMoney = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'house_money', rounds: T, seed: SEED, n: N }), []);
  const kellySizer = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'kelly_sizer', rounds: T, seed: SEED, n: N }), []);
  const reputationGamer = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'reputation_gamer', rounds: T, seed: SEED, n: N }), []);
  const sandbagger = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'sandbagger', rounds: T, seed: SEED, n: N }), []);
  const latencyExploiter = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'latency_exploiter', rounds: T, seed: SEED, n: N }), []);

  // ── Sensitivity sweep ──────────────────────────────────────────────────
  const sweep = useMemo(() => {
    const lams = [0.0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0];
    const sigs = [0.05, 0.1, 0.2, 0.3, 0.5];
    return lams.flatMap(lam => sigs.map(sig => {
      const p = runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: T, seed: SEED, n: N, mechanism: { lam, sigma_min: sig } as Record<string, number> });
      return { lam, sig, error: p.summary.meanError, gini: p.summary.finalGini };
    }));
  }, []);

  // ── Full 19-preset behaviour summary (task 6.4) ───────────────────────
  const behaviourSummary = useMemo(() => {
    const runs: { name: string; pipeline: PipelineResult; color: string }[] = [
      { name: 'baseline', pipeline: baseline, color: '#94a3b8' },
      { name: 'bursty', pipeline: bursty, color: '#0ea5e9' },
      { name: 'risk_averse', pipeline: riskAverse, color: '#6366f1' },
      { name: 'manipulator', pipeline: manipulator, color: '#ef4444' },
      { name: 'arbitrageur', pipeline: arbitrageur, color: '#f59e0b' },
      { name: 'sybil', pipeline: sybil, color: '#f97316' },
      { name: 'collusion', pipeline: collusion, color: '#ec4899' },
      { name: 'reputation_reset', pipeline: repReset, color: '#dc2626' },
      { name: 'evader', pipeline: evader, color: '#a855f7' },
      { name: 'biased', pipeline: biased, color: '#3b82f6' },
      { name: 'miscalibrated', pipeline: miscalibrated, color: '#2563eb' },
      { name: 'noisy_reporter', pipeline: noisyReporter, color: '#8b5cf6' },
      { name: 'budget_constrained', pipeline: budgetConstrained, color: '#14b8a6' },
      { name: 'house_money', pipeline: houseMoney, color: '#0d9488' },
      { name: 'kelly_sizer', pipeline: kellySizer, color: '#059669' },
      { name: 'reputation_gamer', pipeline: reputationGamer, color: '#7c3aed' },
      { name: 'sandbagger', pipeline: sandbagger, color: '#9333ea' },
      { name: 'latency_exploiter', pipeline: latencyExploiter, color: '#64748b' },
    ];
    return runs.map(r => {
      const config = PRESET_CONFIGS[r.name as BehaviourPresetId];
      const { deltaPct } = compare(r.pipeline, baseline);
      return {
        name: config?.label ?? r.name,
        family: config?.family ?? 'reporting',
        meanCrps: r.pipeline.summary.meanError,
        deltaCrpsPct: deltaPct,
        gini: r.pipeline.summary.finalGini,
        nEff: r.pipeline.summary.meanNEff,
        participation: r.pipeline.summary.meanParticipation,
        color: r.color,
        presetId: r.name,
        deltaPct,
      };
    });
  }, [baseline, bursty, riskAverse, manipulator, arbitrageur, sybil, collusion, repReset, evader, biased, miscalibrated, noisyReporter, budgetConstrained, houseMoney, kellySizer, reputationGamer, sandbagger, latencyExploiter]);

  // ── Family impact data for FamilyImpactChart ───────────────────────────
  const familyImpact = useMemo(() => {
    const byFamily = new Map<string, number>();
    for (const row of behaviourSummary) {
      const config = PRESET_CONFIGS[row.presetId as BehaviourPresetId];
      if (!config) continue;
      const current = byFamily.get(config.family) ?? 0;
      if (Math.abs(row.deltaPct) > Math.abs(current)) {
        byFamily.set(config.family, row.deltaPct);
      }
    }
    return [...byFamily.entries()].map(([family, delta]) => ({
      family,
      worstDeltaCrpsPct: delta,
      color: FAMILY_COLORS[family as BehaviourFamily] ?? '#94a3b8',
    }));
  }, [behaviourSummary]);

  return (
    <FigureProvider>
    <EquationProvider>
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Robustness</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Testing mechanism resilience under diverse agent behaviours, strategic attacks, and parameter sensitivity.
            18 behaviour presets tested against the truthful baseline using paired comparison.
          </p>
        </header>

        {/* ── Tab bar with experiment/taxonomy indicators ─────────────── */}
        <div className="flex items-center gap-0">
          <div className="flex gap-0 border-b border-slate-200 overflow-x-auto flex-1">
            {CORE_TABS.map(t => {
              const hasExperiment = EXPERIMENT_TABS.has(t);
              return (
                <button key={t} onClick={() => setTab(t)}
                  className={`relative px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  <span className="flex items-center gap-1.5">
                    {t}
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${hasExperiment ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </span>
                </button>
              );
            })}
            <span className="inline-block w-px bg-slate-300 mx-1 self-stretch" />
            {EXTENDED_TABS.map(t => {
              const hasExperiment = EXPERIMENT_TABS.has(t);
              return (
                <button key={t} onClick={() => setTab(t)}
                  className={`relative px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  <span className="flex items-center gap-1.5">
                    {t}
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${hasExperiment ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </span>
                </button>
              );
            })}
          </div>
          <span className="ml-auto flex-shrink-0 whitespace-nowrap pl-4 pr-1 text-slate-400" style={{ fontSize: '11px' }}>
            Tab {TABS.indexOf(tab) + 1} of {TABS.length}: {tab}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.15 }}>
            {tab === 'Overview' && <OverviewTab summary={behaviourSummary} familyImpact={familyImpact} setTab={setTab} />}
            {tab === 'Participation' && <IntermittencyTab bursty={bursty} baseline={baseline} />}
            {tab === 'Adversarial' && <AdversarialTab manipulator={manipulator} arbitrageur={arbitrageur} sybil={sybil} collusion={collusion} repReset={repReset} evader={evader} baseline={baseline} />}
            {tab === 'Reporting' && <ReportingTab riskAverse={riskAverse} noisyReporter={noisyReporter} reputationGamer={reputationGamer} sandbagger={sandbagger} baseline={baseline} />}
            {tab === 'Sensitivity' && <SensitivityTab data={sweep} />}
            {tab === 'Information' && <InformationTab biased={biased} miscalibrated={miscalibrated} baseline={baseline} />}
            {tab === 'Staking' && <StakingTab budgetConstrained={budgetConstrained} houseMoney={houseMoney} kellySizer={kellySizer} baseline={baseline} />}
            {tab === 'Objectives' && <ObjectivesTab riskAverse={riskAverse} baseline={baseline} />}
            {tab === 'Identity' && <IdentityTab sybil={sybil} collusion={collusion} repReset={repReset} baseline={baseline} />}
            {tab === 'Learning' && <LearningTab />}
            {tab === 'Operational' && <OperationalTab latencyExploiter={latencyExploiter} baseline={baseline} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </EquationProvider>
    </FigureProvider>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB — taxonomy grid, architecture, coverage, comparison (task 6.3)
// ════════════════════════════════════════════════════════════════════════════

function OverviewTab({ summary, familyImpact, setTab }: {
  summary: Array<{ name: string; family: string; meanCrps: number; deltaCrpsPct: number; gini: number; nEff: number; participation: number; color: string }>;
  familyImpact: Array<{ family: string; worstDeltaCrpsPct: number; color: string }>;
  setTab: (tab: Tab) => void;
}) {
  // Build 9 FamilyCards from TAXONOMY_ITEMS grouped by family
  const familyCards = useMemo(() => {
    const grouped = new Map<BehaviourFamily, typeof TAXONOMY_ITEMS>();
    for (const item of TAXONOMY_ITEMS) {
      const list = grouped.get(item.family) ?? [];
      list.push(item);
      grouped.set(item.family, list);
    }
    const families: BehaviourFamily[] = [
      'participation', 'information', 'reporting', 'staking', 'objectives',
      'identity', 'learning', 'adversarial', 'operational',
    ];
    return families.map(family => ({
      family,
      description: FAMILY_DESCRIPTIONS[family],
      items: (grouped.get(family) ?? []).map(item => ({
        name: item.name,
        status: item.status,
      })),
      color: FAMILY_BADGE_CLASSES[family],
    }));
  }, []);

  // Build CoverageAudit families from TAXONOMY_ITEMS
  const coverageFamilies = useMemo(() => {
    const grouped = new Map<string, Array<{ name: string; status: 'experiment' | 'taxonomy-only' | 'not-covered'; experimentTab?: string }>>();
    for (const item of TAXONOMY_ITEMS) {
      const list = grouped.get(item.family) ?? [];
      list.push({
        name: item.name,
        status: item.status,
        experimentTab: item.status === 'experiment' ? item.tab : undefined,
      });
      grouped.set(item.family, list);
    }
    return [...grouped.entries()].map(([family, items]) => ({ family, items }));
  }, []);

  // Map family name to tab name for FamilyCard clicks
  const familyToTab = useCallback((family: string): Tab => {
    const capitalized = family.charAt(0).toUpperCase() + family.slice(1);
    if (TABS.includes(capitalized as Tab)) return capitalized as Tab;
    return 'Overview';
  }, []);

  // ── Threat classification tiers ──────────────────────────────────────
  const THREAT_TIERS: Array<{
    tier: string;
    emoji: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
    labelColor: string;
    rule: string;
    presets: Array<{ label: string; delta: string; interpretation: string }>;
  }> = [
    {
      tier: 'CRITICAL', emoji: '', borderColor: 'border-l-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', labelColor: 'text-red-800',
      rule: 'Δ > 10%',
      presets: [
        { label: 'Bursty', delta: '+934%', interpretation: 'Participation collapse at 54% attendance dominates all other effects' },
        { label: 'Rep. gamer', delta: '+28%', interpretation: 'Aggregate anchoring inflates σ while distorting quantile forecasts' },
        { label: 'Sandbagger', delta: '+22%', interpretation: 'Deliberate noise in quantile forecasts degrades aggregate calibration' },
        { label: 'Noisy reporter', delta: '+18%', interpretation: 'Random noise propagates through quantile reports to the aggregate' },
        { label: 'Bias', delta: '+17%', interpretation: 'Persistent directional bias shifts all quantile levels systematically' },
        { label: 'Kelly sizing', delta: '+14%', interpretation: 'Overconfident edge-proportional staking amplifies forecast errors' },
        { label: 'Miscalibrated', delta: '+13%', interpretation: 'Overconfidence distorts quantile spread, degrading CRPS' },
        { label: 'Sybil', delta: '+10%', interpretation: 'Identity splitting amplifies influence beyond deposit-splitting defence' },
      ],
    },
    {
      tier: 'MODERATE', emoji: '', borderColor: 'border-l-orange-400', bgColor: 'bg-orange-50', textColor: 'text-orange-700', labelColor: 'text-orange-800',
      rule: '2–10%',
      presets: [
        { label: 'Collusion', delta: '+8%', interpretation: 'Coordinated agents amplify impact beyond individual attacks' },
        { label: 'Arbitrageur', delta: '+5%', interpretation: 'Chen arbitrage interval exploited; σ stays moderate but aggregate shifts' },
      ],
    },
    {
      tier: 'MILD', emoji: '', borderColor: 'border-l-yellow-400', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', labelColor: 'text-yellow-800',
      rule: '0.5–2%',
      presets: [
        { label: 'Rep. reset', delta: '+1.3%', interpretation: 'Build-then-exploit strategy detected within ~20 rounds by EWMA' },
        { label: 'Risk-averse', delta: '+1.3%', interpretation: 'Hedged reports lose informativeness but don\'t break aggregate' },
        { label: 'Manipulator', delta: '+1.1%', interpretation: 'Point-forecast manipulation contained; quantiles unaffected' },
      ],
    },
    {
      tier: 'NEGLIGIBLE', emoji: '', borderColor: 'border-l-slate-300', bgColor: 'bg-slate-50', textColor: 'text-slate-600', labelColor: 'text-slate-700',
      rule: '|Δ| ≤ 0.5%',
      presets: [
        { label: 'Budget', delta: '+0.5%', interpretation: 'Finite wealth causes no ruin in 300 rounds; pool compensates' },
        { label: 'Evader', delta: '+0.3%', interpretation: 'Stealth evasion slows detection but doesn\'t escape EWMA' },
        { label: 'Baseline', delta: '0%', interpretation: 'Reference: truthful, full-participation agents' },
      ],
    },
    {
      tier: 'BENEFICIAL', emoji: '', borderColor: 'border-l-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', labelColor: 'text-emerald-800',
      rule: 'Δ < -0.5%',
      presets: [
        { label: 'House-money', delta: '-1.1%', interpretation: 'Winners get more influence, aligning incentives with accuracy' },
        { label: 'Latency exploit', delta: '-2.9%', interpretation: 'Partial outcome info actually improves the aggregate forecast' },
      ],
    },
  ];

  // ── 6 structural insights ────────────────────────────────────────────
  const INSIGHTS: Array<{ title: string; detail: string; verdict: Verdict }> = [
    {
      title: 'Participation dominates accuracy',
      detail: 'Bursty at 54% participation degrades CRPS by 934%. Missing agents = missing information. The mechanism preserves σ but can\'t compensate for absent signals.',
      verdict: 'bad',
    },
    {
      title: 'Quantile distortions are the real threat',
      detail: 'Reporting attacks that distort quantile forecasts (rep. gamer +28%, sandbagger +22%, noisy +18%, bias +17%) are far more damaging than point-forecast manipulation (+1.1%).',
      verdict: 'bad',
    },
    {
      title: 'Point-forecast attacks are contained',
      detail: 'Manipulator (+1.1%), evader (+0.3%), rep. reset (+1.3%): the skill gate downweights point-forecast attackers within rounds. EWMA half-life ≈ 7 rounds.',
      verdict: 'good',
    },
    {
      title: 'Multi-agent coordination amplifies impact',
      detail: 'Sybil +10%, Collusion +8%. Coordinated behaviour exceeds what the skill gate absorbs. But sybil-resistant (clone pair wealth ratio ≤ 1.05).',
      verdict: 'neutral',
    },
    {
      title: 'Staking strategy has mixed effects',
      detail: 'Kelly +14% (overconfident sizing hurts), House-money -1.1% (winners get more influence helps), Budget +0.5% (no ruin in 300 rounds).',
      verdict: 'neutral',
    },
    {
      title: 'Latency exploitation is beneficial',
      detail: 'Partial outcome info (-2.9%) actually improves the aggregate. The exploiter\'s better-informed quantiles help everyone.',
      verdict: 'good',
    },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600 max-w-2xl">
        The mechanism sees deposits, reports, and participation, never motives. Each behaviour below is tested in isolation.
      </p>

      {/* Architecture diagram */}
      <ArchitectureDiagram />

      {/* 9 FamilyCards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyCards.map(fc => (
          <FamilyCard
            key={fc.family}
            family={fc.family}
            description={fc.description}
            items={fc.items}
            color={fc.color}
            onClick={() => setTab(familyToTab(fc.family))}
          />
        ))}
      </div>

      {/* ── Thesis verdict ──────────────────────────────────────────── */}
      <div className="rounded-xl border-2 border-slate-300 bg-white p-5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Thesis verdict</div>
        <p className="text-sm text-slate-800 leading-relaxed">
          The mechanism is partially robust to strategic behaviour. Point-forecast attacks (manipulation,
          evasion, reputation reset) are well-contained by the skill gate. The EWMA detects misreporting
          within ~7 rounds. However, quantile-level distortions (bias +17%, noise +18%, reputation gaming +28%)
          propagate to the aggregate CRPS because the skill layer downweights slowly when the distortion
          affects all quantile levels simultaneously. The dominant vulnerability remains participation:
          missing agents directly reduce aggregate quality and cannot be compensated.
        </p>
      </div>

      {/* ── Threat classification ───────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Threat classification (18 presets)</h3>
        <p className="text-xs text-slate-500">
          Grouped by Δ CRPS impact vs truthful baseline. {T} rounds, {N} agents, seed {SEED}.
        </p>
        <div className="space-y-2">
          {THREAT_TIERS.map(tier => (
            <div key={tier.tier} className={`rounded-xl border border-slate-200 border-l-4 ${tier.borderColor} ${tier.bgColor} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${tier.labelColor}`}>{tier.tier}</span>
                <span className="text-[11px] text-slate-400 ml-1">({tier.rule})</span>
              </div>
              <div className="space-y-1">
                {tier.presets.map(p => (
                  <div key={p.label} className="flex items-baseline gap-2 text-xs">
                    <span className={`font-semibold ${tier.textColor} w-24 shrink-0`}>{p.label}</span>
                    <span className="font-mono font-semibold text-slate-600 w-16 shrink-0 text-right">{p.delta}</span>
                    <span className="text-slate-500">{p.interpretation}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6 structural insights ───────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Structural insights</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INSIGHTS.map((ins, i) => (
            <div key={i} className="rounded-xl border border-slate-200 border-l-4 p-4"
              style={{ borderLeftColor: VERDICT_COLOURS[ins.verdict].border, backgroundColor: VERDICT_COLOURS[ins.verdict].bg }}>
              <div className="text-xs font-bold mb-1" style={{ color: VERDICT_COLOURS[ins.verdict].fg }}>{ins.title}</div>
              <p className="text-xs text-slate-600 leading-relaxed">{ins.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage audit */}
      <CoverageAudit
        families={coverageFamilies}
        onNavigate={(navTab) => {
          if (TABS.includes(navTab as Tab)) setTab(navTab as Tab);
        }}
      />

      {/* Cross-behaviour comparison table (all 18 presets) */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Cross-behaviour comparison</h3>
        <p className="text-xs text-slate-500">
          Sorted by CRPS impact (worst first). Green = beneficial, red = harmful.
          All runs: {T} rounds, {N} agents, seed {SEED}, baseline DGP. Paired against truthful baseline. 18 presets (RL excluded, mechanism layer).
        </p>
        <ComparisonTable rows={summary} baselineName="Benign baseline" />
      </div>

      {/* Family impact chart */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Worst-case impact by family</h3>
        <p className="text-xs text-slate-500">
          Worst-case Δ CRPS (%) from each behaviour family. Larger bars = more damaging.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <FamilyImpactChart data={familyImpact} />
        </div>
      </div>

      {/* Tornado chart — family impact on forecast accuracy */}
      <TornadoChart
        data={
          [...familyImpact]
            .sort((a, b) => Math.abs(b.worstDeltaCrpsPct) - Math.abs(a.worstDeltaCrpsPct))
            .map((d): TornadoDatum => ({
              label: d.family.charAt(0).toUpperCase() + d.family.slice(1),
              delta: d.worstDeltaCrpsPct,
              family: d.family,
              color: d.color,
            }))
        }
        title="Impact of each behaviour family on forecast accuracy"
        metricLabel="Worst-case Δ CRPS %"
        baselineLabel="Truthful baseline"
      />
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// INTERMITTENCY (Participation tab) — bursty participation + skill stability
// ════════════════════════════════════════════════════════════════════════════

function IntermittencyTab({ bursty, baseline }: { bursty: PipelineResult; baseline: PipelineResult }) {
  const skillZoom = useChartZoom();
  const cumZoomInter = useChartZoom();
  const { deltaPct } = compare(bursty, baseline);
  const degradesGracefully = Math.abs(deltaPct) < 15;

  const skillData = useMemo(() => downsample(bursty.traces.map((t, i) => {
    const pt: Record<string, number> = { round: i + 1 };
    for (let j = 0; j < N; j++) pt[`F${j + 1}`] = t.sigma_t[j];
    return pt;
  }), 300), [bursty.traces]);

  const partData = useMemo(() => downsample(bursty.rounds.map(r => ({
    round: r.round, active: r.participation, rate: r.participation / N,
  })), 300), [bursty.rounds]);

  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    bursty: bursty.rounds,
  }), [baseline.rounds, bursty.rounds]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        What happens when agents go offline? The EWMA freezes during absences, preventing drift.
      </p>
      <MathBlock accent label="EWMA skill update" latex="L_{i,t} = \\begin{cases} (1-\\rho)L_{i,t-1} + \\rho\\,\\ell_{i,t} & \\text{if present} \\\\ (1-\\kappa)L_{i,t-1} + \\kappa L_0 & \\text{if absent, } \\kappa > 0 \\\\ L_{i,t-1} & \\text{if absent, } \\kappa = 0 \\end{cases}" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Degrades gracefully?" value={degradesGracefully ? 'Yes' : 'No'}
          detail={`Error ${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[degradesGracefully ? 'good' : 'bad']} />
        <MetricDisplay label="Mean CRPS (bursty)" value={fmt(bursty.summary.meanError, 4)} />
        <MetricDisplay label="Avg participation" value={`${(bursty.summary.meanParticipation / N * 100).toFixed(0)}%`} detail={`of ${N} agents`} />
        <MetricDisplay label="Final Gini" value={fmt(bursty.summary.finalGini, 3)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Participation per round" subtitle="Green ≥ 80%, amber ≥ 50%, red < 50%. Bursty pattern with ~22-round period." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={partData} margin={CHART_MARGIN_LABELED}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, N]} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="active" name="Active" radius={[2, 2, 0, 0]} maxBarSize={4}>
                {partData.map((d, i) => <Cell key={i} fill={d.rate >= 0.8 ? '#10b981' : d.rate >= 0.5 ? '#f59e0b' : '#ef4444'} opacity={0.7} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Skill stability under intermittency</h3>
            <ZoomBadge isZoomed={skillZoom.state.isZoomed} onReset={skillZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">σ stays flat during absences (EWMA freezes). No drift or corruption.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={skillData} margin={CHART_MARGIN_LABELED}
                onMouseDown={skillZoom.onMouseDown} onMouseMove={skillZoom.onMouseMove} onMouseUp={skillZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[skillZoom.state.left, skillZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, lineHeight: '18px', maxHeight: 40, overflow: 'hidden' }} iconSize={8} />
                {Array.from({ length: N }, (_, i) => (
                  <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                    stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={1.5} dot={false} />
                ))}
                {skillZoom.state.refLeft && skillZoom.state.refRight && (
                  <ReferenceArea x1={skillZoom.state.refLeft} x2={skillZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <ChartCard title="Cumulative error: bursty vs baseline" subtitle="If lines track closely, intermittency doesn't hurt the aggregate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={cumData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
            onMouseDown={cumZoomInter.onMouseDown} onMouseMove={cumZoomInter.onMouseMove} onMouseUp={cumZoomInter.onMouseUp}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoomInter.state.left, cumZoomInter.state.right]} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
            <Tooltip content={<SmartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bursty" name="Bursty" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            {cumZoomInter.state.refLeft && cumZoomInter.state.refRight && (
              <ReferenceArea x1={cumZoomInter.state.refLeft} x2={cumZoomInter.state.refRight} fillOpacity={0.1} fill="#6366f1" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Participation-error correlation */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Why does intermittency hurt?</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-center">
            <div className="text-2xl font-bold font-mono text-red-600">{(bursty.summary.meanParticipation / N * 100).toFixed(0)}%</div>
            <div className="text-[11px] text-red-700 mt-1">Average participation</div>
            <div className="text-[11px] text-slate-500 mt-0.5">vs 100% baseline</div>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-center">
            <div className="text-2xl font-bold font-mono text-amber-600">{(N - bursty.summary.meanParticipation).toFixed(1)}</div>
            <div className="text-[11px] text-amber-700 mt-1">Agents missing per round</div>
            <div className="text-[11px] text-slate-500 mt-0.5">= lost information</div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
            <div className="text-2xl font-bold font-mono text-slate-700">{deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%</div>
            <div className="text-[11px] text-slate-600 mt-1">CRPS degradation</div>
            <div className="text-[11px] text-slate-500 mt-0.5">cost of missing agents</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          Each missing agent removes one forecast from the aggregate. With {N} agents, losing {(N - bursty.summary.meanParticipation).toFixed(1)} per round
          means the aggregate is based on {bursty.summary.meanParticipation.toFixed(1)} signals instead of {N}.
          The mechanism preserves skill estimates during absences (EWMA freezes), but can't compensate for the missing information itself.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        On real data (Notes page), the mechanism still improves by +4.4% at 60% missingness.
        This aligns with Vitali &amp; Pinson's robust regression approach, which handles missing forecasts
        via a linear correction matrix D that compensates for absent sellers.
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 space-y-1">
        <div className="font-semibold text-amber-800">Taxonomy note: Selective entry</div>
        <p>
          The taxonomy also includes <em>selective entry</em>: agents who participate only when they
          believe their signal is strong (selection on confidence) or when the market spread is wide
          (selection on edge). These patterns are not simulated here but are structurally similar to
          bursty participation. The EWMA freeze handles both cases identically since the mechanism
          never observes <em>why</em> an agent is absent, only <em>that</em> they are absent.
        </p>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// INFORMATION — bias, miscalibration, belief formation quality
// ════════════════════════════════════════════════════════════════════════════

function InformationTab({ biased, miscalibrated, baseline }: {
  biased: PipelineResult; miscalibrated: PipelineResult; baseline: PipelineResult;
}) {
  const cumZoom = useChartZoom();
  const sigZoom = useChartZoom();

  const biasDelta = compare(biased, baseline);
  const miscalDelta = compare(miscalibrated, baseline);
  const biasHurts = biasDelta.deltaPct > 1;
  const miscalHurts = miscalDelta.deltaPct > 1;

  // Check if biased agent's σ drops below 0.5 within 50 rounds
  const biasedSigmaDropped = useMemo(() => {
    for (let i = 0; i < Math.min(50, biased.traces.length); i++) {
      if (biased.traces[i].sigma_t[0] < 0.5) return true;
    }
    return false;
  }, [biased.traces]);

  // Cumulative error: 3 lines
  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    biased: biased.rounds,
    miscalibrated: miscalibrated.rounds,
  }), [baseline.rounds, biased.rounds, miscalibrated.rounds]);

  // σ trajectory for agent 0 across all three presets
  const sigData = useMemo(() => {
    const len = Math.min(baseline.traces.length, biased.traces.length, miscalibrated.traces.length);
    return downsample(Array.from({ length: len }, (_, i) => ({
      round: i + 1,
      baseline: baseline.traces[i].sigma_t[0],
      biased: biased.traces[i].sigma_t[0],
      miscalibrated: miscalibrated.traces[i].sigma_t[0],
    })), 300);
  }, [baseline.traces, biased.traces, miscalibrated.traces]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        Biased and miscalibrated agents degrade signal quality. The skill layer should detect and downweight them.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Does bias hurt?" value={biasHurts ? 'Yes' : 'Minimal'}
          detail={`Error ${biasDelta.deltaPct >= 0 ? '+' : ''}${biasDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[biasHurts ? 'bad' : 'good']} />
        <MetricDisplay label="Does miscalibration hurt?" value={miscalHurts ? 'Yes' : 'Minimal'}
          detail={`Error ${miscalDelta.deltaPct >= 0 ? '+' : ''}${miscalDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[miscalHurts ? 'bad' : 'good']} />
        <MetricDisplay label="Mean CRPS (biased)" value={fmt(biased.summary.meanError, 4)} />
        <MetricDisplay label="Mean CRPS (miscal.)" value={fmt(miscalibrated.summary.meanError, 4)} />
      </div>

      {!biasedSigmaDropped && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
          <span className="text-red-500 text-base">⚠</span>
          Biased agent's σ did not drop below 0.5 within 50 rounds. Skill layer may be slow to downweight.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Cumulative error comparison" subtitle="Biased vs miscalibrated vs baseline. Lower is better. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={cumData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={cumZoom.onMouseDown} onMouseMove={cumZoom.onMouseMove} onMouseUp={cumZoom.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoom.state.left, cumZoom.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="biased" name="Biased" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="miscalibrated" name="Miscalibrated" stroke="#f59e0b" strokeWidth={2} dot={false} />
              {cumZoom.state.refLeft && cumZoom.state.refRight && (
                <ReferenceArea x1={cumZoom.state.refLeft} x2={cumZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">σ trajectory (agent 0)</h3>
            <ZoomBadge isZoomed={sigZoom.state.isZoomed} onReset={sigZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">How quickly the skill layer detects and downweights biased/miscalibrated agents.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={sigData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={sigZoom.onMouseDown} onMouseMove={sigZoom.onMouseMove} onMouseUp={sigZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigZoom.state.left, sigZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                  label={{ value: 'σ (agent 0)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="biased" name="Biased" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="miscalibrated" name="Miscalibrated" stroke="#f59e0b" strokeWidth={2} dot={false} />
                {sigZoom.state.refLeft && sigZoom.state.refRight && (
                  <ReferenceArea x1={sigZoom.state.refLeft} x2={sigZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 space-y-2">
        <div className="font-semibold text-amber-800">Taxonomy note: Correlated errors &amp; costly information</div>
        <p>
          <strong>Correlated errors:</strong> When multiple agents share the same flawed data source (e.g. all using
          the same weather model), their errors are correlated. This reduces the effective diversity of the panel —
          even with N=10 agents, if they all share the same bias, the effective N<sub>eff</sub> may be much lower.
          The aggregation gains from combining forecasts depend on error <em>independence</em>; correlated errors
          erode this benefit and can make the aggregate no better than a single forecaster.
        </p>
        <p>
          <strong>Costly information:</strong> When agents must pay to acquire better signals (e.g. buying proprietary
          data), only well-funded agents invest in quality. This creates adverse selection: the agents with the best
          information are also the wealthiest, potentially concentrating influence. In the mechanism, this interacts
          with the deposit layer. Wealthy agents can afford both better signals <em>and</em> larger deposits,
          compounding their advantage.
        </p>
        <p>
          Neither pattern is simulated here, but both are structurally important for real-world deployments where
          forecasters often share common data sources and face different information acquisition costs.
        </p>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// ADVERSARIAL — manipulation, arbitrage, sybil
// ════════════════════════════════════════════════════════════════════════════

function AdversarialTab({ manipulator, arbitrageur, sybil, collusion, repReset, evader, baseline }: {
  manipulator: PipelineResult; arbitrageur: PipelineResult; sybil: PipelineResult;
  collusion: PipelineResult; repReset: PipelineResult; evader: PipelineResult; baseline: PipelineResult;
}) {
  const sigDecayZoom = useChartZoom();

  const W0 = 20;
  const manipProfit = manipulator.finalState[0].wealth - W0;
  const baseProfit0 = baseline.finalState[0].wealth - W0;
  const arbIdx = arbitrageur.finalState.length - 1;
  const arbProfit = arbitrageur.finalState[arbIdx].wealth - W0;
  const arbBaseline = baseline.finalState[arbIdx].wealth - W0;
  const sybilProfit = sybil.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const baselinePairProfit = baseline.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const sybilRatio = baselinePairProfit > 0 ? sybilProfit / baselinePairProfit : 1;

  const attacks = [
    { name: 'Baseline', error: baseline.summary.meanError, gini: baseline.summary.finalGini, color: '#94a3b8' },
    { name: 'Manipulator', error: manipulator.summary.meanError, gini: manipulator.summary.finalGini, color: '#ef4444' },
    { name: 'Arbitrageur', error: arbitrageur.summary.meanError, gini: arbitrageur.summary.finalGini, color: '#f59e0b' },
    { name: 'Sybil', error: sybil.summary.meanError, gini: sybil.summary.finalGini, color: '#f97316' },
    { name: 'Collusion', error: collusion.summary.meanError, gini: collusion.summary.finalGini, color: '#ec4899' },
    { name: 'Rep. reset', error: repReset.summary.meanError, gini: repReset.summary.finalGini, color: '#dc2626' },
    { name: 'Evader', error: evader.summary.meanError, gini: evader.summary.finalGini, color: '#a855f7' },
  ];

  const sigmaTraces = useMemo(() => downsample(
    Array.from({ length: Math.min(manipulator.traces.length, repReset.traces.length, baseline.traces.length) }, (_, i) => ({
      round: i + 1,
      honest: baseline.traces[i].sigma_t[0],
      manipulator: manipulator.traces[i].sigma_t[0],
      rep_reset: repReset.traces[i].sigma_t[0],
      evader: evader.traces[i]?.sigma_t[0] ?? 0,
    })), 300),
  [manipulator.traces, repReset.traces, baseline.traces, evader.traces]);

  // Mechanism response metrics for each attack
  const manipMetrics = useMechanismMetrics(manipulator, baseline, 0);
  const arbMetrics = useMechanismMetrics(arbitrageur, baseline, arbIdx);
  const evaderMetrics = useMechanismMetrics(evader, baseline, 0);
  const evaderDelta = compare(evader, baseline);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        Six attack types, each optimised against the mechanism's rules.
      </p>
      <MathBlock accent label="Payoff" latex="\\Pi_i = m_i\\left(1 + s(r_i, \\omega) - \\frac{\\sum_j m_j\\, s(r_j, \\omega)}{\\sum_j m_j}\\right)" />
      <p className="text-sm text-slate-600 max-w-2xl">
        The arbitrageur exploits the Chen (2014) arbitrage interval by reporting the mean of others.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricDisplay label="Manipulation profitable?" value={manipProfit > baseProfit0 + 0.5 ? 'Yes' : 'No'}
          detail={`F1: ${fmt(manipProfit, 2)} vs ${fmt(baseProfit0, 2)} honest`}
          variant={VERDICT_VARIANT[manipProfit > baseProfit0 + 0.5 ? 'bad' : 'good']} />
        <MetricDisplay label="Arbitrage profitable?" value={arbProfit > arbBaseline + 0.5 ? 'Yes' : 'No'}
          detail={`F6: ${fmt(arbProfit, 2)} vs ${fmt(arbBaseline, 2)} honest`}
          variant={VERDICT_VARIANT[arbProfit > arbBaseline + 0.5 ? 'bad' : 'good']} />
        <MetricDisplay label="Sybil-resistant?" value={sybilRatio <= 1.05 ? 'Yes' : 'No'}
          detail={`Clone pair ratio: ${fmt(sybilRatio, 3)}`}
          variant={VERDICT_VARIANT[sybilRatio <= 1.05 ? 'good' : 'bad']} />
      </div>

      {/* Attack comparison table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Attack impact comparison</h3>
        <p className="text-xs text-slate-500 mb-3">
          Each attack runs on the same DGP/seed. Only the attacker's behaviour changes.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-3 text-slate-400 font-medium">Attack</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Mean CRPS</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Δ vs base</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Gini</th>
                <th className="text-left py-2 px-2 text-slate-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ...attacks[0], desc: 'All agents truthful' },
                { ...attacks[1], desc: 'F1 pushes aggregate toward 0.5' },
                { ...attacks[2], desc: 'F6 reports mean of others (Chen arb.)' },
                { ...attacks[3], desc: 'F1–F2 clone with split deposit' },
                { ...attacks[4], desc: 'F1–F2 coordinate participation + reports' },
                { ...attacks[5], desc: 'F1 honest 100 rounds, then manipulates' },
                { ...attacks[6], desc: 'F1 adapts misreport to dispersion' },
              ].map((r, i) => {
                const delta = i === 0 ? 0 : (r.error - attacks[0].error) / attacks[0].error * 100;
                return (
                  <tr key={r.name} className="border-b border-slate-50">
                    <td className="py-2 pr-3 font-medium" style={{ color: r.color }}>{r.name}</td>
                    <td className="text-right py-2 px-2 font-mono">{fmt(r.error, 4)}</td>
                    <td className={`text-right py-2 px-2 font-mono ${delta > 1 ? 'text-red-500' : delta < -1 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {i === 0 ? '-' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`}
                    </td>
                    <td className="text-right py-2 px-2 font-mono">{fmt(r.gini, 3)}</td>
                    <td className="py-2 px-2 text-slate-500">{r.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Accuracy impact by attack" subtitle="Mean CRPS. Higher = worse aggregate." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={attacks} margin={{ ...CHART_MARGIN_LABELED, bottom: 32 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} angle={-20} textAnchor="end" />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="error" name="Mean CRPS" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {attacks.map(d => <Cell key={d.name} fill={d.color} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Attacker σ decay</h3>
            <ZoomBadge isZoomed={sigDecayZoom.state.isZoomed} onReset={sigDecayZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">F1's skill estimate under different attacks. Misreporting erodes σ. Drag to zoom.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={sigmaTraces} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={sigDecayZoom.onMouseDown} onMouseMove={sigDecayZoom.onMouseMove} onMouseUp={sigDecayZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigDecayZoom.state.left, sigDecayZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                  label={{ value: 'σ (F1)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="honest" name="Honest" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="manipulator" name="Manipulator" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="rep_reset" name="Rep. reset" stroke="#dc2626" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                <Line type="monotone" dataKey="evader" name="Evader" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                {sigDecayZoom.state.refLeft && sigDecayZoom.state.refRight && (
                  <ReferenceArea x1={sigDecayZoom.state.refLeft} x2={sigDecayZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mechanism response cards (task 10.3) */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Mechanism response metrics</h3>
        <p className="text-xs text-slate-500">
          EWMA half-life: ln(2)/0.1 &asymp; 6.9 rounds. This determines how quickly the skill layer responds to behaviour changes.
        </p>
        <div className="grid lg:grid-cols-3 gap-4">
          <MechanismResponseCard metrics={manipMetrics}
            attackVector="Push aggregate toward 0.5 with inflated stake"
            defenceMechanism="EWMA skill decay: misreports raise L, lowering σ and influence"
            effectiveness={manipProfit <= baseProfit0 + 0.5 ? 90 : 40} />
          <MechanismResponseCard metrics={arbMetrics}
            attackVector="Report mean of others (Chen arbitrage interval)"
            defenceMechanism="Mediocre scores keep σ moderate; can't outperform best forecaster"
            effectiveness={arbProfit <= arbBaseline + 0.5 ? 85 : 35} />
          <MechanismResponseCard metrics={evaderMetrics}
            attackVector="Adapt misreport magnitude to dispersion (stealth evasion)"
            defenceMechanism="EWMA still detects persistent errors; stealth only slows detection"
            effectiveness={evaderDelta.deltaPct < 3 ? 80 : 45} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 space-y-2">
        <p>
          The skill gate is the primary defence. Misreporting increases CRPS loss &rarr; raises L &rarr; lowers &sigma; &rarr; reduces m_i.
          The reputation reset attack (honest then exploit) shows the mechanism recovers: once F1 starts manipulating,
          &sigma; drops within ~20 rounds (EWMA half-life &asymp; 7 rounds with &rho; = 0.1).
        </p>
        <p>
          The Chen arbitrageur reports the mean of others&apos; predictions  - guaranteed nonneg payoff per round.
          But in the repeated setting, this strategy earns mediocre scores (it can&apos;t beat the best forecaster),
          so &sigma; stays moderate and the arbitrageur doesn&apos;t dominate.
        </p>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// REPORTING — hedging, noisy reporting, reputation gaming, sandbagging
// ════════════════════════════════════════════════════════════════════════════

function ReportingTab({ riskAverse, noisyReporter, reputationGamer, sandbagger, baseline }: {
  riskAverse: PipelineResult; noisyReporter: PipelineResult;
  reputationGamer: PipelineResult; sandbagger: PipelineResult; baseline: PipelineResult;
}) {
  const hedgeDelta = compare(riskAverse, baseline);
  const noisyDelta = compare(noisyReporter, baseline);
  const repGamerDelta = compare(reputationGamer, baseline);
  const sandbagDelta = compare(sandbagger, baseline);

  const cumZoomHedge = useChartZoom();
  const sigZoomHedge = useChartZoom();
  const cumZoomNoisy = useChartZoom();
  const sigZoomRepGamer = useChartZoom();
  const cumZoomSandbag = useChartZoom();

  // ── Hedging data (existing) ──────────────────────────────────────────
  const cumHedgeData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    hedged: riskAverse.rounds,
  }), [baseline.rounds, riskAverse.rounds]);

  const sigmaHedgeData = useMemo(() => downsample(
    Array.from({ length: Math.min(baseline.traces.length, riskAverse.traces.length) }, (_, i) => ({
      round: i + 1,
      baseline_avg: baseline.traces[i].sigma_t.reduce((a: number, b: number) => a + b, 0) / N,
      hedged_avg: riskAverse.traces[i].sigma_t.reduce((a: number, b: number) => a + b, 0) / N,
    })), 300),
  [baseline.traces, riskAverse.traces]);

  // ── Noisy reporting data ─────────────────────────────────────────────
  const cumNoisyData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    noisy: noisyReporter.rounds,
  }), [baseline.rounds, noisyReporter.rounds]);

  // ── Reputation gamer σ trajectory ────────────────────────────────────
  const sigRepGamerData = useMemo(() => {
    const len = Math.min(baseline.traces.length, reputationGamer.traces.length);
    return downsample(Array.from({ length: len }, (_, i) => ({
      round: i + 1,
      baseline: baseline.traces[i].sigma_t[0],
      gamer: reputationGamer.traces[i].sigma_t[0],
    })), 300);
  }, [baseline.traces, reputationGamer.traces]);

  // ── Sandbagging cumulative error ─────────────────────────────────────
  const cumSandbagData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    sandbagger: sandbagger.rounds,
  }), [baseline.rounds, sandbagger.rounds]);

  return (
    <div className="space-y-8">
      {/* ── Section 1: Hedging (existing content) ─────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-800">Risk-averse hedging</h3>
        <p className="text-sm text-slate-600 max-w-2xl">
          <strong>What it means:</strong> A risk-averse agent prefers a certain outcome over a gamble with the same expected value.
          In this mechanism, risk aversion manifests in two ways: (1) the agent <em>shrinks</em> their forecast toward the
          uninformative prior (0.5), reducing potential losses from extreme predictions, and (2) they <em>reduce</em> their
          deposit, limiting financial exposure. This is rational under concave utility (e.g. CRRA with γ &gt; 0), where
          the marginal value of gains is less than the marginal pain of losses.
        </p>
        <p className="text-sm text-slate-600 max-w-2xl mt-2">
          <strong>Mechanism impact:</strong> Hedged reports are less informative and carry less signal about the true outcome.
          The skill layer detects this: hedged agents score worse on average, so their σ drops and they receive less weight
          in the aggregate. The mechanism tolerates hedging without breaking because it measures actual forecast quality,
          not boldness. This is consistent with Lambert&apos;s individual rationality property.
        </p>
        <MathBlock accent label="Hedged report" latex="\\hat{r}_i = 0.7 \\cdot r_i^{\\text{true}} + 0.3 \\cdot 0.5, \\quad f_{\\text{risk}} \\leftarrow 0.55 \\cdot f_{\\text{risk}}" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricDisplay label="Accuracy hurt?" value={Math.abs(hedgeDelta.deltaPct) < 5 ? 'Minimal' : hedgeDelta.deltaPct > 0 ? 'Yes' : 'Improved'}
            detail={`Error ${hedgeDelta.deltaPct >= 0 ? '+' : ''}${hedgeDelta.deltaPct.toFixed(1)}% vs baseline`}
            variant={VERDICT_VARIANT[Math.abs(hedgeDelta.deltaPct) < 5 ? 'good' : hedgeDelta.deltaPct > 5 ? 'bad' : 'good']} />
          <MetricDisplay label="Mean CRPS (hedged)" value={fmt(riskAverse.summary.meanError, 4)} />
          <MetricDisplay label="Mean CRPS (baseline)" value={fmt(baseline.summary.meanError, 4)} />
          <MetricDisplay label="Gini (hedged)" value={fmt(riskAverse.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <ChartCard title="Cumulative error: hedged vs truthful" subtitle="Close tracking means hedging doesn't break the aggregate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={cumHedgeData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={cumZoomHedge.onMouseDown} onMouseMove={cumZoomHedge.onMouseMove} onMouseUp={cumZoomHedge.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoomHedge.state.left, cumZoomHedge.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                  label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" name="Truthful" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hedged" name="Hedged" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                {cumZoomHedge.state.refLeft && cumZoomHedge.state.refRight && (
                  <ReferenceArea x1={cumZoomHedge.state.refLeft} x2={cumZoomHedge.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Average skill estimate (σ)" subtitle="Hedged agents get lower σ because their reports are less accurate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={sigmaHedgeData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={sigZoomHedge.onMouseDown} onMouseMove={sigZoomHedge.onMouseMove} onMouseUp={sigZoomHedge.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigZoomHedge.state.left, sigZoomHedge.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                  label={{ value: 'Avg σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline_avg" name="Truthful avg σ" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hedged_avg" name="Hedged avg σ" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                {sigZoomHedge.state.refLeft && sigZoomHedge.state.refRight && (
                  <ReferenceArea x1={sigZoomHedge.state.refLeft} x2={sigZoomHedge.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          The mechanism tolerates hedging because the skill layer measures actual forecast quality,
          not boldness. Hedged agents get lower σ (less influence) but don't break the system.
          This is consistent with Lambert's individual rationality property.
        </div>
      </div>

      {/* ── Section 2: Noisy reporting ────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-800">Noisy reporting</h3>
        <p className="text-sm text-slate-600 max-w-2xl">
          Random noise added to truthful reports. The skill layer should detect lower signal quality.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricDisplay label="Noise hurts accuracy?" value={noisyDelta.deltaPct > 1 ? 'Yes' : 'Minimal'}
            detail={`Error ${noisyDelta.deltaPct >= 0 ? '+' : ''}${noisyDelta.deltaPct.toFixed(1)}% vs baseline`}
            variant={VERDICT_VARIANT[noisyDelta.deltaPct > 3 ? 'bad' : noisyDelta.deltaPct > 1 ? 'neutral' : 'good']} />
          <MetricDisplay label="Mean CRPS (noisy)" value={fmt(noisyReporter.summary.meanError, 4)} />
          <MetricDisplay label="Gini (noisy)" value={fmt(noisyReporter.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
          <MetricDisplay label="Participation" value={`${(noisyReporter.summary.meanParticipation / N * 100).toFixed(0)}%`} />
        </div>

        <ChartCard title="Cumulative error: noisy vs baseline" subtitle="Noise degrades accuracy but the skill layer limits aggregate damage. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={cumNoisyData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={cumZoomNoisy.onMouseDown} onMouseMove={cumZoomNoisy.onMouseMove} onMouseUp={cumZoomNoisy.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoomNoisy.state.left, cumZoomNoisy.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="noisy" name="Noisy reporter" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              {cumZoomNoisy.state.refLeft && cumZoomNoisy.state.refRight && (
                <ReferenceArea x1={cumZoomNoisy.state.refLeft} x2={cumZoomNoisy.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Section 3: Reputation gaming ──────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-800">Reputation gaming</h3>
        <p className="text-sm text-slate-600 max-w-2xl">
          Anchors reports near the aggregate to inflate σ. If EWMA is fooled, the gamer gains disproportionate influence.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricDisplay label="Gaming inflates σ?" value={repGamerDelta.deltaPct > 1 ? 'Partially' : 'No'}
            detail={`Error ${repGamerDelta.deltaPct >= 0 ? '+' : ''}${repGamerDelta.deltaPct.toFixed(1)}% vs baseline`}
            variant={VERDICT_VARIANT[repGamerDelta.deltaPct > 3 ? 'bad' : repGamerDelta.deltaPct > 1 ? 'neutral' : 'good']} />
          <MetricDisplay label="Mean CRPS (gamer)" value={fmt(reputationGamer.summary.meanError, 4)} />
          <MetricDisplay label="Gini (gamer)" value={fmt(reputationGamer.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
          <MetricDisplay label="N_eff (gamer)" value={fmt(reputationGamer.summary.meanNEff, 2)} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">σ trajectory: gamer vs honest</h3>
            <ZoomBadge isZoomed={sigZoomRepGamer.state.isZoomed} onReset={sigZoomRepGamer.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">Does the gamer's σ stay artificially high? Compare agent 0 across both runs.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={sigRepGamerData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={sigZoomRepGamer.onMouseDown} onMouseMove={sigZoomRepGamer.onMouseMove} onMouseUp={sigZoomRepGamer.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigZoomRepGamer.state.left, sigZoomRepGamer.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                  label={{ value: 'σ (agent 0)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" name="Honest" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="gamer" name="Rep. gamer" stroke="#7c3aed" strokeWidth={2} dot={false} />
                {sigZoomRepGamer.state.refLeft && sigZoomRepGamer.state.refRight && (
                  <ReferenceArea x1={sigZoomRepGamer.state.refLeft} x2={sigZoomRepGamer.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Section 4: Sandbagging ────────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-800">Sandbagging</h3>
        <p className="text-sm text-slate-600 max-w-2xl">
          Deliberately underperforms to lower expectations, then outperforms for outsized payoffs.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricDisplay label="Sandbagging hurts?" value={sandbagDelta.deltaPct > 1 ? 'Yes' : 'Minimal'}
            detail={`Error ${sandbagDelta.deltaPct >= 0 ? '+' : ''}${sandbagDelta.deltaPct.toFixed(1)}% vs baseline`}
            variant={VERDICT_VARIANT[sandbagDelta.deltaPct > 3 ? 'bad' : sandbagDelta.deltaPct > 1 ? 'neutral' : 'good']} />
          <MetricDisplay label="Mean CRPS (sandbag)" value={fmt(sandbagger.summary.meanError, 4)} />
          <MetricDisplay label="Gini (sandbag)" value={fmt(sandbagger.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
          <MetricDisplay label="Participation" value={`${(sandbagger.summary.meanParticipation / N * 100).toFixed(0)}%`} />
        </div>

        <ChartCard title="Cumulative error: sandbagger vs baseline" subtitle="Deliberate underperformance degrades the aggregate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={cumSandbagData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={cumZoomSandbag.onMouseDown} onMouseMove={cumZoomSandbag.onMouseMove} onMouseUp={cumZoomSandbag.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoomSandbag.state.left, cumZoomSandbag.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sandbagger" name="Sandbagger" stroke="#9333ea" strokeWidth={2} dot={false} />
              {cumZoomSandbag.state.refLeft && cumZoomSandbag.state.refRight && (
                <ReferenceArea x1={cumZoomSandbag.state.refLeft} x2={cumZoomSandbag.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// STAKING — budget constraints, house-money, Kelly sizing, deposit policies
// ════════════════════════════════════════════════════════════════════════════

function StakingTab({ budgetConstrained, houseMoney, kellySizer, baseline }: {
  budgetConstrained: PipelineResult; houseMoney: PipelineResult;
  kellySizer: PipelineResult; baseline: PipelineResult;
}) {
  const cumZoom = useChartZoom();
  const depositZoom = useChartZoom();

  const budgetDelta = compare(budgetConstrained, baseline);
  const houseDelta = compare(houseMoney, baseline);
  const kellyDelta = compare(kellySizer, baseline);

  // Ruin count: agents with final wealth < 0.1
  const ruinCount = budgetConstrained.finalState.filter(a => a.wealth < 0.1).length;

  // Cumulative error: budget-constrained vs baseline
  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    constrained: budgetConstrained.rounds,
  }), [baseline.rounds, budgetConstrained.rounds]);

  // Deposit-as-fraction comparison: kelly vs baseline (agent 0)
  const depositCompare = useMemo(() => {
    const len = Math.min(baseline.rounds.length, kellySizer.rounds.length);
    return downsample(Array.from({ length: len }, (_, i) => ({
      round: i + 1,
      baseline: baseline.rounds[i].totalDeposited / Math.max(1, baseline.rounds[i].participation),
      kelly: kellySizer.rounds[i].totalDeposited / Math.max(1, kellySizer.rounds[i].participation),
    })), 300);
  }, [baseline.rounds, kellySizer.rounds]);

  // Deposit policy bar chart data
  const depositPolicies = [
    { name: 'Baseline', crps: baseline.summary.meanError, gini: baseline.summary.finalGini, color: '#94a3b8' },
    { name: 'Budget-constrained', crps: budgetConstrained.summary.meanError, gini: budgetConstrained.summary.finalGini, color: '#14b8a6' },
    { name: 'House-money', crps: houseMoney.summary.meanError, gini: houseMoney.summary.finalGini, color: '#0d9488' },
    { name: 'Kelly sizer', crps: kellySizer.summary.meanError, gini: kellySizer.summary.finalGini, color: '#059669' },
  ];

  return (
    <div className="space-y-6">
      <PlaceholderBanner family="Staking" description={PLACEHOLDER_DESCRIPTIONS.Staking} />
      <p className="text-sm text-slate-600 max-w-2xl">
        How much agents wager determines their influence on the aggregate. Budget constraints
        can cause ruin (agents forced out), the house-money effect increases risk-taking after
        gains, and Kelly-like sizing ties deposits to estimated edge.
      </p>
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-700">How the effective wager works</div>
        <p>Each agent's deposit is scaled by a skill gate: <strong>effective wager = deposit × skill factor</strong>.</p>
        <p>The skill factor ranges from λ (minimum, for unskilled agents) to 1 (maximum, for the best).</p>
        <p>This means unskilled agents risk less of their deposit, reducing their influence on the aggregate.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Ruin events?" value={ruinCount > 0 ? `${ruinCount} agents` : 'None'}
          detail={`Agents with wealth < 0.1 at end`}
          variant={VERDICT_VARIANT[ruinCount > 0 ? 'bad' : 'good']} />
        <MetricDisplay label="House-money hurts?" value={Math.abs(houseDelta.deltaPct) < 5 ? 'Minimal' : 'Yes'}
          detail={`Error ${houseDelta.deltaPct >= 0 ? '+' : ''}${houseDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[Math.abs(houseDelta.deltaPct) < 5 ? 'good' : 'bad']} />
        <MetricDisplay label="Kelly improves?" value={kellyDelta.deltaPct < -1 ? 'Yes' : 'Minimal'}
          detail={`Error ${kellyDelta.deltaPct >= 0 ? '+' : ''}${kellyDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[kellyDelta.deltaPct < -1 ? 'good' : 'neutral']} />
        <MetricDisplay label="Budget Δ CRPS" value={`${budgetDelta.deltaPct >= 0 ? '+' : ''}${budgetDelta.deltaPct.toFixed(1)}%`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Cumulative error: budget-constrained vs baseline" subtitle="Ruin removes agents from the pool, potentially degrading the aggregate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={cumData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={cumZoom.onMouseDown} onMouseMove={cumZoom.onMouseMove} onMouseUp={cumZoom.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoom.state.left, cumZoom.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="constrained" name="Budget-constrained" stroke="#14b8a6" strokeWidth={2} dot={false} />
              {cumZoom.state.refLeft && cumZoom.state.refRight && (
                <ReferenceArea x1={cumZoom.state.refLeft} x2={cumZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Avg deposit per agent: Kelly vs baseline</h3>
            <ZoomBadge isZoomed={depositZoom.state.isZoomed} onReset={depositZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">Kelly sizing ties deposit to σ·(1−σ), producing adaptive stake sizes.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={depositCompare} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={depositZoom.onMouseDown} onMouseMove={depositZoom.onMouseMove} onMouseUp={depositZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[depositZoom.state.left, depositZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                  label={{ value: 'Avg deposit', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="kelly" name="Kelly sizer" stroke="#059669" strokeWidth={2} dot={false} />
                {depositZoom.state.refLeft && depositZoom.state.refRight && (
                  <ReferenceArea x1={depositZoom.state.refLeft} x2={depositZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deposit policy comparison bar chart */}
      <ChartCard title="Deposit policy comparison" subtitle="Mean CRPS across staking strategies. Lower is better." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={depositPolicies} margin={{ ...CHART_MARGIN_LABELED, bottom: 32 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} angle={-15} textAnchor="end" />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <Tooltip content={<SmartTooltip />} />
            <Bar dataKey="crps" name="Mean CRPS" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {depositPolicies.map(d => <Cell key={d.name} fill={d.color} opacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// OBJECTIVES — CRRA utility, risk aversion
// ════════════════════════════════════════════════════════════════════════════

function ObjectivesTab({ riskAverse, baseline }: {
  riskAverse: PipelineResult; baseline: PipelineResult;
}) {
  const cumZoom = useChartZoom();
  const raDelta = compare(riskAverse, baseline);

  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    risk_averse: riskAverse.rounds,
  }), [baseline.rounds, riskAverse.rounds]);

  return (
    <div className="space-y-6">
      <PlaceholderBanner family="Objectives" description={PLACEHOLDER_DESCRIPTIONS.Objectives} />
      <p className="text-sm text-slate-600 max-w-2xl">
        Not all agents maximise expected value. Under CRRA (Constant Relative Risk Aversion)
        utility, agents with higher &gamma; stake less and hedge reports toward the centre.
        The mechanism should tolerate diverse objectives without breaking the aggregate.
      </p>
      <MathBlock accent label="CRRA utility" latex="u(w) = \\begin{cases} \\frac{w^{1-\\gamma}}{1-\\gamma} & \\gamma \\neq 1 \\\\ \\ln(w) & \\gamma = 1 \\end{cases}" />

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-700">&gamma; mapping</div>
        <p>&gamma; = 0: risk-neutral (maximises expected value)</p>
        <p>&gamma; &gt; 0: risk-averse (concave utility, prefers certainty)</p>
        <p>&gamma; &lt; 0: risk-seeking (convex utility, prefers gambles)</p>
        <p>The risk_averse preset uses &gamma; = 2, producing hedged reports and lower deposits.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Risk aversion hurts?" value={Math.abs(raDelta.deltaPct) < 5 ? 'Minimal' : 'Yes'}
          detail={`Error ${raDelta.deltaPct >= 0 ? '+' : ''}${raDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[Math.abs(raDelta.deltaPct) < 5 ? 'good' : raDelta.deltaPct > 5 ? 'bad' : 'good']} />
        <MetricDisplay label="Mean CRPS (risk-averse)" value={fmt(riskAverse.summary.meanError, 4)} />
        <MetricDisplay label="Mean CRPS (baseline)" value={fmt(baseline.summary.meanError, 4)} />
        <MetricDisplay label="Gini (risk-averse)" value={fmt(riskAverse.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
      </div>

      <ChartCard title="Cumulative error: risk-averse vs baseline" subtitle="CRRA agents hedge and stake less. If lines track closely, the mechanism tolerates diverse objectives." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={cumData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
            onMouseDown={cumZoom.onMouseDown} onMouseMove={cumZoom.onMouseMove} onMouseUp={cumZoom.onMouseUp}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoom.state.left, cumZoom.state.right]} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
            <Tooltip content={<SmartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="risk_averse" name="Risk-averse" stroke="#6366f1" strokeWidth={2} dot={false} />
            {cumZoom.state.refLeft && cumZoom.state.refRight && (
              <ReferenceArea x1={cumZoom.state.refLeft} x2={cumZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 space-y-1">
        <div className="font-semibold text-amber-800">Taxonomy note  - Loss aversion, signalling, leaderboard motives</div>
        <p>
          The full taxonomy also includes <em>loss aversion</em> (asymmetric weighting of gains vs losses,
          Kahneman &amp; Tversky 1979), <em>signalling</em> (agents who participate to demonstrate
          competence rather than earn payoffs), and <em>leaderboard motives</em> (agents who optimise
          rank rather than wealth). These are not simulated here but represent important real-world
          objective functions that could interact with the mechanism&apos;s incentive structure.
        </p>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// IDENTITY — sybil, collusion, reputation reset
// ════════════════════════════════════════════════════════════════════════════

function IdentityTab({ sybil, collusion, repReset, baseline }: {
  sybil: PipelineResult; collusion: PipelineResult;
  repReset: PipelineResult; baseline: PipelineResult;
}) {
  const sigZoom = useChartZoom();

  const collusionDelta = compare(collusion, baseline);

  const sybilPairWealth = sybil.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const baselinePairWealth = baseline.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const sybilRatio = baselinePairWealth > 0 ? sybilPairWealth / baselinePairWealth : 1;

  const sybilMetrics = useMechanismMetrics(sybil, baseline, 0);
  const collusionMetrics = useMechanismMetrics(collusion, baseline, 0);
  const repResetMetrics = useMechanismMetrics(repReset, baseline, 0, 100);

  // σ trajectory for reputation reset with phase transition at round 100
  const sigData = useMemo(() => {
    const len = Math.min(baseline.traces.length, repReset.traces.length);
    return downsample(Array.from({ length: len }, (_, i) => ({
      round: i + 1,
      baseline: baseline.traces[i].sigma_t[0],
      rep_reset: repReset.traces[i].sigma_t[0],
    })), 300);
  }, [baseline.traces, repReset.traces]);

  return (
    <div className="space-y-6">
      <PlaceholderBanner family="Identity" description={PLACEHOLDER_DESCRIPTIONS.Identity} />
      <p className="text-sm text-slate-600 max-w-2xl">
        Identity attacks exploit the mechanism by splitting into multiple accounts (sybil),
        coordinating with allies (collusion), or building reputation then exploiting it
        (reputation reset). The skill layer and deposit-splitting rules are the primary defences.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricDisplay label="Sybil-resistant?" value={sybilRatio <= 1.05 ? 'Yes' : 'No'}
          detail={`Clone pair ratio: ${fmt(sybilRatio, 3)}`}
          variant={VERDICT_VARIANT[sybilRatio <= 1.05 ? 'good' : 'bad']} />
        <MetricDisplay label="Collusion profitable?" value={collusionDelta.deltaPct > 3 ? 'Partially' : 'No'}
          detail={`Error ${collusionDelta.deltaPct >= 0 ? '+' : ''}${collusionDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[collusionDelta.deltaPct > 3 ? 'bad' : 'good']} />
        <MetricDisplay label="Rep. reset recovers?" value={repResetMetrics.skillRecoveryRounds != null ? 'Yes' : 'No'}
          detail={repResetMetrics.skillRecoveryRounds != null ? `σ < 0.5 in ${repResetMetrics.skillRecoveryRounds} rounds after attack` : 'σ never dropped below 0.5'}
          variant={VERDICT_VARIANT[repResetMetrics.skillRecoveryRounds != null ? 'good' : 'bad']} />
      </div>

      {/* Mechanism response cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        <MechanismResponseCard metrics={sybilMetrics}
          attackVector="Split into 2 clones with shared deposit"
          defenceMechanism="Deposit splitting: each clone gets 1/k of total stake, reducing influence"
          effectiveness={sybilRatio <= 1.05 ? 95 : 60} />
        <MechanismResponseCard metrics={collusionMetrics}
          attackVector="2 agents coordinate reports and participation timing"
          defenceMechanism="EWMA skill tracking: coordinated mediocre reports earn mediocre σ"
          effectiveness={collusionDelta.deltaPct < 3 ? 90 : 50} />
        <MechanismResponseCard metrics={repResetMetrics}
          attackVector="Build honest reputation for 100 rounds, then manipulate"
          defenceMechanism="EWMA decay: σ drops within ~20 rounds of attack onset"
          effectiveness={repResetMetrics.skillRecoveryRounds != null && repResetMetrics.skillRecoveryRounds < 30 ? 85 : 40} />
      </div>

      {/* σ trajectory with phase transition marker */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-800">Reputation reset: σ trajectory</h3>
          <ZoomBadge isZoomed={sigZoom.state.isZoomed} onReset={sigZoom.reset} />
        </div>
        <p className="text-xs text-slate-500 mb-2">Agent 0 is honest for 100 rounds, then starts manipulating. Vertical line marks the phase transition.</p>
        <div className="cursor-crosshair">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={sigData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={sigZoom.onMouseDown} onMouseMove={sigZoom.onMouseMove} onMouseUp={sigZoom.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigZoom.state.left, sigZoom.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                label={{ value: 'σ (agent 0)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine x={100} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'Attack onset', position: 'top', fontSize: 11, fill: '#ef4444' }} />
              <Line type="monotone" dataKey="baseline" name="Honest baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rep_reset" name="Rep. reset attacker" stroke="#dc2626" strokeWidth={2} dot={false} />
              {sigZoom.state.refLeft && sigZoom.state.refRight && (
                <ReferenceArea x1={sigZoom.state.refLeft} x2={sigZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 space-y-1">
        <div className="font-semibold text-amber-800">Taxonomy note  - Dormancy/reactivation</div>
        <p>
          The taxonomy also includes <em>dormancy/reactivation</em>: agents who go silent for many
          rounds then return. The EWMA freeze handles this identically to bursty participation  -
          σ is preserved during absence and resumes updating on return.
        </p>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// LEARNING — reinforcement from profits
// ════════════════════════════════════════════════════════════════════════════

function LearningTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-indigo-900">Why learning is treated separately</h3>
        <p className="text-sm text-indigo-800 leading-relaxed">
          Learning creates a unique challenge because <em>both</em> the mechanism and the agents can adapt over time.
          This tab distinguishes two fundamentally different types of learning in the system.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <h4 className="text-sm font-semibold text-slate-800">Mechanism-side learning</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The EWMA skill update <em>is</em> the mechanism&apos;s learning rule. Each round, it observes forecast
            quality via CRPS scoring and updates the loss estimate L<sub>i,t</sub>, which maps to a skill weight
            σ<sub>i</sub>. This is fully specified and requires no agent cooperation. The learning rate ρ controls
            how quickly the mechanism adapts: higher ρ means faster response to recent performance but more noise.
          </p>
          <MathBlock accent label="Mechanism learning" latex="L_{i,t} = (1-\\rho)L_{i,t-1} + \\rho\\,\\ell_{i,t}" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <h4 className="text-sm font-semibold text-slate-800">Agent-side learning</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Agents who adjust their strategy based on past profits create a feedback loop: the mechanism
            updates σ based on agent behaviour, and agents update behaviour based on σ and payoffs. This
            is structurally different from other behaviour families because it requires modelling the
            agent&apos;s internal optimisation process, not just their observable actions.
          </p>
          <div className="rounded-lg bg-violet-50 border border-violet-100 p-3 text-xs text-violet-700">
            Examples: reinforcement learning (adjust reports based on reward signal), rule learning
            (discover the scoring rule and optimise against it), exploration vs exploitation (balance
            trying new strategies vs exploiting known ones).
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
        <h4 className="text-sm font-semibold text-slate-800">The key question</h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Does the mechanism remain robust when agents learn to game it? If an agent discovers that
          hedging toward 0.5 reduces variance, the EWMA detects the resulting accuracy drop and
          lowers σ. But if an agent learns to <em>improve</em> their forecasts (genuine learning),
          the mechanism rewards this with higher σ. The design is incentive-compatible with genuine
          improvement but penalises strategic manipulation, the same property that makes it robust
          to the adversarial attacks tested in other tabs.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mt-1">
          Full agent-side learning simulations (RL agents, bandit algorithms, gradient-based adaptation)
          are a separate research direction and not included in the current behaviour comparison table.
        </p>
      </div>

      {/* taxonomy notes for the 3 items */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-700">Taxonomy items in this family</div>
        <p>• <strong>Reinforcement from profits</strong> - Agents adjust strategy based on payoff history. The mechanism&apos;s EWMA already performs this function on the mechanism side.</p>
        <p>• <strong>Rule learning</strong> - Agents discover the scoring rule structure and optimise against it. Proper scoring rules are designed to make truthful reporting optimal even when the rule is known.</p>
        <p>• <strong>Exploration vs exploitation</strong> - Agents balance trying new strategies vs exploiting known ones. This creates non-stationary behaviour that the EWMA must track.</p>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// OPERATIONAL — latency exploitation
// ════════════════════════════════════════════════════════════════════════════

function OperationalTab({ latencyExploiter, baseline }: {
  latencyExploiter: PipelineResult; baseline: PipelineResult;
}) {
  const cumZoom = useChartZoom();
  const latDelta = compare(latencyExploiter, baseline);

  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    latency: latencyExploiter.rounds,
  }), [baseline.rounds, latencyExploiter.rounds]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            In-browser simulation: latency exploitation
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Additional operational frictions (interface errors, automation patterns)
          are documented in the taxonomy but not yet simulated.
        </p>
      </div>
      <p className="text-sm text-slate-600 max-w-2xl">
        Latency exploiters submit reports with partial outcome information  - they observe
        a noisy signal of the realisation before the submission deadline. This creates an unfair
        information advantage that concentrates wealth.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Latency exploitable?" value={latDelta.deltaPct < -1 ? 'Yes' : 'Minimal'}
          detail={`Error ${latDelta.deltaPct >= 0 ? '+' : ''}${latDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[latDelta.deltaPct < -3 ? 'bad' : 'neutral']} />
        <MetricDisplay label="Mean CRPS (latency)" value={fmt(latencyExploiter.summary.meanError, 4)} />
        <MetricDisplay label="Gini (latency)" value={fmt(latencyExploiter.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
        <MetricDisplay label="Gini delta" value={fmt(latencyExploiter.summary.finalGini - baseline.summary.finalGini, 4)}
          detail={latencyExploiter.summary.finalGini > baseline.summary.finalGini ? 'More concentrated' : 'Less concentrated'} />
      </div>

      <ChartCard title="Cumulative error: latency exploiter vs baseline" subtitle="Lower CRPS for the exploiter means they have an unfair advantage. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={cumData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
            onMouseDown={cumZoom.onMouseDown} onMouseMove={cumZoom.onMouseMove} onMouseUp={cumZoom.onMouseUp}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoom.state.left, cumZoom.state.right]} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
            <Tooltip content={<SmartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="latency" name="Latency exploiter" stroke="#64748b" strokeWidth={2} dot={false} />
            {cumZoom.state.refLeft && cumZoom.state.refRight && (
              <ReferenceArea x1={cumZoom.state.refLeft} x2={cumZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 space-y-1">
        <div className="font-semibold text-amber-800">Taxonomy note  - Interface errors &amp; automation patterns</div>
        <p>
          The full taxonomy also includes <em>interface errors</em> (accidental misreports due to
          UI bugs or fat-finger mistakes) and <em>automation patterns</em> (bot-like agents that
          submit at fixed intervals with algorithmic reports). These are not simulated here but
          represent important operational frictions in real-world prediction market deployments.
        </p>
      </div>
    </div>
  );
}



// ════════════════════════════════════════════════════════════════════════════
// SENSITIVITY — λ × σ_min parameter sweep
// ════════════════════════════════════════════════════════════════════════════

function SensitivityTab({ data }: { data: { lam: number; sig: number; error: number; gini: number }[] }) {
  const best = data.reduce((a, b) => a.error < b.error ? a : b);
  const worst = data.reduce((a, b) => a.error > b.error ? a : b);
  const range = worst.error - best.error;
  const relRange = best.error > 0 ? (range / best.error * 100) : 0;
  const notBrittle = relRange < 30;

  const lams = [...new Set(data.map(d => d.lam))].sort((a, b) => a - b);
  const sigs = [...new Set(data.map(d => d.sig))].sort((a, b) => a - b);
  const sigColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  const barData = lams.map(lam => {
    const row: Record<string, number | string> = { lam: `λ=${lam}` };
    for (const sig of sigs) {
      const pt = data.find(d => d.lam === lam && d.sig === sig);
      if (pt) row[`σ=${sig}`] = pt.error;
    }
    return row;
  });

  // Seasonality data (previously its own tab, now included here)
  const SEASON_DATA = [
    { season: 'Winter', pct: 17.3, color: '#6366f1' },
    { season: 'Spring', pct: 14.3, color: '#0ea5e9' },
    { season: 'Autumn', pct: 14.6, color: '#f59e0b' },
    { season: 'Summer', pct: 11.8, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        The skill gate g(σ) = λ + (1−λ)σ^η has two key parameters.
        λ controls the floor (how much influence an unskilled agent retains).
        σ_min sets the minimum skill estimate. A robust mechanism should vary smoothly.
      </p>
      <MathBlock accent label="Skill gate" latex="g(\\sigma_i) = \\lambda + (1-\\lambda)\\,\\sigma_i^\\eta, \\quad \\sigma_i = \\sigma_{\\min} + (1-\\sigma_{\\min})\\,e^{-\\gamma L_i}" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Brittle?" value={notBrittle ? 'No' : 'Yes'}
          detail={`Error varies ${relRange.toFixed(0)}% across ${data.length} configs`}
          variant={VERDICT_VARIANT[notBrittle ? 'good' : 'bad']} />
        <MetricDisplay label="Best" value={`λ=${best.lam}, σ=${best.sig}`} detail={`CRPS ${fmt(best.error, 4)}`} />
        <MetricDisplay label="Worst" value={`λ=${worst.lam}, σ=${worst.sig}`} detail={`CRPS ${fmt(worst.error, 4)}`} />
        <MetricDisplay label="Gini range" value={fmt(Math.max(...data.map(d => d.gini)) - Math.min(...data.map(d => d.gini)), 3)} />
      </div>

      <ChartCard title="Mean CRPS by λ and σ_min" subtitle={`${data.length} configs, ${T} rounds each. Lower is better.`} provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={barData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="lam" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <Tooltip content={<SmartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {sigs.map((sig, i) => (
              <Bar key={sig} dataKey={`σ=${sig}`} name={`σ_min=${sig}`}
                fill={sigColors[i % sigColors.length]} radius={[3, 3, 0, 0]} maxBarSize={20} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Seasonality section (folded in from old Seasonality tab) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Seasonal robustness (real data)</h3>
        <p className="text-sm text-slate-600 max-w-2xl">
          Wind patterns change across seasons. The EWMA skill layer adapts automatically —
          no explicit regime detection needed. Data: Elia Belgian offshore wind, 17,544 hourly points,
          5 forecasting models. All improvements significant (DM test, p &lt; 0.001).
        </p>
        <div className="grid sm:grid-cols-4 gap-3">
          {SEASON_DATA.map(s => (
            <div key={s.season} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <div className="text-xs text-slate-400 font-medium">{s.season}</div>
              <div className="text-2xl font-bold font-mono mt-1" style={{ color: s.color }}>+{s.pct}%</div>
              <div className="text-[11px] text-slate-400 mt-1">vs equal weighting</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        Error varies smoothly — no cliff edges. λ = 0 (pure skill, no floor) performs worst because
        it gives zero influence to new agents. High σ_min reduces differentiation.
        The production config (λ = 0.3, σ_min = 0.1) is near-optimal.
        Winter gains are largest (+17.3%) because wind variability is highest and model quality
        differences are most pronounced.
      </div>
    </div>
  );
}
