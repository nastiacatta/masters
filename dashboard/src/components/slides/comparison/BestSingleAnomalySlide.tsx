import SlideWrapper from '../SlideWrapper';
import InsightCard from './InsightCard';
import { useComparisonData } from '../../../lib/comparison/useComparisonData';
import {
  aggregateByMethod,
  formatCrps,
} from '../../../lib/comparison/comparisonUtils';
import type {
  DgpData,
  RealComparisonData,
  AggregatedRow,
  ComparisonRow,
} from '../../../lib/comparison/types';

/* ── Helpers ─────────────────────────────────────────────────── */

interface DatasetResult {
  label: string;
  bestSingleCrps: number;
  mechanismCrps: number;
  gap: number;
  bestSingleWins: boolean;
}

function findRow<T extends { method: string }>(
  rows: T[],
  method: string,
): T | undefined {
  return rows.find((r) => r.method === method);
}

function buildDatasetResult(
  label: string,
  bestSingleCrps: number,
  mechanismCrps: number,
): DatasetResult {
  return {
    label,
    bestSingleCrps,
    mechanismCrps,
    gap: mechanismCrps - bestSingleCrps,
    bestSingleWins: bestSingleCrps < mechanismCrps,
  };
}

/* ── Component ──────────────────────────────────────────────── */

export default function BestSingleAnomalySlide() {
  const dgp = useComparisonData<DgpData>(
    'data/core 2/experiments/master_comparison/data/master_comparison.json',
  );
  const elec = useComparisonData<RealComparisonData>(
    'data/real_data/elia_electricity/data/comparison.json',
  );
  const wind = useComparisonData<RealComparisonData>(
    'data/real_data/elia_wind/data/comparison.json',
  );

  const anyLoading = dgp.loading || elec.loading || wind.loading;

  /* Build per-dataset results */
  const datasets: DatasetResult[] = [];

  if (dgp.data) {
    const agg = aggregateByMethod(dgp.data.rows);
    const bestSingle = findRow<AggregatedRow>(agg, 'best_single');
    const mechanism = findRow<AggregatedRow>(agg, 'mechanism');
    if (bestSingle && mechanism) {
      datasets.push(
        buildDatasetResult('DGP', bestSingle.meanCrps, mechanism.meanCrps),
      );
    }
  }

  if (elec.data) {
    const bestSingle = findRow<ComparisonRow>(elec.data.rows, 'best_single');
    const mechanism = findRow<ComparisonRow>(elec.data.rows, 'mechanism');
    if (bestSingle && mechanism) {
      datasets.push(
        buildDatasetResult('Electricity', bestSingle.mean_crps, mechanism.mean_crps),
      );
    }
  }

  if (wind.data) {
    const bestSingle = findRow<ComparisonRow>(wind.data.rows, 'best_single');
    const mechanism = findRow<ComparisonRow>(wind.data.rows, 'mechanism');
    if (bestSingle && mechanism) {
      datasets.push(
        buildDatasetResult('Wind', bestSingle.mean_crps, mechanism.mean_crps),
      );
    }
  }

  return (
    <SlideWrapper>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
        Comparison
      </h2>
      <h3 className="text-2xl font-bold text-slate-900">
        Best-Single Forecaster Anomaly
      </h3>
      <p className="mt-2 text-sm text-slate-500 max-w-2xl">
        Comparing the best individual forecaster (best_single) against the
        mechanism's aggregated forecast across DGP, electricity, and wind
        datasets.
      </p>

      {/* Loading spinner */}
      {anyLoading && (
        <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Loading comparison data…
        </div>
      )}

      {/* Per-dataset error banners */}
      {dgp.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          DGP data failed to load: {dgp.error}
        </div>
      )}
      {elec.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Electricity data failed to load: {elec.error}
        </div>
      )}
      {wind.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Wind data failed to load: {wind.error}
        </div>
      )}

      {/* Dataset comparison cards */}
      {datasets.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {datasets.map((ds) => (
            <div
              key={ds.label}
              className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col items-center text-center"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {ds.label}
              </p>
              <div className="mt-4 flex flex-col gap-2 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">best_single</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCrps(ds.bestSingleCrps)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">mechanism</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCrps(ds.mechanismCrps)}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 w-full">
                {ds.bestSingleWins ? (
                  <p className="text-sm text-red-500 font-semibold">
                    best_single wins by {formatCrps(ds.gap)}
                  </p>
                ) : (
                  <p className="text-sm text-emerald-600 font-semibold">
                    mechanism wins by {formatCrps(-ds.gap)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insight cards */}
      {!anyLoading && (
        <div className="mt-8 flex flex-col gap-4">
          <InsightCard
            icon="🎯"
            color="red"
            title="Wind: best_single dominates aggregation"
            description="In wind data, best_single (CRPS ≈ 0.033) dominates all aggregation methods (mechanism CRPS ≈ 0.073) — a pattern not observed in the DGP."
          />
          <InsightCard
            icon="🔬"
            color="green"
            title="DGP: aggregation can match best_single"
            description="In the DGP, aggregation methods can approach or beat best_single because the latent truth is identifiable and skill weights converge correctly."
          />
          <InsightCard
            icon="⚡"
            color="amber"
            title="Electricity: smaller gap than wind"
            description="In electricity data, best_single also beats aggregation methods but the gap between mechanism and best_single is smaller than in wind, suggesting forecasters are more evenly skilled."
          />
        </div>
      )}
    </SlideWrapper>
  );
}
