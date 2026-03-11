import { useState } from 'react';
import clsx from 'clsx';
import type { BehaviourSubtabId } from '@/lib/thesis';
import { BEHAVIOUR_SUBTABS, BEHAVIOUR_SUBTAB_LABELS } from '@/lib/thesis';
import { PRESET_META } from '@/lib/behaviour/scenarioSimulator';
import type { BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';

interface BehaviourStepProps {
  behaviourPresetId?: BehaviourPresetId | null;
}

export default function BehaviourStep({ behaviourPresetId }: BehaviourStepProps) {
  const [subtab, setSubtab] = useState<BehaviourSubtabId>('participation');
  const presetMeta = behaviourPresetId ? PRESET_META[behaviourPresetId] : null;

  return (
    <div className="space-y-4">
      {presetMeta && (
        <div className="rounded-lg border border-slate-200 bg-teal-50/50 p-3">
          <p className="text-xs text-slate-500">Selected behavioural model</p>
          <p className="text-sm font-medium text-slate-800">{presetMeta.label}</p>
          <p className="text-xs text-slate-600 mt-0.5">{presetMeta.description}</p>
        </div>
      )}
      <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        {BEHAVIOUR_SUBTABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubtab(id)}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              subtab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            )}
          >
            {BEHAVIOUR_SUBTAB_LABELS[id]}
          </button>
        ))}
      </div>

      {subtab === 'participation' && (
        <div className="text-sm text-slate-700 space-y-2">
          <p>Who participates and when: baseline (all), bursty, intermittent, edge-threshold, avoid-skill-decay.</p>
          <p className="text-xs text-slate-500">Effect on round: which agents submit reports and deposits in round <em>t</em>.</p>
        </div>
      )}
      {subtab === 'belief' && (
        <div className="text-sm text-slate-700 space-y-2">
          <p>How agents form beliefs: truthful (signal-based), hedged, strategic, noisy.</p>
          <p className="text-xs text-slate-500">Effect: the latent belief that may differ from the reported r_i.</p>
        </div>
      )}
      {subtab === 'reporting' && (
        <div className="text-sm text-slate-700 space-y-2">
          <p>How reports are formed: truthful, hedged (risk-averse), strategic, noisy.</p>
          <p className="text-xs text-slate-500">Effect: values of <em>r_i</em> and possible bias or manipulation.</p>
        </div>
      )}
      {subtab === 'staking' && (
        <div className="text-sm text-slate-700 space-y-2">
          <p>Deposit / staking policy: fixed, Kelly-like, house-money, lumpy, break-even, volatility-sensitive.</p>
          <p className="text-xs text-slate-500">Effect: <em>b_i</em> per agent and thus effective wager after skill gate.</p>
        </div>
      )}
      {subtab === 'missingness' && (
        <div className="text-sm text-slate-700 space-y-2">
          <p><strong>Behavioural cause:</strong> Intermittent participation, burstiness, selective entry.</p>
          <p><strong>Core response:</strong> Missing-submission handling, robust correction (e.g. freeze σ or decay toward L₀), fallback logic.</p>
          <p className="text-xs text-slate-500">The mechanism treats non-participants consistently so aggregation remains well-defined.</p>
        </div>
      )}
      {subtab === 'identity' && (
        <div className="text-sm text-slate-700 space-y-2">
          <p>Identity / adversarial strategy: single account, sybil split, collusion, reputation reset, insider, wash trading.</p>
          <p className="text-xs text-slate-500">Effect: multiple identities, coordinated reports, or privileged information. Stress tests for robustness.</p>
        </div>
      )}
    </div>
  );
}
