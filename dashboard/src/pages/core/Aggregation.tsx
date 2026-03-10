import PageHeader from '@/components/dashboard/PageHeader';
import MathBlock from '@/components/dashboard/MathBlock';
import SectionLabel from '@/components/dashboard/SectionLabel';

export default function Aggregation() {
  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Aggregation"
        description="The aggregate forecast is a single weighted combination of reports. Weights are normalised effective wagers. Only one aggregation view on the main dashboard; alternatives behind a toggle."
      />

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <SectionLabel type="mechanism_computation" />
            Weight shares
          </h3>
          <MathBlock accent label="Normalised effective wagers">
            m̂_{'_{i,t}'} = m_{'_{i,t}'} / Σ_j m_{'_{j,t}'}
          </MathBlock>
        </div>

        <div>
          <MathBlock label="Point forecast aggregation">
            r̂_t = Σ_i m̂_{'_{i,t}'} · r_{'_{i,t}'}
          </MathBlock>
          <p className="text-xs text-slate-500 mt-2">
            For quantile mode: same weights applied per quantile, q̂(tau) = Σ_i m̂_i · q_i(tau). Missing agents (α_i = 1) have m_i = 0 and do not contribute.
          </p>
        </div>
      </div>
    </div>
  );
}
