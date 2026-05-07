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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">
      {children}
    </span>
  );
}

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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-emerald-500" />
        Real-Data Context
      </h3>

      {/* Generalisability callout */}
      <div className="rounded-lg border border-blue-200/80 bg-gradient-to-br from-blue-50 to-blue-50/40 p-3 mb-3 flex gap-2">
        <span
          aria-hidden="true"
          className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white shadow-sm mt-0.5"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4M8 11.25h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-blue-900 font-semibold">
            Generalisability caveat
          </p>
          <p className="text-xs text-blue-800/90 mt-1 leading-relaxed">
            {hasMultipleDatasets
              ? 'Results come from two real-world series (Elia Belgian offshore wind and Elia electricity prices). Both use the same seven forecasting models. Further replication across additional domains would strengthen generalisability claims.'
              : 'Results come from a single real-world series (Elia Belgian offshore wind, 17,544 hourly points, seven forecasting models). They may not transfer unchanged to other domains — additional replication is needed before drawing general conclusions.'}
          </p>
        </div>
      </div>

      {/* Dataset characteristics */}
      {datasets.map(({ label, data: ds }) =>
        ds?.config ? (
          <div key={label} className="mb-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              {label} — Dataset Characteristics
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <Badge>Series: {ds.config.series_name}</Badge>
              <Badge>
                <span className="font-mono tabular-nums">N = {ds.config.n_forecasters}</span>
              </Badge>
              <Badge>
                <span className="font-mono tabular-nums">T = {ds.config.T}</span>
              </Badge>
              <Badge>
                Warmup <span className="font-mono tabular-nums ml-1">{ds.config.warmup}</span>
              </Badge>
              {ds.config.forecasters?.length > 0 && (
                <Badge>Forecasters: {ds.config.forecasters.join(', ')}</Badge>
              )}
            </div>
          </div>
        ) : null,
      )}

      {/* Side-by-side comparison table */}
      {(syntheticDeltaCrps != null || datasets.some((d) => d.deltaCrps != null)) && (
        <div className="mb-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Synthetic vs Real-Data ΔCRPS
          </h4>
          <div className="overflow-x-auto rounded-lg border border-slate-100 bg-slate-50/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="text-left py-2 pl-3 pr-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Source
                  </th>
                  <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    ΔCRPS (blended vs equal)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-white transition-colors">
                  <td className="py-2 pl-3 pr-2 text-slate-700 font-medium">Synthetic (latent_fixed)</td>
                  <td className="text-right py-2 px-3 font-mono tabular-nums">
                    {syntheticDeltaCrps != null ? (
                      <span
                        className={
                          syntheticDeltaCrps < 0
                            ? 'text-emerald-700 font-semibold'
                            : 'text-red-700 font-semibold'
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
                    <tr key={label} className="border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                      <td className="py-2 pl-3 pr-2 text-slate-700 font-medium">Real data ({label})</td>
                      <td className="text-right py-2 px-3 font-mono tabular-nums">
                        {deltaCrps != null ? (
                          <span
                            className={
                              deltaCrps < 0
                                ? 'text-emerald-700 font-semibold'
                                : 'text-red-700 font-semibold'
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
        <div className="mb-3 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/40 p-3 flex gap-2">
          <span
            aria-hidden="true"
            className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white shadow-sm mt-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L1.5 13.5H14.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="12" r="0.75" fill="currentColor" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-amber-900 font-semibold">
              Discrepancy detected
            </p>
            <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
              {hasWindDiscrepancy && hasElecDiscrepancy
                ? 'Both real-data ΔCRPS values differ from synthetic by more than 2×.'
                : hasWindDiscrepancy
                  ? 'Elia wind real-data ΔCRPS differs from synthetic by more than 2×.'
                  : 'Elia electricity real-data ΔCRPS differs from synthetic by more than 2×.'}
              {' '}Possible causes: different panel size (N), different forecaster quality
              distribution, or domain-specific effects.
            </p>
          </div>
        </div>
      )}

      {/* Future replication targets */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Future Replication Targets
        </h4>
        <ul className="text-xs text-slate-600 space-y-1">
          {FUTURE_TARGETS.map((target) => (
            <li key={target} className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
              {target}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
