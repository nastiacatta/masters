import type { BuilderSelections, DepositPolicy, InfluenceRule, AggregationRule, SettlementRule } from '@/lib/coreMechanism/runRoundComposable';
import type { BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';
import type { DGPId } from '@/lib/coreMechanism/dgpSimulator';
import type { SimParams } from '@/lib/mechanismExplorer/types';

interface ScenarioBuilderProps {
  dgp: DGPId;
  setDGP: (d: DGPId) => void;
  builder: BuilderSelections;
  setBuilder: (b: BuilderSelections) => void;
  behaviourPreset: BehaviourPresetId;
  setBehaviourPreset: (p: BehaviourPresetId) => void;
  params: SimParams;
  setParams: (p: SimParams) => void;
  seed: number;
  setSeed: (s: number) => void;
}

const DGP_OPTIONS: { id: DGPId; label: string }[] = [
  { id: 'baseline', label: 'Baseline' },
  { id: 'latent_fixed', label: 'Latent fixed' },
  { id: 'aggregation_method1', label: 'Method 1' },
  { id: 'aggregation_method3', label: 'Method 3' },
];

const DEPOSIT_OPTIONS: { id: DepositPolicy; label: string }[] = [
  { id: 'fixed_unit', label: 'Fixed unit' },
  { id: 'wealth_fraction', label: 'Bankroll × conf' },
  { id: 'sigma_scaled', label: 'σ-scaled' },
];

const INFLUENCE_OPTIONS: { id: InfluenceRule; label: string }[] = [
  { id: 'uniform', label: 'Equal' },
  { id: 'deposit_only', label: 'Stake only' },
  { id: 'skill_only', label: 'Skill only' },
  { id: 'skill_stake', label: 'Skill × stake' },
];

const AGGREGATION_OPTIONS: { id: AggregationRule; label: string }[] = [
  { id: 'linear', label: 'Linear pool' },
  { id: 'sqrt', label: 'Square root' },
  { id: 'softmax', label: 'Softmax' },
];

const SETTLEMENT_OPTIONS: { id: SettlementRule; label: string }[] = [
  { id: 'skill_only', label: 'Skill only' },
  { id: 'skill_plus_utility', label: 'Skill + utility' },
];

const BEHAVIOUR_OPTIONS: { id: BehaviourPresetId; label: string; desc: string }[] = [
  { id: 'baseline', label: 'Benign', desc: 'Honest forecasters' },
  { id: 'bursty', label: 'Bursty', desc: 'Intermittent participation' },
  { id: 'risk_averse', label: 'Risk-averse', desc: 'Conservative reports' },
  { id: 'manipulator', label: 'Manipulator', desc: 'Strategic bias' },
  { id: 'sybil', label: 'Sybil', desc: 'Identity splitting' },
  { id: 'evader', label: 'Evader', desc: 'Stealth manipulation' },
  { id: 'arbitrageur', label: 'Arbitrageur', desc: 'Exploit spreads' },
];

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

function SliderRow({ label, value, min, max, step, onChange, format }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-500">{label}</span>
        <span className="font-mono font-medium text-slate-800">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
      />
    </div>
  );
}

interface SelectRowProps {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}

function SelectRow({ label, value, options, onChange }: SelectRowProps) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-slate-500 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs bg-slate-800 text-white border-0 rounded-md py-1.5 px-2 font-medium focus:ring-1 focus:ring-teal-500 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function ScenarioBuilder({
  dgp, setDGP,
  builder, setBuilder,
  behaviourPreset, setBehaviourPreset,
  params, setParams,
  seed, setSeed,
}: ScenarioBuilderProps) {
  const setParam = (key: keyof SimParams, value: number) => {
    setParams({ ...params, [key]: value });
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-white rounded-xl p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-thin">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Scenario</h2>
        <div className="space-y-3">
          <SelectRow label="Data generating process" value={dgp} options={DGP_OPTIONS} onChange={(v) => setDGP(v as DGPId)} />
        </div>
      </div>

      <div className="border-t border-slate-700/50 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Mechanism</h2>
        <div className="space-y-3">
          <SelectRow label="Deposit policy" value={builder.depositPolicy} options={DEPOSIT_OPTIONS}
            onChange={(v) => setBuilder({ ...builder, depositPolicy: v as DepositPolicy })} />
          <SelectRow label="Influence rule" value={builder.influenceRule} options={INFLUENCE_OPTIONS}
            onChange={(v) => setBuilder({ ...builder, influenceRule: v as InfluenceRule })} />
          <SelectRow label="Aggregation" value={builder.aggregationRule} options={AGGREGATION_OPTIONS}
            onChange={(v) => setBuilder({ ...builder, aggregationRule: v as AggregationRule })} />
          <SelectRow label="Settlement" value={builder.settlementRule} options={SETTLEMENT_OPTIONS}
            onChange={(v) => setBuilder({ ...builder, settlementRule: v as SettlementRule })} />
        </div>
      </div>

      <div className="border-t border-slate-700/50 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Behaviour</h2>
        <div className="grid grid-cols-2 gap-1.5">
          {BEHAVIOUR_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setBehaviourPreset(o.id)}
              className={`text-left px-2.5 py-2 rounded-lg text-[11px] transition-all ${
                behaviourPreset === o.id
                  ? 'bg-teal-600 text-white ring-1 ring-teal-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={o.desc}
            >
              <div className="font-medium">{o.label}</div>
              <div className="text-[9px] opacity-60 mt-0.5 leading-tight">{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-700/50 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Parameters</h2>
        <div className="space-y-3">
          <SliderRow label="Rounds (T)" value={params.T} min={10} max={200} step={5} onChange={(v) => setParam('T', v)} />
          <SliderRow label="Forecasters (N)" value={params.N} min={3} max={12} step={1} onChange={(v) => setParam('N', v)} />
          <SliderRow label="Seed" value={seed} min={1} max={999} step={1} onChange={setSeed} />
          <div className="border-t border-slate-700/50 pt-3 mt-3">
            <div className="text-[10px] text-slate-500 font-medium mb-2">Mechanism tuning</div>
            <div className="space-y-2.5">
              <SliderRow label="γ (skill decay)" value={params.gamma} min={0.1} max={5} step={0.1} onChange={(v) => setParam('gamma', v)} />
              <SliderRow label="λ (stake weight)" value={params.lambda} min={0} max={1} step={0.05} onChange={(v) => setParam('lambda', v)} />
              <SliderRow label="η (skill exp.)" value={params.eta} min={0.5} max={3} step={0.1} onChange={(v) => setParam('eta', v)} />
              <SliderRow label="f (deposit frac.)" value={params.f} min={0.05} max={0.9} step={0.05} onChange={(v) => setParam('f', v)} />
              <SliderRow label="U (utility pool)" value={params.U} min={0} max={200} step={5} onChange={(v) => setParam('U', v)} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
