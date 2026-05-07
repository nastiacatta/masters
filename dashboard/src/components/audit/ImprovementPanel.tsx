/**
 * ImprovementPanel — Prioritised improvement recommendations organised
 * by category with sub-tabs, priority badges, and evidence citations.
 */

import { useState, useMemo } from 'react';
import { RECOMMENDATIONS } from '@/lib/audit/auditContent';
import type { Recommendation } from '@/lib/audit/auditTypes';

// ── Category configuration ─────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'model' as const, label: 'Model' },
  { key: 'skill' as const, label: 'Skill' },
  { key: 'aggregation' as const, label: 'Aggregation' },
  { key: 'economic' as const, label: 'Economic' },
];

type Category = Recommendation['category'];

// ── Priority badge colours ─────────────────────────────────────────────────

const PRIORITY_STYLES: Record<
  Recommendation['priority'],
  { bg: string; text: string }
> = {
  high: { bg: 'bg-red-100', text: 'text-red-800' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-800' },
  low: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

// ════════════════════════════════════════════════════════════════════════════

export default function ImprovementPanel() {
  const [activeCategory, setActiveCategory] = useState<Category>('model');

  const filteredRecs = useMemo(
    () =>
      RECOMMENDATIONS.filter((r) => r.category === activeCategory).sort(
        (a, b) => {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.priority] - order[b.priority];
        },
      ),
    [activeCategory],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      model: 0,
      skill: 0,
      aggregation: 0,
      economic: 0,
    };
    for (const rec of RECOMMENDATIONS) {
      counts[rec.category]++;
    }
    return counts;
  }, []);

  return (
    <div className="space-y-8">
      {/* ── Header ───────────────────────────────────────────────── */}
      <section>
        <h2 className="panel-heading">
          Improvement Recommendations
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Prioritised recommendations across four categories. Each
          recommendation includes evidence from the audit analysis and
          estimated CRPS impact where available.
        </p>
      </section>

      {/* ── Category sub-tabs ────────────────────────────────────── */}
      <div className="flex gap-0 border-b border-slate-200">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeCategory === cat.key
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {cat.label}
            <span className="ml-1.5 text-[10px] text-slate-400">
              ({categoryCounts[cat.key]})
            </span>
          </button>
        ))}
      </div>

      {/* ── Recommendation cards ──────────────────────────────────── */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
        {filteredRecs.length === 0 && (
          <p className="text-xs text-slate-400 py-8 text-center">
            No recommendations in this category.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const style = PRIORITY_STYLES[rec.priority];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}
        >
          {rec.priority}
        </span>
        <h3 className="text-sm font-semibold text-slate-900 flex-1">
          {rec.title}
        </h3>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        {rec.description}
      </p>

      {rec.evidence && (
        <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
          <p className="text-[10px] text-slate-500">
            <span className="font-semibold text-slate-600">Evidence: </span>
            {rec.evidence}
          </p>
        </div>
      )}

      {rec.crpsEstimate && (
        <p className="text-[10px] text-indigo-600 font-medium">
          Estimated impact: {rec.crpsEstimate}
        </p>
      )}
    </div>
  );
}
