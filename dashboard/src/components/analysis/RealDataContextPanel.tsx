/**
 * Real-data contextualisation panel.
 *
 * "Generalisability" callout, dataset characteristics,
 * side-by-side synthetic vs real-data ΔCRPS comparison,
 * "Future replication targets" list, and discrepancy flag.
 *
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

import type { RealDataResult } from '../../lib/adapters';

interface RealDataContextPanelProps {
  realData: RealDataResult | null;
  realDataElectricity?: RealDataResult | null;
  syntheticDeltaCrps: number | null;
}

/** Compute mean ΔCRPS for blended vs equal from a RealDataResult. */
function computeRealDeltaCrps(data: RealDataResult | null): number | null {
  if (!data?.rows) return null;
  const blendedRows = data.rows.filter((r) => r.method === 'blended');
  if (blendedRows.length === 0) return null;
  return blendedRows.reduce((s, r) => s + r.delta_crps_vs_equal, 0) / blendedRows.length;
}

/** Check for discrepancy (>2× difference). */
import { hasDiscrepancyWarning } from '@/lib/analysis/discrepancyWarning';

const FUTURE_TARGETS = [
  'Temperature forecasts (ECMWF ensemble)',
  'Financial volatility (VIX options)',
  'Solar irradiance (PVGIS)',
];

export default function RealDataContextPanel({
  realData,
  realDataElectricity,
  syntheticDeltaCrps,
}: RealDataContextPanelProps) {
  const realDeltaCrpsWind = computeRealDeltaCrps(realData);
  const realDeltaCrpsElec = computeRealDeltaCrps(realDataElectricity ?? null);

  const hasWindDiscrepancy = hasDiscrepancyWarning(realDeltaCrpsWind, syntheticDeltaCrps);
  const hasElecDiscrepancy = hasDiscrepancyWarning(realDeltaCrpsElec, syntheticDeltaCrps);
  const hasAnyDiscrepancy = hasWindDiscrepancy || hasElecDiscrepancy;

  // Collect available datasets for display
  const datasets: { label: string; data: RealDataResult | null; deltaCrps: number | null }[] = [
    { label: 'Elia wind', data: realData, deltaCrps: realDeltaCrpsWind },
    { label: 'Elia electricity', data: realDataElectricity ?? null, deltaCrps: realDeltaCrpsElec },
  ];

  const hasMultipleDatasets = datasets.filter((d) => d.data != null).length > 1;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        Real-Data Context
      </h3>

      {/* Generalisability callout */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-3">
        <p className="text-xs text-blue-800 font-medium">
          ℹ Generalisability caveat
        </p>
        <p className="text-xs text-blue-700 mt-1">
          {hasMultipleDatasets
            ? 'Results are from two real datasets (Elia offshore wind and Elia electricity demand). Additional replication across more domains would further strengthen generalisability claims.'
            : 'Results are from a single real dataset (Elia offshore wind) and may not transfer to other domains. Additional replication is needed before drawing general conclusions.'}
        </p>
      </div>

      {/* Dataset characteristics */}
      {datasets.map(({ label, data: ds }) =>
        ds?.config ? (
          <div key={label} className="mb-3">
            <h4 className="text-xs font-medium text-slate-600 mb-1.5">
              {label} — Dataset Characteristics
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                Series: {ds.config.series_name}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                N = {ds.config.n_forecasters}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                T = {ds.config.T}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                Warmup: {ds.config.warmup}
              </span>
              {ds.config.forecasters?.length > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  Forecasters: {ds.config.forecasters.join(', ')}
                </span>
              )}
            </div>
          </div>
        ) : null,
      )}

      {/* Side-by-side comparison table */}
      {(syntheticDeltaCrps != null || datasets.some((d) => d.deltaCrps != null)) && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-slate-600 mb-1.5">
            Synthetic vs Real-Data ΔCRPS
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-1 text-slate-500 font-medium">
                    Source
                  </th>
                  <th className="text-right py-1 text-slate-500 font-medium">
                    ΔCRPS (blended vs equal)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-1 text-slate-700">Synthetic (latent_fixed)</td>
                  <td className="text-right py-1 font-mono">
                    {syntheticDeltaCrps != null ? (
                      <span
                        className={
                          syntheticDeltaCrps < 0
                            ? 'text-green-700'
                            : 'text-red-700'
                        }
                      >
                        {syntheticDeltaCrps.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
                {datasets.map(({ label, data: ds, deltaCrps }) =>
                  ds ? (
                    <tr key={label} className="border-b border-slate-100 last:border-0">
                      <td className="py-1 text-slate-700">Real data ({label})</td>
                      <td className="text-right py-1 font-mono">
                        {deltaCrps != null ? (
                          <span
                            className={
                              deltaCrps < 0
                                ? 'text-green-700'
                                : 'text-red-700'
                            }
                          >
                            {deltaCrps.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ) : null,
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discrepancy flag */}
      {hasAnyDiscrepancy && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          <p className="text-xs text-amber-800 font-medium">
            ⚠ Discrepancy detected
          </p>
          <p className="text-xs text-amber-700 mt-1">
            {hasWindDiscrepancy && hasElecDiscrepancy
              ? 'Both real-data ΔCRPS values differ from synthetic by more than 2×.'
              : hasWindDiscrepancy
                ? 'Elia wind real-data ΔCRPS differs from synthetic by more than 2×.'
                : 'Elia electricity real-data ΔCRPS differs from synthetic by more than 2×.'}
            {' '}Possible causes: different panel size (N), different forecaster quality
            distribution, or domain-specific effects.
          </p>
        </div>
      )}

      {/* Future replication targets */}
      <div>
        <h4 className="text-xs font-medium text-slate-600 mb-1.5">
          Future Replication Targets
        </h4>
        <ul className="text-xs text-slate-500 space-y-0.5">
          {FUTURE_TARGETS.map((target) => (
            <li key={target} className="flex items-center gap-1.5">
              <span className="text-slate-300">○</span>
              {target}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
