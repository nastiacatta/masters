import { Link } from 'react-router-dom';
import { SEM } from '@/lib/tokens';
import MathBlock from '@/components/dashboard/MathBlock';
import StepSection from '@/components/dashboard/StepSection';

function ClaimCard({
  number,
  title,
  body,
  link,
  color,
}: {
  number: number;
  title: string;
  body: string;
  link: string;
  color: string;
}) {
  return (
    <Link
      to={link}
      className="group block rounded-2xl border-2 p-6 transition-all hover:shadow-lg"
      style={{ borderColor: color + '40', background: color + '08' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: color + '20', color }}
        >
          {number}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{body}</p>
          <span className="inline-block mt-3 text-xs font-medium transition-colors" style={{ color }}>
            Explore evidence →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
        Adaptive Skill and Stake in Forecast Markets
      </h1>
      <p className="text-lg text-slate-500 mt-4 max-w-2xl">
        Stake filtered by online skill from past forecasts.
      </p>

      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <MathBlock
          inline
          latex="m_{i,t} = b_{i,t}\bigl(\lambda + (1-\lambda)\,\sigma_{i,t}\bigr)"
        />
      </div>

      <div className="mt-10">
      <StepSection step={1} title="The claims" description="What this thesis argues.">
        <div className="grid gap-4 pt-2">
          <ClaimCard
            number={1}
            title="The mechanism is coherent"
            body="Deposits, wagers, aggregation, payouts — core accounting holds."
            link="/mechanism"
            color={SEM.wager.main}
          />
          <ClaimCard
            number={2}
            title="Skill weighting changes allocation"
            body="Attenuates noisy stake; equal weighting remains a strong benchmark."
            link="/results"
            color={SEM.skill.main}
          />
        </div>
      </StepSection>

      <StepSection step={2} title="Where to go" description="Follow the flow: Mechanism → Comparisons → Robustness.">
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/mechanism" className="rounded-lg border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
            1. Mechanism
          </Link>
          <Link to="/results" className="rounded-lg border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
            2. Comparisons
          </Link>
          <Link to="/robustness" className="rounded-lg border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
            3. Robustness
          </Link>
        </div>
      </StepSection>
      </div>
    </div>
    </div>
  );
}
