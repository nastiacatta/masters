import MathBlock from './MathBlock';

const COMPONENTS = [
  {
    id: 'scoring',
    name: 'Scoring',
    formula: 's_{i,t} = 1 - |y_t - r_{i,t}|',
    desc: 'Strictly proper and bounded in [0,1]. CRPS generalises this to the full forecast distribution.',
  },
  {
    id: 'effective_wager',
    name: 'Effective wager',
    formula: 'm_{i,t} = b_{i,t} \\bigl( \\lambda + (1-\\lambda) \\sigma_{i,t}^\\eta \\bigr)',
    desc: 'Deposit b\u1D62 passed through the skill gate g(\u03C3). Lower skill reduces the effective wager and therefore the weight.',
  },
  {
    id: 'aggregation',
    name: 'Aggregation',
    formula: '\\hat{r}_t = \\sum_i \\hat{m}_{i,t} r_{i,t}',
    desc: 'Linear pool of reports, weighted by effective wager, with per-agent weight capped at \u03C9_max.',
  },
  {
    id: 'settlement',
    name: 'Settlement',
    formula: '\\Pi_{i,t} = m_{i,t} (1 + s_{i,t} - \\bar{s}_t)',
    desc: 'Lambert skill pool: zero-sum redistribution in proportion to each agent\u2019s score relative to the weighted mean.',
  },
  {
    id: 'skill_update',
    name: 'Skill update',
    formula: 'L_{i,t} = (1-\\rho)\\, L_{i,t-1} + \\rho\\, \\ell_{i,t};\\quad \\sigma_i = \\sigma_{\\min} + (1-\\sigma_{\\min})\\, e^{-\\gamma L_i}',
    desc: 'EWMA of per-round loss \u2113. Lower running loss maps to a higher skill estimate \u03C3 through the exponential gate.',
  },
] as const;

export default function CoreSubComponents() {
  return (
    <ul className="space-y-0">
      {COMPONENTS.map((c, i) => {
        const isLast = i === COMPONENTS.length - 1;
        return (
          <li
            key={c.id}
            style={{
              padding: '14px 0',
              borderBottom: isLast ? 'none' : '1px solid var(--border)',
            }}
          >
            <p
              className="font-serif tracking-tight"
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}
            >
              {c.name}
            </p>
            <p className="mt-2">
              <MathBlock inline latex={c.formula} />
            </p>
            <p
              className="mt-2"
              style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-soft)' }}
            >
              {c.desc}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
