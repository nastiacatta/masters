import { useState } from 'react';
import { useAuditData } from '@/hooks/useAuditData';
import TheoryGroundingPanel from '@/components/audit/TheoryGroundingPanel';
import ModelAuditPanel from '@/components/audit/ModelAuditPanel';
import SkillAllocationPanel from '@/components/audit/SkillAllocationPanel';
import WagerAllocationPanel from '@/components/audit/WagerAllocationPanel';
import AggregationAccuracyPanel from '@/components/audit/AggregationAccuracyPanel';
import ImprovementPanel from '@/components/audit/ImprovementPanel';
import TabBar from '@/components/dashboard/TabBar';

// ── Tab configuration ──────────────────────────────────────────────────────

const AUDIT_TABS = [
  'Theory',
  'Models',
  'Skill',
  'Wagers',
  'Aggregation',
  'Improvements',
] as const;
type AuditTab = (typeof AUDIT_TABS)[number];

// ════════════════════════════════════════════════════════════════════════════
// AUDIT PAGE
// ════════════════════════════════════════════════════════════════════════════

export default function AuditPage() {
  const [tab, setTab] = useState<AuditTab>('Theory');
  const data = useAuditData();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-8 pt-14 pb-20 space-y-12">
        <header>
          <p className="eyebrow mb-3" style={{ color: 'var(--navy)' }}>
            Performance review
          </p>
          <h1
            className="font-serif tracking-tight"
            style={{
              fontSize: 'clamp(32px, 4vw, 42px)',
              lineHeight: 1.15,
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            Performance audit
          </h1>
          <p
            className="font-serif mt-4"
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--ink-muted)',
              maxWidth: 680,
            }}
          >
            Theory-grounded review of the mechanism&apos;s empirical performance: model quality,
            how skill is allocated across forecasters, how wagers are distributed, aggregation
            accuracy versus baselines, and recommended improvements.
          </p>
        </header>

        {/* ── Tab bar ──────────────────────────────────────────────── */}
        <TabBar
          tabs={AUDIT_TABS}
          activeTab={tab}
          onTabChange={(t) => setTab(t as AuditTab)}
          progressLabel={`Tab ${AUDIT_TABS.indexOf(tab) + 1} of ${AUDIT_TABS.length}: ${tab}`}
        />

        {/* ── Loading state ────────────────────────────────────────── */}
        {data.loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
              Loading audit data…
            </div>
          </div>
        )}

        {/* ── Error banner ─────────────────────────────────────────── */}
        {data.errors.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium text-amber-800">
              Some data files could not be loaded:
            </p>
            <ul className="mt-1 list-disc list-inside text-xs text-amber-700">
              {data.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Tab content ──────────────────────────────────────────── */}
        {!data.loading && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            {tab === 'Theory' && <TheoryGroundingPanel />}
            {tab === 'Models' && <ModelAuditPanel />}
            {tab === 'Skill' && <SkillAllocationPanel />}
            {tab === 'Wagers' && <WagerAllocationPanel />}
            {tab === 'Aggregation' && <AggregationAccuracyPanel />}
            {tab === 'Improvements' && <ImprovementPanel />}
          </div>
        )}
      </div>
    </div>
  );
}

// All panels are now implemented — no placeholder needed.
