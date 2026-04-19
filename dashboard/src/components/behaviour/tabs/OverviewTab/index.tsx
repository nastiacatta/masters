import { useMemo, useCallback } from 'react';
import ArchitectureDiagram from '@/components/behaviour/ArchitectureDiagram';
import FamilyCard from '@/components/behaviour/FamilyCard';
import CoverageAudit from '@/components/behaviour/CoverageAudit';
import EnhancedComparisonTable from '@/components/behaviour/EnhancedComparisonTable';
import FamilyImpactChart from '@/components/behaviour/FamilyImpactChart';
import ThreatClassification from './ThreatClassification';
import StructuralInsights from './StructuralInsights';
import TornadoChart from '@/components/charts/TornadoChart';
import type { TornadoDatum } from '@/components/charts/TornadoChart';
import { TAXONOMY_ITEMS } from '@/lib/behaviour/taxonomyData';
import { PRESET_CONFIGS } from '@/lib/behaviour/presetMeta';
import type { BehaviourFamily, BehaviourPresetId } from '@/lib/behaviour/hiddenAttributes';
import { SEED, N, T } from '@/lib/behaviour/helpers';
import type { ComparisonRow, FamilyImpactDatum } from '@/hooks/useBehaviourSimulations';

// ── Tab type (mirrors BehaviourPage) ───────────────────────────────────────

const TABS = [
  'Overview', 'Participation', 'Information', 'Reporting', 'Staking',
  'Objectives', 'Identity', 'Learning', 'Adversarial', 'Operational', 'Sensitivity',
] as const;
type Tab = (typeof TABS)[number];

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

// ── Component ──────────────────────────────────────────────────────────────

export default function OverviewTab({ summary, familyImpact, setTab }: {
  summary: ComparisonRow[];
  familyImpact: FamilyImpactDatum[];
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

  // Navigate to the relevant tab when a row is clicked in the comparison table
  const handleRowClick = useCallback((presetId: string) => {
    const config = PRESET_CONFIGS[presetId as BehaviourPresetId];
    if (config) {
      setTab(familyToTab(config.family));
    }
  }, [familyToTab, setTab]);

  // Handle empty summary (all pipelines failed)
  if (summary.length === 0) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
          Simulation failed — no behaviour preset data available. Try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* (1) Summary sentence */}
      <p className="text-sm text-slate-600">
        The mechanism sees deposits, reports, and participation, never motives. Each behaviour below is tested in isolation.
      </p>

      {/* (2) Cross-behaviour comparison table — promoted to top */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Cross-behaviour comparison</h3>
        <p className="text-xs text-slate-500">
          Sorted by CRPS impact (worst first). Green = beneficial, red = harmful.
          All runs: {T} rounds, {N} agents, seed {SEED}, baseline DGP. Paired against truthful baseline. 18 presets (RL excluded, mechanism layer).
        </p>
        <EnhancedComparisonTable
          rows={summary}
          baselineName="Benign baseline"
          grouped
          onRowClick={handleRowClick}
        />
      </div>

      {/* (3) Threat classification — data-driven */}
      <ThreatClassification summary={summary} />

      {/* (4) Structural insights — data-driven */}
      <StructuralInsights summary={summary} familyImpact={familyImpact} />

      {/* (5) 9 FamilyCards grid */}
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

      {/* (6) Coverage audit */}
      <CoverageAudit
        families={coverageFamilies}
        onNavigate={(navTab) => {
          if (TABS.includes(navTab as Tab)) setTab(navTab as Tab);
        }}
      />

      {/* (7) Architecture diagram — moved to bottom */}
      <ArchitectureDiagram />

      {/* (8) Family impact chart + tornado */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Worst-case impact by family</h3>
        <p className="text-xs text-slate-500">
          Worst-case Δ CRPS (%) from each behaviour family. Larger bars = more damaging.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <FamilyImpactChart data={familyImpact} />
        </div>
      </div>

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
