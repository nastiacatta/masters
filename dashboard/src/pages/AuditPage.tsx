import { useState } from 'react';
import { useAuditData } from '@/hooks/useAuditData';
import TheoryGroundingPanel from '@/components/audit/TheoryGroundingPanel';
import ModelAuditPanel from '@/components/audit/ModelAuditPanel';
import SkillAllocationPanel from '@/components/audit/SkillAllocationPanel';
import WagerAllocationPanel from '@/components/audit/WagerAllocationPanel';
import AggregationAccuracyPanel from '@/components/audit/AggregationAccuracyPanel';
import ImprovementPanel from '@/components/audit/ImprovementPanel';

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
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Performance Audit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theory-grounded audit of model quality, skill allocation, wager
            distribution, aggregation accuracy, and improvement recommendations.
          </p>
        </header>

        {/* ── Tab bar ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-0">
          <div className="flex gap-0 border-b border-slate-200 overflow-x-auto flex-1">
            {AUDIT_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  tab === t
                    ? 'border-slate-800 text-slate-800'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <span
            className="ml-auto flex-shrink-0 whitespace-nowrap pl-4 pr-1 text-slate-400"
            style={{ fontSize: '11px' }}
          >
            Tab {AUDIT_TABS.indexOf(tab) + 1} of {AUDIT_TABS.length}: {tab}
          </span>
        </div>

        {/* ── Loading state ────────────────────────────────────────── */}
        {data.loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-sm text-slate-400 animate-pulse">
              Loading audit data…
            </div>
          </div>
        )}

        {/* ── Error banner ─────────────────────────────────────────── */}
        {data.errors.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
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
          <div>
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
