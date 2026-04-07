import { useState } from 'react';
import clsx from 'clsx';
import type { BehaviourSubtabId } from '@/lib/thesis';
import { BEHAVIOUR_SUBTABS, BEHAVIOUR_SUBTAB_LABELS } from '@/lib/thesis';
import { PRESET_META } from '@/lib/behaviour/scenarioSimulator';
import type { BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';

interface BehaviourStepProps {
  behaviourPresetId?: BehaviourPresetId | null;
}

const PRESET_EXPLAINERS: Record<BehaviourPresetId, { what: string; changes: string; matters: string }> = {
  baseline: {
    what: 'Agents participate at a steady rate, report truthfully based on their private signal, and post balanced deposits. This is the reference scenario with no adversarial or irregular behaviour.',
    changes: 'Full participation each round, signal-based reports, stable deposit levels.',
    matters: 'It establishes the baseline forecast quality and wealth dynamics that stress-test scenarios are compared against.',
  },
  bursty: {
    what: 'Agents do not participate at a constant round-by-round rate. Instead, they arrive in clusters: several active rounds close together, followed by gaps. Participation probability rises and falls over time, so attendance is session-like rather than IID.',
    changes: 'Fewer and more uneven submissions, more missing rounds, and potentially staler skill estimates.',
    matters: 'It tests whether the mechanism still aggregates well when activity is concentrated in bursts rather than spread evenly over time.',
  },
  risk_averse: {
    what: 'Agents hedge their reports toward the centre of the distribution and post smaller deposits. They sacrifice information content for lower variance in payoffs.',
    changes: 'Reports closer to the prior mean, smaller effective wagers, reduced dispersion in aggregate forecasts.',
    matters: 'It tests whether skill estimation degrades when agents under-report their true beliefs, and whether the mechanism still differentiates skill.',
  },
  manipulator: {
    what: 'One or more agents deliberately push their reports away from the consensus or true signal, typically posting larger deposits to amplify influence.',
    changes: 'Biased reports from the manipulator, distorted aggregate when the manipulator holds significant weight.',
    matters: 'It tests the mechanism\'s robustness to strategic misreporting and whether skill estimation can detect and downweight the attacker over time.',
  },
  sybil: {
    what: 'A skilled forecaster splits into multiple identities that each submit correlated reports. Total deposit is fragmented across accounts.',
    changes: 'More apparent participants than true forecasters, fragmented skill estimates, potential over-representation in aggregation.',
    matters: 'It tests whether the mechanism is sybil-resistant: can identity splitting gain disproportionate influence or payoff?',
  },
  evader: {
    what: 'An adaptive attacker that softens manipulation when detection seems likely. The agent monitors its own skill estimate or recent payoffs and reverts to honest reporting when manipulation becomes obvious.',
    changes: 'State-dependent bias that varies across rounds, making the attacker harder to identify from the time series alone.',
    matters: 'It stress-tests whether online skill tracking can catch intermittent, adaptive manipulation rather than just persistent bias.',
  },
  arbitrageur: {
    what: 'An agent that only participates when the spread between their signal and the current consensus is large enough to justify the deposit. In calm rounds, they sit out.',
    changes: 'Conditional, selective participation; higher information content per submission but many missing rounds.',
    matters: 'It tests whether the mechanism rewards information-rich selective participation, and whether skill estimates remain accurate with highly intermittent but high-quality submissions.',
  },
  collusion: {
    what: 'Two agents coordinate: they appear and disappear together, submit correlated reports (average of their beliefs), and concentrate stake when their skill estimates are high.',
    changes: 'Coordinated participation patterns, synchronised reports, concentrated staking in favourable rounds.',
    matters: 'It tests whether coordinated behaviour can amplify influence beyond what individual honest play would achieve.',
  },
  reputation_reset: {
    what: 'An agent plays honestly for the first 100 rounds to build a high skill estimate, then switches to manipulation. This tests whether accumulated reputation can be exploited.',
    changes: 'Phase 1: honest reports build high σ. Phase 2: biased reports exploit the built-up influence before σ decays.',
    matters: 'It tests the speed of the skill gate recovery — how quickly does σ drop once the agent starts misreporting?',
  },
};

function PresetExplainerCard({ presetId }: { presetId: BehaviourPresetId }) {
  const [open, setOpen] = useState(false);
  const meta = PRESET_META[presetId];
  const explainer = PRESET_EXPLAINERS[presetId];

  return (
    <div className="rounded-lg border border-slate-200 bg-teal-50/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 hover:bg-teal-50 transition-colors"
      >
        <div>
          <p className="text-xs text-slate-500">Selected behavioural model</p>
          <p className="text-sm font-medium text-slate-800">{meta.label}</p>
          <p className="text-xs text-slate-600 mt-0.5">{meta.description}</p>
        </div>
        <span className={clsx('text-slate-400 text-sm mt-0.5 transition-transform shrink-0', open && 'rotate-180')}>
          ▾
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-200/60 pt-2">
          <div>
            <p className="text-[11px] font-semibold text-slate-700">What it means</p>
            <p className="text-xs text-slate-600 leading-relaxed">{explainer.what}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-700">What changes in the round</p>
            <p className="text-xs text-slate-600 leading-relaxed">{explainer.changes}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-700">Why it matters</p>
            <p className="text-xs text-slate-600 leading-relaxed">{explainer.matters}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BehaviourStep({ behaviourPresetId }: BehaviourStepProps) {
  const [subtab, setSubtab] = useState<BehaviourSubtabId>('participation');

  return (
    <div className="space-y-4">
      {behaviourPresetId && PRESET_META[behaviourPresetId] && (
        <PresetExplainerCard presetId={behaviourPresetId} />
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
