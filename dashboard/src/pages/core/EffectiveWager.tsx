import PageHeader from '@/components/dashboard/PageHeader';
import MathBlock from '@/components/dashboard/MathBlock';
import SectionLabel from '@/components/dashboard/SectionLabel';

export default function EffectiveWager() {
  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Effective wager"
        description="The core design choice: deposit b is gated by skill σ to yield effective wager m. The difference is refunded so the user never loses more than m."
      />

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <SectionLabel type="mechanism_computation" />
            Effective wager
          </h3>
          <MathBlock accent label="Skill-gated wager">
            m_{'_{i,t}'} = b_{'_{i,t}'} · (λ + (1 − λ) σ_{'_{i,t}'})
          </MathBlock>
          <p className="text-xs text-slate-500 mt-2">
            With η = 1 (linear gate). For η &gt; 1 the code uses g(σ) = λ + (1−λ) σ^η so low-skill agents’ wagers shrink more sharply. m/b ∈ [λ, 1].
          </p>
        </div>

        <div>
          <MathBlock label="Refund (user gets back the unconverted part)">
            refund_{'_{i,t}'} = b_{'_{i,t}'} − m_{'_{i,t}'}
          </MathBlock>
        </div>

        <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-slate-700">
            <strong>Why it matters:</strong> The mechanism never takes more than m_i from the pool for agent i. The refund is returned regardless of outcome, so exposure is exactly m_i. Skill σ_i is fixed before reports in round t, so there is no double-counting of current-round performance.
          </p>
        </div>
      </div>
    </div>
  );
}
