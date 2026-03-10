import PageHeader from '@/components/dashboard/PageHeader';
import MathBlock from '@/components/dashboard/MathBlock';
import SectionLabel from '@/components/dashboard/SectionLabel';

export default function Settlement() {
  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Settlement and cashflow"
        description="Lambert self-financed weighted-score wagering: skill pool is zero-sum; profit is payoff minus effective wager. Cashout = refund + payoff."
      />

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <SectionLabel type="mechanism_computation" />
            Skill payoff and profit
          </h3>
          <MathBlock accent label="Gross payoff (skill pool)">
            Π_{'_{i,t}'} = m_{'_{i,t}'} · (1 + s_{'_{i,t}'} − s̄_t)
          </MathBlock>
          <p className="text-xs text-slate-500 mt-1">s̄_t = Σ_j m_j s_j / Σ_j m_j</p>
          <MathBlock label="Profit" className="mt-3">
            π_{'_{i,t}'} = Π_{'_{i,t}'} − m_{'_{i,t}'}
          </MathBlock>
        </div>

        <div>
          <MathBlock label="Cashflow (observed output)" accent>
            cashout_{'_{i,t}'} = refund_{'_{i,t}'} + Π̂_{'_{i,t}'}
          </MathBlock>
          <p className="text-xs text-slate-500 mt-2">
            Flow: deposit → effective wager → settlement → refund + payout. Zero-sum: Σ_i π_i = 0 (skill pool only; utility component if U &gt; 0 is separate).
          </p>
        </div>
      </div>
    </div>
  );
}
