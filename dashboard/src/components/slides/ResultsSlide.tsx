import { useEffect, useState } from 'react';
import SlideWrapper from './SlideWrapper';

/* ── Interfaces ─────────────────────────────────────────────── */

interface ResultsSlideProps {
  title: string;
  dataPath: string;
}

interface ComparisonRow {
  method: string;
  mean_crps: number;
  delta_crps_vs_equal: number;
}

interface ComparisonData {
  config: {
    T: number;
    n_forecasters: number;
    warmup: number;
    series_name: string;
    forecasters: string[];
  };
  rows: ComparisonRow[];
  per_round: unknown[];
}

/* ── Helpers ────────────────────────────────────────────────── */

const METHOD_LABELS: Record<string, string> = {
  uniform: 'Equal (Uniform)',
  skill: 'Skill Only',
  mechanism: 'Mechanism (Skill + Stake)',
  best_single: 'Best Single Forecaster',
};

function methodLabel(method: string): string {
  return METHOD_LABELS[method] ?? method;
}

function formatCrps(value: number): string {
  return value.toFixed(6);
}

function formatDelta(value: number): string {
  if (value === 0) return '0.000000';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(6)}`;
}

function isValidComparisonData(json: unknown): json is ComparisonData {
  if (typeof json !== 'object' || json === null) return false;
  const obj = json as Record<string, unknown>;
  return Array.isArray(obj.rows) && obj.rows.every(
    (r: unknown) =>
      typeof r === 'object' &&
      r !== null &&
      typeof (r as ComparisonRow).method === 'string' &&
      typeof (r as ComparisonRow).mean_crps === 'number' &&
      typeof (r as ComparisonRow).delta_crps_vs_equal === 'number',
  );
}

/* ── Component ──────────────────────────────────────────────── */

export default function ResultsSlide({ title, dataPath }: ResultsSlideProps) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(dataPath, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
        return res.json();
      })
      .then((json: unknown) => {
        if (!isValidComparisonData(json)) {
          throw new Error('Unexpected data format');
        }
        setData(json);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load results');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [dataPath]);

  return (
    <SlideWrapper>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading results…
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {data && (
        <div className="mt-6 overflow-x-auto">
          <h3 className="mb-3 text-sm font-medium text-slate-700">Performance Summary</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4 text-right">Mean CRPS</th>
                <th className="py-2 text-right">Δ vs Equal</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.method} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-800">
                    {methodLabel(row.method)}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-slate-700">
                    {formatCrps(row.mean_crps)}
                  </td>
                  <td className="py-2 text-right font-mono text-slate-700">
                    {formatDelta(row.delta_crps_vs_equal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SlideWrapper>
  );
}
