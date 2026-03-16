import type { MechanismConfig, SimParams } from '@/lib/mechanismExplorer/types';
import {
  BLOCK_DEFS,
  PARAM_DEFS,
  type BlockDef,
} from '@/lib/mechanismExplorer/blockDefs';

interface MechanismBuilderTabProps {
  config: MechanismConfig;
  setConfig: (c: MechanismConfig) => void;
  params: SimParams;
  setParams: (p: SimParams) => void;
  onRun: () => void;
  runMessage: string | null;
}

function BlockCard({
  def,
  value,
  onChange,
}: {
  def: BlockDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const variant = def.variants[value];
  const isDefault = value === def.default;
  return (
    <div
      className={`
        bg-white border rounded-xl p-3 min-w-[140px] flex-1 cursor-default
        transition-colors
        ${isDefault ? 'border-slate-200' : 'border-teal-300 ring-1 ring-teal-100'}
      `}
    >
      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
        {def.num} · {def.label}
      </div>
      <div className="mt-1.5 font-mono text-xs text-blue-700 bg-blue-50 px-2 py-1.5 rounded-md break-words leading-snug">
        {variant?.formula ?? value}
      </div>
      <p className="text-[11px] text-slate-500 mt-2 leading-snug line-clamp-2">
        {variant?.desc ?? ''}
      </p>
      <select
        className="mt-2 w-full text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {Object.keys(def.variants).map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function MechanismBuilderTab({
  config,
  setConfig,
  params,
  setParams,
  onRun,
  runMessage,
}: MechanismBuilderTabProps) {
  const setBlock = (id: keyof MechanismConfig, value: string) => {
    setConfig({ ...config, [id]: value as MechanismConfig[keyof MechanismConfig] });
  };

  const setParam = (id: keyof SimParams, value: number) => {
    setParams({ ...params, [id]: value });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        Swap one block at a time to see downstream effects. Each block shows the
        active formula and a one-line description.
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {BLOCK_DEFS.map((def) => (
          <BlockCard
            key={def.id}
            def={def}
            value={config[def.id]}
            onChange={(v) => setBlock(def.id, v)}
          />
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Parameters
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {PARAM_DEFS.map((p) => (
            <div key={p.id} className="space-y-1">
              <label className="block text-[11px] text-slate-500">
                {p.label}:{' '}
                <span className="font-medium text-teal-800">{params[p.id]}</span>
              </label>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={params[p.id]}
                onChange={(e) => setParam(p.id, +e.target.value)}
                className="w-full accent-teal-600"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onRun}
          className="px-8 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          Run simulation (T = {params.T} rounds)
        </button>
        {runMessage && (
          <p
            className={`text-sm ${
              runMessage.startsWith('✓')
                ? 'text-teal-600'
                : 'text-slate-500'
            }`}
          >
            {runMessage}
          </p>
        )}
      </div>
    </div>
  );
}
