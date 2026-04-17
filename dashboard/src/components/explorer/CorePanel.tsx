/**
 * Core stage: 7 subcomponents with nested tabs
 * 1. Task and session setup
 * 2. Submission layer
 * 3. Effective wager / influence
 * 4. Aggregation
 * 5. Scoring
 * 6. Settlement / payoff allocation
 * 7. Online update
 */
import { useState } from 'react';
import clsx from 'clsx';
import { useExplorer } from '@/lib/explorerStore';
import type { CoreSubtabId } from '@/lib/thesis';
import { CORE_SUBTABS, CORE_SUBTAB_LABELS } from '@/lib/thesis';
import VariantSelector from '@/components/thesis/VariantSelector';
import FormulaCallout from '@/components/thesis/FormulaCallout';
import MathBlock from '@/components/dashboard/MathBlock';
import type { WeightingMode } from '@/lib/coreMechanism/runRound';

const WEIGHTING_OPTIONS: { id: WeightingMode; label: string; desc: string }[] = [
  { id: 'uniform', label: 'Uniform', desc: 'Equal weight per participant' },
  { id: 'deposit', label: 'Deposit only', desc: 'Weight by stake b_i only' },
  { id: 'skill', label: 'Skill only', desc: 'Weight by σ_i only' },
  { id: 'full', label: 'Skill × stake', desc: 'Full m_i = b_i · g(σ_i)' },
];

export default function CorePanel() {
  const [subtab, setSubtab] = useState<CoreSubtabId>('task_setup');
  const { selectedWeightingMode, setSelectedWeightingMode } = useExplorer();

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        The core mechanism is deterministic: it takes state and actions and produces the aggregate forecast, payoffs, and updated skill. No behaviour—only state and actions.
      </p>

      <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        {CORE_SUBTABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubtab(id)}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              subtab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            )}
          >
            {CORE_SUBTAB_LABELS[id]}
          </button>
        ))}
      </div>

      {subtab === 'task_setup' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Client objective: obtain an accurate aggregate forecast. Reward or utility setup: Lambert skill pool (zero-sum redistribution). Forecast target: point forecast in [0,1].
          </p>
          <div className="rounded-lg border border-slate-200 p-3 text-xs">
            <p className="font-medium text-slate-600">Inputs:</p>
            <ul className="mt-1 list-disc pl-4 text-slate-600">task type, scoring rule, reward structure</ul>
            <p className="font-medium text-slate-600 mt-2">Outputs:</p>
            <ul className="mt-1 list-disc pl-4 text-slate-600">forecast target, eligibility rules</ul>
          </div>
        </div>
      )}

      {subtab === 'submission' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            The mechanism observes only: participation (did agent i submit?), report r_i, wager b_i, account id. No access to beliefs or private information.
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-600">
            actions = {'{'} participate, report, wager, accountId {'}'}
          </div>
        </div>
      )}

      {subtab === 'effective_wager' && (
        <div className="space-y-3">
          <VariantSelector
            label="Weighting mode"
            value={selectedWeightingMode}
            options={WEIGHTING_OPTIONS.map((o) => ({ id: o.id, label: o.label, description: o.desc }))}
            onChange={(id) => setSelectedWeightingMode(id as WeightingMode)}
          />
          <p className="text-sm text-slate-700">
            Support modes: uniform (m_i = 1), deposit only (m_i = b_i), skill only (m_i = g(σ_i)), skill × stake (m_i = b_i · g(σ_i)).
          </p>
          <FormulaCallout
            label="Effective wager"
            latex="m_{i,t} = b_{i,t} \\bigl( \\lambda + (1-\\lambda) \\sigma_{i,t}^\\eta \\bigr)"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {WEIGHTING_OPTIONS.map((o) => (
              <div
                key={o.id}
                className={clsx(
                  'rounded border p-2',
                  selectedWeightingMode === o.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'
                )}
              >
                <p className="font-medium">{o.label}</p>
                <p className="text-slate-500 mt-0.5">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {subtab === 'aggregation' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Individual reports are combined into the aggregate forecast using effective wager weights.
          </p>
          <FormulaCallout
            label="Aggregation operator"
            latex="\\hat{r}_t = \\sum_i \\hat{m}_{i,t} r_{i,t},\\quad \\hat{m}_{i,t} = m_{i,t} / \\sum_j m_{j,t}"
          />
          <p className="text-xs text-slate-500">
            Weights are normalised and capped by ω_max for concentration control.
          </p>
        </div>
      )}

      {subtab === 'scoring' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            The scoring rule determines how well each report is rewarded. Strictly proper to elicit truthful beliefs.
          </p>
          <FormulaCallout label="Point score (MAE)" latex="s_{i,t} = 1 - |y_t - r_{i,t}|" />
          <p className="text-xs text-slate-500">
            Realised outcome y_t is observed after reports. Scores feed into settlement and loss for skill update.
          </p>
        </div>
      )}

      {subtab === 'settlement' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Payoff splits into <strong>skill component</strong> (Lambert pool, zero-sum) and optional <strong>utility component</strong>.
          </p>
          <FormulaCallout
            label="Skill payoff"
            latex="\\Pi_{i,t} = m_{i,t} (1 + s_{i,t} - \\bar{s}_t)"
          />
          <MathBlock inline latex="\\pi_{i,t} = \\Pi_{i,t} - m_{i,t}" />
          <div className="rounded-lg border border-slate-200 p-3 text-xs">
            <p className="font-medium text-slate-600">Budget balance:</p>
            <p className="text-slate-600 mt-0.5">∑ π_i = 0 (zero-sum redistribution). Refund returned regardless of outcome.</p>
          </div>
        </div>
      )}

      {subtab === 'online_update' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Current round performance updates next-round skill. Current-round performance is not double-counted: L is updated once per round.
          </p>
          <FormulaCallout
            label="EWMA loss"
            latex="L_{i,t} = (1-\\rho) L_{i,t-1} + \\rho \\cdot \\ell_{i,t}"
          />
          <p className="text-xs text-slate-500 mt-1">
            <strong>Absent agents:</strong> If κ &gt; 0, loss decays toward L₀: L = (1−κ)L + κL₀. If κ = 0, loss freezes (L unchanged).
          </p>
          <FormulaCallout
            label="Loss to skill"
            latex="\\sigma_{i,t+1} = \\sigma_{\\min} + (1 - \\sigma_{\\min}) e^{-\\gamma L_{i,t}}"
          />
          <p className="text-xs text-slate-500">
            State propagated to t+1: L_i, σ_i, wealth W_i. Missing agents: freeze or decay toward L₀.
          </p>
        </div>
      )}
    </div>
  );
}
