/**
 * TheoryGroundingPanel — Literature summary, theory-vs-practice table,
 * and highlighted theoretical predictions for the audit page.
 */

import { LITERATURE_REFS, THEORY_VS_PRACTICE } from '@/lib/audit/auditContent';
import type { LiteratureRef } from '@/lib/audit/auditTypes';

// ── Category display config ────────────────────────────────────────────────

const CATEGORY_LABELS: Record<LiteratureRef['category'], string> = {
  mechanism_design: 'Mechanism Design',
  linear_pool: 'Linear Pool Limitations',
  online_learning: 'Online Learning',
  alternative_aggregation: 'Alternative Aggregation',
  model_improvement: 'Model Improvement',
  collusion: 'Collusion & Incentives',
};

const CATEGORY_ORDER: LiteratureRef['category'][] = [
  'mechanism_design',
  'linear_pool',
  'online_learning',
  'alternative_aggregation',
  'model_improvement',
  'collusion',
];

// ════════════════════════════════════════════════════════════════════════════

export default function TheoryGroundingPanel() {
  // Group references by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    refs: LITERATURE_REFS.filter((r) => r.category === cat),
  })).filter((g) => g.refs.length > 0);

  return (
    <div className="space-y-10">
      {/* ── Highlighted predictions ──────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Key Theoretical Predictions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightCard
            title="Linear Pool Uncalibration"
            source="Ranjan & Gneiting (2010)"
            prediction="Any nontrivial weighted average of calibrated forecasts is necessarily uncalibrated — overdispersed in the centre, underdispersed in the tails."
            observation="Calibration diagram confirms: central quantiles (0.25–0.75) are well-calibrated, but tail quantiles (0.1, 0.9) show 3–5% coverage gaps."
            colour="amber"
          />
          <HighlightCard
            title="MWU Regret Bound"
            source="Cesa-Bianchi & Lugosi (2006)"
            prediction="Multiplicative Weights Update achieves O(√(T log N)) regret. Fixed learning rate EWMA does not guarantee sublinear regret."
            observation="Mechanism CRPS (0.0448) is 23% above oracle (0.0344). The gap persists over 17,344 rounds — consistent with linear regret accumulation."
            colour="blue"
          />
        </div>
      </section>

      {/* ── Literature summary by category ───────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Literature Summary
        </h2>
        {grouped.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {group.label}
            </h3>
            <div className="space-y-3">
              {group.refs.map((ref) => (
                <ReferenceCard key={ref.id} ref_={ref} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Theory vs Practice table ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Theory vs Practice
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">
                  Theoretical Prediction
                </th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">
                  Empirical Observation
                </th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/6">
                  Source
                </th>
                <th className="text-center py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/6">
                  Supported?
                </th>
              </tr>
            </thead>
            <tbody>
              {THEORY_VS_PRACTICE.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 pr-4 text-slate-700 align-top">
                    {row.theoreticalPrediction}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 align-top">
                    {row.empiricalObservation}
                  </td>
                  <td className="py-3 pr-4 text-slate-500 align-top text-xs">
                    {row.source}
                  </td>
                  <td className="py-3 text-center align-top">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                        row.supported
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {row.supported ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function HighlightCard({
  title,
  source,
  prediction,
  observation,
  colour,
}: {
  title: string;
  source: string;
  prediction: string;
  observation: string;
  colour: 'amber' | 'blue';
}) {
  const border = colour === 'amber' ? 'border-amber-300' : 'border-blue-300';
  const bg = colour === 'amber' ? 'bg-amber-50' : 'bg-blue-50';
  const badge =
    colour === 'amber'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-blue-100 text-blue-800';

  return (
    <div className={`rounded-lg border ${border} ${bg} p-4 space-y-2`}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge}`}>
          {source}
        </span>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-slate-700">
          <span className="font-medium text-slate-800">Theory: </span>
          {prediction}
        </p>
        <p className="text-xs text-slate-600">
          <span className="font-medium text-slate-700">Observed: </span>
          {observation}
        </p>
      </div>
    </div>
  );
}

function ReferenceCard({ ref_ }: { ref_: LiteratureRef }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1.5">
      <div className="flex items-start gap-2">
        <span className="text-xs font-semibold text-slate-800">
          {ref_.authors}
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5">—</span>
        <span className="text-xs text-slate-600 italic flex-1">
          {ref_.title}
        </span>
      </div>
      <p className="text-xs text-slate-700">
        <span className="font-medium">Key finding: </span>
        {ref_.keyFinding}
      </p>
      <p className="text-xs text-slate-500">
        <span className="font-medium text-slate-600">Dashboard connection: </span>
        {ref_.empiricalConnection}
      </p>
    </div>
  );
}
