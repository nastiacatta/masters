import PageHeader from '@/components/dashboard/PageHeader';
import MathBlock from '@/components/dashboard/MathBlock';
import SectionLabel from '@/components/dashboard/SectionLabel';

export default function SkillUpdate() {
  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Skill update"
        description="Post-round: loss is updated via EWMA; skill is a deterministic function of loss. Missingness and staleness handled separately (freeze or decay toward L0)."
      />

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <SectionLabel type="mechanism_computation" />
            EWMA loss
          </h3>
          <MathBlock accent label="Loss update (present agents)">
            L_{'_{i,t}'} = (1 − ρ) L_{'_{i,t−1}'} + ρ · ℓ_{'_{i,t}'}
          </MathBlock>
          <p className="text-xs text-slate-500 mt-2">
            ℓ_{'_{i,t}'} is normalised loss (e.g. MAE or CRPS-hat/2). When κ &gt; 0 and agent is absent: L reverts toward L0 (staleness).
          </p>
        </div>

        <div>
          <MathBlock label="Loss to skill (next round’s σ)" accent>
            σ_{'_{i,t+1}'} = σ_min + (1 − σ_min) · e^{'^{-γ L_{i,t}}'}
          </MathBlock>
          <p className="text-xs text-slate-500 mt-2">
            Slow rise, fast drop; floor σ_min. This is the only skill update on the main page. Variants (e.g. different mappings) in appendix or secondary panel.
          </p>
        </div>
      </div>
    </div>
  );
}
