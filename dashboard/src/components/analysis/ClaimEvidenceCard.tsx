/**
 * Claim-evidence traceability card.
 *
 * Displays a thesis claim alongside its supporting evidence:
 * metric value with CI, effect size label, conditions, caveat,
 * and live validation status from the ClaimValidator.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */

import type { EnrichedThesisClaim, ClaimValidationResult, EffectSizeResult } from '../../lib/analysis/types';

interface ClaimEvidenceCardProps {
  claim: EnrichedThesisClaim;
  validation: ClaimValidationResult | null;
  effectSize: EffectSizeResult | null;
}

const STATUS_CONFIG = {
  valid: {
    borderColor: 'border-green-500',
    icon: '✓',
    iconBg: 'bg-green-100 text-green-700',
    label: 'Supported by data',
    labelColor: 'text-green-700',
  },
  stale: {
    borderColor: 'border-amber-500',
    icon: '⚠',
    iconBg: 'bg-amber-100 text-amber-700',
    label: 'Data has changed — verify',
    labelColor: 'text-amber-700',
  },
  contradicted: {
    borderColor: 'border-red-500',
    icon: '✕',
    iconBg: 'bg-red-100 text-red-700',
    label: 'Contradicted by data',
    labelColor: 'text-red-700',
  },
  unverifiable: {
    borderColor: 'border-slate-400',
    icon: '?',
    iconBg: 'bg-slate-100 text-slate-500',
    label: 'Data not available',
    labelColor: 'text-slate-500',
  },
} as const;

const EFFECT_SIZE_COLORS: Record<string, string> = {
  negligible: 'bg-slate-100 text-slate-600',
  small: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  large: 'bg-green-100 text-green-700',
};

export default function ClaimEvidenceCard({
  claim,
  validation,
  effectSize,
}: ClaimEvidenceCardProps) {
  const status = validation?.status ?? 'unverifiable';
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`rounded-lg border border-slate-200 border-l-4 ${config.borderColor} bg-white p-4`}
    >
      {/* Header: title + status */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800">{claim.title}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${config.iconBg}`}
          >
            {config.icon}
          </span>
          <span className={`text-xs font-medium ${config.labelColor}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Metric + effect size */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded">
          {claim.metric}
        </span>
        {effectSize && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${EFFECT_SIZE_COLORS[effectSize.label] ?? 'bg-slate-100 text-slate-600'}`}
          >
            d = {effectSize.cohensD.toFixed(2)} ({effectSize.label})
          </span>
        )}
      </div>

      {/* Discrepancy detail for stale/contradicted */}
      {validation && status === 'stale' && validation.discrepancyPct != null && (
        <p className="mt-1.5 text-xs text-amber-600">
          Discrepancy: {validation.discrepancyPct.toFixed(1)}% (computed{' '}
          {validation.computedValue?.toFixed(4)} vs stated {validation.statedValue})
        </p>
      )}
      {validation && status === 'contradicted' && (
        <p className="mt-1.5 text-xs text-red-600">
          Computed: {validation.computedValue?.toFixed(4)} — expected{' '}
          {claim.evidence.expected_sign} sign
        </p>
      )}

      {/* Conditions */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {claim.conditions.dgp && (
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
            DGP: {claim.conditions.dgp}
          </span>
        )}
        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
          N = {claim.conditions.n_forecasters}
        </span>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
          T = {claim.conditions.T}
        </span>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
          {claim.conditions.deposit_policy}
        </span>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
          {claim.conditions.n_seeds} seeds
        </span>
      </div>

      {/* Caveat */}
      {claim.caveat && (
        <p className="mt-2 text-xs text-slate-500 italic">{claim.caveat}</p>
      )}

      {/* View evidence link */}
      <div className="mt-3">
        <a
          href={`#experiment-${claim.experimentName}`}
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          View evidence →
        </a>
      </div>
    </div>
  );
}
