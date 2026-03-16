/**
 * Code snippets tab (v2): grouped sidebar, experiment view, useCompare, RoundTrace type.
 */
export default function CodeSnippetsTab() {
  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mb-2">
          1 · Replace flat CLI experiment list with grouped sidebar
        </h3>
        <div className="rounded-lg bg-[#1c1c1e] p-3 overflow-x-auto">
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre">
            {`// dashboard/src/components/ExperimentSidebar.tsx
// Groups the 30+ CLI experiments into 4 categories

const GROUPS = {
  'Mechanism': ['settlement','skill_wager','aggregation',
                 'deposit_policies','weight_rules','scoring'],
  'Behaviour': ['behaviour_matrix','intermittency_stress',
                'strategic_reporting','preference_stress'],
  'Attacks':   ['sybil','arbitrage_scan','collusion_stress',
                'insider_advantage','wash_activity_gaming',
                'identity_attack_matrix'],
  'Diagnostics':['calibration','parameter_sweep','dgp_comparison',
                 'weight_comparison','skill_recovery'],
}

export function ExperimentSidebar({ active, onSelect }) {
  return (
    <nav style={{ width: 220, borderRight: '0.5px solid var(--border)' }}>
      {Object.entries(GROUPS).map(([group, exps]) => (
        <div key={group}>
          <p className="group-label">{group}</p>
          {exps.map(exp => (
            <button key={exp}
              className={active === exp ? 'active' : ''}
              onClick={() => onSelect(exp)}>
              {exp.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}`}
          </pre>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mb-2">
          2 · Forecast quality vs money flow — two-tab split
        </h3>
        <div className="rounded-lg bg-[#1c1c1e] p-3 overflow-x-auto">
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre">
            {`// dashboard/src/pages/ExperimentView.tsx
// Separates CRPS / calibration from stake / payout panels

export function ExperimentView({ data }) {
  const [panel, setPanel] = useState<'quality' | 'money'>('quality')

  return (
    <div>
      <TabBar
        tabs={['Forecast quality', 'Money flow']}
        active={panel === 'quality' ? 0 : 1}
        onChange={i => setPanel(i === 0 ? 'quality' : 'money')}
      />

      {panel === 'quality' && (
        <div>
          <CRPSChart     rounds={data.rounds} />
          <CalibrationPIT rounds={data.rounds} />
          <WeightEvolution rounds={data.rounds} />
        </div>
      )}

      {panel === 'money' && (
        <div>
          <WealthChart   rounds={data.rounds} />
          <StakeHeatmap  rounds={data.rounds} />
          <UtilityFlowBar rounds={data.rounds} />
        </div>
      )}
    </div>
  )
}`}
          </pre>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mb-2">
          3 · Compare mode — delta view when swapping one block
        </h3>
        <div className="rounded-lg bg-[#1c1c1e] p-3 overflow-x-auto">
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre">
            {`// dashboard/src/hooks/useCompare.ts
// Returns delta metrics between two mechanism configs

export function useCompare(baseRuns, altRuns) {
  return useMemo(() => {
    const last = (arr) => arr[arr.length - 1]

    return {
      dCRPS:      meanCRPS(altRuns) - meanCRPS(baseRuns),
      dNeff:      meanNeff(altRuns) - meanNeff(baseRuns),
      dHHI:       meanHHI(altRuns)  - meanHHI(baseRuns),
      dUtility:   meanUtility(altRuns) - meanUtility(baseRuns),
      dWealthGini: gini(last(altRuns).wealth) - gini(last(baseRuns).wealth),
    }
  }, [baseRuns, altRuns])
}

// Usage in DeltaBadge component:
function DeltaBadge({ label, delta, lowerIsBetter = false }) {
  const good = lowerIsBetter ? delta < 0 : delta > 0
  return (
    <span style={{ color: good ? '#085041' : '#993C1D' }}>
      {label}: {delta > 0 ? '+' : ''}{delta.toFixed(3)}
    </span>
  )
}`}
          </pre>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mb-2">
          4 · Structured trace type for TypeScript dashboard
        </h3>
        <div className="rounded-lg bg-[#1c1c1e] p-3 overflow-x-auto">
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre">
            {`// dashboard/src/types.ts
export interface RoundTrace {
  t:          number
  y_t:        number
  active:     boolean[]
  reports:    (number | null)[]    // median per forecaster
  q10s:       (number | null)[]
  q90s:       (number | null)[]
  sigma:      number[]             // skill σ_i
  deposits:   number[]             // b_i
  wagers:     number[]             // m_i
  weights:    number[]             // w̃_i
  aggregate:  { q10: number; q50: number; q90: number }
  scores:     number[]             // CRPS per forecaster
  refunds:    number[]
  payouts:    number[]
  profits:    number[]
  wealth:     number[]
  hhi:        number
  n_eff:      number
  total_deposit: number
  total_wager:   number
  total_payout:  number
  U:          number
}

export interface SimResult {
  rounds:  RoundTrace[]
  config:  MechanismConfig
  N:       number
  T:       number
  seed:    number
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}
