import MathBlock from './MathBlock';

const COMPONENTS = [
  {
    id: 'scoring',
    name: 'Scoring',
    formula: 's_{i,t} = 1 - |y_t - r_{i,t}|',
    desc: 'Strictly proper, bounded in [0,1]. MAE elicits median; CRPS for full distribution.',
  },
  {
    id: 'effective_wager',
    name: 'Effective wager',
    formula: 'm_{i,t} = b_{i,t} \\bigl( \\lambda + (1-\\lambda) \\sigma_{i,t}^\\eta \\bigr)',
    desc: 'Deposits filtered by skill gate. Low σ reduces effective wager.',
  },
  {
    id: 'aggregation',
    name: 'Aggregation',
    formula: '\\hat{r}_t = \\sum_i \\hat{m}_{i,t} r_{i,t}',
    desc: 'Weighted by effective wager; weights capped by ω_max.',
  },
  {
    id: 'settlement',
    name: 'Settlement',
    formula: '\\Pi_{i,t} = m_{i,t} (1 + s_{i,t} - \\bar{s}_t)',
    desc: 'Lambert skill pool: zero-sum redistribution by relative score.',
  },
  {
    id: 'skill_update',
    name: 'Skill update',
    formula: 'L_{i,t} \\leftarrow \\rho L_{i,t-1} + (1-\\rho) \\ell_{i,t};\\; \\sigma_i = \\sigma_{\\min} + (1-\\sigma_{\\min}) e^{-\\gamma L_i}',
    desc: 'EWMA loss; lower loss → higher skill weight.',
  },
] as const;

export default function CoreSubComponents() {
  return (
    <ul className="space-y-3">
      {COMPONENTS.map((c) => (
        <li key={c.id} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
          <p className="font-medium text-slate-700">{c.name}</p>
          <p className="mt-1">
            <MathBlock inline latex={c.formula} />
          </p>
          <p className="mt-1 text-slate-500">{c.desc}</p>
        </li>
      ))}
    </ul>
  );
}
